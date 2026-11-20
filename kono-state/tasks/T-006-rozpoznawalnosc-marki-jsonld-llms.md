---
id: T-006
title: Rozpoznawalność marki — JSON-LD, llms.txt i pomiar botów AI
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-20
updated: 2026-11-20
branch: feat/rozpoznawalnosc-marki
base: main (po scaleniu PR #5)
depends_on: PR #5
decisions: [D-011, D-012, D-013, D-014]
---

# T-006 — Rozpoznawalność marki: JSON-LD, llms.txt i pomiar botów AI

## Cel

Tanie wdrożenia, które porządkują tożsamość marki dla wyszukiwarek i modeli AI, oraz pomiar, który za
8–12 tygodni pokaże, co z tego działa. Uzasadnienie: `kono-state/notes/2026-11-20-rozpoznawalnosc-marki.md`.

## Zakres

1. `src/config/marka.mjs`: jedno źródło danych marki (opis, dane rejestrowe zgodne ze stopką, LinkedIn).
2. `BaseLayout.astro`: JSON-LD `Organization` + `WebSite` na stronie głównej (`is:inline`, `type="application/ld+json"`).
3. `integrations/llms-txt.mjs`: po buildzie `dist/llms.txt` i `dist/llms-full.txt` ze stron z `sitemap.xml`.
4. `tools/validate-dist.cjs` + `dom-contract.json`: JSON-LD jako jedyny dopuszczony `<script>` bez `src`
   (tylko na stronach z `structuredData`, poprawny JSON, NIP/URL/LinkedIn zgodne); `generatedFiles` dla `llms*.txt`
   (struktura, UTF-8, pokrycie stron z sitemapy).
5. `tools/smoke-test.cjs`: `llms*.txt` → 200 `text/plain`; jeden blok JSON-LD z Organization i LinkedIn.
6. `deploy/goaccess/revagy-logi-raport.sh`: boty AI jako osobne pozycje (kategoria Crawlers) + `boty-ai.txt`.
7. Rejestr: D-011, D-012, D-013; README.

Bez SSH, bez zmian na hostach. Wdrożenie skryptu GoAccess na VPS wymaga osobnej zgody.

## Wynik testów (Linux, Node v22.23.5, Astro 7.4.12)

- `build`: 12 stron, `llms.txt` i `llms-full.txt` dla 11 stron (404 pominięta przez `noindex`).
- `check:dist`: OK, 45 plików (31/31 assetów, 12/12 stron, 2 pliki generowane).
- Walidator, 7 prób negatywnych (inline JS, zły NIP, zepsuty JSON, brak strony w `llms.txt`, brak sekcji
  w `llms-full.txt`, brak pliku, dwa bloki JSON-LD): każda kończy się błędem z czytelnym komunikatem.
- `test:deploy`: 16/16.
- `revagy-logi-raport.sh`: `sh -n`/`dash -n` OK; przebieg na sztucznym logu z atrapą `goaccess`: poprawne
  zliczenie (GPTBot 3 żądania / 2 adresy, ClaudeBot 1/1, przeglądarka pominięta), plik tymczasowy usunięty.
- `test:smoke`: **nieuruchomiony lokalnie** (brak przeglądarki Playwright na hoście); uruchamia go CI przy PR.

## Poprawki po review PR #6 (2026-11-20)

| Uwaga | Poprawka |
|---|---|
| baza PR #6 | przestawiona na `main` przez reviewera; `MERGEABLE`/`CLEAN` |
| `sectionsMatchSitemap` bez sekcji nadmiarowych | dodane `sekcje stron spoza sitemapy` |
| `checkJsonLd`: logo/obraz, `WebSite`, REGON | lokalne `logo.url` i `image` muszą istnieć w `dist/`; `WebSite.url` = `Organization.url`; `publisher.@id` = `Organization.@id`; REGON z kontraktu (`structuredData.regon`) |
| atrybuty na bloku JSON-LD | dozwolony wyłącznie `type` (`defer`, `async` itd. → błąd) |
| `</main>` czułe na wielkość liter | ostatnie dopasowanie `/<\/main\s*>/gi` |
| adresy katalogowe (`/blog/`) | → `blog/index.html`; brak pliku lub katalog → czytelny błąd zamiast `EISDIR` |
| mały słownik encji | +34 encje (`euro`, `copy`, `sect`, `plusmn`, `le`, `ge`, `reg`, `trade`…) |
| smoke-test bez JSON-LD | jawne `n !== 1` przed `JSON.parse` |
| `boty-ai.txt` | wiersze bez poprawnej daty pomijane; kolumna `adresy` → `sciezki` (ścieżki URL, nie IP) |

Testy: `check:dist` OK, 45 plików, manifest bez zmian (`8c7ff4ee…`) — wynik dla obecnych stron identyczny;
6 nowych prób negatywnych walidatora (sekcja nadmiarowa, brak logo, brak obrazu, zły REGON, `publisher.@id`,
`defer`) → błąd; generator na przypadkach `</MAIN>`, `/blog/`, encjach; skrypt logów na wierszach bez daty
i pustym logu (`dash`). Smoke i formularz: CI.

## Ujednolicenie z LinkedIn (D-014, 2026-11-20)

- `src/config/marka.mjs`: opis = słowa właściciela z LinkedIn; `telefon`, `rokZalozenia` → JSON-LD
  (`telephone`, `foundingDate`, `contactPoint.telephone`) i nagłówek `llms*.txt`.
- Stopka: odnośnik `tel:+48504037538` w kolumnie „Kontakt” (11 stron); kontrakt DOM: wyłącznie +1 pozycja
  `anchors` na stronę (sprawdzone skryptem, który odrzuca każdą inną różnicę).
- `check:dist`: OK, 45 plików. Smoke: CI.
