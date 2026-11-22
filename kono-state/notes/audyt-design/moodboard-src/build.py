#!/usr/bin/env python3
"""Składa kono-state/notes/audyt-design/moodboard.html z szablonu, manifestu i treści poniżej."""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from lib import *

T = open(os.path.join(os.path.dirname(__file__), 'template.html')).read()
S = MAN.get('styles', {})
SITES = MAN.get('sites', {})

def ff(v):
    return (v or '').split(',')[0].strip('"\' ') or '—'

def typ(site):
    h = (S.get(site) or {}).get('h1') or {}
    b = (S.get(site) or {}).get('body') or {}
    if not h:
        return ('—', '—')
    note = ''
    try:
        small = float(str(h.get('fontSize')).replace('px', '')) < 30
    except ValueError:
        small = False
    if small:
        big = (S.get(site) or {}).get('largestTextAboveFold') or {}
        if big:
            note = f" (znacznik <code>h1</code> to podpis {esc(h.get('fontSize'))}; podaję największy tekst pierwszego ekranu)"
            h = big
    return (f"<code>{esc(ff(h.get('fontFamily')))}</code> {esc(h.get('fontSize'))} / {esc(h.get('fontWeight'))}, światło {esc(h.get('letterSpacing'))}{note}",
            f"<code>{esc(ff(b.get('fontFamily')))}</code> {esc(b.get('fontSize'))}")

def site_name(slug):
    return esc((SITES.get(slug) or {}).get('name') or slug)

# ---------- sekcje ----------
sec = []

# 0. Rama
sec.append('''
<section id="rama">
<h2>1. Rama: co jest ustalone, a co wybierasz</h2>
<div class="cols">
<div class="card"><h3>Ustalone (rejestr decyzji)</h3>
<ul>
<li>Wygląd, animacje, filmy i motyw strony głównej zostają w 100% (D-015). Każdy kierunek niżej dotyczy <b>podstron i zasobów marki</b>, nie strony głównej.</li>
<li>Kryterium odbioru: żadnych naruszeń układu, kolorów, kroju i odstępów strony głównej (D-021).</li>
<li>Podstrony mają własny układ (D-031) i miejsce na film (D-022).</li>
<li>Kategorie zamiast nazw własnych systemów (D-018, D-033). Opisy wdrożeń anonimowe do czasu Twoich zgód (D-034).</li>
<li>Paleta, kroje i zaokrąglenia zostają — to tokeny strony głównej (<a href="DESIGN.md">DESIGN.md</a>).</li>
</ul></div>
<div class="card"><h3>Do wyboru</h3>
<ul>
<li>Co ma być <b>głównym obrazem podstrony</b>: scena, dowód, schemat czy człowiek.</li>
<li>Jak mocno podstrony mają przypominać stronę główną, a jak mocno mają się czytać jak rzeczowy dokument.</li>
<li>Jakich materiałów to wymaga od Ciebie: liczby i zgody, zdjęcie, nic.</li>
</ul>
<p class="meta">Założenia własne <span class="status p">Propozycja</span>: odbiorca to osoba decydująca w firmie 5–250 osób albo kierownik w produkcji i logistyce (D-016); czyta na komputerze w pracy i na telefonie. Raport o komunikacji z 22.11 (<a href="../komunikacja-i-oferta.md">komunikacja-i-oferta.md</a>) mówi, że ci odbiorcy boją się ryzyka wdrożenia bardziej niż ręcznej pracy; biorę to jako wejście, nie sprawdzałem tego ponownie.</p>
</div></div>
</section>''')

# 1. Punkt wyjścia
sec.append('<section id="dzis"><h2>2. Punkt wyjścia: REVAGY dziś</h2>'
 '<p>Strona główna jest sceną produktu. Podstrona zaczyna się od samego tekstu. Różnicę widać na pierwszym ekranie; pełny opis jest w <a href="../audyt-design.md">audycie</a>.</p>'
 '<div class="grid g3">'
 + own('zrzuty/index-desktop-gora.webp', 'Strona główna, pierwszy ekran', 'REVAGY, strona główna: ciemna scena z siecią węzłów, tytuł „Procesy, które robią się same” i kanał zdarzeń', 'revagy-home-top', 'https://revagy.pl/')
 + own('zrzuty/integracja-systemow-desktop-gora.webp', 'Podstrona „Integracja systemów”, pierwszy ekran', 'REVAGY, podstrona: wyśrodkowany tytuł i wstęp na białym tle, dwa przyciski, bez obrazu', 'revagy-integracja-top', 'https://revagy.pl/integracja-systemow.html')
 + own('zrzuty/filmy-klatki.webp', 'Filmy: jeden język w 9 scenach', 'REVAGY, klatki filmów: ciemne sceny z panelami, zielonymi i pomarańczowymi statusami', 'revagy-filmy', 'https://revagy.pl/', crop=(0, 880, 1950, 1490))
 + '</div>'
 + table(['Cecha', 'Strona główna', 'Podstrony', 'Status'], [
   ['Ciemne sceny w wysokości strony', '37%', '13–16% (ofertowe), 6–7% (poradniki)', st('m') + ' <a href="design-evidence/pomiary-dodatkowe.json">pomiary</a>'],
   ['Pierwszy ekran', 'scena 1416×820 px z filmem', 'tytuł 72 px na białym, bez obrazu', st('m') + ' / ' + st('o')],
   ['Tytuł', '<code>Onest</code> 92px / 750, światło −3,68px', '<code>Onest</code> 72px / 750', st('m') + ' <a href="DESIGN.md">DESIGN.md §3.2</a>'],
   ['Obraz', 'film, makiety, ikony', 'jeden film w połowie strony', st('o')],
   ['Ludzie, znaki klientów, zdjęcia', 'brak', 'brak; autor jako wiersz 14 px', st('m')],
 ])
 + '</section>')

# 2. Próba
rows = []
order = [('flobotics', 'pl'), ('automation-house', 'pl'), ('office-samurai', 'pl'), ('digital-teammates', 'pl'), ('sagiton', 'pl'), ('linkwith-it', 'pl'), ('no-code-pl', 'pl'),
         ('n8n', 'intl'), ('zapier', 'intl'), ('lindy', 'intl'), ('workato', 'intl'), ('relevance-ai', 'intl'),
         ('ramp', 'adj'), ('mercury', 'adj'), ('linear', 'adj'), ('attio', 'adj')]
