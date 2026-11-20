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
| `src/config/kontakt.ts` | konfiguracja klucza witryny Turnstile (`PUBLIC_TURNSTILE_SITEKEY`) i klauzuli RODO formularza |
| `src/pages/index.astro` | strona główna P0 (hero, statystyki, logo wall, bento, triggery, produkty, case studies, proces, kalkulator ROI 65 zł/h, film, pakiety, integracje, FAQ, kontakt) |
| `src/pages/realizacje.astro`, `src/pages/oferta.astro`, `src/pages/bezpieczenstwo.astro`, `src/pages/kontakt.astro`, `src/pages/polityka-prywatnosci.astro` | podstrony P0 (`realizacje.html`, `oferta.html`, `bezpieczenstwo.html`, `kontakt.html`, `polityka-prywatnosci.html`) |
| `src/pages/dla-agencji-pracy.astro`, `src/pages/dla-produkcji-i-magazynow.astro`, `src/pages/realizacje/grupa-kono.astro`, `src/pages/porownanie.astro` | podstrony lejka P1 (`dla-agencji-pracy.html`, `dla-produkcji-i-magazynow.html`, `realizacje/grupa-kono.html`, `porownanie.html`) |
| `src/pages/produkty/obieg-dokumentow.astro` | podstrona produktu P2 (`produkty/obieg-dokumentow.html`) |
| `src/pages/404.astro` | strona błędu (`404.html`) |
| `public/assets/css/styles.css` | style, tokeny kolorów i typografii, komponenty kinetyczne i podstron P0–P2 |
| `public/assets/js/app.js` | animacje i interakcje (menu, liczniki, kalkulator, sticky scroll, karuzela, marquee, taby, filtry, FAQ, Journey Rail) |
| `public/assets/js/analytics.js` | baner zgody i zdarzenia dla Matomo (`stats.revagy.pl`, `siteId = 1`, w tym `lead:accepted`) |
| `public/assets/js/kontakt.js` | obsługa formularza kontaktowego, Cloudflare Turnstile i wysyłki do `POST /api/kontakt` (`forms-gateway`) |
| `public/assets/video/` | 3 filmy (`.webm` + `.mp4`) i plakaty `.jpg` |
| `public/assets/fonts/` | Onest, Instrument Sans, JetBrains Mono (SIL OFL 1.1, licencje obok) |
| `public/favicon.ico`, `public/robots.txt`, `public/sitemap.xml`, `public/site.webmanifest` | pliki główne kopiowane bezpośrednio do `dist/` |
| `tools/dom-contract.json`, `tools/validate-dist.cjs` | kontrakt DOM/SEO oraz walidator kompletności, sum SHA-256 i braku inline JS/`/_astro/` |
| `tools/smoke-test.cjs` | rozszerzony test dymny w Chromium (Playwright) z wbudowanym serwerem TLS (`--serve=dist`) i atrapą Matomo |
| `tools/test-formularz.cjs` | test formularza kontaktowego (osobny build z kluczem testowym Turnstile, atrapa `forms-gateway` i Matomo) |
| `tools/test-wydanie.cjs` | izolowane testy skryptu publikacji i rollbacku `deploy/wydanie.sh` |
| `tools/scenes/`, `tools/render-videos.cjs`, `tools/render-images.cjs` | źródła i generatory filmów, `og.jpg` i ikon do `public/` |
| `deploy/` | runbook operacyjny (`PROMPT-AGENT-VPS.md`), szablony nginx (wariant A + `/api/kontakt`), Matomo, GoAccess, logrotate i atomowy skrypt wydania `wydanie.sh` |
| `kono-state/` | rejestr decyzji i karty zadań |

## Weryfikacja i testy

```bash
npm ci
npm run build
npm run check:dist                           # waliduje dist/ (43 pliki, SHA-256 assetów, kontrakt DOM dla 12 stron)
npm run test:smoke -- --serve=dist           # pełny test dymny na lokalnym TLS z atrapą Matomo (strona główna + podstrony P0-P2)
npm run test:form                            # test formularza kontaktowego (Turnstile + forms-gateway + CSP + Matomo)
npm run test:deploy                          # izolowane testy deploy/wydanie.sh (POSIX sh/dash, flock, staging, rollback)
```

Dodatkowe tryby `tools/smoke-test.cjs`:
- `node tools/smoke-test.cjs http://localhost:8000` — test na zwykłym hoście nieprodukcyjnym (potwierdza blokadę trackera),
- `node tools/smoke-test.cjs https://revagy.pl` — test przeciwko produkcji (żądania do `stats.revagy.pl` są przechwytywane atrapą).

## CI i artefakt wydania

`.github/workflows/ci.yml` przy każdym PR i pushu na `main` uruchamia build, `check:dist`, test dymny, test formularza i testy `wydanie.sh`, a potem publikuje artefakt `revagy-dist-<sha>` (`.tar.gz` z `dist/`, manifest SHA-256, `SHA256SUMS`). To jedyne źródło plików do wdrożenia: VPS nie buduje strony i nie potrzebuje Node.

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
| Logi nginx + GoAccess (`stats.revagy.pl/logi/`) | IP, user agent, adres, strona odsyłająca, kod odpowiedzi każdego żądania, także botów | zawsze, 90 dni |

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
