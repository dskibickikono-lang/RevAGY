# REVAGY — dokumentacja komponentów · v1 (do oceny)

Dokument dla osoby, która projektuje albo składa kolejne ekrany strony. Opisuje komponenty, które już istnieją,
ich warianty, niespójności i dostępność. Niczego nie zmienia w projekcie i niczego po cichu nie ujednolica:
rozbieżności są pokazane jako obserwacje, a propozycje są oznaczone.

## Materiały źródłowe i pokrycie

Data analizy: 22.11.2026. Źródłem są zrzuty wyrenderowanych stron lokalnego buildu (`main` 43efbf5) oraz pomiary
opisane w [DESIGN.md](DESIGN.md). Kod czytałem tylko po to, żeby potwierdzić nazwy klas i deklaracje.

| ID | Materiał | Widok | Obejrzane |
| --- | --- | --- | --- |
| S01 | [index-desktop-cala-01](zrzuty/index-desktop-cala-01.webp), [-02](zrzuty/index-desktop-cala-02.webp) | strona główna, 1440 px, cała | w całości |
| S02 | [index-mobile-cala-01](zrzuty/index-mobile-cala-01.webp), [-02](zrzuty/index-mobile-cala-02.webp), [-03](zrzuty/index-mobile-cala-03.webp) | strona główna, 390 px, cała | w całości |
| S03 | [integracja-systemow-desktop-cala-01](zrzuty/integracja-systemow-desktop-cala-01.webp), [-02](zrzuty/integracja-systemow-desktop-cala-02.webp) | podstrona ofertowa, 1440 px | w całości |
| S04 | [integracja-systemow-mobile-cala-01](zrzuty/integracja-systemow-mobile-cala-01.webp) | podstrona ofertowa, 390 px | pierwsza część |
| S05 | [wdrozenia-desktop-cala-01](zrzuty/wdrozenia-desktop-cala-01.webp) | opisy wdrożeń, 1440 px | góra i film |
| S06 | [dla-firm-desktop-cala-01](zrzuty/dla-firm-desktop-cala-01.webp) | pakiety dla firm, 1440 px | pierwsza połowa |
| S07 | [produkcja-i-logistyka-desktop-cala-01](zrzuty/produkcja-i-logistyka-desktop-cala-01.webp) | Enterprise, 1440 px | film, tabela, opis wdrożenia |
| S08 | [finanse-desktop-cala-01](zrzuty/finanse-desktop-cala-01.webp) | finanse, 1440 px | karty „Dziś / Po wdrożeniu / Co zostaje człowiekowi” |
| S09 | [dane-i-bezpieczenstwo-desktop-cala-01](zrzuty/dane-i-bezpieczenstwo-desktop-cala-01.webp) | dane i bezpieczeństwo, 1440 px | film i tabela |
| S10 | [jak-wybrac-pierwszy-proces-desktop-cala-01](zrzuty/jak-wybrac-pierwszy-proces-desktop-cala-01.webp) | poradnik, 1440 px | góra i tabela |
| S11 | [porownanie-rozwiazan-desktop-cala-01](zrzuty/porownanie-rozwiazan-desktop-cala-01.webp), [-02](zrzuty/porownanie-rozwiazan-desktop-cala-02.webp) | poradnik, 1440 px | listy i tabela porównawcza |
| S12 | [kontakt-desktop-cala](zrzuty/kontakt-desktop-cala.webp) | kontakt, 1440 px | w całości (bez formularza) |
| S13 | [polityka-prywatnosci-desktop-cala](zrzuty/polityka-prywatnosci-desktop-cala.webp) | tekst prawny, 1440 px | pierwsza połowa |
| S14 | [404-desktop-cala](zrzuty/404-desktop-cala.webp) | strona błędu, 1440 px | w całości |
| S15 | [index-desktop-baner-zgody](zrzuty/index-desktop-baner-zgody.webp), [index-mobile-baner-zgody](zrzuty/index-mobile-baner-zgody.webp) | pierwsza wizyta z banerem | w całości |
| S16 | [filmy-klatki](zrzuty/filmy-klatki.webp) | 9 filmów × 4 klatki | w całości |
| P | [pomiary-dodatkowe.json](design-evidence/pomiary-dodatkowe.json) | liczby dla 12 stron × 2 szerokości | — |
| D | [DESIGN.md](DESIGN.md) | wartości zmierzone z selektorami | — |

Pokrycie: 12 z 12 stron ma zrzut na obu szerokościach; obejrzałem w całości 5 widoków, pozostałe częściowo
(tabela wyżej) i uzupełniłem liczbami z P. Widoki telefonu podstron innych niż `integracja-systemow` znam z pomiarów,
nie z oglądu. Rozpoznane rodziny: 22. Nie pokazano w materiałach: otwartego menu, otwartego menu mobilnego, formularza
kontaktowego, stanów błędu i wysyłki.

Legenda: **[P]** potwierdzone w materiałach (zrzut albo pomiar z D) · **[S]** szacunek z obrazu · **[R]** rekomendacja ·
**[?]** do potwierdzenia · **[T]** do testu we wdrożeniu.

## Indeks rodzin