OBS = {
 'flobotics': ('jasne, szarozielone', 'dokumenty „z papieru” i pasek czterech liczb z odnośnikami do opisów wdrożeń', 'znaki partnerów i ocena pod przyciskami; liczby w drugim ekranie'),
 'automation-house': ('ciemne, granat z niebieską poświatą', 'pole „opisz problem” z podpowiedziami; karty etapów; karty wyniku z liczbą', 'liczby wyniku („80 osób”, „43 s”) niżej na stronie'),
 'office-samurai': ('jasne, szarość z pomarańczem', 'postać marki: figury 3D samuraja i robota, rysunki tuszem', 'znaki klientów w drugim ekranie'),
 'digital-teammates': ('jasne, biel z turkusem', 'zdjęcia biura i ludzi (stockowe w charakterze), sześciokątne ikony', 'trzy liczby i opinia z nazwiskiem w drugim ekranie'),
 'sagiton': ('ciemne zdjęcie w hero, potem biel', 'zdjęcia zespołu, lista usług, znaki klientów', 'ocena w serwisie z opiniami pod przyciskiem'),
 'linkwith-it': ('ciemne, granat z gradientami', 'świecące ikony, gradientowe nagłówki, plakietki promocji', 'trzy liczby w hero'),
 'no-code-pl': ('jasne, biel z różem', 'gotowe ilustracje wektorowe, ikony liniowe', 'brak'),
 'n8n': ('jasne z kropkową siatką', 'schemat przepływu w ciemnym panelu, zdjęcie użytkownika obok schematu, etykiety maszynowe', 'historia użytkownika z imieniem w drugim ekranie'),
 'zapier': ('jasne, kremowe', 'ekran produktu na rozmytym tle, schemat kroków, cytat klienta', 'znaki klientów w drugim ekranie'),
 'lindy': ('jasne, kremowe', 'szeryfowy tytuł, pole polecenia, ekrany telefonu na pastelowych tłach; głos w pierwszej osobie', 'ocena i „Check my references” ze znakami klientów'),
 'workato': ('ciemne, granat', 'schemat z krzywymi łączącymi ikony aplikacji, warstwowy diagram', 'znaki klientów w hero'),
 'relevance-ai': ('fioletowy gradient', 'maskotka, ekran produktu, duże liczby', 'znaki klientów pod hero'),
 'ramp': ('jasne, biel', 'ekran produktu, liczniki „na żywo”, siatka znaków klientów, zdjęcie klienta z liczbą', 'licznik nad tytułem, liczby i znaki w drugim ekranie'),
 'mercury': ('scena-pejzaż, potem jasne', 'malarski pejzaż z biurkiem, ekran produktu w ciemnej ramie', 'cytat założyciela klienta niżej'),
 'linear': ('ciemne, prawie czarne', 'ekran produktu jako jedyny obraz; czarno-białe zdjęcia klientów na podstronie', 'znaki klientów w drugim ekranie'),
 'attio': ('jasne, biel', 'ekran produktu, siatka znaków klientów, drobne schematy', 'znaki klientów w drugim ekranie'),
}
GROUP = {'pl': 'firma usługowa', 'intl': 'automatyzacja, świat', 'adj': 'sąsiednie B2B'}
refs_html = []
for slug, g in order:
    if f'{slug}-home-top' not in SCREENS:
        continue
    h1, body = typ(slug)
    tlo, obraz, dowod = OBS[slug]
    url = (SITES.get(slug) or {}).get('url') or SCREENS[f'{slug}-home-top']['url']
    rows.append([f'<b>{site_name(slug)}</b><br><a href="{esc(url)}" target="_blank" rel="noopener">{esc(url)}</a>', GROUP[g], tlo, obraz, dowod, h1])
    refs_html.append(f'<div class="ref" data-groups="{g}">' + fig(f'{slug}-home-top', site_name(slug), f'{(SITES.get(slug) or {}).get("name", slug)}: pierwszy ekran strony głównej', width=640, quality=55) + '</div>')

blocked = MAN.get('blocked', [])
blocked_txt = ', '.join(esc(b.get('site')) for b in blocked) or 'brak'
n_ok = len(rows)
sec.append('<section id="proba"><h2>3. Próba: ' + str(n_ok) + ' stron z branży i z sąsiedztwa</h2>'
 '<p>Siedem firm usługowych od automatyzacji (sześć polskojęzycznych i Flobotics, którego strona jest po angielsku i celuje w ochronę zdrowia w USA; polskiego pochodzenia firmy nie potwierdziłem), pięć narzędzi do automatyzacji i cztery marki B2B o wyrazistej identyfikacji. Zrzuty z 22.11.2026, okno 1440×900 px, po zamknięciu banerów zgody. Dla każdej strony: pierwszy ekran, dwa niższe kadry tej samej strony, jedna podstrona (oferta, cennik albo klienci) i pierwszy ekran na telefonie 390 px. '
 'Wartości kroju pochodzą ze stylów strony (pierwszy widoczny <code>h1</code>); stos krojów z CSS nie dowodzi, który plik się wyrenderował. Pełny zapis: <a href="moodboard-evidence/manifest.json">manifest.json</a>.</p>'
 f'<p class="meta">Niedostępne i pominięte: {blocked_txt}. Obie strony odpowiedziały kodem 403 i planszą „potwierdź, że jesteś człowiekiem”; po dwóch próbach odpuściłem, pola nie zaznaczałem. Wzorca układu z D-002 (Revolut Business) nie udało się więc sfotografować i nie ma go w porównaniu.</p>'
 '<div class="filters" role="group" aria-label="Filtr grup"><button type="button" data-group="all" aria-pressed="true">Wszystkie</button><button type="button" data-group="pl" aria-pressed="false">Firmy usługowe</button><button type="button" data-group="intl" aria-pressed="false">Automatyzacja, świat</button><button type="button" data-group="adj" aria-pressed="false">Sąsiednie B2B</button></div>'
 '<div class="grid g4">' + ''.join(refs_html) + '</div>'
 + table(['Strona', 'Grupa', 'Tło pierwszego ekranu ' + st('o'), 'Główny obraz ' + st('o'), 'Dowód blisko góry ' + st('o'), 'Tytuł (h1) ' + st('m')], rows)
 + '<p class="meta">LinkWith.it nie wczytał własnego kroju w przeglądarce testowej, więc jego tytuł jest pokazany krojem systemowym; kształt liter na zrzucie może się różnić od tego, co widzi odwiedzający.</p>'
 + '<h3>Co z tej próby wynika dla REVAGY</h3><ul>'
 '<li><b>Ciemna scena z poświatą nie wyróżnia.</b> Ciemny albo barwny pierwszy ekran ma 7 z 16 stron (Automation House, LinkWith.it, Sagiton, Workato, Linear, Relevance AI, Mercury). Poświatę na ciemnym tle, pokrewną hero REVAGY, mają Automation House i LinkWith.it — dwie z sześciu polskojęzycznych firm usługowych. ' + st('o') + '</li>'
 '<li><b>Dowód „z zewnątrz” jest normą.</b> W obejrzanych kadrach (strona główna do ok. trzech ekranów i jedna podstrona) znak klienta, ocenę, opinię z nazwiskiem albo liczbę z odnośnikiem do opisu wdrożenia pokazuje 14 z 16 stron; nie pokazują ich No-Code.pl i LinkWith.it. REVAGY jest dziś w tej drugiej grupie: ma własne liczby pod hero i anonimowe opisy wdrożeń. ' + st('o') + '</li>'
 '<li><b>Najbliższy treścią jest Flobotics</b>: „We automate the work between your systems” to ta sama obietnica co „Dane wpisujesz raz” (D-017), choć na innym rynku. Pokazuje ją dokumentami i liczbami, nie interfejsem. ' + st('o') + '</li>'
 '<li><b>Polskojęzyczne firmy usługowe pokazują ludzi stockowo albo wcale.</b> Zdjęcia biur (Digital Teammates, Sagiton), gotowe ilustracje (No-Code.pl), postać 3D (Office Samurai), poświata (Automation House, LinkWith.it). Żadna z tych sześciu nie używa schematu przepływu jako głównego obrazu; robią to n8n, Zapier i Workato. ' + st('o') + '</li>'
 '<li><b>Tytuł REVAGY należy do najcięższych w próbie</b>: 92 px przy grubości 750. Większy stopień mają tylko Sagiton (102 px) i Lindy (104 px), oba przy grubości 400–500; grubszy krój ma tylko Flobotics (800 przy 59 px). Większość mieści się w 48–72 px i 400–600. ' + st('m') + '</li>'
 '</ul></section>')

