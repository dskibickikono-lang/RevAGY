---
id: T-027
title: "astro.config: adres bazowy z MARKA.url i schemat zmiennej PUBLIC_TURNSTILE_SITEKEY (K-01, K-02 z audytu T-028)"
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/magical-mccarthy-unmqyo
base: main (5e29276, scalony do gałęzi bez rebase)
depends_on: T-028 (audyt kodu, wcześniej T-025)
pr: https://github.com/dskibickikono-lang/RevAGY/pull/37 (scalony do main, da8d1ae)
sha: b23ae9202ebf806cc2e4fc38e0b39eb525d5ff83 (kod; kolejny commit zmienia tylko kartę)
decisions: [D-015, D-021]
---

# T-027 — K-01 i K-02 z audytu kodu

Zgoda właściciela z 22.11.2026: „zatwierdzam K-01 i K-02”. K-03 (skróty treści zasobów) bez zgody, zostaje
jako osobne zadanie razem z S-05.

## Zmiany (2 pliki)

1. `astro.config.mjs`
   - K-01, wariant minimalny: `site: MARKA.url` zamiast wpisanego adresu. Strony i narzędzia nadal mają
     własne kopie adresu (pełne ujednolicenie to osobny krok, około 4 h).
   - K-02: `env.schema` deklaruje `PUBLIC_TURNSTILE_SITEKEY` (publiczna, opcjonalna, do 64 znaków).
2. `src/config/kontakt.ts`
   - odczyt zmiennej z `astro:env/client`,
   - niepusta wartość w złym formacie zatrzymuje build,
   - pusta wartość wypisuje ostrzeżenie „build BEZ formularza (wariant mailto)”.

HTML wynikowy bez zmian: `check:dist` 6 z 6, w tym bajtowa migawka strony głównej i `htmlBaseline` 12/12.

## Czego ta zmiana nie robi

Literówka w nazwie zmiennej nadal daje build bez formularza, ale teraz z ostrzeżeniem w logu; twardą blokadą
pozostaje `check:dist`. Wymuszenie klucza w CI wymagałoby zmiany workflow (osobna zgoda).

## Wyniki testów (Linux, Node 22.23.5, konfiguracja jak w CI)

Uwaga: testy przeglądarkowe na Chromium build 1243 zamiast przypiętego 1255. Pełny przebieg robi KONO Boss przed merge.

| Polecenie | Kod | Wynik |
|---|---|---|
| `npm run build` | 0 | 12 stron |
| `npm run check:dist` | 0 | 6 z 6 kroków, 68 plików |
| `npm run test:tools` | 0 | 108 z 108 |
| `npm run test:smoke -- --serve=dist` | 0 | 271 z 271 |
| `npm run test:form` | 0 | 14 grup |
| `npm run test:deploy` | 0 | 16 z 16 |
| `npm run test:lighthouse` | 0 | `finanse.html`: 100 / 96 / 100 |
| build bez klucza | 0 | ostrzeżenie w logu, wariant mailto |
| build z kluczem `abc` | błąd | „PUBLIC_TURNSTILE_SITEKEY ma nieprawidłowy format” |

## Uwaga o numerach kart i o PR #35

- PR #35 został scalony o 15:59 UTC, zanim trafiły do niego commity z kodem, więc zawiera tylko raport audytu.
  Opis PR #35 zmieniłem po scaleniu tak, jakby zawierał kod; poprawione z powrotem. Kod idzie osobnym PR.
- Karta powstała jako T-026; w tym czasie numer T-026 zajęła na `main` karta audytu designu, stąd T-027.
  Na `main` są nadal dwie karty T-025 (audyt kodu i audyt SEO).
