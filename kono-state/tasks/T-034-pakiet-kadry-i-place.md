---
id: T-034
former_id: T-028
title: Pakiet K02 — kadry i płace bez ręcznego wpisywania (opis pakietu i podstrona /kadry-i-place.html)
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-22
updated: 2026-11-23
branch: skibiai/serene-bohr-2hdmui
base: main (da8d1ae); odświeżona merge z main a653e8a (PR #38 i #40)
depends_on: T-035 (wcześniej T-024)
pr: https://github.com/dskibickikono-lang/RevAGY/pull/39 (scalony do main, ca9b92b)
sha: 763ae644c4c7aa67f6ecee462aa07d9c2d47198a (runda 2: kadr i kontrakt; runda 1: 3c6c43d); kolejne commity zmieniają tylko kartę
decisions: [D-015, D-017, D-019, D-021, D-022, D-025, D-028, D-031, D-032, D-033, D-034, D-041, D-043, D-044, D-045, D-049]
---

# T-034 — Pakiet K02: kadry i płace

Wcześniej T-028, przenumerowana 22.11.2026 z powodu kolizji z T-028 (audyt kodu, PR #40). Decyzja o odnośniku w menu
i stopce to D-049: wcześniej D-046, przenumerowana 22.11.2026 z powodu kolizji z D-046 (przycisk wstrzymania filmu
w hero, PR #40). W PR #39 i w commitach sprzed odświeżenia karta występuje jako T-028, a decyzja jako D-046.

## Cel

Pierwszy pakiet do portfolio wybrany przez właściciela (D-045): godziny, premie i dane umów trafiają do programu
kadrowo-płacowego bez ręcznego wpisywania. Właściciel zaakceptował 22.11.2026 kroki 1–2 planu z karty T-035 (wcześniej T-024)
(„akceptuję kroki 1–2, cena po audycie, stała”).

## Zakres

1. Opis pakietu: `kono-state/notes/pakiet-kadry-i-place.md` (zakres stały, granice, kryterium sukcesu, dostępy, opieka).
2. Nowa podstrona `/kadry-i-place.html` na układzie `PodstronaLayout` (D-031), z miejscem na film w stanie „kadr”
   (D-022), bez nazw własnych systemów (D-033), cena „po audycie, stała” (D-041).

## Granice

- Runda 1 i 2: strona główna i pozostałe podstrony bez zmian (D-015, D-021). Runda 3, po decyzji właściciela (D-049):
  odnośnik „Kadry i płace” w menu „Dla działów” i w stopce na wszystkich stronach, w tym na stronie głównej.
- Bez kwot pakietu i opieki: właściciel wybrał „cena po audycie, stała”.
- Bez nowych liczb o REVAGY. Opis wdrożenia powtarza treść i liczby ze strony `/wdrozenia.html` (D-034).
- Kroki 3–5 planu (dane do opisu wdrożenia, przesunięcie tematów treści, test popytu) nie są objęte tą kartą.

## Ustalenia agenta, na które właściciel nie odpowiedział wprost

- Adres i tytuł strony ustalił agent, jak w D-038: `/kadry-i-place.html`, „Kadry i płace bez ręcznego wpisywania”.
- Strona mówi „50–250 osób”, bo jest nową treścią sprzedażową (D-044). Strona `dla-firm` zostaje przy „5–250 osób”.

## Runda 1 (2026-11-22)

- Strona `src/pages/kadry-i-place.astro`, scena `tools/scenes/kadry-i-place.html`, wpis w `src/config/filmy.mjs` (stan „kadr”).
- Rejestry: `tools/podstrony.json`, `public/sitemap.xml`, `tools/lighthouse.json`, `tools/rejestr-twierdzen.json`
  (nowe wiersze `kp-segment-firmy` i `kp-mniejsze-firmy`; strona dopisana do trzech wierszy wyniku wdrożenia umów).
- CI rundy 1: „Build, testy i artefakt wydania” czerwone zgodnie z oczekiwaniem (brak kadru i kontraktu).

## Runda 2 (2026-11-22)

- Kadr `public/assets/video/kadry-i-place-kadr.jpg` z artefaktu `media-3c6c43d…` workflow „Render mediów”
  (przebieg 45044665246, D-032). Suma pliku zgodna z `SHA256SUMS` artefaktu, suma archiwum zgodna z podaną przez GitHub.
- `tools/dom-contract.json` przeliczony `tools/update-contract.cjs` z lokalnego builda (Node 22, z publicznym kluczem
  formularza jak w CI). Zmiany: nowa strona i kadr dopisane, zmieniona suma `sitemap.xml`. Pozostałe strony bez zmian.

## Testy (lokalnie, Linux, Node 22; pełny przebieg należy do CI)

- `npm run build`: 13 stron.
- `npm run check:dist`: 6 z 6 kroków OK (validate-dist, compare-home, check-podstrony-css, check-tresc, compare-film,
  testy narzędzi 108/108).
- Podgląd strony w przeglądarce w 1280 i 390 px: bez przewijania w poziomie, bez błędów konsoli, kadr ładuje się.
- Nie uruchamiano lokalnie: test dymny i Lighthouse (wymagają przeglądarki w wersji z projektu). Uruchamia je CI.

## Wynik CI rundy 2 (2026-11-22, commit 763ae644c4c7aa67f6ecee462aa07d9c2d47198a)

- CI „Build, testy i artefakt wydania”: sukces (przebieg 45044813802).
- Lighthouse podstron: sukces (przebieg 45044813860), progi dla `finanse.html` i `kadry-i-place.html`.
- Render mediów: sukces (przebieg 45044813884).
- Kolejne commity tej gałęzi zmieniają tylko kartę.

## Runda 3 (2026-11-22): odnośnik w menu i stopce (D-049, „Tak dodać”)

- `src/layouts/BaseLayout.astro` i `src/layouts/PodstronaLayout.astro`: pozycja „Kadry i płace” w panelu „Dla działów”
  (po „Finanse”) i odnośnik w kolumnie stopki „Dla działów” (po „Finanse”). Menu mobilne bez zmian.
- Strona główna: `tools/baseline/index.html` to nowa migawka; `tools/etapy/zmiana-strony-glownej.json` (etap „T-034”)
  wymienia dwa dodane odnośniki i zgłasza stopkę jako sekcję, która może urosnąć o jeden wiersz.
  Poprawka po CI (commit afe9fb8 czerwony na `compare-home`): CI porównuje migawkę z migawką na `main`, a lista
  zawierała jeszcze wpis z T-024, który na `main` jest już uwzględniony. Baza `tools/baseline/index.baza.html` to teraz
  migawka z `main` (da8d1ae), a lista ma tylko dwa dodane odnośniki. Błąd odtworzony lokalnie z `REVAGY_BAZA_REF=origin/main`
  i po poprawce ta sama kontrola przechodzi.
- `tools/dom-contract.json` przeliczony: zmieniają się wszystkie strony HTML (menu i stopka są wspólne).
- Lokalnie: build 13 stron, `npm run check:dist` 6 z 6 OK. Podgląd strony głównej: panel menu z pięcioma pozycjami,
  stopka z piątym odnośnikiem, w 390 px bez przewijania w poziomie. Test dymny (geometria) i Lighthouse uruchamia CI.

## Odświeżenie po PR #40 i #38 (2026-11-22)

- `git merge origin/main` (a653e8a) bez rebase i bez wymuszonego pushu. Konflikty: rejestr decyzji, `tools/dom-contract.json`,
  `tools/etapy/zmiana-strony-glownej.json`, `tools/lighthouse.json`, `tools/podstrony.json`.
- Numery: karta T-028 → T-034, decyzja D-046 → D-049 (kolizje z audytem kodu T-028 i decyzją D-046 z PR #40).
  Odwołania main do audytu kodu (T-028) i do D-046 (przycisk wstrzymania filmu) bez zmian.
- Ręczne `?v=` z tej gałęzi usunięte: lista skryptów `kadry-i-place.html` w `tools/podstrony.json` bez wersji, jak na main
  (wersję daje skrót treści, T-030). Strona nie ma własnych adresów stylów, skryptów ani filmów; obraz w stanie „kadr”
  (`kadry-i-place-kadr.jpg`) idzie przez `MiejsceNaFilm` z main, a walidator z main celowo nie wymaga dla `-kadr.jpg` parametru `?v=`.
- `tools/lighthouse.json`: wpis `kadry-i-place.html` dopisany po czterech stronach z main, w formacie z main.
- Baza `tools/baseline/index.baza.html` = migawka z main a653e8a; `tools/baseline/index.html` i `tools/dom-contract.json`
  odtworzone `node tools/update-contract.cjs dist --snapshot`. Lista zmian strony głównej: tylko dwa odnośniki „Kadry i płace”.
- Lokalnie (Node 22, klucz formularza jak w CI): build 13 stron; `npm run check:dist` 6 z 6 OK; `compare-home`
  z `REVAGY_BAZA_REF=origin/main` OK (2 zmiany, obie na liście); `npm run test:tools` 128/128;
  `npm run test:smoke -- --serve=dist` 296 z 296.

## Do decyzji właściciela

1. Brzmienie tekstów strony: **zaakceptowane przez właściciela 22.11.2026** („Akceptuję brzmienie tekstów dla /kadry-i-place.html”).
2. Odnośnik w menu i stopce: **zaakceptowane przez właściciela 22.11.2026** (kolejność, nazwa „Kadry i płace” i podpis zatwierdzone).
3. Nazwa handlowa pakietu: **„Auto Kadry i Płace”** — ustalona przez właściciela 22.11.2026.
4. Karta T-035 (wcześniej T-024) nadal ma status `do-przegladu`; jej raport jest scalony (PR #33 i #36).
   **Stan:** karta ma status `zmergowane` (23.11.2026).

## Stan

Wszystkie kwestie dotyczące pakietu, tekstów i odnośników zaakceptowane przez właściciela 22.11.2026. PR #39 scalony do main (commit ca9b92b). Karta zamknięta.
