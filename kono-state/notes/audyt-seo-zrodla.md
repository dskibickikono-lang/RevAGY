# Audyt SEO REVAGY: rejestr źródeł i notatki z badania

Stan: 2026-11-22 · karta T-025 · załącznik do [`audyt-seo.md`](audyt-seo.md).
Trzy strumienie badania zapisane w całości: wyniki wyszukiwania i konkurenci, odpowiedzi AI, miejsca dla marki.
Oznaczenia statusu źródeł są opisane na początku każdej części. Pomiar Lighthouse: tabela w raporcie głównym
(Lighthouse 13.6.0, 11 stron × 3 przebiegi, build z `43efbf5`).

---

## Część A. Strumień SERP — dowody (sprawdzono 22.11.2026)

#### 0. Metoda i ograniczenia (przeczytaj najpierw)

- Narzędzie: WebSearch (tryb standard) + WebFetch. **Wyszukiwarka działa z USA i nie jest polskim Google.** Kolejność wyników NIE jest pozycją w google.pl. Wyniki pokazują, „kto ma zaindeksowaną treść pasującą do frazy", z wyraźnym skrzywieniem w stronę dużych, międzynarodowych domen z polską wersją językową (ClickUp, SAP, Innowise, Salesforce). Małe polskie agencje są w tym indeksie niedoreprezentowane — to wada narzędzia, nie dowód, że ich nie ma w google.pl.
- Wyszukiwarka zwraca listę 10–30 adresów bez numerów pozycji; poniżej biorę pierwsze 8–10 unikalnych domen w kolejności zwróconej.
- Typ wyniku oceniony po domenie i tytule/URL; stron z list wyników nie otwierałem (poza wskazanymi w sekcji 2), więc typ to klasyfikacja, a treść podstron nie była weryfikowana.
- Wolumeny i trudność fraz: **brak danych** (nie znaleziono publicznego źródła z liczbami; nie szacuję).
- Operacje sieciowe: **35** (23 wyszukiwania, 12 pobrań stron). Błędy dostępu: automationhouse.pl (403), zautomatyzowani.pl (503), crowe.com/pl/…/audyt-rpa (403), digitalteammates.pl (503), officesamurai.com/pl/ (404).
- „Ocena szansy" = wniosek z typu i siły domen w wynikach, nie pomiar. Skala: niska / średnia / relatywnie wysoka.

#### 1. Frazy → wyniki → ocena szansy

Skróty typów: PROD = producent oprogramowania, INT = integrator/software house/agencja, DOR = firma doradcza (Big4 itp.), MED = medium/portal, PORAD = poradnik/blog firmowy niezwiązany z usługą, KAT = katalog/ranking/marketplace, AKAD = uczelnia/PDF naukowy, DOK = dokumentacja produktu, SZKOL = szkolenie.

