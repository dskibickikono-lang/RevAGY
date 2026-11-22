---
id: T-023
title: Etap filmowy F6 — film w miejscu na film strony /finanse.html
channel: pm-local
requested_by: owner
status: wdrozone
created: 2026-11-22
updated: 2026-11-22
branch: feat/film-6-finanse
base: main (0e72e39)
depends_on: T-021, T-015
pr: https://github.com/dskibickikono-lang/RevAGY/pull/25 (film) i https://github.com/dskibickikono-lang/RevAGY/pull/26 (przycisk filmu), oba scalone do main
sha: 36e76482c00bef9d017ab94fefc43a828e6e0247 (film); d039208f77b65119974ab7d8c0dad5a5a077def6 (przycisk filmu); main po scaleniu PR #25: 10024639163841f2411cb0a5f0c743d679c6bbce, po scaleniu PR #26: 43efbf5f8a246d33a9c4f68f3552616c2665fc7a
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
tylko stronę z filmem.

Szczegóły (PR #26, gałąź `fix/przycisk-filmu-aria-pressed`, baza `feat/film-6-finanse`):

- Przycisk pauzy przy filmie ma same ikony. Ma stałą nazwę dostępną „Wstrzymaj film”, a stan (wstrzymany albo
  odtwarzany) przekazuje tylko `aria-pressed`: `true` po wstrzymaniu, `false` przy odtwarzaniu. Do tej pory
  `app.js` zmieniał też `aria-label` na „Odtwórz film”, więc czytnik ekranu dostawał naraz inną nazwę i stan
  wciśnięcia. Ta linia zniknęła (wniosek z review).
- `app.js` jest wspólny, więc zmiana obejmuje film strony głównej (`#film`) i filmy wszystkich podstron.
  Znaczniki przycisku w `MiejsceNaFilm.astro` i `index.astro` już miały `aria-label="Wstrzymaj film"`
  i `aria-pressed="false"`, więc zostają bez zmian.
- Wygląd się nie zmienia: ikony przełącza CSS po `aria-pressed`.
- Wersja skryptu to `app.js?v=5` na dziewięciu stronach, które go ładują (strona główna i osiem podstron).
  `kontakt.html`, `polityka-prywatnosci.html` i `404.html` go nie ładują.
- Test dymny sprawdza na stronie głównej i na podstronach w stanie „film”, że po wstrzymaniu i po wznowieniu nazwa
  zostaje „Wstrzymaj film”, a `aria-pressed` ma wartość `true`, a potem `false`.
- Różnica migawki strony głównej: baza `tools/baseline/index.baza.html` to `tools/baseline/index.html` z `main`.
  Migawka różni się od niej jedną wartością atrybutu: `script`, `src`, `assets/js/app.js?v=4` →
  `assets/js/app.js?v=5`. Teksty, znaczniki, kolejność i geometria bez zmian. Plik etapu
  `tools/etapy/zmiana-strony-glownej.json` ma jeden wpis `atrybuty`.
- Kontrakt policzony z builda CI: zmienia się suma `app.js` i wpisy dziewięciu stron. Lokalnie `check-all`
  przechodzi we wszystkich 6 krokach, zbudowany `index.html` jest równy migawce. Przewidziany manifest wydania
  po obu PR-ach etapu: `f1754f7d53b323fccf58058de6541a0aeb1e89955602658c23b407c4d6dcf097`.
- Wynik przebiegu CI jest w opisie PR #26.

## Rundy 1 i 2 (2026-11-22)

- `render-media.yml` wyrenderował film: mp4 278 176 B (limit 1 100 000), webm 350 513 B (limit 700 000),
  kadr startowy 120 938 B (limit 150 000); 14 s, 1600×900, 30 kl./s.
- Klatki z dwunastu chwil osi czasu obejrzane: przebieg zgodny z osią czasu sceny, kadr startowy ma kompozycję
  dotychczasowego kadru, pętla wraca do stanu początkowego, napisy nie wychodzą poza kafle.
- Trzy pliki filmu dodane, `finanse-kadr.jpg` usunięty. Kontrakt policzony z builda CI
  (`tools/update-contract.cjs`): zmienił się tylko wpis `finanse.html` (ramka filmu i dane strukturalne)
  oraz `publicFiles` (+3 pliki, −kadr).
- Lokalnie `check-all` przechodzi we wszystkich 6 krokach; `compare-film` potwierdza zgodność z etapem
  `film-finanse`. Przewidziany manifest wydania: `4f526a78a53b253987b59cf38ddbef85a98a42b4cb51237eeada94baf600ab00`.

## Wynik CI (2026-11-22)

Przebieg dla `36e7648` (run 45031575044), zielony:

- `check:dist`: 6 z 6 kroków, 68 plików, 12/12 stron zgodnych z kontraktem i z zapisanym HTML.
  Manifest `4f526a78a53b253987b59cf38ddbef85a98a42b4cb51237eeada94baf600ab00`, ten sam co przewidziany.
- Porównanie kontraktu z `main`: zmienia się tylko `finanse.html`, a w niej ramka filmu i dane strukturalne.
  Strona główna i pozostałe strony bez zmian.
- Test dymny: 261 z 262, 0 błędów, 1 pominięte (geometria strony głównej względem bazy, bo strona główna jest
  identyczna z bazą). `finanse.html` w stanie „film”: wybrane źródło i odtwarzanie w kadrze, przycisk pauzy
  i wznowienia, odpowiedź 206 na zakres bajtów.
- Testy `wydanie.sh`: 16 z 16. Testy narzędzi: 108 z 108.

## Lighthouse (2026-11-22)

Przebieg dla `36e7648` (run 45031575075), strona już z filmem, Lighthouse 13.6.0, telefon, mediana z 3 przebiegów:
wydajność 96 (próg 90), dostępność 96 (próg 95), SEO 100 (próg 100). To pomiar builda z CI, nie produkcji.

## Scalenie i wdrożenie (2026-11-22)

- PR #25 (film) scalony do `main` commitem `10024639163841f2411cb0a5f0c743d679c6bbce`. CI na `main`: zielone,
  test dymny 263 z 263, manifest `4f526a78a53b253987b59cf38ddbef85a98a42b4cb51237eeada94baf600ab00`.
- PR #26 (przycisk filmu) po zmianie bazy na `main` scalony commitem `43efbf5f8a246d33a9c4f68f3552616c2665fc7a`.
  CI na `main` (run 45036265009): `check:dist` 6 z 6, test dymny 270 z 270, testy `wydanie.sh` 16 z 16,
  manifest `f1754f7d53b323fccf58058de6541a0aeb1e89955602658c23b407c4d6dcf097`, ten sam co przewidziany.
- Wdrożone na produkcję w wydaniu `43efbf5f8a246d33a9c4f68f3552616c2665fc7a`, manifest jak wyżej. Po wydaniu wszystkie
  18 plików filmów (w tym `finanse.mp4` i `finanse.webm`) odpowiada 206 na zakres bajtów, a `app.js` na produkcji
  jest bajtowo równy plikowi z CI.
