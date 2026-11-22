# Audyt SEO i pozycjonowania marki REVAGY

Stan: 2026-11-22 · karta T-024 · build z `main` `43efbf5` · tylko raport, bez zmian w kodzie.
Źródła i pełne notatki z badania: [`audyt-seo-zrodla.md`](audyt-seo-zrodla.md).

## 0. Odpowiedź w pięciu punktach

1. **Technicznie strona jest w dobrym stanie.** Lighthouse SEO 100/100 na 11 z 11 stron, canonical, sitemap, robots,
   JSON-LD i przekierowania działają na produkcji. Słabe miejsca: strona główna (wydajność 75, LCP 3,9 s),
   dwie strony z CLS powyżej 0,1 i linkowanie wewnętrzne (z menu prowadzi do podstron tylko jeden odnośnik).
2. **Marki nie widać poza własną stroną.** Zapytania `revagy` i `revagy.pl` nie zwróciły ani strony, ani profilu
   LinkedIn; jedyne wystąpienie to publiczne repozytorium GitHub. Istnieje też amerykańska spółka Revagy, LLC.
3. **Frazy ogólne są poza zasięgiem** („automatyzacja procesów biznesowych”, „wdrożenie AI w firmie”): zajmują je
   producenci oprogramowania, Big4 i duże software house'y. **Szansa jest we frazach decyzyjnych i „bólowych”**,
   pod które strona ma już trzy podstrony (porównanie dróg, wybór pierwszego procesu, cena audytu).
4. **Dla odpowiedzi AI nie ma dowodu, że pomagają zabiegi techniczne** (schema, `llms.txt`). To, co koreluje
   z wymienianiem marki, to obecność poza własną stroną: wzmianki, katalogi, zestawienia. Dowody są korelacyjne
   i pochodzą z dużych anglojęzycznych marek, więc dla REVAGY to hipoteza do sprawdzenia pomiarem.
5. **Bez danych z Search Console i Bing nie da się ocenić indeksacji, zapytań ani pozycji.** Te części raportu są
   oznaczone jako zablokowane (rozdział 7). Wolumenów fraz nie podaję nigdzie: brak danych.

## 1. Stan techniczny w liczbach

### 1.1 Lighthouse 13.6.0 (`npm run test:lighthouse`, 11 stron × 3 przebiegi, mediana)

Pomiar laboratoryjny: build podany lokalnie pod nazwą `revagy.pl`, telefon, symulowane wolne łącze. To nie jest
pomiar produkcji ani danych od użytkowników. Build bez klucza Turnstile (formularz ukryty). Konfiguracja pomiaru
dla 11 stron była tymczasowa, poza repo; plik `tools/lighthouse.json` w repo mierzy tylko `finanse.html`.

| Strona | Wydajność | Dostępność | SEO | FCP s | LCP s | TBT ms | CLS | Waga KB | Żądania |
|---|---|---|---|---|---|---|---|---|---|
| `index.html` | **75** (75, 79, 71) | 97 | 100 | 0,9 | **3,9** | **497** | 0,000 | **1061** | 19 |
| `integracja-systemow.html` | 100 | 96 | 100 | 1,2 | 1,2 | 0 | 0,014 | 240 | 14 |
| `wdrozenia.html` | 100 | 96 | 100 | 1,2 | 1,2 | 0 | 0,016 | 231 | 14 |
| `dla-firm.html` | 100 | 96 | 100 | 1,2 | 1,2 | 0 | 0,021 | 243 | 14 |
| `dane-i-bezpieczenstwo.html` | 96 | 96 | 100 | 1,2 | 1,2 | 57 | **0,121** | 254 | 14 |
| `produkcja-i-logistyka.html` | 100 | 96 | 100 | 1,3 | 1,3 | 0 | 0,018 | 267 | 14 |
| `porownanie-rozwiazan.html` | 100 | 96 | 100 | 1,2 | 1,2 | 63 | 0,015 | 133 | 13 |
| `jak-wybrac-pierwszy-proces.html` | 100 | 96 | 100 | 1,3 | 1,3 | 0 | 0,008 | 134 | 13 |
| `finanse.html` | 100 | 96 | 100 | 1,2 | 1,2 | 0 | 0,026 | 252 | 14 |
| `kontakt.html` | 100 | 100 | 100 | 0,9 | 0,9 | 0 | 0,026 | 121 | 9 |
| `polityka-prywatnosci.html` | 95 | 100 | 100 | 0,9 | 0,9 | 0 | **0,133** | 163 | 10 |

