---
id: T-016
title: Etap 7 — przekierowania starych adresów na nowe podstrony (D-037) i README po rozbudowie
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-7-przekierowania
base: feat/etap-6-poradniki (fd7a45f)
depends_on: T-014
pr: https://github.com/dskibickikono-lang/RevAGY/pull/16 (baza feat/etap-6-poradniki)
sha: 31ac29e3498b7086c6c68940cb4c8da715100c46 (zmiana; commit z tym wpisem zmienia tylko kartę)
decisions: [D-037]
---

# T-016 — Etap 7: przekierowania i README

## Cel

Stare adresy wycofanej odsłony prowadzą na nowe podstrony tam, gdzie nowa strona odpowiada staremu
adresowi (D-037). Pozostałe zostają na stronie głównej.

## Zakres

1. `deploy/nginx/revagy.pl.conf`, blok stałych przekierowań:

   | Stary adres | Było | Jest |
   |---|---|---|
   | `/oferta.html` | `/#pakiety` | `/dla-firm.html` |
   | `/bezpieczenstwo.html` | `/#bezpieczenstwo` | `/dane-i-bezpieczenstwo.html` |
   | `/realizacje.html` | `/` | `/wdrozenia.html` |
   | `/realizacje/grupa-kono.html` | `/` | `/wdrozenia.html` |
   | `/porownanie.html` | `/` | `/porownanie-rozwiazan.html` |
   | `/dla-produkcji-i-magazynow.html` | `/` | `/produkcja-i-logistyka.html` |
   | `/dla-agencji-pracy.html` | `/` | bez zmian (nie ma strony, która mu odpowiada) |
   | `/produkty/obieg-dokumentow.html` | `/` | bez zmian (nie ma strony, która mu odpowiada) |

   Plik ma końce linii CRLF; zmiana ich nie rusza.
2. `README.md`: tabela struktury opisuje obecne strony, układ podstron, pliki danych właściciela i narzędzia
   kontroli zamiast stron wycofanej odsłony.

Strona, style, skrypty i kontrakt są bez zmian.

## Wynik CI (2026-11-22)

Przebieg dla `31ac29e` (run 44968563202), zielony: `check:dist` 5 z 5 kroków, manifest
`bedff5a20ba8fc0381cd34db0dc122c682c6620777e28b8dee4d07b6aecda776` (ten sam co w etapie 6, bo strona się nie
zmienia), test dymny 187 z 188 bez błędów (1 pominięte jak w etapie 6), testy `wydanie.sh` 16 z 16.
CI nie sprawdza samych przekierowań: działają dopiero po podmianie pliku nginx na serwerze.

## Zmiana na serwerze (nie jest częścią tego PR)

- Wymaga `sudo` i osobnej zgody właściciela. Runbook wydania (`deploy/PROMPT-AGENT-VPS.md`) zakłada, że zwykłe
  wydanie nie zmienia plików nginx, więc to jest osobny, świadomy krok.
- Kolejność: najpierw wydanie strony, które zawiera wszystkie pięć stron docelowych, dopiero potem plik nginx.
  Odwrotnie stare adresy prowadziłyby do strony błędu.
- Przed podmianą porównać plik na serwerze z szablonem z `main` (`sha256sum`). Jeśli się różnią, przenieść tylko
  blok przekierowań. Po podmianie: `sudo nginx -t`, przeładowanie nginx, kontrola ośmiu adresów poleceniem
  `curl -sI` (kod 301 i nagłówek `Location`).
- Wycofanie: poprzednia wersja pliku i przeładowanie nginx.

## Do potwierdzenia przez właściciela

- Dwa adresy bez odpowiednika (`/dla-agencji-pracy.html`, `/produkty/obieg-dokumentow.html`) zostają na stronie
  głównej. Jeśli mają prowadzić gdzie indziej, potrzebna decyzja.
