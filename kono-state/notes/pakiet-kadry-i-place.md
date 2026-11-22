# Pakiet K02 — kadry i płace bez ręcznego wpisywania

Karta: T-034 · Data: 22.11.2026 · Podstawa: D-045 (wybór pakietu), D-044 (firmy 50–250 osób), D-041 (stała cena),
raport `komunikacja-i-oferta.md` (kandydat K02, persona P1).

Status: opis roboczy do akceptacji właściciela. Kwot nie ma, bo właściciel wybrał „cena po audycie, stała”.

## Dla kogo

- **Firma:** 50–250 osób, z osobnym działem kadr i płac albo z biurem, które prowadzi płace.
- **Kogo boli:** osobę z kadr i płac, która co miesiąc wpisuje godziny, premie i dane z umów do programu
  kadrowo-płacowego.
- **Kto płaci:** właściciel, dyrektor personalny albo dyrektor finansowy.
- **Sygnał, że to ten klient:** godziny albo premie przychodzą w arkuszach; te same dane pracownika są w dwóch
  systemach; korekty listy płac wracają co miesiąc.

## Co klient kupuje

Jeden przepływ na start, do wyboru na konsultacji:

1. **Godziny i premie:** z arkuszy o stałym układzie do programu kadrowo-płacowego.
2. **Umowy i dane pracownika:** z systemu HR albo z podpisanego dokumentu do programu kadrowo-płacowego.

W każdym przepływie:

- kontrola przed zapisem (pracownik w kartotece, okres, zakres godzin i stawki, sumy kontrolne numerów),
- pozycja, która nie przeszła kontroli, wraca do osoby z kadr z opisem, co się nie zgadza,
- wpis w dzienniku przy każdym zapisie: co, skąd, kiedy i poprzednia wartość,
- zapis drogą, którą wspiera dostawca programu (interfejs API, wymiana plików; z bazy tylko odczyt).

## Czego pakiet nie obejmuje

- Wymiany programu kadrowo-płacowego.
- Naliczania wynagrodzeń ani zatwierdzania listy płac: zostają w programie i u ludzi klienta.
- Pracy bez dostępu do systemów, których dotyczy przepływ.
- Programu bez eksportu, którego dostawca nie zgadza się na dostęp do danych. Mówimy to na konsultacji.
- Pilnowania terminów zezwoleń i innych dokumentów: to osobny proces (kandydat K06 z raportu).

## Ścieżka i cena

| Krok | Co klient dostaje | Cena |
|---|---|---|
| Konsultacja jednego procesu, 25 minut | Jednostronicowa karta procesu, zostaje u klienta | Bezpłatna (D-019) |
| Audyt procesu, 3–5 dni roboczych | Zakres i stała cena wdrożenia | 1 990 zł, w całości wliczane we wdrożenie, zwrot w 14 dni (D-028) |
| Wdrożenie | Działający przepływ; pierwsza integracja w 14 dni roboczych od dostępu do obu systemów (D-025) | Stała, podana po audycie, nie rośnie w trakcie (D-041) |
| Opieka | Monitoring przepływu, czas reakcji w umowie | Stała miesięczna, podana po audycie |

## Kryterium sukcesu

Mierzone tak samo przed startem i po wdrożeniu, w porównywalnym okresie płacowym. Wybieramy jedno albo dwa:

| Kryterium | Jak mierzymy |
|---|---|
| Czas wpisywania | Minuty od otwarcia arkusza albo dokumentu do zapisu w programie, w jednym okresie płacowym |
| Pozycje wpisane ręcznie | Liczba pozycji wpisanych ręcznie do programu w jednym okresie płacowym |
| Korekty | Liczba korekt listy płac albo danych pracownika, które wynikły z błędu przy wpisywaniu |
| Kontrola zapisów | Każdy zapis ma wpis w dzienniku; przepływ nie zapisuje niczego poza uzgodnionym zakresem (warunek konieczny) |

Progi ustalamy z klientem w audycie. Wyników z innych firm nie obiecujemy.

## Czego potrzebujemy od klienta

- Osoby, która zna proces i zatwierdza wyjątki.
- Osoby, która nada dostęp do programu kadrowo-płacowego i do źródła danych.
- Kilku typowych arkuszy albo dokumentów z zakrytymi danymi osobowymi.
- Podpisanej umowy powierzenia przed startem prac.

## Dowód, który już jest

Wdrożenie w agencji pracy, opisane na stronie `/wdrozenia.html`: ok. 12 godzin pracy kadr tygodniowo mniej, ok. 90%
mniej korekt, umowa w systemie po ok. 10 minutach zamiast po ok. 3 dniach. Opis jest anonimowy, a sposób pomiaru nie
jest jeszcze opisany (pola w `src/data/dowody.mjs` wypełnia właściciel, D-034).

## Głos klienta, do którego pakiet się odwołuje

Cytaty z kwerendy (`komunikacja-i-oferta/kwerenda/quotes.csv`): Q118 („oczopląsu i zawrotów głowy”), Q119 („muszę
z palca wpisywać i mam już tego serdecznie dość”), Q121 („musiałem wprowadzać ręcznie do programu
kadrowo-płacowego”), Q033 („Nie jestem w stanie korygować ręcznie”). Na stronie cytatów nie ma: nie mamy zgód autorów.

## Otwarte, do decyzji właściciela

1. Nazwa handlowa pakietu: **Auto Kadry i Płace** (ustalona przez właściciela 22.11.2026).
2. Pakiet stanowi dedykowane wdrożenie procesowe w ofercie B2B.
3. Zakres i minimalny okres opieki.
4. Odnośnik do strony pakietu w menu „Dla działów” i w stopce (zmienia układy wspólne i stronę główną).
