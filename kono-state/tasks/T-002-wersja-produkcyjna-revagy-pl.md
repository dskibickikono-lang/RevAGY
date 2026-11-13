---
id: T-002
title: Wersja produkcyjna strony i przygotowanie wdrożenia revagy.pl
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-13
updated: 2026-11-13
branch: skibiai/fervent-curie-08fzzz
pr: https://github.com/dskibickikono-lang/RevAGY/pull/1
sha: "(uzupełniane po commicie)"
decisions: [D-005, D-006, D-007, D-008, D-009]
depends_on: T-001
---

# T-002 — Wersja produkcyjna i przygotowanie wdrożenia revagy.pl

## Cel

Dokończyć stronę zatwierdzoną w T-001 tak, żeby nadawała się do publikacji pod `revagy.pl`, dodać
darmową analitykę (wejścia, kliknięcia, czas, IP, user agent) i przygotować prompt dla agenta na VPS,
który wykona wdrożenie. Samo wdrożenie wykonuje agent właściciela na jego serwerze, nie ta sesja.

## Zakres wykonany

- **Domena:** adres kanoniczny, metadane do udostępniania z własną grafiką 1200×630, `robots.txt`,
  `sitemap.xml`, `site.webmanifest`, komplet ikon (`tools/render-images.cjs`).
- **Dane firmy:** stopka i polityka prywatności z danymi ze zdjęcia właściciela (bez numeru rachunku).
- **Kontakt:** zamiast formularza adres `kontakt@revagy.pl` z przyciskiem „Umów audyt” i kopiowaniem.
  Strona nie przyjmuje danych na serwer.
- **Analityka:** `site/assets/js/analytics.js` + baner zgody. Po zgodzie Matomo (własny serwer,
  `stats.revagy.pl`) zapisuje odsłony, źródło wejścia, każde kliknięcie z nazwą sekcji, widoki i czas
  sekcji, głębokość przewinięcia, aktywny czas, ustawienia kalkulatora, IP i przeglądarkę.
  Bez zgody działają tylko logi nginx (IP, user agent, adres), raportowane przez GoAccess.
- **Podstrony:** `polityka-prywatnosci.html`, `404.html`.
- **Wdrożenie:** `deploy/` — konfiguracja nginx (HTTPS, przekierowania, CSP i nagłówki, cache),
  Matomo w Dockerze, raport GoAccess za hasłem, rotacja logów 90 dni, skrypt wydania z szybkim powrotem,
  `deploy/PROMPT-AGENT-VPS.md`.
- **Test:** `tools/smoke-test.cjs` (37 sprawdzeń).

## Wynik testów

Uzupełniane na końcu pracy.

## Otwarte (po stronie właściciela)

- Merge PR #1, potem przekazanie promptu agentowi na VPS.
- DNS: rekordy A dla `revagy.pl`, `www` i `stats` na adres VPS; poczta dla `kontakt@revagy.pl`.
- Instalator Matomo w przeglądarce (konto administratora) i dwa ustawienia prywatności opisane w prompcie.
- Wpis w rejestrze firm pokazuje działalność jako zawieszoną od 2026-02-01. Do rozstrzygnięcia przed
  rozpoczęciem sprzedaży przez stronę.
- Polityka prywatności to projekt do przejrzenia przez prawnika.
