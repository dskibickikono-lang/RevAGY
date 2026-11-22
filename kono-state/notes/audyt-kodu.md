# Audyt kodu strony RevAGY (T-028, wcześniej T-025)

- Data: 2026-11-22. Kanał: pm-local. Zlecił: właściciel.
- Zakres: `src/`, `public/assets/js/` (skrypty stron), `tools/`, `integrations/`, `deploy/`, `.github/workflows/`, `astro.config.mjs`.
- Stan kodu: audyt zaczęty na `main` 43efbf5, dokończony i ponownie przetestowany na `main` 7cd0f71
  (po scaleniu PR #27 i #28 w trakcie audytu). Numery linii odpowiadają 7cd0f71.
- Tryb: wyłącznie raport. Zero zmian w kodzie, bez `--fix`, bez wdrożeń, bez SSH.
  Produkcję czytałem tylko żądaniami GET/HEAD (nagłówki i pliki publiczne), nic nie wysyłałem do formularza.
- Metoda: `/code-review xhigh --max-findings all` pięć razy (limit narzędzia: 32 znaleziska na cel, nigdzie nie
  osiągnięty), `/security-review` (różnica gałęzi to tylko karta, więc bez znalezisk) plus ręczny przegląd
  bezpieczeństwa, skill `product-discovery:production-readiness`, faktyczne przebiegi builda i testów.

## 1. Wynik w skrócie

- 63 znaleziska: **0 krytycznych, 20 ważnych, 42 drobne, 1 zamknięte w trakcie audytu** (baner zgody, PR #28).
- Nie znalazłem podatności, którą da się dziś wykorzystać przeciw stronie ani wycieku sekretów. `npm audit`: 0.
- Kod strony i skrypt wydania są staranne. Ryzyko siedzi gdzie indziej: w tym, czego testy nie obejmują,
  w ręcznie utrzymywanych kopiach tych samych rzeczy i w części serwerowej poza repozytorium.
- Cztery rzeczy, które ograniczają dalszą budowę:
  1. test formularza (14 grup) nie jest uruchamiany w CI,
  2. `llms-full.txt` gubi treść wszystkich pytań FAQ (58 pustych nagłówków w bieżącym buildzie),
  3. układy stron nie obsługują podkatalogów, a blog jest w planie (D-010),
  4. każda zmiana pliku CSS lub JS wymaga ręcznej zmiany `?v=` w kilku miejscach.
- Gotowość produkcyjna (checklista): etap przygotowania **47%, 11 z 23 wymagań**; 1 do poprawy, 11 do sprawdzenia.
  Większość otwartych punktów dotyczy rzeczy poza repo: bramki formularza, kopii zapasowych, monitoringu.

## 2. Wyniki przebiegów (faktyczne)

Środowisko: kontener Linux, Node 22.23.5, `npm ci` bez błędów. Playwright 1.65.1 oczekuje Chromium build 1255,
w kontenerze jest build 1243 (Chromium 157); testy uruchomiłem na 1243 przez podmianę katalogu przeglądarek.
To odstępstwo od wersji przypiętej w repo. Pełny przebieg na czystym Linuksie robi KONO Boss przed merge.

### 2a. Polecenia dokładnie tak, jak w zleceniu (świeży klon, bez zmiennych)

| Polecenie | Kod | Wynik |
|---|---|---|
| `npm run build` | 0 | 12 stron, `llms.txt` i `llms-full.txt` dla 11 stron |
| `npm run test:smoke` | 1 | `ERR_CONNECTION_REFUSED http://localhost:8000/`: bez `--serve=dist` test wymaga osobno uruchomionego serwera |
| `npm run test:form` | 1 | 1 grupa OK, potem `ERR_CONNECTION_RESET`: test nie omija proxy tego środowiska |
| `npm run test:tools` | 0 | 108 z 108 |
| `npm run check:dist` | 1 | 2 z 6 kroków: `index.html` 41 118 B zamiast 46 551 B z migawki, bo build bez `PUBLIC_TURNSTILE_SITEKEY` nie ma formularza |
| `npm run test:lighthouse` | 2 | `CHROME_INTERSTITIAL_ERROR`: Chrome poszedł przez proxy tego środowiska |

Trzy z czterech niepowodzeń to nie błędy strony, tylko warunki, których `package.json` i README nie mówią wprost
(znaleziska T-05 i T-09). Czwarte (`check:dist`) działa zgodnie z projektem: kontrakt wymaga builda z kluczem.

### 2b. Konfiguracja jak w CI, stan `main` 7cd0f71

Build z publicznym kluczem Turnstile (wzięty z `tools/baseline/index.html`), `test:smoke -- --serve=dist`,
dla `test:form` i `test:lighthouse` usunięte zmienne proxy środowiska.

| Polecenie | Kod | Wynik |
|---|---|---|
| `npm run build` | 0 | 12 stron w 2 s |
| `npm run check:dist` | 0 | 6 z 6 kroków; 68 plików, 54/54 zasobów bajtowo, 12/12 stron z kontraktem i `htmlBaseline`, `index.html` zgodny z migawką |
| `npm run test:tools` | 0 | 108 z 108 |
| `npm run test:smoke -- --serve=dist` | 0 | 271 z 271, 0 pominiętych (112 s) |
| `npm run test:form` | 0 | 14 grup sprawdzeń (53 s) |
| `npm run test:deploy` (dodatkowo) | 0 | 16 z 16 |
| `npm run test:lighthouse` | 0 | `finanse.html`: wydajność mediana 100 (82, 100, 100), dostępność 96 (próg 95), SEO 100 |

- Manifest SHA-256 builda: `e5bd7953…010b7`, taki sam jak „przewidziany manifest wydania” w karcie T-024.
- Lighthouse, jedyny niezaliczony audyt: `color-contrast`. Dotyczy treści przed pojawieniem się w kadrze
  (`.js-motion .reveal { opacity: .16 }`, `public/assets/css/styles.css:273`), nie kolorów docelowych.
- Na stanie 43efbf5 (początek audytu) te same przebiegi dały: `check:dist` 6/6, dymny 270/270, formularz 14 grup,
  Lighthouse 100 / 96 / 100.
- Dodatkowo: `npm audit` 0 podatności; `astro dev` podaje poprawnie adresy z `.html`.

## 3. Znaleziska

Wagi: **krytyczne** = szkoda teraz albo przy najbliższym wydaniu; **ważne** = realny błąd, luka w ochronie albo
blokada dalszej budowy; **drobne** = warto poprawić przy okazji. Pracochłonność to szacunek pracy agenta z testami
i aktualizacją kontraktu, bez czasu przeglądu właściciela.

### 3.1 Strona: `src/` i skrypty stron

| ID | Waga | Miejsce | Scenariusz błędu | Proponowana poprawka | Praca |
|---|---|---|---|---|---|
| S-01 | ważne | `src/layouts/PodstronaLayout.astro:130-134, 142-238`; `src/config/podstrony.mjs:14` | Strona w podkatalogu (np. `blog/wpis.html`): `adresStrony()` rzuca błąd builda, a po obejściu style, skrypty i menu wskazują `/blog/assets/…` i `/blog/#kontakt` | Prefiks ścieżki liczony z głębokości strony albo adresy od `/`; rozszerzyć wzorzec `PLIK` i narzędzia (`podstrony.json`, walidator) | 8–16 h |
| S-02 | zamknięte | `public/assets/js/analytics.js:164` | Baner mówił „Dane zostają na naszym serwerze”, a zgoda uruchamiała też Microsoft Clarity | Naprawione w `main` 7cd0f71 (PR #28). Czeka na wydanie | 0 |
| S-03 | ważne | `src/pages/index.astro:18, 133`; `public/assets/js/app.js:106-107` | Film w hero i film pulpitu grają w pętli bez przycisku wstrzymania; przycisk ma tylko film z `data-main-video`. Niezgodność z WCAG 2.2.2 (poziom A) | Mechanizm wstrzymania dla wszystkich filmów `data-autoplay`. Zmienia wygląd strony głównej, więc wymaga decyzji właściciela (D-015) | 3–5 h |
| S-04 | drobne | `src/layouts/BaseLayout.astro:204-207` | Wejście z kampanii na nieistniejący adres → 404 → strona główna → formularz: `kontakt.js` zapisuje referrer `revagy.pl` i brak UTM, lead trafia do CRM bez źródła. To samo dla wejścia przez politykę prywatności | Ładować `wejscie.js` także w `BaseLayout` (zmienia HTML strony głównej o jeden znacznik, więc aktualizacja kontraktu) | 1–2 h |
| S-05 | ważne | `src/layouts/BaseLayout.astro:60, 204-206`; `src/layouts/PodstronaLayout.astro:133-134, 236-238`; `tools/validate-dist.cjs:841-846`; `tools/update-contract.cjs:86`; `tools/podstrony.json` | Poprawka w `kontakt.js` bez zmiany `?v=1`: powracający odwiedzający dostaje stary skrypt z pamięci podręcznej (1 dzień) i wysyła formularz w starym formacie | Skrót treści pliku liczony przy buildzie zamiast ręcznego numeru; jedno miejsce z listą skryptów | 4–8 h |
| S-06 | ważne | `src/pages/index.astro:491-553`; `src/pages/kontakt.astro:20-82`; `public/assets/js/kontakt.js:269-270` | Nowa opcja tematu dodana tylko w `index.astro`: na `kontakt.html` jej nie ma, a `kontakt.js` odrzuca ją jako niepoprawną | Jeden komponent `FormularzKontaktowy.astro` i jedno źródło list opcji (HTML wynikowy bez zmian) | 3–4 h |
| S-07 | ważne | `src/layouts/BaseLayout.astro:66-123, 156-191`; `src/layouts/PodstronaLayout.astro:140-234`; dane firmy: `BaseLayout.astro:181, 185, 197`, `PodstronaLayout.astro:225, 229`, `src/pages/polityka-prywatnosci.astro:15` | Zmiana telefonu w `marka.mjs`: JSON-LD i `llms.txt` mają nowy numer, stopki wszystkich stron stary. Zmiana pozycji menu wymaga edycji w dwóch układach | Wspólne komponenty nagłówka i stopki zasilane z `MARKA`, z identycznym HTML (D-031 zostaje: dwa układy, wspólne części) | 4–6 h |
| S-08 | ważne | `public/assets/js/kontakt.js:86-90, 139-221` | Firmowy filtr blokuje `challenges.cloudflare.com`: po przewinięciu do formularza widać „Nie udało się wysłać. Spróbuj ponownie…”, zanim ktokolwiek coś wysłał; komunikat wraca po wejściu w każde kolejne pole | Przed wysyłką pokazywać tylko komunikat przy widżecie; komunikat o nieudanej wysyłce zostawić na próbę wysłania | 2–3 h |
| S-09 | drobne | `src/config/podstrony.mjs:28`; `src/config/filmy.mjs:129` | `aktualizacja = '2026-02-31'` przechodzi build (sprawdzone: `Date.parse` daje 3 marca); strona pokazuje „31 lutego 2026”, a `dateModified` jest błędne | Porównać `new Date(…).toISOString().slice(0, 10)` z wpisaną datą | 0,5 h |
| S-10 | drobne | `public/assets/js/analytics.js:140-152` | Odwiedzający czyta sekcję, przełącza kartę i wraca na 2 minuty: zdarzenie „Czas w kadrze” nie obejmuje tych 2 minut | Pamiętać zbiór sekcji w kadrze i po powrocie na kartę ustawić im nowy początek | 1 h |
| S-11 | drobne | `public/assets/js/analytics.js:156-181` | Klawiatura: Enter na „Ustawienia prywatności” w stopce. Baner (`role="dialog"`) pojawia się na końcu dokumentu, fokus zostaje na przycisku, czytnik ekranu nic nie ogłasza | Przenieść fokus do banera, przywrócić po zamknięciu, obsłużyć Escape | 1–2 h |
| S-12 | drobne | `public/assets/js/app.js:271-290` | Przeciąganie karuzeli, kursor wyjeżdża poza okno i tam puszcza przycisk: po powrocie karuzela przesuwa się za kursorem do następnego kliknięcia | `setPointerCapture` i obsługa `pointercancel` | 1 h |
| S-13 | drobne | `public/assets/js/clarity.js:31-33`; `public/assets/js/analytics.js:178` | Wycofanie zgody przed załadowaniem tagu Clarity: polecenie trafia do kolejki, strona przeładowuje się po 150 ms, ciasteczka `_clck` i `_clsk` zostają do roku, wbrew polityce prywatności | W `withdraw()` usuwać oba ciasteczka bezpośrednio | 0,5–1 h |
| S-14 | drobne | `src/pages/index.astro:389-392` | Przełącznik „Wdrożenie / Stała opieka”: `role="tablist"` bez paneli, `aria-controls` i strzałek; czytnik zapowiada karty, których nie ma | Dokończyć wzorzec kart albo zwykłe przyciski z `aria-pressed` | 1–2 h |
| S-15 | drobne | `src/components/Pytania.astro:38-39` | Dwa bloki pytań na jednej stronie: zdublowane `qa-1`, `qb-1`, błędne `aria-controls` | Właściwość z prefiksem id | 0,5 h |
| S-16 | drobne | `src/layouts/PodstronaLayout.astro:53, 105-106`; `src/components/MiejsceNaFilm.astro:14` | Strona z `<MiejsceNaFilm nazwa="x">` bez `film="x"` w układzie: film jest na stronie, a `VideoObject` nie (to akurat łapie walidator); inna nazwa w obu miejscach: opis innego filmu | Jedno źródło nazwy filmu | 1 h |
| S-17 | drobne | `src/data/bezpieczenstwo.mjs:9`; `src/data/poradniki.mjs:6`; `src/data/dowody.mjs:7` (wzór: `src/data/oferta.mjs:68-76`) | `aiNaDanychKlienta: true` → w FAQ i w `FAQPage` odpowiedź „true” | Wspólna kontrola „null albo niepusty tekst” dla wszystkich plików danych właściciela | 1 h |
| S-18 | drobne | `src/config/kontakt.ts:1`; brak `tsconfig.json` | Literówka w nazwie właściwości komponentu przechodzi build bez ostrzeżenia | `astro check` w CI (`@astrojs/check`) | 1–2 h |

### 3.2 Narzędzia: `tools/`

| ID | Waga | Miejsce | Scenariusz błędu | Proponowana poprawka | Praca |
|---|---|---|---|---|---|
| T-01 | ważne | `.github/workflows/ci.yml:49-65`; `tools/test-formularz.cjs:100-109` | Zmiana w `kontakt.js` psuje ponowienie z `Idempotency-Key`: CI zielone, bo `test:form` nie jest w żadnym workflow | Krok `npm run test:form` w `ci.yml` po teście dymnym | 0,5–1 h |
| T-02 | ważne | `tools/validate-dist.cjs:96-175, 746-957` | Refaktor `parseAttributes` przestaje widzieć `defer` albo inline `<script>`: walidator dalej zwraca OK, bo nikt nie sprawdza, że potrafi odrzucić zły katalog (963 wiersze bez testów) | Testy na spreparowanych katalogach: brak pliku, nadmiarowy plik, symlink, inline script, zły canonical, rozjechana mapa witryny | 6–8 h |
| T-03 | ważne | `tools/compare-film.cjs:132-150, 168`; `tools/lib/baza.cjs:36-41, 52-53` | Chwilowy błąd `git fetch` w CI: PR z filmem, który zmienia też inne strony, przechodzi, bo porównanie kończy się kodem 0 z „pomijam”; `compare-home` po cichu bierze zapisany `index.baza.html` | Gdy ustawione jest `GITHUB_BASE_REF`, brak bazy ma być błędem | 1–2 h |
| T-04 | ważne | `tools/lighthouse.json:6-8` | Zmiana pogarsza LCP strony głównej: workflow Lighthouse zielony, bo mierzy tylko `finanse.html` (1 z 12 stron) | Dopisać `index.html`, `kontakt.html` i po jednej stronie każdego układu (około 40 s na stronę) | 1–2 h |
| T-05 | drobne | `tools/test-formularz.cjs:109`; `tools/lighthouse.cjs:344`; wzór: `tools/smoke-test.cjs:259-262` | W środowisku z `HTTPS_PROXY`: `test:form` → `ERR_CONNECTION_RESET`, `test:lighthouse` → kod 2 (zaobserwowane w tym audycie) | Ten sam sposób izolacji co w teście dymnym (proxy kontekstu z listą wyjątków) | 1 h |
| T-06 | ważne | `tools/lib/tresc.cjs:181-199, 219-223`; `tools/check-tresc.cjs:40-66`; `tools/nazwy-systemow.json` | Opis filmu w `filmy.mjs` dostaje „dane z SAP w 5 minut”: kontrola przechodzi, a nazwa systemu (D-033) i liczba bez wpisu w rejestrze trafiają do `VideoObject`. Kontrola nie obejmuje też `kontakt.html` i polityki; lista nazw ma 20 pozycji | Sprawdzać także wartości tekstowe JSON-LD; rozważyć objęcie pozostałych stron | 2–3 h |
| T-07 | ważne | `tools/update-contract.cjs:76-93`; `tools/dom-contract.json` (17 214 wierszy) | Niezamierzona zmiana atrybutu na podstronie ginie w diffie kilkuset wierszy JSON; każda strona ma i tak sumę bajtową (`htmlBaseline`), więc pole `pages` nie dodaje ochrony | Zostawić sumy bajtowe i czytelny raport różnic w PR; kontrakt DOM ograniczyć albo usunąć | 8–16 h |
| T-08 | drobne | `tools/validate-dist.cjs:37-175` i `tools/lib/html.cjs:23-151` | Dwa parsery HTML z różnym dekodowaniem encji (`&nbsp;` jako U+00A0 albo zwykła spacja): te same dane dają dwa wyniki | Jeden parser w `tools/lib/html.cjs` | 6–8 h |
| T-09 | drobne | `package.json:12`; `.env.example:1-3`; README | Świeży klon: `npm run test:smoke` → `ERR_CONNECTION_REFUSED`; `npm run build && npm run check:dist` → „index.html różni się od migawki”, choć `.env.example` każe zostawić klucz pusty | `test:smoke` z domyślnym `--serve=dist`; opis w README, że kontrakt wymaga publicznego klucza | 1 h |
| T-10 | drobne | `tools/validate-dist.cjs:685-711`; `public/sitemap.xml` | Zmiana treści i daty aktualizacji podstrony bez edycji `sitemap.xml`: wyszukiwarka dostaje starą datę `lastmod` | Generować mapę przy buildzie albo porównywać `lastmod` z `dateModified` | 1–2 h |
| T-11 | drobne | `tools/render-videos.cjs:23-56` (wzór: `tools/render-kadr.cjs:20-64`) | Błąd JS w scenie przy klatce 200: wyjątek rzucony w obsłudze `pageerror`, przeglądarka i 200 plików PNG zostają; nazwa sceny bez walidacji | Walidacja nazwy, `try/finally`, zbieranie błędów jak w `render-kadr.cjs` | 1 h |
| T-12 | drobne | `tools/validate-dist.cjs:727-745` (wzór: `tools/lib/dane.cjs:7-29`) | Wpis `plik: "Blog/Wpis.html"`: walidator przyjmuje, `check-tresc` kończy się błędem formatu | Użyć `wczytajPodstrony` | 0,5 h |
| T-13 | drobne | `tools/lib/css.cjs:92-97` | `margin: var(--Space-4)` w `podstrony.css` przechodzi kontrolę, bo `styles.css` ma `var(--space-4)`; w przeglądarce zmienna nie istnieje | Nie zmieniać wielkości liter wewnątrz `var(--…)` | 0,5 h |
| T-14 | drobne | `tools/indexnow-ping.cjs:76, 83` | `api.indexnow.org` nie odpowiada: polecenie wisi bez komunikatu | `AbortSignal.timeout(15000)` | 0,25 h |
| T-15 | drobne | `tools/lighthouse.cjs:324-327` | Lighthouse pobierany przez `npx --yes lighthouse@13.6.0` poza `package-lock.json`: podmieniona zależność pośrednia wykona się na runnerze | Dodać do `devDependencies` | 0,5 h |
| T-16 | drobne | `tools/lib/html.cjs:118` | Kopia całego dokumentu małymi literami przy każdym `<script>`; dla znaku İ indeks końca bloku przesuwa się o jeden | Szukać wyrażeniem z flagą `i` od pozycji `i` | 0,5 h |

### 3.3 Integracja: `integrations/llms-txt.mjs`

| ID | Waga | Miejsce | Scenariusz błędu | Proponowana poprawka | Praca |
|---|---|---|---|---|---|
| I-01 | ważne | `integrations/llms-txt.mjs:19, 78-83` | `dist/llms-full.txt`: 58 pustych nagłówków `####`. Pytanie FAQ stoi w `<h3><button>`, a `button` jest na liście pomijanych, więc w pliku zostają odpowiedzi bez pytań (np. wiersze 343-349). Osłabia cel D-013 | Nie pomijać przycisku wewnątrz nagłówka; test, że żaden nagłówek w pliku nie jest pusty | 1–2 h |
| I-02 | ważne | `integrations/llms-txt.mjs:29-190`; brak pliku w `tools/tests/` | I-01 przeszło build, `check:dist` i CI bez ostrzeżenia: walidator sprawdza początek pliku, rozmiar i listę adresów, nie treść | Testy jednostkowe `tekstZHtml` (FAQ, tabela, lista, elementy pomijane) | 2–3 h |
| I-03 | drobne | `integrations/llms-txt.mjs:39-43, 80-81` | Element z `aria-label="treść hidden"`: wyrażenie znajduje „ hidden” w wartości innego atrybutu i cała sekcja znika z pliku | Rozkładać atrybuty na pary nazwa–wartość | 1 h |
| I-04 | drobne | `integrations/llms-txt.mjs:19, 78-84` | `dist/llms-full.txt:26-31`: przykładowy podgląd z hero („Faktura FV/11/0412 odczytana i zaksięgowana”, „Zamówienie 58 213”) jako zwykła treść | Pomijać `<aside>` albo elementy oznaczone jako dane poglądowe | 0,5–1 h |
| I-05 | drobne | `integrations/llms-txt.mjs:64` | `<img alt="Krok 1 > Krok 2">`: w pliku pojawia się `Krok 2">` | Koniec znacznika z pominięciem `>` w cudzysłowach | 0,5 h |
| I-06 | drobne | `integrations/llms-txt.mjs:105`; `tools/validate-dist.cjs:590` | Wpis na blogu ze zdaniem o znaczniku `<form>`: build przechodzi, `check:dist` odrzuca wydanie („zawiera znaczniki HTML”) | Walidator ma sprawdzać strukturę, a nie pojedyncze słowa | 0,5 h |
| I-07 | drobne | `integrations/llms-txt.mjs:85-101` | `dist/llms-full.txt:24`: „Umów bezpłatną konsultację Zobacz agenta w akcji”; odnośniki bez adresów | `<a href>` jako `[tekst](adres)`, pomijać przyciski CTA | 1–2 h |
| I-08 | drobne | `integrations/llms-txt.mjs:86, 187` | Strona z `<h5>`: wiersz z 7 znakami `#`, czyli nie nagłówek Markdown | Ograniczyć do 6 znaków po obu krokach | 0,25 h |
| I-09 | drobne | `integrations/llms-txt.mjs:119-124` | Literówka hosta w `sitemap.xml`: generator czyta lokalny plik i wpisuje obcy adres | Porównać origin z `MARKA.url` | 0,25 h |

### 3.4 Wdrożenie: `deploy/` i workflowy

| ID | Waga | Miejsce | Scenariusz błędu | Proponowana poprawka | Praca |
|---|---|---|---|---|---|
| D-01 | ważne | `deploy/nginx/revagy-naglowki.conf:12` | Odczyt produkcji 22.11.2026: CSP bez hostów `clarity.ms`, przy wdrożonym `clarity.js`. Po zgodzie przeglądarka blokuje Clarity. To znana, celowa zaległość (decyzja właściciela z 22.11, karty T-022 i T-024), ale nic poza kartami jej nie pilnuje | Podmiana pliku nagłówków razem z wydaniem 7cd0f71 (zgoda właściciela); po każdym wydaniu porównanie CSP z produkcji z plikiem w repo | 0,5 h właściciel + 1–2 h |
| D-02 | ważne | `deploy/matomo/docker-compose.yml:8-46` | Awaria dysku albo `MARIADB_AUTO_UPGRADE` przy nowym obrazie uszkadza bazę: w repo nie ma kopii zapasowej Matomo ani procedury odtworzenia | Cykliczny zrzut bazy poza host i jedna próba odtworzenia opisana w runbooku | 3–4 h |
| D-03 | ważne | `deploy/nginx/revagy.pl.conf:168-178` | Panel logowania Matomo dostępny publicznie (`stats.revagy.pl/` → 200). Zgadnięte hasło albo luka w Matomo daje adresy IP i ścieżki wizyt | Publicznie tylko `matomo.php`, `matomo.js` i zasoby trackera; panel za hasłem albo listą adresów, jak `/logi/` | 1–2 h |
| D-04 | ważne | `deploy/PROMPT-AGENT-VPS.md:4-9` | Runbook w repozytorium opisanym jako publiczne podaje nazwę i adres hosta, mapę portów usług lokalnych, nazwy kontenerów i inne domeny na tym serwerze. Atak na najsłabszą z nich daje dostęp do wszystkich | Szczegóły hosta do prywatnej dokumentacji, w repo procedura z symbolami zastępczymi. Uwaga: dane zostają w historii gita | 1–2 h |
| D-05 | ważne | `deploy/nginx/revagy.pl.conf:109-125` | Ponowny render `finanse.mp4` pod tą samą nazwą: powracający odwiedzający przez 30 dni widzi stary film z nowym kadrem startowym | Skrót treści w adresie każdego zasobu (razem z S-05) | w S-05 |
| D-06 | ważne | `deploy/nginx/revagy.pl.conf:1-179`; `.github/workflows/ci.yml` | Literówka w nowym przekierowaniu: plik przechodzi przegląd, a `nginx -t` odrzuca go na produkcji w trakcie okna wydania | Krok CI z obrazem nginx: `nginx -t` i kilka żądań kontrolnych (404, `/api/`, przekierowania, nagłówki, limit 429) | 3–4 h |
| D-07 | drobne | `deploy/wydanie.sh:353-380` | Po kilkudziesięciu wydaniach (każde to pełna kopia, 8,7 MB) partycja się zapełnia: nginx przestaje pisać logi, kolejne wydanie kończy się błędem kopiowania | Tryb `--prune`: N ostatnich wydań, nigdy bieżące ani poprzednie | 2–3 h |
| D-08 | drobne | `deploy/wydanie.sh:60-66, 140-153` | Katalog bazowy należy do konta operatora: operator podstawia dowiązanie `.deploy.lock`, a root otwiera je do zapisu | Przy uruchomieniu jako root wymagać właściciela root dla katalogu bazowego, `releases`, `manifests` i pliku blokady | 1 h |
| D-09 | drobne | `deploy/wydanie.sh:22-39` | Ctrl-C między poleceniami: staging znika, skrypt idzie dalej i kończy się mylącym komunikatem (bezpiecznie, ale przypadkiem) | Osobna pułapka sygnałów z `exit 130` | 0,5 h |
| D-10 | drobne | `deploy/wydanie.sh:150-153` | Zawieszone wydanie trzyma blokadę: rollback w trakcie awarii czeka bez końca | `flock -w 60` i jasny komunikat | 0,25 h |
| D-11 | drobne | `deploy/wydanie.sh:112-118` | Przeniesienie na host ze starszym `mawk`: `{64}` nie działa, każdy manifest jest odrzucany (obecny host, Ubuntu z nginx 1.24, działa) | Sprawdzać długość bez powtórzeń albo wymagać `gawk` | 0,5 h |
| D-12 | drobne | `deploy/nginx/revagy.pl.conf:24-30, 88-95` | Odczyt produkcji: `https://www.revagy.pl/` → 301 bez `Strict-Transport-Security`; HSTS bez `includeSubDomains` | Nagłówek HSTS także na przekierowaniach i hoście www | 0,5 h |
| D-13 | drobne | `deploy/nginx/revagy.pl.conf:33-46` | Produkcja zwraca `server: nginx/1.24.0 (Ubuntu)` | `server_tokens off` | 0,1 h |
| D-14 | drobne | `deploy/nginx/revagy-naglowki.conf:12` | `style-src 'unsafe-inline'` dopuszcza także wstrzyknięty `<style>`; strona potrzebuje tylko atrybutów `style` | `style-src 'self'; style-src-attr 'unsafe-inline'` | 0,5 h |
| D-15 | drobne | `deploy/matomo/docker-compose.yml:9, 27` | `docker compose pull` przy innej pracy podnosi Matomo o wersję bez testu; logi kontenera rosną bez limitu | Obrazy przypięte do skrótu, `logging` z `max-size` | 0,5 h |
| D-16 | drobne | `deploy/goaccess/revagy-logi-raport.sh:26-39` | Odczyt 90 dni archiwum co 10 minut bez blokady: przy większym ruchu dwa przebiegi piszą do tego samego `.nowy.html` | `flock` i baza przyrostowa GoAccess | 1 h |
| D-17 | drobne | `deploy/PROMPT-AGENT-VPS.md:15, 144` | Faza 4 każe uruchomić `node tools/smoke-test.cjs` na produkcji, a zasada 3 mówi, że na VPS nie ma Node: test po wydaniu łatwo pominąć | Ręczny workflow w GitHub Actions jako krok po wydaniu | 1–2 h |

### 3.5 Konfiguracja: `astro.config.mjs`

| ID | Waga | Miejsce | Scenariusz błędu | Proponowana poprawka | Praca |
|---|---|---|---|---|---|
| K-01 | drobne | `astro.config.mjs:5`; `src/config/marka.mjs:8`; `src/pages/index.astro:8`; `src/pages/kontakt.astro:8`; `src/pages/polityka-prywatnosci.astro:7`; `tools/lib/podstrona.cjs:13`; `tools/lib/smoke.cjs:116`; `tools/indexnow-ping.cjs:18` | Środowisko testowe pod inną domeną: adres bazowy trzeba poprawić w kilkunastu miejscach; pole `site` nie jest używane | Jedno źródło (`MARKA.url`) | 0,5 h (sam config) do 4 h (wszystko) |
| K-02 | drobne | `astro.config.mjs:4-11`; `src/config/kontakt.ts:1` | Literówka w nazwie zmiennej w nowym workflow: build kończy się sukcesem ze stroną bez formularza (łapie to dopiero `check:dist`) | Schemat `env` w konfiguracji z kontrolą formatu klucza | 1–2 h |
| K-03 | drobne | `astro.config.mjs:9`; `public/assets/` | Style i skrypty omijają przetwarzanie Astro: bez minifikacji (`styles.css` 59 kB, po gzip 12,6 kB) i bez skrótów treści | Krok builda nadający skrót (to samo co S-05) | w S-05 |

## 4. Bezpieczeństwo: przegląd ręczny

`/security-review` ocenia różnicę gałęzi względem `main`; tu była to wyłącznie karta zadania, więc wynik: brak
znalezisk. Poniżej ręczny przegląd całego kodu.

### 4.1 Formularz

- Dane użytkownika nie trafiają do `innerHTML`: `kontakt.js` pisze przez `textContent`, jedyny `innerHTML`
  (`analytics.js:164`) składa stały tekst.
- Wysyłka: JSON, `same-origin`, nagłówek `Idempotency-Key`, limit 16 kB zgodny z nginx (`client_max_body_size 16k`),
  limit czasu 20 s, pole-pułapka, Turnstile, pomiar czasu wypełniania. Bez danych pól w analityce i logach
  (`log_format fg_noquery`).
- Do Matomo trafia `lead_id` (po zgodzie); jest to opisane w polityce prywatności.
- Turnstile ładuje się bez zgody, gdy formularz pojawi się na ekranie; jest to opisane w polityce.
- **Poza zasięgiem audytu:** walidacja po stronie serwera, weryfikacja tokenu Turnstile, zapis, okresy
  przechowywania i ochrona przed duplikatem są w usłudze `forms-gateway`, której kodu nie ma w tym repo.
  To największa niesprawdzona część całości.
- Odczyt produkcji: `GET /api/kontakt` → 403, `GET /api/kontakt/status/<id>` bez tokenu → 401.

### 4.2 Nagłówki (odczyt produkcji 22.11.2026, wydanie 43efbf5)

- Są: `Strict-Transport-Security: max-age=31536000`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, CSP bez `unsafe-inline` dla skryptów, `frame-ancestors 'self'`, `form-action 'self'`.
- gzip działa; `http://` → 301 na `https://`; `/.git/config` → 403; nieistniejący adres → 404 z nagłówkami;
  `/logi/` → 401.
- Różnice względem repo i braki: D-01 (CSP bez Clarity, celowo), D-12 (HSTS na przekierowaniach), D-13 (wersja nginx),
  D-14 (`style-src`).
- `index.html` z produkcji jest bajtowo równy buildowi 43efbf5, czyli wydanie odpowiada repozytorium.

### 4.3 Sekrety

- Wyszukanie wzorców kluczy w śledzonych plikach: 0 trafień (poza testowymi tokenami w `tools/test-formularz.cjs`).
- Historia: jedyny plik typu `.env` to `.env.example`. `.gitignore` wyklucza `.env` i `.env.*`.
- Klucz Turnstile w HTML i w `tools/baseline/index.html` jest publiczny z definicji. Hasła Matomo i `htpasswd`
  są tylko na serwerze.
- Nie sekret, ale informacja wrażliwa: topologia hosta w runbooku (D-04).

### 4.4 Skrypty deploy i CI

- `deploy/wydanie.sh`: walidacja SHA, manifest z sumą, zakaz symlinków i hardlinków, staging, atomowe przełączenie,
  blokada, rollback z kontrolą bieżącego stanu; 16 testów. Uwagi: D-07 do D-11.
- Workflowy: `permissions: contents: read`, dane zdarzeń przekazywane przez zmienne środowiskowe, nic nie wypychają.
  Drobne: akcje przypięte do znaczników (`@v4`), nie do skrótów; `ci.yml` bez `persist-credentials: false`
  (pozostałe dwa mają); brak Dependabota lub Renovate.
- `ci.yml` pomija zmiany tylko w `kono-state/` i `README.md`. Jeśli status CI jest wymagany do scalenia,
  PR z samą kartą go nie dostanie (`lighthouse.yml` ma na to osobny krok).

### 4.5 Prywatność: uwagi

- Zgoda zapisana w `localStorage` nie wygasa; warto rozważyć ponowne pytanie po 12 miesiącach.
- Tekst banera po PR #28 wymienia Matomo i Microsoft Clarity; wydanie tej zmiany i podmiana CSP są w toku (T-024).

## 5. Gotowość produkcyjna

- Checklista HTML (offline): `/tmp/claude-0/-home-user-RevAGY/08ca5538-fcc0-5d06-a2b2-a50fa104bd3a/scratchpad/gotowosc-produkcyjna-revagy.html`.
  Plik jest poza repozytorium, bo zgoda obejmowała tylko kartę i ten raport; przekazałem go w rozmowie.
  Katalog roboczy jest tymczasowy, więc plik trzeba zapisać u siebie albo zdecydować o dodaniu do repo.
- Oceniana wersja: `main` 7cd0f71 (jeszcze niewdrożona; produkcja ma 43efbf5).
- Etap przygotowania: **47%, 11 z 23**. Spełnione: sekrety, główne zadanie, build, zależności, powtarzalne wydanie,
  rollback, plan kontroli po wydaniu, izolacja testów, limity czasu wywołań, przygotowanie logów, zgoda przed statystykami.
- Do poprawy (1): test formularza poza CI.
- Do sprawdzenia (11): dostęp do danych i panelu Matomo, limity nadużyć na działającym nginx, walidacja po stronie
  bramki, odtworzenie z kopii, okresy przechowywania poza repo, spójność zapisu w bramce, akceptowalny czas
  przerwy, pojemność i dysk, osoba reagująca na awarię, plan odtworzenia serwera, ocena bramki formularza.
- Po wdrożeniu czeka 8 punktów (m.in. zgodność nagłówków z repo, monitoring i powiadomienia, kopie produkcyjne),
  po udostępnieniu 2.
- Zalecenia (poza wynikiem): dostępność oceniona jako „do poprawy” (S-03, S-11, S-14), informacja o kontakcie spełniona.

## 6. Architektura

- **Model:** statyczna strona Astro 7 (12 stron, `build.format: 'file'`), bez JavaScriptu z potoku Astro.
  Style i skrypty są ręcznie pisane w `public/assets/`, bez zależności w przeglądarce. Wynik: 8,7 MB, z czego
  filmy to większość; HTML strony głównej 46,5 kB (12,9 kB po gzip).
- **Dwa układy:** `BaseLayout` (strona główna, kontakt, polityka, 404) i `PodstronaLayout` (8 podstron), zgodnie z D-031.
  Dane właściciela w `src/data/*.mjs` z zasadą „null = element się nie pokazuje”.
- **Łańcuch wydania:** build wyłącznie w CI → paczka z manifestem SHA-256 → ręczne wydanie skryptem na VPS
  (Caddy → nginx → `current`). Rollback przez przełączenie dowiązania. Konfiguracja nginx wdrażana osobno od strony.
- **Ochrona przed regresją:** trzy warstwy naraz: bajtowa migawka strony głównej, sumy wszystkich plików i stron,
  kontrakt DOM każdej strony; do tego lista dozwolonych zmian strony głównej, kontrola CSS podstron, rejestr liczb,
  kontrola nazw systemów, test dymny, test formularza, Lighthouse.
- **Mocne strony:** brak inline JS i ścisła CSP, jedno źródło nagłówków dla nginx i testów
  (`deploy/nginx/revagy-naglowki.conf`), odtwarzalny build (manifest lokalny równy przewidzianemu w karcie),
  bardzo ostrożny skrypt wydania, testy izolowane od prawdziwych usług.
- **Słabe strony:**
  - koszt zmiany jest wysoki: jedna zmiana tekstu to aktualizacja migawki, `htmlBaseline`, kontraktu DOM i często
    numerów `?v=`,
  - założenie „wszystko w korzeniu” (S-01) jest wpisane w układy, konfigurację, walidator i `podstrony.json`,
  - część serwerowa (bramka, Caddy, Matomo, monitoring) żyje poza repo i poza testami,
  - nginx i strona wdrażane osobno, bez kontroli zgodności (D-01, D-06).

## 7. Dług techniczny

1. Ręczne numery wersji zasobów w 5 miejscach (S-05, D-05, K-03).
2. Powielony HTML: formularz 2 razy, nagłówek i stopka 2–3 razy, dane firmy w 6 miejscach (S-06, S-07).
3. Kontrakt DOM 17 214 wierszy, który dubluje sumy bajtowe (T-07); przy każdej zmianie diff nie do przejrzenia.
4. Dwa parsery HTML i dwa odczyty `podstrony.json` (T-08, T-12); trzy lokalne serwery testowe (dymny, Lighthouse, nginx).
5. Adres bazowy strony wpisany w kilkunastu miejscach (K-01).
6. Mapa witryny pisana ręcznie (T-10).
7. Brak sprawdzania typów mimo interfejsów `Props` (S-18); `.nvmrc` to „22”, a `engines` wymaga co najmniej 22.23.4.
8. Skrypty npm z ukrytymi warunkami (T-09); Playwright przypięty do wersji, której przeglądarki trzeba doinstalować.
9. Pliki archiwalne w repo: `deploy/nginx/revagy.pl.bootstrap.conf`, `tools/baseline/index.baza.html` jako zapasowa baza.
10. `theme_color` w `site.webmanifest` (`#141114`) inny niż `meta theme-color` (`#ffffff`); strony w `BaseLayout`
    poza główną nie mają znaczników Open Graph.

## 8. Luki w testach

| Obszar | Stan | Znalezisko |
|---|---|---|
| Formularz w przeglądarce | test jest (14 grup), ale poza CI | T-01 |
| Bramka formularza | poza repo, bez testu kontraktowego w tym repo | sekcja 4.1 |
| Walidator wydania | tylko ścieżka pozytywna | T-02 |
| Integracja `llms.txt` | brak testów treści | I-02 |
| Konfiguracja nginx | brak `nginx -t` i żądań kontrolnych | D-06 |
| Zgodność produkcji z repo (nagłówki) | brak | D-01, D-17 |
| Lighthouse | 1 z 12 stron, bez strony głównej | T-04 |
| Porównania z bazą | przechodzą, gdy bazy nie ma | T-03 |
| Skrypty stron (`app.js`, `analytics.js`) | tylko przez test dymny; brak testu karuzeli, powrotu na kartę, wycofania zgody przed załadowaniem Clarity | S-10, S-12, S-13 |
| Dostępność | Lighthouse dla jednej strony; brak testu klawiatury banera i filmów | S-03, S-11, S-14 |
| Kontrola D-033 i liczb | pomija JSON-LD, kontakt i politykę | T-06 |
| Typy | brak `astro check` | S-18 |
| Kopie zapasowe | brak próby odtworzenia | D-02 |

## 9. Top 10 do naprawy, w kolejności

| Nr | Co | Znaleziska | Dlaczego teraz | Praca |
|---|---|---|---|---|
| 1 | Test formularza w CI | T-01 | Najtańsza ochrona głównej ścieżki pozyskania zapytań | 0,5–1 h |
| 2 | Wydanie 7cd0f71 z podmianą nagłówków i kontrola CSP po wydaniu | D-01, D-17 | Clarity jest dziś blokowane; decyzja już zapadła, brakuje domknięcia | 0,5 h właściciel + 2–4 h |
| 3 | Pytania FAQ w `llms-full.txt` i testy integracji | I-01, I-02 | Plik dla modeli językowych jest dziś mylący (58 pustych nagłówków) | 3–5 h |
| 4 | Kopia zapasowa Matomo i próba odtworzenia | D-02 | Jedyne dane na serwerze, których nie da się odtworzyć z repo | 3–4 h |
| 5 | Panel Matomo za dodatkową ochroną; topologia hosta poza repo | D-03, D-04 | Zmniejsza powierzchnię ataku na serwer współdzielony z innymi domenami | 2–4 h |
| 6 | Skróty treści zasobów zamiast `?v=` | S-05, D-05, K-03 | Usuwa klasę błędów „stary plik w pamięci podręcznej” i ręczną pracę przy każdej zmianie | 4–8 h |
| 7 | Obsługa stron w podkatalogach | S-01 | Warunek wstępny bloga (D-010) | 8–16 h |
| 8 | Wspólne komponenty: formularz, nagłówek, stopka, dane firmy z `MARKA` | S-06, S-07 | Przed dodaniem kolejnych stron; HTML wynikowy bez zmian | 7–10 h |
| 9 | Testy negatywne walidatora, błąd przy braku bazy, `nginx -t` w CI | T-02, T-03, D-06 | Zabezpieczenia mają być sprawdzone, że potrafią odrzucić | 10–14 h |
| 10 | Formularz i dostępność: komunikat przed wysyłką, fokus banera, wstrzymanie filmów; Lighthouse dla większej liczby stron | S-08, S-11, S-03, T-04 | Widoczne dla odwiedzających; S-03 wymaga decyzji właściciela | 7–12 h |

Razem około 47–78 h pracy agenta. Kolejność 1–5 nie zależy od siebie; 6 warto zrobić przed 7 i 8, bo każda z nich
zmienia HTML wszystkich stron i wymaga aktualizacji kontraktu.

## 10. Do decyzji właściciela

1. **Trzy poprawki z `astro.config.mjs`** (prośba z 22.11 w trakcie audytu): nie wdrożyłem, bo zlecenie mówi
   „zero zmian w kodzie”, a reguła pracy wymaga planu i zgody. Plan:
   - K-01, wariant minimalny: `site: MARKA.url` w `astro.config.mjs` (1 plik, HTML bez zmian). Pełne ujednolicenie
     adresu w stronach i narzędziach to osobny krok (około 4 h).
   - K-02: schemat `env` w `astro.config.mjs` i odczyt w `src/config/kontakt.ts` (2 pliki). Warunek odbioru:
     `check:dist` 6/6, czyli HTML bajtowo bez zmian.
   - K-03: to nie jest zmiana minimalna. Zmienia adresy zasobów na wszystkich 12 stronach, migawkę strony głównej
     i kontrakt (D-015, D-021), regułę walidatora o `_astro/` i czasy pamięci podręcznej w nginx. Proponuję osobne
     zadanie razem z S-05.
2. **S-03:** czy dodać wstrzymanie filmów w hero i w sekcji pulpitu (dotyka wyglądu strony głównej, D-015).
3. **D-033 a strona główna:** pasek integracji ma 22 pozycje, w tym 20 nazw własnych systemów z listy zakazanych na podstronach (`src/pages/index.astro:355-359`),
   a lista w `tools/nazwy-systemow.json` traktuje go jako punkt wyjścia zakazu na podstronach. Proszę o potwierdzenie,
   że D-033 dotyczy podstron, a pasek zostaje.
4. **D-04:** czy repozytorium jest publiczne i czy szczegóły hosta mają z niego zniknąć (zostaną w historii).
5. **Bramka formularza:** czy udostępnić jej repozytorium do takiej samej oceny.
6. **Checklista HTML:** czy dodać ją do repo (np. `docs/production-readiness.html`).

## 11. Ograniczenia audytu

- Nie widziałem: kodu `forms-gateway`, konfiguracji Caddy, ustawień Matomo i Clarity, stanu serwera.
- Testy przeglądarkowe uruchomione na Chromium build 1243 zamiast przypiętego 1255.
- Lighthouse w repo mierzy jedną stronę; liczby wydajności dotyczą tylko `finanse.html`.
- Odczyt produkcji to stan z 22.11.2026 dla wydania 43efbf5; wersja 7cd0f71 nie jest jeszcze wdrożona.
- Narzędzie przeglądu działało w jednym przebiegu na cel, bez osobnej weryfikacji każdego znaleziska;
  numery linii sprawdziłem skryptem względem 7cd0f71, a znaleziska I-01, S-09, D-01, D-03, D-12, D-13, T-05 i T-09
  potwierdziłem wykonaniem lub odczytem.
- Numer karty: T-028 (od 22.11.2026). Audyt zaczynał jako T-024, potem T-025; oba numery zajęły równolegle inne karty.

## 12. Stan po audycie (aktualizacja 22.11.2026)

- K-01 i K-02: wdrożone, PR #37 (karta T-027).
- S-05, D-05, K-03: skrót treści w adresach zasobów, karta T-030.
- D-02, D-03, D-04, D-06, D-12, D-13, D-17: wzorce i testy w repo, karta T-029; instalacja na serwerze po stronie właściciela.
- D-01: zamknięte. Odczyt produkcji 22.11.2026 po wydaniu 7cd0f71: CSP zawiera hosty `clarity.ms`, nagłówki zgodne z repo (`npm run check:prod`, 33 sprawdzenia).
- S-03 (film w hero), S-08, S-11, T-02, T-04: karta T-031. Film pulpitu zostaje bez przycisku (D-046 dotyczy hero).
- Nowe ustalenie z T-031: Lighthouse strony głównej, wydajność 73–75 (LCP 4,1 s, czas blokowania 560 ms).
