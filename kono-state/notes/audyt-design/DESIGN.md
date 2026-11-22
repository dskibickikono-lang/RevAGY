# DESIGN.md — REVAGY (stan na 22.11.2026)

Opis stylu strony revagy.pl odczytany z wyrenderowanych stron lokalnego buildu. To inwentaryzacja tego, co jest,
a nie projekt zmian. Oznaczenia przy twierdzeniach:

- **Zmierzone** — wartość z `getComputedStyle` zapisana w migawce; podaję plik i selektor.
- **Zadeklarowane** — wartość wpisana w arkuszu stylów (`public/assets/css/styles.css`, `podstrony.css`); podaję wiersz.
- **Zaobserwowane** — widać na zrzucie; podaję zrzut.
- **Wniosek** — moja interpretacja oparta na wskazanych obserwacjach.
- **Niezweryfikowane** — nie udało się zmierzyć albo nie było czego mierzyć.

## 1. Źródło i zakres

| Pole | Wartość |
| --- | --- |
| Źródło | lokalny build gałęzi `skibiai/trusting-shannon-g9jhj1` (= `main` 43efbf5), `npm run build` + `astro preview`, `http://127.0.0.1:4321/` |
| Data | 22.11.2026 |
| Przeglądarka | Chromium (Playwright, tryb bez okna) |
| Szerokości próbkowania | 1440×900 i 390×844 px. To szerokości pomiaru, nie progi układu |
| Migawki stylów | 6 stron × 2 szerokości = 12 migawek: strona główna, `integracja-systemow`, `jak-wybrac-pierwszy-proces`, `polityka-prywatnosci`, `kontakt`, `404` — [manifest](design-evidence/manifest.json) |
| Zrzuty | wszystkie 12 stron × 2 szerokości, całe strony i góra strony — katalog [zrzuty/](zrzuty/) i [raport-zrzutow.json](zrzuty/raport-zrzutow.json) |
| Pomiary dodatkowe | struktura, rozmiary pisma, cele dotykowe, stany hover i fokus, baner zgody, ruch — [pomiary-dodatkowe.json](design-evidence/pomiary-dodatkowe.json), wszystkie 12 stron × 2 szerokości |
| Stany | domyślny po zamknięciu banera zgody przyciskiem „Odrzucam”; hover dla 15 selektorów; fokus klawiaturą (40 kroków Tab); `prefers-reduced-motion: reduce` |
| Walidacja | `validate-evidence.py` skilla: „Evidence references and token values are consistent” |

Ograniczenia, które zmieniają wnioski:

- To build lokalny, nie produkcja. Formularz kontaktowy nie renderuje się bez klucza Turnstile, więc **pól formularza nie zmierzyłem**; ich style znam tylko z deklaracji (`styles.css:695–716`).
- Ekstraktor próbkuje do 400 elementów na stronę (strona główna: 371 z 542 wyrenderowanych). Pseudo-elementy i wnętrze filmów nie są mierzone.
- Trybu ciemnego nie ma: `color-scheme: light` (`styles.css:25`), brak przełącznika.
- Stos krojów z CSS nie dowodzi, który plik się wyrenderował. Tu sprawdziłem to osobno: `document.fonts` zgłasza wczytane Onest, Instrument Sans i JetBrains Mono ([pomiary-dodatkowe.json](design-evidence/pomiary-dodatkowe.json) → `strona_glowna.fonty_wczytane_desktop`).

## 2. Charakter wizualny

**Zaobserwowane** ([index-desktop-cala-01](zrzuty/index-desktop-cala-01.webp), [index-desktop-cala-02](zrzuty/index-desktop-cala-02.webp)):

