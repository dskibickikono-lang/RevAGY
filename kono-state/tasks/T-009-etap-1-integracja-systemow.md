---
id: T-009
title: Etap 1 — podstrona „Systemy bez przepisywania danych” (/integracja-systemow.html) i fundament podstron
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-21
updated: 2026-11-21
branch: feat/etap-1-integracja-systemow
base: feat/etap-0-prawda-na-stronie (7c6a067), od main (9389fe6)
depends_on: T-008
pr: https://github.com/dskibickikono-lang/RevAGY/pull/10 (roboczy, baza feat/etap-0-prawda-na-stronie)
sha: —
decisions: [D-015, D-017, D-018, D-019, D-021, D-022, D-025, D-028, D-031, D-032, D-033, D-034, D-035, D-036, D-038]
---

# T-009 — Etap 1: systemy bez przepisywania danych

## Cel

Pierwsza podstrona sprzedażowa (D-017) i wspólny fundament kolejnych podstron. Strona główna dostaje
tylko jeden odnośnik do nowej strony. Jej wygląd, animacje, filmy i motyw zostają bez zmian (D-015, D-021).

## Zakres

1. Fundament podstron (nowe pliki, `BaseLayout.astro` bez zmian, D-031):
   - `src/layouts/PodstronaLayout.astro`: pełny nagłówek i stopka strony głównej z odnośnikami `./#sekcja`.
     Adres kanoniczny i `og:*` powstają z nazwy pliku. Dane strukturalne: `WebPage`, `BreadcrumbList`,
     `Service`, `FAQPage` z tej samej listy pytań, którą widać na stronie, oraz `VideoObject` tylko w stanie „film”.
   - `MiejsceNaFilm.astro` i `src/config/filmy.mjs`: stan „kadr” albo „film” wybierany z obecności plików (D-022).
   - `Pytania.astro`, `OpisWdrozenia.astro`, `Ujawnienie.astro`, `Autor.astro`, `src/config/podstrony.mjs`.
   - `src/data/dowody.mjs`: dane wdrożeń, które wprowadza właściciel. Na razie wszystkie puste (D-034).
   - `public/assets/css/podstrony.css`: używa tylko wartości z `styles.css`.
   - `public/assets/js/wejscie.js`: zapis pierwszego wejścia `fg_first_touch` (D-036).
2. Strona `src/pages/integracja-systemow.astro`: bez nazw własnych systemów (D-033), opis wdrożenia anonimowy.
   Kwoty i terminy z faktów z 21.11.2026. Miejsce na film jest w sekcji `#film`.
3. Scena kadru `tools/scenes/integracja-systemow.html` i skrypt `tools/render-kadr.cjs`. Workflow
   `.github/workflows/render-media.yml` robi kadr albo film w GitHub Actions i publikuje artefakt `media-<sha>` (D-032).
4. Podpięcie:
   - `public/sitemap.xml`, `tools/podstrony.json`, `tools/rejestr-twierdzen.json`;
   - odnośnik „Zobacz, jak łączymy systemy” w sekcji `#integracje` strony głównej;
   - migawka `tools/baseline/index.html` z bazą `index.baza.html` (migawka etapu 0);
   - plik etapu z jednym wpisem `dodane`;
   - `tools/dom-contract.json`: strona główna, `sitemap.xml`, `podstrony.css`, `wejscie.js`.
5. Narzędzia:
   - walidator: reguły podstron (jeden blok danych strukturalnych, jeden adres strony, `FAQPage` równe
     widocznym pytaniom, `VideoObject` tylko przy `<video>`, `style` tylko `--d:<liczba>ms`);
   - `check-tresc` pomija zawartość `<time>` przy liczeniu liczb;
   - test dymny: rozwijanie FAQ oraz zapis `fg_first_touch` bez nadpisywania przy kolejnym wejściu.

## Runda 1 — wynik CI

- Astro skompilowało wszystkie szablony (5 stron). Walidator zgłosił dokładnie jeden, przewidziany błąd:
  „Nadmiarowy plik w katalogu: integracja-systemow.html”.
- Zbudowany `index.html` jest bajtowo równy przewidzianej migawce (`89a8ea18…1621`).
- `render-media.yml` przeszedł i dał kadr: 115 088 B, w limicie 150 000 B.

## Runda 2 (2026-11-21)

- Dodany kadr `public/assets/video/integracja-systemow-kadr.jpg` z artefaktu `media-<sha>`, bajt w bajt
  (sha256 `ca13e40a…3045`).
- Kontrakt policzony z builda CI rundy 1 z dołożonym kadrem (`tools/update-contract.cjs`):
  - doszła strona `integracja-systemow.html` w `pages` i `htmlBaseline` (24 276 B) oraz kadr w `publicFiles`;
  - pozostałe strony bez zmian.
- `tools/check-all.cjs` uruchamia wszystkie kroki, podsumowuje je i zwraca kod 1 dopiero na końcu (z testem).
- Lokalnie na tym katalogu `check-all` przechodzi we wszystkich 5 krokach:
  - walidator: 41 plików, 5/5 stron;
  - compare-home: 1 zmiana z listy;
  - check-podstrony-css i check-tresc: OK;
  - testy narzędzi: 68/68.
- Przewidziany manifest wydania: `038ddc75436ea892747c3c49495077b54c2a5f4c71d4730ee4c32b4a3d74525e`.
- Zbudowany HTML strony jest zgodny z założeniami. Źródła strony i komponentów nie zmieniły się w tej rundzie.

## Czeka na CI (runda 2)

- Cały `check:dist` na zielono z tym samym manifestem.
- Pierwszy przebieg testu dymnego dla podstrony:
  - menu i menu mobilne, FAQ, `fg_first_touch`;
  - ramka 16:9 i załadowany kadr;
  - kolory, kroje i rozmiary jako podzbiór stron wzorcowych;
  - brak przewijania w poziomie w 390 px;
  - zrzuty w `podglad-<sha>`.

## Do uzupełnienia przez właściciela

- Pola w `src/data/dowody.mjs`: nazwa spółki, etykieta powiązania, skala, „jak mierzone”, cytat,
  drogi łączenia, zdanie ujawnienia.
- Wyniki wdrożenia wychodzą anonimowo ze słowem „ok.” do czasu opisu „jak mierzone” (ZASADY 7.4).