- Strona główna: elementem LCP jest film w hero (`video.hero-video`, plakat `hero-flow.jpg`); 404 ms z LCP to
  opóźnienie renderowania, plakat nie jest wskazany przeglądarce z wyprzedzeniem. Największy zasób:
  `hero-flow.webm` 615 KB (58% wagi strony).
- CLS powyżej progu 0,1 (granica „dobrego” wyniku Core Web Vitals) na dwóch stronach.
- Dostępność 96–97: jedyny niezaliczony audyt to kontrast kolorów na 9 stronach. Na stronie głównej Lighthouse
  podał kontrasty 1,1–2,9 dla niemal wszystkich sekcji, co wygląda na pomiar w trakcie animacji wejścia.
  **Niezweryfikowane**: wymaga sprawdzenia ręcznego, zanim uznamy to za wadę.

### 1.2 Title, description, nagłówki, treść (z `dist/`)

| Strona | Title (zn.) | Description (zn.) | H1 | H2 / H3 | Słowa w `<main>` |
|---|---|---|---|---|---|
| `/` | 40 | 152 | 1 | 10 / 26 | 1303 |
| `integracja-systemow` | 59 | **183** | 1 | 11 / 13 | 863 |
| `wdrozenia` | 48 | 131 | 1 | 6 / 12 | 768 |
| `dla-firm` | 51 | 145 | 1 | 7 / 9 | 860 |
| `dane-i-bezpieczenstwo` | 45 | 140 | 1 | 8 / 12 | 713 |
| `produkcja-i-logistyka` | 53 | 132 | 1 | 9 / 11 | 843 |
| `porownanie-rozwiazan` | 56 | 148 | 1 | 10 / 4 | 1149 |
| `jak-wybrac-pierwszy-proces` | 52 | 136 | 1 | 11 / 8 | 1142 |
| `finanse` | **74** | **163** | 1 | 9 / 16 | 906 |
| `kontakt` | **16** | 98 | 1 | 0 / 0 | **23** |
| `polityka-prywatnosci` | 29 | 103 | 1 | 6 / 0 | 726 |
| `404` | 29 | brak (`noindex`) | 1 | 0 / 0 | 27 |

- 12 z 12 stron ma dokładnie jedno H1, `lang="pl"`, unikalny title; 11 z 11 stron w indeksie ma unikalny opis.
- Title `finanse` (74 zn.) i opisy `integracja-systemow` (183) oraz `finanse` (163) mogą być ucinane w wynikach.
- H1 strony głównej („Procesy, które robią się same”) nie zawiera frazy; frazę niesie tylko title. Podobnie H1
  stron `integracja-systemow`, `produkcja-i-logistyka` i `wdrozenia` to hasła, nie nazwy usługi. Zmiana tekstów
  strony głównej jest objęta D-015 i D-023, więc to obserwacja, nie rekomendacja.
- Hierarchia nagłówków: jeden przeskok na stronę (H2 → H4 w stopce), poza tym poprawna.

### 1.3 Dane strukturalne, sitemap, robots, canonical, `llms.txt`

| Element | Stan | Liczby |
|---|---|---|
| Canonical | poprawny, wskazuje sam siebie | 11 z 11 stron w indeksie; `404` bez canonical i z `noindex` |
| `sitemap.xml` | plik statyczny w `public/`, utrzymywany ręcznie | 11 adresów, `lastmod` 2026-11-21 i 2026-11-22; na produkcji 200 |
| `robots.txt` | `Allow: /` dla wszystkich, wskazuje sitemap | brak blokad botów wyszukiwarek i botów AI |
| JSON-LD strona główna | `Organization` + `WebSite` | 1 blok; `sameAs`: 1 profil (LinkedIn) |
| JSON-LD podstrony | `WebPage` + `BreadcrumbList` + `Service` + `FAQPage` (+ `VideoObject`) | 8 stron; `VideoObject` na 6 |
| JSON-LD `kontakt`, `polityka-prywatnosci` | brak | 2 strony |
| Open Graph i Twitter Card | komplet na 9 stronach, brak na `kontakt` i `polityka-prywatnosci` | jeden obraz `og.jpg` (75 KB) dla wszystkich stron |
| `llms.txt` / `llms-full.txt` | generowane przy buildzie | 11 stron; na produkcji 200, 1,5 KB i 25,8 KB (gzip) |
| `hreflang` | brak | nie dotyczy (jeden język) |
| IndexNow, `BingSiteAuth.xml` | pliki na produkcji | 200 i 200 |

