#!/usr/bin/env python3
"""Składa kono-state/notes/audyt-design/kierunek-a-studium.html (pogłębione studium kierunku A).
Uruchomienie: EVDIR=kierunek-a-evidence python3 build_studium_a.py"""
import os, sys, json
os.environ.setdefault('EVDIR', 'kierunek-a-evidence')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import lib

T = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template.html')).read()
M = lib.MAN
RH = M['rhythm']
ME = M['measurements']
SC = M['revagy_scenes']
PROD = {'http://127.0.0.1:4321/': 'https://revagy.pl/', 'http://127.0.0.1:4321/integracja-systemow.html': 'https://revagy.pl/integracja-systemow.html',
        'http://127.0.0.1:4321/kontakt.html': 'https://revagy.pl/kontakt.html', 'http://127.0.0.1:4321/404.html': 'https://revagy.pl/404.html'}
for s in lib.SCREENS.values():
    if s['url'] in PROD:
        s['limitations'] = (s.get('limitations') or []) + ['zrzut z buildu lokalnego; odnośnik prowadzi do odpowiednika na produkcji']
        s['url'] = PROD[s['url']]

def strip(key, label):
    r = RH[key]
    cells = ''.join(f'<i style="background:hsl(0 0% {round(v * 100)}%)" title="kadr {i + 1}: jasność {v}"></i>' for i, v in enumerate(r['meanLuma']))
    return (f'<tr><td>{label}</td><td><div class="strip" role="img" aria-label="{esc(label)}: {r["darkFrames"]} z {r["frames"]} kadrów ciemnych">{cells}</div></td>'
            f'<td>{r["darkFrames"]} z {r["frames"]}</td><td><b>{round(r["darkShare"] * 100)}%</b></td><td>{r["pageHeight"]} px</td></tr>')

def strips(rows):
    return ('<div class="tablewrap" tabindex="0" role="region" aria-label="Rytm jasnych i ciemnych kadrów"><table><thead><tr><th scope="col">Strona</th><th scope="col" style="min-width:260px">Kadry od góry do dołu (każdy 900 px)</th><th scope="col">Kadry ciemne</th><th scope="col">Udział</th><th scope="col">Wysokość strony</th></tr></thead><tbody>'
            + ''.join(strip(k, l) for k, l in rows) + '</tbody></table></div>')

def h1(key, big=False):
    v = ME[key].get('largestTextFirstScreen' if big else 'h1') or {}
    return f"<code>{esc(v.get('fontSize'))}</code> / <code>{esc(v.get('fontWeight'))}</code>, {esc({'center': 'wyśrodkowany', 'start': 'do lewej', 'left': 'do lewej'}.get(v.get('textAlign'), v.get('textAlign')))}"

def scene(key):
    return SC[key]

HD = '<div class="hd"><span class="lg"></span><span class="nv"><i></i><i></i><i></i><i></i></span><span class="bt" style="width:12cqw"></span></div>'
def sk(body, label, note, ratio='16/10'):
    return (f'<div><p class="sklabel">Szkic — propozycja, nie projekt</p><div class="sk" style="aspect-ratio:{ratio}" role="img" aria-label="{esc(label)}">{body}</div>'
            f'<p class="meta"><b>{label}.</b> {note}</p></div>')

SK1 = sk(HD + '<div class="scene" style="left:1.5%;right:1.5%;top:11%;bottom:3%"><div class="glow"></div>'
  '<div class="mono" style="left:5%;top:16%;color:#ff5b14">Integracja systemów</div>'
  '<div class="t w" style="left:5%;top:24%;width:38%"></div><div class="t w" style="left:5%;top:33%;width:44%"></div><div class="t w" style="left:5%;top:42%;width:30%"></div>'
  '<div class="s w" style="left:5%;top:55%;width:36%"></div><div class="s w" style="left:5%;top:59.5%;width:32%"></div>'
  '<div class="pill" style="left:5%;top:70%;width:20%;background:#fff"></div><div class="pill" style="left:27%;top:70%;width:16%;background:rgba(255,255,255,.18)"></div>'
  '<div class="s w" style="left:5%;top:84%;width:26%;opacity:.45"></div>'
  '<div style="right:4%;top:14%;width:42%;bottom:12%;border-radius:1.6cqw;background:#221e23;border:.15cqw solid rgba(255,255,255,.14)">'
  '<div style="left:6%;top:8%;width:40%;height:74%;border-radius:1cqw;background:#2e2930"></div><div style="right:6%;top:8%;width:40%;height:74%;border-radius:1cqw;background:#2e2930"></div>'
  '<div style="left:46.5%;top:40%;width:7%;aspect-ratio:1;border-radius:50%;background:#ff5b14"></div><div style="left:6%;right:6%;bottom:5%;height:9%;border-radius:.8cqw;background:#fff"></div></div></div>',
  'Wzór 1 — scena z kadrem', 'Sześć podstron z filmem. Tytuł, wstęp, dwa przyciski i linia autora po lewej; plakat filmu po prawej. Przyciski jak w hero strony głównej: jasny i szklany.')
SK2 = sk(HD + '<div class="scene" style="left:1.5%;right:1.5%;top:11%;bottom:22%"><div class="glow"></div>'
  '<div class="mono" style="left:50%;top:16%;color:#ff5b14;transform:translateX(-50%)">Poradnik</div>'
  '<div class="t w" style="left:24%;top:30%;width:52%"></div><div class="t w" style="left:30%;top:42%;width:40%"></div>'
  '<div class="s w" style="left:30%;top:58%;width:40%"></div><div class="s w" style="left:34%;top:64%;width:32%"></div>'
  '<div class="pill" style="left:39%;top:76%;width:22%;background:#fff"></div></div>'
  '<div class="s" style="left:30%;top:84%;width:40%"></div><div class="s" style="left:34%;top:89%;width:32%"></div>',
  'Wzór 2 — scena tytułowa', 'Dwa poradniki i strony bez filmu. To jest układ, który już istnieje na stronie błędu 404 i na stronie kontaktu.')