- Białe tło strony, na nim bardzo duże kontenery z zaokrągleniem 32–40 px. Kontenery są na przemian ciemne (`#141114`), jasnobeżowe (`#f4f1ee`) i pomarańczowe (`#ff5b14`).
- Ciemne kontenery mają rozmytą poświatę w trzech barwach: pomarańcz, róż, śliwka. Poświata jest w hero, w wyniku kalkulatora, w pasku końcowym i we wszystkich filmach.
- Nagłówki są ciężkie i ciasne: krój geometryczny, grubość 720–750, ujemne światło międzyliterowe.
- Nie ma ani jednej fotografii i ani jednego znacznika `<img>` na żadnej z 12 stron (`pomiary-dodatkowe.json` → `strony.*.images` puste). Obraz buduje 9 filmów z animowanymi ekranami, makiety interfejsu rysowane w CSS oraz ikony liniowe SVG.
- Kontrolki są pigułkami (zaokrąglenie 999 px): przyciski, etykiety, pozycje menu, przełącznik, taśma z nazwami.
- Drobne opisy techniczne są krojem maszynowym, wersalikami, 11–12 px.

**Wniosek:** styl to „fintechowa strona produktu”: jasna baza, ciemne zaokrąglone sceny, jeden gorący akcent, animowany interfejs zamiast zdjęć. Zgadza się to z decyzją D-002 (układ i ruch wzorowane na Revolut Business) i z komentarzem w `styles.css:1–3`. Strona udaje produkt z interfejsem, choć sprzedaje usługę.

**Zaobserwowane — dwa światy** ([integracja-systemow-desktop-cala-01](zrzuty/integracja-systemow-desktop-cala-01.webp) obok [index-desktop-cala-01](zrzuty/index-desktop-cala-01.webp)): podstrony ofertowe i poradniki używają tych samych tokenów, ale innej kompozycji. To wyśrodkowane kolumny tekstu na białym tle, tabele i listy, jeden film i pasek końcowy. **Zmierzone:** ciemne bloki zajmują 37% wysokości strony głównej, 13–16% podstron ofertowych i 6–7% poradników (`pomiary-dodatkowe.json` → `strony.*-desktop.surface.darkShare`).

## 3. Wartości stylu

### 3.1 Kolory

Zmienne zadeklarowane w `:root` (`styles.css:27–45`) i odczytane w migawce ([index-desktop-default.json](design-evidence/index-desktop-default.json) → `cssVariables`). Rola według faktycznego użycia.

