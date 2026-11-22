---
id: T-020
title: Etap filmowy F5 — film w miejscu na film strony /produkcja-i-logistyka.html
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-5-produkcja-i-logistyka
base: feat/film-4-dane-i-bezpieczenstwo (09a0f9b)
depends_on: T-013, T-015
pr: https://github.com/dskibickikono-lang/RevAGY/pull/21 (baza feat/film-4-dane-i-bezpieczenstwo)
sha: c5521aa908eecc50792cc6ce9807f9953eb3c7c3 (kod, pliki filmu i kontrakt; commit z tym wpisem zmienia tylko kartę)
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

## Rundy 1 i 2 (2026-11-22)

- `render-media.yml` wyrenderował film: mp4 293 068 B (limit 1 100 000), webm 350 175 B (limit 700 000),
  kadr startowy 137 073 B (limit 150 000); 14 s, 1600×900, 30 kl./s.
- Klatki z dwunastu chwil osi czasu obejrzane: przebieg zgodny z osią czasu sceny, kadr startowy ma kompozycję
  dotychczasowego kadru, pętla wraca do stanu początkowego.
- Trzy pliki filmu dodane, `produkcja-i-logistyka-kadr.jpg` usunięty. Kontrakt policzony z builda CI
  (`tools/update-contract.cjs`): zmienił się tylko wpis `produkcja-i-logistyka.html` (ramka filmu i dane strukturalne)
  oraz `publicFiles` (+3 pliki, −kadr).
- Lokalnie `check-all` przechodzi we wszystkich 6 krokach; `compare-film` potwierdza zgodność z etapem
  `film-produkcja-i-logistyka`. Manifest wydania: `678ac82d4519d76c66cabae8b3ace6df5b0a3c1dc8ae1f99fbeb70a31b615488`.
- Wynik przebiegu CI po tym commicie jest w opisie PR #21.
