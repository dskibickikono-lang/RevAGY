---
id: T-018
title: Etap filmowy F3 — film w miejscu na film strony /dla-firm.html
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-3-dla-firm
base: 839b560
depends_on: T-011, T-015
pr: —
sha: —
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
