#!/usr/bin/env python3
"""
One-time import of the WordPress tours into the website.

    python3 scripts/import-wordpress-tours.py ../tours.json

Reads the tours.json exported from WordPress and writes:
  - src/content/tours.json      all tours, in the format the website reads
  - public/tours/photos/*.jpg   the tour photos, downloaded and resized for the web

Re-running this script REPLACES src/content/tours.json, so any edits made to that
file by hand are lost. After the first import, edit src/content/tours.json directly.
Photos that were already downloaded are kept and not downloaded again.
"""
import html
import json
import re
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_JSON = ROOT / 'src' / 'content' / 'tours.json'
PHOTO_DIR = ROOT / 'public' / 'tours' / 'photos'
PHOTO_URL = '/tours/photos'
MAX_SIDE = 1400  # px, longest side
QUALITY = 72     # JPEG quality
BOOKING_SITE = 'https://www.paristopsightstours.com/'
TRIPADVISOR_LOGO = '/site-images/tripadvisor-logo.png'

# WordPress tour categories, in the order the website lists them.
CATEGORY_ORDER = [
    'paris-walking-tours', 'paris-food-tours', 'paris-attraction-tickets', 'paris-themed-tours',
    'private-paris-tours', 'paris-tour-packages-with-attraction-tickets', 'beyond-paris',
]

# ---------------------------------------------------------------- text helpers

def plain(s):
    """HTML -> plain text on one line."""
    s = re.sub(r'<br\s*/?>|</p>|</li>|</h\d>', ' ', s or '', flags=re.I)
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s))
    return re.sub(r'\s+', ' ', s.replace('\xa0', ' ')).strip()


def euro(s):
    """The website shows prices in euros."""
    return s.replace('£', '€')


