# Audyt designu i identyfikacji wizualnej REVAGY

Karta: T-026 (założona jako T-024; numer zmieniony po kolizji z dwiema innymi kartami T-024) · Data: 22.11.2026 · Zakres: tylko analiza, bez zmian w kodzie strony.
Stan badany: lokalny build `main` 43efbf5 (`npm run build` + `astro preview`), 12 stron, komputer 1440×900 i telefon 390×844.
W trakcie audytu `main` doszedł do 5bac11d: jedyna zmiana strony to dłuższe zdanie w banerze zgody (D-040). Baner zmierzyłem ponownie na 5bac11d; reszta pomiarów jest z 43efbf5.

Materiały:

- [DESIGN.md](audyt-design/DESIGN.md) — styl, tokeny, typografia, kolory, komponenty, każda wartość z dowodem.
- [komponenty.md](audyt-design/komponenty.md) — 22 rodziny komponentów, warianty, niespójności, dostępność (v1, do oceny).
- [moodboard.html](audyt-design/moodboard.html) — kierunki rozwoju na tle konkurencji. **Czeka na Twój wybór.**
- [zrzuty/](audyt-design/zrzuty/) — wszystkie strony na obu szerokościach, klatki filmów.
- [design-evidence/](audyt-design/design-evidence/) — migawki stylów i [pomiary-dodatkowe.json](audyt-design/design-evidence/pomiary-dodatkowe.json).

Rejestr decyzji stosuję bez podważania. Trzy decyzje wyznaczają ramę tego audytu: wygląd strony głównej zostaje
w 100% (D-015), rozbudowa idzie małymi etapami, a kryterium odbioru każdego etapu to brak naruszeń układu,
kolorów, kroju i odstępów strony głównej (D-021). Dlatego lista zmian dotyczy przede wszystkim podstron i zasobów marki.
Tam, gdzie obserwacja dotyka strony głównej, zaznaczam to i zostawiam decyzję Tobie.

## 1. Wniosek w pięciu zdaniach

1. Strona główna ma spójny, rozpoznawalny styl: jasna baza, duże ciemne zaokrąglone sceny z poświatą, jeden gorący akcent, animowany interfejs zamiast zdjęć.
2. Podstrony używają tych samych kolorów i krojów, ale innej kompozycji: wyśrodkowany tekst na białym, tabele i listy. Ciemne sceny zajmują 37% strony głównej i 6–16% podstron, więc podstrony wyglądają jak skromniejszy produkt tej samej firmy.
3. Marka jest konsekwentna w kolorze, kroju i filmach, a niekompletna jako identyfikacja: nie ma plików logo ani zasad jego użycia, nie ma żadnej fotografii, twarzy ani znaku klienta.
4. Rzemiosło jest dobre: kontrast tekstu co najmniej 4,7:1, widoczny fokus na każdym elemencie, pełna obsługa ograniczonego ruchu, zero przepełnień poziomych i zero błędów skryptów na 24 widokach.
5. Trzy rzeczy wymagają poprawki niezależnie od kierunku: film z nazwą „Stalmet” wbrew D-027, baner zgody zasłaniający główny przycisk przy pierwszej wizycie i menu, które nie prowadzi do podstron.

## 2. W jakim stylu jest strona

**Nazwa robocza: „scena produktu”.** Strona wygląda jak strona produktu finansowo-technologicznego, zgodnie z D-002
(układ i ruch wzorowane na Revolut Business) i D-005 (wygląd zatwierdzony).

