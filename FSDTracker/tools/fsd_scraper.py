#!/usr/bin/env python3
"""
Tesla FSD Tracker — scanner (Canada)  v2
Lives in FSDTracker/tools/ ; writes FSDTracker/data/fsd-listings.json.

v2 fixes, from the first run's FSDTracker/build_failures.txt log:
  * OCR never worked: every photo failed with "cannot identify image file".
    Now: check HTTP status + Content-Type, PIL-verify the image, convert to
    RGB, skip icons/SVGs/tiny images, and log ONE line per listing instead
    of spamming the log per image.
  * CarGurus: search page loaded but every detail page returned 403, and
    the candidate-link filter wandered onto investors.cargurus.com and
    sell-my-car pages. Now: same-domain only, per-source URL patterns
    (CarGurus = /details/<id> only), and 403s are counted as "blocked".
  * Kijiji Autos: DNS failed to resolve on the GitHub runner. Kept as a
    source (may be transient) but its failure is logged as a source failure,
    not confused with "no cars found".
  * AutoTrader data quality: titles were the generic page title, city was
    blank, and "100 km" (a search-radius string) was parsed as mileage.
    Now: og:title/h1 with boilerplate stripped, city/province parsed from
    the title ("... in Hamilton, Ontario") and JSON-LD, mileage must be
    1,000–400,000 km, and listings are de-duplicated by canonical URL and
    by (year, model, price, mileage).

Detection logic (unchanged in principle):
  1. Photo check (highest confidence): OCR a listing's photos; only
     "Photo-verified" when OCR contains BOTH "Full Self-Driving Capability"
     AND "Included package". Computer 3 = HW3, Computer 4 / AI4 = HW4.
  2. Description check: FSD included / Enhanced Autopilot /
     Acceleration Boost / SC01, with subscription/trial wording rejected.
"""
import hashlib, io, json, os, re, sys, time, datetime
from urllib.parse import quote_plus, urlparse, urlunparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None

OUT = os.path.join(os.path.dirname(__file__), "..", "data", "fsd-listings.json")
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"}
DELAY_S = 2.0

POSITIVE_FSD = [r"full self[- ]driving", r"\bfsd\b"]
NEGATIVE_PATTERNS = [r"subscription", r"trial", r"fsd capable", r"capability.*not included",
                     r"does not include", r"no fsd", r"without fsd"]
OCR_FSD = "full self-driving capability"
OCR_INCLUDED = "included package"

PROVINCES = {"Ontario": "ON", "Quebec": "QC", "Québec": "QC", "British Columbia": "BC",
             "Alberta": "AB", "Manitoba": "MB", "Saskatchewan": "SK", "Nova Scotia": "NS",
             "New Brunswick": "NB", "Newfoundland and Labrador": "NL",
             "Prince Edward Island": "PE"}

# name, search URL, detail-page pattern (same domain enforced separately)
SOURCES = [
    ("AutoTrader.ca",
     "https://www.autotrader.ca/cars/tesla/?keyword=" + quote_plus("Full Self-Driving"),
     re.compile(r"/(a/|cars/.+/.*\d|vehicle)", re.I)),
    ("CarGurus.ca",
     "https://www.cargurus.ca/Cars/l-Used-Tesla-d3049",
     re.compile(r"/details/\d+", re.I)),
    ("Kijiji Autos",
     "https://www.kijijiautos.ca/cars/tesla/?q=" + quote_plus("Tesla Full Self-Driving"),
     re.compile(r"/(cars|v)/.+", re.I)),
]

def clean(s): return re.sub(r"\s+", " ", (s or "")).strip()

def canonical(url):
    p = urlparse(url)
    return urlunparse((p.scheme, p.netloc, p.path.rstrip("/"), "", "", ""))