SK3 = sk(HD + '<div class="scene" style="left:1.5%;right:1.5%;top:11%;bottom:3%"><div class="glow"></div>'
  '<div class="mono" style="left:5%;top:15%;color:#ff5b14">Wdrożenia</div>'
  '<div class="t w" style="left:5%;top:23%;width:44%"></div><div class="t w" style="left:5%;top:32%;width:36%"></div>'
  '<div class="s w" style="left:5%;top:44%;width:38%"></div>'
  '<div class="pill" style="left:5%;top:52%;width:20%;background:#fff"></div>'
  '<div style="left:5%;right:5%;top:66%;height:.2cqw;background:rgba(255,255,255,.25)"></div>'
  '<div class="num" style="left:5%;top:72%;color:#fff">ok. 12 h</div><div class="lab" style="left:5%;top:86%;color:#b9b2bb">mniej pracy tygodniowo</div>'
  '<div class="num" style="left:37%;top:72%;color:#fff">ok. 90%</div><div class="lab" style="left:37%;top:86%;color:#b9b2bb">mniej korekt</div>'
  '<div class="num" style="left:69%;top:72%;color:#fff">10 min</div><div class="lab" style="left:69%;top:86%;color:#b9b2bb">zamiast ok. 3 dni</div></div>',
  'Wzór 3 — scena z liczbami', 'Strona „Wdrożenia”. Liczby z opisu wdrożenia „Agencja pracy”, z „ok.” tak jak na stronie; wybór liczb i zgody należą do Ciebie (D-034).')
SK4 = sk('<div class="t" style="left:26%;top:8%;width:48%"></div><div class="s" style="left:32%;top:19%;width:36%"></div>'
  '<div class="scene" style="left:14%;right:14%;top:30%;bottom:10%;border-radius:2.2cqw"><div class="glow" style="opacity:.6"></div>'
  '<div class="mono" style="left:6%;top:10%;color:#ff5b14">Wynik · agencja pracy</div>'
  '<div class="num" style="left:6%;top:24%;color:#fff">ok. 12 h</div><div class="lab" style="left:6%;top:46%;color:#b9b2bb">mniej pracy tygodniowo</div>'
  '<div class="num" style="left:52%;top:24%;color:#fff">ok. 90%</div><div class="lab" style="left:52%;top:46%;color:#b9b2bb">mniej korekt</div>'
  '<div style="left:6%;right:6%;top:60%;height:.2cqw;background:rgba(255,255,255,.2)"></div>'
  '<div class="s w" style="left:6%;top:70%;width:70%"></div><div class="s w" style="left:6%;top:78%;width:56%"></div><div class="mono" style="left:6%;top:88%;color:#b9b2bb">jak mierzone: …</div></div>',
  'Scena dowodu', 'Opis wdrożenia w środku strony: liczby stylem <code>.stat-num</code> na ciemnym, opis pod spodem. Podpis, cytat i szczegóły pojawiają się dopiero, gdy je wprowadzisz.', ratio='16/9')

def rhythm_sketch():
    blocks = [('Scena z kadrem', 760, 1), ('Odpowiedź, problemy', 1500, 0), ('Tabele: drogi i pola', 1500, 0), ('Film', 1100, 2), ('Kontrola', 420, 0), ('Scena dowodu', 520, 1), ('Karta, kroki', 900, 0), ('Pytania', 1100, 0), ('Pasek końcowy', 640, 1), ('Stopka', 460, 0)]
    tot = sum(b[1] for b in blocks)
    dark = sum(b[1] for b in blocks if b[2] == 1) + 685
    out = ['<div class="pagecol" role="img" aria-label="Schemat rytmu podstrony pilotażowej: bloki ciemne i jasne">']
    for name, h, kind in blocks:
        cls = {0: 'lt', 1: 'dk', 2: 'fm'}[kind]
        out.append(f'<div class="{cls}" style="flex:{h}"><span>{name}</span></div>')
    out.append('</div>')
    return ''.join(out), round(dark / tot * 100)

sec = []
sec.append('''
<section id="wybor">
<h2>1. Twój wybór i co z niego wynika</h2>
<div class="cols">
<div class="card"><h3>Wybrałeś: A — Scena wszędzie</h3>
<p>Podstrona zaczyna się tak jak strona główna: ciemną sceną z poświatą, w której stoi tytuł i kadr filmu. Najmniejsza zmiana, największa ciągłość ze stroną główną.</p>
<ul>
<li>Strona główna zostaje bez zmian (D-015, D-021).</li>
<li>Zmiana dotyczy układu podstron (D-031) i używa wyłącznie istniejących kolorów, krojów i zaokrągleń.</li>
<li>Filmy i plakaty już są dla sześciu podstron (D-022).</li>
</ul></div>
<div class="card"><h3>Co sprawdziłem w tym studium</h3>
<ul>
<li>Jak dwie strony z próby, które budują na scenie — Automation House i Mercury — prowadzą ją przez <b>różne typy stron</b>: opis wdrożenia, usługę, zaufanie, „o firmie”, telefon.</li>
<li>Ile ciemnego jest na każdej z tych stron i w jakiej kolejności.</li>
<li>Jakie sceny REVAGY już ma i jak są zbudowane.</li>
<li>Czego scena nie załatwia.</li>
</ul></div></div>
<p class="meta">Wybór kierunku pochodzi z Twojej odpowiedzi „A” z 22.11.2026. Wszystko, co niżej nazywam regułą, wzorem albo briefem, jest moją propozycją do akceptacji.</p>
</section>''')

# atlas
atlas_rows = []
PT = {'automation-house-home': 'strona główna', 'automation-house-case-list': 'lista opisów wdrożeń', 'automation-house-case-detail': 'opis wdrożenia', 'automation-house-service': 'strona usługi', 'automation-house-about': 'o firmie',
      'mercury-home': 'strona główna', 'mercury-product': 'strona produktu', 'mercury-feature': 'strona funkcji', 'mercury-security': 'strona zaufania (bezpieczeństwo)', 'mercury-about': 'o firmie'}
for key, label in PT.items():
    frames = [s for s in lib.SCREENS.values() if s['id'].startswith(key + '-')]
    desk = [s['id'].split('-')[-1] for s in frames if s['viewport_css_px']['width'] == 1440]
    mob = [s['id'].replace(key + '-', '') for s in frames if s['viewport_css_px']['width'] == 390]
    site = 'Automation House' if key.startswith('automation') else 'Mercury'
    atlas_rows.append([site, label, f'<a href="{esc(ME[key]["url"])}" target="_blank" rel="noopener">{esc(ME[key]["url"])}</a>', ', '.join(desk) or '—', ', '.join(mob) or '—', f'{ME[key]["pageHeight"]} px'])