| Cecha | Stan | Dowód |
| --- | --- | --- |
| Baza | białe tło, treść w kolumnie 1240 px | DESIGN.md §3.3 |
| Sceny | ciemne kontenery `#141114`, zaokrąglenie 40 px, 12 px od krawędzi okna, poświata pomarańcz + róż + śliwka | [index-desktop-gora](audyt-design/zrzuty/index-desktop-gora.webp) |
| Karty | „bento”: beżowa, ciemna, pomarańczowa, z filmem; zaokrąglenie 32 px | [index-desktop-cala-01](audyt-design/zrzuty/index-desktop-cala-01.webp) |
| Akcent | jeden: `#ff5b14`, zawsze z ciemnym tekstem | DESIGN.md §3.1 |
| Pismo | Onest (nagłówki, 720–750, ciasne), Instrument Sans (tekst 17 px), JetBrains Mono (etykiety techniczne 11–12 px) | DESIGN.md §3.2 |
| Kontrolki | pigułki 44 i 56 px | DESIGN.md §4 |
| Obraz | 9 filmów z animowanym interfejsem, makiety rysowane w CSS, ikony liniowe; **zero zdjęć, zero plików graficznych w treści** | pomiary → `images` puste na 12 stronach |
| Ruch | pojawianie się sekcji, 26 animacji w pętli na stronie głównej, filmy startujące w ekranie | DESIGN.md §3.5 |
| Ton | techniczny, konkretny, „produktowy”; ekrany przykładowe są podpisane jako przykładowe | etykiety „przykład”, „widok przykładowy”, „dane poglądowe” |

Co ten styl komunikuje: nowoczesność, porządek, „mamy produkt”. Czego nie komunikuje: kto to robi i dla kogo już zrobił.
REVAGY sprzedaje usługę wykonywaną przez konkretną osobę, a strona pokazuje wyłącznie interfejsy.

## 3. Co działa

| # | Co | Dowód |
| --- | --- | --- |
| 1 | Jeden świat wizualny strony głównej: trzy tła, jeden akcent, jedna rodzina zaokrągleń | [index-desktop-cala-01](audyt-design/zrzuty/index-desktop-cala-01.webp), [-02](audyt-design/zrzuty/index-desktop-cala-02.webp) |
| 2 | Typografia nagłówków: wyraźna skala 92 → 72 → 56 → 28 → 20 px, ten sam krój i charakter na każdej stronie | DESIGN.md §3.2 |
| 3 | Kontrast tekstu: najniższa para 4,71:1; tekst na pomarańczowym zawsze ciemny (6,03:1) | DESIGN.md §3.1 |
| 4 | Fokus z klawiatury: obrys 3 px na 40 z 40 sprawdzonych elementów, żaden niewidoczny | pomiary → `fokus_klawiatura` |
| 5 | Ograniczony ruch: 0 animacji, filmy zatrzymane na plakacie, treść od razu widoczna | pomiary → `ograniczony_ruch` |
| 6 | Struktura: jeden `h1`, brak przeskoków nagłówków, `main` i `lang="pl"` na 12 z 12 stron | pomiary → `headings`, `landmarks` |
| 7 | Telefon: zero przepełnień poziomych na 12 stronach, przyciski na całą szerokość, siatki w jednej kolumnie | [raport-zrzutow.json](audyt-design/zrzuty/raport-zrzutow.json), [index-mobile-cala-01](audyt-design/zrzuty/index-mobile-cala-01.webp) |
| 8 | Filmy mówią jednym językiem: ta sama poświata, panele z paskiem okna, zielone „zapisane”, pomarańczowe „do decyzji”, biała karta wyniku | [filmy-klatki](audyt-design/zrzuty/filmy-klatki.webp) |
| 9 | Filmy są lekkie i dobrze podane: 243–1061 KB, WebM + MP4, plakat z pełnym stanem sceny, lista kroków obok | `public/assets/video/`, komponenty.md karta 14 |
| 10 | Kroje na własnym serwerze, z licencjami, trzy rodziny w plikach zmiennych | `public/assets/fonts/` |
| 11 | Kalkulator: jedyny element, w którym odwiedzający coś robi; wynik 120 px to najmocniejszy punkt strony | [index-desktop-cala-01](audyt-design/zrzuty/index-desktop-cala-01.webp) |
| 12 | Uczciwe podpisy ekranów przykładowych | hero „przykład”, pasmo procesu „widok przykładowy” |
| 13 | Obraz do udostępnień zgodny z hero | `public/assets/img/og.jpg` |