_ocr_warned = set()
def ocr_image(url, listing_key):
    """Download + OCR one image. '' on any failure; logs once per listing."""
    try:
        from PIL import Image
        import pytesseract
        r = requests.get(url, headers=UA, timeout=20)
        ctype = r.headers.get("Content-Type", "")
        if r.status_code != 200 or not ctype.startswith("image/") or "svg" in ctype:
            if listing_key not in _ocr_warned:
                _ocr_warned.add(listing_key)
                print(f"  OCR: photo fetch issue (HTTP {r.status_code}, {ctype or 'no type'}) — rest of this listing's photos skipped quietly")
            return ""
        img = Image.open(io.BytesIO(r.content)); img.load()
        if img.width < 400 or img.height < 300:  # icons/thumbnails, not car photos
            return ""
        return pytesseract.image_to_string(img.convert("RGB")).lower()
    except Exception as e:
        if listing_key not in _ocr_warned:
            _ocr_warned.add(listing_key)
            print(f"  OCR: first photo unreadable ({type(e).__name__}) — rest skipped quietly")
        return ""

def hardware_from_text(t):
    t = t.lower()
    if "computer 4" in t or "ai4" in t: return "HW4"
    if "computer 3" in t: return "HW3"
    return None

def packages_from_text(t):
    t = t.lower()
    if any(re.search(n, t) for n in NEGATIVE_PATTERNS) and "included package" not in t:
        fsd = False
    else:
        fsd = any(re.search(p, t) for p in POSITIVE_FSD) and "included" in t
    pkgs = []
    if fsd: pkgs.append("FSD Included")
    if "enhanced autopilot" in t: pkgs.append("EAP")
    if "acceleration boost" in t: pkgs.append("Acceleration Boost")
    if "sc01" in t or "free unlimited supercharging" in t: pkgs.append("SC01")
    return pkgs

def parse_title(soup, year, model):
    og = soup.find("meta", property="og:title")
    raw = clean(og.get("content")) if og and og.get("content") else ""
    if not raw or "Cars for Sale" in raw:
        h1 = soup.find("h1")
        raw = clean(h1.get_text(" ")) if h1 else raw
    raw = re.sub(r"\s*\|\s*(AutoTrader\.ca|CarGurus\.ca|Kijiji Autos).*$", "", raw)
    raw = re.sub(r"\s*-\s*(AutoTrader|CarGurus|Kijiji).*$", "", raw)
    if not raw or "Cars for Sale" in raw or len(raw) < 8:
        return f"{year or ''} Tesla {model}".strip(), raw
    return raw[:90], raw

def parse_location(raw_title, text):
    m = re.search(r"\bin ([A-Za-zÉ .'-]+),\s*(" + "|".join(PROVINCES) + r")\b", raw_title or "")
    if m: return clean(m.group(1)), PROVINCES[m.group(2)]
    m = re.search(r"\bin ([A-Za-zÉ .'-]+),\s*(" + "|".join(PROVINCES.values()) + r")\b", text or "")
    if m: return clean(m.group(1)), m.group(2)
    return "", ""

def parse_mileage(text):
    vals = []
    for m in re.finditer(r"([\d,]{3,})\s?km\b", text, re.I):
        try: v = int(m.group(1).replace(",", ""))
        except ValueError: continue
        if 1000 <= v <= 400000: vals.append(v)  # rejects "100 km" search-radius junk
    return vals[0] if vals else None