# ---------- kierunki ----------
def sketch(kind):
    hd = '<div class="hd"><span class="lg"></span><span class="nv"><i></i><i></i><i></i><i></i></span><span class="bt" style="width:12cqw"></span></div>'
    if kind == 'A':
        body = ('<div class="scene" style="left:1.5%;right:1.5%;top:11%;bottom:3%"><div class="glow"></div>'
                '<div class="mono" style="left:5%;top:16%;color:#ff5b14">Integracja systemów</div>'
                '<div class="t w" style="left:5%;top:24%;width:38%"></div><div class="t w" style="left:5%;top:33%;width:44%"></div><div class="t w" style="left:5%;top:42%;width:30%"></div>'
                '<div class="s w" style="left:5%;top:55%;width:36%"></div><div class="s w" style="left:5%;top:59.5%;width:32%"></div>'
                '<div class="pill" style="left:5%;top:70%;width:20%;background:#ff5b14"></div><div class="pill" style="left:27%;top:70%;width:16%;background:rgba(255,255,255,.18)"></div>'
                '<div style="right:4%;top:14%;width:42%;bottom:12%;border-radius:1.6cqw;background:#221e23;border:.15cqw solid rgba(255,255,255,.14)">'
                '<div style="left:6%;top:8%;width:40%;height:74%;border-radius:1cqw;background:#2e2930"></div><div style="right:6%;top:8%;width:40%;height:74%;border-radius:1cqw;background:#2e2930"></div>'
                '<div style="left:46.5%;top:40%;width:7%;aspect-ratio:1;border-radius:50%;background:#ff5b14"></div><div style="left:6%;right:6%;bottom:5%;height:9%;border-radius:.8cqw;background:#fff"></div></div></div>')
    elif kind == 'B':
        body = ('<div class="mono" style="left:5%;top:15%;color:#c23d06">Integracja systemów</div>'
                '<div class="t" style="left:5%;top:22%;width:40%"></div><div class="t" style="left:5%;top:31%;width:46%"></div><div class="t" style="left:5%;top:40%;width:28%"></div>'
                '<div class="s" style="left:5%;top:52%;width:40%"></div><div class="s" style="left:5%;top:56.5%;width:34%"></div>'
                '<div class="pill" style="left:5%;top:64%;width:20%;background:#ff5b14"></div><div class="pill" style="left:27%;top:64%;width:16%;border:.25cqw solid #141114"></div>'
                '<div style="right:7%;top:14%;width:32%;height:52%;background:#fff;border:.15cqw solid #e1dbd4;border-radius:1cqw;transform:rotate(-2.5deg);box-shadow:0 2cqw 3cqw -2cqw rgba(20,17,20,.4)">'
                '<div class="mono" style="left:8%;top:7%">Umowa · podpisana</div><div class="s" style="left:8%;top:22%;width:60%"></div><div class="s" style="left:8%;top:31%;width:74%"></div>'
                '<div style="left:6%;top:41%;width:66%;height:11%;background:rgba(255,91,20,.28);border-radius:.4cqw"></div><div class="s" style="left:8%;top:44%;width:56%;opacity:.9;background:#141114"></div>'
                '<div class="s" style="left:8%;top:60%;width:48%"></div><div class="s" style="left:8%;top:69%;width:66%"></div></div>'
                '<div style="left:5%;right:5%;bottom:22%;height:.25cqw;background:#141114"></div>'
                '<div class="num" style="left:5%;bottom:9%">ok. 12 h</div><div class="lab" style="left:5%;bottom:4%">mniej pracy tygodniowo</div>'
                '<div class="num" style="left:37%;bottom:9%">ok. 90%</div><div class="lab" style="left:37%;bottom:4%">mniej korekt</div>'
                '<div class="num" style="left:69%;bottom:9%">10 min</div><div class="lab" style="left:69%;bottom:4%">zamiast ok. 3 dni</div>')
    elif kind == 'C':
        body = ('<div class="t" style="left:5%;top:15%;width:40%"></div><div class="t" style="left:5%;top:24%;width:30%"></div>'
                '<div class="s" style="left:5%;top:35%;width:38%"></div>'
                '<div class="pill" style="left:5%;top:42%;width:20%;background:#ff5b14"></div>'
                '<div style="left:4%;right:4%;top:52%;bottom:4%;border-radius:2cqw;background:#f4f1ee;background-image:radial-gradient(#cfc8bf .12cqw,transparent .14cqw);background-size:2cqw 2cqw"></div>'
                '<div class="node" style="left:8%;top:62%;width:17%;height:10%">System HR</div><div class="wire" style="left:25%;top:66.8%;width:8%"></div>'
                '<div class="node" style="left:33%;top:62%;width:19%;height:10%;background:#ff5b14;border-color:#ff5b14">Kontrola pól</div><div class="wire" style="left:52%;top:66.8%;width:8%"></div>'
                '<div class="node" style="left:60%;top:62%;width:20%;height:10%">Kadry i płace</div>'
                '<div style="left:42.3%;top:72%;width:.25cqw;height:8%;background:#141114"></div>'
                '<div class="node" style="left:31%;top:80%;width:23%;height:10%;background:#141114;color:#fff">Dziennik zapisów</div>'
                '<div class="mono" style="left:8%;top:57%;color:#625c63">źródło</div><div class="mono" style="left:60%;top:57%;color:#625c63">cel</div><div class="mono" style="left:57%;top:83.5%;color:#625c63">co · skąd · kiedy</div>')
    else:
        body = ('<div class="mono" style="left:5%;top:15%;color:#c23d06">Integracja systemów</div>'
                '<div class="t" style="left:5%;top:22%;width:38%"></div><div class="t" style="left:5%;top:31%;width:44%"></div><div class="t" style="left:5%;top:40%;width:26%"></div>'
                '<div class="s" style="left:5%;top:52%;width:38%"></div><div class="s" style="left:5%;top:56.5%;width:32%"></div>'
                '<div class="pill" style="left:5%;top:65%;width:20%;background:#ff5b14"></div><div class="pill" style="left:27%;top:65%;width:16%;border:.25cqw solid #141114"></div>'
                '<div style="left:5%;top:80%;width:5%;aspect-ratio:1;border-radius:50%;background:#e9e4de"></div><div class="s" style="left:12%;top:81.5%;width:18%;opacity:.9;background:#141114"></div><div class="s" style="left:12%;top:86%;width:24%"></div>'
                '<div style="right:5%;top:13%;width:34%;bottom:6%;border-radius:2.4cqw;background:#f4f1ee;overflow:hidden">'
                '<div style="left:50%;top:22%;width:26%;aspect-ratio:1;border-radius:50%;background:#cfc8bf;transform:translateX(-50%)"></div>'
                '<div style="left:50%;top:50%;width:62%;height:60%;border-radius:40% 40% 0 0;background:#cfc8bf;transform:translateX(-50%)"></div>'
                '<div class="mono" style="left:8%;top:6%;color:#625c63">miejsce na zdjęcie</div>'
                '<div style="left:6%;right:6%;bottom:5%;height:20%;border-radius:1.2cqw;background:#141114"><div class="s w" style="left:8%;top:22%;width:70%;opacity:.95"></div><div class="s w" style="left:8%;top:48%;width:52%"></div><div class="mono" style="left:8%;top:72%;color:#ff5b14">Dawid Skibicki · założyciel</div></div></div>')
    extra = ' Liczby pochodzą z opisu wdrożenia „Agencja pracy” na tej podstronie.' if kind == 'B' else ''
    return f'<div><p class="sklabel">Szkic — propozycja, nie projekt</p><div class="sk" role="img" aria-label="Szkic pierwszego ekranu podstrony w kierunku {kind}">{hd}{body}</div><p class="meta">Schemat pierwszego ekranu podstrony „Integracja systemów” w tokenach REVAGY.{extra}</p></div>'