| # | Rodzina | Przeznaczenie | Gdzie występuje (P → `components`) |
| --- | --- | --- | --- |
| 1 | Nagłówek strony i menu | orientacja, wejście do oferty, stały przycisk kontaktu | wszystkie strony; 3 warianty |
| 2 | Przycisk | działanie | wszystkie strony; 7 wariantów koloru, 2 rozmiary |
| 3 | Przycisk okrągły, odnośnik w tekście, przełącznik | działania pomocnicze | strona główna, podstrony |
| 4 | Etykieta (pigułka) | krótka kategoria albo status | strona główna |
| 5 | Hero | pierwsze wrażenie, obietnica, dwa przyciski | tylko strona główna |
| 6 | Nagłówek sekcji | tytuł i wstęp sekcji; na podstronach także tytuł strony | wszystkie strony ofertowe |
| 7 | Liczby | cztery fakty pod hero | tylko strona główna |
| 8 | Karta bento z makietą | cztery obszary oferty | tylko strona główna |
| 9 | Karta z obrysem | krótki fakt, problem, opis wdrożenia | strona główna i 7 podstron |
| 10 | Karuzela i karta zastosowania | przykłady według działu | tylko strona główna |
| 11 | Kalkulator | wyliczenie odzyskanych godzin | tylko strona główna |
| 12 | Pasmo procesu z ekranem | cztery kroki wdrożenia | tylko strona główna |
| 13 | Taśma nazw | „pracujemy na tym, co macie” | tylko strona główna |
| 14 | Film | pokazanie przepływu | strona główna i 6 podstron |
| 15 | Pakiet | porównanie zakresów | strona główna (3), `dla-firm` (2) |
| 16 | Pytania i odpowiedzi | rozwiewanie wątpliwości | strona główna i 8 podstron |
| 17 | Tabela | porównanie, zestawienie | 6 podstron, polityka prywatności |
| 18 | Listy: z ptaszkami i kroki | cechy, kroki, argumenty | wszystkie strony ofertowe |
| 19 | Pasek końcowy i strona błędu | wezwanie do kontaktu | wszystkie strony poza polityką |
| 20 | Stopka | dane firmy, nawigacja pomocnicza | wszystkie poza 404; 2 warianty |
| 21 | Baner zgody | zgoda na statystyki | pierwsza wizyta |
| 22 | Formularz kontaktowy i strona tekstowa | kontakt, teksty prawne | `kontakt`, `polityka-prywatnosci` |

## Wspólne podstawy

Tokeny kolorów, typografii, odstępów i zaokrągleń są opisane raz w [DESIGN.md §3](DESIGN.md) z dowodami. Karty
niżej odsyłają do nich nazwą zmiennej (`--accent`, `--r-lg` itd.). Nazwy tokenów pochodzą z arkusza stylów strony **[P]**.

Wspólne ustalenia dostępności (platforma: web; cel przyjęty roboczo: WCAG 2.2 AA **[R]** — w materiałach celu nie zapisano):

| Obszar | Ustalenie | Status | Kryterium | Jak sprawdzić |
| --- | --- | --- | --- | --- |
| Kontrast tekstu | wszystkie pary tekst–tło z tokenów mają 4,7:1 lub więcej; najniższa: `--accent-deep` na `--mist` 4,71:1 | [P] policzone z wartości tokenów | 1.4.3 AA | D §3.1 |
| Obrys fokusu | `3px solid --accent`, odstęp 3 px, na 40 kolejnych elementach strony głównej | [P] | 2.4.7 AA; kontrast obrysu na białym 3,11:1 (1.4.11 AA) | P → `fokus_klawiatura` |
| Język i struktura | `lang="pl"`, jeden `h1` na stronie, brak przeskoków poziomów nagłówków na 12 stronach, `main` na każdej | [P] | 3.1.1 A, 1.3.1 A, 2.4.6 AA | P → `headings`, `landmarks` |
| Odnośnik „Przejdź do treści” | jest na 11 stronach, brak na 404 | [P] | 2.4.1 A | kod `BaseLayout.astro:64` |
| Ograniczony ruch | 0 animacji i zatrzymane filmy przy `prefers-reduced-motion` | [P] | 2.3.3 AAA | P → `ograniczony_ruch` |
| Ruch bez ustawienia systemowego | 26 animacji w pętli i 2 filmy bez przycisku wstrzymania (hero, karta „Raporty”) | [P] stan; ocena zgodności [T] | 2.2.2 A (wstrzymaj, zatrzymaj, ukryj) | karty 5, 8, 13 |
| Cel dotykowy | elementy niższe niż 24 px to odnośniki w tekście i w stopce (22–23 px z odstępem 10 px) | [P] wymiar; wyjątek „odstęp” [T] | 2.5.8 AA | P → `interactive` |
| Powiększenie 200–400% i szerokość 320 px | niesprawdzone | [T] | 1.4.4 AA, 1.4.10 AA | przeglądarka, zoom 400% |
| Czytnik ekranu | niesprawdzone; w kodzie są etykiety `aria-label`, `aria-expanded`, `aria-controls` | [T] | 4.1.2 A | NVDA/VoiceOver |

Źródła standardu: [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/).
APG to wzorce, nie kryteria. Ten dokument nie stwierdza zgodności strony z WCAG.

---

## 1. Nagłówek strony i menu

**Przeznaczenie.** Stały pasek u góry: logo, menu, dwa przyciski. Przykleja się przy przewijaniu.

**Anatomia** (S01 góra, S12, S14):

| Część | Wymagana | Źródło | Uwagi |
| --- | --- | --- | --- |
| Logo (znak + napis) | tak | S01 | prowadzi na stronę główną [P] |
| Menu: 2 pozycje rozwijane + 3 odnośniki | w wariancie pełnym | S01 | panel rozwijany: nie pokazano otwartego [?] |
| Przycisk „Policz zwrot” (bez tła) | w wariancie pełnym | S01 | znika poniżej 560 px [P] deklaracja |
| Przycisk „Umów konsultację” (ciemny) | tak | S01, S12, S14 | 44 px; 40 px przy 390 px [P] |
| Przycisk menu (dwie kreski w kole) | poniżej 1020 px | S02 | 44×44 px [P] deklaracja |

**Warianty** [P]:

| Wariant | Gdzie | Co zawiera |
| --- | --- | --- |
| Pełny | strona główna i 9 podstron z `PodstronaLayout` | logo, menu, dwa przyciski |
| Skrócony | `kontakt`, `polityka-prywatnosci` | logo, „Strona główna”, „Umów konsultację”; stała linia pod spodem |
| Minimalny | `404` | logo i „Umów konsultację” |

**Niespójności** [P]:

- Menu na podstronach prowadzi do sekcji strony głównej (`./#mozliwosci`, `./#zastosowania`, `./#proces`…). Z 9 podstron w menu jest tylko „Finanse”. Pozostałe podstrony ofertowe są osiągalne wyłącznie z odnośników w treści.
- Nie ma stanu „jesteś tutaj”: żadna pozycja menu nie wyróżnia bieżącej strony.
- Trzy warianty nagłówka przy 12 stronach. `kontakt` jest stroną sprzedażową, a ma wariant skrócony jak tekst prawny.
- Tło paska to `color(srgb 1 1 1 / 0.84)` z rozmyciem; linia dolna pojawia się po przewinięciu, a w wariancie skróconym jest od początku.

**Właściwości widoczne w przykładach:** wariant (pełny / skrócony / minimalny), stan przewinięcia (z linią / bez). Model właściwości **[R]**: `wariant`, `biezacaStrona`.

**Tokeny:** `--paper` 84%, `--line`, `--header-h` 72 / 64 px, pozycja menu 40 px wys., Instrument Sans 560 15 px (D §3.2).

**Zachowanie** [P] z kodu, [T] na urządzeniu: panel menu otwiera się najechaniem myszą albo kliknięciem i klawiaturą; Escape zamyka; menu mobilne blokuje przewijanie strony.

**Zalecane / niewskazane** [R]:

| Zalecane | Niewskazane | Powód |
| --- | --- | --- |
| Jeden wariant nagłówka na wszystkich stronach z treścią; skrócony tylko dla 404 | Nowy wariant dla kolejnego typu strony | Trzy warianty już rozmywają orientację |
| Pozycje menu prowadzą do podstron, gdy podstrona istnieje | Odnośnik do kotwicy strony głównej, gdy jest pełna podstrona na ten temat | Dziś oferta z podstron jest w menu niewidoczna |

**Dostępność:** `nav` z etykietą „Główna nawigacja”, przyciski z `aria-expanded` [P] kod. Pozycje menu mają 40 px wysokości, przycisk kontaktu na telefonie 40 px — powyżej progu 24 px (2.5.8 AA), poniżej 44 px (2.5.5 AAA) [P]. Obsługa klawiaturą panelu i pułapka fokusu w menu mobilnym [T].

**Otwarte kwestie:** zrzut otwartego panelu i menu mobilnego; decyzja, czy podstrony mają wejść do menu.

---

## 2. Przycisk

**Przeznaczenie.** Każde działanie i każdy odnośnik o randze działania.

**Anatomia:** pigułka z napisem; opcjonalna ikona 16 px po lewej (tylko „Zobacz agenta w akcji”, S01) [P].

**Warianty koloru** [P] (D §4, stany z P → `stany_hover`):

| Wariant | Wygląd | Gdzie pokazano | Po najechaniu |
| --- | --- | --- | --- |
| Ciemny `.btn-dark` | `--ink` / biały | nagłówek; pierwszy przycisk pod tytułem podstrony (S03) | tło `--night-3` |
| Jasny `.btn-light` | biały / `--ink` | hero (S01), wynik kalkulatora, pasek końcowy podstron (S03), 404 | tło `--mist` |
| Szklany `.btn-glass` | biały 16% + rozmycie | hero (drugi przycisk), 404 | biały 26% |
| Akcentowy `.btn-accent` | `--accent` / `--ink` | pakiet „Scale”, pasek końcowy strony głównej i `kontakt`, baner zgody | cień w kolorze akcentu, −1 px |
| Z obrysem `.btn-outline` | obrys `--ink` | pakiety Start i Enterprise; drugi przycisk pod tytułem podstrony | odwrócenie kolorów |
| Bez tła `.btn-ghost` | tekst `--ink` | nagłówek („Policz zwrot”, „Strona główna”) | tło `--mist` |
| Cichy `.btn-quiet` | `--night-3` / biały | tylko baner zgody („Odrzucam”) | tło `--ink-2` |

**Rozmiary** [P]: zwykły 44 px (15 px pisma, poziomo 20 px), duży `.btn-lg` 56 px (17 px, poziomo 28 px). W nagłówku na telefonie 40 px.

**Macierz zaobserwowana** (wariant × rozmiar): ciemny zwykły i duży; jasny zwykły i duży; szklany duży; akcentowy zwykły; z obrysem zwykły i duży; bez tła zwykły; cichy zwykły. Innych kombinacji nie pokazano.

**Niespójności** [P]:

- To samo działanie — umówienie konsultacji — ma cztery wyglądy: ciemny (nagłówek, góra podstron), jasny (hero, pasek końcowy podstron), akcentowy (pasek końcowy strony głównej i `kontakt`). Akcentowy, czyli najmocniejszy kolor marki, występuje poza stroną główną tylko w pakiecie „Scale” na `dla-firm` i na `kontakt`; na 8 pozostałych podstronach nie ma go wcale (P → `components[".btn-accent"]`).
- Pasek końcowy ma dwa układy: na stronie głównej adres e-mail + przycisk akcentowy + „Kopiuj adres”; na podstronach jeden jasny przycisk (S01 koniec vs S03 koniec).
- Napisy tego samego działania: „Umów konsultację”, „Umów bezpłatną konsultację”, „Sprawdź to na konsultacji”, „Zapytaj o Start”, „Zapytaj o Scale”, „Porozmawiajmy”, „Sprawdźmy, jak połączyć Twoje systemy”.
- Długi napis dużego przycisku łamie się na telefonie na dwa wiersze wewnątrz pigułki (S04, „Sprawdźmy, jak połączyć Twoje systemy”); to celowa poprawka z `podstrony.css`, ale kształt przestaje być pigułką [P].

**Reguła wyboru [R]** (dziś jej nie ma): akcentowy = jedyne główne działanie ekranu („umów konsultację”) na każdym tle; ciemny / jasny = to samo działanie w stałym nagłówku i w miejscach, gdzie akcentowy by się powtarzał; z obrysem = działanie drugie; bez tła = nawigacja. Napis głównego działania jeden w całej stronie.

**Typografia:** Onest 620, −0,01em (D §3.2).

**Zachowanie:** wciśnięcie skaluje do 0,97 [P] deklaracja. Stan nieaktywny: tylko przycisk formularza (`opacity .65`), nie pokazano [?].

