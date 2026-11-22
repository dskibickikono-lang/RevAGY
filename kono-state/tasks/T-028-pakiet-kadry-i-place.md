---
id: T-028
title: Pakiet K02 — kadry i płace bez ręcznego wpisywania (opis pakietu i podstrona /kadry-i-place.html)
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/serene-bohr-2hdmui
base: main (da8d1ae)
depends_on: T-024
pr: —
sha: —
decisions: [D-015, D-017, D-019, D-021, D-022, D-025, D-028, D-031, D-032, D-033, D-034, D-041, D-043, D-044, D-045]
---

# T-028 — Pakiet K02: kadry i płace

## Cel

Pierwszy pakiet do portfolio wybrany przez właściciela (D-045): godziny, premie i dane umów trafiają do programu
kadrowo-płacowego bez ręcznego wpisywania. Właściciel zaakceptował 22.11.2026 kroki 1–2 planu z karty T-024
(„akceptuję kroki 1–2, cena po audycie, stała”).

## Zakres

1. Opis pakietu: `kono-state/notes/pakiet-kadry-i-place.md` (zakres stały, granice, kryterium sukcesu, dostępy, opieka).
2. Nowa podstrona `/kadry-i-place.html` na układzie `PodstronaLayout` (D-031), z miejscem na film w stanie „kadr”
   (D-022), bez nazw własnych systemów (D-033), cena „po audycie, stała” (D-041).

## Granice

- Strona główna i pozostałe podstrony bez zmian (D-015, D-021). Menu i stopka nie dostają odnośnika do nowej strony:
  to zmiana układów wspólnych i strony głównej, wymaga osobnej decyzji właściciela.
- Bez kwot pakietu i opieki: właściciel wybrał „cena po audycie, stała”.
- Bez nowych liczb o REVAGY. Opis wdrożenia powtarza treść i liczby ze strony `/wdrozenia.html` (D-034).
- Kroki 3–5 planu (dane do opisu wdrożenia, przesunięcie tematów treści, test popytu) nie są objęte tą kartą.

## Ustalenia agenta, na które właściciel nie odpowiedział wprost

- Adres i tytuł strony ustalił agent, jak w D-038: `/kadry-i-place.html`, „Kadry i płace bez ręcznego wpisywania”.
- Strona mówi „50–250 osób”, bo jest nową treścią sprzedażową (D-044). Strona `dla-firm` zostaje przy „5–250 osób”.