| Zmienna | Wartość | Rola zaobserwowana | Dowód użycia (Zmierzone) |
| --- | --- | --- | --- |
| `--paper` | `#ffffff` | tło strony, tekst na ciemnym, jasny przycisk | `e27` `.hero-cta a:nth-of-type(1)` backgroundColor `rgb(255, 255, 255)` |
| `--mist` | `#f4f1ee` | jasnobeżowe karty, tło kalkulatora, hover jasnych kontrolek, nagłówek tabeli | `e62` `#mozliwosci article:nth-of-type(1)`, `e96` `#kalkulator > div` |
| `--mist-2` | `#e9e4de` | niewypełniona część suwaka, linie makiety dokumentu | Zadeklarowane `styles.css:366, 393` |
| `--line` | `#e1dbd4` | obrysy kart, linie tabel i FAQ | `e287` `#bezpieczenstwo article` borderTopColor `rgb(225, 219, 212)` |
| `--ink` = `--night` | `#141114` | tekst podstawowy, ciemne kontenery, ciemny przycisk | `e21` hero backgroundColor `rgb(20, 17, 20)`; `e19` przycisk |
| `--ink-2` | `#625c63` | tekst drugorzędny na jasnym | `e61` `#mozliwosci > header > p` color `rgb(98, 92, 99)` |
| `--accent` | `#ff5b14` | akcent: przycisk wyróżniony, karta, etykieta kroku, obrys fokusu, wypełnienia wykresów | `e273` `#pakiety article:nth-of-type(2) > a`; `e132` etykieta „Krok 1” |
| `--accent-deep` | `#c23d06` | odnośniki w tekstach prawnych, ikony w kartach z obrysem | `polityka-prywatnosci-desktop-default.json` `e20` color `rgb(194, 61, 6)` |
| `--rose` | `#ff2e7e` | poświaty, gradient pasków w makiecie audytu, ikona w kanale zdarzeń | Zadeklarowane `styles.css:239, 452, 614` |
| `--plum` | `#3b1437` | poświata, jedna karta karuzeli | Zadeklarowane `styles.css:208, 537, 614` |
| `--night-2`, `--night-3` | `#221e23`, `#2e2930` | warstwy wewnątrz ciemnych kontenerów, hover ciemnego przycisku | hover `.btn-dark`: `rgb(20, 17, 20)` → `rgb(46, 41, 48)` (`pomiary-dodatkowe.json` → `stany_hover`) |
| `--on-night-2` | `#b9b2bb` | tekst drugorzędny na ciemnym | Zmierzone w migawce jako `rgb(185, 178, 187)`, 115 wystąpień |
| `--night-line` | `rgba(255,255,255,.13)` | obrysy na ciemnym | Zadeklarowane `styles.css:40` |
| `--glass`, `--glass-light` | `rgba(20,17,20,.56)`, `rgba(255,255,255,.16)` | „szkło”: kanał zdarzeń w hero, etykieta, przycisk szklany | `e31` aside backgroundColor `rgba(20, 17, 20, 0.56)`, backdropFilter `blur(22px) saturate(1.3)` |
| `--ok` | `#19b77a` | status „zrobione”, kropka „na żywo” | Zadeklarowane `styles.css:229, 476` |

Kolory spoza zmiennych — **Zadeklarowane** tylko w formularzu kontaktowym (`styles.css:701–709`): `#b8b5c4` (obrys pola), `#211c29` (tekst pola), `#ffb8b8` (błąd), `#e0dce8` (podpowiedź). Nagłówek pliku mówi „kolory tylko z tokenów” (`styles.css:3`); formularz od tego odstaje. **Niezweryfikowane** na ekranie (formularz nie renderuje się lokalnie).

Kontrast tekstu policzony z wartości zmiennych (wzór WCAG, bez próbkowania obrazu):

| Para | Kontrast | Uwaga |
| --- | --- | --- |
| `--ink` na `--paper` | 18,75:1 | tekst podstawowy |
| `--ink-2` na `--paper` / `--mist` | 6,50:1 / 5,78:1 | tekst drugorzędny |
| `--on-night-2` na `--night` | 9,06:1 | tekst drugorzędny na ciemnym |
| `--ink` na `--accent` | 6,03:1 | tekst na pomarańczowym przycisku i karcie |
| `--paper` na `--accent` | 3,11:1 | nieużywane dla tekstu; biały tekst na pomarańczowym byłby za słaby |
| `--accent` na `--paper` | 3,11:1 | akcent nie nadaje się na tekst na białym; do tego służy `--accent-deep` (5,30:1) |
| `--accent` na `--night` | 6,03:1 | etykiety kroków na ciemnym |
| `--line` na `--paper` | 1,37:1 | obrys kart i przycisków przełącznika; poniżej 3:1 |
| `--mist-2` na `--mist` | 1,12:1 | niewypełniona część suwaka |

### 3.2 Typografia

Kroje **Zadeklarowane** (`styles.css:47–49`) i potwierdzone jako wczytane (`document.fonts`):

- `--font-display`: `"Onest", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif` — nagłówki, przyciski, liczby.
- `--font-body`: `"Instrument Sans", "Segoe UI", system-ui, …` — tekst ciągły, menu, tabele.
- `--font-mono`: `"JetBrains Mono", ui-monospace, …` — etykiety techniczne, dane w makietach.