**Dostępność:** tekst na akcentowym `--ink` 6,03:1 [P]. Fokus: obrys 3 px [P]. Wszystkie rozmiary ≥ 40 px [P].

---

## 3. Przycisk okrągły, odnośnik w tekście, przełącznik

| Element | Wygląd [P] | Gdzie | Uwagi |
| --- | --- | --- | --- |
| Przycisk okrągły `.round-btn` | 52×52 px, `--mist`, ikona 20 px; nieaktywny: 35% krycia | strzałki karuzeli (S01) | po najechaniu odwrócenie; etykiety `aria-label` w kodzie |
| Przycisk filmu `.film-toggle` | 52×52 px, „szkło” z obrysem | prawy dolny róg filmu (S01, S03) | `aria-pressed` zmienia ikonę |
| Odnośnik w tekście `.link-btn` | podkreślenie, kolor tekstu otoczenia | wstępy sekcji, stopka, FAQ | wysokość 20–23 px |
| Przełącznik `.seg` | pigułki 44 px, wybrana `--ink` / biały; niewybrana biała z obrysem `--line` | kalkulator (40 / 60 / 80%), pakiety („Wdrożenie” / „Stała opieka”) | dwa warianty: osobne pigułki (kalkulator) i wspólna kapsuła `--mist` (pakiety) |
| Plus FAQ `.plus` | koło 36 px, obraca się i zmienia w minus | FAQ | ozdobny, `aria-hidden` |

**Niespójności** [P]: odnośnik w tekście ma dwa kolory zależnie od miejsca — kolor otoczenia z podkreśleniem (strony ofertowe) i `--accent-deep` (polityka prywatności, S13). Przełącznik pakietów używa roli `tablist` bez paneli zakładek [P] kod, [T] czytnik.

**Dostępność:** odnośniki w tekście są zwolnione z minimum 24 px (2.5.8, wyjątek „w zdaniu”). Niewybrana pigułka przełącznika: wypełnienie białe na `--mist` 1,13:1, obrys 1,37:1 — granica kontrolki poniżej 3:1; kontrolkę identyfikuje napis [P], ocena 1.4.11 [T].

---

## 4. Etykieta (pigułka)

| Wariant | Wygląd [P] | Gdzie |
| --- | --- | --- |
| Szklana `.chip-glass` | 34 px, biały 16% + rozmycie, Instrument Sans 600 14 px | nad tytułem hero |
| Wyróżnik pakietu `.plan-flag` | `--accent` / `--ink`, 13 px 650 | pakiet „Scale” |
| Kategoria karty `.use-tag` | 12% koloru tekstu karty, 14 px 600 | karty karuzeli |
| Techniczna `.feed-tag` i etykiety w ekranach | JetBrains Mono 11 px, wersaliki, obrys | kanał zdarzeń, makiety |

**Niespójność** [P]: cztery osobne klasy o zbliżonej roli i trzech rozmiarach pisma (11, 13, 14 px). **[R]** jedna rodzina z osią „waga” (szklana, pełna, przygaszona, techniczna).

**Dostępność:** etykieta nie jest kontrolką. „Przykład” i „widok przykładowy” niosą ważną informację (że ekran jest poglądowy) pismem 11 px [P]; kontrast `--on-night-2` na ciemnym 9,06:1 [P].

---

## 5. Hero

**Przeznaczenie.** Pierwszy ekran strony głównej. Jedno wystąpienie.

**Anatomia** (S01 góra) [P]:

| Część | Wymagana | Uwagi |
| --- | --- | --- |
| Scena: ciemny kontener 1416×820 px, `--r-xl`, 12 px od krawędzi | tak | poświata śliwkowa i pomarańczowa w ruchu |
| Film „sieć węzłów” w prawej górnej części, maskowany | tak | 12 s, pętla, bez przycisku wstrzymania |
| Etykieta, tytuł `.display`, wstęp, dwa przyciski | tak | lewa dolna część |
| Kanał zdarzeń „Na żywo w Twojej firmie” z etykietą „przykład” | tak | 4 pozycje, na telefonie 2; pozycje wymieniają się |

**Wariant mobilny** (S02) [P]: film nad tekstem, przyciski na całą szerokość, scena 949 px wysokości. Pierwszy ekran telefonu (844 px) mieści film, etykietę, tytuł, wstęp i oba przyciski (629–753 px od góry); kanał zdarzeń zaczyna się na 785 px i jest ucięty zgięciem.

**Niespójność** [P]: podstrony nie mają odpowiednika hero. Ich pierwszy ekran to sam tekst na białym (S03, S05, S06). Rodzina „scena z poświatą” wraca dopiero w filmie i pasku końcowym.

**Tokeny:** `--night`, `--plum`, `--accent`, `--glass`, `--r-xl` (D §3).

**Zalecane / niewskazane** [R]: kanał zdarzeń zawsze z etykietą „przykład” (jest) — bez niej wygląda jak dane prawdziwej firmy.

**Dostępność:** film nie ma ani `aria-hidden`, ani opisu [P] kod; ruch trwa dłużej niż 5 s i startuje sam, bez przycisku wstrzymania (2.2.2 A) [T]. Przy pierwszej wizycie baner zgody zasłania główny przycisk — karta 21.

---

## 6. Nagłówek sekcji

**Przeznaczenie.** Tytuł sekcji ze wstępem. Na podstronach ta sama rodzina niesie tytuł strony, przyciski, linię autora, a czasem całą treść sekcji.

**Anatomia:** tytuł (`.h2`, na górze podstrony `.display-2`), wstęp `.lead`, opcjonalnie: dodatkowy akapit, lista z ptaszkami, przyciski, linia autora [P] (S03).

**Warianty** [P]: wyśrodkowany, maks. 880 px (domyślny) · do lewej `.left` (tylko FAQ) · w karuzeli: do lewej ze strzałkami po prawej.

**Niespójności** [P]:

