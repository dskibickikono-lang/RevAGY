# RevAGY

Strona firmy REVAGY (automatyzacja procesów i wdrożenia AI w B2B) pod `https://revagy.pl`.

Projekt generuje czystą statyczną stronę w Astro (`output: 'static'`, `build.format: 'file'`, `trailingSlash: 'never'`, `compressHTML: false`) z zachowaniem oryginalnego DOM, stylów CSS, skryptów w `public/assets/js/`, lokalnych fontów i własnych filmów, bez bundlowania klienta i bez katalogu `/_astro/`.
Analityka jest własna (Matomo na `stats.revagy.pl`) i włącza się dopiero po zgodzie odwiedzającego.

## Wymagania

- Node.js `>=22.23.4` (przypięte w `.nvmrc` / `.node-version`: `22.23.4`)
- npm `10.9.9`
- Astro `7.4.12` (zależność przypięta w `package.json` i `package-lock.json`)
- Playwright `1.65.1` (devDependency dla testu dymnego oraz skryptów renderujących media)

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
| `src/pages/index.astro` | strona główna (12 sekcji) |
| `src/pages/polityka-prywatnosci.astro`, `src/pages/404.astro` | podstrony (`polityka-prywatnosci.html`, `404.html`) |
| `public/assets/css/styles.css` | style, tokeny kolorów i typografii |
| `public/assets/js/app.js` | animacje i interakcje (menu, liczniki, kalkulator, sticky scroll, karuzela, FAQ) |
| `public/assets/js/analytics.js` | baner zgody i zdarzenia dla Matomo (`stats.revagy.pl`, `siteId = 1`) |
| `public/assets/video/` | 3 filmy (`.webm` + `.mp4`) i plakaty `.jpg` |
| `public/assets/fonts/` | Onest, Instrument Sans, JetBrains Mono (SIL OFL 1.1, licencje obok) |
| `public/favicon.ico`, `public/robots.txt`, `public/sitemap.xml`, `public/site.webmanifest` | pliki główne kopiowane bezpośrednio do `dist/` |
| `tools/dom-contract.json`, `tools/validate-dist.cjs` | kontrakt DOM/SEO oraz walidator kompletności, sum SHA-256 i braku inline JS/`/_astro/` |
| `tools/smoke-test.cjs` | rozszerzony test dymny w Chromium (Playwright) z wbudowanym serwerem TLS (`--serve=dist`) i atrapą Matomo |
| `tools/test-wydanie.cjs` | izolowane testy skryptu publikacji i rollbacku `deploy/wydanie.sh` |
| `tools/scenes/`, `tools/render-videos.cjs`, `tools/render-images.cjs` | źródła i generatory filmów, `og.jpg` i ikon do `public/` |
| `deploy/` | runbook operacyjny (`PROMPT-AGENT-VPS.md`), szablony nginx (wariant A), Matomo, GoAccess, logrotate i atomowy skrypt wydania `wydanie.sh` |
| `kono-state/` | rejestr decyzji i karty zadań |

## Weryfikacja i testy

```bash
npm ci
npm run build
npm run check:dist                           # waliduje dist/ (33 pliki, SHA-256 assetów, kontrakt DOM)
npm run test:smoke -- --serve=dist           # pełny test dymny (53 sprawdzenia) na lokalnym TLS z atrapą Matomo
npm run test:deploy                          # izolowane testy deploy/wydanie.sh (POSIX sh/dash, flock, staging, rollback)
```

Dodatkowe tryby `tools/smoke-test.cjs`:
- `node tools/smoke-test.cjs http://localhost:8000` — test na zwykłym hoście nieprodukcyjnym (potwierdza blokadę trackera),
- `node tools/smoke-test.cjs https://revagy.pl` — test przeciwko produkcji (żądania do `stats.revagy.pl` są przechwytywane atrapą).

## Wdrożenie i rollback

Publikacja odbywa się wyłącznie z wcześniej zbudowanego i zwalidowanego katalogu `dist` za pomocą skryptu `deploy/wydanie.sh` (POSIX `sh`, `flock`, staging na tym samym systemie plików, porównanie pełnego manifestu, atomowe `mv -Tf` symlinka `current`):

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
| Matomo (`stats.revagy.pl`) | odsłony, źródło wejścia, kliknięcia z nazwą sekcji, widoki i czas sekcji, przewinięcie, aktywny czas, ustawienia kalkulatora, IP, przeglądarka | po zgodzie w banerze |
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

## Treści poglądowe

Widoki ekranów w makietach i filmach oraz nazwy firm w przykładach są poglądowe i tak opisane w stopce.
Liczby w sekcji pod hero („14 dni”, „120+”, „60%”, „24/7”) to deklaracje firmy przyjęte decyzją D-009.
