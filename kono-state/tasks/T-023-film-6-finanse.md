---
id: T-023
title: Etap filmowy F6 — film w miejscu na film strony /finanse.html
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-6-finanse
base: main (0e72e39)
depends_on: T-021, T-015
decisions: [D-015, D-021, D-022, D-032, D-033, D-038]
---

# T-023 — Film F6: finanse

## Cel

Film zastępuje kadr w miejscu na film strony `/finanse.html` (D-022). Pokazuje fakturę kosztową od odbioru
do akceptacji, tak jak tekst obok filmu: faktura trafia do jednej kolejki, pięć pól jest odczytanych
i sprawdzonych, propozycja opisu i dekretacji czeka na akceptację osoby z działu finansów, a po akceptacji
faktura trafia do programu księgowego. Tylko dane poglądowe, które scena już miała: bez nowych liczb, bez nazw
systemów poza „KSeF” (wyjątek z T-021) i bez firm i osób (D-033, D-038). Plik strony, układ i style zostają bez
zmian. Strona główna i pozostałe strony nie zmieniają się ani o bajt.

## Zakres

1. `tools/scenes/finanse.html`: oś czasu 14 s, kadr startowy w 12 s z kompozycją dotychczasowego kadru.
   Panele, źródła „Poczta” i „KSeF”, nazwy pól i oś kroków widoczne przez cały czas. Karta faktury pojawia się
   w kolejce (krok „Odbiór”), pięć pól wypełnia się po kolei z plakietką kontroli (kroki „Odczyt” i „Kontrola”),
   potem propozycja opisu i dekretacji, „Czeka na: osoba z działu finansów” i przyciski (krok „Akceptacja”).
   Po kadrze startowym przycisk „Akceptuję” zostaje zaznaczony, znacznik przechodzi na „Program księgowy”,
   a scena płynnie wraca do stanu z 0 s. Elementy pojawiają się w zarezerwowanych miejscach, tło nieruchome.
2. `src/config/filmy.mjs`: czas 14 s, data publikacji 2026-11-22.
3. `tools/etapy/film-finanse.json`: porównanie B kontraktu dla tego filmu.
4. Runda 2 (PM):
   - trzy pliki z artefaktu `media-<sha>` do `public/assets/video/`;
   - usunięcie `finanse-kadr.jpg`;
   - kontrakt z builda w stanie „film” przez `tools/update-contract.cjs`.

## Do akceptacji właściciela

- Film na podglądzie: tempo wypełniania pięciu pól i pojawiania się plakietek kontroli, chwila, w której
  znacznik przechodzi z „Odczyt” na „Kontrola”, zaznaczenie przycisku „Akceptuję” i przejście znacznika
  na „Program księgowy” tuż przed powrotem pętli.

## Przycisk filmu

Decyzją właściciela z 22.11.2026 w tym samym etapie przycisk filmu zmienia tylko `aria-pressed`, a jego nazwa
dostępna jest stała. Zmiana dotyczy `public/assets/js/app.js`, wspólnego ze stroną główną, i idzie osobnym PR
ustawionym na tym PR, bo kontrola etapu filmowego (`tools/compare-film.cjs`) pozwala w PR z filmem zmienić
tylko stronę z filmem. Szczegóły dopisze PM.
