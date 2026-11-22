---
id: T-019
title: Etap filmowy F4 — film w miejscu na film strony /dane-i-bezpieczenstwo.html
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-4-dane-i-bezpieczenstwo
base: feat/film-1-integracja-systemow (839b560)
depends_on: T-012, T-015
pr: —
sha: —
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