- `FAQPage` nie daje już wyniku rozszerzonego w Google: funkcja przestała się wyświetlać 7.05.2026
  (dokumentacja Google, wpisy z 8.05 i 15.06.2026). Znacznik nie szkodzi, ale nie jest dźwignią.
- `Organization`, `BreadcrumbList` i `Video` są nadal w galerii wyników Google. `Service`, `WebSite` i `WebPage`
  nie mają własnego wyniku rozszerzonego.
- Dwa poradniki (`porownanie-rozwiazan`, `jak-wybrac-pierwszy-proces`) są oznaczone jako `Service`, a nie
  `Article`, choć `Article` jest typem wspieranym przez Google.
- Warunków Google dla indeksowania filmów (czy film musi być główną treścią strony) nie zweryfikowano.

### 1.4 Przekierowania i odpowiedzi serwera (produkcja, 22.11.2026)

| Sprawdzenie | Wynik |
|---|---|
| `http://revagy.pl/` | 301 → `https://revagy.pl/` |
| `https://www.revagy.pl/` | 301 → `https://revagy.pl/` |
| Stare adresy w `deploy/nginx/revagy.pl.conf` | 8 reguł 301; sprawdzone 3 (`oferta.html`, `realizacje.html`, `dla-agencji-pracy.html`): jeden skok, cel 200 |
| 11 adresów z sitemapy | 11 × 200 |
| Nieistniejący adres | 404 ze stroną błędu |
| `/finanse` (bez `.html`) | 404, bez przekierowania na `/finanse.html` |
| `/index.html` | 200 (duplikat strony głównej, canonical wskazuje `/`) |
| Kompresja | gzip; brak brotli |
| Protokół, TTFB | HTTP/2 (+ ogłoszone HTTP/3); 0,57 s z tej sesji (jeden pomiar, spoza Polski) |
| Cache | HTML `no-cache`; CSS i JS 1 dzień; fonty, grafiki, filmy 30 dni |
| Nagłówek CSP | **bez `clarity.ms`**: krok 2 wdrożenia z T-022 nie jest wykonany, więc Clarity jest blokowane także po zgodzie |

### 1.5 Linkowanie wewnętrzne

Liczba stron, które linkują do danej strony (menu, treść i stopka razem):

| Strona docelowa | Linkuje stron | Link ze strony głównej |
|---|---|---|
| `finanse` | 9 | tak (menu i stopka) |
| `integracja-systemow` | 7 | tak (treść) |
| `dane-i-bezpieczenstwo` | 6 | tak (treść) |
| `produkcja-i-logistyka` | 6 | tak (treść) |
| `dla-firm` | 4 | tak (treść) |
| `wdrozenia` | 4 | tak (treść) |
| `jak-wybrac-pierwszy-proces` | **3** | **nie** |
| `porownanie-rozwiazan` | **3** | **nie** |
| `kontakt` | 8 | nie (strona główna ma formularz pod `#kontakt`) |

- Menu i stopka na wszystkich stronach mają 21 i 19 odnośników, z czego do podstron prowadzi **jeden**
  (`finanse.html`); reszta to kotwice strony głównej. Pozycje „Sprzedaż”, „Obsługa klienta”, „Operacje i HR”
  w menu nie mają własnych podstron.
- Dwa poradniki, czyli strony z największą szansą na ruch (rozdział 3), mają najmniej linków i żadnego ze
  strony głównej.
- Teksty odnośników są opisowe („Integracja systemów”, „Jak wybrać pierwszy proces do automatyzacji”).
- Linków wychodzących: 0. Profil LinkedIn jest tylko w `sameAs`, nie ma widocznego odnośnika na stronie.

### 1.6 Obrazy i filmy

| Element | Stan |
|---|---|
| Znaczniki `<img>` | 0 na wszystkich stronach (grafika to SVG w treści i plakaty filmów) |
| Filmy | 9 (3 na stronie głównej, po 1 na 6 podstronach), każdy w `.mp4` i `.webm` |
| Rozmiar filmów | 243–1061 KB na plik; razem 7,3 MB |
| Plakaty | 9 plików JPG, 54–146 KB |
| Ładowanie | `preload="none"` wszędzie poza hero (`preload="metadata"`) |
| Opis filmu dla czytników i robotów | `aria-label` na 7 z 9; brak na dwóch filmach strony głównej (hero, pulpit) |
| `VideoObject` | 6 podstron: `contentUrl`, `thumbnailUrl`, `uploadDate`, `duration`, wymiary |
| Mapa filmów i obrazów w sitemapie | brak |

