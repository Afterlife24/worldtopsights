#!/usr/bin/env python3
"""
Build the Paris tours from the Google Drive tour folders (one folder per tour: a .docx and photos).

    python3 scripts/import-drive-tours.py ../paris-tours-drive/tours

Writes:
  - src/content/tours.json        Paris tours replaced; tours of other destinations kept
  - src/content/categories.json   categories taken from the documents
  - public/tours/<slug>/NN.jpg    photos resized for the web, 01 = main photo

Main photo: a file named "main", then "cover", then one starting with "m", else the first photo.
Re-running REPLACES the Paris tours in tours.json, so edits made there by hand are lost.
"""
import difflib
import html
import json
import re
import shutil
import subprocess
import sys
import unicodedata
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOURS_JSON = ROOT / 'src' / 'content' / 'tours.json'
CATS_JSON = ROOT / 'src' / 'content' / 'categories.json'
PHOTOS = ROOT / 'public' / 'tours'
MAX_SIDE, QUALITY = 1200, 70
IMG = re.compile(r'\.(jpe?g|png|webp|heic)$', re.I)
LABELS = ['Duration', 'City', 'Categories', 'Top tour', 'Adult price (€)', 'Child price (€)', 'Youth price (€)', 'Rating', 'Number of reviews']
SECTIONS = ['Short description', 'Highlights', 'Long description']

CATEGORY_TEXT = {
    'Paris Tours': ('Walking tours, food, Opéra Garnier, perfume and the Seine. Every way to discover the City of Light with a local guide.', ['Toujours', 'Paris']),
    'Top Selling Tours': ('Our most booked Paris experiences, loved by travellers for their sights, stories and fun local guides.', ['Our', 'favourites']),
    'Opera Garnier': ('Step inside the Palais Garnier, one of the most beautiful opera houses in the world, on its own or with food, perfume and sightseeing.', ['Bravo', 'Garnier']),
    'Perfume Paris': ('Discover the art of French perfume and create your own fragrance to take home.', ['L’art du', 'parfum']),
    'French Riviera Tours': ('Nice, Cannes, Antibes, Monaco, Èze and Grasse: walking tours, food and wine, perfume, yoga, islands and day trips on the Côte d’Azur.', ['Bienvenue', 'dans le Sud']),
    'Galeries Lafayette': ('Fashion shows, perfume, chocolate, macarons and Christmas lights at Paris’s most famous department store.', ['Très', 'chic']),
}

# Only these categories are used. Others written in a document are reported and left out.
KNOWN_CATEGORIES = ['Paris Tours', 'Top Selling Tours', 'Opera Garnier', 'Perfume Paris', 'Galeries Lafayette', 'French Riviera Tours']

# Per destination: categories every tour of that destination gets.
DESTINATIONS = {
    'paris': ['Paris Tours'],
    'galeries-lafayette': ['Galeries Lafayette'],
    'south-of-france': ['French Riviera Tours'],
}


def slugify(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s.replace("'", '')).strip('-')


