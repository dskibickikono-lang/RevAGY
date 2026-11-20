# Rozpoznawalność marki REVAGY: co wdrażamy, czego nie, jak mierzymy

Stan: 2026-11-20 · karta T-006 · decyzja D-013 („B plus krótka nota z A”).
Nota jest krótka z założenia: strona jest nowa i nie ma jeszcze własnych danych, więc wnioski opierają się
na źródłach zewnętrznych. Po 8–12 tygodniach pomiaru (sekcja 3) wracamy z własnymi liczbami.

## 1. Co realnie buduje rozpoznawalność nowej marki

Wyszukiwarki i modele AI traktują firmę jako „byt”, gdy te same fakty (nazwa, opis, adres, NIP, profile)
powtarzają się w kilku niezależnych miejscach. Najważniejsze dźwignie, od najsilniejszej:

| Dźwignia | Stan po T-006 | Kto |
|---|---|---|
| Treść, którą da się zacytować: podstrony branżowe, case study, blog | 12 stron (PR #5), blog w planie (D-010) | właściciel + agent |
| Spójne fakty wszędzie: strona, LinkedIn, profil firmy w Google, rejestr firm | strona i `llms.txt` z jednego źródła (`src/config/marka.mjs`); LinkedIn podpięty (D-011) | właściciel: ten sam opis i adres na LinkedIn |
| Dane strukturalne `Organization` + `WebSite` z `sameAs` | **wdrożone** (JSON-LD na stronie głównej, pilnowane przez walidator) | — |
| Wzmianki zewnętrzne: katalogi B2B, case study u klientów i partnerów, artykuły gościnne | brak | właściciel |
| Status w rejestrze firm | nieaktualny wpis o zawieszeniu wyjaśniony (D-012); warto sprawdzić, że rejestr publiczny już go nie pokazuje | właściciel |
| `llms.txt` / `llms-full.txt` | **wdrożone**, generowane przy buildzie | — |

## 2. `llms.txt`: wdrożone, bo jest prawie darmowe, ale to nie jest dźwignia

- Google w poradniku o optymalizacji pod AI (05.2026) wymienia `llms.txt` wśród rzeczy **niepotrzebnych**
  do AI Overviews i AI Mode [źródło wtórne: omówienia SEO, nie sam dokument Google].
- Ahrefs, 137 tys. domen, 05.2026: **97% plików `llms.txt` nie dostało ani jednego żądania**. Pytały o nie
  głównie agenty programistyczne i crawlery treningowe, a nie boty wyszukiwania AI ChatGPT i Perplexity (1%).
- SE Ranking (~300 tys. domen): brak wyraźnego związku między obecnością pliku a cytowaniami w odpowiedziach AI.

Wniosek: plik kosztuje nas zero utrzymania (powstaje z sitemapy i treści stron), daje porządny zrzut treści
dla agentów, ale **nie należy od niego oczekiwać efektu w rozpoznawalności**. Pomiar w sekcji 3 pokaże,
czy ktokolwiek go pobiera.

## 3. Pomiar: punkt odniesienia od dziś

| Miara | Źródło | Uwaga |
|---|---|---|
| Wyświetlenia i kliknięcia na zapytania z nazwą „revagy” | Google Search Console | **wymaga dodania i weryfikacji usługi `revagy.pl`** (właściciel, rekord DNS) |
| Żądania botów AI (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot i inne): dziennie, per bot | `stats.revagy.pl/logi/boty-ai.txt` (nowe w T-006) | działa bez zgody na cookies, bo boty nie wykonują JS i nie widać ich w Matomo |
| Pobrania `/llms.txt` i `/llms-full.txt` | ten sam raport + panel „Requested Files” w GoAccess | odpowiada na pytanie z sekcji 2 |
| Wejścia z chatgpt.com, perplexity.ai, claude.ai, gemini.google.com | Matomo, źródła wejścia | tylko odwiedzający, którzy wyrazili zgodę |
| Co modele mówią o marce | ręczny test raz w miesiącu: te same 5 pytań do ChatGPT, Claude, Perplexity, Gemini, odpowiedzi zapisane z datą | np. „Co to jest REVAGY?”, „Firmy od automatyzacji dla agencji pracy w Polsce”, „Jak zintegrować HRappkę z nexo?” |

## 4. Kolizja nazwy

Wyszukiwanie „Revagy” (20.11.2026) nie zwraca żadnej innej firmy ani produktu o tej nazwie. Najbliższe
trafienia to niezwiązane nazwy podobne (Revaprazan, Revolut Revtag). Nazwa jest wolna, więc każde spójne
wystąpienie buduje jeden byt, a nie konkuruje z cudzym.

## 5. Następne kroki (poza tym PR)

1. Właściciel: weryfikacja `revagy.pl` w Google Search Console i zgłoszenie `sitemap.xml`.
2. Właściciel: profil firmy w Google, jeśli REVAGY ma przyjmować klientów pod adresem; po utworzeniu
   dopisać adres profilu do `profile` w `src/config/marka.mjs`.
3. Właściciel: opis na LinkedIn zgodny z opisem w `src/config/marka.mjs`, adres strony `https://revagy.pl/`.
4. Agent, przy blogu: `BlogPosting` w JSON-LD dla wpisów (autor, data), `BreadcrumbList` dla podstron.
5. Wdrożenie nowego `revagy-logi-raport.sh` na VPS: osobna zgoda właściciela (zasada stała rejestru).

## Źródła

- Ahrefs, „We Analyzed 137K Sites: 97% of llms.txt Files Never Get Read”: https://ahrefs.com/blog/llmstxt-study/
- Search Engine Journal o tym badaniu: https://www.searchenginejournal.com/97-of-llms-txt-files-got-no-requests-ahrefs-data-shows/
- Optimizely, „Does llms.txt work?”: https://www.optimizely.com/field-notes/articles/does-llms-txt-work/
- SEOmator, skan 100 tys. domen: https://seomator.com/blog/llms-txt-adoption
- Specyfikacja formatu: https://llmstxt.org
