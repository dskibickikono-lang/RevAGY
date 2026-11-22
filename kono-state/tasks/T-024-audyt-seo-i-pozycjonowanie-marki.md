---
id: T-024
title: Audyt SEO i pozycjonowania marki REVAGY (tylko raport)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/dreamy-johnson-hfb3j4
base: main (43efbf5)
depends_on: T-006, T-022
pr: https://github.com/dskibickikono-lang/RevAGY/pull/29 (baza main)
sha: 4d537b485682548c631a8f63b79eaa5fefd28366 (raport i rejestr źródeł; kolejne commity zmieniają tylko kartę)
decisions: [D-001, D-011, D-013, D-015, D-018, D-021, D-033, D-034, D-039]
---

# T-024 — Audyt SEO i pozycjonowania marki REVAGY

## Cel

Ocena stanu SEO strony `revagy.pl` i pozycjonowania marki: stan w liczbach, luki, mapa fraz → podstrony,
plan 30/60/90 dni. **Tylko raport, zero zmian w kodzie.**

## Zakres

1. Audyt techniczny z repo i builda (`43efbf5`): title/description, nagłówki, JSON-LD, sitemap, robots,
   `llms.txt`, canonical, przekierowania, linkowanie wewnętrzne, obrazy i filmy, Lighthouse per podstrona.
2. Desk research (skill `product-discovery:desk-research`): frazy, SERP, konkurenci, odpowiedzi AI.
3. Gdzie umieścić markę: katalogi, profile, media, partnerzy.

Wynik: `kono-state/notes/audyt-seo.md` + rejestr źródeł `kono-state/notes/audyt-seo-zrodla.md`.

## Stan (2026-11-22)

Raport gotowy, PR #29 do przeglądu. Zmiany wyłącznie w `kono-state/` (3 pliki), kod bez zmian.

## Wynik

- Lighthouse 13.6.0, 11 stron × 3 przebiegi (Linux, Node v22.23.5, build `43efbf5` bez klucza Turnstile,
  konfiguracja tymczasowa poza repo): SEO 100 na 11 z 11; wydajność 95–100 na 10 stronach, `index.html` 75
  (przebiegi 75, 79, 71; LCP 3,9 s, TBT 497 ms); dostępność 96–100; CLS 0,121 i 0,133 na dwóch stronach.
- Produkcja (22.11.2026): 11 z 11 adresów z sitemapy 200; `http` i `www` → 301; 3 sprawdzone stare adresy 301
  w jednym skoku; CSP bez `clarity.ms` (krok 2 wdrożenia T-022 niewykonany).
- Linkowanie: menu i stopka prowadzą do 1 z 9 podstron; dwa poradniki mają po 3 strony linkujące i żadnego
  linku ze strony głównej.
- Desk research: 3 strumienie, 119 operacji sieciowych, 13 błędów dostępu. Wyszukiwarka działa z USA, więc
  wyniki nie są pozycjami w google.pl. Wolumenów fraz nie podano: brak danych.
- Marka: zero trafień własnych na `revagy` i `revagy.pl`; jedyne wystąpienie to publiczne repozytorium;
  istnieje Revagy, LLC w USA (poprawia rozdział 4 noty z 20.11.2026).

## Testy

- `npm ci`, `npm run build`: 12 stron, `llms.txt` dla 11 stron.
- `npm run test:lighthouse` z konfiguracją dla 11 stron: wynik wyżej. Kod wyjścia 1, bo `index.html` jest
  poniżej progu 90 przyjętego dla podstron; ta strona nie jest objęta progiem w `tools/lighthouse.json`.
- `check:dist`, `test:smoke`, `test:form`, `test:tools`: **nieuruchomione**, bo kod się nie zmienił.

## Zablokowane

Brak dostępu do Google Search Console i Bing Webmaster Tools: indeksacja, zapytania, pozycje, Core Web Vitals
od użytkowników i linki przychodzące nie są ocenione (rozdział 7 raportu, lista potrzebnych eksportów).

## Do decyzji właściciela

- Repozytorium publiczne czy prywatne (dziś to jedyne wystąpienie marki w wynikach wyszukiwania).
- Profil firmy w Google: wytyczne wykluczają firmy działające wyłącznie zdalnie.
- Plan 30/60/90 dni z raportu: każda pozycja w kodzie wymaga osobnej karty i zgody.
