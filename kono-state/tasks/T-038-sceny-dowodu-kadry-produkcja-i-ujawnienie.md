---
id: T-038
title: Sceny dowodu na kadry-i-place i produkcja-i-logistyka, zdanie ujawnienia (PR 1 z 2)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-26
updated: 2026-11-26
branch: skibiai/trusting-shannon-g9jhj1
base: main (b4bef98)
depends_on: T-036, T-037
pr: —
sha: dfce223
decisions: [D-015, D-021, D-034, D-048, D-054, D-055]
---

# T-038 — Sceny dowodu i zdanie ujawnienia

## Zakres (plan zaakceptowany 26.11.2026: „Robimy wszystko”, potem „Tak” dla planu i brzmienia zdania)

1. `/kadry-i-place.html`: opis agencji pracy jako scena dowodu z 3 liczbami jak na integracji; lista „Wynik:” usunięta
   (powtarzała liczby), zdanie o podpisie na tablecie dopisane do akapitu „Co połączyliśmy”.
2. `/produkcja-i-logistyka.html`: pilotaż jako scena z liczbą „ok. 20 min” (tylko przy `zgodaNaWynik: true`), linia
   „Wynik:” usunięta; `<Ujawnienie />` dodane pod opisem (wcześniej go tam nie było).
3. `zdanieUjawnienia`: „Opisy oznaczone „Grupa KONO” pochodzą ze spółek Grupy KONO, która jest klientem REVAGY.” (D-055).
4. `podstrony.css`: zdanie ujawnienia pod sceną dowodu na pełną szerokość sceny.
5. Rejestr twierdzeń: `is-a2-*` rozszerzone o kadry-i-place; nowe `pl-a3-20-min`, `pl-a3-6-h`.
6. Karty T-036 i T-037: status „scalone”.

## Zmiana względem planu

Wczytywanie kroju tytułów z wyprzedzeniem (`preload` Onest latin + latin-ext w `PodstronaLayout.astro`) przeniesione
do PR 2 (T-039). Pomiar z krojem zastępczym DejaVu i krojem opóźnionym o 900 ms (412×823, metoda z T-033):

| Strona | main b4bef98 | z preload | źródło przesunięcia z preload |
|---|---|---|---|
| integracja-systemow | 0,093 | 0,151 | scena 0,015 + baner zgody 0,135 |
| kadry-i-place | 0,024 | 0,108 | baner zgody 0,108 |
| dla-firm | 0,040 | 0,126 | scena 0,005 + baner zgody 0,121 |

Preload zmniejsza przesunięcie sceny, ale krój dochodzi wtedy, gdy baner zgody jest już na ekranie, i baner zmienia
wysokość. PR 2 zmienia moment pokazania banera na telefonie, więc preload wchodzi razem z nim. Bez preload kadry-i-place
0,024 i produkcja-i-logistyka 0,035 — tyle co na main.

## Testy (Linux, sandbox, build z publicznym kluczem Turnstile jak w CI)

- `npm run check:dist`: 6/6; `dist/index.html` identyczny z wzorcem.
- `tools/smoke-test.cjs --serve=dist`: 331/331.
- Lighthouse, 12 stron lokalnie: progi spełnione; wydajność podstron 98–100 (kadry-i-place 100, produkcja-i-logistyka 100),
  strona główna 83 (próg 65).
- Kontrast w nowych scenach dowodu, najgorszy piksel tła, 4 fazy poświaty, 1440/390/360: minimum 6,03:1 (etykieta w kolorze
  akcentu, jak w A2).
- Wysokość sekcji: kadry-i-place 1 536 → 1 782 px (360), produkcja-i-logistyka 1 032 → 1 152 px (360).

## Poprawki po przeglądzie PR #50 (zaakceptowane przez właściciela 26.11.2026)

1. Zdanie ujawnienia tylko na stronach z etykietą „Grupa KONO”: `pokazUjawnienie(ids)` w `src/data/dowody.mjs`,
   `<Ujawnienie wdrozenia={[…]} />` z listą wdrożeń, których etykiety strona pokazuje. Wynik w dist:
   kadry-i-place 0, sprzedaz 0, produkcja-i-logistyka 1, finanse 1, wdrozenia 1, integracja-systemow 1.
   Wyłączenie `zgodaNaWynik` ukrywa tylko liczbę pilotażu, etykieta i zdanie zostają.
2. „ok. 20 min”: opis „przygotowanie raportu zmianowego, od udostępnienia danych za zmianę do zapisania raportu;
   wcześniej ok. 6 h”. Wartość i tabela kryteriów bez zmian.
3. `tools/tests/ujawnienie.test.cjs`: 3 testy pomocnika na danych testowych + liczba zdań na zbudowanych stronach.
   Na buildzie sprzed poprawki test liczby zdań nie przechodzi, po poprawce 4/4.

## Dowody

`kono-state/notes/kierunek-a-dowody/`: sekcje przed (main b4bef98) i po, 2 strony × 1440/390/360, `pomiary.json`.

## Stan

Do przeglądu. Merge robi właściciel. Następny krok: PR 2 (T-039) — baner zgody, poświata kontaktu, preload kroju.