## 4. Co nie działa

### 4.1 Błędy i sprzeczności

| # | Co | Dowód | Dotyka strony głównej |
| --- | --- | --- | --- |
| B1 | Film „agent-demo” pokazuje firmę „Stalmet Sp. z o.o.”; D-027 ustala „POLPAK Sp. z o.o.” i tak jest w tekście strony. Źródło sceny: `tools/scenes/agent-demo.html` | [klatka filmu](audyt-design/zrzuty/film-agent-demo-stalmet.webp) | tak — film, nie układ |
| B2 | Baner zgody przy pierwszej wizycie zasłania główny przycisk hero w 100% i 58% wstępu (komputer, baner 420×246 px); na telefonie zasłania oba przyciski w 100% i zajmuje 29% ekranu (358×267 px). Pomiar na `main` 5bac11d, po wydłużeniu zdania w D-040; przed nim baner był o 20 px niższy i zasłaniał to samo. Przycisk z fokusem jest wtedy niewidoczny (WCAG 2.2, 2.4.11 AA). Tekstu banera nie oceniam — ustala go D-040; chodzi o położenie | [komputer](audyt-design/zrzuty/index-desktop-baner-zgody-po-D-040.webp), [telefon](audyt-design/zrzuty/index-mobile-baner-zgody-po-D-040.webp); wcześniejszy pomiar: pomiary → `baner_zgody_*` | tak — baner, nie układ |
| B3 | Menu i stopka na podstronach prowadzą do kotwic strony głównej. Z 9 podstron w menu jest tylko „Finanse”; osiem pozostałych jest dostępnych wyłącznie z odnośników w treści. Nie ma stanu „jesteś tutaj” | komponenty.md karta 1; odnośniki w `dist/integracja-systemow.html` | tak — treść menu |
| B4 | Taśma na stronie głównej wymienia nazwy własne systemów; D-018 i D-033 mówią o kategoriach. D-015 mówi, że strona główna zostaje. Nie rozstrzygam | [index-desktop-cala-02](audyt-design/zrzuty/index-desktop-cala-02.webp) | tak |

### 4.2 Podstrony: ta sama marka, słabsza forma

