---
id: T-015
title: Etap filmowy F1 — film w miejscu na film strony /integracja-systemow.html
channel: pm-local
requested_by: owner
status: wdrozone
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-1-integracja-systemow
base: feat/etap-6-poradniki (fd7a45f)
depends_on: T-009, T-014
pr: https://github.com/dskibickikono-lang/RevAGY/pull/17 (scalony do main)
sha: 2707110470100bb4d38bb45c7d73717c41d90d02 (zmiany); main po scaleniu PR #17: e2743c2c4ea8b038e63088fa4bb70c71c117b158
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
   - `tools/compare-film.cjs` z plikiem `tools/etapy/film-integracja-systemow.json` (porównanie B kontraktu).
     Reguła działa tylko w zmianie, która wprowadza film, czyli dodaje do kontraktu trzy pliki filmu nieobecne
     w bazie. Wtedy różnica musi w całości odpowiadać temu etapowi. Inne zmiany kontraktu tej reguły nie
     dotyczą. Dwa filmy w jednym PR albo niekompletny zestaw plików to błąd;
   - walidator sprawdza pliki wskazane w VideoObject;
   - test dymny sprawdza 206 dla źródeł filmu podstrony;
   - testy scen.
5. Runda 2 (PM):
   - trzy pliki z artefaktu `media-<sha>` do `public/assets/video/`;
   - usunięcie `integracja-systemow-kadr.jpg`;
   - kontrakt z builda w stanie „film” przez `tools/update-contract.cjs`.

## Do akceptacji właściciela

- Film na podglądzie: oś czasu, tempo, napis „wpisane raz”.

## Runda 1 — wynik CI (2026-11-22)

- `ci.yml` zielony: strona została w stanie „kadr”, manifest taki sam jak w etapie 6.
- `render-media.yml` wyrenderował film: mp4 242 649 B (limit 1 100 000), webm 291 247 B (limit 700 000),
  kadr startowy 108 983 B (limit 150 000); 14 s, 1600×900, 30 kl./s.
- Klatki z dziesięciu chwil osi czasu obejrzane: przebieg zgodny ze scenariuszem, kadr startowy w 11 s ma
  kompozycję dotychczasowego kadru, pętla wraca do stanu początkowego.

## Runda 2 (2026-11-22)

- Trzy pliki filmu dodane, `integracja-systemow-kadr.jpg` usunięty. Przebieg z samymi plikami był czerwony
  zgodnie z zapowiedzią (brak kadru w kontrakcie, trzy nadmiarowe pliki, strona w stanie „film” poza kontraktem).
- Kontrakt policzony z builda CI (`tools/update-contract.cjs`). Zmienił się tylko wpis `integracja-systemow.html`
  (pola `videos`, `keyedElements`, `localRefs`, `jsonLd` i suma strony) oraz `publicFiles` (+3 pliki, −kadr).
- Lokalnie `check-all` przechodzi we wszystkich 6 krokach; `compare-film` potwierdza, że zmiana odpowiada
  etapowi `film-integracja-systemow`.
- Przewidziany manifest wydania: `92557c90e16cb06a64d13a4f73fce3edfe965eb0c92ca1a30c4cd48de4a02e04`.

## Wynik CI (2026-11-22)

Przebieg dla `2707110` (run 44969533601), zielony:

- `check:dist`: 6 z 6 kroków, 53 pliki, 11/11 stron. Manifest
  `92557c90e16cb06a64d13a4f73fce3edfe965eb0c92ca1a30c4cd48de4a02e04`, ten sam co przewidziany.
- `compare-film`: zmiana kontraktu odpowiada etapowi `film-integracja-systemow` (tylko ta strona, ramka filmu
  i dane strukturalne).
- Test dymny: 189 z 190, 0 błędów, 1 pominięte (geometria strony głównej, która jest identyczna z bazą).
  Stan „film”: wybrane źródło i odtwarzanie w kadrze, przycisk pauzy i wznowienia, odpowiedź 206 na zakres bajtów.
- Testy `wydanie.sh`: 16 z 16. Testy narzędzi: 82 z 82.

## Scalenie i wdrożenie (2026-11-22)

- PR #17 scalony do `main` commitem `e2743c2c4ea8b038e63088fa4bb70c71c117b158`.
- Wdrożone na produkcję w wydaniu `5fe5c29571e12cd4221d2a146b7d53fba3037816` (czubek `main` po scaleniu PR #9–#21),
  manifest `678ac82d4519d76c66cabae8b3ace6df5b0a3c1dc8ae1f99fbeb70a31b615488`.
