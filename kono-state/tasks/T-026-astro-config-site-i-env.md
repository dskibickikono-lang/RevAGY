---
id: T-026
title: "astro.config: adres bazowy z MARKA.url i schemat zmiennej PUBLIC_TURNSTILE_SITEKEY (K-01, K-02 z audytu T-025)"
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/magical-mccarthy-unmqyo
base: main (5bac11d, scalony do gałęzi bez rebase)
depends_on: T-025 (audyt kodu)
pr: https://github.com/dskibickikono-lang/RevAGY/pull/35 (ten sam PR co raport audytu)
sha: (uzupełniane po commicie)
decisions: [D-015, D-021]
---

# T-026 — K-01 i K-02 z audytu kodu

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

## Uwaga o numerach kart

Na `main` są dziś trzy karty T-024 i druga karta T-025 (audyt SEO). Karta audytu kodu zostaje jako T-025,
ta dostała kolejny wolny numer.
