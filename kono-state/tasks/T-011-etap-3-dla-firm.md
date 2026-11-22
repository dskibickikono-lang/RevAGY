---
id: T-011
title: Etap 3 — podstrona „Dla firm 5–250 osób” (/dla-firm.html)
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-3-dla-firm
base: feat/etap-2-wdrozenia (877b57e)
depends_on: T-010
pr: —
sha: —
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

## Runda 2 (PM)

- Kadr `public/assets/video/dla-firm-kadr.jpg` z artefaktu `media-<sha>`.
- Kontrakt z `dist-roboczy-<sha>`:
  - strona główna, `sitemap.xml`, `podstrony.css`;
  - strony `wdrozenia.html` i `dla-firm.html`;
  - kadr.

## Do uzupełnienia przez właściciela

- `src/data/oferta.mjs`: `cenaStartOd`, `cenaScaleOd`, `warunkiZakonczeniaUmowy`.
- Miejsce i brzmienie odnośnika na stronie głównej potwierdza właściciel na podglądzie.
