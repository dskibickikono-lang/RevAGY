---
id: T-010
title: Etap 2 — podstrona „Wdrożenia” (/wdrozenia.html)
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-2-wdrozenia
base: feat/etap-1-integracja-systemow (82e7334)
depends_on: T-009
pr: —
sha: —
decisions: [D-015, D-018, D-019, D-020, D-021, D-022, D-025, D-028, D-031, D-032, D-033, D-034, D-038]
---

# T-010 — Etap 2: wdrożenia

## Cel

Jedna strona z czterema opisami wdrożeń (D-020). Opisy są anonimowe, z liczbami ze słowem „ok.” (D-034),
bez nazw własnych systemów (D-033). Strona główna dostaje tylko jeden odnośnik. Jej wygląd i motyw zostają
bez zmian (D-015, D-021).

## Zakres

1. `src/pages/wdrozenia.astro`. Strona korzysta z układu i komponentów etapu 1, bez zmian w plikach wspólnych
   układu. Miejsce na film jest w sekcji `#film` (D-022). Scena kadru: `tools/scenes/wdrozenia.html` (D-032).
2. Dane wspólne:
   - `src/config/filmy.mjs`: wpis `wdrozenia`;
   - `src/data/dowody.mjs`: jedno wdrożenie ma jeden klucz. `agencja-pracy-umowy` i `stan-zalogi` są wspólne
     ze stroną etapu 1. `alert-zezwolenia` i `kandydaci-zgloszenia` są nowe, wszystkie pola mają wartość null;
   - `tools/podstrony.json`, `tools/rejestr-twierdzen.json`, `public/sitemap.xml`.
3. Strona główna:
   - odnośnik „Zobacz cztery wdrożenia” w sekcji `#zastosowania`;
   - migawka `tools/baseline/index.html`, baza `index.baza.html` (migawka etapu 1);
   - plik etapu z jednym wpisem `dodane`;
   - kontrakt `index.html` i `sitemap.xml`.

## Runda 2 (po pierwszym przebiegu CI)

- Kadr `public/assets/video/wdrozenia-kadr.jpg` z artefaktu `media-<sha>`.
- Kontrakt strony `wdrozenia.html` (`pages`, `htmlBaseline`) z artefaktu `dist-roboczy-<sha>` przez
  `tools/update-contract.cjs`.

## Do uzupełnienia przez właściciela

- Pola w `src/data/dowody.mjs` dla czterech wdrożeń:
  - nazwa, etykieta, skala, „jak mierzone”, cytat;
  - rodzaj firmy w dwóch opisach;
  - zdanie ujawnienia, nagłówek sekcji dowodów (`naglowekDowodow`) i `takzePozaGrupa`.
- Miejsce odnośnika na stronie głównej potwierdza właściciel na podglądzie.