- Na podstronach wyśrodkowane są także długie akapity. Bloków wyśrodkowanego tekstu o 3 i więcej wierszach jest 1–4 na stronę przy 1440 px i 5–13 przy 390 px (P → `centeredBlocks3PlusLines`; najwięcej w `jak-wybrac-pierwszy-proces`: 13).
- W jednym nagłówku występują dwa style akapitu w odwróconej hierarchii: wstęp 19,44 px w szarym `--ink-2`, a pod nim akapit 17 px w czarnym `--ink` (S03, sekcja „Jak połączyć system HR…”; D: `e28` i `e38`). Mniejszy tekst jest ciemniejszy od większego.
- Sekcje „Zapis z kontrolą”, „Co dostajesz po konsultacji” to sam nagłówek sekcji bez żadnego komponentu pod spodem (S03) — tytuł 56 px nad trzema wierszami tekstu, z odstępem 132 px z każdej strony.
- Polityka prywatności, jedyna strona z tekstem do lewej w kolumnie 780 px, czyta się najwygodniej (S13).

**Wymiary** [P]: odstęp pod nagłówkiem `clamp(36px, 5vw, 64px)`; odstęp wewnątrz 20 px.

**Zalecane / niewskazane** [R]:

| Zalecane | Niewskazane | Powód |
| --- | --- | --- |
| Wyśrodkowanie dla tytułu i jednego krótkiego wstępu (do 2–3 wierszy) | Wyśrodkowane akapity, listy i objaśnienia | Wyśrodkowany tekst gubi początek wiersza; im dłuższy, tym trudniej wrócić wzrokiem |
| Treść sekcji w komponencie (karta, tabela, lista) albo w kolumnie do lewej | Sekcja złożona z samego nagłówka | Tytuł 56 px obiecuje więcej niż trzy wiersze |

**Dostępność:** hierarchia nagłówków poprawna [P]. Długość wiersza: mediana 42–70 znaków, maksimum do 116 znaków w `porownanie-rozwiazan` przy 1440 px (P → `lineLength`); zalecenie 1.4.8 AAA to do 80 znaków.

---

## 7. Liczby

Cztery kolumny pod hero: linia 2 px `--ink`, liczba Onest 750 60 px (36 px na telefonie), opis 15 px `--ink-2` [P] (S01). Na telefonie dwie kolumny (S02). Liczba narasta przy wejściu w ekran [P] kod.

**Niespójność** [P]: rodzina występuje tylko na stronie głównej, choć podstrony mają własne liczby w tekście (np. „ok. 12 godzin tygodniowo mniej”, „ok. 90% mniej korekt” w opisie wdrożenia, S03). Tam są zwykłym zdaniem w karcie.

**Dostępność:** licznik animowany zmienia tekst przez 1,4 s; przy ograniczonym ruchu pokazuje wynik od razu [P] kod.

---

## 8. Karta bento z makietą

**Przeznaczenie.** Cztery duże karty opisujące obszary oferty; każda z ruchomą makietą interfejsu. Tylko strona główna (S01).

**Anatomia:** tytuł `.h3`, opis, makieta albo film w tle [P].

**Warianty** [P]:

| Wariant | Tło | Makieta |
| --- | --- | --- |
| `.card-mist` | `--mist` | lejek z kartą firmy, która wędruje po kolumnach |
| `.card-night` | `--night` | rozmowa z agentem |
| `.card-accent` | `--accent` | dokument ze „skanerem” i odczytanymi polami |
| `.card-video` | film + ciemny gradient | pulpit zarządczy (film `dashboard`) |

**Układ** [P]: siatka 12 kolumn, karty 7 + 5 i 5 + 7, odstęp 20 px, min. wysokość 500 px, `--r-lg`, wnętrze 40 px. Na telefonie jedna kolumna.

**Zachowanie** [P]: po najechaniu −6 px i cień; makiety chodzą w pętlach 7–10 s; mają `aria-hidden`.

**Niespójność** [P]: film w tej karcie ma 1280×720, pozostałe filmy 1600×900. Na pełnym zrzucie S01 karta „Raporty, które liczą się same” wygląda jak rozmyta plama, bo zrzut złapał pierwszą klatkę filmu (wejście z przenikaniem); plik plakatu pokazuje pełny pulpit.

**Dostępność:** film w karcie bez przycisku wstrzymania i bez opisu [P]; makiety w pętli (2.2.2 A) [T]. Tekst na karcie akcentowej: `--ink` przy 82% krycia na `--accent` 4,83:1 [P] policzone.

---

## 9. Karta z obrysem

**Przeznaczenie w materiałach** — jedna klasa `.trust`, cztery role [P]:

| Rola | Gdzie | Zawartość |
| --- | --- | --- |
| Zapewnienie z ikoną | strona główna, „Dane firmy zostają pod Waszą kontrolą” (S01) | ikona 44 px `--accent-deep`, tytuł, zdanie |
| Problem bez ikony | „Znasz to z własnej firmy?” (S03) | tytuł, akapit |
| Opis wdrożenia `.dowod` | „Jak to działa w praktyce” (S03, S07) | tytuł, akapity; maks. 880 px; opcjonalnie podpis, cytat, tabela (nie pokazano — pola puste) |
| Zestaw „Dziś / Po wdrożeniu / Co zostaje człowiekowi” | `finanse` (S08), 10 kart | tytuł, akapit albo lista z ptaszkami |

**Anatomia:** obrys `--line`, `--r-lg`, wnętrze 36 px (24 px na telefonie), tytuł `.h4` albo `.h3`, tekst 17 px `--ink-2` [P].

**Niespójności** [P]:

- Nazwa klasy („trust”) opisuje pierwszą rolę; trzy pozostałe ją pożyczają. Bez ikony karta jest lżejsza wizualnie niż sąsiednie komponenty i przy trzech w rzędzie ginie na białym tle (obrys 1,37:1).
- Opis wdrożenia — najmocniejszy dowód sprzedażowy — ma najskromniejszą formę na stronie: jedna wąska karta z dwoma akapitami szarego tekstu (S03 „Agencja pracy”, S07 „Zakład produkcyjny”). Liczby wyniku („ok. 12 godzin”, „ok. 90%”) nie są wyróżnione.
- W zestawie na `finanse` trzy karty w rzędzie mają różną wysokość treści i równą wysokość ramki; środkowa (lista) jest wyraźnie cięższa (S08).