| # | Fraza | Wyniki (domena — typ), kolejność zwrócona | Ocena szansy dla małej nowej strony | Uzasadnienie |
|---|---|---|---|---|
| 1 | automatyzacja procesów biznesowych | sap.com/poland — PROD; atlassian.com/pl — PROD; asana.com/pl — PROD; clickup.com/pl — PROD; orange.pl (poradnik dla firm) — PORAD/telekom; ibm.com — PROD (PDF); kpmg.com/pl — DOR; symfonia.pl — PROD; innowise.com/pl — INT; deviniti.com/pl — INT; dalej: comparic.pl, ifirma.pl, fakturaxl.pl, flowhunt.io, PDF-y uczelni | **Niska** | Fraza ogólna, definicyjna. Same domeny globalnych producentów, Big4, telekomu i dużych polskich producentów; treści typu „czym jest…". Żadnej małej agencji w zwróconej liście. |
| 2 | automatyzacja procesów w firmie | orange.pl — PORAD; ifirma.pl — PROD (blog); symfonia.pl — PROD (blog); ibm.com — PROD; asana.com/pl — PROD; deviniti.com/pl — INT; gowork.pl — MED/portal pracy; antyweb.pl (tekst Automation House) — MED; firmove.pl — MED; kpmg.com/pl — DOR; crowe.com/pl — DOR | **Niska** | Jak wyżej; poradniki dużych marek. Jedyny ślad małego gracza to artykuł własny Automation House na antyweb.pl — czyli wejście przez medium, nie przez własną domenę. |
| 3 | wdrożenie AI w firmie | openai.com/pl-PL — PROD; deepl.com/pl — PROD; ifirma.pl — PROD (blog); kpmg.com/pl (2 strony usługowe) — DOR; ey.com (raport PDF) — DOR; ttms.com/pl (4 artykuły) — INT; netguru.com/pl — INT; poradnikprzedsiebiorcy.pl — MED/PROD; android.com.pl — MED; pfr.pl (PDF „jak wyliczyć koszty wdrożenia AI") — instytucja publiczna | **Niska** | Dostawcy modeli, Big4, duże software house'y (TTMS z wieloma artykułami na jeden temat), instytucje publiczne. |
| 4 | agenci AI dla firm | clickup.com/pl (5 adresów) — PROD; blckalpaca.at/pl (6 adresów) — INT (agencja z Wiednia, wersja PL); netguru.com/pl — INT; microsoft.com/pl-pl — PROD; innowise.com/pl — INT; agencies.semrush.com/pl — KAT; leverx.com/pl — INT | **Niska–średnia** | Producenci dominują, ALE mała zagraniczna agencja (Blck Alpaca e.U.) zajmuje wiele miejsc dzięki masowej treści po polsku (usługa + blog + baza wiedzy). Dowód, że temat da się obsadzić treścią, lecz wymaga wolumenu publikacji, którego 11-stronicowa witryna nie ma. |
| 5 | automatyzacja dla małych firm | symfonia.pl — PROD (blog); dreamhost.com — PROD; parseur.com/pl — PROD; clickup.com/pl — PROD; wpbeginner.com/pl — MED/ranking narzędzi; flowhunt.io/pl — PROD+usługi; inewi.pl — PROD (blog „11 narzędzi…"); thecmo.com/pl, thedigitalprojectmanager.com/pl — KAT/rankingi; bezprawnik.pl — MED; deviniti.com/pl — INT | **Niska** | Intencja w wynikach to „narzędzia do samodzielnego użycia" (rankingi, listy narzędzi), nie „zleć wdrożenie". Niedopasowanie intencji + silne domeny. |
| 6 | integracja systemów w firmie | bankier.pl — MED; fakturownia.pl (słownik) — PROD; pro.rp.pl — MED; sap.com/poland — PROD; pkobp.pl (poradnik) — bank; symfonia.pl — PROD; innowise.com/pl (ERP integracja) — INT; benchmark.pl — MED; leverx.com/pl — INT; payproglobal.com/pl — PROD | **Niska–średnia** | Media ogólnopolskie i producenci, ale wyniki są rozproszone tematycznie (ERP–WMS, bank–FK, CAD–ERP) — brak jednego dominującego typu strony usługowej „integracja systemów dla MŚP". |
| 7 | integracja systemu HR z programem kadrowo-płacowym | symfonia.pl (5 adresów: oprogramowanie + blog) — PROD; hrappka.pl (3 adresy) — PROD; kadry.infor.pl (3 adresy) — MED; globalization-partners.com/pl — PROD/usługi; sap.com/poland — PROD | **Średnia** | Wyniki to producenci systemów HR opisujący WŁASNE integracje oraz portal kadrowy. Nie zwrócono żadnej strony niezależnego wykonawcy łączącego dwa cudze systemy. Luka typu treści jest, ale ludzie zwykle szukają po nazwach systemów — a strona nazw nie używa. |
| 8 | automatyzacja obiegu faktur kosztowych | symfonia.pl (8 adresów: blog, produkt eDokumenty, KSeF) — PROD; pomoc.comarch.pl (5 adresów, dokumentacja BPM) — DOK; innowise.com/pl — INT; fakturownia.pl — PROD; thedigitalprojectmanager.com/pl — KAT; sap.com/poland — PROD | **Niska** | Fraza produktowa: producenci gotowych systemów obiegu faktur z wieloma podstronami każdy. Szukający oczekuje programu, nie usługi. |
| 9 | automatyzacja windykacji należności | thecfoclub.com/pl (2 rankingi programów) — KAT; pomoc.comarch.pl (dokumentacja Optima) — DOK; emagia.com/pl — PROD; comparic.pl — MED; podatki.biz — MED; ainora.lt/pl — PROD (voicebot, Litwa); firmove.pl — MED; cordis.europa.eu — instytucja | **Niska–średnia** | Lista krótsza i słabsza jakościowo (tłumaczone rankingi, dokumentacja, zagraniczne małe domeny). W tym indeksie brak mocnej polskiej strony usługowej. Uwaga: polscy producenci programów windykacyjnych mogą być po prostu niewidoczni w tym narzędziu — nie potwierdzono. Poza listą: no-code.pl ma wpis blogowy „Automatyzacja należności, przypomnień i prognozowania płatności" (sekcja 2). |
| 10 | automatyzacja uzgodnień bankowych | ibm.com (2) — PROD; pkobp.pl — bank; deviniti.com/pl — INT; oracle.com/pl — PROD; bfg.pl — instytucja; citibank.pl — bank; bank.pl — MED; bankier.pl — MED; symfonia.pl (Web API bank) — PROD; help.rambase.net/pl — DOK | **Średnia (dla treści), popyt nieznany** | Wyniki w większości NIE odpowiadają na frazę (automatyzacja w bankowości, a nie uzgadnianie wyciągów z księgami). Tylko dokumentacja RamBase i strona Symfonii są na temat. Słabe dopasowanie = miejsce na trafną stronę, ale może też znaczyć, że tak sformułowanej frazy prawie nikt nie wpisuje (brak danych o wolumenie; częstsze może być „rozliczanie wyciągów bankowych"/„parowanie płatności" — nie sprawdzano). |
| 11 | automatyzacja w produkcji i logistyce procesy biurowe | menit.sgh.waw.pl — AKAD; um.edu.mt — AKAD; astor.com.pl — INT automatyki przemysłowej; managementpapers.polsl.pl — AKAD; czasopisma.bg.ug.edu.pl (2) — AKAD; siemens.com (raport) — PROD; apator.com — PROD; yadda.icm.edu.pl (2) — AKAD | **Relatywnie wysoka technicznie, ale fraza sztuczna** | Same PDF-y naukowe i automatyka przemysłowa (roboty, intralogistyka). Nikt nie obsadza „biurowej" strony produkcji/logistyki. Jednak to zlepek słów, nie naturalne zapytanie — brak dowodu, że ktokolwiek tak szuka. Wniosek twardy: słowo „automatyzacja" obok „produkcja" jest rozumiane jako automatyka hali, więc podstrona produkcja-i-logistyka musi się od tego jednoznacznie odróżniać słownictwem (zamówienia, awizacje, dokumenty przewozowe itp.). |
| 12 | RPA czy integracja API | workato.com — PROD; uipath.com (3) — PROD; techtarget.com (3) — MED; superblocks.com — PROD; computerweekly.com (2, w tym DE) — MED; fortra.com (2) — PROD; zoho.com — PROD; celigo.com — PROD; apix-drive.com — PROD; geeksforgeeks.org — PORAD | **Relatywnie wysoka (najlepsza z listy)** | **Wszystkie zwrócone wyniki są po angielsku lub niemiecku — ani jednego polskiego.** W tym indeksie brak polskiej treści odpowiadającej na pytanie. Zastrzeżenie: nie dowodzi to pustki w google.pl; dowodzi, że duże domeny z polskimi wersjami tego tematu nie pokryły. Podstrona porownanie-rozwiazan trafia dokładnie w tę intencję. Popyt: brak danych. |
| 13 | jak wybrać proces do automatyzacji | akademialtca.pl — SZKOL (płatne nagranie webinaru „Jak wybrać pierwszy proces do automatyzacji w firmie?", 49 zł + VAT, 59 min, stan 14.11.2025 — zweryfikowano po otwarciu); docs.mulesoft.com — DOK (EN); salesforce.com (6 adresów, EN) — PROD; uipath.com (EN) — PROD; ifirma.pl (4 adresy) — PROD (blog) | **Relatywnie wysoka** | Polskie wyniki to tylko płatne nagranie webinaru (treść za paywallem) i ogólny wpis iFirmy; reszta po angielsku. Tytuł webinaru jest niemal identyczny z nazwą podstrony jak-wybrac-pierwszy-proces — potwierdza, że temat jest tak nazywany na rynku. Bezpłatny, konkretny poradnik ma tu lukę. |
| 14 | audyt automatyzacji procesów cena | uslugirozwojowe.parp.gov.pl (2) — KAT (Baza Usług Rozwojowych); flowhunt.io/pl — PROD+usługi; crowe.com/pl (audyt RPA; „bezpłatny audyt procesów") — DOR; cenauslug.pl — KAT/agregator cen; linkedin.com (profil) — social; gft.com/pl — INT; firmove.pl („ile kosztuje automatyzacja") — MED; kpmg.com/pl — DOR; orange.pl — telekom; grantthornton.pl — DOR | **Relatywnie wysoka** | Prawie nikt nie podaje ceny. Jedyne liczby w fragmentach wyników (NIEZWERYFIKOWANE otwarciem strony): wpis w bazie PARP „audyt gotowości do wdrożenia AI" 5 000 zł netto / 6 150 zł brutto (https://uslugirozwojowe.parp.gov.pl/wyszukiwarka/uslugi/drukuj-pdf?id=3675709) oraz agregator cenauslug.pl z „średnią 2 442 zł" bez metodologii (https://cenauslug.pl/firma-i-biuro/automatyzacja-procesow-biznesowych). Strona z jawną ceną 1 990 zł odpowiada na intencję, której konkurenci unikają. Dodatkowy trop: Baza Usług Rozwojowych PARP sama jest w wynikach — obecność w niej to kanał (nie weryfikowano warunków wpisu). |
| 15 | ręczne przepisywanie danych między systemami | comparic.pl — MED (artykuł SPONSOROWANY firmy RavNet o OCR); knowledge.hubspot.com/pl — DOK; antyweb.pl („Najdroższe API w firmie: człowiek z Excelem") — MED; pomoc.comarch.pl (6 adresów) — DOK; yadda.icm.edu.pl (2) — AKAD; public.dhe.ibm.com — DOK; dbc.wroc.pl — AKAD; help.qlik.com/pl — DOK; innowise.com/pl — INT | **Relatywnie wysoka** | Fraza „bólowa". Wyniki to dokumentacje, PDF-y i dwa artykuły w mediach (jeden sponsorowany). Brak strony usługowej zbudowanej wokół tego problemu. Wzorzec konkurencji: mali gracze wchodzą tu przez artykuł w medium, nie własną domeną. Popyt: brak danych. |

#### Wzorce z tabeli (fakty z list wyników)
1. Frazy ogólne (1–6, 8): producenci oprogramowania, Big4, banki/telekom, duże software house'y. Zero małych polskich agencji na własnych domenach.
2. Symfonia występuje w 9 z 15 fraz (1, 2, 5, 6, 7, 8, 10 + blogowo), Innowise w 6, ClickUp w 4, iFirma w 4 — to gracze „obsadzający" temat ilością treści.
3. Mali gracze pojawiają się trzema drogami: (a) masowa treść wielojęzyczna (blckalpaca.at), (b) artykuł własny/sponsorowany w medium (Automation House na antyweb.pl, RavNet na comparic.pl), (c) katalogi (PARP BUR, Useme, Clutch, n8n experts, Fiverr — z zapytań pomocniczych).
4. Najsłabiej obsadzone są frazy pytające/decyzyjne i bólowe (12, 13, 14, 15) — dokładnie te, pod które REVAGY ma już podstrony (porownanie-rozwiazan, jak-wybrac-pierwszy-proces, cena audytu).

#### 2. Konkurenci — otwarte strony

Uwaga: cel 6–8 stron nie został osiągnięty. Otwarto skutecznie 4 strony firm + 1 firmę pośrednio (artykuł); 5 prób zakończyło się błędem. Narzędzie wyszukiwania nie zwracało małych polskich agencji, więc dobór jest ograniczony do tego, co wypłynęło w wynikach.

| Firma (kraj) | URL | Title | H1 | Obietnica | Ceny | Case studies z nazwami | Blog | Podstrony branżowe / narzędziowe / pod systemy |
|---|---|---|---|---|---|---|---|---|
| No-Code.pl / Web Expert (PL, Komorniki k. Poznania) — najbliższy profil do REVAGY | https://no-code.pl/ | „Automatyzacja procesów i Sztuczna inteligencja (AI) w Twojej firmie - Agencja No-Code.pl Poznań" | „Sukces Twojej firmy w erze automatyzacji & AI" | Ogólna: „Z nami osiągniesz cele szybciej, łatwiej i efektywniej" | Brak | Brak | 4 widoczne wpisy: należności/przypomnienia płatności, AI w firmie, „Narzędziownik: n8n", „Narzędziownik: Airtable" | 4 podstrony usługowe (automatyzacje, AI, integracje systemów, konsultacje i szkolenia). Brak podstron branżowych i systemowych; narzędzia tylko we wpisach. Lokalizacja w title („Poznań"). |
| Blck Alpaca e.U. (AT, Wiedeń; strona w 6 językach, w tym PL) | https://blckalpaca.at/pl/uslugi/automatyzacja-procesow-biznesowych | „Automatyzacja procesów biznesowych: doradztwo dla MŚP" | „Automatyzacja procesów biznesowych dla MŚP" | Analiza procesów + roadmapa, którą klient może wdrożyć sam; doradztwo niezależne od sprzedaży narzędzi; infrastruktura w UE | Brak; bezpłatna pierwsza rozmowa, „przejrzysta oferta po niej" | 1 nazwane: IPEC Group | Duży: blog + baza wiedzy + słownik + „badania"; tematy: agenci AI, ROI, n8n, RODO/self-hosting, cold outreach | Tak: branże (nieruchomości, firmy wykonawcze, energetyka, SaaS), narzędzia (n8n, PostgreSQL, NocoDB), nazwy systemów w treści (Zendesk, Intercom, Jira…). Też wersje .md stron (pod modele językowe). |
| FlowHunt / AiMingle s.r.o. (prawdopodobnie SK/CZ — tylko forma prawna w stopce, niepotwierdzone) — producent platformy + usługi | https://www.flowhunt.io/pl/services/ai-small-businesses/ | „AI dla małych firm \| FlowHunt" | „AI dla małych firm" | „Audyt AI" porządkujący procesy MŚP; CTA: bezpłatna konsultacja 30 min | Brak na stronie usługi (link do cennika platformy) | Brak nazwanych opisów; logotypy (PostAffiliatePro, LiveAgent, M4Markets, HZ-Containers) bez wyjaśnienia relacji | Tak, duży (blog, akademia, słownik, baza wiedzy) | Tak: przypadki użycia wg zespołów i branż, integracje, szablony |
| TTMS — Transition Technologies MS S.A. (PL, Warszawa; enterprise, nie MŚP) | https://ttms.com/pl/konsulting-automatyzacji-ai/ | „Konsulting automatyzacji AI dla przedsiębiorstw \| TTMS" | „Konsultacje AI dla firm: bezpieczna automatyzacja kluczowych procesów" | Bezpieczna automatyzacja w dużej organizacji; CTA: **bezpłatny audyt automatyzacji** | Brak; podane czasy: audyt 2–4 tyg., projekt 2–4 tyg., pilotaż 8–12 tyg., wdrożenie 2–12 mies. | Tak: Takeda Pharma, Kancelaria Marek Małecki i Partnerzy; reszta anonimowa („wiodący producent słodyczy"); logotypy ABB, Ferrero, PwC i in. | Tak (wiele artykułów o AI widocznych w wynikach fraz 3) | Tak: branże (pharma, energetyka, produkcja, obronność) i systemy z nazwy (Salesforce, AEM, Webcon BPS, Power Apps, Power BI, Snowflake, Azure) |
| Automation House (PL, Warszawa) — strona własna niedostępna (403); dane z artykułu napisanego przez firmę | https://antyweb.pl/automation-house-startup | n/d | n/d | No-code/low-code; bezpłatna rozmowa, „quick wins" w 1–2 tygodnie, małe sprinty | Brak w artykule | Brak nazw (przykłady anonimowe) | nie ustalono | nie ustalono. Deklaracje własne firmy, niezweryfikowane: założona 04.2022, 8 specjalistów, 200–300 automatyzacji, ok. 100 tys. zł przychodu powtarzalnego |
| Crowe (PL, doradztwo) | https://www.crowe.com/pl/services/konsulting/audyt-rpa | — | — | — | — | — | — | **403 — nie otwarto.** Z listy wyników wiadomo tylko, że istnieją strony „audyt RPA" i „bezpłatny audyt procesów" (https://www.crowe.com/pl/en-US/insights/bezplatny-audyt-procesow). |
| zautomatyzowani.pl, digitalteammates.pl, officesamurai.com/pl | — | — | — | — | — | — | — | **503 / 503 / 404 — nie otwarto.** Adresy sprawdzane na podstawie mojej wcześniejszej wiedzy o rynku, nie z wyników; nie potwierdzam nawet, że nadal działają. |

#### Co wynika z porównania (tylko z otwartych stron)
- **Ceny:** żaden z 4 otwartych konkurentów nie podaje ceny usługi. Dwóch daje audyt/konsultację za darmo (TTMS „bezpłatny audyt automatyzacji", FlowHunt 30 min; Crowe — „bezpłatny audyt procesów" wg tytułu wyniku, niezweryfikowane). Jawne 1 990 zł wyróżnia REVAGY, ale stoi obok „bezpłatnych audytów" większych firm — płatny audyt musi być na stronie wyraźnie odróżniony od tego, co inni dają gratis.
- **Case studies z nazwami:** ma je TTMS (2 nazwane) i Blck Alpaca (1). No-Code.pl i FlowHunt — brak. Brak nazwanych wdrożeń to norma u małych, nie dyskwalifikacja, ale nie jest też wyróżnikiem.
- **Nazwy systemów:** 3 z 4 otwartych stron używają nazw własnych narzędzi/systemów w podstronach lub wpisach (No-Code.pl we wpisach, Blck Alpaca i TTMS w osobnych podstronach). Decyzja REVAGY o samych kategoriach idzie pod prąd praktyki konkurencji i odcina frazy z nazwami systemów.
- **Skala treści:** Blck Alpaca, FlowHunt, TTMS — duże zasoby (blog, baza wiedzy, słownik). No-Code.pl — 4 wpisy. REVAGY — 0 wpisów, ale 2 podstrony poradnikowe.
- **Obietnice** są ogólne („szybciej, łatwiej", „bezpieczna automatyzacja"). Nikt z otwartych nie komunikuje płatnego pilota 14 dni ani konkretnych procesów finansowych (uzgodnienia, windykacja) na osobnej podstronie — poza wpisem blogowym No-Code.pl o należnościach.

#### 3. Widoczność marki (22.11.2026)

| Zapytanie | Co wróciło — dokładnie |
|---|---|
| `revagy` | 10 wyników, **żaden nie dotyczy REVAGY**: bundler.rubygems.org (gem „revac"), cbinsights.com (Engagys vs RevHealth), r3vy.pages.dev, mayoclinic.org (revakinagene), mtec-sc.org (Revagenix), medicines.ie (Reagila, 2×), apps.apple.com (Revitive), columbiadoctors.org. Wyszukiwarka potraktowała słowo jak literówkę. |
| `revagy.pl` | 17 wyników, **żaden z domeny revagy.pl**: github.com/SpecAgentRM, revyxt.bandcamp.com, 11× profile wykop.pl (revy, yagy, RevangE, revvi…), builtwith.com/revis.pl, gry-online.pl (2×). |
| `site:revagy.pl` | 16 wyników, **żaden z revagy.pl**; operator site: został zignorowany (wykop.pl, webrate.org/site/revolut.com.pl, builtwith.com/revis.pl i /revisithome.pl). |
| `revagy automatyzacja procesów` z twardym filtrem domeny revagy.pl | **„No links found" — zero wyników.** To najmocniejszy dowód: w indeksie tego narzędzia nie ma ani jednej strony z revagy.pl. |

Kontrola bezpośrednia (nie przez wyszukiwarkę):
- https://revagy.pl/ odpowiada, treść: „REVAGY — automatyzacja i AI dla firm B2B", H1 „Procesy, które robią się same". Meta robots i canonical — nie do odczytania tą metodą (narzędzie oddaje treść, nie sekcję head).
- https://revagy.pl/robots.txt: `User-agent: *` / `Allow: /` / `Sitemap: https://revagy.pl/sitemap.xml` — robots nie blokuje indeksowania.
- Obserwacja uboczna (do weryfikacji w kodzie, odczyt przez model streszczający może być niepełny): w nawigacji strony głównej odczytano głównie kotwice (#mozliwosci, #integracje, #zastosowania, #proces, #pakiety, #faq, #kalkulator, #kontakt) oraz linki `finanse.html` i `polityka-prywatnosci.html`; linków do pozostałych podstron w tym odczycie nie było widać.

Wnioski: (1) marka jest niewidoczna w tym indeksie — spójne z wiekiem strony (listopad 2026); czy jest w indeksie Google, tego to narzędzie nie rozstrzyga (potrzebny Google Search Console). (2) Słowo „revagy" nie ma konkurencji semantycznej (brak innej firmy o tej nazwie w wynikach), ale wyszukiwarka „poprawia" je na podobne słowa — dopóki marka nie zdobędzie wzmianek, zapytanie brandowe może nie prowadzić do strony.

#### 4. Czego nie dało się ustalić

- Rzeczywistych pozycji w google.pl dla żadnej frazy (narzędzie z USA, bez numerów pozycji, z własnym indeksem).
- Wolumenów i trudności fraz — brak danych; nie znaleziono publicznego źródła z liczbami.
- Czy revagy.pl jest zaindeksowana w Google/Bing (wymaga GSC/Bing Webmaster lub ręcznego `site:` w polskiej przeglądarce).
- Kto z małych polskich agencji automatyzacji faktycznie rankuje w Polsce: narzędzie ich nie zwracało, a 5 prób otwarcia stron zakończyło się błędem (automationhouse.pl 403, zautomatyzowani.pl 503, crowe.com 403, digitalteammates.pl 503, officesamurai.com/pl 404). Tabela konkurentów obejmuje więc 4 strony, z czego tylko 1 (No-Code.pl) to mała polska agencja o profilu zbliżonym do REVAGY.
- Treści stron z list wyników (poza otwartymi) — typy przypisane po domenie/tytule.
- Cen z fragmentów (PARP 5 000 zł netto, cenauslug.pl 2 442 zł) — nie otwierano źródeł; cenauslug.pl nie podaje metodologii wg fragmentu.
- Czy frazy 10, 11, 15 w takim brzmieniu są w ogóle wpisywane przez ludzi (słabe wyniki mogą oznaczać lukę albo brak popytu).
- Obecności reklam płatnych, map i odpowiedzi AI w polskich wynikach — narzędzie ich nie pokazuje.
- Siedziby FlowHunt (tylko „s.r.o." w stopce) i aktualności danych o Automation House (artykuł własny firmy, bez daty odczytanej).


---

## Część B. Strumień: widoczność w odpowiedziach AI — dowody (stan na 22.11.2026)

Operacje sieciowe: 35 (18 wyszukiwań, 17 pobrań stron). Błędów dostępu (403/timeout) nie było.
Ograniczenia dostępu, które wpływają na pewność:
- Trzy pobrania zostały ucięte na 100 tys. znaków (dokumentacja FAQPage Google, Clutch, raport Senuto) — końcówek nie czytano.
- Wyszukiwarka działa z USA: wyniki dla polskich zapytań nie odpowiadają temu, co widzi użytkownik w Polsce.
- Odpowiedzi ChatGPT, Perplexity, Gemini, Copilota i Trybu AI na zapytania o firmy NIE zostały zbadane (brak dostępu). Pytanie 3 opisuje wyłącznie strony, które istnieją w sieci.

Oznaczenia: [O] = przeczytany oryginał; [W] = tylko fragment z wyszukiwarki, trop do weryfikacji, nie dowód.

---

#### 1. Co wiąże się z cytowaniem / wymienianiem marki w odpowiedziach AI

#### 1.1 Oficjalne stanowiska

**Google — „Optimizing your website for generative AI features on Google Search” [O]**
https://developers.google.com/search/docs/fundamentals/ai-optimization-guide (data aktualizacji niewidoczna w pobranej treści; strona istnieje obok starszej https://developers.google.com/search/docs/appearance/ai-features)
- „optimizing for generative AI search is optimizing for the search experience, and thus still SEO”.
- Warunek techniczny: strona zindeksowana i kwalifikująca się do wyświetlenia ze snippetem. Nic ponad to.
- „Structured data isn't required for generative AI search” — warto je mieć dla wyników rozszerzonych, nie dla AI.
- „You don't need to create new machine readable files, AI text files, markup, or Markdown to appear in Google Search.”
- Sekcja „Mythbusting” — rzeczy do zignorowania: llms.txt i specjalne znaczniki, dzielenie treści na kawałki („chunking”), przepisywanie treści pod AI, zabieganie o nieautentyczne „wzmianki”, nadmierne skupienie na danych strukturalnych.
- Co ma działać: unikalna, „niekomodytowa” treść; Google pisze, że to „will likely influence” obecność w długim okresie (sformułowanie ostrożne, bez danych).
- Strona wspomina raport „Generative AI performance” w Search Console i ustawienie udziału witryny w funkcjach AI [O — z pobranej treści; szczegółów nie weryfikowano]. Wpis Google z 3.06.2026 o nowej kontrolce dla właścicieli stron: https://blog.google/products-and-platforms/products/search/new-controls-website-owners/ [W].
- Ocena: źródło pierwotne, ale Google jest stroną zainteresowaną (nie chce manipulacji). Dotyczy tylko Google, nie ChatGPT/Perplexity. Przenoszalność na REVAGY: pełna (zasady są niezależne od języka i wielkości).

**Microsoft/Bing — „Optimizing Your Content for Inclusion in AI Search Answers” [O]**
https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers — 8.10.2025, Krishna Madhavan (Principal PM, Bing)
- Copilot dzieli stronę na fragmenty („parsing”) i składa odpowiedź z kawałków wielu źródeł.
- Zalecenia: „Use schema, clear headings, and modular layouts”; pytanie + bezpośrednia odpowiedź („can often lift these pairs word for word”); H1 zgodny z tytułem.
- Unikać: ścian tekstu, odpowiedzi ukrytych w zakładkach/akordeonach (mogą nie być renderowane), kluczowych informacji w PDF lub tylko w obrazach.
- Post nie podaje żadnych danych, że te praktyki zwiększają wybór do odpowiedzi; sam pisze, że nie ma „secret strategy” ani gwarancji.
- Ocena: wytyczne dostawcy, bez dowodu. Sprzeczne z Google w sprawie schema i „modularności”. Przenoszalność: uwaga o akordeonach jest praktyczna dla strony z sekcją FAQ — treść odpowiedzi powinna być w HTML bez interakcji.

#### 1.2 Badania korelacyjne

**Ahrefs — 75 tys. marek a AI Overviews [O]**
https://ahrefs.com/blog/ai-overview-brand-correlation/ — publ. 26.05.2025; data zbierania danych: nie podano; rynek/język: nie podano.
- Próba: 75 000 marek; ok. 26% z zerem wzmianek w AIO pominięto. Dobór: domeny z DR > 40 i frazą brandową ≥ 800 wyszukiwań/mies.
- Spearman: wzmianki marki w sieci 0,664; brandowe anchory 0,527; wolumen wyszukiwań marki 0,392; DR 0,326; domeny linkujące 0,295; ruch brandowy 0,274; liczba backlinków 0,218; liczba podstron 0,17.
- Autorzy: „correlation ≠ causation”.
- Siła w swoich warunkach: średnia. Duża próba, ale jedna zmienna na raz, bez kontroli wielkości firmy (duże marki mają i wzmianki, i widoczność — wspólna przyczyna). Finansowanie: dostawca narzędzia, które sprzedaje pomiar wzmianek.
- Przenoszalność na REVAGY: słaba. Filtr DR > 40 i ≥ 800 wyszukiwań marki wyklucza z próby firmy takie jak REVAGY; dane najpewniej anglojęzyczne. Kierunek („obecność poza własną stroną > linki”) jest hipotezą, nie wynikiem dla małych marek.

**Seer Interactive — „What Drives Brand Mentions in AI Answers?” [W]**
https://www.seerinteractive.com/insights/what-drives-brand-mentions-in-ai-answers
- Wg streszczeń: 300 tys.+ słów (finanse, SaaS), 10 000 pytań przez API GPT-4o; korelacja pozycji na 1. stronie Google ze wzmiankami ok. 0,65, Bing 0,5–0,6; backlinki słabo. Oryginału nie czytano — liczby do potwierdzenia.
- Ograniczenie: API bez wyszukiwania ≠ ChatGPT Search; agencja SEO ma interes w wyniku „SEO nadal działa”. Przenoszalność: słaba (USA, duże branże).

**Senuto — czynniki cytowania w AI Overviews, polska baza [O]**
https://insight.senuto.com/aio-report-2/factors-aio.html — stan danych: listopad 2025; raport v2.0 z 27.11.2025.
- Próba: 29 514 polskich stron, 50:50 cytowane/niecytowane; niecytowane pochodzą z TOP10 tej samej frazy. 57 cech, miara Cohen's d.
- Wyniki: obecność meta description d = 1,30 (91% cytowanych vs 39%); linki do źródeł d = 0,26; podobieństwo pierwszego akapitu do frazy d = 0,30; liczba typów schema d = −0,56; schema Article −0,34; liczba słów −0,11 (866 vs 1163); liczba akapitów −0,23; domeny .gov/.edu/.org d = −0,01; exact-match domain −0,20.
- Uwagi krytyczne: tekst raportu mówi, że schema „nie ma znaczenia”, a tabela pokazuje ujemne d — niespójność wewnętrzna. Wynik dla meta description jest podejrzanie duży (39% stron z TOP10 bez meta description sugeruje artefakt doboru lub pomiaru). Autorzy: tylko korelacje, tylko cechy techniczne, bez jakości treści i sygnałów domeny.
- Siła: średnia-niska (dobra grupa kontrolna, ale niespójności). Finansowanie: dostawca narzędzia SEO.
- Przenoszalność: najwyższa z dostępnych — język polski, polski Google. Dotyczy jednak cytowania strony dla fraz informacyjnych, nie rekomendowania firmy.

**Peec AI — „Listicle Rank Effect” [O]**
https://peec.ai/blog/the-listicle-rank-effect-what-nearly-200-000-ai-responses-across-8-ai-engines-reveal-about-brand-visibility — publ. 14.05.2026; dane wrzesień 2025 – marzec 2026.
- Blisko 200 tys. odpowiedzi z 8 silników (ChatGPT, GPT-5 Search, Claude, Gemini, AI Mode, AIO, Copilot, Perplexity); branże: B2B SaaS, MarTech, finanse USA. Tylko często cytowane zestawienia stron trzecich; listy własne marek wykluczono.
- 1. miejsce w zestawieniu: +16,5 p.p. prawdopodobieństwa wzmianki (B2B SaaS), +13,4 p.p. (MarTech). Efekt większy w silnikach o wąskim doborze źródeł (ChatGPT, Copilot) niż w AIO/AI Mode. Malejące korzyści po kilku wpisach.
- Brak stopy bazowej dla marek nieobecnych na listach. Projekt obserwacyjny — autorzy sami piszą o związkach, nie skutkach.
- Finansowanie: dostawca narzędzia do monitoringu GEO. Rynek/język: nie podano (w praktyce angielski, USA).
- Przenoszalność: średnia co do mechanizmu (modele z wyszukiwaniem czerpią z list „najlepsze X”), niska co do liczb. Dla polskich zapytań o wdrożeniowców takich list prawie nie ma (zob. pkt 3).

**Pozostałe o typach źródeł [W — niezweryfikowane, małe próby, dostawcy]**
- Position Digital: 7 258 cytowań, 7 klientów B2B SaaS; zestawienia 23,1% cytowanych stron — https://www.position.digital/blog/what-content-works-best-in-ai-search/
- Rampiq: ok. 85% cytowań przy zapytaniach kategorii z domen trzecich — https://www.demandgenreport.com/industry-news/news-brief/rampiq-reveals-what-content-ai-search-engines-cite-most-in-b2b/53486/
- Walker Sands H1 2026: usługi profesjonalne z medianą cytowań 2,1% — https://searchengineland.com/b2b-brands-rank-google-appear-ai-overviews-480954
- Wspólny kierunek: przy pytaniach „kto/najlepszy” własna strona marki jest cytowana rzadko; przy pytaniach o samą markę — często.

#### 1.3 Wyniki zerowe i przeciwne

**Ahrefs — dodanie schema nie zwiększa cytowań [O]**
https://ahrefs.com/blog/schema-ai-citations/ — publ. 11.05.2026; zdarzenia sierpień 2025 – marzec 2026; okno 30 dni przed/po.
- Projekt: dopasowane różnice w różnicach. 1 885 stron, które dodały JSON-LD, vs 4 000 stron kontrolnych z innych domen.
- Wynik: AI Overviews −4,6% (istotne statystycznie, przyczyna niewyjaśniona; strony traciły już przed zmianą); AI Mode +2,4% i ChatGPT +2,2% — nieodróżnialne od zera. Surowy wzrost w AI Mode +43% zniknął po odjęciu grupy kontrolnej.
- Ważne: strony cytowane mają JSON-LD prawie 3 razy częściej niż niecytowane — to korelacja, której test przyczynowy nie potwierdził. Dobry przykład, jak korelacje z pkt 1.2 mogą mylić.
- Ograniczenia: wszystkie strony miały już 100+ cytowań w AIO; typy schema zlane w jedno (Article, FAQ, Product, HowTo, Organization); okno 30 dni; rynek nie podany.
- Siła: najmocniejszy projekt w całym zestawie. Finansowanie: Ahrefs (wynik sprzeczny z interesem branży — plus dla wiarygodności).
- Przenoszalność: częściowa. Nie mówi nic o stronach bez cytowań (przypadek REVAGY). Wniosek ostrożny: nie ma dowodu, że JSON-LD REVAGY poprawia cytowania; nie ma też dowodu, że szkodzi.

**searchVIU — AI nie czyta schema przy pobraniu strony [W]**
- Wg omówienia w artykule Ahrefs [O jako cytat pośredni]: ChatGPT, Claude, Perplexity, Gemini i AI Mode przy pobieraniu strony na żywo wyciągały tylko widoczny HTML, ignorując JSON-LD, Microdata i RDFa. Oryginału i próby nie sprawdzono.
- Kontra: Fabrice Canel (Bing) na SMX Munich 2025: schema pomaga LLM-om Microsoftu [W, wypowiedź konferencyjna bez danych].

**SparkToro + Gumshoe — rekomendacje AI są niestabilne [O]**
https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/ — publ. 28.01.2026; dane listopad–grudzień 2025.
- 600 ochotników, 12 promptów (B2C i B2B), 2 961 uruchomień w ChatGPT, Claude i Google AI (AIO, a przy braku — AI Mode).
- Ta sama lista marek dwa razy: mniej niż 1 na 100 uruchomień; ta sama kolejność: mniej niż 1 na 1000.
- Dla promptu B2B „agencja brand design” najczęstsze marki pojawiały się w ok. 30–40% odpowiedzi; dla słuchawek topowe marki w 55–77% (ludzie) i 90–100% (dane Gumshoe).
- Sensowna miara wg autorów: odsetek odpowiedzi z marką przy wielu powtórzeniach; pozycja na liście jest szumem.
- Ograniczenia: autorzy nie są badaczami, brak recenzji; partner Gumshoe sprzedaje monitoring AI (konflikt ujawniony); okno ok. 7 dni; angielski.
- Przenoszalność: wysoka co do wniosku metodycznego — pojedynczy test „czy ChatGPT wymienia REVAGY” niczego nie dowodzi w żadną stronę. W rozdrobnionych kategoriach usług B2B nawet liderzy pojawiają się w mniejszości odpowiedzi.

**Stanowisko Google jako kontrargument** — zob. 1.1: zabieganie o „wzmianki” Google wprost wymienia wśród mitów, co stoi w napięciu z najgłośniejszą korelacją Ahrefs (0,664).

#### 1.4 Ocena zbiorcza pytania 1
- Dobrze poparte: (a) dla Google warunkiem jest zwykła indeksowalność i snippet; (b) dodanie schema nie podnosi cytowań stron już cytowanych; (c) odpowiedzi modeli są losowe, więc pomiar wymaga wielu powtórzeń.
- Poparte tylko korelacjami od dostawców: wzmianki marki poza własną stroną, pozycje w Google, obecność w zestawieniach stron trzecich.
- Nieznalezione: żadne badanie na małych firmach usługowych, żadne w języku polskim dotyczące rekomendacji firm (Senuto bada cytowanie stron, nie marek), żaden eksperyment z losowym przydziałem.

---

#### 2. Dane strukturalne w Google — stan 2026

**FAQPage [O, z zastrzeżeniem]**
- developers.google.com (pobrano https://developers.google.com/search/docs/appearance/structured-data/faqpage; zwrócona treść zawierała datowane wpisy zmian): wpis z 8.05.2026 — funkcja przestaje się wyświetlać od 7.05.2026; wpis z 15.06.2026 — „The FAQ rich result feature is no longer shown in Google Search results.”
- Galeria wyszukiwania https://developers.google.com/search/docs/appearance/structured-data/search-gallery [O]: FAQ nie ma na liście 25 funkcji.
- Tło: od 2023 r. wyniki FAQ były ograniczone do znanych witryn rządowych i zdrowotnych [W — Search Engine Land, https://searchengineland.com/google-to-no-longer-support-faq-rich-results-476957].
- Wg prasy branżowej [W]: znacznik pozostaje poprawny, nie szkodzi; raport FAQ w Search Console i obsługa w teście wyników rozszerzonych miały zniknąć w czerwcu 2026, w API — w sierpniu 2026. Wykonania tych kroków nie potwierdzono.
- Wniosek dla REVAGY: FAQPage w JSON-LD nie daje dziś żadnego wyniku rozszerzonego w Google. Można zostawić (nie szkodzi), ale nie jest to dźwignia.

**Wspierane dziś wg galerii Google [O]** (25 pozycji): Article, Breadcrumb, Carousel, Course list, Dataset, Discussion forum, Education Q&A, Employer aggregate rating, Event, Image metadata, Job posting, Local business, Math solver, Movie, Organization, Product, Profile page, Q&A, Recipe, Review snippet, Software app, Speakable, Subscription and paywalled content, Vacation rental, Video.
- VideoObject (Video): wspierane.
- Organization: wspierane (logo, dane firmy w panelu wiedzy).
- BreadcrumbList: wspierane.
- Local business: wspierane — REVAGY tego typu nie ma na liście swoich znaczników; do rozważenia tylko jeśli firma ma fizyczną siedzibę dla klientów.
- Nie ma na liście: FAQ, HowTo, Sitelinks search box. Service, WebSite i WebPage nie mają własnej funkcji w galerii (nie dają wyniku rozszerzonego; nazwa witryny to osobna dokumentacja, nie sprawdzano).
- Nie sprawdzono: szczegółowych warunków Video (np. wymóg strony, na której wideo jest główną treścią) i Breadcrumb na urządzeniach mobilnych — strony szczegółowe nie były pobierane.

---

#### 3. Źródła dla zapytań „firmy wdrażające automatyzację / AI w Polsce”

**Zastrzeżenie: samych odpowiedzi modeli (ChatGPT, Perplexity, Gemini, Copilot, Tryb AI) nie dało się zbadać.** Poniżej tylko strony istniejące w sieci, znalezione wyszukiwarką działającą z USA.

| Strona | Typ | Kto jest na liście | Płatność / interes |
|---|---|---|---|
| https://clutch.co/pl/developers/artificial-intelligence [O] | katalog | 818 firm „AI w Polsce”; na górze m.in. Simform, Edvantis, Merixstudio, Neoteric, STX Next | Profil podstawowy bezpłatny (wg wiedzy ogólnej, nie sprawdzono cennika); sekcja „Featured Providers” oznaczona „Sponsored”; „We may earn a fee for some placements”. Pozycję budują zweryfikowane opinie klientów |
| https://www.designrush.com/agency/ai-companies/pl [W] | katalog | lista agencji AI w Polsce | część miejsc sponsorowana (wg fragmentu; nie czytano) |
| https://ttms.com/pl/top-7-polskich-firm-dostarczajacych-rozwiazania-ai-w-2025-roku-ranking/ [O] | zestawienie własne | TTMS (1.), Comarch, Synerise, Neurosoft, VoiceLab, Infermedica, SentiOne | Wydawca stawia siebie na 1. miejscu; brak metody; publ. 8.10.2025, tytuł przerobiony na 2026. Wpisu nie da się kupić, lista jest reklamą autora |
| https://ttms.com/pl/najlepsze-firmy-integrujace-ai-w-2026-roku-globalny-ranking-dostawcow-rozwiazan-ai-dla-przedsiebiorstw/ oraz https://ttms.com/pl/top-10-firm-software-house-w-polsce/ [W] | zestawienia własne | jw. — duże firmy | jw. |
| https://techsy.io/pl/blog/najlepsze-firmy-tworzace-agentow-ai-2026 [O] | zestawienie własne | Techsy (1.), LeewayHertz, Markovate, SoluLab, Azumo, Intuz, RTS Labs, Neurons Lab, Master of Code, Alice Labs — żadnej polskiej firmy | Autor = współzałożyciel firmy z 1. miejsca; publ. 7.06.2026, akt. 17.11.2026; tekst tłumaczony na polski |
| https://innowise.com/pl/blog/top-ai-consulting-firms/ [W] | zestawienie własne | globalne firmy doradcze | prawdopodobnie jw. (nie czytano) |
| https://blckalpaca.at/pl/blog/agencja-n8n-porownanie-kryteria-wyboru-i-koszty-2026 [W] | poradnik agencji | kryteria wyboru agencji n8n, bez rankingu | austriacka agencja, treść tłumaczona |
| https://agencies.semrush.com/pl/list/marketing-automation/mid-business/ [W] | katalog partnerów | agencje marketing automation | katalog partnerów Semrush (warunki nie sprawdzone) |
| useme.com — profile wykonawców n8n/Make [W] | platforma freelancerów | pojedyncze osoby | prowizja platformy |
| clickup.com/pl/blog/604846/agenci-ai-dla-malych-firm/, ifirma.pl, symfonia.pl, cloudtalk.io/pl [W] | poradniki producentów | narzędzia, nie wdrożeniowcy | marketing treści producentów oprogramowania |
| ey.com/pl_pl/insights/ai/raport-ey-jak-polskie-firmy-wdrazaja-ai-gc-fy26, parp.gov.pl, forbes.pl, bankier.pl [W] | raporty i media | brak list wdrożeniowców | — |

Obserwacje:
1. Nie znaleziono żadnego polskiego, niezależnego rankingu firm wdrażających automatyzację/agentów AI dla małych firm ani rankingu agencji n8n/Make w Polsce. Dwa zapytania zwróciły poradniki i przeglądy narzędzi, nie listy wykonawców.
2. To, co istnieje, to: (a) katalogi międzynarodowe (Clutch, DesignRush), gdzie dominują software house'y; (b) zestawienia pisane przez samych zainteresowanych, z autorem na 1. miejscu; (c) tłumaczone treści zagranicznych firm.
3. Wniosek jest dwustronny: mała konkurencja o tę niszę w języku polskim, ale też brak „gotowych” list, do których REVAGY mogłoby się dopisać poza Clutch. Wg Peec (pkt 1.2) listy własne były z badania wykluczone, więc nie ma dowodu, że własne zestawienie zadziała; wg Google'a zabieganie o sztuczne wzmianki to mit.
4. Nie sprawdzono: katalogów partnerów n8n i Make, Sortlist, GoodFirms, polskich katalogów (np. Oferteo, ITwiz), LinkedIn, Reddit/Wykop/grup FB. To luka — przy ok. 35 operacjach nie zmieściło się.

---

#### 4. Polska — dane

**Dostępność funkcji [O]**
- Przegląd od AI (AI Overviews): Polska od 26.03.2025, dla zapytań po polsku i angielsku, zalogowani 18+ — https://blog.google/intl/pl-pl/nowosci-produktowe/funkcja-przeglad-od-ai-teraz-dostepna-w-wiekszej-liczbie-krajow-europy/
- Tryb AI (AI Mode): ogłoszony w Polsce 8.10.2025 (36 nowych języków, blisko 50 krajów) — https://blog.google/intl/pl-pl/nowosci-produktowe/wyszukiwarka-google-wprowadzamy-tryb-ai-w-polsce/. Sam wpis nie mówi wprost „po polsku”; prasa (benchmark.pl, komputronik) podaje, że polski jest wśród języków [W].
- Liczb użycia Trybu AI w Polsce: brak danych.

**Zasięg AI Overviews w Polsce — Senuto [O]**
https://insight.senuto.com/aio-report-2/ — v2.0 z 27.11.2025; próba 17 763 868 fraz z polskiej bazy.
- 28,95% fraz wyświetla AIO (+4,78 p.p. vs sierpień 2025).
- 14,87% wolumenu wyszukiwań (−2,03 p.p. vs wrzesień 2025) — AIO częściej przy frazach niszowych.
- Wg intencji: informacyjne 38,37%, transakcyjne 8,09%, nawigacyjne 6,12%, lokalne 6,08%. Lejek: TOFU 38,19%, MOFU 19,44%, BOFU 7,23%.
- Średnio 19,23 cytowań na odpowiedź. Najczęściej cytowane: pl.wikipedia.org, facebook.com, doz.pl, gov.pl, en.wikipedia.org.
- Dane GSC z 1 442 domen: mediana zmiany kliknięć r/r czerwiec −19,4%, sierpień −21,6%, październik −19,9% (maj–październik 2025 vs 2024). CTR przy AIO średnio −19,5%; brand −8,7%, non-brand −28,9% — autorzy sami nazywają wyniki na poziomie fraz poglądowymi.
- Ograniczenia: dostawca narzędzia; dane sprzed roku; spadku kliknięć nie da się przypisać samemu AIO (brak filtra w GSC); nowszej edycji (2026) nie znaleziono.
- Znaczenie dla REVAGY: zapytania o wybór wykonawcy to dolna część lejka, gdzie AIO pojawiało się rzadko (BOFU 7,23%). Poradnikowe frazy o automatyzacji — często.

**Udział narzędzi AI w ruchu**
- Polska: brak danych o udziale AI w ruchu na strony lub w wyszukiwaniach.
- Globalnie, Ahrefs Web Analytics [O] https://ahrefs.com/pl/benchmarks/ai-vs-search — październik 2026, 118 671 witryn: wyszukiwarki 27,55% wizyt (Google 24,74%), asystenci AI 0,46% (ChatGPT 0,36%, Gemini 0,02%, Perplexity 0,01%, Claude 0,01%). Około 60 razy więcej wizyt z wyszukiwarek. Bez podziału na kraje; próba = użytkownicy darmowego narzędzia Ahrefs; kanał „nieznany” 19,03%. Uwaga: mierzy kliknięcia, nie wpływ odpowiedzi bez kliknięcia.
- Liczba użytkowników ChatGPT w Polsce: Mediapanel Gemius/PBI, czerwiec 2025 — 9,3 mln realnych użytkowników [W; źródła: https://gemius.com/blog/how-do-polish-internet-users-use-chatgpt-the-results-of-the-report-are-now-available/, https://spidersweb.pl/2025/08/chatgpt-w-polsce-statystyki-uzytkownikow.html]. Danych za 2026: brak.
- StatCounter, udziały czatbotów AI w Polsce [O, wynik niepewny] https://gs.statcounter.com/ai-chatbot-market-share/all/poland — pobranie zwróciło dla października 2026: ChatGPT 43,5%, Gemini 42,59%, Perplexity 9,56%, Claude 2,43%, Copilot 1,92%. Fragmenty wyszukiwarki dla tej samej strony podawały za sierpień 2026 ChatGPT 83,99% i Gemini 9,99%, a prawie identyczne 43/43 dla całej Europy. Skok o 40 p.p. w dwa miesiące jest mało prawdopodobny — możliwy błąd odczytu regionu albo zmiana metody. NIE używać bez ręcznego sprawdzenia. Strona nie definiuje, co mierzy.
- USA/świat, Similarweb przez TechCrunch 27.07.2026 [W]: AIO w 43% wyszukiwań (rok wcześniej 15%); bez opublikowanej próby zapytań. Niemcy, Sistrix [W]: ok. 20% fraz. Rozrzut pokazuje, że wynik zależy od próby — polskich 28,95% / 14,87% nie należy zestawiać z 43%.

---

#### 5. Co z tego jest pewne dla REVAGY, a co nie

Pewne (źródła pierwotne): FAQPage nie daje wyniku rozszerzonego od maja 2026; Organization, Breadcrumb i Video są nadal wspierane; Google nie wymaga niczego specjalnego dla AIO/Trybu AI poza indeksowalnością; AIO i Tryb AI działają w Polsce.

Prawdopodobne (korelacje, dostawcy, inne rynki): przy pytaniach „kto wdraża…” modele z wyszukiwaniem cytują głównie strony trzecie, a nie stronę firmy; obecność marki poza własną domeną idzie w parze z widocznością.

Niewiadome: czy cokolwiek z tego działa dla nowej, małej, polskojęzycznej firmy usługowej; co modele faktycznie odpowiadają na polskie zapytania o wdrożeniowców; jaka część polskich klientów B2B w ogóle pyta o wykonawcę w narzędziach AI.

Najtańszy sposób zamknięcia głównej luki (do zrobienia ręcznie, poza tym strumieniem): 5–8 polskich zapytań × 10 powtórzeń w ChatGPT, Perplexity, Gemini i Trybie AI, z zapisem wymienionych firm i cytowanych adresów. Zgodnie ze SparkToro mniej powtórzeń nie da wiarygodnego obrazu.


---

## Część C. Strumień „miejsca” — gdzie umieścić markę REVAGY (stan na 22.11.2026)

Materiał dowodowy, nie raport. Tylko odczyt; nic nie rejestrowano.

**Operacje sieciowe: 49** (21 wyszukiwań, 28 otwarć stron). Wyszukiwarka narzędzia działa z lokalizacji USA — wyniki dla polskich fraz są uboższe niż w polskim Google, a operatory `OR`/cudzysłowy bywały ignorowane.

**Błędy dostępu (8):**
- help.clutch.co/…/how-do-i-create-a-company-profile — 404
- goodfirms.co/get-listed — 403
- sortlist.com/providers — 403
- designrush.com/agency/get-listed — 404
- aleo.com/pl — 403
- panoramafirm.pl (wyniki wyszukiwania) — zapora antybotowa (Anubis/WeNet), brak treści
- sodapl.com/dolacz-do-nas — 404
- bing.com/forbusiness (po przekierowaniu z bingplaces.com) — strona zwróciła pustą treść
- dodatkowo: businessconnect.apple.com przekierowuje na business.apple.com (nie otwierano dalej); adres pomocy LinkedIn okazał się nietrafiony (inna treść)

Oznaczenia: **Z** = zweryfikowano na stronie źródłowej; **W** = tylko z wyniku wyszukiwania (fragment), nie otwierano strony; **NZ** = nie zweryfikowano.

Kolumna „dofollow”: w żadnym przypadku nie dało się ustalić (narzędzie zwraca treść przetworzoną, bez atrybutów `rel`) — wszędzie **nieustalone**, pominięto w tabelach.

---

#### 6. Co już istnieje o marce (najpierw, bo wpływa na resztę)

Zapytania: `"revagy"`, `"revagy.pl"`, `revagy.pl automatyzacja procesów AI`, `revagy Iława automatyzacja`.

| Adres | Co to jest | Status |
|---|---|---|
| github.com/dskibickikono-lang/RevAGY (+ PR #2, #5, #8, #22, #24) | **Publiczne** repozytorium strony; opis „Website”, w treści: REVAGY — automatyzacja procesów i wdrożenia AI w B2B, revagy.pl, Astro, Matomo, adres kontakt@revagy.pl. To jedyne wystąpienie marki, które wyszukiwarka zwróciła. Publicznie widać tytuły PR-ów, karty zadań, historię zmian (w tym wycofanie nowej odsłony). | W (wiele wyników) |
| linkedin.com/company/revagy | Znany profil — **nie pojawił się** w żadnym z 4 zapytań | nie wystąpił w wynikach |
| revagy.pl | Własna strona — **nie pojawiła się** w wynikach żadnego zapytania (również na `"revagy.pl"`) | nie wystąpiła w wynikach |
| Revagy, LLC (Lenexa, Kansas, USA) | **Inny podmiot o tej samej nazwie**: firma rozliczeń laboratoryjnych, wpis w rejestrze stanowym (Missouri, 11.09.2023), profile osób w ZoomInfo | W |

Wnioski faktograficzne: (1) poza własną stroną, LinkedIn i GitHubem marka nie ma śladu w indeksie; (2) istnieje kolizja nazwy z amerykańską spółką — encja „Revagy” nie jest jednoznaczna; (3) repozytorium jest publiczne i dziś jest najsilniej widocznym źródłem o marce — do decyzji właściciela, czy to zamierzone.

Na frazę „automatyzacja Iława” widoczny konkurent: justautomate.ai/ilawa/automatyzacja-biznesu/ (Z) — agencja ogólnopolska (PL/DACH/UK), cena warsztatu podana na stronie: 2500 zł netto/tydzień; adres URL z nazwą miasta (strony lokalne), choć treść nie wspomina Iławy.

---

#### 1. Profile firmowe

| Miejsce | Adres | Działa | Koszt | Pasująca kategoria | Wymagania wejścia | Polscy konkurenci | Status |
|---|---|---|---|---|---|---|---|
| Google Business Profile | business.google.com; zasady: support.google.com/business/answer/13763036 i /3038177 | tak | bezpłatne (brak wzmianki o opłatach) | brak danych (listy kategorii nie sprawdzano) | **Patrz niżej — firma wyłącznie zdalna się nie kwalifikuje** | brak danych | Z (wytyczne) |
| Bing Places | bingplaces.com → bing.com/forbusiness | adres działa, przekierowuje | NZ | NZ | NZ | NZ | NZ (pusta treść) |
| Apple Business Connect | businessconnect.apple.com → business.apple.com | adres działa, przekierowuje | NZ | NZ | NZ | NZ | NZ |
| LinkedIn — strona firmowa | linkedin.com/company/revagy | istnieje (wg zlecenia) | bezpłatne (NZ na żywo) | NZ | Funkcje (usługi, strony produktowe, newsletter) — **nie zweryfikowano**, strona pomocy nie otworzyła właściwej treści | NZ | NZ |
| Facebook / YouTube | — | — | — | — | nie sprawdzano (budżet operacji) | — | NZ |
| Wikidata | wikidata.org/wiki/Wikidata:Notability | tak | bezpłatne | n/d | Kryteria (cytaty): 1) co najmniej jeden link do strony w projekcie Wikimedia; 2) „clearly identifiable conceptual or material entity… that can be described using serious and publicly available references”; 3) „fulfills a structural need”. Strona nie wymienia firm ani autopromocji; zasady „intentionally left a bit vague”, spory → wniosek o usunięcie. | brak danych | Z |
| Crunchbase | crunchbase.com | NZ | NZ | NZ | NZ | NZ | NZ (nie sprawdzano) |

#### Google Business Profile — zasady dla firmy zdalnej / pod adresem domowym (Z, cytaty)

Źródło 1: „Business eligibility and ownership guidelines” (answer/13763036):
- „To qualify for a Business Profile, a business must make in-person contact with customers during its stated hours.”
- Niekwalifikujące się: „Brands, organizations, artists, and other online-only businesses.”; także firmy z adresem w skrytce pocztowej.

Źródło 2: „Wytyczne dotyczące prezentowania firmy w Google” (answer/3038177, wersja PL i EN):
- Profil może mieć firma, która „ma placówkę stacjonarną, którą mogą odwiedzać klienci, albo świadczy usługi u nich na miejscu”.
- Firma bez oznaczonej placówki, która „świadczy usługi w fizycznych lokalizacjach klientów”, może mieć **jeden** profil firmy działającej na określonym obszarze; obszar „w zasięgu maksymalnie 2 godzin jazdy od lokalizacji firmy” (w niektórych branżach dopuszczalny większy).
- „Jeśli masz firmę działającą na określonym obszarze, ukryj jej adres przed klientami.”; przy rejestracji pod adresem zamieszkania — „usuń adres z profilu firmy”.
- Wirtualne biuro: „ta lokalizacja nie kwalifikuje się”; coworking tylko gdy „dobrze oznaczone” i obsadzone w godzinach otwarcia.

Odczyt dla REVAGY (interpretacja, nie cytat): obsługa **wyłącznie zdalna** = kategoria „online-only” = brak kwalifikacji. Profil jest zgodny z zasadami tylko wtedy, gdy firma faktycznie spotyka się z klientami osobiście (np. warsztaty/wdrożenia w siedzibie klienta) — wtedy jako firma działająca na określonym obszarze, z ukrytym adresem domowym i obszarem ograniczonym do ok. 2 h jazdy od Iławy. Profil nie obejmie więc „całej Polski”.

---

#### 2. Katalogi międzynarodowe usług B2B

| Miejsce | Adres | Działa | Koszt | Pasująca kategoria | Wymagania / firma bez opinii | Polscy konkurenci | Status |
|---|---|---|---|---|---|---|---|
| Clutch | clutch.co/get-listed | tak | Basic: „Free”; Verified: „$499/year” (ze strony) | tak: AI Consulting (170 firm PL), AI as a Service (99), AI developers (672), podkategorie „AI Agents”, „Robotics Process Automation” | Basic: „No Clutch Verification”; strona nie mówi, że opinie są wymagane do wpisu. Na liście clutch.co/pl/consulting/ai w widocznej części najniższa liczba opinii = 3; pierwsze miejsca to wpisy sponsorowane | Office Samurai (RPA 30%), Atomic Actions (RPA 25%), Automation Fans (Szczecin, RPA, zał. 2022), Make Automation (Warszawa, 1 opinia), Neoteric, deepsense.ai | Z |
| GoodFirms | goodfirms.co | tak (strony kategorii w wynikach) | brak danych (403) | NZ | Ze stron kategorii: do rankingu potrzeba „≥ 1 published review in this category”; płatne PRO daje odznaki i reklamy | NZ | W |
| Sortlist | sortlist.com | NZ (403) | brak danych | NZ | NZ | NZ | NZ |
| DesignRush | designrush.com | NZ (404 na adresie wpisu) | wg jednego bloga (niepotwierdzone na stronie): wpis bezpłatny, sponsoring od 500 USD/mies. | NZ | wg bloga: portfolio i nagrody ważą więcej niż opinie | NZ | W (źródło wtórne) |
| The Manifest | themanifest.com | nie sprawdzano | — | — | — | — | NZ |
| G2 (usługi) | g2.com | nie sprawdzano | — | — | — | — | NZ |

---

#### 3. Polskie katalogi, bazy, ekosystem AI, stowarzyszenia

| Miejsce | Adres | Działa | Koszt | Pasująca kategoria | Wymagania | Polscy konkurenci | Status |
|---|---|---|---|---|---|---|---|
| Panorama Firm | panoramafirm.pl/dodaj-firme.html | tak | wpis bezpłatny (wg strony „dodaj firmę”); płatne pakiety — ceny brak danych | NZ (zapora antybotowa) | brak danych | NZ | W |
| ALEO | aleo.com/pl | NZ (403) | brak danych | NZ | NZ | NZ | NZ |
| pkt.pl | pkt.pl | nie sprawdzano osobno; brak w wynikach | brak danych | NZ | NZ | NZ | NZ |
| Firmy.net | firmy.net | brak w wynikach | brak danych | NZ | NZ | NZ | NZ |
| rejestr.io | rejestr.io | nie sprawdzano | — | — | — | — | NZ |
| Oferteo | oferteo.pl/cennik | tak | dla wykonawców płatne pakiety punktów (kwot nie odczytano ze strony); dla zlecających bezpłatne | w wynikach brak kategorii AI/automatyzacja (widoczne: „Księgowy”, „Malowanie mieszkań”) | zakup punktów | brak danych | W |
| Fixly | fixly.pl | NZ | model punktowy (źródło z 2021 r., nieaktualne) | profil: fachowcy dla konsumentów — słabe dopasowanie | — | brak danych | W |
| Useme | useme.com/pl/pricing | tak | prowizja 7,8% wartości zlecenia, min. 29 zł, maks. 349 zł (wg wyniku) | platforma rozliczeń freelancerów (baza „ponad 300 tys. specjalistów”) — to narzędzie rozliczeń, nie katalog firm | — | brak danych | W |
| Przegląd firm AI — Ministerstwo Cyfryzacji / GRAI | gov.pl/web/ai/promujinnowacje | strona istnieje | brak wzmianki o opłatach | „przedsiębiorstwa i startupy budujące innowacje przy użyciu AI” | formularz; **nabór zakończony**: „Na odpowiedzi czekamy do 30 listopada 2023” | brak danych | Z |
| Mapa polskich firm AI (WEG, Jan Szumada) | adres źródłowy nieustalony (relacja: borncity.com) | aktualizacja listopad 2026, ponad 120 firm | brak danych | firmy z własną technologią AI | wg relacji: **zespół min. 5 osób i własna technologia AI** → jednoosobowa firma wdrożeniowa nie spełnia | brak danych | W (jedno źródło wtórne) |
| „Mapa” 4 996 → 417 startupów AI | post na LinkedIn, autor/metodyka nieustalone | brak danych | — | startupy AI | — | — | W |
| Digital Poland / AI Poland, aimap | — | **nie znaleziono** w wynikach | — | — | — | — | NZ |
| SoDA | sodapl.com | organizacja działa (160–200 firm wg różnych źródeł) | składka istnieje, kwota brak danych | software house’y / usługi IT | warunki i minimalna wielkość — brak danych (strona 404) | członkowie to software house’y (np. Deviniti, e-point, Evojam) | W |
| PIIT | piit.org.pl | nie sprawdzano | — | — | — | — | NZ |
| Izba przemysłowo-handlowa Warmia-Mazury / lokalne izby | — | **nie znaleziono** strony ani zasad | brak danych | — | — | — | NZ |

---

#### 4. Katalogi partnerów producentów narzędzi

| Program | Adres | Działa | Koszt | Wymagania wejścia | Polskie firmy | Status |
|---|---|---|---|---|---|---|
| Make — Partner Directory | make.com/en/partners-directory; make.com/en/partners | tak | brak danych | Poziomy Silver/Gold/Platinum; kryteriów brak na stronie („proven track record across automation projects”); ścieżki: Solution partner (zapis przez portal partnerski), Certified partner („Take our course to earn your certification”) | Filtr „Headquarter Countries” zawiera Polskę; wśród 9 pierwszych partnerów żadnego z Polski (reszta pod „Load more” — nie sprawdzono) | Z |
| n8n — Expert Partners | n8n.io/expert-partners, n8n.io/become-an-expert, experts.n8n.io | tak; 48 partnerów w katalogu | brak wzmianki o opłatach | **Zamknięty pilotaż, lista oczekujących**; „Have at least 3 active n8n customers”; automatyzacja i AI jako główne usługi; aktywność w społeczności; **regiony: UK, Irlandia, Europa Północna, Ameryka Północna** (Polska niewymieniona) | wg wyniku wyszukiwania: „MakeAutomation” (experts.n8n.io/partner/makeautomation) opisany jako partner z Polski; na 1. stronie katalogu polskich nie widać | Z (zasady) / W (polski partner) |
| Zapier — Solution Partner Directory | zapier.com/partnerdirectory | tak; 31 partnerów | brak danych | Poziomy (np. Platinum), tytuł „Zapier Certified Expert”; warunków brak na stronie katalogu | „Seamless Automation” — „Mówimy po polsku!” (siedziba nieustalona) | Z (część strony) |
| Microsoft AI Cloud Partner Program | partner.microsoft.com/membership | tak | zapis „at no cost”; Partner Launch Benefits 350 USD; oznaczenie Solutions Partner 4 730 USD/rok | bezpłatne konto + weryfikacja firmy; oznaczenia wymagają punktacji (nie badano) | brak danych | W (learn.microsoft.com / partner.microsoft.com) |
| UiPath | uipath.com | nie sprawdzono | — | — | — | NZ |
| Anthropic / Claude | anthropic.com/partners → claude.com/partners/powered-by-claude | tak | brak danych | „Powered by Claude” to lista **kuratorowana** (66 podmiotów), nie zapis otwarty; linki „Claude partner network” i „Service partners” istnieją, warunków nie odczytano | brak danych | Z (częściowo) |
| OpenAI | — | nie sprawdzono | — | — | — | NZ |

---

#### 5. Media, podcasty, wydarzenia

| Medium | Obszar | Artykuły gościnne/eksperckie | Płatne | Strona z zasadami | Status |
|---|---|---|---|---|---|
| ITwiz | IT dla biznesu | zasad dla autorów zewnętrznych brak; oferta: debaty redakcyjne, programy lead generation (webinary, raporty, „artykuły redakcyjne i opisy wdrożeń”), patronaty | tak (oferta komercyjna), cennika brak | itwiz.pl/category/oferta-itwiz/ ; kontakt: itwiz.pl/zespol/ | Z |
| MamStartup | startupy, biznes | brak opisu artykułów gościnnych i sponsorowanych; „ponad 100 tys. czytelników” mies., newsletter ponad 10 tys. (dane własne serwisu) | oferta indywidualna, cen brak | mamstartup.pl/reklama/ ; mamstartup.pl/kontakt/ | Z |
| NowyMarketing | marketing | brak zasad; tylko zaproszenie do kontaktu („Chcesz zaprezentować swoje usługi lub produkt…”) | oferta indywidualna, cen brak | nowymarketing.pl/reklama/ (ten sam opiekun sprzedaży co MamStartup — Antygrupa) | Z |
| Logistyka.net.pl | logistyka | „Artykuł sponsorowany na portalu… Masz pełną kontrolę nad treścią”; artykuł promocyjny w czasopiśmie | tak; kwot nie odczytano | logistyka.net.pl/pliki/oferta-reklamowa_v_3-2.pdf (i _logistyka_v5.pdf); reklama@medialogistyka.pl | W |
| MM Magazyn Przemysłowy | produkcja | istnieje media kit z kalendarzem tematów; polityki autorskiej nie widać | brak danych | media kit 2024 (PDF w wynikach) | W |
| Log24 / Eurologistics | logistyka | brak danych (w wynikach tylko kategorie „Produkcja”, „Cyfryzacja”) | brak danych | nie znaleziono | NZ |
| Antyweb | technologie | formularz „Opowiedz o swoim biznesie” (redakcja może odrzucić); osobno artykuły sponsorowane | oba warianty | antyweb.pl/opowiedz-o-swoim-biznesie ; antyweb.pl/rodzaje-tresci-na-antyweb | W |
| Poradnik Przedsiębiorcy | MŚP, księgowość | istnieje strona „Warunki współpracy” | brak danych | poradnikprzedsiebiorcy.pl/warunki-wspolpracy | W |
| Dziennik Internautów | technologie | regulamin publikacji gościnnych | brak danych | di.com.pl/policy-guestposts.html | W |
| CRN, Computerworld, AI Business (aibusiness.pl), sztucznainteligencja.org.pl, Brief, Mam Biznes | IT / AI / biznes | nie znaleziono | brak danych | nie znaleziono | NZ |
| infor.pl (kadry, księgowość), Rzeczpospolita, portale o KSeF | finanse | publikują wypowiedzi ekspertów zewnętrznych; procedury zgłoszenia nie znaleziono | brak danych | nie znaleziono | NZ |
| HRpolska, Puls HR | HR | nie znaleziono | brak danych | nie znaleziono | NZ |
| Control Engineering Polska, Produkcja.expert | produkcja | nie znaleziono | brak danych | nie znaleziono | NZ |

**Wydarzenia (W):** Automation 2027 (Warszawa, 5–7.05.2027, nabór referatów, profil techniczno-przemysłowy, easychair.org/cfp/automation2027); BIS 2027 (Poznań, 23–25.06.2027, akademicka, termin zgłoszeń 10.01.2027); AI Business Forum (Warszawa, edycja 2026 odbyła się); Kongres „Cyfrowa transformacja w biznesie 2026”; UiPath Fusion Warsaw; Creatio No-Code Day Warsaw; śniadania Symfonii (wydarzenia producentów). Zasad zgłaszania prelegentów w wydarzeniach biznesowych nie ustalono.
**Podcasty:** nie znaleziono żadnego (wyszukiwanie nie zwróciło wyników) — NZ.

---

## Ranking 10 miejsc — stosunek efektu do nakładu (tylko na podstawie zebranych faktów)

1. **Strona firmowa LinkedIn — uzupełnienie.** Jedyny istniejący profil, a mimo to nie pojawia się w wynikach na nazwę marki. Koszt zerowy, bez barier wejścia. (Lista pól do wypełnienia — niezweryfikowana.)
2. **Clutch, profil Basic.** Potwierdzone: bezpłatny, bez weryfikacji; kategorie dokładnie pasujące (AI Agents, RPA, AI Consulting); obecni polscy konkurenci, w tym mali (Make Automation z 1 opinią). Ograniczenie: widoczne pozycje mają min. 3 opinie, góra listy to wpisy sponsorowane — bez opinii profil da encję i link, nie widoczność w rankingu.
3. **Uporządkowanie tego, co już jest: publiczne repozytorium GitHub.** To dziś jedyne wystąpienie marki w indeksie; zerowy nakład na decyzję (zostawić świadomie z dobrym opisem albo ukryć).
4. **Katalog partnerów Make.** Filtr „Polska” istnieje, w pierwszej dziewiątce brak polskich firm; ścieżka przez kurs i portal partnerski. Kryteria i koszt nieznane — do potwierdzenia przed decyzją.
5. **Katalog partnerów Zapier.** 31 partnerów, jedna oferta po polsku — mała konkurencja; warunki nieznane.
6. **Panorama Firm — wpis bezpłatny.** Bezpłatność potwierdzona fragmentem strony; kategorii i konkurentów nie udało się sprawdzić.
7. **Microsoft AI Cloud Partner Program — poziom podstawowy.** Zapis bezpłatny z weryfikacją firmy; płatne są dopiero pakiety (350 USD) i oznaczenia (4 730 USD/rok). Czy poziom bezpłatny daje publiczny wpis w katalogu — nieustalone.
8. **Google Business Profile — warunkowo.** Tylko jeśli firma faktycznie spotyka się z klientami osobiście; wtedy profil obszarowy z ukrytym adresem, zasięg ok. 2 h jazdy. Przy pracy wyłącznie zdalnej — niezgodny z wytycznymi (ryzyko zawieszenia).
9. **Antyweb „Opowiedz o swoim biznesie” / Poradnik Przedsiębiorcy / Dziennik Internautów.** Jedyne media, dla których znaleziono publiczną ścieżkę zgłoszenia lub regulamin; warunków nie czytano.
10. **Logistyka.net.pl — artykuł sponsorowany.** Jedyne medium branżowe z grupy docelowej (logistyka) z potwierdzoną, opisaną ofertą publikacji; płatne, kwota nieznana.

**Poza rankingiem — dziś nieosiągalne lub słabo dopasowane (fakty):** n8n Expert Partners (zamknięty pilotaż, min. 3 aktywnych klientów, regiony bez Polski); mapa WEG (min. 5 osób i własna technologia AI); przegląd Ministerstwa Cyfryzacji (nabór zamknięty 30.11.2023); Wikidata (wymaga „serious and publicly available references” — obecnie brak jakichkolwiek źródeł zewnętrznych o marce); GoodFirms (ranking wymaga min. 1 opinii); „Powered by Claude” (lista kuratorowana); Fixly/Oferteo (brak kategorii AI/automatyzacja w wynikach); Useme (narzędzie rozliczeń, nie katalog).

---

## Czego nie ustalono

- Atrybut dofollow/nofollow — dla żadnego miejsca.
- Bing Places, Apple Business Connect, Crunchbase, Facebook, YouTube — zasady i koszt.
- LinkedIn — aktualna lista funkcji strony firmowej (usługi, strony produktowe, newsletter).
- Sortlist, DesignRush (warunki ze strony źródłowej), The Manifest, G2.
- ALEO, pkt.pl, Firmy.net, rejestr.io — czy wpis powstaje automatycznie z rejestru, czy można go edytować, koszt.
- Kategorie i obecność konkurentów w Panoramie Firm.
- Digital Poland / AI Poland / aimap — czy istnieje aktualna mapa i jak się zgłosić; adres źródłowy mapy WEG.
- SoDA, PIIT, izby gospodarcze Warmii i Mazur — warunki i składki.
- UiPath, OpenAI — programy partnerskie; Make i Zapier — dokładne kryteria i koszty; czy bezpłatny poziom Microsoftu daje publiczny wpis.
- Zasady publikacji eksperckich w: CRN, Computerworld, AI Business, sztucznainteligencja.org.pl, Brief, Mam Biznes, infor.pl, Rzeczpospolita, portale KSeF, HRpolska, Puls HR, Log24, Control Engineering Polska, Produkcja.expert. Ceny artykułów sponsorowanych — nigdzie.
- Podcasty — żadnego nie zidentyfikowano.
- Czy linkedin.com/company/revagy i revagy.pl są w ogóle zaindeksowane w polskim Google (wyszukiwarka narzędzia działa z USA).