def direction(letter, name, thesis, figs, chains, tokens, needs, answers, risks, sk):
    cid = 'kierunek-' + letter.lower()
    out = [f'<section class="dir" id="{cid}"><h2><span class="letter">{letter}</span>{name}</h2><p class="lede">{thesis}</p>']
    out.append('<div class="grid g2">' + ''.join(figs[:2]) + '</div>')
    if len(figs) > 2:
        out.append('<div class="grid g3" style="margin-top:16px">' + ''.join(figs[2:]) + '</div>')
    for title, items in chains:
        out.append(f'<h3>{title}</h3>' + chain(items))
    out.append('<h3>Wartości z przykładów</h3>' + table(['Rola', 'Wartość', 'Status', 'Skąd i jak czytać'], tokens))
    out.append('<div class="cols"><div>' + sk + '</div><div class="card"><h4>Czego wymaga</h4><ul>' + ''.join(f'<li>{x}</li>' for x in needs) + '</ul>'
               '<h4>Na co odpowiada z audytu</h4><ul>' + ''.join(f'<li>{x}</li>' for x in answers) + '</ul>'
               '<h4>Ryzyko i kompromis</h4><ul>' + ''.join(f'<li>{x}</li>' for x in risks) + '</ul></div></div>')
    out.append('</section>')
    return ''.join(out)

def css(site, el, prop):
    v = ((S.get(site) or {}).get(el) or {}).get(prop)
    return esc(v) if v else None

def tok(role, site, el, prop, note):
    v = css(site, el, prop)
    if not v:
        return None
    shown = sw(v) if prop in ('color', 'backgroundColor') and (v.startswith('rgb') or v.startswith('#')) else f'<code>{v}</code>'
    return [role, shown, st('m'), f'{site_name(site)}, <code>{el}</code>, <code>{prop}</code>, 1440 px. {note}']

def bg(site, note):
    v = (S.get(site) or {}).get('bodyBackground')
    if not v or v.startswith('rgba(0, 0, 0, 0)'):
        v = (S.get(site) or {}).get('heroBackground')
    if not v or not isinstance(v, str):
        return None
    return ['Tło strony', sw(v), st('m'), f'{site_name(site)}, <code>body</code>, <code>backgroundColor</code>, 1440 px. {note}']

def cta(site, note):
    c = (S.get(site) or {}).get('cta') or {}
    if not c.get('backgroundColor'):
        return None
    r = c.get('borderRadius') or ''
    try:
        r = 'pigułka' if float(r.replace('px', '')) >= 99 else r
    except ValueError:
        pass
    return ['Przycisk główny', sw(c['backgroundColor']) + f' · rogi <code>{esc(r)}</code>', st('m'), f'{site_name(site)}, „{esc((c.get("text") or "").strip())}”, <code>backgroundColor</code> i <code>borderRadius</code>. {note}']

def toks(*rows):
    return [r for r in rows if r]

P = lambda role, val, note: [role, val, st('p'), note]

sec.append('<section id="kierunki"><h2>4. Cztery kierunki</h2><p>Każdy kierunek odpowiada na to samo pytanie: co ma być głównym obrazem podstrony REVAGY. Nazwy są stałe — możesz się do nich odwoływać literą. Kierunki można łączyć; jak, opisuję w części 6.</p></section>')

# A
sec.append(direction('A', 'Scena wszędzie',
 'Podstrona zaczyna się tak jak strona główna: ciemną sceną z poświatą, w której stoi tytuł i kadr filmu. Najmniejsza zmiana, największa ciągłość.',
 [fig('automation-house-home-top', 'Automation House — scena z poświatą jako pierwszy ekran', 'Automation House: ciemny granatowy pierwszy ekran z niebieską poświatą, tytuł i pole do opisania problemu'),
  fig('mercury-home-f2', 'Mercury — ekran produktu w ciemnej ramie po scenie', 'Mercury: ciemna rama z ekranem produktu wypełnia okno'),
  fig('automation-house-home-f3', 'Automation House — karta wyniku z liczbą w scenie', 'Automation House: ciemne karty z liczbą „80 osób” i numerami kroków'),
  fig('linkwith-it-home-top', 'LinkWith.it — ta sama rodzina, doprowadzona do przesytu', 'LinkWith.it: ciemny ekran ze świecącymi ikonami, gradientowym tytułem i trzema liczbami'),
  fig('mercury-home-top', 'Mercury — scena budowana obrazem, nie interfejsem', 'Mercury: malarski pejzaż z biurkiem jako tło pierwszego ekranu')],
 [('Scena jako jedyne mocne miejsce ekranu', [
   'Automation House i Mercury dają na ekran jedną ciemną scenę; reszta strony jest spokojna. U Mercury po scenie przychodzi jasna część do czytania.',
   'Dwa poziomy: „scena” dla tego, co najważniejsze, i „papier” dla treści. Scena ma własne tło, własne światło i jeden obiekt w środku.',
   'Wzrok trafia najpierw w scenę. Hierarchia jest prosta: to, co w scenie, jest ważniejsze od wszystkiego wokół.',
   'Pierwszy ekran podstrony w ciemnym kontenerze <code>--r-xl</code> z poświatą: tytuł po lewej, plakat filmu po prawej. Film przechodzi z połowy strony na górę. Opis wdrożenia dostaje małą scenę z liczbą.',
   'Sceny są już w kodzie i w filmach, więc koszt jest najniższy. Za to ciemny pierwszy ekran jest w próbie najczęstszym chwytem (7 z 16 stron) i sama scena nie odróżni REVAGY od Automation House czy LinkWith.it.']),
  ('Gdzie ten język się psuje', [
   'LinkWith.it: na pierwszym ekranie świecą naraz tło, ikony, gradientowy tytuł i trzy kolorowe liczby; na podstronie dochodzą plakietki promocji („-50% OFF”, „HOT DEAL”; kadr <code>linkwith-it-inner-top</code> w katalogu dowodów).',
   'Gdy wszystko jest sceną, nic nią nie jest.',
   'Hierarchia się spłaszcza; oko nie ma gdzie odpocząć, a treść merytoryczna (tabela, warunki) nie ma swojego miejsca.',
   'Reguła: najwyżej jedna scena na ekran, najwyżej trzy na podstronę (góra, dowód, pasek końcowy). Treść zostaje na papierze.',
   'Kierunek nie rozwiązuje czytelności tekstu i tabel (pozycje 7–9 z listy zmian) — trzeba je zrobić osobno.'])],
 toks(bg('automation-house', 'Prawie czarne z niebieską poświatą.'),
      cta('automation-house', 'Jeden jasnoniebieski akcent na całej stronie.'),
      [ 'Tło sceny REVAGY', sw('#141114'), st('m'), 'REVAGY, <code>.hero</code>, <code>backgroundColor</code> (<a href="DESIGN.md">DESIGN.md §3.1</a>)'],
      tok('Tytuł', 'mercury', 'h1', 'fontSize', 'Mercury trzyma tytuł w scenie mały i lekki; grubość <code>' + (css('mercury', 'h1', 'fontWeight') or '—') + '</code>.'),
      P('Liczba scen na podstronę', 'do 3', 'Moja reguła z obserwacji LinkWith.it; do sprawdzenia na pierwszej podstronie.'),
      P('Tytuł w scenie podstrony', '<code>.display-2</code>, biały', 'Istniejący styl; nic nowego w typografii.')),
 ['Nic od Ciebie. Filmy i plakaty już są (6 podstron).', 'Dla dwóch poradników bez filmu: scena z samym tytułem albo ze schematem.'],
 ['Pierwszy ekran bez obrazu (poz. 5).', 'Mały udział scen i brak akcentu na podstronach (S3).', 'Częściowo dowód wdrożenia (poz. 6).'],
 ['Najmniej odróżnia od konkurencji z próby.', 'Wzmacnia ton „produktu”, który według raportu o komunikacji budzi nieufność u części odbiorców („samo”, „AI”).', 'Na telefonie scena z kadrem filmu zajmie cały pierwszy ekran; tytuł musi zostać nad zgięciem.'],
 sketch('A')))

