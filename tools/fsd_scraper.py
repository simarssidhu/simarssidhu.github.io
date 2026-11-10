#!/usr/bin/env python3
"""
Tesla FSD Tracker — scanner (Canada)

What it does
------------
For each source site, it fetches Tesla search/listing pages, then for every
candidate listing it checks, in order of confidence:

  1. PHOTO CHECK (highest confidence) — downloads the listing's photos and
     OCRs any that look like the Tesla Software screen. A car is only
     "Photo-verified" when OCR text contains BOTH:
         "Full Self-Driving Capability"  AND  "Included package"
     on that screen. The same OCR pass reads the computer line:
         "Full Self-Driving Computer 3" / "AI Computer ... Computer 3" -> HW3
         "Full Self-Driving Computer 4" / "AI4" / "Computer 4"          -> HW4
     (This is exactly the screen in a typical listing photo: Controls >
      Software, e.g. "MODEL X / 80,896 km / AI Computer: Full Self-Driving
      Computer 3 / Full Self-Driving Capability — Included package".)

  2. DESCRIPTION CHECK — listing text is searched for:
         "full self-driving" / "fsd" + "included"           -> FSD Included
         "enhanced autopilot"                               -> EAP
         "acceleration boost"                               -> Acceleration Boost
         "sc01" / "free unlimited supercharging"            -> SC01
     Text that says FSD is a *subscription*, a *trial*, or "capable"
     (hardware only) is explicitly rejected — see NEGATIVE_PATTERNS.

Output: data/fsd-listings.json in the schema the website (js/fsd-tracker.js)
renders. Demo entries from the previous file are dropped once at least one
real listing is found, and preserved otherwise so the page never goes blank.

Reality check / limits
----------------------
AutoTrader.ca, CarGurus.ca, Kijiji and Facebook Marketplace all use bot
protection and their terms restrict automated scraping; from GitHub Actions
 IPs they frequently return 403 / CAPTCHA pages. This script therefore:
  * uses a normal browser user-agent, slow rate limits, and robots-friendly
    public search URLs only;
  * logs every source that blocks it and keeps going with the others;
  * never fabricates listings — a source that can't be read contributes 0.
Facebook Marketplace in particular has no public unauthenticated listing
feed, so it is covered on the website by the deep-link "Live search" button
rather than by this scanner. Expect the photo-OCR path to be the most
valuable and the most fragile; run it, read the Actions log, and iterate
on the per-source parsers in SOURCES as sites change their markup.

Usage:  pip install requests beautifulsoup4 pytesseract pillow
        sudo apt-get install tesseract-ocr   # for the photo check
        python3 tools/fsd_scraper.py
"""
import hashlib, json, os, re, sys, time, datetime
from urllib.parse import quote_plus

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None  # handled in main()

OUT = os.path.join(os.path.dirname(__file__), "..", "data", "fsd-listings.json")
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"}
DELAY_S = 2.0

POSITIVE_FSD = [r"full self[- ]driving", r"\bfsd\b"]
NEGATIVE_PATTERNS = [r"subscription", r"trial", r"fsd capable", r"capability.*not included",
                     r"does not include", r"no fsd", r"without fsd"]
OCR_FSD = "full self-driving capability"
OCR_INCLUDED = "included package"

SOURCES = [
    # name, search URL (public, Canada, Tesla). Parsers are intentionally
    # generic: any <a href> that looks like a vehicle detail page is a
    # candidate; per-site selectors can be tightened as markup changes.
    ("AutoTrader.ca", "https://www.autotrader.ca/cars/tesla/?keyword=" + quote_plus("Full Self-Driving")),
    ("CarGurus.ca",   "https://www.cargurus.ca/Cars/l-Used-Tesla-d3049"),
    ("Kijiji Autos",  "https://www.kijijiautos.ca/cars/tesla/?q=" + quote_plus("Tesla Full Self-Driving")),
]

def clean(s): return re.sub(r"\s+", " ", (s or "")).strip()

def ocr_image(url):
    """Download an image and OCR it. Returns '' if OCR tooling is absent."""
    try:
        import io
        from PIL import Image
        import pytesseract
        r = requests.get(url, headers=UA, timeout=20)
        if r.status_code != 200: return ""
        return pytesseract.image_to_string(Image.open(io.BytesIO(r.content))).lower()
    except Exception as e:
        print(f"  OCR skipped ({e})"); return ""

def hardware_from_text(t):
    t = t.lower()
    if "computer 4" in t or "ai4" in t or "full self-driving computer 4" in t: return "HW4"
    if "computer 3" in t or "full self-driving computer 3" in t: return "HW3"
    return None