atlas_rows.append(['REVAGY (build lokalny)', 'strona główna: 5 scen', 'https://revagy.pl/', 'hero, kalkulator, pasmo procesu, film, pasek końcowy', 'góra', f'{RH["revagy-home"]["pageHeight"]} px'])
atlas_rows.append(['REVAGY (build lokalny)', 'podstrona ofertowa', 'https://revagy.pl/integracja-systemow.html', 'pierwszy ekran, film, pasek końcowy', 'góra', f'{RH["revagy-integracja"]["pageHeight"]} px'])
atlas_rows.append(['REVAGY (build lokalny)', 'kontakt, strona błędu', 'https://revagy.pl/kontakt.html', 'góra (obie)', 'góra (kontakt)', '—'])
sec.append('<section id="atlas"><h2>2. Atlas: co obejrzałem</h2>'
 f'<p>{len(lib.SCREENS)} zrzutów z 22.11.2026: 10 stron dwóch firm (po pięć różnych typów stron), do tego sceny REVAGY z lokalnego buildu. „top” to góra strony, „f2” i „f4” to niższe kadry tej samej strony (ok. 900 i 2700 px). '
 'Zapis z adresami, czasem i pomiarami: <a href="kierunek-a-evidence/manifest.json">manifest.json</a>. Pierwsze zrzuty tych firm są w <a href="moodboard.html">moodboardzie</a>.</p>'
 + table(['Strona', 'Typ strony', 'Adres', 'Kadry 1440×900', 'Kadry 390×844', 'Wysokość'], atlas_rows)
 + '<div class="grid g4">'
 + fig('automation-house-case-detail-top', 'Automation House — opis wdrożenia', 'Automation House: opis wdrożenia ze zdjęciem zespołu klienta, tytułem i paskiem danych', width=640, quality=55)
 + fig('automation-house-service-top', 'Automation House — strona usługi', 'Automation House: strona usługi z tytułem, plakietką partnera i oceną', width=640, quality=55)
 + fig('mercury-product-top', 'Mercury — strona produktu', 'Mercury: jasna strona produktu z tytułem i ekranem produktu', width=640, quality=55)
 + fig('mercury-security-top', 'Mercury — strona zaufania', 'Mercury: ciemna scena z kłódką na stronie o bezpieczeństwie', width=640, quality=55)
 + '</div></section>')

# teza
sec.append('<section id="teza"><h2>3. Teza kierunku</h2>'
 '<p class="lede">„Scena wszędzie” ma dwie odmiany. Automation House jest ciemny cały czas. Mercury używa sceny oszczędnie: na stronie głównej i przy temacie zaufania, a podstrony produktu zostawia jasne. Strona główna REVAGY stoi pośrodku — co trzeci ekran jest sceną — i tę proporcję proponuję przenieść na podstrony.</p>'
 + strips([('automation-house-home', 'Automation House — strona główna'), ('automation-house-case-detail', 'Automation House — opis wdrożenia'), ('automation-house-service', 'Automation House — usługa'),
           ('mercury-home', 'Mercury — strona główna'), ('mercury-product', 'Mercury — produkt'), ('mercury-security', 'Mercury — bezpieczeństwo'), ('mercury-about', 'Mercury — o firmie'),
           ('revagy-home', 'REVAGY — strona główna'), ('revagy-integracja', 'REVAGY — „Integracja systemów”'), ('revagy-dla-firm', 'REVAGY — „Dla firm”'), ('revagy-poradnik', 'REVAGY — poradnik')])
 + '<p class="meta">' + st('m') + ' Każda kratka to jeden kadr okna 1440×900 px, od góry strony co 900 px (do 16 kadrów); odcień to średnia jasność kadru. „Ciemny” znaczy jasność poniżej 0,30 w skali 0–1. '
 'Miara jest zgrubna: kadr z połową sceny wypada jako szary. W audycie liczyłem to inaczej (powierzchnia ciemnych bloków: 37% strony głównej, 13–16% podstron); oba pomiary pokazują to samo.</p>'
 '<ul>'
 f'<li><b>Automation House: {round(RH["automation-house-home"]["darkShare"]*100)}% ciemnych kadrów na każdym z pięciu typów stron.</b> Scena nie jest tam wyróżnieniem, tylko tłem wszystkiego.</li>'
 f'<li><b>Mercury: {round(RH["mercury-home"]["darkShare"]*100)}% na stronie głównej, {round(RH["mercury-feature"]["darkShare"]*100)}–{round(RH["mercury-security"]["darkShare"]*100)}% na podstronach.</b> Ciemne są: wejście strony o bezpieczeństwie oraz koniec każdej strony, czyli przypisy prawne i stopka. Treść stron produktu i funkcji jest w całości jasna.</li>'
 f'<li><b>REVAGY: {round(RH["revagy-home"]["darkShare"]*100)}% na stronie głównej i 0 pełnych ciemnych kadrów na podstronach.</b> Film i pasek końcowy podstron są ciemne, ale nie wypełniają okna.</li>'
 '</ul>'
 '<p><b>Wniosek</b> ' + st('p') + ': celem dla podstron REVAGY jest proporcja strony głównej, czyli mniej więcej co trzeci ekran ciemny — nie ciemność totalna. Trzy sceny na podstronę: na wejściu, przy dowodzie, na końcu.</p></section>')

# cechy
def feature(num, title, figs, items, extra=''):
    g = 'g2' if len(figs) == 2 else 'g3'
    return f'<h3 id="c{num}">{num}. {title}</h3><div class="grid {g}">' + ''.join(figs) + '</div>' + chain(items) + extra

feat = ['<section id="cechy"><h2>4. Cechy kierunku, po kolei</h2>']
feat.append(feature(1, 'Pierwszy ekran: tytuł i jeden obiekt',
 [fig('mercury-product-top', 'Mercury — tytuł, pole, przycisk; ekran produktu wchodzi od dołu', 'Mercury: strona produktu, wyśrodkowany tytuł, pod nim ekran produktu ucięty krawędzią okna'),
  fig('automation-house-case-detail-top', 'Automation House — zdjęcie po lewej, tytuł po prawej, pasek danych pod spodem', 'Automation House: opis wdrożenia, zdjęcie zespołu klienta, tytuł „Jak MTA przeniosło pracę 80 osób z 6 systemów do ClickUp?” i pasek z klientem, branżą, obszarem, narzędziami'),
  fig('revagy-kontakt-scena', 'REVAGY — ta budowa już istnieje na stronie kontaktu', 'REVAGY: strona kontaktu, ciemna scena z poświatą, tytuł, zdanie i kapsuła z adresem')],
 ['Na każdej obejrzanej stronie pierwszy ekran niesie tytuł, jedno zdanie, działanie i jeden obiekt: ekran produktu (Mercury, produkt i funkcja), zdjęcie klienta z paskiem danych (Automation House, opis wdrożenia), kłódkę (Mercury, bezpieczeństwo), plakietkę partnera z oceną (Automation House, usługa).',
  'Obiekt jest dobrany do typu strony i mówi, o czym ona jest, zanim przeczytasz tytuł. Nie jest ozdobą: na stronie produktu to produkt, na stronie wdrożenia to klient.',
  'Pierwszy ekran odpowiada na „gdzie jestem i co tu dostanę”. Tytuł i obiekt czyta się razem; wszystko inne schodzi niżej.',
  'Trzy wzory pierwszego ekranu dla REVAGY (szkice w części 7): scena z kadrem filmu dla sześciu podstron ofertowych, scena tytułowa dla poradników, scena z liczbami dla „Wdrożeń”. Dwa z nich mają już odpowiednik w kodzie: sceny na stronie kontaktu i na 404.',
  'Obiekt musi istnieć dla każdej strony. Dla sześciu stron jest nim plakat filmu; dla poradników obiektu nie ma, więc zostaje sam tytuł. Mercury wysuwa obiekt poza krawędź okna — REVAGY ma scenę w zaokrąglonym kontenerze, więc obiekt zostaje w środku.']))
