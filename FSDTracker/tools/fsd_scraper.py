#!/usr/bin/env python3
"""
Tesla FSD Tracker — scanner (Canada)  v3
Lives in FSDTracker/tools/ ; writes FSDTracker/data/fsd-listings.json.

v3 — the big fix, from analysing the v2 run in FSDTracker/build_failures.txt:
  The old approach crawled <a> links and landed on AutoTrader CATEGORY pages
  (/cars/tesla/my_2015, /reg_mb, ...) — the 7 "listings" on the site were
  category pages with a random car's price/km scraped off them, not cars.
  AutoTrader's search pages are Next.js apps: the real listings live in the
  page's __NEXT_DATA__ JSON (props.pageProps.listings[]), each with title,
  /offers/<slug> URL, priceRaw, location{city, provinceCode, zip},
  seller{type, companyName}, vehicle{modelYear, model, mileageInKm},
  the full description, and direct image URLs. v3 parses that JSON:
    * description match per listing — no detail-page fetch needed;
    * photo check OCRs the listing's own images (upscaled to 1024x768 —
      the CDN serves /250x188.webp thumbnails, swap the size segment),
      prioritising listings whose text hints at FSD/Autopilot, with a
      per-run OCR budget so the job stays fast;
    * pagination via ?page=N using numberOfPages from the JSON.
  Merge rule change: previous listings are only carried over when their URL
  is a real /offers/ listing — that automatically purges the old
  category-page records.

CarGurus still 403s every detail page from GitHub IPs (v1 + v2 logs); v3
stops a source early after 5 straight blocks instead of burning the run.
Kijiji Autos DNS failed on the runner in both runs; retried once, then
logged as a source failure.

Detection:
  Photo-verified  = OCR of a listing photo contains "Full Self-Driving
                    Capability" AND "Included package" (Computer 3 = HW3,
                    Computer 4 / AI4 = HW4).
  Description     = FSD included / Enhanced Autopilot / Acceleration Boost /
                    SC01 in title+description, subscription/trial rejected.
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
OCR_BUDGET = 80            # max listings to photo-check per run
OCR_IMAGES_PER_LISTING = 12

POSITIVE_FSD = [r"full self[- ]driving", r"\bfsd\b"]
NEGATIVE_PATTERNS = [r"subscription", r"trial", r"fsd capable", r"capability.*not included",
                     r"does not include", r"no fsd", r"without fsd"]
OCR_FSD = "full self-driving capability"
OCR_INCLUDED = "included package"
HINTS = ["self-driving", "self driving", "fsd", "autopilot"]

def clean(s): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", (s or ""))).strip()
def canonical(url):
    p = urlparse(url or "")
    return urlunparse((p.scheme, p.netloc, p.path.rstrip("/"), "", "", ""))

_ocr_warned = set()
def ocr_image(url, key):
    try:
        from PIL import Image
        import pytesseract
        big = re.sub(r"/\d+x\d+\.webp", "/1024x768.webp", url).split("?")[0]
        r = requests.get(big, headers=UA, timeout=20)
        ctype = r.headers.get("Content-Type", "")
        if r.status_code != 200 or not ctype.startswith("image/"):
            if key not in _ocr_warned:
                _ocr_warned.add(key); print(f"  OCR: photo fetch issue (HTTP {r.status_code}, {ctype or 'no type'}) — rest skipped quietly")
            return ""
        img = Image.open(io.BytesIO(r.content)); img.load()
        if img.width < 400 or img.height < 300: return ""
        return pytesseract.image_to_string(img.convert("RGB")).lower()
    except Exception as e:
        if key not in _ocr_warned:
            _ocr_warned.add(key); print(f"  OCR: first photo unreadable ({type(e).__name__}) — rest skipped quietly")
        return ""

def hardware_from_text(t):
    t = (t or "").lower()
    if "computer 4" in t or "ai4" in t or "cpu 4" in t or "cpu-4" in t: return "HW4"
    if "computer 3" in t or "cpu 3" in t: return "HW3"
    return None

FSD_STRONG = [r"lifetime (full self[- ]driving|fsd)",
              r"(full self[- ]driving|\bfsd\b).{0,40}included",
              r"included.{0,40}(full self[- ]driving|\bfsd\b)",
              r"(full self[- ]driving|\bfsd\b) (package|capability included)"]

def packages_from_text(t):
    t = (t or "").lower()
    if any(re.search(n, t) for n in NEGATIVE_PATTERNS) and "included package" not in t:
        fsd = False
    else:
        fsd = any(re.search(p, t) for p in FSD_STRONG) or \
              (any(re.search(p, t) for p in POSITIVE_FSD) and "included package" in t)
    pkgs = []
    if fsd: pkgs.append("FSD Included")
    if "enhanced autopilot" in t: pkgs.append("EAP")
    if "acceleration boost" in t: pkgs.append("Acceleration Boost")
    if "sc01" in t or "free unlimited supercharging" in t: pkgs.append("SC01")
    return pkgs

# ---------------- AutoTrader via __NEXT_DATA__ ----------------
AT_BASE = "https://www.autotrader.ca/cars/tesla/"

def at_page(page):
    url = AT_BASE if page == 1 else f"{AT_BASE}?page={page}"
    r = requests.get(url, headers=UA, timeout=30)
    if r.status_code != 200:
        print(f"  AutoTrader page {page}: HTTP {r.status_code}"); return None
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', r.text, re.S)
    if not m:
        print(f"  AutoTrader page {page}: no __NEXT_DATA__"); return None
    try: return json.loads(m.group(1))["props"]["pageProps"]
    except Exception as e:
        print(f"  AutoTrader page {page}: JSON parse failed ({e})"); return None

def at_record(l, ocr_budget):
    veh = l.get("vehicle") or {}
    loc = l.get("location") or {}
    seller = l.get("seller") or {}
    title = clean(l.get("title")) or f"{veh.get('modelYear','')} Tesla {veh.get('model','')}".strip()
    desc = clean(l.get("description"))
    version = clean(veh.get("modelVersionInput"))
    text = f"{title} {version} {desc}"
    pkgs = packages_from_text(text)
    evidence = "Listing description matched: " + ", ".join(pkgs) if pkgs else ""
    evidence_type = "Description match" if pkgs else ""
    hw = hardware_from_text(text)

    hinted = any(h in text.lower() for h in ["full self", "fsd"])  # bare "autopilot" is on every Tesla — not an FSD hint
    if ocr_budget[0] > 0 and (hinted or pkgs):
        ocr_budget[0] -= 1
        for img_url in (l.get("images") or [])[:OCR_IMAGES_PER_LISTING]:
            txt = ocr_image(img_url, l.get("id", ""))
            if OCR_FSD in txt and OCR_INCLUDED in txt:
                if "FSD Included" not in pkgs: pkgs.insert(0, "FSD Included")
                evidence = "Software screen photo: 'Full Self-Driving Capability — Included package'"
                evidence_type = "Photo-verified"
                hw = hardware_from_text(txt) or hw
                break
    if not pkgs: return None

    km = None
    m = re.search(r"([\d,]+)", veh.get("mileageInKm") or "")
    if m:
        v = int(m.group(1).replace(",", ""))
        if 0 <= v <= 400000: km = v
    price = (l.get("price") or {}).get("priceRaw")
    city = (loc.get("city") or "").title()
    return {
        "id": hashlib.sha1((l.get("id") or canonical(l.get("url"))).encode()).hexdigest()[:12],
        "title": title[:90],
        "year": veh.get("modelYear"),
        "model": veh.get("model") or next((x for x in ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"] if x in title), ""),
        "trim": clean(veh.get("variant") or veh.get("subtitle") or ""),
        "price_cad": price if isinstance(price, (int, float)) else None,
        "mileage_km": km,
        "city": city, "province": loc.get("provinceCode") or "",
        "lat": None, "lon": None,
        "seller_type": "Private" if "priv" in (seller.get("type") or "").lower() else "Dealer",
        "seller_name": seller.get("companyName") or "",
        "source": "AutoTrader.ca", "url": canonical(l.get("url")),
        "packages": pkgs, "hardware": hw,
        "evidence": evidence, "evidence_type": evidence_type,
        "first_seen": datetime.date.today().isoformat(), "demo": False,
    }

def scan_autotrader(found, seen_ids):
    print(f"== AutoTrader.ca (JSON): {AT_BASE}")
    ocr_budget = [OCR_BUDGET]
    first = at_page(1)
    if not first: print("   source failed: page 1"); return
    pages = min(int(first.get("numberOfPages") or 1), 80)
    total = first.get("numberOfResults")
    print(f"   {total} Teslas across {pages} pages; OCR budget {OCR_BUDGET} listings")
    matched = 0
    for page in range(1, pages + 1):
        pp = first if page == 1 else at_page(page)
        if not pp: continue
        for l in pp.get("listings") or []:
            rec = at_record(l, ocr_budget)
            if rec and rec["id"] not in seen_ids:
                seen_ids.add(rec["id"]); found.append(rec); matched += 1
                print(f"   ✓ {rec['title']} — {rec['city']}, {rec['province']} — {rec['packages']} [{rec['evidence_type']}]")
        if page % 10 == 0: print(f"   …page {page}/{pages}, {matched} matched so far")
        time.sleep(0.4)
    print(f"   summary: {matched} matched from AutoTrader")

# ---------------- CarGurus / Kijiji (HTML, best-effort) ----------------
def scan_html_source(name, search_url, pattern, found, seen_urls):
    print(f"== {name}: {search_url}")
    try:
        r = requests.get(search_url, headers=UA, timeout=25)
        print(f"   search page HTTP {r.status_code}")
        if r.status_code != 200: return
    except Exception as e:
        print(f"   source failed: {e}"); return
    soup = BeautifulSoup(r.text, "html.parser")
    host = urlparse(search_url).netloc
    urls = []
    for a in soup.find_all("a", href=True):
        u = a["href"]
        if u.startswith("/"): u = "https://" + host + u
        if urlparse(u).netloc == host and pattern.search(urlparse(u).path) and canonical(u) not in seen_urls:
            seen_urls.add(canonical(u)); urls.append(u)
    print(f"   {len(urls)} candidate listing links")
    blocked = matched = 0
    for u in urls[:50]:
        if blocked >= 5 and matched == 0:
            print(f"   stopping early: {blocked} straight blocks — source is bot-blocking this runner"); break
        try:
            lr = requests.get(u, headers=UA, timeout=25)
            if lr.status_code != 200:
                print(f"  {name}: {lr.status_code} {u[:100]}")
                if lr.status_code in (401, 403, 429): blocked += 1
                continue
        except Exception as e:
            print(f"  {name}: fetch failed ({e})"); continue
        blocked = 0
        text = clean(BeautifulSoup(lr.text, "html.parser").get_text(" "))
        pkgs = packages_from_text(text)
        if not pkgs: continue
        m = re.search(r"\b(201[6-9]|202[0-6])\b", text)
        rec = {"id": hashlib.sha1(canonical(u).encode()).hexdigest()[:12],
               "title": (clean(BeautifulSoup(lr.text, 'html.parser').title.string)[:90] if BeautifulSoup(lr.text, 'html.parser').title else u),
               "year": int(m.group(1)) if m else None,
               "model": next((x for x in ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"] if x.lower() in text.lower()), ""),
               "trim": "", "price_cad": None, "mileage_km": None, "city": "", "province": "",
               "lat": None, "lon": None, "seller_type": "Dealer", "source": name, "url": canonical(u),
               "packages": pkgs, "hardware": hardware_from_text(text),
               "evidence": "Listing description matched: " + ", ".join(pkgs),
               "evidence_type": "Description match",
               "first_seen": datetime.date.today().isoformat(), "demo": False}
        found.append(rec); matched += 1
        print(f"   ✓ {rec['title']} — {pkgs}")
        time.sleep(1.0)
    print(f"   summary: {len(urls)} candidates, {matched} matched, {blocked} blocked at end")

def main():
    if requests is None:
        print("Missing deps: pip install requests beautifulsoup4 pytesseract pillow"); return 1
    found, seen_ids, seen_urls = [], set(), set()
    scan_autotrader(found, seen_ids)
    scan_html_source("CarGurus.ca", "https://www.cargurus.ca/Cars/l-Used-Tesla-d3049",
                     re.compile(r"/details/\d+", re.I), found, seen_urls)
    for attempt in (1, 2):
        before = len(found)
        scan_html_source("Kijiji Autos", "https://www.kijijiautos.ca/cars/tesla/?q=" + quote_plus("Tesla Full Self-Driving"),
                         re.compile(r"/(cars|v)/.+", re.I), found, seen_urls)
        if len(found) > before or attempt == 2: break
        print("   Kijiji: retrying once…"); time.sleep(3)

    prev = {}
    if os.path.exists(OUT):
        try: prev = json.load(open(OUT))
        except Exception: prev = {}
    # Only carry over REAL listing URLs (/offers/ or /details/) — purges the
    # old category-page records from v1/v2 automatically.
    real_prev = [l for l in prev.get("listings", [])
                 if not l.get("demo") and ("/offers/" in (l.get("url") or "") or "/details/" in (l.get("url") or ""))]
    by_id = {l["id"]: l for l in real_prev}
    for l in found: by_id.setdefault(l["id"], l)
    listings = list(by_id.values())
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
               "source_note": "Written by FSDTracker/tools/fsd_scraper.py (v3). AutoTrader listings come from the site's own search JSON; a listing is included only when FSD/EAP/Boost/SC01 is photo-verified from the software screen or matched in the listing description.",
               "listings": listings}, open(OUT, "w"), indent=2)
    print(f"Wrote {len(listings)} listings ({len(found)} matched this run, {len(real_prev)} carried over) to {OUT}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