def packages_from_text(t):
    t = t.lower()
    if any(re.search(n, t) for n in NEGATIVE_PATTERNS) and "included package" not in t:
        fsd = False
    else:
        fsd = any(re.search(p, t) for p in POSITIVE_FSD) and ("included" in t or "included package" in t)
    pkgs = []
    if fsd: pkgs.append("FSD Included")
    if "enhanced autopilot" in t: pkgs.append("EAP")
    if "acceleration boost" in t: pkgs.append("Acceleration Boost")
    if "sc01" in t or "free unlimited supercharging" in t: pkgs.append("SC01")
    return pkgs

def check_listing(url, source):
    """Return a listing dict or None. Photo check first, then description."""
    try:
        r = requests.get(url, headers=UA, timeout=25)
        if r.status_code != 200:
            print(f"  {source}: {r.status_code} {url}"); return None
    except Exception as e:
        print(f"  {source}: fetch failed {url} ({e})"); return None
    soup = BeautifulSoup(r.text, "html.parser")
    text = clean(soup.get_text(" "))
    evidence, evidence_type, hw = "", "", hardware_from_text(text)

    # 1) Photo check — images whose alt/src hint at the software screen first
    imgs = []
    for img in soup.find_all("img"):
        u = img.get("src") or img.get("data-src") or ""
        if u.startswith("http"): imgs.append(u)
    for u in imgs[:40]:
        txt = ocr_image(u)
        if OCR_FSD in txt and OCR_INCLUDED in txt:
            evidence = "Software screen photo: 'Full Self-Driving Capability — Included package'"
            evidence_type = "Photo-verified"; hw = hardware_from_text(txt) or hw
            pkgs = ["FSD Included"]
            break
    else:
        pkgs = packages_from_text(text)
        if pkgs:
            evidence = "Listing description matched: " + ", ".join(pkgs)
            evidence_type = "Description match"
    if not pkgs: return None

    price = None
    m = re.search(r"\$\s?([\d,]{4,})", text)
    if m: price = int(m.group(1).replace(",", ""))
    km = None
    m = re.search(r"([\d,]{3,})\s?km\b", text, re.I)
    if m: km = int(m.group(1).replace(",", ""))
    year = None
    m = re.search(r"\b(201[6-9]|202[0-6])\b", text)
    if m: year = int(m.group(1))
    model = next((x for x in ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"] if x.lower() in text.lower()), "Model 3")
    title = clean(soup.title.string)[:90] if soup.title and soup.title.string else f"{year or ''} Tesla {model}"
    return {
        "id": hashlib.sha1(url.encode()).hexdigest()[:12],
        "title": title, "year": year, "model": model, "trim": "",
        "price_cad": price, "mileage_km": km,
        "city": "", "province": "", "lat": None, "lon": None,
        "seller_type": "Dealer", "source": source, "url": url,
        "packages": pkgs, "hardware": hw,
        "evidence": evidence, "evidence_type": evidence_type,
        "first_seen": datetime.date.today().isoformat(), "demo": False,
    }

def main():
    if requests is None:
        print("Missing deps: pip install requests beautifulsoup4 pytesseract pillow"); return 1
    found = []
    for name, search_url in SOURCES:
        print(f"== {name}: {search_url}")
        try:
            r = requests.get(search_url, headers=UA, timeout=25)
            print(f"   search page HTTP {r.status_code}")
            if r.status_code != 200: continue
            soup = BeautifulSoup(r.text, "html.parser")
            urls = sorted({a["href"] for a in soup.find_all("a", href=True)
                           if re.search(r"(vehicle|car|listing|/a/|/vdp|details)", a["href"], re.I)})
            print(f"   {len(urls)} candidate listing links")
            for u in urls[:50]:
                if u.startswith("/"): u = "https://" + search_url.split("/")[2] + u
                item = check_listing(u, name)
                if item: found.append(item); print(f"   ✓ {item['title']} — {item['packages']}")
                time.sleep(DELAY_S)
        except Exception as e:
            print(f"   source failed: {e}")
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
    json.dump({"generated_at": datetime.datetime.utcnow().isoformat() + "Z",
               "source_note": "Written by tools/fsd_scraper.py. Listings are only included when FSD/EAP/Boost/SC01 is photo-verified from the software screen or matched in the listing description.",
               "listings": listings}, open(OUT, "w"), indent=2)
    print(f"Wrote {len(listings)} listings ({len(found)} new this run) to {OUT}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
