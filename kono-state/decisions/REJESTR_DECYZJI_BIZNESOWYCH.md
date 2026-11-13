# Rejestr decyzji biznesowych — REVAGY

Źródło prawdy dla decyzji właściciela. Każdy agent czyta ten plik przed pracą i stosuje go bez podważania.
Nowe decyzje dopisujemy na końcu; zmiana decyzji to nowy wpis ze wskazaniem, który zastępuje.

Rejestr założony 2026-11-13 w ramach T-001 (wcześniej nie istniał w tym repo). Wpisy poniżej odtwarzają
decyzje właściciela z rozmowy startowej; nic tu nie zostało dopisane ponad to, co właściciel powiedział.

| ID | Data | Decyzja | Źródło | Status |
|----|------|---------|--------|--------|
| D-001 | 2026-11-13 | REVAGY to firma zajmująca się automatyzacją i wdrażaniem AI w B2B. To jest przedmiot sprzedaży na stronie. | właściciel, rozmowa startowa T-001 | obowiązuje |
| D-002 | 2026-11-13 | Prototyp strony odwzorowuje wiernie układ, animacje i użycie filmów ze strony Revolut Business „konta wielowalutowe” (revolut.com/pl-PL/business/multi-currency-accounts). | właściciel, rozmowa startowa T-001 | obowiązuje |
| D-003 | 2026-11-13 | Strony wzorcowej nie kopiujemy: żadnych zasobów, tekstów, logotypów ani filmów Revoluta. Robimy własną, „taką samą” w układzie i ruchu. | właściciel („Nie kopiuj jej. Zrób swoją taką samą”) | obowiązuje |
| D-004 | 2026-11-13 | Repo `RevAGY` i środowisko chmurowe sesji należą do agenta (kanał pm-local). Brakujące elementy (kono-state, rejestr, karty zadań) agent tworzy sam. | właściciel („to repo jest twoje, te środowisko jest twoje”) | obowiązuje |
| D-005 | 2026-11-13 | Wygląd prototypu z T-001 jest zatwierdzony jako docelowy wygląd strony. | właściciel („Dokładnie tak chcę żeby wyglądała moja strona”) | obowiązuje |
| D-006 | 2026-11-13 | Domena strony to `revagy.pl`. Wdrożenie wykonuje agent na VPS Ubuntu właściciela według promptu z repo. | właściciel („Wykupiłem właśnie domenę revagy.pl”) | obowiązuje |
| D-007 | 2026-11-13 | Nazwa firmy na stronie pozostaje REVAGY. Dane rejestrowe (NIP, REGON, adres, właściciel) pochodzą ze zdjęcia przekazanego przez właściciela. | właściciel („Nazwa firmy pozostaje REVAGY”, „Dane firmy w zdjęciu”) | obowiązuje |
| D-008 | 2026-11-13 | Strona ma mieć darmową analitykę: skąd wchodzą odwiedzający, co klikają, ile czasu spędzają, z jakich IP i przeglądarek. | właściciel | obowiązuje |
| D-009 | 2026-11-13 | Wartości domyślne z planu T-002 przyjęte bez zmian: kontakt `kontakt@revagy.pl`, liczby na stronie bez zmian, pakiety bez cen. | właściciel („Akceptuję”) | obowiązuje |

## Zasady stałe (z reguły pracy KONO, nie są decyzjami z tego repo)

- Merge robi wyłącznie właściciel.
- Wdrożenia, SSH i zmiany na hostach wymagają osobnej zgody właściciela.
- Praca na własnej gałęzi, bez `--force` i bez rebase opublikowanych gałęzi.
- Bez sekretów w kodzie, logach i odpowiedziach.

## Otwarte kwestie (do decyzji właściciela)

- Opinie klientów i cennik: brak danych, na stronie ich nie ma.
- Analityka bez zgody odwiedzającego: przyjęte rozwiązanie zapisuje kliknięcia i czas dopiero po zgodzie
  w banerze (wybór agenta, D-008 tego nie rozstrzyga). Zmiana wymaga decyzji właściciela.
- Wpis w rejestrze firm pokazuje działalność jako zawieszoną od 2026-02-01.
