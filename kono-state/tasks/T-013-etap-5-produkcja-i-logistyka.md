---
id: T-013
title: Etap 5 — podstrona „Produkcja i logistyka” (/produkcja-i-logistyka.html)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-5-produkcja-i-logistyka
base: feat/etap-4-dane-i-bezpieczenstwo (1538754)
depends_on: T-012
pr: https://github.com/dskibickikono-lang/RevAGY/pull/14 (baza feat/etap-4-dane-i-bezpieczenstwo)
sha: 81dd1a9bf3cfec753e2b00b6452e4cec3fae9e92 (kod i testy; commit z tym wpisem zmienia tylko kartę)
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

## Runda 1 — wynik CI (2026-11-22)

- Astro zbudowało 9 stron. Walidator zgłosił wyłącznie błędy zapowiedziane przy niezmienionym kontrakcie:
  nadmiarowy plik `produkcja-i-logistyka.html`, brak pliku kadru, inna suma `sitemap.xml`, niezgodność
  `index.html`, `wdrozenia.html` i `dla-firm.html` z kontraktem. Pozostałe cztery kroki kontroli przeszły.
- Strony `integracja-systemow.html` i `dane-i-bezpieczenstwo.html` wyszły bajtowo bez zmian, więc komponent
  pytań nie zmienia stron, które nie używają odnośnika pod odpowiedzią.
- Zbudowany `index.html` jest bajtowo równy przewidzianej migawce.

## Runda 2 (2026-11-22)

- Kadr `public/assets/video/produkcja-i-logistyka-kadr.jpg` z artefaktu `media-<sha>`: 136 992 B przy limicie
  150 000 B, sha256 `03f230a9…a4ed`.
- Kontrakt policzony z builda CI z dołożonym kadrem (`tools/update-contract.cjs`). Zmienione wpisy:
  `index.html`, `wdrozenia.html`, `dla-firm.html`, `sitemap.xml`; nowe: `produkcja-i-logistyka.html` i kadr.
  Pozostałe strony i pliki bez zmian.
- Lokalnie `check-all` przechodzi we wszystkich 5 krokach: 49 plików, 9/9 stron, testy narzędzi 70/70.
- Przewidziany manifest wydania: `741f6956cac725f9facd4d5a93845cdd431d73f8de7560a66423f3a405e934f5`.

## Wynik CI (2026-11-22)

Przebieg dla `81dd1a9` (run 44967622033), zielony:

- `check:dist`: 5 z 5 kroków, 49 plików, 9/9 stron zgodnych z kontraktem i z zapisanym HTML.
  Manifest `741f6956cac725f9facd4d5a93845cdd431d73f8de7560a66423f3a405e934f5`, ten sam co przewidziany.
- Strona główna względem etapu 4: jedna zmiana (odnośnik w opisie kafla Enterprise), geometria równa bazie
  poza `#pakiety`.
- Test dymny: 155 z 155, 0 pominiętych. Testy `wydanie.sh`: 16 z 16. Testy narzędzi: 70 z 70.
- Zrzuty 1280 i 390 px w artefakcie `podglad-<sha>`.

## Do uzupełnienia przez właściciela

- `src/data/oferta.mjs`: `cenaPilota`, `skutekNieosiagnieciaKryterium`, `zastepstwoWPilocie`,
  `kategorieSystemowPilotazu`, `zdanieRozdzialDanych`.
- `src/data/dowody.mjs`, wpis `pilotaz-produkcja`: `zgodaNaWynik`, nazwa, etykieta, skala, „jak mierzone”.
- `src/data/bezpieczenstwo.mjs`: `wdrozenieUKlienta`. Pole jest wspólne ze stroną etapu 4.