| # | Co | Dowód |
| --- | --- | --- |
| S1 | Pierwszy ekran każdej podstrony to sam tekst na białym: tytuł 72 px, wstęp, dwa przyciski, linia autora. Żadnego obrazu, żadnej sceny. Na stronie głównej pierwszy ekran to scena 1416×820 px z filmem | [integracja-systemow-desktop-gora](audyt-design/zrzuty/integracja-systemow-desktop-gora.webp) obok [index-desktop-gora](audyt-design/zrzuty/index-desktop-gora.webp) |
| S2 | Siedem rodzin komponentów strony głównej (hero, liczby, bento, kalkulator, pasmo procesu, karuzela, taśma) nie występuje na żadnej podstronie. Podstrona składa się z 8 rodzin: nagłówek sekcji, karta z obrysem, tabela, lista, film, pakiet, pytania, pasek końcowy | komponenty.md, indeks i N1 |
| S3 | Ciemne sceny: 37% wysokości strony głównej, 13–16% podstron ofertowych, 6–7% poradników. Pomarańczowy przycisk występuje poza stroną główną tylko dwa razy: w pakiecie „Scale” na `dla-firm` i na `kontakt`; na 8 pozostałych podstronach nie ma go wcale | pomiary → `surface.darkShare`, `components[".btn-accent"]` |
| S4 | Wyśrodkowane długie teksty: 1–4 bloki o 3+ wierszach na podstronę (komputer), 5–13 (telefon). Wiersz do 116 znaków w `porownanie-rozwiazan`. Polityka prywatności — do lewej, 780 px — czyta się lepiej niż strony sprzedażowe | [porownanie-rozwiazan-desktop-cala-01](audyt-design/zrzuty/porownanie-rozwiazan-desktop-cala-01.webp), [polityka-prywatnosci-desktop-cala](audyt-design/zrzuty/polityka-prywatnosci-desktop-cala.webp) |
| S5 | Sekcje z samego nagłówka: tytuł 56 px, trzy wiersze tekstu, 132 px odstępu z każdej strony („Zapis z kontrolą”, „Co dostajesz po konsultacji”). Strona rośnie do 8–9,6 tys. px, a treści na ekran jest mało | [integracja-systemow-desktop-cala-02](audyt-design/zrzuty/integracja-systemow-desktop-cala-02.webp) |
| S6 | Opis wdrożenia, czyli dowód, ma najskromniejszą formę: wąska karta z dwoma akapitami szarego tekstu. Liczby wyniku („ok. 12 godzin tygodniowo”, „ok. 90% mniej korekt”) nie są wyróżnione | [integracja-systemow-desktop-cala-02](audyt-design/zrzuty/integracja-systemow-desktop-cala-02.webp), sekcja „Jak to działa w praktyce” |
| S7 | Tabele: treść merytoryczna szarym pismem 15 px; na telefonie 11 tabel na 7 stronach jest uciętych z prawej bez sygnału przewijania | [integracja-systemow-mobile-cala-01](audyt-design/zrzuty/integracja-systemow-mobile-cala-01.webp); pomiary → `tables` |
| S8 | Film na telefonie ma 315 px szerokości; napisy w kadrze są nieczytelne | [integracja-systemow-mobile-cala-01](audyt-design/zrzuty/integracja-systemow-mobile-cala-01.webp) |
| S9 | Ptaszek znaczy trzy rzeczy: „w zestawie”, „krok”, „argument” — także przy wadach i ograniczeniach. Kroki z kolejnością nie mają numerów | [porownanie-rozwiazan-desktop-cala-01](audyt-design/zrzuty/porownanie-rozwiazan-desktop-cala-01.webp) |
| S10 | Trzy warianty nagłówka strony i dwa stopki na 12 stron; `kontakt` — strona sprzedażowa — ma nagłówek skrócony jak tekst prawny | [kontakt-desktop-cala](audyt-design/zrzuty/kontakt-desktop-cala.webp) |

### 4.3 Drobniejsze

| # | Co | Dowód |
| --- | --- | --- |
| D1 | Główne działanie w czterech wyglądach (ciemny, jasny, akcentowy, z obrysem) i siedmiu napisach | komponenty.md karta 2 |
| D2 | Ruch w pętli bez przycisku wstrzymania: film w hero, film w karcie „Raporty”, taśma, makiety (WCAG 2.2.2 A — do sprawdzenia; ustawienie systemowe „ogranicz ruch” jest obsłużone) | pomiary → `ruch_domyslny` |
| D3 | Wiersz pytania w FAQ nie reaguje na najechanie; to jedyna kontrolka bez reakcji | pomiary → `stany_hover` |
| D4 | Wartości spoza tokenów: cztery kolory formularza, zaokrąglenia 26 / 24 / 16 / 14 / 12 px, 12 grubości pisma, 22 rozmiary pisma na stronie głównej | DESIGN.md §3.1–3.4 |
| D5 | Film `dashboard` ma 1280×720, pozostałe 1600×900 | `ffprobe` |
| D6 | Tytuł paska końcowego ma rozmiar tytułu strony (72 px) | komponenty.md karta 19 |
| D7 | Strona 404 bez stopki i bez odnośnika „Przejdź do treści” | [404-desktop-cala](audyt-design/zrzuty/404-desktop-cala.webp) |
| D8 | Formularza kontaktowego nie mogłem ocenić — nie renderuje się lokalnie bez klucza Turnstile | [kontakt-desktop-cala](audyt-design/zrzuty/kontakt-desktop-cala.webp) |