def paragraphs(docx):
    """(style, text) for each non-empty paragraph. style is 'h' for Word headings, '*' for list items."""
    xml = zipfile.ZipFile(docx).read('word/document.xml').decode('utf-8')
    out = []
    for p in re.findall(r'<w:p[ >].*?</w:p>', xml, re.S):
        text = html.unescape(''.join(re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', p, re.S))).replace('\xa0', ' ').strip()
        if not text:
            continue
        st = re.search(r'<w:pStyle w:val="([^"]+)"', p)
        style = 'h' if st and re.search(r'heading|title', st.group(1), re.I) else '*' if '<w:numPr>' in p else ''
        out.append((style, text))
    return out


def number(s):
    s = re.sub(r'(\d),(\d{3})(?!\d)', r'\1\2', s or '')  # "1,210.82" -> "1210.82"
    m = re.search(r'\d+(?:[.,]\d+)?', s)
    if not m:
        return None
    n = round(float(m.group(0).replace(',', '.')), 2)
    return int(n) if n.is_integer() else n


def price_from_line(line, who):
    m = re.search(rf'{who}[^;€£\d]*[€£]\s*(\d+(?:[.,]\d+)?)', line or '', re.I)
    return number(m.group(1)) if m else None


def child_value(n):
    if n is None:
        return None
    return 'Free' if n == 0 else n


def hours(s):
    n = number(s)
    if n is None:
        return None
    return round(n / 60, 2) if re.search(r'min', s, re.I) else n


def read_tour(folder):
    docs = [f for f in folder.iterdir() if f.suffix.lower() == '.docx' and not f.name.startswith('~$')]
    # a folder may hold another tour's document too: use the one whose name is closest to the folder name
    key = lambda f: difflib.SequenceMatcher(None, slugify(f.stem), slugify(folder.name)).ratio()
    P = paragraphs(max(docs, key=key))
    texts = [t for _, t in P]
    # title = the line just above "Rezdy booking link" (documents may have extra lines above it)
    li = next((i for i, t in enumerate(texts) if re.match(r'^Rezdy booking link', t, re.I)), None)
    head = [t for t in texts[:3] if t.upper() != 'PARIS TOP SIGHTS TOURS']
    first_heading = next((t for s, t in P if s == 'h'), None)
    if li is not None and texts[li] == 'Rezdy booking link':  # heading form (South of France): title is the first heading
        title = first_heading or folder.name
    else:
        title = texts[li - 1] if li else (head[0] if head else folder.name)
    d = {'title': title}
    for i, t in enumerate(texts):
        m = re.match(r'^(Rezdy booking link|Product ID|Adult price \(€\)|Child price \(€\))\s*:\s*(.+)$', t, re.I)
        if m:
            d.setdefault(m.group(1).lower(), m.group(2).strip())
        if t in LABELS and i + 1 < len(texts) and texts[i + 1] not in LABELS:
            d.setdefault(t.lower(), texts[i + 1])
        # one-line form: "Duration: 3 hours", "Top tour (Yes / No): No"
        m = re.match(r'^(Duration|City|Categories|Top tour|Rating|Number of reviews|Youth price \(€\))(?:\s*\([^)]*\))?\s*:\s*(.+)$', t, re.I)
        if m:
            d.setdefault(m.group(1).lower(), m.group(2).strip())
        # heading form (South of France): "Rezdy booking link" / "Start times" on one line, the value on the next
        if t in ('Rezdy booking link', 'Start times') and i + 1 < len(texts):
            d.setdefault(t.lower() if t != 'Start times' else 'start', texts[i + 1].strip())
        elif re.match(r'^Start times', t, re.I) and ':' in t:
            d['start'] = re.sub(r'^Start times[^:]*:\s*', '', t, flags=re.I)
        if re.match(r'^(Displayed|Equivalent) participant prices', t, re.I):
            d['prices line'] = t
    if 'rezdy booking link' in d:  # first word only: "https://… (note)" -> "https://…"
        d['rezdy booking link'] = d['rezdy booking link'].split()[0] if d['rezdy booking link'].startswith('http') else d['rezdy booking link']
    # price table (South of France): rows of  category | Original GBP | Equivalent EUR
    if 'Equivalent EUR' in texts:
        i, rows = texts.index('Equivalent EUR') + 1, []
        while i + 2 < len(texts) and not re.match(r'^(Converted|Rate source)', texts[i]) and texts[i] not in SECTIONS:
            rows.append((texts[i], texts[i + 2]))
            i += 3
        d['price rows'] = rows
    # sections; stop at headings that are not part of them
    STOP = {'Prices in euros', 'Details to verify', 'Start times', 'Rezdy booking link'}
    sec, cur = {s: [] for s in SECTIONS}, None
    for style, t in P:
        if t in SECTIONS:
            cur = t
            continue
        if style == 'h' and t in STOP:
            cur = None
            continue
        if cur and not re.match(r'^Reviewed \d', t):
            sec[cur].append((style, t))
    return d, sec


def to_html(items):
    """Long description: Word headings / ALL-CAPS / lines ending with ':' -> <h4>; list items and runs of short lines -> <ul>; else <p>."""
    out, run = [], []

    def flush():
        if run:
            out.append('<ul>' + ''.join(f'<li>{html.escape(x)}</li>' for x in run) + '</ul>')
            run.clear()

    for i, (style, t) in enumerate(items):
        short = len(t.split()) <= 7 and not re.search(r'[.!?…]$', t)
        nxt_short = i + 1 < len(items) and len(items[i + 1][1].split()) <= 7 and not re.search(r'[.!?…]$', items[i + 1][1])
        prev_short = bool(run)
        if style == '*' or (short and style != 'h' and not t.endswith(':') and (prev_short or nxt_short) and not t.isupper()):
            run.append(t.lstrip('*• ').strip())
            continue
        flush()
        if style == 'h' or t.endswith(':') or (t.isupper() and len(t) > 3) or (short and len(t.split()) <= 10):
            out.append(f'<h4>{html.escape(t)}</h4>')
        else:
            out.append(f'<p>{html.escape(t)}</p>')
    flush()
    return ''.join(out)


def order_photos(names):
    names = sorted(names, key=str.lower)
    stem = lambda n: Path(n).stem.lower()
    for pred in (lambda s: s == 'main', lambda s: s == 'cover', lambda s: s.startswith('main'),
                 lambda s: s.startswith('cover'), lambda s: s.startswith('m')):
        hit = next((n for n in names if pred(stem(n))), None)
        if hit:
            return [hit] + [n for n in names if n != hit]
    return names


def convert(job):
    src, dest = job
    if dest.exists():
        return None
    r = subprocess.run(['sips', '-Z', str(MAX_SIDE), '-s', 'format', 'jpeg', '-s', 'formatOptions', str(QUALITY), str(src), '--out', str(dest)],
                       capture_output=True, text=True)
    return None if r.returncode == 0 and dest.exists() else f'{src}: {r.stderr.strip()[:150]}'


def euro_text(n):
    return f'€{n:,.2f}'.replace('.00', '') if isinstance(n, float) else f'€{n:,}'


def table_prices(rows):
    """South of France price table -> (price, priceNote, child, youth). Rules:
    Adult row -> adult price. Group of N -> lowest per-person price with a note. Participants -> per participant.
    Group amounts not marked 'per person' are group totals -> smallest group's total. Other rows (Brunch, Dinner) -> lowest, listed."""
    eur = [(k.strip(), number(v), 'per person' in v) for k, v in rows if re.search(r'€\s*\d', v)]
    get = lambda name: next((v for k, v, _ in eur if k.lower().rstrip('s') == name), None)
    adult = get('adult')
    if adult is not None:
        return adult, None, get('child'), get('youth')
    groups = [(int(re.search(r'\d+', k).group()), v, pp) for k, v, pp in eur if k.startswith('Group of')]
    if groups:
        if all(pp for _, _, pp in groups):
            n, low, _ = min(groups, key=lambda g: (g[1], -g[0]))
            first_n, first, _ = min(groups)
            note = f'per person in a group of {n}' + (f' · {euro_text(first)} per person for {first_n}' if first_n != n else '')
            return low, note, None, None
        n, total, _ = min(groups)
        return total, f'for a group of {n}', None, None
    part = get('participant')
    if part is not None:
        return part, 'per participant', None, None
    other = [(k, v) for k, v, _ in eur if k.lower() not in ('infant', 'senior') and v]
    if other:
        low = min(v for _, v in other)
        return low, ' · '.join(f'{k} {euro_text(v)}' for k, v in other), None, None
    return None, None, None, None


def build_tour(folder, d, sec, slug, destination, jobs):
    line = d.get('prices line', '')
    adult = number(d.get('adult price (€)')) or price_from_line(line, 'Adult')
    child_raw = d.get('child price (€)', '')
    child = number(child_raw) if re.search(r'\d', child_raw.split('//')[0]) else price_from_line(line, 'Child')
    youth = number(d.get('youth price (€)')) or price_from_line(line, 'Youth') or price_from_line(child_raw, 'Youth')
    note = None
    if adult is None and d.get('price rows'):
        adult, note, child, youth = table_prices(d['price rows'])
    photos = order_photos([f.name for f in folder.iterdir() if f.is_file() and IMG.search(f.name)])
    out_dir = PHOTOS / slug
    shutil.rmtree(out_dir, ignore_errors=True)
    out_dir.mkdir(parents=True, exist_ok=True)
    images = []
    for i, name in enumerate(photos, 1):
        jobs.append((folder / name, out_dir / f'{i:02d}.jpg'))
        images.append(f'/tours/{slug}/{i:02d}.jpg')
    num = lambda k: number(d.get(k)) if re.search(r'\d', d.get(k, '')) else None
    return {
        'slug': slug,
        'title': d['title'],
        'destination': destination,
        'alsoIn': [],
        'demo': False,
        'categories': [c for c in re.split(r'\s*,\s*', d.get('categories', '')) if c],
        'topTour': d.get('top tour', '').strip().lower().startswith('y'),
        'price': adult,
        'priceNote': note,
        'childPrice': child_value(child),
        'youthPrice': youth,
        'duration': hours(d.get('duration', '')),
        'startTimes': d.get('start') or None,
        'rating': num('rating'),
        'reviews': num('number of reviews'),
        'bookingUrl': d['rezdy booking link'].split('?')[0],  # drop "?_gl=..." tracking codes
        'summary': ' '.join(t for _, t in sec['Short description']),
        'highlights': [t.lstrip('*•- ').strip() for _, t in sec['Highlights']],
        'description': to_html(sec['Long description']),
        'images': images,
        'relatedTours': [],
        '_city': (d.get('city') or '').split(',')[0].strip().lower(),
    }


def main():
    args = sys.argv[1:]
    if len(args) == 1:
        args = ['paris'] + args  # older usage: Paris only
    if len(args) != 2 or args[0] not in DESTINATIONS:
        sys.exit(__doc__ + '\nUsage: python3 scripts/import-drive-tours.py <paris|galeries-lafayette|south-of-france> <folder>')
    destination, src = args[0], Path(args[1])
    extra = DESTINATIONS[destination]
    old = json.loads(TOURS_JSON.read_text(encoding='utf-8'))
    old_cats = {c['slug']: c for c in json.loads(CATS_JSON.read_text(encoding='utf-8'))}
    pid_of = lambda t: (t.get('bookingUrl') or '').split('/')[3] if 'rezdy.com/' in (t.get('bookingUrl') or '') else None
    extra_slugs = {slugify(c) for c in extra}

    # Tours of other destinations stay. Remove this destination's old tours (incl. demo tours) and its "also in" links.
    keep = [t for t in old if t['destination'] != destination]
    previous = {pid_of(t): t for t in old if t['destination'] == destination and pid_of(t)}
    for t in keep:
        if destination in t.get('alsoIn', []):
            t['alsoIn'].remove(destination)
            t['categories'] = [c for c in t['categories'] if c not in extra_slugs]
    for t in old:
        if t['destination'] == destination:
            shutil.rmtree(PHOTOS / t['slug'], ignore_errors=True)
    by_pid = {pid_of(t): t for t in keep if pid_of(t)}
    used = {t['slug'] for t in keep}

    new, shared, skipped, jobs, seen = [], [], [], [], {}
    for folder in sorted((p for p in src.iterdir() if p.is_dir()), key=lambda p: p.name.lower()):
        if not any(f.suffix.lower() == '.docx' for f in folder.iterdir()):
            skipped.append(f'{folder.name}: no document')
            continue
        d, sec = read_tour(folder)
        link = d.get('rezdy booking link', '')
        if not re.match(r'^https://tstgroup\.rezdy\.com/\d+/', link):
            skipped.append(f'{folder.name}: no Rezdy link')
            continue
        if re.search(r'\binactive\b', d['title'], re.I):
            skipped.append(f'{folder.name}: marked Inactive')
            continue
        pid = link.split('/')[3]
        if pid in seen:
            skipped.append(f'{folder.name}: same Rezdy product as "{seen[pid]}"')
            continue
        seen[pid] = folder.name
        if pid in by_pid:  # tour already on the site under another destination: list it here too
            t = by_pid[pid]
            t.setdefault('alsoIn', [])
            if destination not in t['alsoIn']:
                t['alsoIn'].append(destination)
            t['categories'] += [c for c in extra_slugs if c not in t['categories']]
            shared.append(t['title'])
            continue
        slug = base = slugify(d['title'])
        n = 2
        while slug in used:
            slug, n = f'{base}-{n}', n + 1
        used.add(slug)
        t = build_tour(folder, d, sec, slug, destination, jobs)
        if t['price'] is None:
            skipped.append(f'{folder.name}: no adult price')
            used.discard(slug)
            continue
        t['categories'] += [c for c in extra if c not in t['categories']]
        unknown = [c for c in t['categories'] if c not in KNOWN_CATEGORIES]
        if unknown:
            skipped.append(f'{folder.name}: categories left out (not in the list): {unknown}')
            t['categories'] = [c for c in t['categories'] if c in KNOWN_CATEGORIES]
        prev = previous.get(pid)
        if prev:  # keep "also in" links made by other imports
            t['alsoIn'] = prev.get('alsoIn', [])
        new.append(t)

    with ThreadPoolExecutor(6) as pool:
        errors = [e for e in pool.map(convert, jobs) if e]

    # categories of the new tours -> slugs; create category records that don't exist yet
    for t in new:
        for c in t['categories']:
            s = slugify(c)
            if s not in old_cats:
                pick = sorted((x for x in new if c in x['categories']), key=lambda x: (not x['topTour'], not x['images']))[0]
                lede, script = CATEGORY_TEXT.get(c, (f'{c} with Paris Top Sights Tours.', ['Toujours', 'Paris']))
                old_cats[s] = {'slug': s, 'label': c, 'title': c, 'lede': lede, 'script': script,
                               'hero': pick['images'][0], 'heroAlt': pick['title'], 'tile': pick['images'][0]}
        t['categories'] = list(dict.fromkeys(slugify(c) for c in t['categories']))

    tours = keep + new
    # categories in use, most tours first
    count = lambda s: sum(s in t['categories'] for t in tours)
    cats = sorted((c for c in old_cats.values() if count(c['slug'])), key=lambda c: -count(c['slug']))
    for t in tours:
        t['categories'] = [c for c in t['categories'] if c in {x['slug'] for x in cats}]

    # related tours of the new tours: same destination, most shared categories, top tours first
    common = {'paris-tours', *extra_slugs}
    for t in new:
        mine = set(t['categories']) - common
        pool_ = [o for o in tours if o is not t and (o['destination'] == destination or destination in o.get('alsoIn', []))]
        city = lambda o: int(bool(t.get('_city')) and o.get('_city') == t.get('_city'))
        t['relatedTours'] = [o['slug'] for o in sorted(pool_, key=lambda o: (len(mine & set(o['categories'])), city(o), o['topTour']), reverse=True)[:4]]
    for t in tours:
        t.pop('_city', None)

    TOURS_JSON.write_text(json.dumps(tours, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    CATS_JSON.write_text(json.dumps(cats, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{destination}: {len(new)} new tours, {len(shared)} existing tours also listed here, {len(keep)} other tours kept')
    print(f'{len(jobs)} photos, {len(errors)} failed')
    for e in errors:
        print('  !', e)
    print('shared:', shared)
    print('skipped:', skipped)
    print('categories:', [(c['label'], count(c['slug'])) for c in cats])


if __name__ == '__main__':
    main()
