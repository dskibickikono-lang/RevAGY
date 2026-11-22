# RevAGY

Strona firmy REVAGY (automatyzacja procesów i wdrożenia AI w B2B — ze szczególnym uwzględnieniem agencji pracy tymczasowej, rekrutacji oraz firm produkcyjnych i magazynowych) pod `https://revagy.pl`.

Projekt generuje czystą statyczną stronę w Astro (`output: 'static'`, `build.format: 'file'`, `trailingSlash: 'never'`, `compressHTML: false`) z zachowaniem oryginalnego DOM, stylów CSS, skryptów w `public/assets/js/`, lokalnych fontów i własnych filmów, bez bundlowania klienta i bez katalogu `/_astro/`.
Analityka jest własna (Matomo na `stats.revagy.pl`) i włącza się dopiero po zgodzie odwiedzającego.

## Wymagania

- Node.js 22 (`.nvmrc` / `.node-version`: `22`; Astro wymaga `>=22.23.4`)
- Astro `^7.4.12` (dokładna wersja w `package-lock.json`, ta sama linia co `web-skoben` i `web-skibilabs`)
- Playwright `1.65.1` (devDependency dla testu dymnego, testu formularza oraz skryptów renderujących media)

## Uruchomienie i build

```bash
npm ci
npm run dev       # lokalny podgląd deweloperski Astro
npm run build     # generuje statyczny artefakt do dist/
npm run preview   # podgląd wygenerowanego katalogu dist/
```

## Struktura