# B
sec.append(direction('B', 'Dowód na papierze',
 'Podstrona jest jasna i rzeczowa, a największym pismem mówi dowód: liczba z wdrożenia, dokument, warunek. Scena zostaje dla strony głównej i paska końcowego.',
 [fig('flobotics-home-top', 'Flobotics — dokument jako obraz obietnicy', 'Flobotics: jasny pierwszy ekran, tytuł z zakreśleniem i dwa dokumenty „z papieru” po prawej'),
  fig('flobotics-home-f2', 'Flobotics — pasek liczb, każda z odnośnikiem do opisu wdrożenia', 'Flobotics: ciemny pasek z czterema liczbami i podpisami, pod nim sekcja z dokumentami', crop=(0, 60, 1440, 760), crop_label='kadr: górne 700 px'),
  fig('ramp-inner-top', 'Ramp — historie klientów: tytuł, znaki, ludzie', 'Ramp: strona „Customer Stories” z ogromnym tytułem, rzędem znaków klientów i zdjęciami'),
  fig('ramp-home-f2', 'Ramp — liczba na zdjęciu klienta obok siatki znaków', 'Ramp: siatka znaków klientów i zdjęcie z liczbą „$1M+”'),
  fig('flobotics-inner-top', 'Flobotics — cennik pokazany wprost', 'Flobotics: strona cennika z tytułem „The way we price shouldn’t be a secret” i trzema przedziałami')],
 [('Dowód dostaje największe pismo', [
   'Flobotics: pod pierwszym ekranem stoi pasek czterech liczb („~1 min”, „~55 sec”, „23 days”), każda z jednym zdaniem i odnośnikiem „case study”. Ramp: licznik nad tytułem i liczba „$1M+” na zdjęciu klienta.',
   'Liczba z wdrożenia jest traktowana jak nagłówek, a jej źródło stoi tuż pod nią. Interfejs dookoła jest cichy: cienkie linie, proste rogi, mało koloru.',
   'Czytelnik najpierw widzi wynik, potem warunki. Twierdzenie i dowód są w jednym spojrzeniu.',
   'Blok „opis wdrożenia” zaczyna się od liczb w stylu <code>.stat-num</code> (już istnieje na stronie głównej): „ok. 12 h tygodniowo mniej”, „ok. 90% mniej korekt”, pod nimi „jak mierzone”. Ten sam pasek pod tytułem podstrony.',
   'Wymaga liczb, pod którymi się podpiszesz, i z czasem zgód (D-034). Bez nich kierunek zostaje pusty — dziś są cztery opisy wdrożeń i jeden pilotaż.']),
  ('Dokument zamiast interfejsu', [
   'Flobotics pokazuje skierowanie i formularz jak kartki: lekko obrócone, z zakreślonymi polami i odręczną notatką.',
   'Obrazem jest przedmiot pracy klienta, nie narzędzie dostawcy. Zakreślenie pokazuje dokładnie, które pole „przechodzi samo”.',
   'Odbiorca rozpoznaje własną robotę w sekundę; nie musi rozumieć architektury.',
   'REVAGY ma już ten motyw: karta „Dokumenty bez przepisywania” na stronie głównej (kartka „Faktura VAT” ze skanerem). Na podstronach: umowa, faktura kosztowa, raport zmianowy jako kartki z polami zakreślonymi <code>--accent</code>, w kategoriach, bez nazw systemów (D-033).',
   'Każda podstrona potrzebuje jednej narysowanej kartki. To rysunek w CSS albo SVG, tańszy niż film, ale trzeba go zaprojektować.']),
  ('Tekst do czytania, nie do oglądania', [
   'Flobotics i Ramp składają treść do lewej, w kolumnach; wyśrodkowany jest najwyżej tytuł sekcji. Cennik Flobotics mówi wprost o kwotach.',
   'Układ redakcyjny: lewa krawędź, krótkie wiersze, tabela i cennik jako pełnoprawne elementy strony.',
   'Długi tekst da się czytać; tabela staje się treścią, a nie dodatkiem.',
   'Treść podstron do lewej w kolumnie ok. 70 znaków; tabele kolorem <code>--ink</code>; audyt 1 990 zł (D-028) i ceny „od” (D-029) pokazane jak dowód, dużym pismem.',
   'Mniej efektu „wow” niż w kierunku A. Bez mocnej typografii liczb podstrona wróci do wyglądu dokumentu, czyli do stanu dzisiejszego.'])],
 toks(bg('flobotics', 'Chłodna szarość zamiast bieli; REVAGY zostaje przy <code>--paper</code> i <code>--mist</code>.'),
      cta('flobotics', 'Proste rogi i czerń: interfejs cichy, żeby mówiły liczby.'),
      tok('Tytuł', 'flobotics', 'h1', 'fontSize', 'Grubość <code>' + (css('flobotics', 'h1', 'fontWeight') or '—') + '</code>, światło <code>' + (css('flobotics', 'h1', 'letterSpacing') or '—') + '</code> — charakter bliski tytułom REVAGY.'),
      tok('Tytuł', 'ramp', 'h1', 'fontSize', 'Grubość <code>' + (css('ramp', 'h1', 'fontWeight') or '—') + '</code>: Ramp buduje wagę rozmiarem, nie grubością.'),
      ['Zakreślenie w tytule', 'żółty marker', st('e'), 'Flobotics, pierwszy ekran; koloru nie mierzyłem.'],
      P('Liczba dowodu', '<code>.stat-num</code>: Onest 750, 60 px', 'Istniejący styl REVAGY (<a href="DESIGN.md">DESIGN.md §3.2</a>).'),
      P('Zakreślenie pola', '<code>--accent</code> przy 25–30% krycia pod tekstem <code>--ink</code>', 'Do sprawdzenia kontrastu na gotowym rysunku.')),
 ['Liczby z wdrożeń i sposób ich mierzenia (masz je w opisach; potrzebne potwierdzenie, które można wynieść na górę).', 'Z czasem zgody na nazwy i cytaty (D-034).', 'Kwoty „od” i cena pilota (D-029, D-030) — bez nich blok cennika zostaje połowiczny.'],
 ['Opis wdrożenia jako komponent z liczbą (poz. 6).', 'Tekst do lewej i sekcje z formą (poz. 7, 8).', 'Tabele (poz. 9).', 'Pierwszy ekran: kartka albo pasek liczb (poz. 5).'],
 ['Najbardziej zależny od treści, której dziś jest mało.', 'Podstrony odejdą od „sceny” strony głównej; spójność trzymają wtedy kroje, akcent i pasek końcowy.', 'Zgodny z tym, czego według raportu o komunikacji szukają odbiorcy (małe ryzyko, konkret), ale tego nie mierzyłem.'],
 sketch('B')))

