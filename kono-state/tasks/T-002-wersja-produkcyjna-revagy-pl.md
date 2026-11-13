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
sha: 03c9fc5dce1b1308f78f1e0415f4b24ccabc9a14
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

Przebieg na Linuksie (Ubuntu 24.04, piaskownica sesji) na plikach z commita `03c9fc5`:

- **Test dymny na nginx 1.24 z konfiguracją z `deploy/`** (strona podana jako `https://revagy.pl`,
  certyfikat testowy): 37 z 37 sprawdzeń, 0 błędów, w tym brak naruszeń CSP.
- **Test dymny na zwykłym serwerze plików:** 32 z 33, 1 pominięte (własna strona 404 wymaga nginx).
- **Konfiguracja nginx:** `nginx -t` bez błędów; przekierowania http→https i www→domena główna,
  nagłówki bezpieczeństwa, typy plików, cache, kod 404 z własną stroną, 403 dla plików ukrytych,
  hasło na `/logi/`, tymczasowa blokada instalatora Matomo: wszystko zgodne z oczekiwaniem.
- **Matomo 5.14.2 z `deploy/matomo/docker-compose.yml`:** uruchomione, instalator przeprowadzony,
  pierwsza strona dostaje identyfikator 1. Prawdziwa wizyta ze zgodą zapisała w bazie 23 zdarzenia
  (kliknięcia, widoki sekcji, przewinięcie, kalkulator, czas sekcji), źródło kampanii i czas wizyty.
  Matomo zapisuje adres klienta przekazany przez nginx, nie adres kontenera.
- **Błąd znaleziony i naprawiony w trakcie:** po załadowaniu Matomo zdarzenia nie były wysyłane
  (zapisywała się tylko odsłona). Test dymny uzupełniony tak, żeby taki błąd wykrywał.
- **GoAccess 1.8.1 i logrotate:** skrypt raportu buduje raport, rotacja 90 dni bez błędów składni.
- pytest: nie dotyczy, repo nie ma testów w Pythonie.

Nie sprawdzono: wdrożenia na docelowym VPS, prawdziwego certyfikatu, serwera z IPv6, Safari i Firefoksa,
prawdziwych telefonów, przełącznika anonimizacji IP w panelu Matomo (domyślnie końcówka adresu jest zerowana).

## Otwarte (po stronie właściciela)

- Merge PR #1, potem przekazanie promptu agentowi na VPS.
- DNS: rekordy A dla `revagy.pl`, `www` i `stats` na adres VPS; poczta dla `kontakt@revagy.pl`.
- Instalator Matomo w przeglądarce (konto administratora) i dwa ustawienia prywatności opisane w prompcie.
- Wpis w rejestrze firm pokazuje działalność jako zawieszoną od 2026-02-01. Do rozstrzygnięcia przed
  rozpoczęciem sprzedaży przez stronę.
- Polityka prywatności to projekt do przejrzenia przez prawnika.
