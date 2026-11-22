---
id: T-015
title: Etap filmowy F1 — film w miejscu na film strony /integracja-systemow.html
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-1-integracja-systemow
base: feat/etap-6-poradniki (f1b5e43)
depends_on: T-009, T-014
pr: —
sha: —
decisions: [D-015, D-021, D-022, D-032, D-033, D-038]
---

# T-015 — Film F1: integracja systemów

## Cel

Film zastępuje kadr w miejscu na film strony `/integracja-systemow.html` (D-022). Film nie pokazuje liczb
z wdrożeń, tylko dane poglądowe ze sceny (D-038). Plik strony, układ i style zostają bez zmian. Strona główna
i pozostałe strony nie zmieniają się ani o bajt.

## Zakres

1. `tools/scenes/integracja-systemow.html`: oś czasu 14 s, kadr startowy w 11 s z kompozycją dotychczasowego
   kadru.
2. `src/config/filmy.mjs`: czas 14 s, data publikacji 2026-11-22.
3. `.github/workflows/render-media.yml`: w PR renderuje film dla sceny z ustawionym czasem, dla pozostałych
   scen kadr. Plan renderu liczy `tools/media-plan.cjs`.
4. Narzędzia:
   - `tools/compare-film.cjs` z plikiem `tools/etapy/film-integracja-systemow.json` (porównanie B kontraktu);
   - walidator sprawdza pliki wskazane w VideoObject;
   - test dymny sprawdza 206 dla źródeł filmu podstrony;
   - testy scen.
5. Runda 2 (PM):
   - trzy pliki z artefaktu `media-<sha>` do `public/assets/video/`;
   - usunięcie `integracja-systemow-kadr.jpg`;
   - kontrakt z builda w stanie „film” przez `tools/update-contract.cjs`.

## Do akceptacji właściciela

- Film na podglądzie: oś czasu, tempo, napis „wpisane raz”.