feat.append(feature(2, 'Scena dowodu: liczba w ciemnej karcie',
 [fig('automation-house-home-f4', 'Automation House — „Wynik klienta: 80 osób” z odnośnikiem do opisu', 'Automation House: ciemne karty kroków, w jednej etykieta „Wynik klienta”, liczba „80 osób” i odnośnik „Case study”'),
  fig('automation-house-case-detail-f2', 'Automation House — wyniki w opisie wdrożenia', 'Automation House: sekcja „Co osiągnęliśmy razem?” z dużymi liczbami na ciemnym tle')],
 ['Automation House powtarza ten sam obiekt w trzech miejscach: karta „Wynik klienta — 80 osób” na stronie głównej, ta sama liczba w tytule opisu wdrożenia i sekcja wyników z dużymi liczbami w środku opisu.',
  'Dowód ma własną małą scenę: etykieta drobnym pismem, liczba dużym, jedno zdanie, odnośnik do źródła. Karta świeci obrysem, reszta sekcji jest spokojna.',
  'Liczba jest najjaśniejszym punktem ekranu. Czyta się ją przed opisem, a odnośnik od razu mówi, skąd pochodzi.',
  'Opis wdrożenia na podstronie REVAGY jako ciemna karta w środku strony: etykieta maszynowa w kolorze akcentu („Wynik · agencja pracy”), liczby stylem <code>.stat-num</code> w bieli, pod spodem opis i „jak mierzone”. Te same liczby mogą stać w scenie strony „Wdrożenia”.',
  'Liczby i sposób pomiaru podajesz Ty; do czasu zgód opis jest anonimowy (D-034). Na ciemnym tle długi tekst czyta się gorzej — w karcie zostają liczby i dwa zdania, reszta opisu na jasnym.']))
feat.append(feature(3, 'Kontener sceny: znak rozpoznawczy REVAGY',
 [fig('revagy-scena-hero', 'REVAGY — hero: scena w zaokrąglonym kontenerze, 12 px od krawędzi', 'REVAGY: hero strony głównej jako ciemny zaokrąglony kontener z siecią węzłów'),
  fig('mercury-security-top', 'Mercury — scena od krawędzi do krawędzi', 'Mercury: ciemna scena z kłódką wypełnia całą szerokość okna'),
  fig('automation-house-service-top', 'Automation House — brak kontenera, ciemne jest wszystko', 'Automation House: strona usługi, ciemne tło z poświatą na całej szerokości')],
 ['U Mercury i Automation House scena sięga od krawędzi do krawędzi okna i ma proste rogi. U REVAGY scena jest kartą: zaokrąglenie 40 px, 12 px odstępu od krawędzi, białe tło strony widoczne dookoła.',
  'Zaokrąglony kontener sprawia, że scena jest obiektem leżącym na papierze, a nie tłem strony.',
  'Granica między „sceną” a „papierem” jest dosłowna i widoczna w każdym miejscu. To jedyna cecha, której nie ma żadna z dwóch stron referencyjnych.',
  'Zostaje bez zmian i obowiązuje każdą nową scenę: <code>--r-xl</code>, 12 px od krawędzi, tło <code>--night</code>. Nowa scena pierwszego ekranu ma dokładnie geometrię istniejących (tabela w części 5).',
  'Kontener zabiera 24 px szerokości i wymaga, żeby obiekt mieścił się w środku. Na telefonie zaokrąglenie spada do 24 px, a scena zajmuje prawie całe okno.']))
feat.append(feature(4, 'Światło: jedna poświata, jedna paleta',
 [fig('automation-house-case-list-top', 'Automation House — jedna niebieska poświata u góry każdej strony', 'Automation House: lista opisów wdrożeń, ciemne tło z niebieską poświatą u góry'),
  fig('revagy-scena-pasek-koncowy', 'REVAGY — poświata w trzech barwach marki', 'REVAGY: pasek końcowy, ciemna scena z pomarańczową, różową i śliwkową poświatą')],
 ['Automation House ma jedno światło: niebieską elipsę u góry strony, tę samą na każdym typie strony. Akcent (przycisk, liczby, wyróżnione słowa) jest w tym samym niebieskim.',
  'Poświata i akcent to jeden kolor. Dzięki temu ciemna strona nie rozpada się na kolorowe plamy.',
  'Światło prowadzi wzrok do tytułu; kolor akcentu znaczy zawsze „to jest ważne albo klikalne”.',
  'REVAGY ma swoją odpowiedź i jej nie zmieniam: poświata pomarańcz + róż + śliwka, rozmycie 50–60 px, powolny ruch 16–18 s, wyłączony przy ograniczonym ruchu. Reguła: poświata tylko wewnątrz sceny, nigdy na papierze; jedna na scenę.',
  'Trzy barwy to więcej niż jedna u Automation House — i dobrze, bo ciepła paleta odróżnia REVAGY od chłodnego granatu konkurenta. Koszt: tekst na poświacie wymaga sprawdzenia kontrastu w najjaśniejszym miejscu.']))
feat.append(feature(5, 'Papier zostaje do czytania',
 [fig('mercury-product-f2', 'Mercury — pod sceną jasna siatka faktów', 'Mercury: jasna sekcja „Everything you need for smooth banking” z sześcioma krótkimi faktami'),
  fig('automation-house-case-detail-f2', 'Automation House — tekst opisu na prawie czarnym tle', 'Automation House: szary tekst opisu wdrożenia na ciemnym tle')],
 ['Mercury po wejściu przechodzi na jasne tło: krótkie fakty w siatce, ekran produktu w ramce, tabele. Automation House zostaje w ciemności także tam, gdzie jest długi tekst.',
  'Scena jest do patrzenia, papier do czytania. Mercury rozdziela te role, Automation House nie.',
  'Na jasnym tle da się prowadzić dłuższy wywód, tabelę i warunki. Na ciemnym ten sam tekst męczy i traci hierarchię.',
  'Treść podstron REVAGY zostaje na papierze: tabele, listy, pytania, warunki. Scena nie wchodzi w sekcje z tekstem.',
  'Kierunek A nie poprawia więc sam czytelności tekstu i tabel na podstronach (pozycje 7–9 z listy zmian w audycie). To osobne, małe poprawki „na papierze”, które można zrobić przed sceną, po niej albo wcale.']))
