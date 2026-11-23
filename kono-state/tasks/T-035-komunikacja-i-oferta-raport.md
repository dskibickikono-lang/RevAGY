---
id: T-035
former_id: T-024
title: Raport — jak REVAGY ma mówić do grupy docelowej i o jakie produkty rosnąć
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-22
updated: 2026-11-23
branch: skibiai/serene-bohr-2hdmui
base: main (43efbf5 runda 1, 5bac11d runda 2)
depends_on: —
pr: https://github.com/dskibickikono-lang/RevAGY/pull/33 (runda 1, scalony do main, 5bac11d), https://github.com/dskibickikono-lang/RevAGY/pull/36 (rundy 2–4, scalony do main, 5e29276)
sha: 8ac8f3b36b4c0e688b8ca639f045c64bf528c6f0 (runda 1), a8d9e3cc4b9217e9aad368f1d40a175cd584d0dc (runda 2; kolejne commity zmieniają tylko kartę)
decisions: [D-001, D-015, D-016, D-017, D-018, D-019, D-020, D-021, D-028, D-029, D-030, D-033, D-034, D-041, D-042, D-043, D-044, D-045]
---

# T-035 — Komunikacja i oferta: raport

Wcześniej T-024, przenumerowana 22.11.2026 z powodu kolizji z T-024 (baner zgody, PR #28). W PR #33 i #36,
w commitach i w odpowiedziach do decyzji D-041…D-045 karta występuje jako T-024 (rejestr ma przy nich dopisek „wcześniej T-024”).

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

## Runda 2 (2026-11-22): odpowiedzi właściciela

PR #33 scalony przez właściciela do `main` (5bac11d). Właściciel odpowiedział na siedem pytań z rozdziału 4.

- Raport: nowy rozdział 0 z odpowiedziami, szacunkiem przepustowości, superzdaniem w wersji 2 i rankingiem w wersji 2.
  Nazw klientów i kwot nie ma w repozytorium (publiczne, D-034).
- Karta ocen PRES, wersja 2: zmiana osi Strategic fit dla K07 (5 → 4), K03 (3 → 4) i K11 (4 → 5). Ranking: K01 i K02
  po 16, K07 15, K03 i K06 po 14, K09 i K11 po 13, K04, K05, K08, K12 po 12, K10 10.
- Rejestr decyzji: dopisane D-041 (stała cena wdrożenia), D-042 (wstępnie najpierw firmy 5–250 osób), D-043 (większe
  projekty niż proste automatyzacje). Brzmienie wpisów do sprawdzenia przez właściciela.
- Superzdanie: ocena bez zmian („small business / service”); czeka na jedno potwierdzenie brzmienia.

## Do decyzji właściciela po rundzie 2

1. Superzdanie: zostaje dla firm 5–250 osób czy zawężamy do 50–250 osób (to zawęża D-016).
2. Wybór kandydatów z rankingu. Rekomendacja agenta: K02, potem K01, z opieką o stałej miesięcznej cenie.
3. Potwierdzenie liczby wdrożeń od maja: **45 wdrożeń** (potwierdzone przez właściciela 22.11.2026; w repozytorium opisano anonimowo 5).
4. Sprawy z rundy 1: sposób dostępu do forów GOFIN i Wykop w celach badania rynku wewnętrznego zaakceptowany przez właściciela 22.11.2026.

## Stan

Raport i kwerenda zakończone, liczba wdrożeń potwierdzona (45), pakiet K02 wybrany i wdrożony w repozytorium na main (T-034; czeka na deploy na VPS). Raport scalony do main w PR #33 (5bac11d) i #36 (5e29276). Karta zamknięta.
Punkty z sekcji „Otwarte” (konsultacje poza grupą jako test superzdania, dane z CRM o konsultacjach) pozostają
otwarte; każdy wymaga osobnej zgody właściciela.

Testy rundy 2: nie uruchamiano i nie dotyczy (tylko `kono-state/`, CI pomija). Sumy PRES przeliczone skryptem.

## Runda 3 (2026-11-22): decyzja o grupie

Właściciel: „50–250 osób”. Dopisane D-044. Superzdanie potwierdzone dla firm 50–250 osób, ocena bez zmian
(„small business / service”). Karta ocen PRES w wersji 3: zmieniona populacja, oceny bez zmian. Teksty strony z zakresem
„5–250 osób” nie były ruszane; ich zmiana wymaga osobnej decyzji i karty. Punkt 1 z listy „Do decyzji właściciela po
rundzie 2” jest zamknięty. Testy: nie dotyczy (tylko `kono-state/`).

## Runda 4 (2026-11-22): wybór pakietu i poprawka numerów decyzji

- Właściciel wybrał K02 (kadry i płace) jako pierwszy pakiet do portfolio: D-045.
- Poprawka numerów: wpisy z rund 2 i 3 dostały numery D-040–D-043, a na `main` numer D-040 zajął w tym czasie wpis
  o banerze zgody z innej karty. Wpisy tej karty mają teraz numery D-041 (stała cena), D-042 (kolejność torów), D-043
  (większe projekty), D-044 (firmy 50–250 osób). Treść wpisów bez zmian.
- Błąd agenta w tej rundzie: commit e3c0808 wyzerował przez pomyłkę w skrypcie cztery pliki (raport, kartę ocen, dane
  ocen, tę kartę). Kolejny commit przywraca je z 8525396 i nanosi zmiany. Bez `--force`, historia zostaje.
- Uwaga dla właściciela: w `kono-state/tasks/` są trzy karty z numerem T-024 (ta, audyt designu, baner zgody),
  założone równolegle w różnych sesjach. Tej karty nie przenumerowuję bez decyzji.
  **Stan:** przenumerowana na T-035 22.11.2026 (opis pod tytułem karty).
- Następny krok: plan pakietu K02 przedstawiony właścicielowi do akceptacji; bez zmian w kodzie do tego czasu.