## 5. Spójność marki

| Obszar | Ocena | Stan | Czego brakuje |
| --- | --- | --- | --- |
| Logo | częściowa | Znak: zaokrąglony kwadrat z „R”; napis „REVAGY” krojem Onest 800. Ten sam znak w nagłówku, stopce, ikonie strony i obrazie do udostępnień | Pliku logo do użycia poza stroną (SVG, PNG), wersji na ciemne tło jako pliku, pola ochronnego, minimalnego rozmiaru. Napis jest tekstem, nie krzywymi. Znak skopiowany w kodzie 6 razy |
| Kolor | spójna na stronie głównej, zubożona na podstronach | 15 zmiennych, role stałe; akcent zawsze z ciemnym tekstem | Podstrony są prawie monochromatyczne: pomarańcz pojawia się w filmie, w poświacie paska końcowego i raz w pakiecie „Scale”. Filmy wprowadzają mocną zieleń statusów, której na stronie prawie nie ma. Formularz ma kolory spoza palety |
| Typografia | spójna | Trzy kroje, te same role wszędzie, skala nagłówków trzyma się na 12 stronach | Opisanej skali dla drobnych rozmiarów (11–16 px) i grubości (12 wartości). Dwa style akapitu w odwróconej hierarchii na podstronach |
| Ton wizualny | spójny w barwie, rozjechany w kompozycji | Strona główna: scena, bento, ruch. Podstrony: wyśrodkowany dokument | Wspólnej kompozycji pierwszego ekranu i sposobu pokazywania dowodu. Ludzi: zero zdjęć, zero twarzy; założyciel istnieje jako wiersz 14 px „Dawid Skibicki, założyciel REVAGY” |
| Filmy | spójne między sobą | 9 filmów, jeden język, 10–14 s, bez dźwięku | Zgodności danych ze stroną (B1), wersji czytelnej na telefonie (S8), jednej rozdzielczości (D5). Hero i karta „Raporty” bez opisu i bez przycisku wstrzymania |
| Ikony i ilustracje | spójne, skromne | Ikony liniowe w dwóch skalach, kolor z tokenów | Zestawu: jest 6 ikon w karuzeli i 3 w kartach; podstrony nie mają ani jednej |
| Poza stroną | niesprawdzone | Rejestr wskazuje profil LinkedIn (D-011) | Nie mam dostępu do profilu, więc nie porównałem logo, tła i opisu ze stroną |

Najważniejsza luka identyfikacji: marka istnieje tylko jako arkusz stylów jednej strony. Nie ma dokumentu ani plików,
z których ktoś trzeci (grafik, drukarnia, osoba robiąca prezentację albo post) złożyłby materiał REVAGY bez zaglądania do kodu.
`DESIGN.md` z tego audytu jest pierwszym takim opisem.

## 6. Lista zmian i braków

Priorytety: **P0** — błąd albo sprzeczność z decyzją, do poprawy niezależnie od kierunku · **P1** — duży wpływ na odbiór
podstron · **P2** — porządek i spójność · **P3** — braki do uzupełnienia z czasem.
Kolumna „Decyzja” mówi, czy pozycja dotyka strony głównej (D-015) i wymaga Twojej zgody, czy mieści się w rozbudowie podstron.