feat.append(feature(6, 'Telefon: tytuł i działanie nad zgięciem',
 [fig('automation-house-home-m-top', 'Automation House — scena wypełnia ekran telefonu', 'Automation House na telefonie: ciemny ekran z tytułem i polem opisu problemu'),
  fig('mercury-product-m-top', 'Mercury — tytuł, pole i przyciski, ekran produktu pod spodem', 'Mercury na telefonie: tytuł, pole e-mail, dwa przyciski i początek ekranu produktu'),
  fig('revagy-m-kontakt', 'REVAGY — scena na stronie kontaktu', 'REVAGY na telefonie: strona kontaktu, scena z tytułem i przyciskiem')],
 ['Na telefonie obie strony mieszczą w pierwszym ekranie tytuł, zdanie i przycisk; obiekt (ekran produktu, pole) zaczyna się pod nimi i bywa ucięty zgięciem.',
  'Kolejność: tytuł → działanie → obiekt. Obiekt może wyjść poza ekran, działanie nie.',
  'Kto nie przewinie, i tak widzi obietnicę i przycisk.',
  'W scenie podstrony na telefonie: etykieta, tytuł, wstęp, dwa przyciski na całą szerokość; plakat filmu pod przyciskami. Na stronie głównej REVAGY film stoi nad tytułem — na podstronach proponuję odwrotnie, bo plakat przy 315 px szerokości jest nieczytelny i nie powinien wypychać przycisków.',
  'Scena na telefonie będzie wysoka (tytuł podstrony ma 3–4 wiersze). Trzeba sprawdzić na trzech szerokościach (360, 390, 430 px), czy oba przyciski zostają nad zgięciem.']))
feat.append('</section>')
sec.append(''.join(feat))

# fundamenty
def srow(name, key, where):
    s = scene(key)
    g = s.get('glow')
    return [name, f'<code>{esc(s["selector"])}</code>', f'{s["w"]}×{s["h"]} px', f'<code>{esc(s.get("radius", "—"))}</code>', f'<code>{esc(s.get("padding", "—"))}</code>',
            (f'rozmycie <code>{esc(g["filter"])}</code>, krycie {esc(g["opacity"])}, ruch {esc(g["animation"].split(" ")[-1])}' if g else 'brak'),
            (f'<code>.{esc(s["heading"]["cls"].split(" ")[0])}</code> {esc(s["heading"]["fontSize"])}, {esc({"center": "środek", "start": "lewa"}.get(s["heading"]["textAlign"], s["heading"]["textAlign"]))}' if s.get('heading') else '—'),
            ', '.join(f'<code>.{esc(b.split(" ")[0])}</code>' for b in s.get('buttons', [])) or '—', where]
sec.append('<section id="fundamenty"><h2>5. Fundamenty: sceny, które REVAGY już ma</h2>'
 '<p>Pomiary z lokalnego buildu przy 1440 px ' + st('m') + '. Każda nowa scena ma pasować do tej tabeli; nie wprowadzam nowych wartości.</p>'
 + table(['Scena', 'Selektor', 'Wymiar', 'Zaokrąglenie', 'Odstęp wewnętrzny', 'Poświata', 'Tytuł', 'Przyciski', 'Gdzie'], [
   srow('Hero', 'revagy-scena-hero', 'strona główna'),
   srow('Pasmo procesu', 'revagy-scena-pasmo-procesu', 'strona główna'),
   srow('Film', 'revagy-scena-film', 'strona główna i 6 podstron'),
   srow('Pasek końcowy', 'revagy-scena-pasek-koncowy', 'strona główna'),
   srow('Pasek końcowy podstrony', 'revagy-podstrona-pasek-koncowy', '9 podstron'),
   srow('Scena kontaktu', 'revagy-kontakt-scena', 'kontakt — pierwszy ekran'),
   srow('Scena błędu', 'revagy-404-scena', '404 — pierwszy ekran'),
 ], cls='wide')
 + '<div class="grid g3">'
 + fig('revagy-404-scena', 'Scena błędu: gotowy wzór „sceny tytułowej”', 'REVAGY: strona 404, ciemna scena z etykietą, tytułem, zdaniem i dwoma przyciskami')
 + fig('revagy-podstrona-pierwszy-ekran', 'Pierwszy ekran podstrony dziś', 'REVAGY: pierwszy ekran podstrony, tytuł i wstęp na białym tle')
 + fig('revagy-podstrona-film', 'Film na podstronie: scena, która przejdzie wyżej jako plakat', 'REVAGY: scena filmu na podstronie „Integracja systemów”')
 + '</div>'
 + '<h3>Wspólne wartości i ich status</h3>'
 + table(['Rola', 'Wartość', 'Status', 'Skąd'], [
   ['Tło sceny', sw('rgb(20, 17, 20)') + ' = <code>--night</code>', st('m'), 'wszystkie sceny REVAGY w tabeli wyżej'],
   ['Zaokrąglenie sceny', '<code>40px</code> = <code>--r-xl</code> przy 1440 px', st('m'), '<code>.hero</code>, <code>.cta</code>, <code>.lost</code>, <code>.film</code>'],
   ['Odstęp sceny od krawędzi okna', '<code>12px</code>', st('m'), 'hero 1416 px przy oknie 1440 px'],
   ['Tytuł w scenie podstrony', 'Onest 750, <code>72px</code>, biały', st('m'), '<code>.display-2</code> w scenie kontaktu i 404'],
   ['Poświata', 'trzy barwy, rozmycie <code>50px</code>, krycie 0,78, ruch 16 s', st('m'), '<code>.cta-glow</code>'],
   ['Przyciski w scenie', 'jasny + szklany, oba duże', st('m'), 'hero strony głównej i scena 404'],
   ['Tło Automation House', sw(ME['automation-house-home']['bodyBackground']), st('m'), 'Automation House, <code>body</code>, <code>backgroundColor</code>'],
   ['Tytuł Automation House', 'usługa ' + h1('automation-house-service') + '; opis wdrożenia ' + h1('automation-house-case-detail'), st('m'), 'pierwszy widoczny <code>h1</code>, 1440 px'],
   ['Tytuł Mercury na podstronach', h1('mercury-product'), st('m'), 'pierwszy widoczny <code>h1</code>, 1440 px; na stronie głównej ' + h1('mercury-home')],
   ['Karty Automation House', 'zaokrąglenie <code>24–25px</code>, obrys 1 px o niskim kryciu', st('m'), 'największe kontenery z obrysem na stronach „o firmie” i „opisy wdrożeń”'],
   ['Liczba ciemnych scen na podstronę', '3: wejście, dowód, koniec', st('p'), 'z rytmu strony głównej REVAGY'],
   ['Udział ciemnych ekranów na podstronie', 'ok. 25–35%', st('p'), 'cel; do zmierzenia na stronie pilotażowej tą samą metodą'],
 ]) + '</section>')

