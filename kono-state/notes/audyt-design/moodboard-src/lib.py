"""Pomocnicze funkcje do złożenia moodboard.html: podglądy osadzone w pliku, oryginały obok."""
import base64, io, json, os, html
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EV = os.path.join(ROOT, 'moodboard-evidence')
MAN = json.load(open(os.path.join(EV, 'manifest.json'))) if os.path.exists(os.path.join(EV, 'manifest.json')) else {'screens': [], 'styles': {}, 'sites': {}}
SCREENS = {s['id']: s for s in MAN.get('screens', [])}
_used = []

def esc(s):
    return html.escape(str(s), quote=True)

def _b64(path, width, quality, crop=None):
    im = Image.open(path).convert('RGB')
    if crop:
        im = im.crop(crop)
    if im.size[0] > width:
        im = im.resize((width, round(im.size[1] * width / im.size[0])), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=quality, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

def fig(screen_id, caption, alt, width=900, quality=58, crop=None, crop_label=None):
    """Zrzut strony referencyjnej z manifestu. crop = (l, t, r, b) w pikselach oryginału."""
    s = SCREENS[screen_id]
    path = os.path.join(EV, s['screenshot'])
    src = _b64(path, width, quality, crop)
    _used.append(screen_id)
    vp = s.get('viewport_css_px') or {}
    when = (s.get('captured_at') or '')[:10]
    fid = screen_id + ('-kadr' if crop else '')
    kind = 'kadr z ' if crop else ''
    meta = f"<code>{esc(fid)}</code> · {kind}{esc(s.get('page_type',''))}, {esc(s.get('frame',''))} · {vp.get('width','?')}×{vp.get('height','?')} px · {esc(when)} · <a href=\"{esc(s['url'])}\" target=\"_blank\" rel=\"noopener\">{esc(s['url'])}</a>"
    if crop_label:
        meta += f" · {esc(crop_label)}"
    return (f'<figure><button type="button" class="shot" data-id="{esc(fid)}" data-title="{esc(s.get("site",""))}" '
            f'data-orig="moodboard-evidence/{esc(s["screenshot"])}" data-url="{esc(s["url"])}" aria-label="Powiększ zrzut: {esc(alt)}">'
            f'<img src="{src}" alt="{esc(alt)}" loading="lazy"></button>'
            f'<figcaption><b>{caption}</b><br>{meta}</figcaption></figure>')

def own(rel, caption, alt, sid, url, width=900, quality=58, crop=None):
    """Zrzut własnej strony REVAGY z katalogu zrzuty/."""
    path = os.path.join(ROOT, rel)
    src = _b64(path, width, quality, crop)
    return (f'<figure><button type="button" class="shot" data-id="{esc(sid)}" data-title="REVAGY (build lokalny)" '
            f'data-orig="{esc(rel)}" data-url="{esc(url)}" aria-label="Powiększ zrzut: {esc(alt)}">'
            f'<img src="{src}" alt="{esc(alt)}" loading="lazy"></button>'
            f'<figcaption><b>{caption}</b><br><code>{esc(sid)}</code> · build lokalny, 22.11.2026 · <a href="{esc(rel)}">{esc(rel)}</a></figcaption></figure>')

def table(head, rows, cls=''):
    h = ''.join(f'<th scope="col">{c}</th>' for c in head)
    b = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    for r in rows:
        assert len(r) == len(head), (head, r)
    return f'<div class="tablewrap" tabindex="0" role="region" aria-label="Tabela, przewijana w poziomie na wąskim ekranie"><table class="{cls}"><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table></div>'

def chain(items):
    labels = ['Widoczny przykład', 'Mechanizm', 'Wpływ na hierarchię informacji', 'Adaptacja dla REVAGY', 'Koszt albo kompromis']
    assert len(items) == 5
    return '<div class="chain">' + ''.join(f'<div><b>{l}</b>{t}</div>' for l, t in zip(labels, items)) + '</div>'

def sw(color):
    return f'<span class="sw" style="background:{esc(color)}"></span><code>{esc(color)}</code>'

def st(k):
    return {'m': '<span class="status m">Zmierzone</span>', 'o': '<span class="status o">Zaobserwowane</span>', 'e': '<span class="status e">Szacunek</span>', 'p': '<span class="status p">Propozycja</span>'}[k]

def style_of(site, el, props):
    v = MAN['styles'].get(site, {}).get(el) or {}
    return {p: v.get(p) for p in props}

def used():
    return list(dict.fromkeys(_used))