Pliki krojów są na serwerze strony (`public/assets/fonts/`, formaty zmienne, podzbiory latin i latin-ext, z licencjami). Udział w tekście strony głównej: Instrument Sans 74%, Onest 22%, JetBrains Mono 4% znaków (`pomiary-dodatkowe.json` → `strony.index-desktop.fontFamilyChars`).

Style **Zmierzone** przy 1440 px ([index-desktop-default.json](design-evidence/index-desktop-default.json), [integracja-systemow-desktop-default.json](design-evidence/integracja-systemow-desktop-default.json)) i przy 390 px (pliki `*-mobile-default.json`):

| Rola (klasa) | Krój, grubość | 1440 px: rozmiar / interlinia / światło | 390 px | Dowód (element, selektor) |
| --- | --- | --- | --- | --- |
| Tytuł hero (`.display`) | Onest 750 | 92 / 90,16 / −3,68 px | 44 / 43,12 / −1,76 px | `e25` `#start > section:nth-of-type(1) … h1`; mobile `e16` |
| Tytuł podstrony, paska końcowego, 404 (`.display-2`) | Onest 750 | 72 / 72 / −2,736 px | 36 / 36 / −1,368 px | integracja `e27` `#wstep > div > h1`; mobile `e17` |
| Nagłówek sekcji (`.h2`) | Onest 720 | 56 / 58,24 / −1,904 px | 32 / 33,28 / −1,088 px | `e60` `#mozliwosci > header > h2`; mobile `e46` |
| Nagłówek karty (`.h3`) | Onest 680 | 28 / 31,36 / −0,616 px | 22 / 24,64 / −0,484 px | `e63`; mobile `e49` |
| Mały nagłówek (`.h4`) | Onest 680 | 20 / 24 / −0,3 px | 20 / 24 px | `e290` `#bezpieczenstwo article h3` |
| Wstęp (`.lead`) | Instrument Sans 400 | 19,44 / 29,16 px, `--ink-2` | 17 / 25,5 px | `e61`; mobile `e47` |
| Tekst (`body`) | Instrument Sans 400 | 17 / 25,5 px | 17 / 25,5 px | `e64` |
| Tekst pomocniczy | Instrument Sans 400 | 15 / 22,5 px | 15 / 22,5 px | `e47` opis liczby; `e349` odnośnik stopki; komórki tabel |
| Menu (`.nav-link`) | Instrument Sans 560 | 15 / 22,5 px | — (ukryte) | `e15` |
| Przycisk (`.btn`) | Onest 620 | 15 / 22,5 / −0,15 px | 15 px | `e19` |
| Przycisk duży (`.btn-lg`) | Onest 620 | 17 / 25,5 / −0,17 px | 17 px | `e27` |
| Etykieta (`.chip`) | Instrument Sans 600 | 14 / 21 px | 14 px | `e24` |
| Liczba (`.stat-num`) | Onest 750 | 60 / 60 / −2,4 px | 36 / 36 / −1,44 px | `e45`; mobile `e31` |
| Wynik kalkulatora (`.calc-big`) | Onest 780 | 120 / 108 / −6 px | 64 / 57,6 / −3,2 px | `e111`; mobile `e93` |
| Pytanie FAQ | Onest 650 | 22 / 27,5 / −0,44 px | 18 / 22,5 px | `e314` `#qb-2`; mobile `e296` |
| Etykieta kroku (`.step-no`) | JetBrains Mono 400, wersaliki | 12 / 18 / +1,2 px, `--accent` | to samo | `e132` |
| Stopka prawna | Instrument Sans 400 | 13 / 19,5 px | 13 px | `e369` |
| Autor i data (`.autor`) | Instrument Sans 400 | 14 / 21 px, `--ink-2` | 14 px | integracja `e32` |
| Nagłówek w tekście prawnym (`.doc-page h2`) | Onest 680 | 24 / 28,8 / −0,48 px | — | polityka `e15` |