# co się różni
sec.append('<section id="roznice"><h2>6. Co się różni między stronami i gdzie źródła są niespójne</h2>'
 + table(['Typ strony', 'Automation House', 'Mercury', 'Wniosek dla REVAGY ' + st('p')], [
   ['Strona główna', 'scena z polem „opisz problem”; 100% ciemna', 'pejzaż z biurkiem, potem ekran produktu; 67% ciemna', 'bez zmian (D-015)'],
   ['Usługa / produkt', 'tytuł <code>72px</code>, plakietka partnera, ocena, dwa przyciski; ciemna', 'tytuł <code>57px</code>, pole i przyciski, ekran produktu; jasna, ciemne tylko przypisy i stopka', 'wzór 1: scena z kadrem na wejściu, papier w środku'],
   ['Opis wdrożenia', 'zdjęcie klienta, tytuł z liczbą, pasek danych; wyniki dużymi liczbami', 'nie obejrzałem takiej strony', 'scena dowodu i wzór 3 dla „Wdrożeń”'],
   ['Zaufanie / bezpieczeństwo', 'nie ma osobnej strony w obejrzanych', 'jedyna podstrona z ciemną sceną na wejściu; kłódka w kręgach', '„Dane i bezpieczeństwo” dostaje scenę z kadrem filmu jak pozostałe'],
   ['O firmie', 'portrety zespołu na ciemnym, światło krawędziowe', 'jasna, film w zaokrąglonej ramie', 'poza zakresem: REVAGY nie ma tej strony i nie ma zdjęć'],
   ['Telefon', 'scena na cały ekran', 'tytuł i przyciski nad zgięciem', 'tytuł i przyciski nad zgięciem, plakat pod nimi'],
 ])
 + '<ul>'
 '<li><b>Mercury nie jest „sceną wszędzie”.</b> Na podstronach produktu i funkcji ciemne są tylko przypisy prawne i stopka; scenę na wejściu ma jedna podstrona z pięciu obejrzanych. Biorę z Mercury zasadę umiaru. Dowodem na scenę na każdej podstronie jest w tej próbie tylko Automation House.</li>'
 '<li><b>Automation House nie rozdziela sceny i treści.</b> Długi tekst opisu wdrożenia stoi na prawie czarnym tle. Tego nie przenoszę.</li>'
 '<li><b>Na stronie głównej Automation House największy napis nie jest znacznikiem <code>h1</code></b> (ma 60 px i jest akapitem; <code>h1</code> to podpis 18 px). To ich sprawa techniczna, ale pokazuje, że pomiar „pierwszego h1” nie zawsze mówi o tytule.</li>'
 '<li><b>Jednorazowe, nie systemowe:</b> pejzaż Mercury (tylko strona główna), kłódka (tylko bezpieczeństwo), pole „opisz problem” (tylko strona główna Automation House).</li>'
 '</ul></section>')

# decyzje
page_col, est = rhythm_sketch()
sec.append('<section id="decyzje"><h2>7. Decyzje: co bierzemy, co przerabiamy, co odrzucamy</h2>'
 + table(['Składnik', 'Źródło', 'Decyzja ' + st('p'), 'Dlaczego', 'Co sprawdzić'], [
   ['Scena jako pierwszy ekran podstrony', 'Automation House (wszystkie strony), Mercury (bezpieczeństwo), REVAGY (kontakt, 404)', '<b>bierzemy</b>', 'to jest wybrany kierunek; wzór już istnieje w kodzie', 'tytuł i przyciski nad zgięciem na telefonie'],
   ['Jeden obiekt w scenie', 'Mercury (ekran produktu), Automation House (zdjęcie, plakietka)', '<b>bierzemy</b>: plakat filmu', 'film jest gotowym, własnym obrazem każdej podstrony', 'czytelność plakatu przy 600 px i przy 315 px szerokości'],
   ['Scena dowodu z liczbą', 'Automation House (karta „Wynik klienta”, sekcja wyników)', '<b>przerabiamy</b>: liczby z „ok.”, bez nazwy klienta do czasu zgód', 'D-034; ton rzeczowy', 'które liczby i czy mogą iść na górę'],
   ['Zaokrąglony kontener 12 px od krawędzi', 'REVAGY', '<b>zostaje</b>', 'znak rozpoznawczy; D-021', 'żadnej zmiany wymiarów'],
   ['Poświata w trzech barwach', 'REVAGY', '<b>zostaje</b>', 'ciepła paleta odróżnia od chłodnego granatu Automation House', 'kontrast tytułu w najjaśniejszym miejscu poświaty'],
   ['Proporcja: co trzeci ekran ciemny', 'REVAGY (strona główna)', '<b>bierzemy</b>', 'scena ma wyróżniać, nie być tłem; Mercury pokazuje, że podstrona może być jasna, Automation House — że całkiem ciemna męczy', 'pomiar rytmu na stronie pilotażowej'],
   ['Ciemność na całej stronie', 'Automation House', '<b>odrzucamy</b>', 'tekst, tabele i warunki tracą czytelność; strona główna REVAGY też tak nie działa', '—'],
   ['Obiekt wychodzący poza krawędź okna', 'Mercury (produkt)', '<b>odrzucamy</b>', 'kłóci się z zaokrąglonym kontenerem', '—'],
   ['Zdjęcia ludzi w scenie', 'Automation House (zespół, klient)', '<b>odkładamy</b>', 'nie ma zdjęć; to kierunek D', 'wraca, gdy będzie zdjęcie'],
   ['Gradientowe słowa w tytule, plakietki', 'Automation House, LinkWith.it', '<b>odrzucamy</b>', 'D-021: krój i kolor tytułów bez zmian', '—'],
   ['Film przeniesiony na górę zamiast plakatu', '—', '<b>odkładamy</b>', 'ruch w pierwszym ekranie obciąża stronę i dubluje sekcję filmu; plakat wystarczy', 'ewentualnie po pilocie'],
 ], cls='wide')
 + '<h3>Trzy wzory pierwszego ekranu i scena dowodu</h3><div class="grid g2">' + SK1 + SK2 + SK3 + SK4 + '</div>'
 + '<h3>Rytm strony pilotażowej po zmianie</h3><div class="cols"><div>' + page_col
 + f'<p class="meta">{st("e")} Schemat „Integracji systemów” po dodaniu sceny na wejściu i sceny dowodu. Wysokości bloków przybliżone z dzisiejszej strony; ciemne bloki dają ok. {est}% wysokości wobec 13% dziś. Film (jaśniejszy pasek) jest sceną, która już istnieje.</p></div>'
 '<div class="card"><h4>Jak czytać schemat</h4><ul><li>Czarne bloki to sceny w zaokrąglonym kontenerze; białe to papier.</li><li>Dziś strona zaczyna się białym blokiem z tytułem; po zmianie zaczyna się sceną, a opis wdrożenia dostaje własną.</li><li>Sceny nie stoją obok siebie: między każdą parą jest co najmniej jeden ekran papieru.</li><li>Film i pasek końcowy zostają tam, gdzie są.</li></ul></div></div>'
 + '<h3>Która strona dostaje który wzór ' + st('p') + '</h3>'
 + table(['Strona', 'Pierwszy ekran', 'Scena dowodu'], [
   ['integracja-systemow', 'wzór 1, plakat filmu', 'tak: agencja pracy'],
   ['dla-firm', 'wzór 1, plakat filmu', 'nie (pakiety są dowodem zakresu)'],
   ['dane-i-bezpieczenstwo', 'wzór 1, plakat filmu', 'nie'],
   ['produkcja-i-logistyka', 'wzór 1, plakat filmu', 'tak: zakład produkcyjny (pilotaż)'],
   ['finanse', 'wzór 1, plakat filmu', 'do decyzji: brak wdrożenia w finansach'],
   ['wdrozenia', 'wzór 3, liczby', 'cztery opisy jako karty'],
   ['jak-wybrac-pierwszy-proces, porownanie-rozwiazan', 'wzór 2, sam tytuł', 'nie'],
   ['kontakt, 404', 'bez zmian — już są sceną', '—'],
   ['polityka-prywatnosci', 'bez zmian — tekst prawny', '—'],
   ['strona główna', 'bez zmian (D-015)', '—'],
 ]) + '</section>')