**Zalecane / niewskazane** [R]:

| Zalecane | Niewskazane | Powód |
| --- | --- | --- |
| Osobna rodzina „opis wdrożenia” z wyróżnioną liczbą wyniku | Dowód w tej samej karcie co drobne zapewnienia | Dowód ma przekonać; dziś wygląda jak przypis |
| Karta z obrysem dla krótkich, równoległych faktów (3 w rzędzie) | Karta z obrysem jako pojemnik na długi tekst | Obrys nie dźwiga akapitów |

**Dostępność:** po najechaniu obrys ciemnieje, choć karta nie jest klikalna — sygnał interakcji bez interakcji [P]. Kontrast tekstu 6,50:1 [P].

---

## 10. Karuzela i karta zastosowania

Sześć kart 384×500 px przewijanych w poziomie, strzałki po prawej nad kartami (S01). Karta: etykieta działu, tytuł `.h3`, 3 punkty, duża ikona liniowa w rogu [P].

**Warianty tła** [P]: `--night` (ikona `--accent`), `--mist`, `--accent`, `--plum` (ikona `--rose`). Wariant śliwkowy jest jedynym miejscem, gdzie `--plum` jest tłem, a nie poświatą.

**Zachowanie** [P] kod: przeciąganie myszą, przyciąganie do karty, strzałki; kontener ma `tabindex="0"` i etykietę.

**Dostępność:** na telefonie widać jedną kartę i fragment drugiej; liczby kart nie widać (brak wskaźnika postępu) [P] S02. Obsługa strzałkami klawiatury [T].

---

## 11. Kalkulator

Dwie połowy w jednej scenie `--r-xl` (S01): lewa `--mist` z trzema suwakami i przełącznikiem, prawa `--night` z wynikiem 120 px, dwoma paskami, dwiema wartościami, przyciskiem jasnym i wzorem drobnym pismem [P]. Na telefonie jedna pod drugą (S02).

| Część | Wartości [P] |
| --- | --- |
| Suwak | tor 6 px, wypełnienie `--ink`, reszta `--mist-2`; uchwyt 28 px biały z obrysem 7 px `--ink` |
| Wartość suwaka | Onest 720 22 px, po prawej od etykiety |
| Wynik | Onest 780, 120 / 64 px |

**Dostępność:** niewypełniona część toru 1,12:1 względem tła — zakres suwaka jest praktycznie niewidoczny; uchwyt widoczny [P]. Pole trafienia suwaka 28 px [P]. Wynik zmienia się na żywo: ogłaszanie zmian czytnikowi [T].

---

## 12. Pasmo procesu z ekranem

Ciemna scena na całą szerokość: po lewej cztery kroki, po prawej przyklejony „ekran” z paskiem okna i czterema widokami zmienianymi przewijaniem (S01). Krok: etykieta maszynowa `--accent`, tytuł 40 px, opis, wyróżnienie z pionową kreską [P].

**Zachowanie** [P]: aktywny krok ma pełne krycie, pozostałe 32%. Na telefonie ekran przykleja się pod nagłówkiem, kroki przewijają się pod nim (S02).

**Dostępność:** tekst nieaktywnych kroków ma po przygaszeniu ok. 2:1 (policzone: `--on-night-2` przy 32% na `--night` 1,99:1) [P]; treść jest czytelna dopiero po dojściu do kroku. Przy wyłączonym JavaScripcie albo druku trzy z czterech kroków zostają przygaszone [?].

---

## 13. Taśma nazw

Dwa rzędy pigułek 68 px przesuwających się w przeciwne strony, 48 s na obieg; co któraś pigułka ciemna albo akcentowa; krawędzie wygaszone maską (S01) [P].

**Uwaga do treści** [P]: taśma wymienia nazwy własne systemów. Decyzje D-018 i D-033 mówią o kategoriach zamiast nazw; D-015 mówi, że strona główna zostaje bez zmian. Zostawiam to jako obserwację do rozstrzygnięcia przez właściciela.

**Dostępność:** ruch w pętli zatrzymuje się tylko po najechaniu myszą; z klawiatury i na telefonie nie da się go wstrzymać (2.2.2 A) [T].

---

## 14. Film

**Przeznaczenie.** Pokazać przepływ, którego nie da się opowiedzieć jednym zdaniem. Każda podstrona ofertowa ma na niego miejsce (D-022).

**Anatomia** [P] (S01, S03): nagłówek sekcji (tytuł, zdanie, lista 3–4 kroków) → scena 16:9 z `--r-xl`, maks. 1480 px → przycisk wstrzymania w prawym dolnym rogu.

**Warianty** [P]: „film” (wideo + przycisk) i „kadr” (sam obraz; stan przewidziany w kodzie, dziś nieużywany — wszystkie 6 podstron ma film).

**Język filmów** (S16) [P]: ciemna scena z tą samą poświatą co hero; panele z paskiem okna; pola z etykietą maszynową; zielone znaczniki „zapisane”, pomarańczowe „do decyzji”; biała karta jako wynik albo dziennik; oś czasu na dole w 3 z 9 filmów.

**Niespójności** [P]:

- Plakaty (pliki `.jpg`) pokazują pełny, końcowy stan sceny — to działa dobrze, także przy ograniczonym ruchu, kiedy film nie startuje. Puste panele na zrzutach S05, S06, S07, S09 to pierwsza klatka już uruchomionego filmu, nie plakat. Każdy obieg pętli zaczyna się jednak od pustych paneli; na klatkach z 15% długości (S16) w części filmów widać dopiero pierwsze elementy.
- Film `agent-demo` pokazuje firmę „Stalmet Sp. z o.o.” ([klatka](zrzuty/film-agent-demo-stalmet.webp)); na stronie ta sama firma nazywa się „POLPAK Sp. z o.o.” (D-027).
- Film `dashboard` ma 1280×720, pozostałe 1600×900.
- Na telefonie scena ma 315 px szerokości; napisy w kadrze projektowane na 1600 px są nieczytelne (S04). Sens niesie wtedy lista kroków nad filmem.