# C
sec.append(direction('C', 'Schemat przepływu',
 'Obrazem marki staje się schemat: co z czym jest połączone, gdzie stoi kontrola, gdzie decyduje człowiek. Węzły to kategorie systemów, więc schemat nie potrzebuje żadnej nazwy własnej.',
 [fig('n8n-home-f2', 'n8n — schemat przepływu w ciemnym panelu, obok człowiek, który go zbudował', 'n8n: ciemny panel ze schematem węzłów i krzywych, po lewej zdjęcie użytkownika i podpis „How Tom automated new user onboarding”'),
  fig('workato-home-f2', 'Workato — krzywe łączące źródła z celami', 'Workato: jasny panel z ikonami aplikacji połączonymi pomarańczowymi krzywymi', crop=(0, 60, 1440, 820), crop_label='kadr: górne 760 px'),
  fig('zapier-home-f3', 'Zapier — kroki przepływu jako drobny schemat przy liście korzyści', 'Zapier: lista korzyści po lewej, schemat kroków na rozmytym tle po prawej, niżej cytat klienta'),
  fig('n8n-home-top', 'n8n — siatka kropek i etykiety maszynowe jako tło całej marki', 'n8n: jasny pierwszy ekran z kropkową siatką, tytułem i polem polecenia'),
  own('zrzuty/index-desktop-gora.webp', 'REVAGY — ten język już jest w hero', 'REVAGY: sieć węzłów „Formularz, E-mail, Zamówienie PDF → Agent AI → CRM, Oferta, ERP, Magazyn” w hero', 'revagy-home-top-kadr', 'https://revagy.pl/', crop=(760, 80, 1420, 460))],
 [('Schemat mówi dokładnie, co jest połączone', [
   'n8n pokazuje pełny przepływ: wyzwalacz, kroki, rozgałęzienie, wynik; każdy węzeł ma podpis. Workato prowadzi krzywe od źródeł do celów.',
   'Rysunek jest twierdzeniem: „to idzie stąd tam, przez to”. Nie ma w nim ozdobników, więc wygląda wiarygodnie.',
   'Jeden obraz zastępuje akapit opisu. Czytelnik widzi zakres pracy, zanim przeczyta tekst.',
   'Każda podstrona dostaje jeden schemat: „System HR → kontrola pól → Kadry i płace → dziennik zapisów”. Części już są: węzły-pigułki z filmu w hero, linia kreskowana i węzły z pasma procesu (<code>.flow</code>, <code>.node</code>, <code>.link</code>), etykiety JetBrains Mono.',
   'Schemat trzeba narysować dla każdej strony i utrzymywać zgodnie z treścią. Dla osoby nietechnicznej schemat bywa chłodny — podpisy muszą być zwykłym językiem („kontrola przed zapisem”, nie „walidacja”).']),
  ('Kategoria zamiast znaku firmowego', [
   'n8n, Workato i Zapier budują schemat z ikon znanych aplikacji. To ich przewaga i ich koszt: schemat jest pełen cudzych znaków.',
   'Węzeł niesie nazwę. U nich nazwą jest marka aplikacji.',
   'Odbiorca szuka „swojego” programu; jeśli go nie ma, czuje się pominięty.',
   'U REVAGY węzeł niesie kategorię: „system HR”, „program kadrowo-płacowy”, „system ERP”. To dokładnie D-018 i D-033 zamienione w zasadę rysunku, a nie w ograniczenie tekstu.',
   'Schemat z kategorii jest mniej „rozpoznawalny od pierwszego spojrzenia” niż schemat ze znakami. Wygrywa uczciwością, nie efektem.']),
  ('Człowiek w schemacie', [
   'n8n stawia obok schematu zdjęcie osoby i zdanie „How Tom automated new user onboarding”.',
   'Schemat ma autora i właściciela. Technika dostaje twarz.',
   'Dowód staje się historią: kto, co, z jakim skutkiem.',
   'Węzeł „decyzja osoby po Twojej stronie” jako stały element każdego schematu (jest już w filmie „dane i bezpieczeństwo”). Z czasem: schemat wdrożenia podpisany przez klienta (D-034).',
   'Bez zgód zostaje sam węzeł „człowiek”, bez osoby.'])],
 toks(bg('n8n', 'Jasna baza z kropkową siatką; panele schematów ciemne.'),
      cta('n8n', 'Różowa pigułka z napisem wersalikami, krojem maszynowym.'),
      tok('Tytuł', 'n8n', 'h1', 'fontSize', 'Grubość <code>' + (css('n8n', 'h1', 'fontWeight') or '—') + '</code>; tytuł lżejszy niż u REVAGY, charakter niosą etykiety maszynowe.'),
      tok('Tytuł', 'workato', 'h1', 'fontFamily', 'Szeryfowy tytuł nad technicznym schematem.'),
      ['Etykiety przycisków i menu n8n', 'wersaliki, krój maszynowy', st('o'), 'n8n, pierwszy ekran; wartości nie mierzyłem.'],
      P('Węzeł', 'pigułka albo prostokąt <code>--r-md</code>, obrys 1,5 px <code>--ink</code>; węzeł kontroli <code>--accent</code>; dziennik <code>--night</code>', 'Z istniejących elementów REVAGY.'),
      P('Tło schematu', '<code>--mist</code> z siatką kropek albo scena <code>--night</code>', 'Dwa warianty: jasny na podstronie, ciemny w filmie.')),
 ['Nic od Ciebie na start: schematy wynikają z treści podstron.', 'Później: zgoda klienta na podpisany schemat wdrożenia (D-034).'],
 ['Pierwszy ekran z obrazem (poz. 5).', 'Sekcje bez komponentu dostają formę: schemat zamiast trzech wierszy (poz. 8).', 'Zestaw ilustracji dla podstron (poz. 21).', 'Kroki z kolejnością (poz. 14).'],
 ['Schemat to konwencja narzędzi do automatyzacji (n8n, Zapier, Workato) — na świecie nie wyróżnia; z sześciu polskojęzycznych firm usługowych w próbie nie używa go żadna.', 'Może odstraszyć odbiorcę nietechnicznego, jeśli podpisy będą techniczne.', 'Najlepiej łączy się z innymi: schemat może stać w scenie (A), obok liczby (B) albo obok twarzy (D).'],
 sketch('C')))