Skutek: strona nie ma czego pokazać w wyszukiwaniu grafiki, a udostępnienie dowolnej podstrony w mediach
społecznościowych pokazuje ten sam obraz.

## 2. Luki

| # | Luka | Dowód | Waga |
|---|---|---|---|
| L1 | Nie wiadomo, czy strona jest w indeksie Google i Bing | brak dostępu do Search Console i Bing; wyszukiwarka testowa nie zwróciła żadnej strony z `revagy.pl` | krytyczna |
| L2 | Marka bez śladu poza własną stroną | zapytania `revagy`, `revagy.pl`: 0 trafień własnych; LinkedIn nie wystąpił | krytyczna |
| L3 | Publiczne repozytorium jest dziś jedynym wystąpieniem marki w indeksie | widoczne tytuły PR-ów i karty zadań | do decyzji właściciela |
| L4 | Kolizja nazwy: Revagy, LLC (Lenexa, Kansas, USA), rozliczenia laboratoryjne | wynik wyszukiwania; nota z 20.11 (rozdz. 4) mówiła, że nazwa jest wolna | średnia |
| L5 | Strona główna: wydajność 75, LCP 3,9 s, TBT 497 ms, 1061 KB | Lighthouse, 3 przebiegi | wysoka |
| L6 | CLS 0,121 i 0,133 na dwóch stronach | Lighthouse | średnia |
| L7 | Do 8 z 9 podstron nie prowadzi menu ani stopka; 2 poradniki bez linku ze strony głównej | rozdz. 1.5 | wysoka |
| L8 | Brak podstron dla działów z menu: sprzedaż, obsługa klienta, operacje i HR | menu strony głównej | wysoka |
| L9 | 0 wpisów blogowych; konkurenci wchodzą do wyników ilością treści | Symfonia w 9 z 15 fraz, Innowise w 6 | wysoka |
| L10 | Brak nazwanych wdrożeń i opinii | D-034 (czeka na właściciela); Clutch pokazuje firmy od 3 opinii | wysoka |
| L11 | Poradniki oznaczone `Service` zamiast `Article`; `FAQPage` bez efektu | rozdz. 1.3 | niska |
| L12 | `kontakt`: 23 słowa, brak OG i JSON-LD; title 16 zn. | rozdz. 1.2 | niska |
| L13 | Title 74 zn. i opisy 163 oraz 183 zn. | rozdz. 1.2 | niska |
| L14 | Lighthouse w CI pilnuje 1 strony z 11 | `tools/lighthouse.json` | średnia |
| L15 | CSP na produkcji bez `clarity.ms` | nagłówek z produkcji | średnia (pomiar) |
| L16 | Sitemap utrzymywana ręcznie | `public/sitemap.xml` | niska |
| L17 | Brak nazw systemów odcina frazy z nazwami, po których szukają klienci | 3 z 4 sprawdzonych konkurentów używa nazw | koszt decyzji D-018 i D-033, nie wada |

## 3. Frazy: kto zajmuje wyniki i gdzie jest szansa

**Ograniczenie, które zmienia wagę wniosków:** wyszukiwarka użyta w badaniu działa z USA i nie jest polskim
Google. Pokazuje, kto ma treść na daną frazę, a nie pozycje w google.pl; małe polskie agencje są w niej
niedoreprezentowane. Wolumeny i trudność fraz: **brak danych**, nie szacuję.

### 3.1 Mapa fraz → podstrony