class Cleaner(HTMLParser):
    """Keeps simple formatting only: paragraphs, headings, lists, bold, italics, links."""
    MAP = {'p': 'p', 'h1': 'h3', 'h2': 'h3', 'h3': 'h3', 'h4': 'h4', 'h5': 'h4', 'h6': 'h4',
           'ul': 'ul', 'ol': 'ol', 'li': 'li', 'strong': 'strong', 'b': 'strong', 'em': 'em', 'i': 'em', 'a': 'a'}
    DROP = {'script', 'style', 'iframe', 'form', 'noscript', 'svg'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.stack, self.skip = [], [], 0

    def handle_starttag(self, tag, attrs):
        if tag in self.DROP:
            self.skip += 1
            return
        if self.skip:
            return
        if tag == 'br':
            self.out.append('<br>')
            return
        if tag == 'img':
            # Keep only the TripAdvisor logo (the old site's clickable "reviews" badge), as a local file.
            if 'tripadvisor_logo' in (dict(attrs).get('src') or '').lower():
                self.out.append(f'<img src="{TRIPADVISOR_LOGO}" alt="Read our reviews on TripAdvisor" class="td-ta-logo">')
            return
        t = self.MAP.get(tag)
        self.stack.append(t)
        if not t:
            return
        if t == 'a':
            href = dict(attrs).get('href') or ''
            if re.match(r'^(https?:|mailto:)', href):
                self.out.append(f'<a href="{html.escape(href, quote=True)}" target="_blank" rel="noopener noreferrer">')
            else:
                self.stack[-1] = None
        else:
            self.out.append(f'<{t}>')

    def handle_endtag(self, tag):
        if tag in self.DROP:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or tag == 'br' or not self.stack:
            return
        t = self.stack.pop()
        if t:
            self.out.append(f'</{t}>')

    def handle_data(self, data):
        if not self.skip:
            self.out.append(html.escape(data.replace('\xa0', ' '), quote=False))


def clean_html(raw):
    c = Cleaner()
    c.feed(raw or '')
    c.close()
    s = ''.join(c.out)
    s = re.sub(r'[ \t\r\n]+', ' ', s)
    s = re.sub(r'\s*<br>\s*(?=</(p|li|h3|h4)>)', '', s)          # trailing <br> in a block
    s = re.sub(r'<a [^>]*>\s*</a>', '', s)                        # links with nothing to click
    for _ in range(4):                                            # empty tags, nested empties
        s = re.sub(r'<(p|h3|h4|li|strong|em|ul|ol)>(\s|<br>)*</\1>', '', s)
    s = re.sub(r'\s*(</?(p|h3|h4|ul|ol|li)>)\s*', r'\1', s)
    s = re.sub(r'(<br>\s*){3,}', '<br><br>', s)
    return euro(s.strip())


def list_items(cleaned):
    """Bullet points from cleaned HTML: <li> items if there are any, otherwise paragraphs."""
    items = re.findall(r'<li>(.*?)</li>', cleaned, flags=re.S) or re.findall(r'<p>(.*?)</p>', cleaned, flags=re.S)
    if not items and cleaned:
        items = re.split(r'<br>', cleaned)
    out = []
    for it in items:
        t = plain(it)
        if t and t not in out:
            out.append(t)
    return out


def number(s):
    m = re.search(r'\d+(?:[.,]\d+)?', s or '')
    if not m:
        return None
    n = float(m.group(0).replace(',', '.'))
    return int(n) if n.is_integer() else n


def booking_url(raw):
    u = urllib.parse.urlsplit((raw or '').strip())
    q = [(k, v) for k, v in urllib.parse.parse_qsl(u.query) if not re.match(r'^(_gl|_ga|_gcl|gclid|fbclid|utm_)', k)]
    return urllib.parse.urlunsplit((u.scheme, u.netloc, u.path, urllib.parse.urlencode(q), ''))


DURATION_PATTERNS = [
    r'(\d+(?:\.\d+)?)[ -]hours? (?:guided )?walking tour',
    r'\bin (?:just )?(\d+(?:\.\d+)?) hours\b',
    r'\bover (\d+(?:\.\d+)?) hours\b',
    r'\bon a (\d+(?:\.\d+)?)-hour guided',
]


def duration(t):
    text = ' '.join([plain(t['snippetText']), plain(t['tourHighlights']), *[plain(b) for b in t['descriptionBlocks'] or []]])
    for p in DURATION_PATTERNS:
        m = re.search(p, text, flags=re.I)
        if m:
            return number(m.group(1))
    return None  # not stated: the website shows no time


def summary(t):
    s = plain(t['snippetText'])
    s = re.sub(r'\*{3,}\s*(\(\s*[\d,]+\s*\))?', '', s)  # "***** (2789)" star-rating leftovers
    return euro(re.sub(r'\s+', ' ', s).strip())


# ---------------------------------------------------------------- photos

def photo_name(url):
    path = urllib.parse.urlsplit(url).path
    m = re.search(r'/uploads/(\d{4})/(\d{2})/([^/]+)$', path)
    stem = Path(m.group(3) if m else path.rsplit('/', 1)[-1]).stem
    stem = re.sub(r'[^a-z0-9]+', '-', stem.lower()).strip('-')
    return f"{m.group(1)}-{m.group(2)}-{stem}.jpg" if m else f'{stem}.jpg'


def download(url, dest):
    if dest.exists():
        return True
    time.sleep(0.2)
    try:
        # Encode characters such as "©" or "é" in the file name, keeping the URL structure.
        safe_url = urllib.parse.quote(url, safe=':/?&=%#')
        req = urllib.request.Request(safe_url, headers={'User-Agent': 'Mozilla/5.0 (worldtopsights photo import)'})
        with urllib.request.urlopen(req, timeout=60) as r, tempfile.NamedTemporaryFile(suffix=Path(url).suffix, delete=False) as f:
            f.write(r.read())
            tmp = Path(f.name)
        size = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(tmp)], capture_output=True, text=True).stdout
        dims = [int(x) for x in re.findall(r'pixel(?:Width|Height): (\d+)', size)]
        cmd = ['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', str(QUALITY)]
        if dims and max(dims) > MAX_SIDE:
            cmd += ['-Z', str(MAX_SIDE)]
        res = subprocess.run(cmd + [str(tmp), '--out', str(dest)], capture_output=True, text=True)
        tmp.unlink(missing_ok=True)
        if res.returncode != 0 or not dest.exists():
            print(f'  ! could not convert {url}: {res.stderr.strip()[:200]}')
            return False
        return True
    except Exception as e:  # noqa: BLE001 - report and carry on
        print(f'  ! could not download {url}: {e}')
        return False


# ---------------------------------------------------------------- demo tours (not from WordPress)

U = 'https://images.unsplash.com/photo-{}?w=1200&q=75&auto=format&fit=crop'
P = 'https://images.pexels.com/photos/{0}/pexels-photo-{0}.jpeg?auto=compress&cs=tinysrgb&w=1200'
DEMO = [
    ('south-of-france', 'Nice Old Town & Castle Hill Walking Tour', 'Baroque churches, the Cours Saleya and the view from Castle Hill.', 2.5, 39, 4.8, 286,
     [U.format('1491166617655-0723a0999cfc'), P.format(36403738)]),
    ('south-of-france', 'Provence Lavender Fields Tour', 'The Valensole plateau in bloom, with a lavender distillery visit (June to August).', 7, 89, 4.9, 538,
     [U.format('1499002238440-d264edd596ec'), P.format(30037090)]),
    ('south-of-france', 'Private French Riviera Tour by Car', 'Nice, Villefranche, Èze and Monaco with a private driver-guide.', 8, 690, 4.9, 88,
     [P.format(105950), P.format(36403738)]),
    ('galeries-lafayette', 'Galeries Lafayette Personal Shopper', 'A stylist who knows every floor, brand and hidden corner.', 2, 120, 4.9, 176,
     [P.format(37392050)]),
    ('galeries-lafayette', 'Galeries Lafayette Dome & Rooftop', 'The story of the art nouveau dome and the rooftop view.', 1.5, 35, 4.8, 302,
     [P.format(37392050)]),
    ('galeries-lafayette', 'Private VIP Shopping at Galeries Lafayette', 'A private salon, a personal stylist and champagne while you shop.', 3, 290, 4.9, 47,
     [P.format(37392050)]),
]