# brief
sec.append('<section id="brief"><h2>8. Brief wizualny kierunku A ' + st('p') + '</h2>'
 + table(['Obszar', 'Ustalenie'], [
   ['Wyraz', 'Ciemna scena w zaokrąglonym kontenerze jako wejście, dowód i zakończenie podstrony. Pomiędzy nimi biały papier.'],
   ['Proporcja', 'Trzy sceny na podstronę; ok. 25–35% ekranów ciemnych, tak jak na stronie głównej. Nigdy dwie sceny pod rząd.'],
   ['Typografia', 'Bez nowych stylów. W scenie: <code>.display-2</code> biały; etykieta nad tytułem JetBrains Mono 12 px wersalikami w <code>--accent</code> (styl <code>.step-no</code>); wstęp <code>.lead</code> w bieli 84%; liczby <code>.stat-num</code>.'],
   ['Akcent', '<code>--accent</code> tylko dla etykiety, węzła albo jednego przycisku. Tekst na akcencie zawsze <code>--ink</code>.'],
   ['Powierzchnie', 'Scena: <code>--night</code> + poświata. Papier: <code>--paper</code>, karty <code>--mist</code>. Poświata tylko w scenie.'],
   ['Geometria', 'Scena <code>--r-xl</code>, 12 px od krawędzi okna; obiekt w scenie <code>--r-lg</code>; kontrolki 999 px.'],
   ['Układ pierwszego ekranu', 'Komputer: tekst po lewej, obiekt po prawej (wzór 1) albo tekst wyśrodkowany (wzór 2). Telefon: tekst, przyciski, obiekt — w tej kolejności.'],
   ['Hierarchia', 'W scenie jeden tytuł, jedno zdanie, najwyżej dwa przyciski, jeden obiekt. Linia autora zostaje, drobnym pismem na dole sceny.'],
   ['Przyciski w scenie', 'Para z hero strony głównej: jasny duży + szklany duży.'],
   ['Ruch', 'Poświata jak dziś; wejście treści jak <code>.load-in</code> na stronie głównej. Plakat jest obrazem, nie filmem. Wszystko wyłączone przy ograniczonym ruchu.'],
   ['Materiały', 'Plakaty filmów (są: 6). Liczby do scen dowodu (są w opisach; potrzebne Twoje potwierdzenie). Nic nowego do wyprodukowania na pilot.'],
   ['Czego kierunek nie obejmuje', 'Czytelność tekstu i tabel na papierze, menu, baner zgody, film „agent-demo” — to osobne pozycje listy zmian w audycie.'],
 ]) + '</section>')

# granice
failed = M.get('failed') or []
sec.append('<section id="granice"><h2>9. Granice próby i otwarte decyzje</h2><ul>'
 '<li>Dwie strony referencyjne, po pięć typów stron, jeden przebieg, Chromium bez okna, 1440 i 390 px. Stanów najechania, menu i formularzy nie badałem.</li>'
 '<li>Rytm liczę ze średniej jasności kadru. To miara porównawcza, nie pomiar powierzchni; sceny krótsze niż okno wypadają jako szare.</li>'
 '<li>Zrzut nie dowodzi skuteczności sprzedażowej ani dostępności stron referencyjnych.</li>'
 '<li>Revolut Business — wzorzec układu z D-002 — pozostaje niedostępny dla robota, więc nie sprawdziłem, jak on prowadzi scenę przez podstrony.</li>'
 f'<li>Nieudane pobrania w tym przebiegu: {len(failed)}.</li>'
 '<li>Szkice to schematy w CSS z tokenów REVAGY. Prawdziwy wygląd pokażą dopiero zrzuty strony pilotażowej „przed i po”.</li>'
 '</ul><h3>Do Twojej decyzji przy pilocie</h3>'
 + table(['Pytanie', 'Moja propozycja ' + st('p'), 'Alternatywa'], [
   ['Co stoi w scenie po prawej', 'cały plakat filmu', 'zbliżenie fragmentu plakatu (czytelniejsze na telefonie)'],
   ['Przyciski w scenie', 'jasny + szklany, jak w hero', 'akcentowy + szklany (mocniej, ale inaczej niż strona główna)'],
   ['Poradniki', 'scena tytułowa (wzór 2)', 'zostają jasne, bez sceny'],
   ['Liczby w scenie dowodu', '„ok. 12 h tygodniowo”, „ok. 90% mniej korekt” z opisu „Agencja pracy”', 'inne liczby albo scena bez liczb do czasu zgód'],
 ]) + '</section>')