| Ścieżka | Zawartość |
|---|---|
| `astro.config.mjs` | konfiguracja Astro (`static`, `format: 'file'`, `trailingSlash: 'never'`, `compressHTML: false`) |
| `src/layouts/BaseLayout.astro` | wspólny szkielet HTML bez dodatkowych wrapperów DOM |
| `src/config/marka.mjs` | jedno źródło danych marki (nazwa, opis, dane rejestrowe, profil LinkedIn) dla JSON-LD i `llms.txt` |
| `integrations/llms-txt.mjs` | integracja Astro: po buildzie generuje `dist/llms.txt` i `dist/llms-full.txt` ze stron z `sitemap.xml` |
| `src/config/kontakt.ts` | konfiguracja klucza witryny Turnstile (`PUBLIC_TURNSTILE_SITEKEY`) i klauzuli RODO formularza |
| `src/pages/index.astro` | strona główna; jej wygląd i motyw są chronione migawką (`tools/baseline/index.html`) |
| `src/pages/kontakt.astro`, `src/pages/polityka-prywatnosci.astro` | strona kontaktu z formularzem i polityka prywatności (`kontakt.html`, `polityka-prywatnosci.html`) |
| `src/pages/integracja-systemow.astro`, `src/pages/wdrozenia.astro`, `src/pages/dla-firm.astro`, `src/pages/dane-i-bezpieczenstwo.astro`, `src/pages/produkcja-i-logistyka.astro` | podstrony sprzedażowe, każda z miejscem na film (kadr albo film) |
| `src/pages/porownanie-rozwiazan.astro`, `src/pages/jak-wybrac-pierwszy-proces.astro` | strony poradnikowe, bez filmu |
| `src/pages/finanse.astro` | podstrona działowa „Finanse” (`finanse.html`: faktury kosztowe, windykacja, uzgodnienia) z miejscem na film; prowadzą do niej pozycje „Finanse” w menu i stopce podstron |
| `src/layouts/PodstronaLayout.astro`, `src/components/` | układ podstron (nagłówek, stopka, adres kanoniczny, dane strukturalne) i komponenty: `MiejsceNaFilm`, `Pytania`, `OpisWdrozenia`, `Autor`, `Ujawnienie` |
| `src/config/filmy.mjs`, `src/config/podstrony.mjs` | opisy miejsc na film (tekst zastępczy, tytuł, czas, data) i wspólne ustawienia podstron |
| `src/data/dowody.mjs`, `src/data/oferta.mjs`, `src/data/bezpieczenstwo.mjs`, `src/data/poradniki.mjs` | wartości, które wpisuje wyłącznie właściciel (nazwy firm, „jak mierzone”, cytaty, ceny, zgody); puste pole to `null` i wtedy zależny od niego element nie pokazuje się na stronie |
| `public/assets/css/podstrony.css`, `public/assets/js/wejscie.js` | style podstron (tylko wartości ze `styles.css`) i zapis pierwszego wejścia na podstronie dla formularza kontaktowego |
| `src/pages/404.astro` | strona błędu (`404.html`) |
| `public/assets/css/styles.css` | style, tokeny kolorów i typografii |
| `public/assets/js/app.js` | animacje i interakcje (menu, liczniki, kalkulator, sticky scroll, karuzela, marquee, taby, filtry, FAQ, Journey Rail) |
| `public/assets/js/analytics.js` | baner zgody i zdarzenia dla Matomo (`stats.revagy.pl`, `siteId = 1`, w tym `lead:accepted`) |
| `public/assets/js/kontakt.js` | obsługa formularza kontaktowego, Cloudflare Turnstile i wysyłki do `POST /api/kontakt` (`forms-gateway`) |
| `public/assets/video/` | 3 filmy strony głównej (`.webm` + `.mp4`) z plakatami `.jpg` oraz media miejsc na film podstron: kadr `<nazwa>-kadr.jpg` albo film `<nazwa>.webm`, `.mp4` i kadr startowy `.jpg` |
| `public/assets/fonts/` | Onest, Instrument Sans, JetBrains Mono (SIL OFL 1.1, licencje obok) |
| `public/favicon.ico`, `public/robots.txt`, `public/sitemap.xml`, `public/site.webmanifest` | pliki główne kopiowane bezpośrednio do `dist/` |
| `tools/dom-contract.json`, `tools/validate-dist.cjs` | kontrakt DOM/SEO oraz walidator kompletności, sum SHA-256, braku inline JS/`/_astro/`, danych strukturalnych JSON-LD i plików `llms*.txt` |
| `tools/smoke-test.cjs` | rozszerzony test dymny w Chromium (Playwright) z wbudowanym serwerem TLS (`--serve=dist`) i atrapą Matomo |
| `tools/test-formularz.cjs` | test formularza kontaktowego (osobny build z kluczem testowym Turnstile, atrapa `forms-gateway` i Matomo) |
| `tools/test-wydanie.cjs` | izolowane testy skryptu publikacji i rollbacku `deploy/wydanie.sh` |
| `tools/podstrony.json`, `tools/rejestr-twierdzen.json` | lista podstron objętych kontrolami oraz rejestr liczb i twierdzeń: każda liczba na podstronie musi mieć tu wiersz ze źródłem |
| `tools/baseline/`, `tools/etapy/`, `tools/compare-home.cjs` | migawka strony głównej, lista zamierzonych zmian etapu i porównanie, które odrzuca każdą zmianę strony głównej spoza listy |
| `tools/check-all.cjs`, `tools/check-tresc.cjs`, `tools/check-podstrony-css.cjs`, `tools/update-contract.cjs` | komplet kontroli katalogu wynikowego, kontrola treści podstron, kontrola stylów podstron i odtworzenie kontraktu z builda CI |
| `tools/scenes/`, `tools/render-videos.cjs`, `tools/render-kadr.cjs`, `tools/render-images.cjs` | źródła i generatory filmów, kadrów podstron, `og.jpg` i ikon do `public/`; kadry i filmy renderuje w GitHub Actions `.github/workflows/render-media.yml` |
| `deploy/` | runbook operacyjny (`PROMPT-AGENT-VPS.md`), szablony nginx (wariant A + `/api/kontakt`), Matomo, GoAccess, logrotate i atomowy skrypt wydania `wydanie.sh` |
| `kono-state/` | rejestr decyzji i karty zadań |

## Weryfikacja i testy

