---
id: T-020
title: Etap filmowy F5 — film w miejscu na film strony /produkcja-i-logistyka.html
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-5-produkcja-i-logistyka
base: feat/film-4-dane-i-bezpieczenstwo (09a0f9b)
depends_on: T-013, T-015
pr: —
sha: —
decisions: [D-015, D-021, D-022, D-030, D-032, D-033, D-038]
---

# T-020 — Film F5: produkcja i logistyka

## Cel

Film zastępuje kadr w miejscu na film strony `/produkcja-i-logistyka.html` (D-022). Pokazuje 14 dni pilota
na jednej linii albo jednej zmianie: dzień 1 dostęp do systemów, dzień 3 pierwsze dane z hali w raporcie,
dzień 10 raport zmianowy bez przepisywania, dzień 14 kryterium sukcesu i decyzja. Bez nazwy zakładu i bez
liczb z pilotażu: kryterium to paski bez wartości (D-030, D-038). Plik strony, układ i style zostają bez
zmian. Strona główna i pozostałe strony nie zmieniają się ani o bajt.

## Zakres

1. `tools/scenes/produkcja-i-logistyka.html`: oś czasu 14 s, kadr startowy w 12,5 s z kompozycją
   dotychczasowego kadru. Panele i oś dni widoczne przez cały czas, znacznik przechodzi od dnia 1 do dnia 14,
   elementy pojawiają się w swoich zarezerwowanych miejscach, tło nieruchome.
2. `src/config/filmy.mjs`: czas 14 s, data publikacji 2026-11-22.
3. `tools/etapy/film-produkcja-i-logistyka.json`: porównanie B kontraktu dla tego filmu.
4. Runda 2 (PM):
   - trzy pliki z artefaktu `media-<sha>` do `public/assets/video/`;
   - usunięcie `produkcja-i-logistyka-kadr.jpg`;
   - kontrakt z builda w stanie „film” przez `tools/update-contract.cjs`.

## Do akceptacji właściciela

- Film na podglądzie: tempo osi dni, kolejność wierszy raportu, puls plakietki „bez przepisywania” w dniu 10.