Rozmiary płynne są **Zadeklarowane** funkcją `clamp()` (`styles.css:50–57`), np. `--fs-h2: clamp(2rem, 4.3vw, 3.5rem)`. Wartości w tabeli to wynik dla dwóch szerokości, nie skala pośrednia.

**Zmierzone — liczba stopni:** na stronie głównej przy 1440 px występują 22 różne rozmiary pisma (11–120 px) i 12 grubości (400, 500, 560, 600, 620, 650, 680, 700, 720, 750, 780, 800; grubości z deklaracji w `styles.css`). **Wniosek:** skala nagłówków jest spójna, natomiast drobne rozmiary (11, 12, 13, 14, 15, 16 px) i sąsiednie grubości (620/650/680 oraz 720/750/780) nie tworzą opisanej skali; wyglądają na dobierane miejscowo.

### 3.3 Odstępy i siatka

| Element | Wartość | Status i dowód |
| --- | --- | --- |
| Szerokość treści | `--wrap: 1240px` + margines `--gutter: clamp(16px, 3vw, 32px)` | Zadeklarowane `styles.css:59–60`; Zmierzone: `#kalkulator > div` (`e96`) ma 1240 px |
| Kontenery „od krawędzi do krawędzi” | 12 px od krawędzi okna; hero 1416 px przy 1440 | Zadeklarowane `styles.css:198, 423, 611`; Zmierzone `e21` 1416×820 |
| Odstęp pionowy sekcji | `clamp(64px, 9vw, 132px)` góra i dół | Zadeklarowane `styles.css:266` |
| Odstęp między kartami | 20 px | Zadeklarowane `styles.css:284, 561, 583` |
| Wnętrze karty | 40 px przy 1440 (`clamp(24px, 3vw, 40px)`), 36 px w kartach z obrysem i pakietach, 24 px przy 390 | Zmierzone `e62` paddingTop 40px; `e287` 36px; mobile integracja `e33` 24px |
| Wnętrze hero i paska końcowego | 63,36 px; pasek końcowy 140 px góra i dół | Zmierzone `e21`, `e330` |
| Wysokość nagłówka strony | 72 px, 64 px przy 390 | Zmierzone `cssVariables.--header-h` w obu migawkach; `e2` 1440×73 |

Najczęstsze wartości odstępów w migawce strony głównej: 30, 8, 12, 10, 20, 24, 14, 18 px (`tokens.spacing`). **Wniosek:** nie ma jednej jednostki bazowej; częstość wystąpień nie jest skalą, więc jej nie wyprowadzam.

### 3.4 Zaokrąglenia, obrysy, cienie

| Rola | Wartość | Status i dowód |
| --- | --- | --- |
| Duże sceny (hero, kalkulator, pasmo procesu, film, pasek końcowy) | `--r-xl: clamp(24px, 3vw, 40px)` → 40 px przy 1440 | Zmierzone `e21`, `e96`, `e330` |
| Karty | `--r-lg: clamp(22px, 2.4vw, 32px)` → 32 px przy 1440, 22 px przy 390 | Zmierzone `e62`, `e287`; mobile `e33` |
| Tabele | `--r-md: 18px` | Zmierzone integracja `e56` |
| Panele „szklane”, makieta ekranu, baner zgody | 26 px (wartość wpisana wprost) | Zmierzone `e31`; Zadeklarowane `styles.css:225, 434, 647` |
| Panel menu | 24 px | Zadeklarowane `styles.css:157` |
| Kontrolki i etykiety | 999 px | Zmierzone `e19`, `e24`, `e266` |
| Przyciski okrągłe | 50%, 52×52 px | Zmierzone `e177` |
| Drobne elementy makiet | 9–20 px, różne | Zadeklarowane `styles.css:316–374` |
| Obrys kart | 1,5 px w deklaracji, wyrenderowane 1 px przy gęstości 1, `--line` | Zmierzone `e287` borderTopWidth 1px; Zadeklarowane `styles.css:584` |
| Linia nad liczbą | 2 px `--ink` | Zmierzone `e44` |
| Cień karty po najechaniu | `rgba(20, 17, 20, 0.4) 0px 34px 60px -34px` | Zmierzone `stany_hover[".bento .card-mist"]` |
| Cień makiety ekranu | `rgba(0, 0, 0, 0.8) 0px 50px 100px -40px` | Zmierzone `tokens.shadows` (`e148`) |
| Cień akcentowego przycisku po najechaniu | `rgb(255, 91, 20) 0px 10px 30px -8px` | Zmierzone `stany_hover[".plan-featured .btn-accent"]` |

