---
id: T-024
title: Raport — jak REVAGY ma mówić do grupy docelowej i o jakie produkty rosnąć
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/serene-bohr-2hdmui
base: main (43efbf5)
depends_on: —
pr: https://github.com/dskibickikono-lang/RevAGY/pull/33 (baza main)
sha: 8ac8f3b36b4c0e688b8ca639f045c64bf528c6f0 (raport i materiał dowodowy; kolejne commity zmieniają tylko kartę)
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

## Wynik (2026-11-22)

- Raport: `kono-state/notes/komunikacja-i-oferta.md`. Materiał dowodowy: `kono-state/notes/komunikacja-i-oferta/kwerenda/`
  (raport z kwerendy, 149 cytatów ze 148 doświadczeń 145 autorów) i `oceny/` (karta ocen PRES, 12 kandydatów).
- Ustalenia w próbie 148 doświadczeń: koszt i ryzyko wdrożenia 43, uzależnienie od dostawcy 30, ręczne
  przepisywanie 29, KSeF 24, nieufność do AI 14.
- Ranking PRES: K01 (kolejka faktur kosztowych), K02 (godziny i umowy do kadr i płac), K07 (raport bez ręcznych
  eksportów) po 16 na 20; K06 14; K03 i K09 po 13; K04, K05, K08, K11, K12 po 12; K10 10.
- Superzdanie: robocze, ocena „small business / service”.

## Testy

Nie uruchamiano i nie dotyczy: zmiana obejmuje wyłącznie `kono-state/`, które CI pomija. `git diff origin/main -- src public`
jest pusty. Cytaty w raporcie głównym sprawdzone skryptem jako dosłowne fragmenty wpisów z `quotes.csv`.

## Do decyzji właściciela

1. Odpowiedzi na siedem pytań z rozdziału 4 raportu (superzdanie zostaje robocze do tego czasu).
2. Przegląd ocen PRES i wybór kandydatów. Rekomendacja agenta (K02, potem K01, K07 jako pilot Enterprise) nie jest wyborem.
3. Czy pobranie publicznych stron forów GOFIN i Wykop zwykłym zapytaniem, po odmowie narzędzia do czytania stron, jest
   dopuszczalne. Jeśli nie, 120 ze 149 cytatów trzeba wyłączyć i zebrać dowody z innych źródeł.
4. Czy którykolwiek przykład „po” z przewodnika tonu ma wejść na stronę. Każdy wymaga osobnej karty (D-015, D-021,
   D-023); wstęp strony głównej jest opisem marki z D-014.

## Otwarte

- Kontakt z ludźmi (10 konsultacji poza grupą jako test superzdania) to propozycja; wymaga osobnej zgody.
- Dane z CRM o tym, kto przychodzi na konsultacje, nie były czytane: brak wskazania lejka i zgody.
