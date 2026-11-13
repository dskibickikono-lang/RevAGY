---
id: T-001
title: Prototyp strony REVAGY (automatyzacja i AI w B2B)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-13
updated: 2026-11-13
branch: skibiai/fervent-curie-08fzzz
pr: "(uzupełniane po otwarciu PR)"
sha: "(uzupełniane po commicie)"
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

## Weryfikacja

Uzupełniane na końcu pracy (sekcja „Wynik testów”).

## Otwarte

- Podmiana danych przykładowych na prawdziwe (liczby, klienci, cennik, dane firmy, kontakt).
- Podłączenie formularza (dziś niczego nie wysyła).
- Decyzja o hostingu i domenie; wdrożenie wymaga osobnej zgody właściciela.
- Merge: wyłącznie właściciel.