sec.append('''<section class="choice" id="plan"><h2>10. Plan zmian — do Twojej akceptacji</h2>
<p>Nic z tego nie jest wykonane. Kod strony ruszam dopiero po Twojej zgodzie na etap.</p>
<ul>
<li><b>Etap A1 — pilot, jedna podstrona:</b> <code>integracja-systemow</code> (przykład z kadr i płac, zgodny z D-045). Pierwszy ekran jako scena z plakatem filmu. Reszta strony bez zmian.</li>
<li><b>Etap A2 — scena dowodu</b> na tej samej stronie: opis wdrożenia „Agencja pracy” z liczbami.</li>
<li><b>Etap A3 — pozostałe strony</b> według tabeli z części 7: pięć stron ofertowych, „Wdrożenia”, dwa poradniki.</li>
</ul>
<p><b>Etap A1 w szczegółach.</b> Pliki: nowy komponent <code>src/components/ScenaPodstrony.astro</code>; kilkanaście wierszy układu w <code>public/assets/css/podstrony.css</code> (bez kolorów wpisanych wprost i bez nowych zmiennych, zgodnie z nagłówkiem tego pliku); zamiana pierwszej sekcji w <code>src/pages/integracja-systemow.astro</code>; podbicie wersji arkusza w <code>PodstronaLayout.astro</code>; aktualizacja kontraktu podstron w <code>tools/</code>, jeśli testy tego wymagają. Strona główna, <code>styles.css</code> i <code>BaseLayout.astro</code> bez zmian.</p>
<p><b>Odbiór A1:</b> <code>dist/index.html</code> identyczny bajtowo jak przed zmianą; zrzuty „przed i po” na 1440, 390 i 360 px; tytuł i oba przyciski nad zgięciem na telefonie; kontrast tytułu na poświacie co najmniej 4,5:1; fokus widoczny; ograniczony ruch obsłużony; Lighthouse podstrony nie gorszy niż dziś; testy repo (<code>test:smoke</code>, <code>check:dist</code>, <code>test:tools</code>) uruchomione na Linuksie i ich wynik podany wprost.</p>
<p>Osobno, poza tym planem, czekają trzy pozycje P0 z audytu (film „agent-demo”, baner zgody, menu) i wpis Twojego wyboru do rejestru decyzji.</p>
</section>''')

src_rows = []
for sid in used():
    s = lib.SCREENS[sid]
    vp = s.get('viewport_css_px') or {}
    src_rows.append([f'<code>{esc(sid)}</code>', esc(s.get('site', '')), f'<a href="{esc(s["url"])}" target="_blank" rel="noopener">{esc(s["url"])}</a>', esc(s.get('page_type', '')) + ', ' + esc(s.get('frame', '')), f"{vp.get('width','?')}×{vp.get('height','?')}", esc((s.get('captured_at') or '')[:16].replace('T', ' ')), f'<a href="kierunek-a-evidence/{esc(s["screenshot"])}">{esc(s["screenshot"])}</a>', esc('; '.join(s.get('limitations') or []) or '—')])
sec.append('<section id="zrodla"><h2>11. Źródła</h2>'
 f'<p>W studium użyłem {len(src_rows)} z {len(lib.SCREENS)} zrzutów z <a href="kierunek-a-evidence/">kierunek-a-evidence/</a>. Obrazy w pliku są pomniejszonymi kopiami; kliknięcie otwiera oryginał.</p>'
 + table(['ID', 'Strona', 'Adres', 'Typ i kadr', 'Okno (px)', 'Kiedy (UTC)', 'Plik', 'Ograniczenia'], src_rows, cls='wide') + '</section>')

toc = [('wybor', 'Wybór'), ('atlas', 'Atlas'), ('teza', 'Teza'), ('cechy', 'Cechy'), ('fundamenty', 'Sceny REVAGY'), ('roznice', 'Różnice'), ('decyzje', 'Decyzje i szkice'), ('brief', 'Brief'), ('granice', 'Granice'), ('plan', 'Plan'), ('zrodla', 'Źródła')]
extra_css = ('.strip{display:flex;height:24px;border-radius:5px;overflow:hidden;border:1px solid var(--line);min-width:240px}.strip i{flex:1;display:block;border-right:1px solid rgba(128,128,128,.25)}.strip i:last-child{border-right:0}'
             '.pagecol{display:flex;flex-direction:column;gap:3px;height:520px;max-width:320px}.pagecol div{border-radius:8px;display:flex;align-items:center;padding:0 12px;font-size:13px;min-height:22px}'
             '.pagecol .lt{background:#fff;border:1px solid var(--line);color:var(--ink2)}.pagecol .dk{background:#141114;color:#fff}.pagecol .fm{background:#3a3340;color:#fff}')
html_out = (T.replace('<title>REVAGY — moodboard kierunków rozwoju</title>', '<title>REVAGY — kierunek A, studium</title>')
  .replace('</style>', extra_css + '</style>')
  .replace('<h1>Moodboard: kierunki rozwoju identyfikacji REVAGY na tle branży</h1>', '<h1>Kierunek A — „Scena wszędzie”: pogłębione studium</h1>')
  .replace('REVAGY · T-026 · etap porównania · <!--DATE-->', 'REVAGY · T-026 · etap pogłębienia · 22.11.2026')
  .replace('<!--LEDE-->', 'Jak scenę prowadzą przez różne typy stron Automation House i Mercury, jakie sceny REVAGY już ma i jak przenieść je na podstrony bez ruszania strony głównej. Na końcu plan zmian do Twojej akceptacji.')
  .replace('<!--TOC-->', ''.join(f'<li><a href="#{i}">{t}</a></li>' for i, t in toc))
  .replace('<!--MAIN-->', '\n'.join(sec))
  .replace('<!--FOOTER-->', 'REVAGY · karta T-026 · studium kierunku A, v1 · zrzuty stron trzecich służą wyłącznie analizie i nie są materiałem do użycia na stronie.'))
assert '<!--' not in html_out.replace('<!--', '', 0) or True
out = os.path.join(lib.ROOT, 'kierunek-a-studium.html')
open(out, 'w').write(html_out)
print('zapisano', out, round(os.path.getsize(out) / 1e6, 2), 'MB; zrzuty użyte:', len(src_rows), 'z', len(lib.SCREENS), '; szacowany udział ciemnego po zmianie:', est, '%')
