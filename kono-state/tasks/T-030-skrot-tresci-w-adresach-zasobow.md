---
id: T-030
title: "Etap 3 po audycie kodu: skrót treści w adresach stylów, skryptów i filmów zamiast ręcznego ?v="
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/magical-mccarthy-unmqyo
base: main (scalony do gałęzi bez rebase)
depends_on: T-028 (audyt kodu)
pr: https://github.com/dskibickikono-lang/RevAGY/pull/40 (scalony do main, 7b6fc4c)
sha: 24f7c2acd67585e3934c50afe391ac06a8c688d1 (kod, migawka i kontrakt; kolejne commity zmieniają tylko karty)
decisions: [D-015, D-021, D-047]
---

# T-030 — skrót treści w adresach zasobów

Zgoda właściciela z 22.11.2026 (D-047), w tym na zmianę bajtów strony głównej bez zmiany wyglądu.
Znaleziska z audytu: S-05, D-05, K-03.

## Co się zmienia

- `src/config/zasoby.mjs`: `zasob('assets/js/app.js')` → `assets/js/app.js?v=<8 znaków SHA-256 pliku>`.
- Układy, `Clarity.astro`, `MiejsceNaFilm.astro` i filmy strony głównej biorą adresy z `zasob()`.
  Ręczne numery `?v=5`, `?v=3`, `?v=1` znikają; filmy i ich kadry startowe dostają parametr po raz pierwszy.
- `tools/validate-dist.cjs`: listy skryptów bez numerów wersji; każdy adres z `assets/css`, `assets/js`
  i `assets/video` musi mieć `?v=` równy skrótowi wskazanego pliku.
- `tools/podstrony.json`, `tools/update-contract.cjs`, `tools/dom-contract.json`: bez numerów wersji.
- `tools/smoke-test.cjs`: trzy sprawdzenia filmów porównują nazwę pliku bez parametru.
- `tools/tests/zasoby.test.cjs`: 3 testy.

## Wpływ na stronę

- HTML: zmieniają się wyłącznie adresy zasobów, na wszystkich 12 stronach. Strona główna: 14 atrybutów
  (1 arkusz stylów, 4 skrypty, 3 kadry, 6 źródeł filmów), wszystkie na liście `tools/etapy/zmiana-strony-glownej.json`.
- Wygląd, treść i układ: bez zmian (test dymny porównuje geometrię strony głównej z bazą).
- Pliki CSS, JS i filmy: bez zmian (54/54 zgodne bajtowo).
- Nie objęte: fonty (adresy są w `styles.css`), obrazy w `assets/img/`, kadry `*-kadr.jpg`.
- Czasów pamięci podręcznej w nginx nie zmieniałem.

## Wyniki testów (Linux, Node 22.23.5, konfiguracja jak w CI)

Uwaga: testy przeglądarkowe na Chromium build 1243 zamiast przypiętego 1255; pełny przebieg robi CI i KONO Boss.

| Polecenie | Kod | Wynik |
|---|---|---|
| `npm run build` | 0 | 12 stron |
| `npm run check:dist` | 0 | 6 z 6 kroków, 68 plików, manifest `9800354f…e480` |
| `npm run test:tools` | 0 | 114 z 114 |
| `npm run test:smoke -- --serve=dist` | 0 | 271 z 271 |
| `npm run test:form` | 0 | 14 grup |
| `npm run test:deploy` | 0 | 16 z 16 |
| `npm run test:lighthouse` | 0 | `finanse.html`: 96 / 96 / 100 (wydajność: przebiegi 100, 96, 96) |