| Fraza | Kto zajmuje wyniki | Szansa | Podstrona |
|---|---|---|---|
| automatyzacja procesów biznesowych | SAP, Atlassian, Asana, ClickUp, KPMG, Symfonia | niska | `/` |
| automatyzacja procesów w firmie | Orange, iFirma, Symfonia, IBM, KPMG | niska | `/` |
| wdrożenie AI w firmie | OpenAI, KPMG, EY, TTMS (4 artykuły), Netguru, PFR | niska | `/` |
| agenci AI dla firm | ClickUp (5 adresów), Blck Alpaca (6), Microsoft | niska–średnia | `/` (brak własnej podstrony) |
| automatyzacja dla małych firm | rankingi narzędzi: Symfonia, ClickUp, inEwi | niska (intencja: narzędzie, nie usługa) | `dla-firm` |
| integracja systemów w firmie | Bankier, Fakturownia, SAP, PKO BP, Symfonia | niska–średnia | `integracja-systemow` |
| integracja systemu HR z programem kadrowo-płacowym | producenci systemów HR o własnych integracjach, kadry.infor.pl | średnia | `integracja-systemow` |
| automatyzacja obiegu faktur kosztowych | Symfonia (8 adresów), Comarch (5), Fakturownia | niska (szukający chce programu) | `finanse` |
| automatyzacja windykacji należności | tłumaczone rankingi, dokumentacja, małe zagraniczne domeny | niska–średnia | `finanse` |
| automatyzacja uzgodnień bankowych | wyniki nie na temat (bankowość) | średnia; popyt nieznany | `finanse` |
| automatyzacja w produkcji i logistyce | automatyka przemysłowa, PDF-y uczelni | fraza rozumiana jako automatyka hali | `produkcja-i-logistyka` |
| RPA czy integracja API | wyłącznie wyniki po angielsku i niemiecku | **relatywnie wysoka** | `porownanie-rozwiazan` |
| jak wybrać proces do automatyzacji | płatny webinar (49 zł + VAT), wpis iFirmy, reszta po angielsku | **relatywnie wysoka** | `jak-wybrac-pierwszy-proces` |
| audyt automatyzacji procesów cena | baza PARP, agregator cen, Big4 bez cen | **relatywnie wysoka** | brak osobnej strony; cena 1 990 zł jest w FAQ i na `dla-firm` |
| ręczne przepisywanie danych między systemami | dokumentacje, PDF-y, 2 artykuły w mediach | **relatywnie wysoka** | `integracja-systemow`, `porownanie-rozwiazan` |
| revagy (marka) | brak wyników własnych; Revagy, LLC w USA | zależy od indeksacji | `/` |

### 3.2 Co z tego wynika

- Cztery najsłabiej obsadzone frazy to pytania i problemy, nie nazwy usług. Trzy z nich mają już podstronę,
  czwarta (cena audytu) ma odpowiedź rozproszoną po FAQ.
- Podstrona `produkcja-i-logistyka` konkuruje o słowo „automatyzacja” z robotami i liniami produkcyjnymi.
  Odróżnia ją słownictwo biurowe (zamówienia, awizacje, dokumenty przewozowe), a nie sama fraza.
- Mali gracze wchodzą do wyników trzema drogami: dużą liczbą własnych tekstów (austriacka agencja z 6 adresami
  na jedną frazę), artykułem w medium (Antyweb, Comparic) albo wpisem w katalogu (baza PARP, Clutch).
- Słabe wyniki dla fraz 10, 11 i 15 mogą oznaczać lukę albo brak popytu. Tego nie rozstrzygnie nic poza danymi
  z Search Console po kilku tygodniach.

### 3.3 Konkurenci (4 otwarte strony; celu 6–8 nie udało się osiągnąć, 5 stron odmówiło dostępu)

| Firma | Ceny | Wdrożenia z nazwami | Treść | Nazwy systemów |
|---|---|---|---|---|
| No-Code.pl (Komorniki; profil najbliższy REVAGY) | brak | brak | 4 wpisy | we wpisach |
| Blck Alpaca (Wiedeń, strona po polsku) | brak; pierwsza rozmowa bezpłatna | 1 | blog, baza wiedzy, słownik | osobne podstrony |
| FlowHunt (platforma + usługi) | brak; konsultacja 30 min bezpłatna | brak; same logotypy | blog, akademia, słownik | tak |
| TTMS (Warszawa, duże firmy) | brak; **audyt bezpłatny** | 2 | wiele artykułów | osobne podstrony |
| **REVAGY** | **audyt 1 990 zł, jawnie** | 0 (4 anonimowe) | 2 poradniki, 0 wpisów | nie (D-018, D-033) |

Jawna cena audytu wyróżnia REVAGY: żaden z czterech jej nie podaje. Stoi jednak obok „bezpłatnych audytów”
większych firm, więc strona musi jasno pokazywać, co klient dostaje za 1 990 zł, czego nie dostaje za darmo.

