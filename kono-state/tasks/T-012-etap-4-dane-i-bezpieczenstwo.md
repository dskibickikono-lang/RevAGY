---
id: T-012
title: Etap 4 — podstrona „Dane i bezpieczeństwo” (/dane-i-bezpieczenstwo.html)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-4-dane-i-bezpieczenstwo
base: feat/etap-3-dla-firm (7776daf)
depends_on: T-011
pr: https://github.com/dskibickikono-lang/RevAGY/pull/13 (baza feat/etap-3-dla-firm)
sha: 9fd40d28937b12abdbb4049543c68fb7da9f79dc (kod i testy; commit z tym wpisem zmienia tylko kartę)
decisions: [D-015, D-019, D-021, D-022, D-023, D-031, D-032, D-033, D-035, D-038]
---

# T-012 — Etap 4: dane i bezpieczeństwo

## Cel

Strona dla działu IT i zakupów, która mówi, co obowiązuje dziś. Na stronie są tylko fakty potwierdzone
21.11.2026:
- umowa powierzenia podpisywana przed startem prac, ze wskazaniem miejsca przetwarzania;
- ubezpieczenie odpowiedzialności zawodowej;
- trzy drogi łączenia, minimalny zakres dostępu, dziennik zapisów.

Strona nie wskazuje regionu przetwarzania, nie wymienia dostawców i nie pokazuje wzoru umowy. Strona główna
dostaje tylko jeden odnośnik. Jej wygląd i motyw zostają bez zmian (D-015, D-021).

## Zakres

1. Nowe pliki:
   - `src/pages/dane-i-bezpieczenstwo.astro`;
   - `src/data/bezpieczenstwo.mjs` z trzema polami właściciela, wszystkie `null`;
   - `tools/scenes/dane-i-bezpieczenstwo.html` (D-032).
2. Dane wspólne: `src/config/filmy.mjs`, `tools/podstrony.json`, `tools/rejestr-twierdzen.json`, `public/sitemap.xml`.
3. Odłożone zdanie na `/dla-firm.html`, w pytaniu „Co z danymi osobowymi?”.
4. Strona główna:
   - odnośnik „Zobacz, jak chronimy dane” w sekcji `#bezpieczenstwo`;
   - migawka `index.html` i baza `index.baza.html` (migawka etapu 3);
   - plik etapu z jednym wpisem `dodane`.
5. `tools/dom-contract.json` bez zmian. Kontrakt liczy PM w rundzie 2.

## Runda 1 — wynik CI (2026-11-22)

- Astro zbudowało 8 stron. Walidator zgłosił wyłącznie błędy zapowiedziane przy niezmienionym kontrakcie:
  nadmiarowy plik `dane-i-bezpieczenstwo.html`, inna suma `sitemap.xml`, niezgodność `index.html`
  i `dla-firm.html` z kontraktem. Pozostałe cztery kroki kontroli przeszły.
- Zbudowany `index.html` jest bajtowo równy przewidzianej migawce.
- Wstęp tabeli „Co obowiązuje dziś” mówi tylko o zapisie w umowie.

## Runda 2 (2026-11-22)

- Kadr `public/assets/video/dane-i-bezpieczenstwo-kadr.jpg` z artefaktu `media-<sha>`: 128 897 B przy limicie
  150 000 B, sha256 `3a9e11da…f4c3`.
- Kontrakt policzony z builda CI z dołożonym kadrem (`tools/update-contract.cjs`). Zmienione wpisy:
  `index.html`, `dla-firm.html`, `sitemap.xml`; nowe: `dane-i-bezpieczenstwo.html` i kadr.
  Pozostałe strony i pliki bez zmian.

## Wynik CI (2026-11-22)

Przebieg dla `9fd40d2` (run 44967048175), zielony:

- `check:dist`: 5 z 5 kroków, 47 plików, 8/8 stron zgodnych z kontraktem i z zapisanym HTML.
  Manifest `cd4e94aa7ad966c74e5eb7a8783d5413636e9a7666e9989acfdaa744f67ddeff`, ten sam co przewidziany.
- Strona główna względem etapu 3: jedna zmiana (dopisany odnośnik), geometria równa bazie poza `#bezpieczenstwo`.
- Test dymny: 136 z 136, 0 pominiętych. Testy `wydanie.sh`: 16 z 16. Testy narzędzi: 68 z 68.
- Zrzuty 1280 i 390 px w artefakcie `podglad-<sha>`.

## Do uzupełnienia przez właściciela

- `src/data/bezpieczenstwo.mjs`:
  - `aiNaDanychKlienta`: odpowiedź o modelach AI na danych klienta;
  - `odpowiedzNaAnkiete`: zdanie o ankiecie bezpieczeństwa;
  - `wdrozenieUKlienta`: zdanie o wdrożeniu w chmurze albo na serwerach klienta.