**Zachowanie** [P]: start po wejściu w ekran, pętla, bez dźwięku; scena lekko rośnie przy przewijaniu (`data-scale`); przycisk przełącza `aria-pressed`.

**Zalecane / niewskazane** [R]:

| Zalecane | Niewskazane | Powód |
| --- | --- | --- |
| Plakat = klatka z pełnym, zrozumiałym stanem (tak jest dziś) | Plakat = pierwsza klatka | Pierwsza klatka jest pusta z natury animacji |
| Lista kroków obok filmu zawsze (jest) | Informacja wyłącznie w filmie | Film na telefonie jest nieczytelny i bywa zatrzymany |
| Nazwy i dane w filmie zgodne ze stroną | Osobne dane w scenach filmowych | Rozjazd widać od razu |

**Dostępność:** `aria-label` z opisem na 7 z 9 filmów; brak na filmie hero i w karcie „Raporty” [P]. Brak ścieżki dźwiękowej, więc napisy nie są wymagane [P] `ffprobe`. Tekst w filmie to obraz tekstu (1.4.5 AA) — treść powtórzona w liście [P].

---

## 15. Pakiet

Karta `--mist` albo wyróżniona `--night` z etykietą „Najczęściej wybierany” (S01, S06). Części: nazwa (36 px), dla kogo, wiersz ceny między liniami, lista z ptaszkami, przycisk [P].

**Warianty** [P]: 3 w rzędzie z przełącznikiem „Wdrożenie / Stała opieka” (strona główna) · 2 w rzędzie, wyśrodkowane, z obiema listami naraz (`dla-firm`).

**Niespójność** [P]: ten sam pakiet ma dwa układy treści — przełączany (strona główna) i rozwinięty (`dla-firm`). Wiersz ceny mówi „Wycena po audycie” / „Wycena indywidualna”; kwot nie ma (otwarta kwestia z rejestru, D-029).

**Dostępność:** ptaszki w wyróżnionym pakiecie `--accent` na `--night` [P]. Przełącznik: karta 3.

---

## 16. Pytania i odpowiedzi

Dwie kolumny: nagłówek do lewej (przyklejony) i lista (S01, S03). Wiersz: pytanie Onest 650 22 px + koło z plusem; odpowiedź 17 px `--ink-2`, rozwija się płynnie [P]. Pierwsze pytanie otwarte.

**Niespójność** [P]: wiersz pytania nie reaguje na najechanie (P → `stany_hover[".qa button"].bezZmiany: true`), choć cały jest klikalny. To jedyna kontrolka strony bez reakcji.

**Dostępność:** `button` w `h3`, `aria-expanded`, `aria-controls`, panel `role="region"` [P] kod — zgodne ze wzorcem APG „Accordion”; działanie z klawiatury i czytnikiem [T].

---

## 17. Tabela

Ramka z obrysem `--line` i `--r-md` 18 px; nagłówek `--mist`, Onest 650 15 px; komórki 15 px `--ink-2`, 12×16 px (S03, S07, S13) [P].

**Warianty** [P]: nagłówek kolumn (większość) · nagłówek kolumn i wierszy (`porownanie-rozwiazan`, S11) · z kodem maszynowym w komórkach (polityka, S13).

**Niespójności** [P]:

- Tabela to jedyny komponent z zaokrągleniem 18 px; wszystko wokół ma 32–40 px albo 999 px.
- Treść merytoryczna stron (drogi łączenia, kryteria, pola) jest w kolorze drugorzędnym `--ink-2` i w rozmiarze 15 px, mniejszym niż tekst otoczenia (17 px).
- Na telefonie tabela ma stałe minimum 560 px przy ramce 356 px i przewija się w poziomie; ostatnia kolumna jest ucięta bez żadnego sygnału (S04). Dotyczy 11 tabel na 7 stronach (P → `tables[].overflow`).

**Dostępność:** `th scope` jest [P]; podpisu tabeli (`caption`) nie ma [P]; ramka przewijana nie jest osiągalna z klawiatury (brak `tabindex`) — przy powiększeniu treść poza ramką jest niedostępna bez myszy (2.1.1 A) [T].

**Zalecane / niewskazane** [R]: na telefonie tabela 3–4-kolumnowa jako karty „wiersz po wierszu” albo z wyraźnym cieniem krawędzi i podpowiedzią przewijania; treść komórek kolorem `--ink`.

---

## 18. Listy: z ptaszkami i kroki

| Wariant | Wygląd [P] | Gdzie |
| --- | --- | --- |
| Z ptaszkami `.ticks` | 15 px, czarne koło 18 px z białym ptaszkiem; w wyróżnionym pakiecie koło akcentowe | pakiety, obok filmu, karty na `finanse`, poradniki |
| Kroki `.kroki` + `.ticks` | jak wyżej, ale 19,44 px, kolumna 62 znaki | „Od rozmowy do działającej integracji” (S03) |
| Punkty karty zastosowania | kropka 7 px w kolorze tekstu | karuzela |

**Niespójności** [P]:

- Ptaszek oznacza „w zestawie” w pakiecie, „krok” w sekcji kroków i „argument” w poradniku (S11: „Kiedy ma sens”, „Warunek”, „Gdzie się kończy”). W poradniku ptaszek stoi także przy ograniczeniach i wadach.
- Kroki, które mają kolejność, nie mają numerów (S03).
- Dwa rozmiary tej samej listy: 15 px i 19,44 px.

**[R]** ptaszek tylko dla „zawiera / spełnione”; kroki numerowane; argumenty w poradniku jako zwykłe akapity z pogrubionym początkiem.

---

## 19. Pasek końcowy i strona błędu

Ciemna scena `--r-xl` z poświatą w trzech barwach, tytuł `.display-2`, zdanie, działanie (S01 koniec, S03 koniec, S12, S14) [P].