## 4. Widoczność w odpowiedziach AI

Samych odpowiedzi ChatGPT, Perplexity, Gemini i Trybu AI **nie badano** (brak dostępu). Poniżej wnioski
z badań i dokumentacji.

| Wniosek | Na czym się opiera | Ile to warte dla REVAGY |
|---|---|---|
| Google nie wymaga niczego poza indeksacją i zwykłym fragmentem w wynikach; schema, `llms.txt` i dzielenie treści nazywa mitami | poradnik Google o funkcjach AI | pełne zastosowanie; dotyczy tylko Google |
| Dodanie JSON-LD nie podniosło cytowań: AI Overviews −4,6%, Tryb AI i ChatGPT bez różnicy | Ahrefs, 11.05.2026, 1 885 stron ze zmianą i 4 000 kontrolnych | najmocniejsze badanie w zestawie; dotyczy stron już cytowanych |
| Wymienianie marki idzie w parze ze wzmiankami w sieci (korelacja 0,664), mocniej niż z linkami (0,218) | Ahrefs, 75 tys. marek | słabe przełożenie: próba to marki z co najmniej 800 wyszukiwań miesięcznie |
| Pierwsze miejsce w zestawieniu strony trzeciej: +16,5 p.p. szansy na wzmiankę | Peec AI, blisko 200 tys. odpowiedzi, 8 silników | mechanizm prawdopodobny, liczby z rynku USA |
| Ta sama lista marek powtarza się rzadziej niż raz na 100 odpowiedzi | SparkToro, 2 961 uruchomień | jeden test „czy model zna REVAGY” niczego nie dowodzi |
| W Polsce AI Overviews pojawia się przy 28,95% fraz, ale tylko przy 7,23% fraz z końca ścieżki zakupu | Senuto, 27.11.2025, 17,8 mln fraz | zapytania o wykonawcę rzadko dostają odpowiedź AI; poradnikowe często |
| Bing radzi: pytanie i bezpośrednia odpowiedź w widocznym HTML, bez chowania w zakładkach | wpis Microsoft, 8.10.2025 | wskazówka dostawcy, bez danych |

- **Kontrargument:** Google wprost zalicza zabieganie o „wzmianki” do mitów, a korelacje pochodzą od firm, które
  sprzedają pomiar wzmianek. Nie znaleziono żadnego badania na małych firmach usługowych ani po polsku.
- **Co istnieje w sieci na pytanie „kto wdraża automatyzację i AI w Polsce”:** Clutch (818 firm, góra listy
  sponsorowana), zestawienia pisane przez samych zainteresowanych (autor na 1. miejscu) i tłumaczone teksty
  zagranicznych firm. Niezależnego polskiego rankingu wdrożeniowców dla małych firm nie znaleziono.
- **Udział narzędzi AI w ruchu w Polsce:** brak danych. Globalnie (Ahrefs, październik 2026, 118 671 witryn):
  wyszukiwarki 27,55% wizyt, asystenci AI 0,46%.

## 5. Gdzie jeszcze umieścić markę

Sprawdzone na żywo 22.11.2026. „Nie zweryfikowano” oznacza, że strona nie dała się otworzyć albo zabrakło
czasu; nie jest to ocena. Atrybutu dofollow nie udało się ustalić dla żadnego miejsca.

