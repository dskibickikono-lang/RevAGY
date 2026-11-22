---
id: T-010
title: Etap 2 — podstrona „Wdrożenia” (/wdrozenia.html)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-2-wdrozenia
base: feat/etap-1-integracja-systemow (32d6298)
depends_on: T-009
pr: https://github.com/dskibickikono-lang/RevAGY/pull/11 (baza feat/etap-1-integracja-systemow)
sha: 077e28bc594576120b42c2ae5c90d67ad5bbee3c (kod i testy; commit z tym wpisem zmienia tylko kartę)
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

## Runda 1 — wynik CI (2026-11-22)

- Astro zbudowało 6 stron. Walidator zgłosił jeden, przewidziany błąd: „Nadmiarowy plik w katalogu: wdrozenia.html”.
  Pozostałe cztery kroki kontroli przeszły.
- Zbudowany `index.html` jest bajtowo równy przewidzianej migawce.
- `render-media.yml` dał kadr. Po obejrzeniu poprawiona scena: podpis osi czasu wychodził poza kafel.
- Nagłówek sekcji dowodów jest polem właściciela (`naglowekDowodow`); bez wartości strona pokazuje
  „Jak czytać te opisy”.

## Runda 2 (2026-11-22)

- Kadr `public/assets/video/wdrozenia-kadr.jpg` z artefaktu `media-<sha>`: 100 606 B przy limicie 150 000 B,
  sha256 `1ac553a5…c092`.
- Kontrakt policzony z builda CI z dołożonym kadrem (`tools/update-contract.cjs`): doszła strona
  `wdrozenia.html` w `pages` i `htmlBaseline` oraz kadr w `publicFiles`. Pozostałe strony bez zmian.
- Lokalnie `check-all` przechodzi we wszystkich 5 krokach: 43 pliki, 6/6 stron, testy narzędzi 68/68.
- Przewidziany manifest wydania: `4fa7664ae69e61a5d18cf28b4e8f17e716182d78d3e4f4d45300b95daa00fe91`.

## Wynik CI (2026-11-22)

Przebieg dla `077e28b` (run 44965882291), zielony:

- `check:dist`: 5 z 5 kroków, 43 pliki, 6/6 stron zgodnych z kontraktem i z zapisanym HTML.
  Manifest `4fa7664ae69e61a5d18cf28b4e8f17e716182d78d3e4f4d45300b95daa00fe91`, ten sam co przewidziany.
- Strona główna względem etapu 1: jedna zmiana (dopisany odnośnik), geometria równa bazie poza `#zastosowania`.
- Test dymny: 98 z 98, 0 pominiętych. Testy `wydanie.sh`: 16 z 16. Testy narzędzi: 68 z 68.
- Zrzuty 1280 i 390 px w artefakcie `podglad-<sha>`.
- Ostrzeżenia: wyniki wdrożeń bez opisu „jak mierzone” (uzupełnia właściciel).

## Do uzupełnienia przez właściciela

- Pola w `src/data/dowody.mjs` dla czterech wdrożeń:
  - nazwa, etykieta, skala, „jak mierzone”, cytat;
  - rodzaj firmy w dwóch opisach;
  - zdanie ujawnienia, nagłówek sekcji dowodów (`naglowekDowodow`) i `takzePozaGrupa`.
- Miejsce odnośnika na stronie głównej potwierdza właściciel na podglądzie.