# D
sec.append(direction('D', 'Twarz i podpis',
 'Marka dostaje człowieka: zdjęcie założyciela, podpis pod tym, co obiecuje, i głos osoby zamiast głosu produktu. Usługę wykonuje konkretna osoba i strona to pokazuje.',
 [fig('lindy-home-top', 'Lindy — produkt mówi jak osoba i prosi: „Check my references”', 'Lindy: kremowy pierwszy ekran z szeryfowym tytułem „Hire Lindy, get it done”, polem polecenia i zdaniem „Check my references”'),
  fig('office-samurai-home-top', 'Office Samurai — postać marki zamiast zdjęcia ludzi', 'Office Samurai: szary pierwszy ekran z figurami 3D samuraja i robota w pomarańczowym kimonie'),
  fig('digital-teammates-home-f2', 'Digital Teammates — liczby i opinia z nazwiskiem', 'Digital Teammates: trzy liczby na białym i granatowy blok z opinią, zdjęciem i nazwiskiem'),
  fig('digital-teammates-home-top', 'Digital Teammates — zdjęcie biura w hero: pułapka', 'Digital Teammates: pierwszy ekran z dużym zdjęciem ludzi przy biurkach'),
  fig('sagiton-home-f3', 'Sagiton — zespół przy pracy i znaki klientów', 'Sagiton: sekcja „Jak działamy?” ze zdjęciem zespołu i rzędem znaków klientów')],
 [('Ktoś się pod tym podpisuje', [
   'Lindy pisze w pierwszej osobie („I handle the work that never stops”) i zaraz pod przyciskiem odsyła do referencji. Digital Teammates daje opinię z nazwiskiem, stanowiskiem i zdjęciem.',
   'Obietnica ma nadawcę. Dowód ma twarz albo nazwisko.',
   'Odbiorca ocenia osobę, nie interfejs. Przy usłudze to trafniejszy przedmiot oceny.',
   'Linia „Dawid Skibicki, założyciel REVAGY” (dziś 14 px szarym pismem) staje się blokiem: zdjęcie, jedno zdanie, podpis. Sekcja „kto to robi” na podstronach ofertowych; zdjęcie przy pasku końcowym („rozmawiasz ze mną, 25 minut”).',
   'Potrzebne jest zdjęcie, i to dobre. Firma jednoosobowa staje się widoczna; dla toru Enterprise może to działać w obie strony — to Twoja decyzja, nie graficzna.']),
  ('Zdjęcie własne albo żadne', [
   'Digital Teammates i Sagiton pokazują biura i ludzi przy laptopach; zdjęcia mają charakter stockowy i nie mówią, kim są ci ludzie.',
   'Zdjęcie bez podpisu i bez związku z treścią jest dekoracją.',
   'Nie buduje zaufania, a zajmuje najcenniejsze miejsce na ekranie.',
   'Tylko zdjęcia własne i zawsze z podpisem: kto, w jakiej roli. Jedna obróbka dla wszystkich: czarno-białe na <code>--mist</code> albo w ciemnej scenie z poświatą, żeby zdjęcie weszło w paletę.',
   'Jedna sesja zdjęciowa i dyscyplina: żadnych zdjęć z banku.']),
  ('Postać zamiast twarzy', [
   'Office Samurai ma samuraja i robota w 3D oraz rysunki tuszem; pomarańcz i szarość są blisko palety REVAGY.',
   'Postać marki daje rozpoznawalność bez pokazywania ludzi.',
   'Zapamiętuje się obraz, nie ofertę; charakter niesie ilustracja.',
   'Możliwe, ale obce dzisiejszemu tonowi REVAGY (rzeczowy, bez metafor). Wymieniam, bo to jedyna polskojęzyczna strona w próbie, której nie da się pomylić z inną.',
   'Postać trzeba wymyślić, narysować i utrzymywać; łatwo o infantylność w rozmowie z działem finansów albo IT.'])],
 toks(tok('Tytuł', 'lindy', 'h1', 'fontFamily', 'Szeryf o grubości <code>' + (css('lindy', 'h1', 'fontWeight') or '—') + '</code>, ' + (css('lindy', 'h1', 'fontSize') or '—') + ': ciepło niesie krój. REVAGY zostaje przy Onest (D-021).'),
      bg('lindy', 'Kremowe; blisko <code>--mist</code> REVAGY.'),
      cta('office-samurai', 'Zmierzony pomarańcz przycisku „Kontakt”; REVAGY: <code>#ff5b14</code>.'),
      tok('Tytuł', 'office-samurai', 'h1', 'fontFamily', 'Szeroki krój tytułów; ' + (css('office-samurai', 'h1', 'fontSize') or '—') + '.'),
      P('Zdjęcie', 'czarno-białe, tło <code>--mist</code>, zaokrąglenie <code>--r-lg</code>', 'Jedna obróbka dla wszystkich zdjęć.'),
      P('Podpis', 'Onest 680 20 px + Instrument Sans 15 px <code>--ink-2</code>', 'Istniejące style <code>.h4</code> i tekst pomocniczy.')),
 ['Zdjęcie założyciela: sesja, kilka ujęć, zgoda na użycie.', 'Decyzja, czy strona ma mówić „ja” czy „my”.', 'Z czasem opinie z nazwiskiem (D-034).'],
 ['Brak ludzi i podpisu (poz. 11).', 'Dowody z nazwiskiem (poz. 22).', 'Częściowo pierwszy ekran (poz. 5).'],
 ['Zależy od jednej osoby i jednego zdjęcia.', 'Nie rozwiązuje czytelności tekstu, tabel ani formy dowodu — potrzebuje B albo C obok.', 'Zmienia ton marki z „produkt” na „doradca”; to decyzja o pozycjonowaniu, nie o kolorze.'],
 sketch('D')))

