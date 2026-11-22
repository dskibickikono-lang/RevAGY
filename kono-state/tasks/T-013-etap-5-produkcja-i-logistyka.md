---
id: T-013
title: Etap 5 — podstrona „Produkcja i logistyka” (/produkcja-i-logistyka.html)
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-5-produkcja-i-logistyka
base: feat/etap-4-dane-i-bezpieczenstwo (b0b61c6)
depends_on: T-012
pr: —
sha: —
decisions: [D-015, D-016, D-019, D-021, D-022, D-030, D-031, D-032, D-033, D-034, D-038]
---

# T-013 — Etap 5: produkcja i logistyka

## Cel

Tor Enterprise (D-016). Wejściem jest płatny pilot: jedna linia albo jedna zmiana, 14 dni, kryterium sukcesu
ustalone przed startem i stała cena (D-030). Kwoty jeszcze nie ma, więc strona pokazuje „Cena pilota po rozmowie”.
Wynik jedynego pilotażu w produkcji pojawi się dopiero po zgodzie (D-034). Strona główna dostaje tylko jeden
odnośnik. Wygląd i motyw strony głównej zostają bez zmian (D-015, D-021).

## Zakres

1. Komponent `Pytania.astro` ma opcjonalne pole `odnosnik: { href, tekst }`, wypisywane jako osobny akapit
   pod odpowiedzią. Dalsze zmiany w narzędziach:
   - walidator porównuje `FAQPage` z akapitami odpowiedzi bez akapitu z samym odnośnikiem;
   - walidator sprawdza odwołania lokalne podstron, których nie ma jeszcze w kontrakcie.
2. Nowe pliki strony: `src/pages/produkcja-i-logistyka.astro` i `tools/scenes/produkcja-i-logistyka.html`.
   Pola pilota dopisane do `src/data/oferta.mjs`, wszystkie `null`.
3. Dane wspólne:
   - `pilotaz-produkcja` w `src/data/dowody.mjs`: jeden klucz dla stron etapów 1 i 5;
   - `src/config/filmy.mjs`, `tools/podstrony.json`, `tools/rejestr-twierdzen.json`, `public/sitemap.xml`.
4. Odnośniki z wcześniejszych stron:
   - `/dla-firm.html`: sekcja `#enterprise` oraz dwa pytania z odnośnikiem pod odpowiedzią;
   - `/wdrozenia.html`: pytanie o produkcję i logistykę.
5. Strona główna:
   - odnośnik „Pilot dla produkcji i logistyki” w opisie kafla Enterprise (`#pakiety`);
   - migawka `tools/baseline/index.html`;
   - baza `tools/baseline/index.baza.html` (migawka etapu 4);
   - plik etapu z jednym wpisem `dodane`.
6. `tools/dom-contract.json` bez zmian. Kontrakt policzy PM w rundzie 2.

## Do uzupełnienia przez właściciela

- `src/data/oferta.mjs`: `cenaPilota`, `skutekNieosiagnieciaKryterium`, `zastepstwoWPilocie`,
  `kategorieSystemowPilotazu`, `zdanieRozdzialDanych`.
- `src/data/dowody.mjs`, wpis `pilotaz-produkcja`: `zgodaNaWynik`, nazwa, etykieta, skala, „jak mierzone”.
- `src/data/bezpieczenstwo.mjs`: `wdrozenieUKlienta`. Pole jest wspólne ze stroną etapu 4.