| Nr | Priorytet | Zmiana albo brak | Źródło | Decyzja |
| --- | --- | --- | --- | --- |
| 1 | P0 | Ponownie wyrenderować film „agent-demo” z nazwą „POLPAK Sp. z o.o.” (i sprawdzić pozostałe sceny w `tools/scenes/`) | B1, D-027, D-032 | wykonanie D-027; film strony głównej |
| 2 | P0 | Przestawić baner zgody tak, żeby nie zasłaniał głównego przycisku, i dać mu wcześniejsze miejsce w kolejności fokusu | B2 | dotyka pierwszego ekranu strony głównej — Twoja zgoda |
| 3 | P0 | Wpuścić podstrony do menu i stopki; dodać stan „jesteś tutaj” | B3 | zmienia treść menu strony głównej — Twoja zgoda |
| 4 | P0 | Rozstrzygnąć taśmę nazw systemów wobec D-018 / D-033 | B4 | Twoja decyzja |
| 5 | P1 | Pierwszy ekran podstrony ze sceną: tytuł w ciemnym kontenerze z poświatą albo z kadrem filmu obok | S1, S3 | podstrony (D-031); zależy od kierunku |
| 6 | P1 | Osobny komponent „opis wdrożenia” z wyróżnioną liczbą wyniku | S6 | podstrony; treść liczb i nazw wprowadzasz Ty (D-034) |
| 7 | P1 | Tekst treści do lewej w kolumnie do ok. 70 znaków; wyśrodkowanie tylko dla tytułu i krótkiego wstępu | S4 | podstrony |
| 8 | P1 | Sekcje bez komponentu połączyć w mniejszą liczbę sekcji albo dać im formę (karta, liczba, schemat) | S5 | podstrony |
| 9 | P1 | Tabela na telefonie: karty wiersz po wierszu albo wyraźny sygnał przewijania; treść kolorem podstawowym | S7 | podstrony |
| 10 | P1 | Jedna reguła przycisku głównego i jeden napis głównego działania; akcent wraca na podstrony | D1, S3 | podstrony; na stronie głównej bez zmian |
| 11 | P1 | Twarz i podpis: zdjęcie założyciela, sekcja „kto to robi” | §5 ton wizualny | Twoja decyzja; brak materiału |
| 12 | P2 | Księga znaku na jednej stronie: pliki logo (SVG, PNG, jasne i ciemne tło), pole ochronne, minimalny rozmiar, paleta, kroje | §5 logo | pliki raportu i zasoby; bez zmian strony |
| 13 | P2 | Przycisk wstrzymania ruchu dla filmu w hero, karty „Raporty” i taśmy | D2 | dotyka strony głównej — Twoja zgoda |
| 14 | P2 | Ptaszek tylko dla „zawiera / spełnione”; kroki numerowane | S9 | podstrony |
| 15 | P2 | Jeden nagłówek strony i jedna stopka dla wszystkich stron z treścią; `kontakt` z pełnym nagłówkiem | S10 | podstrony |
| 16 | P2 | Tokeny: kolory formularza, zaokrąglenia pośrednie, skala drobnych rozmiarów i grubości | D4 | porządek w CSS; bez zmiany wyglądu |
| 17 | P2 | Reakcja wiersza FAQ na najechanie | D3 | dotyka strony głównej — drobiazg, Twoja zgoda |
| 18 | P2 | Film `dashboard` w 1600×900 | D5 | film strony głównej |
| 19 | P3 | Wersja filmu na telefon (kadr pionowy albo powiększony fragment) | S8 | nowe filmy (D-022, D-032) |
| 20 | P3 | Obraz do udostępnień osobny dla każdej podstrony (dziś jeden dla wszystkich) | `PodstronaLayout.astro`, `MARKA.obraz` | podstrony |
| 21 | P3 | Zestaw ikon dla podstron w języku ikon strony głównej | §5 ikony | podstrony |
| 22 | P3 | Dowody z nazwiskiem: znaki klientów, cytaty | rejestr, otwarte kwestie; D-034 | czeka na Twoje materiały |
| 23 | P3 | Ocena formularza kontaktowego i menu na produkcji; porównanie z profilem LinkedIn | D8, §5 | potrzebny dostęp |
| 24 | P3 | Stopka i odnośnik „Przejdź do treści” na 404 | D7 | drobiazg |

Pozycje 5–11 zależą od kierunku, który wybierzesz w moodboardzie: każdy kierunek odpowiada na nie inaczej.

## 7. Kierunki rozwoju — do Twojego wyboru