# porównanie
sec.append('<section id="porownanie"><h2>5. Porównanie kierunków</h2>' + table(
 ['Wymiar', 'A — Scena wszędzie', 'B — Dowód na papierze', 'C — Schemat przepływu', 'D — Twarz i podpis'], [
 ['Główny obraz podstrony', 'ciemna scena z kadrem filmu', 'liczba i dokument', 'schemat z węzłów-kategorii', 'zdjęcie i podpis'],
 ['Typografia', 'bez zmian; biały tytuł w scenie', 'liczby jako nagłówki; tekst do lewej', 'więcej etykiet maszynowych', 'bez zmian; blok podpisu'],
 ['Kolor', 'więcej <code>--night</code> i poświaty', 'więcej <code>--paper</code> i <code>--mist</code>; akcent jako zakreślenie', 'akcent = węzeł kontroli; zieleń = zapisane', 'czerń i biel zdjęć + akcent'],
 ['Siatka', 'sceny od krawędzi do krawędzi', 'kolumna redakcyjna do lewej', 'schemat na całą szerokość treści', 'dwie kolumny: tekst i portret'],
 ['Gęstość', 'niska', 'wysoka, czytelna', 'średnia', 'niska'],
 ['Zależność od materiałów', 'żadna (filmy są)', 'liczby i zgody', 'rysunki schematów', 'zdjęcie i zgody'],
 ['Odróżnia od próby', 'słabo', 'dobrze: wśród firm usługowych robi to tylko Flobotics', 'wśród polskojęzycznych firm usługowych dobrze (żadna), na świecie słabo', 'dobrze, jeśli zdjęcia są własne'],
 ['Ciągłość ze stroną główną', 'najwyższa', 'przez kroje, akcent, liczby i pasek końcowy', 'wysoka: schemat jest już w hero', 'przez kroje i akcent'],
 ['Nakład na pierwszą podstronę ' + st('e'), 'mały', 'średni', 'średni', 'mały po sesji zdjęciowej'],
 ['Pozycje z listy zmian', '5, częściowo 6', '5–9', '5, 8, 14, 21', '11, 22, częściowo 5'],
 ]) + '<p class="meta">Wiersz „nakład” to moja ocena, nie pomiar. Żaden kierunek nie zmienia strony głównej.</p></section>')

# wybór
sec.append('''<section class="choice" id="wybor"><h2>6. Twój wybór</h2>
<p>Wybierz kierunek literą albo złóż własny z elementów. Przykłady odpowiedzi:</p>
<ul>
<li><code>B</code> — podstrony jako dowód na papierze.</li>
<li><code>B + C</code> — papier i liczby jako baza, schemat jako główny obraz każdej podstrony.</li>
<li><code>A na pierwszym ekranie, B niżej</code> — scena u góry, rzeczowa treść pod spodem.</li>
<li><code>C, a D później, gdy będzie zdjęcie</code>.</li>
<li><code>Typografia liczb z B, schemat z C, bez twarzy</code>.</li>
</ul>
<p><b>Moja rekomendacja</b> <span class="status p">Propozycja</span>: <b>B + C</b>. Papier, liczby i tekst do lewej rozwiązują najwięcej pozycji z audytu (5–9), a schemat z węzłów-kategorii daje podstronom własny obraz, który już istnieje w hero i zamienia D-033 w zasadę rysunku. A zostawiłbym dla paska końcowego i filmu, czyli tam, gdzie scena już jest. D dołożyłbym, gdy będzie zdjęcie. To propozycja — nie jest zatwierdzona, dopóki jej nie wybierzesz.</p>
<p>Po Twoim wyborze przygotuję pogłębione studium jednego kierunku: więcej ekranów z wybranych stron, zasady, tokeny i szkic jednej podstrony. Dopiero potem plan zmian do Twojej akceptacji. Kodu strony nie ruszam bez Twojej zgody.</p>
</section>''')

# źródła
src_rows = []
for sid in used():
    s = SCREENS[sid]
    vp = s.get('viewport_css_px') or {}
    lim = '; '.join(s.get('limitations') or []) or '—'
    src_rows.append([f'<code>{esc(sid)}</code>', esc(s.get('site', '')), f'<a href="{esc(s["url"])}" target="_blank" rel="noopener">{esc(s["url"])}</a>', esc(s.get('page_type', '')) + ', ' + esc(s.get('frame', '')), f"{vp.get('width','?')}×{vp.get('height','?')}", esc((s.get('captured_at') or '')[:16].replace('T', ' ')), f'<a href="moodboard-evidence/{esc(s["screenshot"])}">{esc(s["screenshot"])}</a>', esc(lim)])
total = len(SCREENS)
sec.append('<section id="zrodla"><h2>7. Źródła i ograniczenia</h2>'
 f'<p>W moodboardzie użyłem {len(src_rows)} z {total} zrzutów zapisanych w <a href="moodboard-evidence/">moodboard-evidence/</a>. Obrazy w tym pliku są pomniejszonymi kopiami; kliknięcie otwiera powiększenie, a odnośnik „oryginał” prowadzi do pliku źródłowego.</p>'
 + table(['ID', 'Strona', 'Adres', 'Typ i kadr', 'Okno (px)', 'Kiedy (UTC)', 'Plik', 'Ograniczenia (zapis z przechwytywania, po angielsku)'], src_rows, cls='wide')
 + '<ul>'
 '<li>Jeden przebieg, jedna przeglądarka (Chromium bez okna), jedna szerokość komputera i jedna telefonu. Kadry „f2” i „f3” to niższe pozycje tej samej strony głównej, nie osobne typy stron.</li>'
 '<li>Zrzut nie dowodzi ruchu, dostępności ani skuteczności sprzedażowej stron referencyjnych. Tam, gdzie piszę o efekcie, jest to interpretacja.</li>'
 '<li>Podstrony konkurencji obejrzałem po jednej na stronę; stanów najechania, menu i formularzy nie badałem.</li>'
 '<li>Dobór próby jest mój: 7 firm usługowych z wyszukiwania (6 polskojęzycznych), 5 narzędzi do automatyzacji, 4 marki B2B o wyrazistej identyfikacji. Nie jest to pełny przegląd rynku.</li>'
 '<li>Szkice w części 4 to moje propozycje narysowane w CSS z tokenów REVAGY. Nie są projektem ani zrzutem istniejącej strony.</li>'
 '<li>Styl tego dokumentu (kroje systemowe, szarości) jest roboczy i nie jest propozycją dla REVAGY.</li>'
 '</ul></section>')

toc = [('rama', 'Rama'), ('dzis', 'REVAGY dziś'), ('proba', 'Próba'), ('kierunek-a', 'A · Scena'), ('kierunek-b', 'B · Dowód'), ('kierunek-c', 'C · Schemat'), ('kierunek-d', 'D · Twarz'), ('porownanie', 'Porównanie'), ('wybor', 'Wybór'), ('zrodla', 'Źródła')]
html_out = (T.replace('<!--DATE-->', '22.11.2026')
  .replace('<!--LEDE-->', f'Cztery kierunki rozwoju podstron i zasobów marki, pokazane na {n_ok} działających stronach: firm usługowych od automatyzacji, narzędzi do automatyzacji i sąsiednich marek B2B. Strona główna zostaje bez zmian. Dokument kończy się pytaniem o Twój wybór.')
  .replace('<!--TOC-->', ''.join(f'<li><a href="#{i}">{t}</a></li>' for i, t in toc))
  .replace('<!--MAIN-->', '\n'.join(sec))
  .replace('<!--FOOTER-->', 'REVAGY · karta T-026 · moodboard v1, etap porównania · zrzuty stron trzecich służą wyłącznie analizie i nie są materiałem do użycia na stronie.'))
out = os.path.join(ROOT, 'moodboard.html')
open(out, 'w').write(html_out)
print('zapisano', out, round(os.path.getsize(out) / 1e6, 2), 'MB; zrzuty użyte:', len(src_rows), 'z', total)
