---
id: T-025
title: Pełny audyt kodu strony RevAGY (fundamenty przed dalszą budową) — tylko raport
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/magical-mccarthy-unmqyo
base: main (7cd0f71; audyt zaczęty na 43efbf5, main scalony do gałęzi bez rebase)
pr: https://github.com/dskibickikono-lang/RevAGY/pull/35 (baza main)
sha: 7a91d2edf9c796771b907a0c9d12a5cbb6dec2bc (raport i karta; kolejny commit zmienia tylko kartę)
decisions: [D-010, D-013, D-015, D-021, D-031, D-033, D-036, D-039]
---

# T-025 — Audyt kodu strony RevAGY

Numer: karta powstała jako T-024, ale w trakcie audytu numer T-024 zajęła na `main` karta banera zgody
(PR #28). Po scaleniu `main` do gałęzi audyt dostał kolejny wolny numer, T-025.

## Cel

Pełny audyt kodu przed dalszą budową. Wynik to wyłącznie raport `kono-state/notes/audyt-kodu.md`.
Zero zmian w kodzie, bez `--fix`, bez wdrożeń, bez SSH. Zgoda właściciela z góry obejmuje tylko tę kartę
i plik raportu.

## Zakres

1. Przegląd kodu (`/code-review xhigh --max-findings all`) kolejno: `src/`, `tools/`, `integrations/`,
   `deploy/`, `astro.config.mjs`.
2. Przegląd bezpieczeństwa (`/security-review`) i ręczne sprawdzenie: formularz, nagłówki, sekrety w repo,
   skrypty deploy.
3. Gotowość produkcyjna całej strony (skill `product-discovery:production-readiness`, checklista HTML).
4. Faktyczne przebiegi: `npm run build`, `test:smoke`, `test:form`, `test:tools`, `check:dist`,
   `test:lighthouse`.

## Wynik

- Raport: `kono-state/notes/audyt-kodu.md`.
- 63 znaleziska: 0 krytycznych, 20 ważnych, 42 drobne, 1 zamknięte w trakcie (baner zgody, PR #28).
  Podział: `src/` i skrypty stron 18, `tools/` 16, `integrations/` 9, `deploy/` 17, `astro.config.mjs` 3.
- `/security-review`: różnica gałęzi to tylko karta, bez znalezisk; ręczny przegląd w rozdziale 4 raportu.
  `npm audit`: 0 podatności. Sekrety w repo i w historii: 0 trafień.
- Gotowość produkcyjna: etap przygotowania 47% (11 z 23), 1 do poprawy, 11 do sprawdzenia; 8 punktów czeka
  na wdrożenie, 2 na obserwację. Checklista HTML jest poza repo (zgoda obejmowała kartę i raport), przekazana
  właścicielowi w rozmowie.
- Zmiany w kodzie: brak. Zmienione pliki: ta karta i raport.

## Wyniki testów (Linux, Node 22.23.5, 22.11.2026)

Uwaga: Playwright 1.65.1 oczekuje Chromium build 1255; w kontenerze audytu był build 1243 (Chromium 157) i na nim
poszły testy przeglądarkowe. Pełny pytest i przebieg na czystym Linuksie robi KONO Boss przed merge.

Polecenia dokładnie jak w zleceniu, bez zmiennych (świeży klon):

| Polecenie | Kod | Wynik |
|---|---|---|
| `npm run build` | 0 | 12 stron |
| `npm run test:smoke` | 1 | brak serwera pod `localhost:8000` (CI uruchamia z `--serve=dist`) |
| `npm run test:form` | 1 | `ERR_CONNECTION_RESET`: test nie omija proxy środowiska audytu |
| `npm run test:tools` | 0 | 108 z 108 |
| `npm run check:dist` | 1 | 2 z 6 kroków: build bez klucza Turnstile nie ma formularza, więc różni się od migawki |
| `npm run test:lighthouse` | 2 | `CHROME_INTERSTITIAL_ERROR`: Chrome poszedł przez proxy środowiska audytu |

Konfiguracja jak w CI, stan `main` 7cd0f71 (build z publicznym kluczem z migawki, `--serve=dist`, bez zmiennych
proxy dla `test:form` i `test:lighthouse`):

| Polecenie | Kod | Wynik |
|---|---|---|
| `npm run build` | 0 | 12 stron |
| `npm run check:dist` | 0 | 6 z 6 kroków, 68 plików, manifest `e5bd7953…010b7` (jak przewidziany w T-024) |
| `npm run test:tools` | 0 | 108 z 108 |
| `npm run test:smoke -- --serve=dist` | 0 | 271 z 271 |
| `npm run test:form` | 0 | 14 grup sprawdzeń |
| `npm run test:deploy` | 0 | 16 z 16 |
| `npm run test:lighthouse` | 0 | `finanse.html`: wydajność 100, dostępność 96, SEO 100 (mediany z 3 przebiegów) |

## Do decyzji właściciela

1. Plan trzech poprawek z `astro.config.mjs` (K-01, K-02, K-03), o które właściciel poprosił w trakcie audytu:
   niewdrożone, opis w rozdziale 10 raportu. Czekają na zgodę.
2. Pozostałe pytania: rozdział 10 raportu (wstrzymanie filmów, zakres D-033 na stronie głównej, szczegóły hosta
   w repo, ocena bramki formularza, checklista HTML w repo).