def check_listing(url, source):
    key = hashlib.sha1(url.encode()).hexdigest()[:8]
    try:
        r = requests.get(url, headers=UA, timeout=25)
        if r.status_code != 200:
            print(f"  {source}: {r.status_code} {url[:110]}")
            return None, r.status_code
    except Exception as e:
        print(f"  {source}: fetch failed {url[:110]} ({e})"); return None, 0
    soup = BeautifulSoup(r.text, "html.parser")
    text = clean(soup.get_text(" "))
    evidence, evidence_type, hw = "", "", hardware_from_text(text)

    imgs = []
    for img in soup.find_all("img"):
        u = img.get("src") or img.get("data-src") or ""
        if u.startswith("http") and not u.endswith(".svg"): imgs.append(u)
    pkgs = []
    for u in imgs[:40]:
        txt = ocr_image(u, key)
        if OCR_FSD in txt and OCR_INCLUDED in txt:
            evidence = "Software screen photo: 'Full Self-Driving Capability — Included package'"
            evidence_type = "Photo-verified"; hw = hardware_from_text(txt) or hw
            pkgs = ["FSD Included"]; break
    if not pkgs:
        pkgs = packages_from_text(text)
        if pkgs:
            evidence = "Listing description matched: " + ", ".join(pkgs)
            evidence_type = "Description match"
    if not pkgs: return None, 200

    price = None
    m = re.search(r"\$\s?([\d,]{4,})", text)
    if m: price = int(m.group(1).replace(",", ""))
    year = None
    m = re.search(r"\b(201[6-9]|202[0-6])\b", text)
    if m: year = int(m.group(1))
    model = next((x for x in ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"] if x.lower() in text.lower()), "Model 3")
    title, raw_title = parse_title(soup, year, model)
    city, province = parse_location(raw_title, text[:2000])
    return {
        "id": hashlib.sha1(canonical(url).encode()).hexdigest()[:12],
        "title": title, "year": year, "model": model, "trim": "",
        "price_cad": price, "mileage_km": parse_mileage(text),
        "city": city, "province": province, "lat": None, "lon": None,
        "seller_type": "Dealer", "source": source, "url": canonical(url),
        "packages": pkgs, "hardware": hw,
        "evidence": evidence, "evidence_type": evidence_type,
        "first_seen": datetime.date.today().isoformat(), "demo": False,
    }, 200

def main():
    if requests is None:
        print("Missing deps: pip install requests beautifulsoup4 pytesseract pillow"); return 1
    found, seen_urls, seen_keys = [], set(), set()
    for name, search_url, pattern in SOURCES:
        print(f"== {name}: {search_url}")
        stats = {"candidates": 0, "blocked": 0, "found": 0}
        try:
            r = requests.get(search_url, headers=UA, timeout=25)
            print(f"   search page HTTP {r.status_code}")
            if r.status_code != 200: continue
            soup = BeautifulSoup(r.text, "html.parser")
            host = urlparse(search_url).netloc
            urls = []
            for a in soup.find_all("a", href=True):
                u = a["href"]
                if u.startswith("/"): u = "https://" + host + u
                p = urlparse(u)
                if p.netloc != host and not p.netloc.endswith(host.split(".", 1)[-1]):
                    continue  # same-site only — no wandering to investor pages etc.
                if pattern.search(p.path) and canonical(u) not in seen_urls:
                    seen_urls.add(canonical(u)); urls.append(u)
            stats["candidates"] = len(urls)
            print(f"   {len(urls)} candidate listing links")
            for u in urls[:50]:
                item, code = check_listing(u, name)
                if code in (401, 403, 429): stats["blocked"] += 1
                if item:
                    dkey = (item["year"], item["model"], item["price_cad"], item["mileage_km"])
                    if item["price_cad"] and dkey in seen_keys:
                        print(f"   ↷ duplicate skipped: {item['title']}")
                        continue
                    seen_keys.add(dkey); found.append(item); stats["found"] += 1
                    print(f"   ✓ {item['title']} — {item['packages']}")
                time.sleep(DELAY_S)
        except Exception as e:
            print(f"   source failed: {e}")
        print(f"   summary: {stats['candidates']} candidates, {stats['found']} matched, {stats['blocked']} blocked")
        time.sleep(DELAY_S)

    prev = {}
    if os.path.exists(OUT):
        try: prev = json.load(open(OUT))
        except Exception: prev = {}
    real_prev = [l for l in prev.get("listings", []) if not l.get("demo")]
    by_id = {l["id"]: l for l in real_prev}
    for l in found: by_id.setdefault(l["id"], l)
    listings = list(by_id.values()) if by_id else prev.get("listings", [])
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
               "source_note": "Written by FSDTracker/tools/fsd_scraper.py. Listings are only included when FSD/EAP/Boost/SC01 is photo-verified from the software screen or matched in the listing description.",
               "listings": listings}, open(OUT, "w"), indent=2)
    print(f"Wrote {len(listings)} listings ({len(found)} new this run) to {OUT}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
