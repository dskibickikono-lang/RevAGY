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
| D-010 | 2026-11-17 | Strona zostaje na Astro (migracja z PR #2); w planie blogi i podstrony. Build wyłącznie w CI (GitHub Actions, Node 22), VPS dostaje gotowy artefakt i nie buduje — jak `web-skoben` i `web-skibilabs`. | właściciel („Astro zostaje zaraz wjeżdżamy z blogami i podstronami”, „Lecisz ze wszystkim”) | obowiązuje |
| D-011 | 2026-11-20 | Oficjalny profil marki poza stroną: `https://www.linkedin.com/company/revagy/`. Trafia do `sameAs` w danych strukturalnych i do `llms.txt` (`src/config/marka.mjs`). | właściciel (T-006) | obowiązuje |
| D-012 | 2026-11-20 | Informacja o zawieszeniu działalności od 2026-02-01 jest nieaktualna; działalność prowadzona. Zamyka otwartą kwestię z T-001. | właściciel („zawieszona nieaktualny”, T-006) | obowiązuje |
| D-013 | 2026-11-20 | Rozpoznawalność marki: wdrażamy dane strukturalne Organization/WebSite, `llms.txt` i `llms-full.txt` generowane przy buildzie oraz pomiar botów AI w logach serwera (wariant „B + krótka nota A” z T-006). | właściciel („B plus krótką notę z A”) | obowiązuje |
| D-014 | 2026-11-20 | Dane marki zgodne z profilem LinkedIn: opis marki = słowa właściciela z LinkedIn (pierwsze zdanie opisu + hasło), rok założenia 2021, telefon +48 504 037 538 publicznie w stopce strony, w JSON-LD i w `llms.txt`. Forma na LinkedIn: jednoosobowa działalność (nie „Partnership”). | właściciel („Dokładnie tak, zrób to wszystko”, T-006) | obowiązuje |
| D-015 | 2026-11-21 | Wygląd, animacje, wizualizacje, wideo i motyw strony głównej zostają w 100%. Rozbudowa idzie małymi etapami. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-016 | 2026-11-21 | Dwa tory oferty: pakiety dla firm 5–250 osób oraz Enterprise, czyli produkcja i logistyka. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-017 | 2026-11-21 | Pierwsza podstrona sprzedażowa: systemy bez przepisywania danych. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-018 | 2026-11-21 | Nazw własnych systemów nie ma w nagłówkach ani w opisach wdrożeń. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-019 | 2026-11-21 | Wejście: bezpłatna konsultacja jednego procesu, potem płatny audyt, potem wdrożenie. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-020 | 2026-11-21 | Wdrożenia do pokazania: cztery wskazane przez właściciela, każde z etykietą powiązania z grupą. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-021 | 2026-11-21 | Poprzednia przebudowa naruszyła układ strony głównej oraz kolory, krój i odstępy. To są kryteria odbioru każdego etapu. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-022 | 2026-11-21 | Każda nowa podstrona ma zarezerwowane miejsce na film. Filmy powstaną dopiero po zbudowaniu stron. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-023 | 2026-11-21 | Tabela zmian tekstu strony głównej (etap 0) zatwierdzona. Obejmuje także stronę kontaktu oraz przyciski w skróconych nagłówkach podstron i strony błędu. Odpowiedzi FAQ o miejscu danych i o koszcie audytu zmieniamy w całości. Nazwy zdarzeń analityki przy przyciskach e-mail zmieniamy razem z napisami. Zastępuje D-009 w zakresie tych tekstów, w tym nowej liczby „25 minut”. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-024 | 2026-11-21 | Stawka domyślna kalkulatora: 65 zł za godzinę (było 85 zł). Zastępuje D-009 w tym punkcie. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-025 | 2026-11-21 | „14 dni” podajemy z warunkiem: 14 dni roboczych od dnia, w którym mamy dostęp do systemów. Zastępuje D-009 w tym punkcie. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-026 | 2026-11-21 | Liczby „120+” i „60%” w pasku pod hero oraz czasy reakcji w pakietach zmieniamy. Zastępuje D-009 w tym punkcie. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-027 | 2026-11-21 | Firma w przykładowym ekranie: „POLPAK Sp. z o.o.” (było „Stalmet Sp. z o.o.”). Pisownia potwierdzona przez właściciela 21.11: P-O-L-P-A-K. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-028 | 2026-11-21 | Na stronie podajemy kwotę audytu 1 990 zł i zwrot w 14 dni. Zastępuje D-009 („pakiety bez cen”) w tym zakresie. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-029 | 2026-11-21 | Na stronie dla firm 5–250 osób podajemy ceny „od”. Zastępuje D-009 w tym zakresie. Kwot jeszcze nie ma. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-030 | 2026-11-21 | Na stronie Enterprise podajemy płatny pilot z kryterium sukcesu. Zakres i kryterium przygotowuje agent. Kwoty jeszcze nie ma. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-031 | 2026-11-21 | Podstrony dostają własny plik układu. Układ bazowy strony głównej zostaje bez zmian. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-032 | 2026-11-21 | Kadry i filmy renderujemy w GitHub Actions, z rezerwą na stację roboczą. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-033 | 2026-11-21 | Na stronie nie podajemy nazw własnych systemów, tylko kategorie, na przykład „system ERP”, „system HR”, „program kadrowo-płacowy”. Dotyczy także FAQ i tabel technicznych. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-034 | 2026-11-21 | Nazwy spółek, etykiety powiązań, zgody i cytaty do opisów wdrożeń wprowadza właściciel. Do tego czasu opisy są anonimowe, a cytatów nie ma. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-035 | 2026-11-21 | Sześć potwierdzeń do etapu 1 (punkty a–f z dokumentu wejściowego, rozdział 12, krok 3) właściciel potwierdził. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-036 | 2026-11-21 | Pomiar źródła wejścia: zgoda na kroki S1–S4 z planu (pola w CRM, zmiana serwera formularza, jego wydanie, nowa wersja informacji pod formularzem). | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-037 | 2026-11-21 | Stare przekierowania: tam, gdzie nowa strona odpowiada staremu adresowi, przekierowanie prowadzi na nową stronę. Pozostałe zostają. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-038 | 2026-11-21 | Adresy i tytuły stron etapu 6, teksty i miejsca odnośników na stronie głównej, scenariusze filmów i dobór liczb do filmów ustala agent. | właściciel, decyzje z 21.11.2026 | obowiązuje |
| D-039 | 2026-11-22 | Bing Webmaster Tools (plik `BingSiteAuth.xml`), IndexNow (klucz publiczny, zgłoszenie ręczne po wydaniu) oraz Microsoft Clarity (projekt `zhlvuu1fed`) ładowany wyłącznie po zgodzie analitycznej w istniejącym banerze. Tekst polityki prywatności do akceptacji właściciela. | właściciel, zlecenie T-022 | obowiązuje |
| D-040 | 2026-11-22 | Baner zgody mówi: „Statystyki prowadzimy na własnym serwerze (Matomo) i w narzędziu Microsoft Clarity.” Zastępuje zdanie „Dane zostają na naszym serwerze.”. Nagłówek CSP dla Clarity trafia na serwer razem z wydaniem tej zmiany, nie wcześniej. | właściciel, wybór z 22.11.2026 (CSP wstrzymane do poprawy banera) i scalenie PR #28 (T-024) | obowiązuje |
| D-041 | 2026-11-22 | Cena wdrożenia podana po audycie jest stała i nie rośnie w trakcie wdrożenia. | właściciel („Jest stała - jesteśmy profesjonalistami”, odpowiedzi do T-035 (wcześniej T-024)) | obowiązuje |
| D-042 | 2026-11-22 | Kolejność torów, wstępnie: najpierw portfolio w firmach 5–250 osób. Produkcja i logistyka później, ze względu na ryzyko przy jednoosobowej działalności. Właściciel jest przed badaniem rynku i popytu, więc to kierunek na początek, nie rozstrzygnięcie na stałe. D-016 pozostaje w mocy. | właściciel („Chyba na początek zbudowałbym sobie portfolio na 5-250 osób firmach”, odpowiedzi do T-035 (wcześniej T-024)) | obowiązuje |
| D-043 | 2026-11-22 | Kierunek sprzedaży: większe projekty niż proste automatyzacje poczty i dokumentów dla małych firm, które dziś przychodzą z poleceń. | właściciel („Ja chce iść w drugą stronę”, odpowiedzi do T-035 (wcześniej T-024)) | obowiązuje |
| D-044 | 2026-11-22 | Superzdanie i kierunek sprzedaży: firmy 50–250 osób. Zawęża D-016 w zakresie tego, do kogo kierujemy sprzedaż i nowe treści. Teksty strony z zakresem „5–250 osób” zostają bez zmian do osobnej decyzji. | właściciel („50–250 osób”, odpowiedź na pytanie z T-035 (wcześniej T-024)) | obowiązuje |
| D-045 | 2026-11-22 | Pierwszy pakiet do portfolio: K02, czyli godziny, premie i umowy do kadr i płac bez ręcznego wpisywania (ranking z raportu T-035 (wcześniej T-024)). Zakres, cena i miejsce na stronie wymagają osobnego planu i akceptacji. | właściciel („K02 (kadry i płace)”, T-035 (wcześniej T-024)) | obowiązuje |
| D-046 | 2026-11-22 | Filmy w hero strony głównej dostają przycisk wstrzymania. Zmienia D-015 w tym jednym punkcie (nowy element na stronie głównej). Wdrożenie wymaga osobnej zgody na etap. | właściciel („filmy hero dostają przycisk wstrzymania”, odpowiedź do audytu kodu T-028) | obowiązuje |
| D-047 | 2026-11-22 | Zgoda na etapy 2 i 3 planu po audycie kodu: wzorce serwera w repo (panel Matomo za dodatkowym hasłem, kopia zapasowa Matomo, szczegóły hosta poza repozytorium, test nginx w CI, kontrola nagłówków produkcji) oraz skrót treści w adresach zasobów zamiast ręcznego `?v=`, ze zmianą bajtów strony głównej bez zmiany wyglądu. Instalacja na serwerze pozostaje krokiem właściciela. | właściciel („zgoda na etap 2 i 3”, T-029 i T-030) | obowiązuje |
| D-048 | 2026-11-22 | Kierunek rozwoju wizualnego podstron: A — „Scena wszędzie”. Podstrona zaczyna się ciemną sceną z poświatą w zaokrąglonym kontenerze, z tytułem i plakatem filmu; strona główna bez zmian (D-015, D-021). Wdrożenie etapami: A1 — pilot na `/integracja-systemow.html` (zatwierdzony), kolejne etapy po osobnej akceptacji. Numer D-048, bo D-046 i D-047 są zajęte w otwartych PR innych kart. | właściciel („A”, potem „tak” na plan etapów A0 i A1; T-026, T-033) | obowiązuje |
| D-049 | 2026-11-22 | Odnośnik „Kadry i płace” do strony `/kadry-i-place.html` w menu „Dla działów” i w stopce, także na stronie głównej. Zmiana wyglądu strony głównej ograniczona do tych dwóch odnośników (D-015 i D-021 pozostają w mocy dla reszty). Cena pakietu na stronie: „po audycie, stała”. Wcześniej D-046, przenumerowana 22.11.2026 z powodu kolizji z D-046 (przycisk wstrzymania filmu w hero, PR #40). | właściciel („akceptuję kroki 1–2, cena po audycie, stała”; „Tak dodać”, T-034, wcześniej T-028) | obowiązuje |
| D-050 | 2026-11-22 | Taśma logotypów systemów (sekcja integracji) na stronie głównej zostaje jako świadomy wyjątek marketingowy dla strony głównej. D-018 i D-033 nie dotyczą tej taśmy i obowiązują na podstronach oraz w nagłówkach i opisach wdrożeń. | właściciel, decyzja z 22.11.2026 (T-026) | obowiązuje |
| D-051 | 2026-11-22 | Repozytorium kodu RevAGY na GitHubie (`dskibickikono-lang/RevAGY`) pozostaje publiczne (buduje widoczność marki w wyszukiwarkach i transparentność technologiczną). | właściciel, decyzja z 22.11.2026 (T-025) | obowiązuje |
| D-052 | 2026-11-22 | Wdrożenia REVAGY nie odbywają się wyłącznie zdalnie: wizyta robocza u klienta to obowiązkowy element każdego przypadku. Profil firmy w Google (Google Business Profile z ukrytym adresem) zostanie założony w późniejszym etapie. | właściciel, decyzja z 22.11.2026 (T-025) | obowiązuje |
| D-053 | 2026-11-23 | Silnik pozyskiwania leadów (Lead Engine) wchodzi do oferty i na stronę sprzedaży jako jeden z kluczowych produktów B2B. Opis opiera się na prawdzie produkcyjnej: system pracuje codziennie na produkcji i automatyzuje proces od świeżego ogłoszenia rekrutacyjnego w portalach, przez identyfikację firmy i wzbogacenie danych rejestrowych, po routing terytorialny i przekazanie leada do CRM/komunikatora handlowca. | właściciel, decyzja z 23.11.2026 (T-032) | obowiązuje |
| D-054 | 2026-11-25 | Dane rzeczywiste trzech opisów wdrożeń (D-034): agencja pracy — HR KADRA Sp. z o.o., podmiot niezależny, poza grupą KONO, bez etykiety powiązania (wyjątek od D-020); raport zarządu i pilotaż w produkcji — HR KONO, etykieta „Grupa KONO”. Skale, metody pomiaru i cytaty z pisemnymi zgodami spółek i osób. Stan załogi „568 i 539” zastąpiony odczytem 1 370 (raport dzienny, 8.07.2026) i 1 300 (arkusz operacyjny, 10.07.2026); wynik pilotażu „z ok. 6 godzin do ok. 20 minut” (było „ok. 10 minut”). Etap A2 (D-048): scena dowodu z 3 liczbami w krótkiej formie („ok. 12 h”, „ok. 90%”, „ok. 10 min”). | właściciel, dane i decyzja z 25.11.2026 (T-036) | obowiązuje |
| D-055 | 2026-11-26 | Grupa KONO jest klientem REVAGY. Zdanie ujawnienia pod opisami wdrożeń: „Opisy oznaczone „Grupa KONO” pochodzą ze spółek Grupy KONO, która jest klientem REVAGY.” (D-034). | właściciel, fakt i akceptacja brzmienia z 26.11.2026 (T-038) | obowiązuje |
| D-056 | 2026-11-26 | Baner zgody (P0 z audytu T-026): na komputerze w prawym dolnym rogu, na telefonie i tablecie (do 900 px) przy pierwszej wizycie dopiero po przewinięciu o 200 px, zawsze po wczytaniu krojów; przy otwartym banerze fokus klawiatury nie chowa się pod nim (WCAG 2.4.11). Tekst banera bez zmian (D-040). Kroje Onest i Instrument Sans wczytywane z wyprzedzeniem na podstronach i stronie kontaktu. Wyjątek od D-015: na stronie głównej zmienia się położenie i moment pokazania banera oraz skróty treści adresów styles.css i analytics.js; poza tym strona główna bez zmian. | właściciel („Robimy wszystko”, potem „Tak” dla planu z 26.11.2026; T-039) | obowiązuje |

## Zasady stałe (z reguły pracy KONO, nie są decyzjami z tego repo)

- Merge robi wyłącznie właściciel.
- Wdrożenia, SSH i zmiany na hostach wymagają osobnej zgody właściciela.
- Praca na własnej gałęzi, bez `--force` i bez rebase opublikowanych gałęzi.
- Bez sekretów w kodzie, logach i odpowiedziach.

## Otwarte kwestie (do decyzji właściciela)

- Opinie klientów i cennik: brak danych, na stronie ich nie ma.
- Kwoty „od” dla pakietów (D-029) i cena pilota Enterprise (D-030) nie są jeszcze podane.
- Analityka bez zgody odwiedzającego: przyjęte rozwiązanie zapisuje kliknięcia i czas dopiero po zgodzie
  w banerze (wybór agenta, D-008 tego nie rozstrzyga). Zmiana wymaga decyzji właściciela.
- ~~Baner zgody (`analytics.js`) mówi „Dane zostają na naszym serwerze”; po włączeniu Microsoft Clarity (D-039) to zdanie
  nie jest już pełne.~~ Rozstrzygnięte przez D-040 (T-024, wdrożone 22.11.2026).
- ~~Wpis w rejestrze firm pokazuje działalność jako zawieszoną od 2026-02-01.~~ Rozstrzygnięte przez D-012 (nieaktualne).
