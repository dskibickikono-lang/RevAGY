---
id: T-014
title: Etap 6 — poradniki (/porownanie-rozwiazan.html, /jak-wybrac-pierwszy-proces.html)
channel: pm-local
requested_by: owner
status: wdrozone
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-6-poradniki
base: feat/etap-5-produkcja-i-logistyka (09ab4b7)
depends_on: T-013
pr: https://github.com/dskibickikono-lang/RevAGY/pull/15 (scalony do main)
sha: 9e4a046ee320eb4e2dfbd2e283271e72638c1333 (zmiany); main po scaleniu PR #15: e9e3a03b8a0843aba65abb717a6ba397917a9ba2
decisions: [D-015, D-019, D-021, D-025, D-028, D-030, D-031, D-033, D-038]
---

# T-014 — Etap 6: poradniki

## Cel

Dwie strony z treściami decyzyjnymi:
- porównanie czterech dróg wobec przepisywania danych (kategorie rozwiązań, bez marek, D-033);
- poradnik wyboru pierwszego procesu.

Obie strony nie mają miejsca na film. Strona główna zostaje bez zmian (D-015, D-021).

## Zakres

1. `src/pages/porownanie-rozwiazan.astro` z polem właściciela w `src/data/poradniki.mjs` i
   `src/pages/jak-wybrac-pierwszy-proces.astro`. Odnośniki między stronami i odnośniki pod odpowiedziami
   do innych podstron.
2. Test dymny obsługuje `"film": null`: nie wymaga ramki `.film`, tylko sprawdza, że jej nie ma.
3. Dane wspólne: `tools/podstrony.json`, `tools/rejestr-twierdzen.json`, `public/sitemap.xml`.
4. Wejścia z wcześniejszych stron, jako odnośniki pod odpowiedziami:
   - `/dla-firm.html`, pytanie „Od czego zacząć?” → poradnik wyboru procesu;
   - `/integracja-systemow.html`, pytanie „Nasz system nie ma API. Co wtedy?” → porównanie.
5. Strona główna bez zmian:
   - `index.baza.html` to migawka etapu 5 i jest równa `index.html`;
   - plik etapu ma puste listy.
6. `tools/dom-contract.json` bez zmian. Kontrakt policzy PM w rundzie 2.

## Runda 1 — wynik CI (2026-11-22)

- Astro zbudowało 11 stron. Walidator zgłosił wyłącznie błędy zapowiedziane przy niezmienionym kontrakcie:
  dwa nadmiarowe pliki (obie nowe strony), inna suma `sitemap.xml`, niezgodność `dla-firm.html`
  i `integracja-systemow.html` z kontraktem (po jednym odnośniku pod odpowiedzią). Pozostałe cztery kroki
  kontroli przeszły; kontrola treści objęła siedem podstron.
- Strona główna bez zmian: migawka identyczna z bazą.

## Runda 2 (2026-11-22)

- Kontrakt policzony z builda CI (`tools/update-contract.cjs`). Zmienione wpisy: `dla-firm.html`,
  `integracja-systemow.html`, `sitemap.xml`; nowe: `porownanie-rozwiazan.html`
  i `jak-wybrac-pierwszy-proces.html`. Pozostałe strony i pliki bez zmian. Kadrów nie ma, bo strony nie mają filmu.
- Lokalnie `check-all` przechodzi we wszystkich 5 krokach: 51 plików, 11/11 stron, testy narzędzi 71/71.
- Przewidziany manifest wydania: `bedff5a20ba8fc0381cd34db0dc122c682c6620777e28b8dee4d07b6aecda776`.

## Wynik CI (2026-11-22)

Przebieg dla `9e4a046` (run 44968175872), zielony:

- `check:dist`: 5 z 5 kroków, 51 plików, 11/11 stron zgodnych z kontraktem i z zapisanym HTML.
  Manifest `bedff5a20ba8fc0381cd34db0dc122c682c6620777e28b8dee4d07b6aecda776`, ten sam co przewidziany.
- Strona główna bez zmian względem etapu 5.
- Test dymny: 187 z 188, 0 błędów, 1 pominięte (geometria strony głównej względem bazy, bo strona główna jest
  identyczna z bazą). Testy `wydanie.sh`: 16 z 16. Testy narzędzi: 71 z 71.
- Zrzuty 1280 i 390 px w artefakcie `podglad-<sha>`.

## Do uzupełnienia przez właściciela

- `src/data/poradniki.mjs`: `odpowiedzAutomatEkranowy`.

## Scalenie i wdrożenie (2026-11-22)

- PR #15 scalony do `main` commitem `e9e3a03b8a0843aba65abb717a6ba397917a9ba2`.
- Wdrożone na produkcję w wydaniu `5fe5c29571e12cd4221d2a146b7d53fba3037816` (czubek `main` po scaleniu PR #9–#21),
  manifest `678ac82d4519d76c66cabae8b3ace6df5b0a3c1dc8ae1f99fbeb70a31b615488`.
