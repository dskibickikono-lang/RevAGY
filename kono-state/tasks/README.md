# Karty zadań: numeracja

- Numer karty bierze się z `origin/main` tuż przed pierwszym commitem karty: `git fetch origin main`, potem kolejny
  wolny numer po najwyższym `T-…` w `kono-state/tasks/` na `main`.
- Przy kilku sesjach naraz dwie karty mogą dostać ten sam numer. Wtedy zmienia numer karta scalona później,
  a w jej treści zostaje zdanie, pod jakim numerem występuje w starszych PR i commitach.

## Stan na 28.11.2026

Statusy: `zmergowane` = PR scalony do main; `wdrozone` = karta ma dowód wydania na produkcję. W nawiasie SHA merge’a.

| Numer | Karta | Status | PR (merge) | Uwaga |
|---|---|---|---|---|
| T-001 | Prototyp strony REVAGY | zmergowane | #1 (dc82217) |  |
| T-002 | Wersja produkcyjna i przygotowanie wdrożenia revagy.pl | zmergowane | #1 (dc82217) |  |
| T-003 | Migracja 1:1 do Astro (static) | zmergowane | #2 (9f8c86f) |  |
| T-004 | Poprawka hardeningu wydania po review PR #2 | zmergowane | #2 (9f8c86f) | Karta założona wstecz 23.11.2026 |
| T-005 | Build w CI i artefakt wydania, VPS bez Node | zmergowane | #3 (899e85f, do `migration/astro-static`), #4 (d3b253e) | Do main razem z PR #2 |
| T-006 | Rozpoznawalność marki: JSON-LD, llms.txt, boty AI | zmergowane | #6 (47d7d86) |  |
| T-007 | CI: `PUBLIC_TURNSTILE_SITEKEY` w buildzie | zmergowane | #7 (dc984b6) | Karta założona wstecz 23.11.2026 |
| T-008 | Etap 0: prawda na stronie | wdrozone | #9 (9414a0b) |  |
| T-009 | Etap 1: integracja systemów | wdrozone | #10 (d7016c0) |  |
| T-010 | Etap 2: wdrożenia | wdrozone | #11 (f346d24) |  |
| T-011 | Etap 3: dla firm | wdrozone | #12 (0aee686) |  |
| T-012 | Etap 4: dane i bezpieczeństwo | wdrozone | #13 (d5d3458) |  |
| T-013 | Etap 5: produkcja i logistyka | wdrozone | #14 (9d7ae32) |  |
| T-014 | Etap 6: poradniki | wdrozone | #15 (e9e3a03) |  |
| T-015 | Film F1: integracja systemów | wdrozone | #17 (e2743c2) |  |
| T-016 | Etap 7: przekierowania | wdrozone | #16 (1470166) |  |
| T-017 | Film F2: wdrożenia | wdrozone | #18 (c3c64c9) |  |
| T-018 | Film F3: dla firm | wdrozone | #19 (b15bdff) |  |
| T-019 | Film F4: dane i bezpieczeństwo | wdrozone | #20 (c6582f2) |  |
| T-020 | Film F5: produkcja i logistyka | wdrozone | #21 (5fe5c29) |  |
| T-021 | Etap 8: finanse | wdrozone | #24 (0e72e39) |  |
| T-022 | Bing Webmaster Tools, IndexNow, Clarity za zgodą | wdrozone | #23 (a3ce70d) |  |
| T-023 | Film F6: finanse | wdrozone | #25 (1002463), #26 (43efbf5) |  |
| T-024 | Baner zgody: zdanie o Microsoft Clarity | wdrozone | #28 (7cd0f71) | Jedyna karta T-024 od 22.11.2026 (raport komunikacji to T-035) |
| T-025 | Audyt SEO i pozycjonowania marki | zmergowane | #29 (9856b6f), #31 (28a02ab), #44 (fd74f92) | D-051 i D-052 wpisane. Karta zamknięta. Punkty „Nadal zablokowane” otwarte |
| T-026 | Audyt designu i identyfikacji | zmergowane | #32 (2cd36d0), #34 (ccc9b71), #38 (a653e8a), #43 (db6ce54) | Założona jako T-024. D-050 wpisane. Karta zamknięta |
| T-027 | astro.config: adres bazowy i schemat zmiennej | zmergowane | #37 (da8d1ae) |  |
| T-028 | Audyt kodu strony | zmergowane | #35 (3e87a2e) | W PR #35 i #37 oraz w commitach występuje jako T-025 |
| T-029 | Etap 2 po audycie kodu: Matomo, nginx, kontrola produkcji | zmergowane | #40 (7b6fc4c), #43 (db6ce54) | Kroki serwerowe czekają na wdrożenie na VPS. Karta zamknięta |
| T-030 | Etap 3 po audycie kodu: skrót treści w adresach zasobów | zmergowane | #40 (7b6fc4c), #43 (db6ce54) | Karta zamknięta |
| T-031 | Etap 5 po audycie kodu: formularz, dostępność, testy | zmergowane | #40 (7b6fc4c), #43 (db6ce54) | Karta zamknięta |
| T-032 | Etap 9: sprzedaż | zmergowane | #41 (6a2efde), #45 (9173c09) | W pierwszych commitach jako T-027. Wszystkie 11 decyzji zamknięte 23.11.2026 w PR #45. D-053 wpisane. Karta zamknięta |
| T-033 | Kierunek A, pilot sceny na /integracja-systemow.html | zmergowane | #38 (a653e8a), #43 (db6ce54) | W PR #38 jako T-031. Karta zamknięta |
| T-034 | Pakiet K02: kadry i płace | zmergowane | #39 (ca9b92b), #43 (db6ce54) | W PR #39 jako T-028; menu: D-049. Karta zamknięta |
| T-035 | Raport: komunikacja i oferta | zmergowane | #33 (5bac11d), #36 (5e29276), #45 (9173c09) | Wcześniej T-024. K02 wdrożone na main (T-034; czeka na deploy na VPS). Karta zamknięta |
| T-036 | Dane wdrożeń i scena dowodu „Agencja pracy” (A2) | wdrozone | #48 (682e99d) | Wydanie 04c3a27 (T-040) |
| T-037 | Kierunek A, A3: scena pierwszego ekranu na 9 podstronach | wdrozone | #49 (b4bef98) | Wydanie 04c3a27 (T-040) |
| T-038 | Sceny dowodu: kadry, produkcja, zdanie ujawnienia | wdrozone | #50 (2db89d4) | Wydanie 04c3a27 (T-040) |
| T-039 | Baner zgody, fokus, kroje z wyprzedzeniem | wdrozone | #51 (04c3a27) | Wydanie 04c3a27 (T-040) |
| T-040 | Wydanie 04c3a27 na revagy.pl, zapis wydania 9173c09 | wdrozone | #52 (a57991f) | Wydanie 27.11.2026, kontrola produkcji zielona |
| T-041 | Wydanie 1454c57 na revagy.pl (PR #53, PR #54) | wdrozone |  | Wydanie 28.11.2026, 72/72 pliki zgodne z manifestem, kontrola produkcji zielona |
