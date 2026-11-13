---
id: T-001
title: Prototyp strony REVAGY (automatyzacja i AI w B2B)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-13
updated: 2026-11-13
branch: skibiai/fervent-curie-08fzzz
pr: https://github.com/dskibickikono-lang/RevAGY/pull/1
sha: e707691815be27da788512b59f0f979de485b75e
decisions: [D-001, D-002, D-003, D-004]
---

# T-001 — Prototyp strony REVAGY

## Cel

Prototyp strony firmy REVAGY (automatyzacja i wdrażanie AI w B2B), który wiernie odwzorowuje układ,
animacje i użycie filmów ze strony Revolut Business „konta wielowalutowe”, bez kopiowania jej zasobów
i treści (D-002, D-003). Przedmiot sprzedaży: wdrożenia automatyzacji i AI dla B2B (D-001).

## Zakres wykonany

- `site/` — statyczna strona, 12 sekcji: nagłówek z rozwijanym menu, hero z filmem, liczby z licznikami,
  siatka kart z animowanymi makietami i filmem, kalkulator zwrotu, proces „sticky scroll”, karuzela
  zastosowań, przewijany pasek integracji, film z agentem, pakiety z przełącznikiem, bezpieczeństwo,
  FAQ, CTA z formularzem, stopka.
- 3 własne filmy (`hero-flow`, `agent-demo`, `dashboard`) w `.webm` i `.mp4` z plakatami, nagrane ze scen
  w `tools/scenes/` skryptem `tools/render-videos.cjs`.
- Fonty na licencji SIL OFL 1.1 hostowane lokalnie; zero zależności zewnętrznych w czasie działania.
- `kono-state/` — rejestr decyzji i ta karta (wcześniej nie istniały w repo).

## Odstępstwa od planu

- Sekcja opinii zastąpiona sekcją „Bezpieczeństwo”: nie ma prawdziwych opinii klientów, a zmyślonych
  nie publikujemy.
- Pakiety bez cen („Wycena po audycie”): brak cennika w rejestrze decyzji.
- Wzorzec odtworzony z pamięci układu: strona Revoluta zwraca automatom 403 (bot-check), którego nie
  obchodziliśmy. Zgodność sekcja po sekcji nie była porównana z żywą stroną.

## Wynik testów

Przebieg na Linuksie, Chromium przez Playwright, na commicie `e707691`:

- Interakcje: 15 z 16 sprawdzeń przechodzi (menu rozwijane i mobilne, kalkulator zgodny ze wzorem,
  sticky scroll, karuzela, pasek integracji, przełącznik pakietów, FAQ, walidacja formularza,
  brak błędów JS na desktopie i telefonie).
- Jedno sprawdzenie nie przeszło z powodu błędu w samym teście: zakładał, że po bardzo szybkim
  przewinięciu wszystkie sekcje są już odkryte, a sekcje odkrywają się dopiero po wejściu w kadr.
  Osobny przebieg potwierdził: po przewinięciu przez stronę odkryte są 23 z 23 animowanych bloków.
- Pełne przejście strony na 1440, 768 i 390 px: 0 błędów konsoli, 0 nieudanych żądań,
  brak przewijania w poziomie.
- Filmy: 3 z 3 ładują się i odtwarzają.
- pytest: nie dotyczy, repo nie ma zestawu testów.
- Nie sprawdzono: Safari i Firefox, prawdziwe urządzenia mobilne, porównanie z żywą stroną wzorcową.

Podgląd (prywatny): https://claude.ai/artifact/Wwj4VPgZnfffYTn6dez9uP

## Otwarte

- Podmiana danych przykładowych na prawdziwe (liczby, klienci, cennik, dane firmy, kontakt).
- Podłączenie formularza (dziś niczego nie wysyła).
- Decyzja o hostingu i domenie; wdrożenie wymaga osobnej zgody właściciela.
- Merge: wyłącznie właściciel.
