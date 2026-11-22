---
id: T-011
title: Etap 3 — podstrona „Dla firm 5–250 osób” (/dla-firm.html)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-3-dla-firm
base: feat/etap-2-wdrozenia (877b57e)
depends_on: T-010
pr: https://github.com/dskibickikono-lang/RevAGY/pull/12 (baza feat/etap-2-wdrozenia)
sha: 45e71e9a87d878fa517a0a76c267d66e80cc7536 (kod i testy; commit z tym wpisem zmienia tylko kartę)
decisions: [D-015, D-016, D-019, D-021, D-022, D-025, D-028, D-029, D-031, D-032, D-033, D-038]
---

# T-011 — Etap 3: dla firm 5–250 osób

## Cel

Strona toru dla firm 5–250 osób (D-016) z pakietami Start i Scale. Ceny „od” (D-029) pokazują się dopiero
wtedy, gdy właściciel je wpisze. Do tego czasu kafel pokazuje „Wycena po audycie”. Strona główna dostaje
tylko jeden odnośnik. Wygląd i motyw strony głównej zostają bez zmian (D-015, D-021).

## Zakres

1. Nowe pliki strony:
   - `src/pages/dla-firm.astro`;
   - `src/data/oferta.mjs`: kwoty i warunki mają wartość `null`, a plik przy imporcie zatrzymuje build na `{{…}}`;
   - `tools/scenes/dla-firm.html` (D-032).
2. Dwa kafle pakietów są w siatce dwukolumnowej: klasa `.plans.plans-dwa` w `podstrony.css`, tylko wartości
   ze `styles.css`.
3. Dane wspólne:
   - `src/config/filmy.mjs`;
   - `tools/podstrony.json`;
   - `tools/rejestr-twierdzen.json`;
   - `public/sitemap.xml`.
4. Odnośnik z `/wdrozenia.html` (sekcja `#pierwszy-krok`) do nowej strony, odłożony w etapie 2.
5. Strona główna:
   - odnośnik „Zobacz pakiety dla firm” w sekcji `#pakiety`;
   - migawka `tools/baseline/index.html`;
   - baza `index.baza.html` (migawka etapu 2);
   - plik etapu z jednym wpisem `dodane`.
6. `tools/dom-contract.json` bez zmian w rundzie 1. Cały kontrakt liczy PM w rundzie 2 z builda CI.

## Runda 1 — wynik CI (2026-11-22)

- Astro zbudowało 7 stron. Walidator zgłosił wyłącznie błędy zapowiedziane przy niezmienionym kontrakcie:
  nadmiarowy plik `dla-firm.html`, inne sumy `podstrony.css` i `sitemap.xml`, niezgodność `index.html`
  i `wdrozenia.html` z kontraktem. Pozostałe cztery kroki kontroli przeszły.
- Zbudowany `index.html` jest bajtowo równy przewidzianej migawce.
- Zdanie z odnośnikiem na `/wdrozenia.html` zapowiada pakiety, nie ceny (kwot jeszcze nie ma).

## Runda 2 (2026-11-22)

- Kadr `public/assets/video/dla-firm-kadr.jpg` z artefaktu `media-<sha>`: 114 441 B przy limicie 150 000 B,
  sha256 `1fcd9de6…77d8`.
- Kontrakt policzony z builda CI z dołożonym kadrem (`tools/update-contract.cjs`). Zmienione wpisy:
  `index.html`, `wdrozenia.html`, `podstrony.css`, `sitemap.xml`; nowe: `dla-firm.html` i kadr.
  Pozostałe strony i pliki bez zmian.
- Lokalnie `check-all` przechodzi we wszystkich 5 krokach: 45 plików, 7/7 stron, testy narzędzi 68/68.
- Przewidziany manifest wydania: `044b68d22b8332415f6b51c3482a25866ae22fa4c595a2e4baf283ed6b860fbe`.

## Wynik CI (2026-11-22)

Przebieg dla `45e71e9` (run 44966554675), zielony:

- `check:dist`: 5 z 5 kroków, 45 plików, 7/7 stron zgodnych z kontraktem i z zapisanym HTML.
  Manifest `044b68d22b8332415f6b51c3482a25866ae22fa4c595a2e4baf283ed6b860fbe`, ten sam co przewidziany.
- Strona główna względem etapu 2: jedna zmiana (dopisany odnośnik), geometria równa bazie poza `#pakiety`.
- Test dymny: 117 z 117, 0 pominiętych. Testy `wydanie.sh`: 16 z 16. Testy narzędzi: 68 z 68.
- Zrzuty 1280 i 390 px w artefakcie `podglad-<sha>`.

## Do uzupełnienia przez właściciela

- `src/data/oferta.mjs`: `cenaStartOd`, `cenaScaleOd`, `warunkiZakonczeniaUmowy`.
- Miejsce i brzmienie odnośnika na stronie głównej potwierdza właściciel na podglądzie.