def slugify(s):
    s = re.sub(r'[\u0300-\u036f]', '', __import__('unicodedata').normalize('NFD', s)).lower()
    return re.sub(r'[^a-z0-9]+', '-', s.replace('’', '').replace("'", '')).strip('-')


def demo_tours():
    out = []
    for dest, title, text, hours, price, rating, reviews, images in DEMO:
        out.append({
            'slug': slugify(title), 'title': title, 'destination': dest, 'demo': True, 'categories': [], 'topTour': False,
            'price': price, 'priceNote': None, 'childPrice': None, 'duration': hours, 'rating': rating, 'reviews': reviews,
            'bookingUrl': BOOKING_SITE, 'summary': text, 'highlights': [], 'description': f'<p>{html.escape(text)}</p>',
            'images': images, 'relatedTours': [],
        })
    for t in out:
        t['relatedTours'] = [o['slug'] for o in out if o['destination'] == t['destination'] and o is not t]
    return out


# ---------------------------------------------------------------- main

def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    source = json.load(open(sys.argv[1], encoding='utf-8'))
    wp = [t for t in source if t.get('status') == 'publish']
    print(f'{len(wp)} published tours ({len(source) - len(wp)} skipped: not published)')
    by_id = {t['id']: t for t in wp}
    PHOTO_DIR.mkdir(parents=True, exist_ok=True)

    tours, failed, pound = [], 0, 0
    for t in wp:
        urls = [t['featuredImage']['url']] if t.get('featuredImage') else []
        urls += [g['url'] for g in t.get('additionalImages') or [] if g and g.get('url')]
        images = []
        for url in dict.fromkeys(urls):
            name = photo_name(url)
            if download(url, PHOTO_DIR / name):
                images.append(f'{PHOTO_URL}/{name}')
            else:
                failed += 1
        raw_text = (t['snippetText'] or '') + (t['tourHighlights'] or '') + ''.join(t['descriptionBlocks'] or [])
        pound += raw_text.count('£')
        cats = {c['slug'] for c in t['categories']}
        adult_text = plain(t['adultPrice'])
        price = number(t['tourPrice']) or number(t['adultPrice'])
        note = adult_text if adult_text and re.sub(r'[\d.,\s€£]', '', adult_text) else None
        child = plain(t['childPrice'])
        ids = t['relatedTourIds'] or []
        related = [by_id[i]['slug'] for i in dict.fromkeys(ids[1::2] if len(ids) % 2 == 0 and ids[:1] == ['0'] else ids)
                   if i in by_id and i != t['id']]
        tours.append({
            '_id': t['id'],
            'slug': t['slug'],
            'title': plain(t['title']),
            'destination': 'paris',
            'demo': False,
            'categories': [c for c in CATEGORY_ORDER if c in cats],
            'topTour': bool(t['flags'].get('topTour')),
            'price': price,
            'priceNote': euro(note) if note else None,
            'childPrice': ('Free' if child.lower() == 'free' else number(child)) if child else None,
            'duration': duration(t),
            'rating': number(t['rating']) or 0,
            'reviews': number(t['reviewCount']) or 0,
            'bookingUrl': booking_url(t['bookingCode']) or BOOKING_SITE,
            'summary': summary(t),
            'highlights': list_items(clean_html(t['tourHighlights'])),
            'description': ''.join(clean_html(b) for b in t['descriptionBlocks'] or []),
            'images': images,
            'relatedTours': related,
        })

    # Tours with no related tours in WordPress: pick up to 4 similar ones, written into the file so they can be edited.
    filled = 0
    for t in tours:
        if t['relatedTours']:
            continue
        filled += 1
        mine = set(t['categories'])

        def score(o):
            if mine:
                return len(mine & set(o['categories'])) / len(mine | set(o['categories']))
            return 1.0 if 'paris-food-tours' in o['categories'] else 0.0
        others = sorted((o for o in tours if o is not t), key=lambda o: (score(o), o['reviews']), reverse=True)
        t['relatedTours'] = [o['slug'] for o in others[:4]]

    for t in tours:
        del t['_id']
    all_tours = tours + demo_tours()
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(all_tours, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print(f'wrote {OUT_JSON.relative_to(ROOT)}: {len(tours)} WordPress tours + {len(all_tours) - len(tours)} demo tours')
    print(f'photos: {len(list(PHOTO_DIR.glob("*.jpg")))} files in {PHOTO_DIR.relative_to(ROOT)} ({failed} failed)')
    print(f'related tours filled in for {filled} tours that had none in WordPress')
    print(f'£ changed to € in {pound} places')
    print('durations:')
    for t in tours:
        print(f"  {str(t['duration'] or '-'):>4}  {t['title'][:70]}")


if __name__ == '__main__':
    main()
