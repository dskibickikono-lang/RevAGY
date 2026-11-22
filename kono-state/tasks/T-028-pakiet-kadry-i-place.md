---
id: T-028
title: Pakiet K02 — kadry i płace bez ręcznego wpisywania (opis pakietu i podstrona /kadry-i-place.html)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/serene-bohr-2hdmui
base: main (da8d1ae)
depends_on: T-024
pr: https://github.com/dskibickikono-lang/RevAGY/pull/39 (baza main)
sha: 3c6c43d8361a5c469cce203952430380157da625 (runda 1: strona, scena, rejestry); runda 2 (kadr i kontrakt) w kolejnym commicie tej gałęzi
decisions: [D-015, D-017, D-019, D-021, D-022, D-025, D-028, D-031, D-032, D-033, D-034, D-041, D-043, D-044, D-045]
---

# T-028 — Pakiet K02: kadry i płace

## Cel

Pierwszy pakiet do portfolio wybrany przez właściciela (D-045): godziny, premie i dane umów trafiają do programu
kadrowo-płacowego bez ręcznego wpisywania. Właściciel zaakceptował 22.11.2026 kroki 1–2 planu z karty T-024
(„akceptuję kroki 1–2, cena po audycie, stała”).

## Zakres

1. Opis pakietu: `kono-state/notes/pakiet-kadry-i-place.md` (zakres stały, granice, kryterium sukcesu, dostępy, opieka).
2. Nowa podstrona `/kadry-i-place.html` na układzie `PodstronaLayout` (D-031), z miejscem na film w stanie „kadr”
   (D-022), bez nazw własnych systemów (D-033), cena „po audycie, stała” (D-041).

## Granice

- Strona główna i pozostałe podstrony bez zmian (D-015, D-021). Menu i stopka nie dostają odnośnika do nowej strony:
  to zmiana układów wspólnych i strony głównej, wymaga osobnej decyzji właściciela.
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

## Do decyzji właściciela

1. Brzmienie tekstów strony (propozycja agenta według przewodnika tonu z T-024).
2. Odnośnik do strony w menu „Dla działów” i w stopce: zmienia układy wspólne i stronę główną.
3. Nazwa handlowa pakietu i jego miejsce obok Start i Scale (opis w `kono-state/notes/pakiet-kadry-i-place.md`).
4. Karta T-024 nadal ma status `do-przegladu`; jej raport jest scalony (PR #33 i #36).