```bash
npm ci
npm run build
npm run check:dist                           # waliduje dist/ (SHA-256 assetów i stron, kontrakt DOM każdej strony, JSON-LD, llms*.txt) i uruchamia narzędzia ochrony motywu
npm run test:smoke -- --serve=dist           # pełny test dymny na lokalnym TLS z atrapą Matomo (strona główna + podstrony z tools/podstrony.json)
npm run test:form                            # test formularza kontaktowego (Turnstile + forms-gateway + CSP + Matomo)
npm run test:deploy                          # izolowane testy deploy/wydanie.sh (POSIX sh/dash, flock, staging, rollback)
```

`check:dist` woła `tools/check-all.cjs`, który uruchamia po kolei walidator, `compare-home.cjs`, `check-podstrony-css.cjs`, `check-tresc.cjs` i testy narzędzi; zbudowany `index.html` musi być bajtowo równy migawce `tools/baseline/index.html`, a zamierzoną zmianę strony zapisuje się w kontrakcie i migawce poleceniem `node tools/update-contract.cjs <dist> --snapshot`.

Dodatkowe tryby `tools/smoke-test.cjs`:
- `node tools/smoke-test.cjs http://localhost:8000` — test na zwykłym hoście nieprodukcyjnym (potwierdza blokadę trackera),
- `node tools/smoke-test.cjs https://revagy.pl` — test przeciwko produkcji (żądania do `stats.revagy.pl` są przechwytywane atrapą).

## CI i artefakt wydania

`.github/workflows/ci.yml` przy każdym PR i pushu na `main` uruchamia build, `check:dist`, test dymny i testy `wydanie.sh`, a potem publikuje artefakt `revagy-dist-<sha>` (`.tar.gz` z `dist/`, manifest SHA-256, `SHA256SUMS`). To jedyne źródło plików do wdrożenia: VPS nie buduje strony i nie potrzebuje Node.

## Wdrożenie i rollback

Publikacja odbywa się wyłącznie z artefaktu CI (rozpakowany katalog `dist`) za pomocą skryptu `deploy/wydanie.sh` (POSIX `sh`, `flock`, staging na tym samym systemie plików, porównanie pełnego manifestu, atomowe `mv -Tf` symlinka `current`):

```bash
# 1. Jednorazowa inicjalizacja manifestu zastanego wydania bazowego:
sh deploy/wydanie.sh --init-manifest <stary-sha> <manifest-bazowy> <sha256-manifestu-bazowego>

# 2. Publikacja nowego wydania:
sh deploy/wydanie.sh <sciezka-do-dist> <nowy-sha> <oczekiwany-biezacy-sha> <manifest-dist> <sha256-manifestu-dist>

# 3. Natychmiastowy powrót (rollback) do zweryfikowanego wydania:
sh deploy/wydanie.sh --rollback <docelowy-sha> <oczekiwany-biezacy-sha> [<manifest-referencyjny> <sha256-manifestu>]
```

Szczegółowa procedura operacyjna dla obecnej architektury serwera (Caddy `:80/:443` → lokalny nginx `127.0.0.1:8092`) znajduje się w `deploy/PROMPT-AGENT-VPS.md`.
Po zmianie stylów lub skryptów podbij parametr `?v=` w `src/layouts/BaseLayout.astro`, aby przeglądarki pobrały nową wersję.

## Analityka

| Warstwa | Co zapisuje | Kiedy |
|---|---|---|
| Matomo (`stats.revagy.pl`) | odsłony, źródło wejścia, kliknięcia z nazwą sekcji, widoki i czas sekcji, przewinięcie, aktywny czas, ustawienia kalkulatora, identyfikator przyjętego formularza, IP, przeglądarka | po zgodzie w banerze |
| Logi nginx + GoAccess (`stats.revagy.pl/logi/`) | IP, user agent, adres, strona odsyłająca, kod odpowiedzi każdego żądania, także botów; boty AI jako osobne pozycje i dzienne zestawienie `stats.revagy.pl/logi/boty-ai.txt` | zawsze, 90 dni |

## Filmy

Filmy powstają z animowanych scen w `tools/scenes/`. Po zmianie sceny:

```bash
node tools/render-videos.cjs            # wszystkie sceny → public/assets/video/
node tools/render-videos.cjs hero-flow  # jedna scena
```

Wymaga Playwrighta z Chromium oraz `ffmpeg`.

## Wzorzec i granica kopiowania