| Miejsce | Koszt | Warunek wejścia | Ocena |
|---|---|---|---|
| LinkedIn, strona firmowa (istnieje) | bezpłatne | brak | zrobić: profil nie pojawia się na zapytanie o markę |
| Clutch, profil Basic | bezpłatny; Verified 499 USD/rok | bez weryfikacji; widoczne firmy mają od 3 opinii | zrobić; bez opinii daje wpis i link, nie pozycję |
| Google Business Profile | bezpłatne | **wymaga kontaktu osobistego z klientami; firmy wyłącznie zdalne są wykluczone** | tylko jeśli są spotkania u klientów; wtedy adres ukryty, zasięg ok. 2 h jazdy |
| Katalog partnerów Make | brak danych | kurs lub portal partnerski; kryteria nieopublikowane | sprawdzić: filtr „Polska” jest, w pierwszej dziewiątce brak polskich firm |
| Katalog partnerów Zapier | brak danych | certyfikat; warunki nieopublikowane | sprawdzić: 31 partnerów, 1 oferta po polsku |
| Microsoft AI Cloud Partner Program | zapis bezpłatny | weryfikacja firmy | nieustalone, czy poziom bezpłatny daje publiczny wpis |
| Panorama Firm | wpis bezpłatny | brak danych | zrobić; kategorii nie zweryfikowano |
| ALEO, pkt.pl, Firmy.net, rejestr.io | brak danych | brak danych | nie zweryfikowano |
| Antyweb „Opowiedz o swoim biznesie” | bezpłatne zgłoszenie; osobno artykuły sponsorowane | decyzja redakcji | zrobić; tę drogę wykorzystał już konkurent |
| Poradnik Przedsiębiorcy, Dziennik Internautów | brak danych | regulamin publikacji gościnnych | sprawdzić warunki |
| Logistyka.net.pl | artykuł sponsorowany; kwota nieznana | płatne | jedyne medium z grupy docelowej z opisaną ofertą |
| ITwiz, MamStartup, NowyMarketing | oferta indywidualna | kontakt handlowy | cen brak |
| Baza Usług Rozwojowych PARP | brak danych | nie zweryfikowano | trop: sama baza jest w wynikach na frazę o cenie audytu |
| n8n Expert Partners | — | zamknięty pilotaż, 3 aktywnych klientów, regiony bez Polski | dziś niedostępne |
| Mapa polskich firm AI (WEG) | — | co najmniej 5 osób i własna technologia AI | dziś niedostępne |
| Wikidata | bezpłatne | poważne, publiczne źródła o podmiocie | dziś niedostępne: źródeł zewnętrznych nie ma |
| GoodFirms | brak danych | ranking od 1 opinii | po pierwszej opinii |
| Oferteo, Fixly, Useme | płatne punkty albo prowizja | — | słabe dopasowanie |
| Bing Places, Apple Business Connect, Crunchbase, Sortlist, DesignRush | — | — | nie zweryfikowano |

Uwaga do katalogów partnerów: profil w katalogu producenta jest poza stroną, więc D-018 i D-033 go nie
dotyczą, ale to decyzja właściciela, czy marka ma być kojarzona z konkretnym narzędziem.

Mediów HR, finansowych i produkcyjnych z publiczną ścieżką dla autorów zewnętrznych nie znaleziono. Podcastów
nie zidentyfikowano.

## 6. Plan 30 / 60 / 90 dni

Nakład to szacunek w godzinach pracy, nie zobowiązanie. P1 = robić najpierw. Każda zmiana w kodzie przechodzi
osobną kartę, plan zmian i zgodę; pozycje dotykające strony głównej wymagają sprawdzenia z D-015 i D-021.

### Do 30 dni: pomiar, indeksacja, to co już jest

| # | Działanie | Kto | Priorytet | Nakład |
|---|---|---|---|---|
| 1 | Weryfikacja `revagy.pl` w Google Search Console, zgłoszenie sitemapy; to samo w Bing Webmaster Tools; uruchomienie `indexnow-ping` | właściciel | P1 | 1 h |
| 2 | Wgranie CSP z T-022 na serwer (Clarity) | właściciel | P1 | 0,5 h |
| 3 | Decyzja: repozytorium publiczne czy prywatne | właściciel | P1 | 0,1 h |
| 4 | Podstrony w stopce i menu (dziś 1 z 9); linki do dwóch poradników ze strony głównej | agent | P1 | 3 h |
| 5 | Strona główna: plakat hero wskazany przeglądarce z wyprzedzeniem, lżejszy start filmu; cel LCP poniżej 2,5 s bez zmiany wyglądu | agent | P1 | 4 h |
| 6 | CLS na `dane-i-bezpieczenstwo` i `polityka-prywatnosci` poniżej 0,1 | agent | P2 | 3 h |
| 7 | Skrócenie title `finanse` i dwóch opisów; OG i JSON-LD dla `kontakt`; `Article` dla dwóch poradników; widoczny link do LinkedIn | agent | P2 | 3 h |
| 8 | Progi Lighthouse dla wszystkich 11 stron w `tools/lighthouse.json` | agent | P2 | 2 h |
| 9 | LinkedIn: opis zgodny z `marka.mjs`, adres strony, usługi, pierwszy wpis | właściciel | P1 | 2 h |
| 10 | Profil Clutch Basic i wpis w Panoramie Firm z tymi samymi danymi co na stronie | właściciel | P2 | 3 h |
| 11 | Pomiar zerowy odpowiedzi AI: 6 pytań × 10 powtórzeń w 4 narzędziach, zapis z datą | właściciel albo agent z dostępem | P2 | 3 h |
| 12 | Sprawdzenie kontrastu ręcznie (czy wynik Lighthouse to animacja) | agent | P3 | 1 h |