| Wariant | Działanie | Gdzie |
| --- | --- | --- |
| Z adresem | kapsuła „szklana”: adres e-mail + przycisk akcentowy; pod spodem „Kopiuj adres” | strona główna, `kontakt` |
| Z jednym przyciskiem | przycisk jasny duży | 9 podstron |
| Strona błędu `.lost` | etykieta maszynowa „Błąd 404”, dwa przyciski | `404` |

**Niespójność** [P]: tytuł paska końcowego ma ten sam rozmiar co tytuł strony (72 px) — na podstronie koniec jest wizualnie równy początkowi. Wariant: karta 2.

**Dostępność:** biały tekst na scenie z poświatą — tło pod tekstem zmienia się w ruchu; najjaśniejszy fragment poświaty pod tytułem [S] wymaga pomiaru na żywo [T].

---

## 20. Stopka

| Wariant | Zawartość [P] | Gdzie |
| --- | --- | --- |
| Pełna | logo i zdanie, 4 kolumny odnośników, dane firmy, zastrzeżenie | strona główna i 9 podstron |
| Skrócona | dane firmy i 3 odnośniki | `kontakt`, `polityka-prywatnosci` |
| Brak | — | `404` |

Odnośniki 15 px `--ink-2`, wysokość 22,5 px, odstęp 10 px; dane firmy 13 px [P]. Pełna stopka, tak jak menu, prowadzi do kotwic strony głównej; z podstron jest tylko „Finanse” [P]. Nagłówki kolumn to `h4` z `aria-level="2"` [P] kod.

---

## 21. Baner zgody

Ciemny panel 420 px w lewym dolnym rogu: tytuł, zdanie z odnośnikiem, dwa przyciski równej szerokości — „Odrzucam” (cichy) i „Zgadzam się” (akcentowy) (S15) [P].

**Ustalenia** [P] (P → `baner_zgody_desktop`, `baner_zgody_mobile`):

- Przy 1440×900 baner zasłania w 100% główny przycisk hero „Umów bezpłatną konsultację” i 56% wstępu.
- Przy 390×844 zajmuje 27% ekranu i zasłania w 100% oba przyciski hero.
- W kodzie strony jest ostatnim elementem (`8/8`), więc z klawiatury dochodzi się do niego po przejściu całej strony.
- Ma `role="dialog"`, bez `aria-modal`.

**Dostępność:** przycisk hero, który dostaje fokus z klawiatury, jest całkowicie zasłonięty banerem — to dokładnie przypadek z kryterium 2.4.11 „fokus niezasłonięty” (AA) [P] geometria, [T] na produkcji. Odrzucenie i zgoda mają równą wagę wymiarów, różną koloru.

**[R]** baner tam, gdzie nie zasłania głównego działania (prawy dół na komputerze albo wąski pasek), i wcześniej w kolejności fokusu.

---

## 22. Formularz kontaktowy i strona tekstowa

**Formularz** — nie pokazano w materiałach (nie renderuje się bez klucza Turnstile). Z deklaracji [P] kod: pola białe z obrysem `#b8b5c4` i zaokrągleniem 12 px, etykiety nad polami, dwa pola w rzędzie od 700 px, błąd `#ffb8b8`. Kolory i zaokrąglenie spoza tokenów. Wszystko inne [?] / [T].

**Strona tekstowa `.doc-page`** (S13) [P]: kolumna 780 px do lewej, tytuł w rozmiarze `.h2`, śródtytuły 24 px, tekst 17 px `--ink-2`, odnośniki `--accent-deep`, tabele jak w karcie 17. To jedyny układ z tekstem do lewej i jedyny, w którym odnośnik ma kolor.

---

## Zestawienie niespójności

| # | Niespójność | Rodziny | Skutek |
| --- | --- | --- | --- |
| N1 | Słownik strony głównej (hero, liczby, bento, kalkulator, pasmo procesu, karuzela, taśma) nie istnieje na podstronach | 5, 7, 8, 10–13 | Podstrony wyglądają jak inny, skromniejszy produkt: 13–16% ciemnych scen wobec 37% |
| N2 | Główne działanie w czterech wyglądach i siedmiu napisach | 2, 19 | Brak jednego rozpoznawalnego „przycisku REVAGY” |
| N3 | Jedna karta w czterech rolach, w tym jako dowód wdrożenia | 9 | Dowód sprzedażowy ma najsłabszą formę |
| N4 | Wyśrodkowane długie teksty i sekcje z samego nagłówka | 6 | Podstrony czyta się gorzej niż politykę prywatności |
| N5 | Ptaszek w trzech znaczeniach, kroki bez numerów | 18 | Znacznik przestaje coś znaczyć |
| N6 | Tabela: inne zaokrąglenie, szary drobny tekst, ucięcie na telefonie | 17 | Najbardziej merytoryczna treść jest najmniej czytelna |
| N7 | Trzy nagłówki strony, dwie stopki; menu nie prowadzi do podstron | 1, 20 | Oferta z podstron niewidoczna w nawigacji |
| N8 | Inna nazwa firmy w filmie niż na stronie; jeden film w niższej rozdzielczości; film na telefonie nieczytelny | 14, 8 | Główny nośnik obrazu rozjeżdża się ze stroną i nie działa na telefonie |
| N9 | Wartości spoza tokenów: kolory formularza; zaokrąglenia 26, 24, 16, 14, 12 px; 12 grubości pisma | 22, wspólne | Trudniej utrzymać spójność przy kolejnych ekranach |
| N10 | Baner zgody zasłania główny przycisk | 21, 5 | Pierwsza wizyta bez widocznego głównego działania |

## Otwarte kwestie do właściciela

1. Czy podstrony ofertowe mają wejść do menu i stopki? (N7)
2. Czy przyjąć jedną regułę przycisku głównego? (N2) — propozycja w karcie 2.
3. Formularz kontaktowy: potrzebuję zrzutu z produkcji albo buildu z kluczem, żeby go opisać.
4. Taśma nazw systemów na stronie głównej wobec D-018 / D-033 — zostaje czy przechodzi na kategorie?

Ten etap kończy się na dokumentacji. Pakiet dla agenta (`design.md` + style + przykłady użycia) to osobny krok, o który zapytam po Twojej ocenie tego dokumentu.