Pełny materiał: [moodboard.html](audyt-design/moodboard.html). Próba: 16 działających stron — 7 firm usługowych od
automatyzacji (6 polskojęzycznych), 5 narzędzi do automatyzacji, 4 marki B2B o wyrazistej identyfikacji; 80 zrzutów
i pomiary stylów w [moodboard-evidence/](audyt-design/moodboard-evidence/). Revolut Business (wzorzec z D-002) i Make
zablokowały robota planszą „potwierdź, że jesteś człowiekiem”, więc nie ma ich w porównaniu.

Co widać w próbie:

- Ciemny albo barwny pierwszy ekran ma 7 z 16 stron; poświatę pokrewną hero REVAGY mają Automation House i LinkWith.it.
- Dowód z zewnątrz (znak klienta, ocena, opinia z nazwiskiem, liczba z odnośnikiem do opisu wdrożenia) pokazuje 14 z 16 stron. REVAGY jest dziś w grupie bez niego.
- Tytuł REVAGY (92 px, grubość 750) należy do najcięższych; większość próby mieści się w 48–72 px i 400–600.
- Żadna z sześciu polskojęzycznych firm usługowych nie używa schematu przepływu jako głównego obrazu.

Każdy kierunek odpowiada na pytanie, co ma być głównym obrazem podstrony. Żaden nie zmienia strony głównej (D-015).

| Kierunek | Główny obraz podstrony | Wzorce w próbie | Czego wymaga od Ciebie | Pozycje z listy zmian |
| --- | --- | --- | --- | --- |
| **A — Scena wszędzie** | ciemna scena z poświatą i kadrem filmu, jak na stronie głównej | Automation House, Mercury; przestroga: LinkWith.it | niczego | 5, częściowo 6 |
| **B — Dowód na papierze** | liczba z wdrożenia i dokument; jasny, rzeczowy układ do lewej | Flobotics, Ramp | liczb i z czasem zgód (D-034), kwot (D-029, D-030) | 5–9 |
| **C — Schemat przepływu** | schemat z węzłów-kategorii, bez nazw własnych systemów | n8n, Workato, Zapier; zalążek w hero REVAGY | niczego na start | 5, 8, 14, 21 |
| **D — Twarz i podpis** | zdjęcie założyciela i podpis pod obietnicą | Lindy, Digital Teammates, Office Samurai (postać) | zdjęcia i decyzji „ja” czy „my” | 11, 22, częściowo 5 |

Moja rekomendacja, niezatwierdzona: **B + C**. Papier, liczby i tekst do lewej rozwiązują najwięcej pozycji z listy (5–9),
a schemat z węzłów-kategorii daje podstronom własny obraz, który już istnieje w hero i zamienia D-033 w zasadę rysunku.
A zostaje tam, gdzie scena już jest (film, pasek końcowy). D dochodzi, gdy będzie zdjęcie.

**Pytanie do Ciebie:** który kierunek wybierasz — A, B, C, D czy połączenie (na przykład „B + C”)?
Po wyborze przygotuję pogłębione studium jednego kierunku i dopiero potem plan zmian do Twojej akceptacji.

## 8. Ograniczenia audytu

- Build lokalny, nie produkcja; jedna przeglądarka (Chromium), dwie szerokości (1440 i 390 px).
- Formularza kontaktowego, otwartego menu i menu mobilnego nie widziałem.
- Zgodności z WCAG nie stwierdzam: policzyłem kontrasty z tokenów, zmierzyłem fokus, cele dotykowe i geometrię banera; czytnika ekranu, powiększenia 400% i szerokości 320 px nie sprawdzałem.
- Podstron na telefonie poza „Integracją systemów” nie oglądałem w całości; opieram się tam na pomiarach.
- Profilu LinkedIn (D-011) nie porównałem ze stroną — brak dostępu.
- Ocena „co działa” i „co nie działa” jest oceną projektową opartą na pomiarach, nie wynikiem badań z użytkownikami ani danych o konwersji.
