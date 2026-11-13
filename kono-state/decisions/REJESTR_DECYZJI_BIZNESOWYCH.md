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

## Zasady stałe (z reguły pracy KONO, nie są decyzjami z tego repo)

- Merge robi wyłącznie właściciel.
- Wdrożenia, SSH i zmiany na hostach wymagają osobnej zgody właściciela.
- Praca na własnej gałęzi, bez `--force` i bez rebase opublikowanych gałęzi.
- Bez sekretów w kodzie, logach i odpowiedziach.

## Otwarte kwestie (do decyzji właściciela)

- Prawdziwe dane do strony: liczby, klienci, opinie, cennik, dane kontaktowe i rejestrowe firmy. W prototypie są oznaczone jako przykładowe.
- Docelowy hosting i domena.
