---
id: T-017
title: Etap filmowy F2 — film w miejscu na film strony /wdrozenia.html
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-2-wdrozenia
base: feat/film-1-integracja-systemow (0cdb4b8)
depends_on: T-010, T-015
pr: https://github.com/dskibickikono-lang/RevAGY/pull/18 (baza feat/film-1-integracja-systemow)
sha: 6d516700d8a665d7f6e89e48b329bc1402874fa3 (kod, pliki filmu i kontrakt; commit z tym wpisem zmienia tylko kartę)
decisions: [D-015, D-021, D-022, D-032, D-033, D-038]
---

# T-017 — Film F2: wdrożenia

## Cel

Film zastępuje kadr w miejscu na film strony `/wdrozenia.html` (D-022). Film pokazuje cztery procesy przed
i po połączeniu systemów. Nie pokazuje liczb z wdrożeń, tylko dane poglądowe ze sceny i parametr procesu
„30 dni” (D-038). Plik strony, układ i style zostają bez zmian. Strona główna i pozostałe strony nie
zmieniają się ani o bajt.

## Zakres

1. `tools/scenes/wdrozenia.html`: oś czasu 14 s, cztery ujęcia po ok. 3,2 s. Cztery kafle stoją przez cały
   czas, w każdym ujęciu ożywa jeden (umowa, raport, zezwolenie, kandydat). Kadr startowy w 13 s
   z kompozycją dotychczasowego kadru, potem wygaszenie do stanu z 0 s. Tło nieruchome.
2. `src/config/filmy.mjs`: czas 14 s, data publikacji 2026-11-22.
3. `tools/etapy/film-wdrozenia.json`: plik etapu dla `tools/compare-film.cjs` (porównanie B kontraktu).
4. Runda 2 (PM):
   - trzy pliki z artefaktu `media-<sha>` do `public/assets/video/`;
   - usunięcie `wdrozenia-kadr.jpg`;
   - kontrakt z builda w stanie „film” przez `tools/update-contract.cjs`.

## Do akceptacji właściciela

- Film na podglądzie: oś czasu, tempo, podświetlenie aktywnego kafla.

## Rundy 1 i 2 (2026-11-22)

- `render-media.yml` wyrenderował film: mp4 258 286 B (limit 1 100 000), webm 287 526 B (limit 700 000),
  kadr startowy 100 217 B (limit 150 000); 14 s, 1600×900, 30 kl./s.
- Klatki z dwunastu chwil osi czasu obejrzane: przebieg zgodny z osią czasu sceny, kadr startowy ma kompozycję
  dotychczasowego kadru, pętla wraca do stanu początkowego.
- Trzy pliki filmu dodane, `wdrozenia-kadr.jpg` usunięty. Kontrakt policzony z builda CI
  (`tools/update-contract.cjs`): zmienił się tylko wpis `wdrozenia.html` (ramka filmu i dane strukturalne)
  oraz `publicFiles` (+3 pliki, −kadr).
- Lokalnie `check-all` przechodzi we wszystkich 6 krokach; `compare-film` potwierdza zgodność z etapem
  `film-wdrozenia`. Manifest wydania: `168aeea8398eaec98407d44760bbbfea40f8e407353a68767922f8acc00826c9`.
- Wynik przebiegu CI po tym commicie jest w opisie PR #18.
