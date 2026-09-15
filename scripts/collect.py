import urllib.request, urllib.parse, json, time, os, re

CENTER_LAT, CENTER_LNG = 30.3144, 31.3212
RADIUS = 15000
OUT_DIR = "/tmp/osm_data"
TYPES = [
    ("restaurants", "amenity=restaurant"),
    ("fast_food", "amenity=fast_food"),
    ("cafes", "amenity=cafe"),
    ("pharmacies", "amenity=pharmacy"),
    ("supermarkets", "shop=supermarket"),
    ("convenience", "shop=convenience"),
    ("grocery", "shop=grocery"),
    ("butcher", "shop=butcher"),
    ("bakery", "shop=bakery"),
    ("post_office", "amenity=post_office"),
]
os.makedirs(OUT_DIR, exist_ok=True)

def fetch(name, f):
    q = ("[out:json][timeout:180];"
         f"(node[{f}](around:{RADIUS},{CENTER_LAT},{CENTER_LNG});"
         f"way[{f}](around:{RADIUS},{CENTER_LAT},{CENTER_LNG}););"
         "out center tags;")
    data = urllib.parse.urlencode({"data": q}).encode()
    req = urllib.request.Request(
        "https://overpass-api.de/api/interpreter", data=data,
        headers={"User-Agent": "EAH-Discovery/1.0", "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=200) as res:
            body = res.read()
        with open(f"{OUT_DIR}/{name}.json", "wb") as fp:
            fp.write(body)
        print(f"  OK {name}: {len(body)} bytes")
    except Exception as e:
        print(f"  ERR {name}: {e}")

print("Fetching from OpenStreetMap...")
for name, f in TYPES:
    fetch(name, f)
    time.sleep(2)

print("\nMerging...")
all_items = []
for name, _ in TYPES:
    path = f"{OUT_DIR}/{name}.json"
    if not os.path.exists(path): continue
    try:
        with open(path) as fp:
            all_items.extend(json.load(fp).get("elements", []))
    except: pass

def classify(t):
    if t.get("amenity") in ("restaurant","fast_food","cafe"): return "restaurant"
    if t.get("amenity") == "pharmacy": return "pharmacy"
    if t.get("shop") in ("supermarket","convenience","grocery","greengrocer","butcher","bakery"): return "supermarket"
    if t.get("amenity") == "post_office": return "delivery_office"
    return None

def slugify(n):
    s = n.lower().strip()
    s = re.sub(r"[^\w\u0600-\u06FF\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    return re.sub(r"-+", "-", s)[:60]

def phone(t):
    return t.get("phone") or t.get("contact:phone") or t.get("contact:mobile")

def website(t):
    return t.get("website") or t.get("contact:website") or t.get("url")

biz, seen = [], set()
for el in all_items:
    tags = el.get("tags") or {}
    name = tags.get("name")
    if not name: continue
    btype = classify(tags)
    if not btype: continue
    slug = slugify(name)
    if not slug or slug in seen: continue
    seen.add(slug)
    lat = el.get("lat") or (el.get("center") or {}).get("lat")
    lng = el.get("lon") or (el.get("center") or {}).get("lon")
    ph, wb = phone(tags), website(tags)
    contacts = []
    if ph:
        contacts.append({"method_type":"phone","value":ph,"is_primary":True})
        d = re.sub(r"\D","",ph)
        if len(d) >= 10:
            contacts.append({"method_type":"whatsapp","value":("2"+d if d.startswith("0") else d),"is_primary":False})
    if wb:
        contacts.append({"method_type":"website","value":wb,"is_primary":False})
    biz.append({
        "name": name, "slug": slug, "type": btype,
        "area": "شبين القناطر", "city": "شبين القناطر",
        "hook": None, "description": None,
        "address_text": tags.get("addr:street") or tags.get("addr:full"),
        "map_url": f"https://www.google.com/maps/search/?api=1&query={lat},{lng}" if lat and lng else None,
        "has_delivery": False,
        "_needs_review": {"delivery": not tags.get("delivery"), "phone": not ph, "hours": not tags.get("opening_hours")},
        "_osm": {"opening_hours": tags.get("opening_hours"), "cuisine": tags.get("cuisine"), "amenity": tags.get("amenity"), "shop": tags.get("shop"), "lat": lat, "lng": lng},
        "contacts": contacts, "gallery": [], "menu": [],
    })

by_type = {}
for b in biz:
    by_type[b["type"]] = by_type.get(b["type"], 0) + 1

out = {"_source": "OSM", "_center": {"lat": CENTER_LAT, "lng": CENTER_LNG, "name": "شبين القناطر"},
       "_radius_m": RADIUS, "_stats": {"total": len(biz), "by_type": by_type}, "businesses": biz}

with open("/home/bondok/EAH/data/OSM_RAW.json","w",encoding="utf-8") as fp:
    json.dump(out, fp, ensure_ascii=False, indent=2)

print(f"\nTotal: {len(biz)}")
print(f"By type: {by_type}")
print("Saved to data/OSM_RAW.json")