Układ, rytm sekcji i rodzaj animacji są wzorowane na stronie Revolut Business „konta wielowalutowe”
(decyzje D-002 i D-003 w `kono-state/decisions/REJESTR_DECYZJI_BIZNESOWYCH.md`). W repo nie ma żadnych
zasobów, tekstów, fontów ani filmów Revoluta.

## Treści poglądowe i dane wdrożeń

Widoki ekranów w makietach i filmach są poglądowe i tak opisane w stopce. Liczby, cytaty oraz statusy wdrożeń (`Produkcja`, `Pilotaż`, `W trakcie`) pochodzą ze zweryfikowanego portfolio 14 klientów (16 podmiotów) z jawnym ujawnieniem powiązania właścicielskiego w Grupie KONO.

## Formularz kontaktowy i forms-gateway

`POST /api/kontakt` jest wysyłany pod ten sam adres strony (same-origin); nginx przekazuje go do osobnej bramki na `127.0.0.1:8095/v1/submit`. Formularz produkcyjny pojawia się dopiero po ustawieniu `PUBLIC_TURNSTILE_SITEKEY` podczas builda; stała i wydanie informacji o danych są w `src/config/kontakt.ts`. Pusty klucz zachowuje bezpośredni kontakt e-mailem oraz interaktywną wersję podglądową na `/kontakt.html`. Nie dodajemy zależności ani ciasteczek formularza.

Turnstile ładuje się po wejściu formularza w widok lub ustawieniu w nim fokusu. Wybrano `appearance: 'interaction-only'`: widżet pokazuje się tylko wtedy, gdy potrzebuje działania użytkownika. Ustawienia widżetu: tryb Managed, domena `revagy.pl`, działanie `kontakt-revagy`. Kontakt e-mailem pozostaje dostępny także bez JavaScript. Matomo dostaje wyłącznie zdarzenie przyjęcia z identyfikatorem zapytania, po uruchomieniu analityki za zgodą; wartości pól nie są przekazywane.

`npm run test:form` buduje osobny katalog tymczasowy z publicznym kluczem testowym Cloudflare i uruchamia Chromium z atrapami Turnstile, bramki i Matomo. Test nie korzysta z prawdziwych usług. Test dymny i test formularza czytają CSP bezpośrednio z `deploy/nginx/revagy-naglowki.conf`.

Zmiana vhosta i CSP na produkcji wymaga osobnej zgody właściciela; ustawienie klucza i uruchomienie bramki to osobne kroki przed włączeniem formularza. Log formularza obejmuje istniejąca rotacja `/var/log/nginx/revagy/*.log`. Szczegóły: [wzorce nginx](deploy/nginx/README.md).

Rollback: właściciel przywraca poprzednie pliki nginx, wykonuje `nginx -t`, następnie `systemctl reload nginx`. Stronę cofa `deploy/wydanie.sh --rollback <docelowy-sha> <oczekiwany-biezacy-sha>`. Te czynności nie są wykonywane przez testy formularza.

## Rozpoznawalność marki: dane strukturalne i `llms.txt`

- Strona główna ma jeden blok JSON-LD (`Organization` + `WebSite`) budowany z `src/config/marka.mjs`. To jedyny dopuszczony `<script>` bez `src`: nie jest wykonywany, więc CSP (`script-src 'self'`) go nie blokuje. Walidator sprawdza składnię oraz NIP, adres strony i profil LinkedIn.
- `llms.txt` (spis stron z opisami) i `llms-full.txt` (pełna treść `<main>` wszystkich stron) powstają przy każdym buildzie z `dist/sitemap.xml`. Nowa podstrona albo wpis na blogu trafia do nich po dopisaniu do sitemapy. Stron z `noindex` w nich nie ma, polityka prywatności jest w sekcji `Optional`.
- Zmiana danych firmy lub dodanie profilu (np. profilu firmy w Google): edytuj `src/config/marka.mjs`, a potem `structuredData` w `tools/dom-contract.json`.
- Uzasadnienie i plan pomiaru: `kono-state/notes/2026-11-20-rozpoznawalnosc-marki.md`.