**Wniosek:** karty w spoczynku są płaskie; głębię dają kolor tła i poświata, a cień pojawia się dopiero po najechaniu.

### 3.5 Ruch

**Zadeklarowane** (`styles.css`, wiersze w nawiasach) i **Zmierzone** tam, gdzie zaznaczono:

- Krzywa `--ease: cubic-bezier(.2, .7, .2, 1)` (64). Przejścia kontrolek 0,2–0,3 s, kart 0,5 s, pojawianie się sekcji 0,9 s z przesunięciem 30 px (273–274).
- Sekcje pojawiają się przy przewijaniu: klasa `.reveal` zaczyna od `opacity: .16` i dostaje `.is-in` z `IntersectionObserver` (`app.js:55–67`). Bez JavaScriptu wszystko jest widoczne.
- Animacje w pętli: poświaty (14–18 s), kanał zdarzeń w hero, trzy makiety w kartach (7–10 s), taśma z nazwami (48 s), kropka „na żywo”. **Zmierzone:** 26 animacji biegnie bez końca po załadowaniu strony głównej (`pomiary-dodatkowe.json` → `ruch_domyslny`).
- Filmy startują po wejściu w ekran (`data-autoplay`), są wyciszone, w pętli, bez ścieżki dźwiękowej. Film w hero ma `preload="metadata"`, pozostałe `preload="none"`.
- **Zmierzone:** przy `prefers-reduced-motion: reduce` biegnie 0 animacji, wszystkie 3 filmy strony głównej stoją na pierwszej klatce, a sekcje są od razu w pełni widoczne (`pomiary-dodatkowe.json` → `ograniczony_ruch`).

## 4. Komponenty (skrót)

Pełne karty są w [komponenty.md](komponenty.md). Tu tylko wzorzec i stany zmierzone.

