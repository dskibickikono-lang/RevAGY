---
id: T-014
title: Etap 6 — poradniki (/porownanie-rozwiazan.html, /jak-wybrac-pierwszy-proces.html)
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-6-poradniki
base: feat/etap-5-produkcja-i-logistyka (09ab4b7)
depends_on: T-013
pr: —
sha: —
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

## Do uzupełnienia przez właściciela

- `src/data/poradniki.mjs`: `odpowiedzAutomatEkranowy`.
