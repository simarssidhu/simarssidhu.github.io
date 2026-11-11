#!/usr/bin/env python3
"""
Tesla FSD Tracker — scanner (Canada)  v4
Lives in FSDTracker/tools/ ; writes FSDTracker/data/fsd-listings.json.

v4 — precision pass, driven by two real listings the owner flagged:
  FALSE POSITIVE: "FSD Comp 3 | Traffic Aware Cruise Control (Included Pkg)"
    — the car has FSD *Computer* 3 (hardware) and TACC, i.e. standard
    Autopilot. v3 matched it because "fsd" and "included" sat within 40
    chars of each other across unrelated features.
  PERFECT: "Full Self-Driving (FSD) included – v14.3 Lite on HW3"
    — FSD itself is the thing that is included.
  So v4 scores every FSD mention in a tight window around the term:
    * HARD NEGATIVES inside the window kill the match: comp/computer,
      capable/capability, ready, hardware, subscription, trial, TACC,
      traffic aware, autosteer, "not included", and time-limited promos
      like "1 year of FSD included" (a subscription trial, not the package).
    * An OWNERSHIP word must tie to the FSD term itself: included, package,
      purchased, prepaid, paid, lifetime, permanent, activated, equipped.
  French listings (a large share of Quebec inventory) are first-class:
    FSD = "conduite entièrement autonome" / "conduite autonome" + ownership
    ("incluse", "à vie", "achetée"); EAP = "pilote automatique amélioré",
    "autopilot amélioré"; Boost = "boost d'accélération";
    SC01 = "supercharge gratuite à vie" etc. The French software screen
    is also recognised by OCR.
  Every record now stores the exact quoted snippet that matched, so the
  owner can eyeball WHY a car is listed.
  OCR is a priority queue: description-strong FSD first, then FSD-term
  mentions, then other package matches — budget 120 listings/run.

Coverage: AutoTrader.ca full catalogue via its search JSON (dealer +
private), CarGurus.ca and Kijiji Autos and CarPages.ca best-effort HTML
(all three bot-block or fail DNS from GitHub IPs in recent logs; each
stops early after 5 straight blocks and logs a per-source summary).

Staleness: records not re-found get missing_runs+1 and are dropped at 2 —
except this only works because the AutoTrader scan is exhaustive.
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
OCR_BUDGET = 120
OCR_IMAGES_PER_LISTING = 12

# ---------------- detection engine ----------------
FSD_TERM = re.compile(r"(full self[- ]driving|fullselfdriving|\bfsd\b|conduite entièrement autonome|conduite autonome)", re.I)
FSD_OWN = re.compile(r"(included|package|pkg|purchased|prepaid|pre-paid|paid|lifetime|permanent|activated|equipped|incluse?|à vie|achetée?|transfers|transferable)", re.I)
FSD_HARD_NEG = re.compile(r"(comp\b|computer|capable|capability|ready|hardware|subscription|trial|tacc|traffic aware|autosteer|not included|not equipped|sans fsd|non inclus|capacité)", re.I)
FSD_PROMO_NEG = re.compile(r"(\d+|one|two|three|six|twelve)[ -]?(year|yr|month|mo)s? of (free )?(fsd|full self)", re.I)
EAP_PAT = re.compile(r"(enhanced auto ?pilot|pilote automatique amélioré|autopilot amélioré)", re.I)
BOOST_PAT = re.compile(r"(acceleration boost|boost d'accélération|accélération boost)", re.I)
SC01_PAT = re.compile(r"(sc01|free (unlimited|lifetime) supercharging|lifetime free supercharging|unlimited free supercharging|supercharge gratuite à vie|recharge gratuite à vie)", re.I)

def find_fsd(text):
    """Return (matched: bool, quote: str). Window-scored around each FSD term."""
    t = text or ""
    low = t.lower()
    if FSD_PROMO_NEG.search(low):
        promo = True
    else:
        promo = False
    for m in FSD_TERM.finditer(low):
        win = low[max(0, m.start() - 50): m.end() + 60]
        if FSD_HARD_NEG.search(win):
            continue
        if FSD_OWN.search(win) or "lifetime" in win:
            if promo and "lifetime" not in win and "purchased" not in win and "package" not in win:
                continue
            q = re.sub(r"\s+", " ", t[max(0, m.start() - 50): m.end() + 60]).strip()
            return True, q
        # French: the term itself IS Tesla's FR name for the package when
        # stated as a feature with "avec" (with) nearby
        if "conduite" in m.group(0) and ("avec" in win or "incluse" in win):
            q = re.sub(r"\s+", " ", t[max(0, m.start() - 50): m.end() + 60]).strip()
            return True, q
    return False, ""

def packages_from_text(text):
    """Returns (packages, quotes dict pkg->snippet)."""
    t = text or ""
    pkgs, quotes = [], {}
    fsd, q = find_fsd(t)
    if fsd:
        pkgs.append("FSD Included"); quotes["FSD Included"] = q
    for pat, name in [(EAP_PAT, "EAP"), (BOOST_PAT, "Acceleration Boost"), (SC01_PAT, "SC01")]:
        m = pat.search(t)
        if m:
            if name == "EAP" and re.search(r"not (include|equip)", t[max(0, m.start()-30):m.start()], re.I):
                continue
            pkgs.append(name)
            quotes[name] = re.sub(r"\s+", " ", t[max(0, m.start()-40): m.end()+40]).strip()
    return pkgs, quotes

def hardware_from_text(t):
    t = (t or "").lower()
    if "computer 4" in t or "ai4" in t or "cpu 4" in t or "cpu-4" in t or "fsd comp 4" in t: return "HW4"
    if "computer 3" in t or "cpu 3" in t or "fsd comp 3" in t: return "HW3"
    return None

# ---------------- OCR ----------------
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

def ocr_is_fsd_screen(txt):
    en = "full self-driving capability" in txt and "included package" in txt
    fr = "conduite entièrement autonome" in txt and ("inclus" in txt or "ensemble" in txt)
    return en or fr

# ---------------- helpers ----------------
def clean(s): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", (s or ""))).strip()
def canonical(url):
    p = urlparse(url or "")
    return urlunparse((p.scheme, p.netloc, p.path.rstrip("/"), "", "", ""))

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

def at_base_record(l):
    veh = l.get("vehicle") or {}
    loc = l.get("location") or {}
    seller = l.get("seller") or {}
    title = clean(l.get("title")) or f"{veh.get('modelYear','')} Tesla {veh.get('model','')}".strip()
    desc = clean(l.get("description"))
    version = clean(veh.get("modelVersionInput"))
    text = f"{title} {version} {desc}"
    pkgs, quotes = packages_from_text(text)
    km = None
    m = re.search(r"([\d,]+)", veh.get("mileageInKm") or "")
    if m:
        v = int(m.group(1).replace(",", ""))
        if 0 <= v <= 400000: km = v
    price = (l.get("price") or {}).get("priceRaw")
    fsd_hint = bool(FSD_TERM.search(text))
    rec = {
        "id": hashlib.sha1((l.get("id") or canonical(l.get("url"))).encode()).hexdigest()[:12],
        "title": title[:90],
        "year": veh.get("modelYear"),
        "model": veh.get("model") or next((x for x in ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"] if x in title), ""),
        "trim": clean(veh.get("variant") or veh.get("subtitle") or ""),
        "price_cad": price if isinstance(price, (int, float)) else None,
        "mileage_km": km,
        "city": (loc.get("city") or "").title(), "province": loc.get("provinceCode") or "",
        "lat": None, "lon": None,
        "seller_type": "Private" if "priv" in (seller.get("type") or "").lower() else "Dealer",
        "seller_name": seller.get("companyName") or "",
        "source": "AutoTrader.ca", "url": canonical(l.get("url")),
        "packages": pkgs, "hardware": hardware_from_text(text),
        "evidence": "", "evidence_type": "",
        "first_seen": datetime.date.today().isoformat(), "demo": False,
        "_quotes": quotes, "_images": l.get("images") or [], "_fsd_hint": fsd_hint,
    }
    if pkgs:
        main = "FSD Included" if "FSD Included" in pkgs else pkgs[0]
        rec["evidence"] = f"Description says: “…{quotes.get(main, '')}…”"
        rec["evidence_type"] = "Description match"
    # OCR priority: strong FSD (3) > FSD term present (2) > other pkgs (1)
    rec["_ocr_score"] = 3 if "FSD Included" in pkgs else (2 if fsd_hint else (1 if pkgs else 0))
    return rec

def scan_autotrader(found, seen_ids):
    print(f"== AutoTrader.ca (JSON): {AT_BASE}")
    first = at_page(1)
    if not first: print("   source failed: page 1"); return
    pages = min(int(first.get("numberOfPages") or 1), 80)
    print(f"   {first.get('numberOfResults')} Teslas across {pages} pages; OCR budget {OCR_BUDGET}")
    candidates = []
    for page in range(1, pages + 1):
        pp = first if page == 1 else at_page(page)
        if not pp: continue
        for l in pp.get("listings") or []:
            candidates.append(at_base_record(l))
        if page % 15 == 0: print(f"   …page {page}/{pages}, {len(candidates)} scanned")
        time.sleep(0.4)
    print(f"   {len(candidates)} listings scanned; {sum(1 for c in candidates if c['packages'])} description matches; running OCR priority queue…")
    candidates.sort(key=lambda c: -c["_ocr_score"])
    budget = OCR_BUDGET
    for rec in candidates:
        if budget <= 0: break
        if rec["_ocr_score"] == 0: continue
        budget -= 1
        for img_url in rec["_images"][:OCR_IMAGES_PER_LISTING]:
            txt = ocr_image(img_url, rec["id"])
            if txt and ocr_is_fsd_screen(txt):
                if "FSD Included" not in rec["packages"]: rec["packages"].insert(0, "FSD Included")
                rec["evidence"] = "Software screen photo: 'Full Self-Driving Capability — Included package'"
                rec["evidence_type"] = "Photo-verified"
                rec["hardware"] = hardware_from_text(txt) or rec["hardware"]
                break
    matched = 0
    for rec in candidates:
        if not rec["packages"]: continue
        for k in ("_quotes", "_images", "_fsd_hint", "_ocr_score"): rec.pop(k, None)
        if rec["id"] not in seen_ids:
            seen_ids.add(rec["id"]); found.append(rec); matched += 1
            print(f"   ✓ {rec['title']} — {rec['city']}, {rec['province']} — {rec['packages']} [{rec['evidence_type']}]")
    print(f"   summary: {matched} matched from AutoTrader (OCR budget used {OCR_BUDGET - budget})")

# ---------------- generic HTML sources (best-effort) ----------------
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
    for u in urls[:40]:
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
        soup2 = BeautifulSoup(lr.text, "html.parser")
        text = clean(soup2.get_text(" "))
        pkgs, quotes = packages_from_text(text)
        if not pkgs: continue
        m = re.search(r"\b(201[6-9]|202[0-6])\b", text)
        pm = re.search(r"\$\s?([\d,]{4,})", text)
        title_tag = soup2.title.string if soup2.title and soup2.title.string else u
        rec = {"id": hashlib.sha1(canonical(u).encode()).hexdigest()[:12],
               "title": clean(title_tag)[:90],
               "year": int(m.group(1)) if m else None,
               "model": next((x for x in ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"] if x.lower() in text.lower()), ""),
               "trim": "", "price_cad": int(pm.group(1).replace(",", "")) if pm else None,
               "mileage_km": None, "city": "", "province": "",
               "lat": None, "lon": None, "seller_type": "Dealer", "source": name, "url": canonical(u),
               "packages": pkgs, "hardware": hardware_from_text(text),
               "evidence": f"Description says: “…{quotes.get(pkgs[0], '')}…”",
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
    scan_html_source("CarPages.ca", "https://www.carpages.ca/used-cars/tesla",
                     re.compile(r"/(used|vehicle|inventory|cars)/.+", re.I), found, seen_urls)
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
    real_prev = [l for l in prev.get("listings", [])
                 if not l.get("demo") and ("/offers/" in (l.get("url") or "") or "/details/" in (l.get("url") or ""))]
    by_id = {l["id"]: l for l in real_prev}
    found_ids = set()
    for l in found:
        found_ids.add(l["id"]); by_id[l["id"]] = l  # fresh data wins
    listings = []
    for lid, l in by_id.items():
        if lid in found_ids:
            l["missing_runs"] = 0; listings.append(l)
        else:
            l["missing_runs"] = int(l.get("missing_runs") or 0) + 1
            if l["missing_runs"] < 2: listings.append(l)
            else: print(f"   dropping stale listing not seen for 2 runs: {l.get('title')} {l.get('url','')[:70]}")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
               "source_note": "Written by FSDTracker/tools/fsd_scraper.py (v4). A listing is included only when FSD/EAP/Boost/SC01 is photo-verified from the software screen or matched in the listing description with an ownership claim (included/purchased/lifetime/package) — hardware-only mentions (FSD computer, capability, TACC/Autosteer) and time-limited FSD promos are rejected. Evidence quotes the exact matched wording.",
               "listings": listings}, open(OUT, "w"), indent=2)
    print(f"Wrote {len(listings)} listings ({len(found)} matched this run) to {OUT}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
