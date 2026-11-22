---
id: T-019
title: Etap filmowy F4 — film w miejscu na film strony /dane-i-bezpieczenstwo.html
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-4-dane-i-bezpieczenstwo
base: feat/film-3-dla-firm (a75fe9e)
depends_on: T-012, T-015
pr: https://github.com/dskibickikono-lang/RevAGY/pull/20 (baza feat/film-3-dla-firm)
sha: cee4d9bc34b3584147ae7a6a49e9061cee433e61 (kod, pliki filmu i kontrakt; commit z tym wpisem zmienia tylko kartę)
decisions: [D-015, D-021, D-022, D-032, D-033, D-038]
---

# T-019 — Film F4: dane i bezpieczeństwo

## Cel

Film zastępuje kadr w miejscu na film strony `/dane-i-bezpieczenstwo.html` (D-022). Pokazuje, którędy idą dane
i kto ma do nich dostęp: integracja z minimalnym zakresem, wyjątek u człowieka, dziennik zapisów. Miejsce
przetwarzania to wyłącznie napis „wskazane w umowie powierzenia”, bez nazw dostawców, krajów i regionów.
Film nie pokazuje liczb z wdrożeń, tylko dane poglądowe ze sceny (D-038). Plik strony, układ i style zostają bez
zmian. Strona główna i pozostałe strony nie zmieniają się ani o bajt.

## Zakres

1. `tools/scenes/dane-i-bezpieczenstwo.html`: oś czasu 12 s, kadr startowy w 10,5 s z kompozycją dotychczasowego
   kadru. Tło nieruchome. Plakietka, oba panele, integracja i dziennik widoczne przez cały czas; pola uzgodnione
   przechodzą po kolei, pola „poza zakresem” nie przechodzą; kwota powyżej progu czeka na decyzję osoby, potem
   „zatwierdzone”; na końcu wpis w dzienniku.
2. `src/config/filmy.mjs`: czas 12 s, data publikacji 2026-11-22.
3. `tools/etapy/film-dane-i-bezpieczenstwo.json`: porównanie B kontraktu dla tego filmu.
4. Runda 2 (PM):
   - trzy pliki z artefaktu `media-<sha>` do `public/assets/video/`;
   - usunięcie `dane-i-bezpieczenstwo-kadr.jpg`;
   - kontrakt z builda w stanie „film” przez `tools/update-contract.cjs`.

## Do akceptacji właściciela

- Film na podglądzie: oś czasu, tempo, napis „czeka na decyzję” przy kwocie i w kaflu decyzji.

## Rundy 1 i 2 (2026-11-22)

- `render-media.yml` wyrenderował film: mp4 269 654 B (limit 1 100 000), webm 279 632 B (limit 700 000),
  kadr startowy 123 745 B (limit 150 000); 12 s, 1600×900, 30 kl./s.
- Klatki z dwunastu chwil osi czasu obejrzane: przebieg zgodny z osią czasu sceny, kadr startowy ma kompozycję
  dotychczasowego kadru, pętla wraca do stanu początkowego.
- Trzy pliki filmu dodane, `dane-i-bezpieczenstwo-kadr.jpg` usunięty. Kontrakt policzony z builda CI
  (`tools/update-contract.cjs`): zmienił się tylko wpis `dane-i-bezpieczenstwo.html` (ramka filmu i dane strukturalne)
  oraz `publicFiles` (+3 pliki, −kadr).
- Lokalnie `check-all` przechodzi we wszystkich 6 krokach; `compare-film` potwierdza zgodność z etapem
  `film-dane-i-bezpieczenstwo`. Manifest wydania: `6f523c3bc2ff14257e689551d8520fac39436ec8cefbcb5ba583eca10ab5ca69`.
- Wynik przebiegu CI po tym commicie jest w opisie PR #20.
