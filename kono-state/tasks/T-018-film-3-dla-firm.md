---
id: T-018
title: Etap filmowy F3 — film w miejscu na film strony /dla-firm.html
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-3-dla-firm
base: feat/film-2-wdrozenia (eeab98d)
depends_on: T-011, T-015
pr: https://github.com/dskibickikono-lang/RevAGY/pull/19 (baza feat/film-2-wdrozenia)
sha: 16e8633693c2455415fb3b151525238de6e8a299 (kod, pliki filmu i kontrakt; commit z tym wpisem zmienia tylko kartę)
decisions: [D-015, D-019, D-021, D-022, D-032, D-033, D-038]
---

# T-018 — Film F3: dla firm

## Cel

Film zastępuje kadr w miejscu na film strony `/dla-firm.html` (D-022). Pokazuje, co klient dostaje na każdym
z czterech szczebli współpracy (D-019): konsultacja i karta procesu, audyt i raport, wdrożenie i działający
przepływ, opieka i raport okresowy. Bez kwot. Film nie pokazuje liczb z wdrożeń, tylko dane poglądowe ze sceny
(D-038). Plik strony, układ i style zostają bez zmian. Strona główna i pozostałe strony nie zmieniają się
ani o bajt.

## Zakres

1. `tools/scenes/dla-firm.html`: oś czasu 12 s, cztery ujęcia po 2,4 s, kadr startowy w 10,5 s z kompozycją
   dotychczasowego kadru. Tło nieruchome, znaczniki kroków i panele widoczne cały czas, treść paneli ma
   zarezerwowane miejsce.
2. `src/config/filmy.mjs`: czas 12 s, data publikacji 2026-11-22.
3. `tools/etapy/film-dla-firm.json`: plik etapu dla porównania B kontraktu (`tools/compare-film.cjs`).
4. Runda 2 (PM):
   - trzy pliki z artefaktu `media-<sha>` do `public/assets/video/`;
   - usunięcie `dla-firm-kadr.jpg`;
   - kontrakt z builda w stanie „film” przez `tools/update-contract.cjs`.

## Do akceptacji właściciela

- Film na podglądzie: oś czasu, tempo ujęć, obwódka panelu w trakcie wypełniania.

## Rundy 1 i 2 (2026-11-22)

- `render-media.yml` wyrenderował film: mp4 306 200 B (limit 1 100 000), webm 347 638 B (limit 700 000),
  kadr startowy 112 424 B (limit 150 000); 12 s, 1600×900, 30 kl./s.
- Klatki z dwunastu chwil osi czasu obejrzane: przebieg zgodny z osią czasu sceny, kadr startowy ma kompozycję
  dotychczasowego kadru, pętla wraca do stanu początkowego.
- Trzy pliki filmu dodane, `dla-firm-kadr.jpg` usunięty. Kontrakt policzony z builda CI
  (`tools/update-contract.cjs`): zmienił się tylko wpis `dla-firm.html` (ramka filmu i dane strukturalne)
  oraz `publicFiles` (+3 pliki, −kadr).
- Lokalnie `check-all` przechodzi we wszystkich 6 krokach; `compare-film` potwierdza zgodność z etapem
  `film-dla-firm`. Manifest wydania: `321f295f48213769316dd31d4d3e293c7668c37c0153b4f1884a34694f181cdd`.
- Wynik przebiegu CI po tym commicie jest w opisie PR #19.
