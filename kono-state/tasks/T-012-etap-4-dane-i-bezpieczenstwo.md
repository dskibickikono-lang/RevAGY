---
id: T-012
title: Etap 4 — podstrona „Dane i bezpieczeństwo” (/dane-i-bezpieczenstwo.html)
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-4-dane-i-bezpieczenstwo
base: feat/etap-3-dla-firm (aa350e5)
depends_on: T-011
pr: —
sha: —
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

## Do uzupełnienia przez właściciela

- `src/data/bezpieczenstwo.mjs`:
  - `aiNaDanychKlienta`: odpowiedź o modelach AI na danych klienta;
  - `odpowiedzNaAnkiete`: zdanie o ankiecie bezpieczeństwa;
  - `wdrozenieUKlienta`: zdanie o wdrożeniu w chmurze albo na serwerach klienta.