### Do 60 dni: treść pod frazy z szansą i pierwsze wzmianki

| # | Działanie | Kto | Priorytet | Nakład |
|---|---|---|---|---|
| 13 | Poradnik „Ile kosztuje audyt automatyzacji i co w nim jest” (fraza z ceną, nikt jej nie podaje) | agent | P1 | 8 h |
| 14 | Poradnik „Ile kosztuje ręczne przepisywanie danych” z kalkulacją | agent | P1 | 8 h |
| 15 | Rozbudowa `porownanie-rozwiazan` o wprost nazwane pytanie „RPA czy integracja” | agent | P1 | 4 h |
| 16 | Strona zbiorcza poradników i typ `Article` dla wpisów (D-010) | agent | P2 | 5 h |
| 17 | Jedno wdrożenie z nazwą klienta i trzy opinie do Clutch (D-034) | właściciel | P1 | 4 h |
| 18 | Zgłoszenie do Antyweb „Opowiedz o swoim biznesie”; warunki Poradnika Przedsiębiorcy i Dziennika Internautów | właściciel + agent | P2 | 5 h |
| 19 | Warunki i koszt katalogów partnerów Make i Zapier, bazy PARP, ALEO | agent | P3 | 3 h |

### Do 90 dni: decyzje z danych

| # | Działanie | Kto | Priorytet | Nakład |
|---|---|---|---|---|
| 20 | Przegląd danych z Search Console po 8–12 tygodniach; korekta mapy fraz | agent | P1 | 4 h |
| 21 | Podstrony działów z menu: sprzedaż, obsługa klienta, operacje i HR (każda z miejscem na film, D-022) | agent | P1 | 3 × 9 h |
| 22 | Druga seria 3–4 poradników według fraz, które pokazała Search Console | agent | P2 | 4 × 7 h |
| 23 | Artykuł w medium dla produkcji i logistyki (płatny; kwota do ustalenia) | właściciel | P3 | 6 h + koszt |
| 24 | Decyzja o profilu firmy w Google: tylko jeśli są spotkania u klientów | właściciel | P3 | 1 h |
| 25 | Powtórka pomiaru odpowiedzi AI i Lighthouse; porównanie z punktem zerowym | agent | P2 | 3 h |

Suma szacunku: do 30 dni ok. 26 h, do 60 dni ok. 37 h, do 90 dni ok. 69 h.

## 7. Zablokowane: potrzebne dane od właściciela

Nie mam dostępu do Google Search Console ani Bing Webmaster Tools. Bez nich nie oceniam i nie zgaduję:

1. **Indeksacji**: ile z 11 adresów jest w indeksie i z jakim statusem.
2. **Zapytań i pozycji**: na co strona się wyświetla, z jaką średnią pozycją i CTR.
3. **Core Web Vitals od użytkowników**: w raporcie są tylko wyniki laboratoryjne.
4. **Linków przychodzących**: raport „Linki” z Search Console.

Potrzebuję konkretnie:

- Search Console, usługa `revagy.pl`: eksport „Skuteczność” (zapytania i strony, ostatnie 28 dni), eksport
  „Indeksowanie stron”, raport „Podstawowe wskaźniki internetowe”, raport „Linki”; albo dostęp do odczytu.
- Bing Webmaster Tools: eksport „Search Performance” i „Site Explorer”; albo dostęp do odczytu.
- Jeśli usługi nie są jeszcze zweryfikowane: informacja o tym. Wtedy punkt 1 planu jest pierwszym krokiem,
  a dane pojawią się po kilku dniach.

## 8. Ograniczenia tego raportu

- Wyniki wyszukiwania pochodzą z narzędzia działającego z USA; nie są pozycjami w google.pl.
- Konkurentów otwarto 4, nie 6–8; tylko jeden to mała polska agencja o profilu zbliżonym do REVAGY.
- Większość polskich katalogów i mediów ma status „nie zweryfikowano”.
- Lighthouse mierzył build bez klucza Turnstile, lokalnie; wynik strony głównej wahał się 71–79.
- Wolumeny fraz, ceny publikacji i udział AI w ruchu w Polsce: brak danych.