| Komponent | Selektor | Kształt i typografia (Zmierzone, 1440 px) | Stany zmierzone | Stany niezweryfikowane |
| --- | --- | --- | --- | --- |
| Przycisk ciemny | `.btn.btn-dark` | 44 px wys., pigułka, `#141114` / biały, Onest 620 15 px, poziomo 20 px | hover: tło `rgb(46, 41, 48)`; fokus: obrys `solid 3px rgb(255, 91, 20)`, odstęp 3 px | disabled |
| Przycisk jasny duży | `.btn.btn-light.btn-lg` | 56 px wys., biały / `#141114`, 17 px, poziomo 28 px | hover: tło `rgb(244, 241, 238)` | disabled |
| Przycisk szklany | `.btn.btn-glass` | `rgba(255,255,255,.16)` + `blur(14px)` | hover: `rgba(255, 255, 255, 0.26)` | — |
| Przycisk akcentowy | `.btn.btn-accent` | `#ff5b14` / `#141114` | hover: cień w kolorze akcentu, przesunięcie −1 px | — |
| Przycisk z obrysem | `.btn.btn-outline` | obrys `#141114` | hover: odwrócenie (tło `#141114`, tekst biały) | — |
| Przycisk bez tła | `.btn.btn-ghost` | tekst `#141114` | hover: tło `rgb(244, 241, 238)` | — |
| Pozycja menu | `.nav-link` | 40 px wys., pigułka, Instrument Sans 560 15 px | hover: tło `rgb(244, 241, 238)` | stan „jesteś tutaj” — nie istnieje |
| Karta bento | `.card` + `.card-mist` / `-night` / `-accent` / `-video` | 32 px, wnętrze 40 px, min. wysokość 500 px | hover: −6 px i cień | — |
| Karta z obrysem | `.trust` | obrys `#e1dbd4`, 32 px, wnętrze 36 px | hover: obrys `rgb(20, 17, 20)` | — |
| Pakiet | `.plan`, `.plan-featured` | `#f4f1ee` albo `#141114`, 32 px | hover: −6 px (zadeklarowane) | — |
| Pytanie FAQ | `.qa button` | Onest 650 22 px, wiersz 84 px | hover: **bez zmiany** (`bezZmiany: true`) | — |
| Tabela | `.doc-table` | obrys `#e1dbd4`, 18 px, nagłówek `#f4f1ee` Onest 650 15 px, komórki 15 px `#625c63`, komórka 12×16 px | — | przewijanie w poziomie na telefonie: brak sygnału |
| Lista z ptaszkami | `.ticks` | 15 px, znacznik 18 px `#141114` | — | — |
| Film | `.film` + `.film-toggle` | 16:9, 40 px, przycisk 52 px „szklany” | `aria-pressed` zmienia ikonę | — |
| Pole formularza | `.kontakt-field input` | Zadeklarowane: obrys `#b8b5c4`, 12 px, 16 px pisma | — | wszystkie (nie renderuje się lokalnie) |

Obrys fokusu jest jeden dla całej strony: `:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px }` (`styles.css:84`). **Zmierzone:** 40 kolejnych elementów w kolejności Tab na stronie głównej ma ten obrys i żaden nie jest niewidoczny (`fokus_klawiatura.wszystkieZObrysem: true`).

## 5. Zachowanie przy zmianie szerokości

**Zadeklarowane** progi w CSS (`declaredMediaQueries` w migawce): `max-width` 1100, 1020, 900, 820, 640, 560, 520, 420, 389 px oraz `min-width: 700px`. To 10 różnych progów; sprawdziłem tylko dwie szerokości, więc zachowanie pomiędzy jest **niezweryfikowane**.

**Zaobserwowane** przy 390 px ([index-mobile-cala-01](zrzuty/index-mobile-cala-01.webp), [integracja-systemow-mobile-cala-01](zrzuty/integracja-systemow-mobile-cala-01.webp)):

- Menu chowa się pod przyciskiem; w nagłówku zostają logo, „Umów konsultację” i przycisk menu.
- Hero: film przechodzi nad tekst, przyciski na całą szerokość, kanał zdarzeń pokazuje 2 z 4 pozycji.
- Siatki kart (bento, pakiety, trójki) układają się w jedną kolumnę; liczby w dwie.
- Film zachowuje proporcje 16:9, więc ma 315 px szerokości (`videos[0].renderedW`); napisy w kadrze są wtedy nieczytelne.
- Tabele mają stałą szerokość minimalną 560 px (`styles.css:671`) i przewijają się w poziomie wewnątrz ramki: **Zmierzone** `scrollW 560` przy `clientW 356`.

**Zmierzone:** żadna z 24 kombinacji strona × szerokość nie ma poziomego przepełnienia dokumentu (`raport-zrzutow.json` → `przepelnieniePoziome: 0`).

## 6. Zasoby marki

