---
id: T-036
title: Dane rzeczywiste opisów wdrożeń i scena dowodu „Agencja pracy” (kierunek A, etap A2)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-25
updated: 2026-11-26
branch: skibiai/trusting-shannon-g9jhj1
base: main (a74ab8c)
depends_on: T-033 (pilot A1, scalony w #38)
pr: https://github.com/dskibickikono-lang/RevAGY/pull/48
sha: 2b4678f (dane), c81a501 (scena A2), e2f150a + 916bc74 (poprawki po przeglądzie)
decisions: [D-015, D-020, D-021, D-033, D-034, D-048, D-054]
---

# T-036 — Dane rzeczywiste opisów wdrożeń i scena dowodu A2

## Zakres (plan zaakceptowany 25.11.2026: „tak”)

1. `src/data/dowody.mjs`: dane właściciela 1:1 dla `agencja-pracy-umowy` (HR KADRA Sp. z o.o.), `stan-zalogi`
   i `pilotaz-produkcja` (HR KONO, Grupa KONO) — skala, „Jak mierzone”, cytaty, tabela techniczna, `zgodaNaWynik: true`.
2. `tools/rejestr-twierdzen.json`: wiersze dla skal, metod pomiaru i nowych zdań o stanie załogi; usunięty
   `is-stan-zalogi-568-539`; `pl-pilotaz-wynik` → „z ok. 6 godzin do ok. 20 minut”, potwierdzone; `jakMierzone`
   dla wyników agencji i `wd-raport-6-godzin-do-zera`.
3. Zdania „568 i 539” zastąpione odczytem 1 370 / 1 300 (integracja-systemow, wdrozenia, finanse); odpowiedź FAQ
   o pilotażu: „…jeden pilotaż, w spółce HR KONO (Grupa KONO).”; wynik pilotażu „ok. 20 minut”.
4. Rejestr decyzji: D-054.
5. Etap A2: scena dowodu z 3 liczbami („ok. 12 h”, „ok. 90%”, „ok. 10 min”) na `/integracja-systemow.html`.

## Stan

Do przeglądu. Merge robi właściciel. Bez wdrożenia, SSH i zmian na hostach.

## Poprawki po przeglądzie PR #48 (zaakceptowane przez właściciela 26.11.2026)

1. Stan załogi jako odczyty z różnych dni (raport dzienny z 8 lipca 2026, arkusz operacyjny z 10 lipca 2026)
   na integracja-systemow, wdrozenia i finanse; zamiast „wyszło to dopiero po połączeniu źródeł” — „raport podaje
   datę i zakres każdego odczytu”. Z „Jak mierzone” usunięte „Po wdrożeniu dane w systemach się wyrównały.”
   (brak odczytu po wdrożeniu z tej samej daty i zakresu). Wiersze rejestru zaktualizowane.
2. „Wdrożenia”: opis strony bez „Bez nazw firm.”; FAQ „Dlaczego nie podajecie nazw wszystkich firm?”
   (treść i dane strukturalne FAQ zgodne).
3. Scena A2: „ok. 90%” — „mniej umów z korektą (z 20% do ok. 2%)”; „ok. 10 min” — „mediana od podpisu do wpisu
   w systemie; wcześniej ok. 3 dni”; dwa zdania z powtórzonymi liczbami zastąpione jednym. Wysokość sekcji przy 360 px:
   1 401 → 1 272 px (przed A2: 559 px).
4. Właściciel potwierdził, że zgody obejmują publiczne repozytorium i historię PR.

## Testy po poprawkach (Linux, sandbox, 916bc74)

- `npm run check:dist`: 6/6 OK; `dist/index.html` identyczny z wzorcem.
- `npm run test:smoke -- --serve=dist`: 319/319.
- Lighthouse: integracja-systemow 94/96/100, kontakt 100/100/100, finanse 100/96/100, kadry-i-place 100/97/100,
  sprzedaz 100/96/100, strona główna 74/97/100 (próg 65); progi spełnione. Niezaliczony audyt color-contrast
  na tych stronach istniał przed zmianą (`.reveal` z przezroczystością 0,16 w trakcie wejścia, T-033).
- Kontrast w scenie (4 fazy poświaty, 1440/390/360): minimum 6,03:1 (etykieta), opisy liczb ≥8,8:1.

## Testy pierwszej wersji (Linux, sandbox, build z publicznym kluczem Turnstile jak w CI)

| Sprawdzenie | Wynik |
|---|---|
| `npm run check:dist` | 6/6 OK (validate-dist, compare-home, check-podstrony-css, check-tresc, compare-film, testy narzędzi) |
| `dist/index.html` vs `tools/baseline/index.html` | identyczny bajt w bajt |
| `npm run test:smoke -- --serve=dist` | 319/319, 0 błędów |
| Lighthouse (`tools/lighthouse.cjs`, mediana z 3) | integracja-systemow 94/96/100 (po A1: 100/96/100), finanse 100/96/100, kadry-i-place 100/97/100, sprzedaz 99/96/100; wszystkie progi spełnione |
| Kontrast w scenie dowodu, najgorszy piksel tła, 4 fazy poświaty, 1440/390/360 | etykieta 6,03:1; autor cytatu ≥7,5:1; opisy liczb ≥8,9:1; podpis 9,06:1; cytat ≥16,1:1; liczby i tytuł ≥18,5:1 |
| Przepełnienie poziome (1440/390/360) | brak |
| `test:form` | nieuruchamiany (w sandboksie zawodzi także na czystym `main`, T-033) |

Pełny pytest uruchamia KONO Boss przed merge.

## Dowody

`kono-state/notes/kierunek-a-a2/`: sekcja „Jak to działa w praktyce” przed (main a74ab8c) i po, 1440/390/360.
Wysokość sekcji: 587 → 1084 px (1440), 500 → 1296 px (390), 559 → 1401 px (360).

## Ryzyka i otwarte

- Wydajność strony pilotażowej spadła lokalnie z 100 do 94. CI liczy Lighthouse w warunkach z szerszym krojem
  zastępczym; w A1 to tam wyszło przesunięcie układu. Poświata sceny dowodu jest zakotwiczona u góry
  (`.scena .hero-shade`), jak po poprawce A1.
- Repozytorium jest publiczne (D-051): nazwy spółek, imiona, nazwiska i cytaty 3 osób są w historii git.
- `zdanieUjawnienia` puste: tekst ujawnienia przy opisach HR KONO (Grupa KONO) wpisuje właściciel.
- Opisy „alert-zezwolenia” i „kandydaci-zgloszenia” nadal anonimowe, więc na „Wdrożeniach” zostaje pytanie
  „Dlaczego nie podajecie nazw firm?”.
