---
id: T-024
title: Raport — jak REVAGY ma mówić do grupy docelowej i o jakie produkty rosnąć
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/serene-bohr-2hdmui
base: main (43efbf5)
depends_on: —
pr: —
sha: —
decisions: [D-001, D-015, D-016, D-017, D-018, D-019, D-020, D-021, D-028, D-029, D-030, D-033, D-034]
---

# T-024 — Komunikacja i oferta: raport

## Cel

Odpowiedzieć na dwa pytania właściciela: jak REVAGY ma mówić do grupy docelowej i o jakie produkty albo
usługi rosnąć. Wyłącznie raport. Treści strony (`src/`, `public/`) nie zmieniają się ani o znak.

## Zakres

1. Opis obecnego tonu, obietnicy i segmentów na podstawie treści w `src/`.
2. Kwerenda publicznych wypowiedzi klientów z tych segmentów (fora, opinie, LinkedIn, grupy branżowe):
   cytaty dosłowne ze źródłami.
3. Superzdanie: zmiana u klienta i mechanizm. Pytania do właściciela w jednej paczce.
4. 8–12 kandydatów na nowe produkty i usługi z oceną PRES (Pain, Reach, Evidence, Strategic fit).

## Wynik

- `kono-state/notes/komunikacja-i-oferta.md` — raport główny: persony z dowodami, przewodnik tonu z przykładami
  przed/po na akapitach ze strony, tematy treści na 3 miesiące, ranking produktów.
- `kono-state/notes/komunikacja-i-oferta/` — materiał dowodowy: raport z kwerendy, lista cytatów (CSV),
  widok HTML, karta ocen PRES z danymi wejściowymi.

## Granice

- Decyzje D-016 (dwa tory oferty), D-017, D-019 (konsultacja → audyt → wdrożenie) i D-033 (bez nazw własnych
  systemów na stronie) są założeniem raportu, nie przedmiotem oceny.
- Propozycje „po” w przewodniku tonu to przykłady w raporcie. Wejście któregokolwiek zdania na stronę wymaga
  osobnej decyzji właściciela i osobnej karty (D-015, D-021, D-023).
- Bez nowych liczb o REVAGY. Liczby w raporcie pochodzą ze strony albo ze wskazanych źródeł zewnętrznych.