| Zasób | Gdzie | Status |
| --- | --- | --- |
| Znak | wbudowany SVG `svg.logo-mark` w `a.logo`: zaokrąglony kwadrat 32×32 (`rx=9`) z literą „R”, kolor `currentColor`; 30×30 px na stronie | Zaobserwowane, potwierdzony wizualnie ([index-desktop-gora](zrzuty/index-desktop-gora.webp)) |
| Napis | tekst „REVAGY” krojem Onest 800, 20 px, −0,02em (`.logo-word`, `styles.css:145`) | Zadeklarowane; to tekst, nie krzywe |
| Ikona strony | `public/favicon.ico`, `public/assets/img/favicon.svg` (ten sam znak, `#141114`) | Zaobserwowane |
| Ikony aplikacji | `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180 px) | Pliki obecne; wyglądu nie oglądałem |
| Obraz do udostępnień | `public/assets/img/og.jpg`, 1200×630: ciemne tło z poświatą, biały znak i napis, hasło, węzeł „Agent AI” | Zaobserwowane |
| Filmy | 9 filmów w `public/assets/video/` (WebM VP9 + MP4 H.264 + kadr JPG); 8 w 1600×900, `dashboard` w 1280×720; 10–14 s, 30 kl./s, bez dźwięku | Zmierzone `ffprobe`; klatki: [filmy-klatki](zrzuty/filmy-klatki.webp) |
| Ilustracje | ikony liniowe SVG w kartach karuzeli (`.use-art`) i kartach z obrysem (44 px, `--accent-deep`) | Zaobserwowane |

Nie ma pliku z samym logo (znak + napis) do użycia poza stroną, wersji na ciemne tło jako pliku ani opisu pola ochronnego i minimalnego rozmiaru. Znak jest skopiowany w kodzie 6 razy (`BaseLayout.astro` ×4, `PodstronaLayout.astro` ×2).

## 7. Wskazówki przy budowaniu kolejnych ekranów

Wynikają z pomiarów powyżej; nie dodają nowych tokenów ani stanów.

1. Kolor bierz wyłącznie ze zmiennych z `:root`. Tekst na pomarańczowym zawsze `--ink`, nigdy biały (3,11:1). Pomarańcz jako tekst na białym zastępuj `--accent-deep`.
2. Nagłówki: Onest, klasy `.display` / `.display-2` / `.h2` / `.h3` / `.h4`. Nie wpisuj rozmiarów ręcznie; do tekstu ciągłego `.lead` i rozmiar bazowy 17 px.
3. Sceny (hero, film, pasek końcowy) mają `--r-xl` i 12 px od krawędzi okna; karty `--r-lg`; tabele `--r-md`; kontrolki 999 px. Nie mieszaj tych poziomów.
4. Karta w spoczynku jest płaska. Cień i przesunięcie tylko po najechaniu.
5. Każdy ruch musi mieć odpowiednik w bloku `prefers-reduced-motion` (`styles.css:683–693`); dziś ten blok jest kompletny.
6. Film: 16:9, `muted loop playsinline`, przycisk wstrzymania, kadr jako `poster`, etykieta `aria-label` z opisem.
7. Jeden przycisk główny na ekran. Dziś funkcję „główny” pełnią cztery warianty zależnie od tła (ciemny, jasny, akcentowy, z obrysem) — reguły wyboru nie ma w kodzie; propozycja jest w [komponenty.md](komponenty.md).

## 8. Luki

- Formularz kontaktowy: wygląd pól, błędów i stanu wysyłki niezmierzony (wymaga buildu z kluczem Turnstile albo produkcji).
- Otwarte menu główne (panel rozwijany) i otwarte menu mobilne: nie mam zrzutu; style znam z deklaracji.
- Stan `disabled` przycisków: widziany tylko na okrągłym przycisku karuzeli.
- Szerokości pośrednie (np. 768, 1024, 1280 px): niesprawdzone.
- Safari i Firefox: niesprawdzone. Efekt „szkła” (`backdrop-filter`) i maski filmu w hero mogą się różnić.
- Rzeczywiste odtwarzanie filmów w pełnym zrzucie strony: większość filmów jest na zrzutach w pierwszej klatce, bo startują dopiero w ekranie. Treść filmów oceniałem z klatek wyciętych z plików.
