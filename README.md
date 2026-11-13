# RevAGY

Strona firmy REVAGY (automatyzacja procesów i wdrożenia AI w B2B), docelowo pod `https://revagy.pl`.

Statyczna strona bez builda i bez zależności: HTML, CSS, czysty JS, własne fonty i własne filmy.
Analityka jest własna (Matomo na `stats.revagy.pl`) i włącza się po zgodzie odwiedzającego.

## Uruchomienie

```bash
cd site
python3 -m http.server 8000
# http://localhost:8000
```

## Struktura

| Ścieżka | Zawartość |
|---|---|
| `site/index.html` | strona główna (12 sekcji) |
| `site/polityka-prywatnosci.html`, `site/404.html` | podstrony |
| `site/assets/css/styles.css` | style, tokeny kolorów i typografii na górze pliku |
| `site/assets/js/app.js` | animacje i interakcje (menu, liczniki, kalkulator, sticky scroll, karuzela, FAQ) |
| `site/assets/js/analytics.js` | baner zgody i zdarzenia dla Matomo (adres i identyfikator strony na górze pliku) |
| `site/assets/video/` | 3 filmy (`.webm` + `.mp4`) i plakaty `.jpg` |
| `site/assets/fonts/` | Onest, Instrument Sans, JetBrains Mono (SIL OFL 1.1, licencje obok) |
| `tools/scenes/` | źródła filmów i grafiki do udostępniania: animowane sceny HTML |
| `tools/render-videos.cjs`, `tools/render-images.cjs` | generują filmy, grafikę `og.jpg` i ikony |
| `tools/smoke-test.cjs` | test dymny w Chromium (37 sprawdzeń) |
| `deploy/` | konfiguracja nginx, Matomo, raport z logów, rotacja logów, skrypt wydania |
| `deploy/PROMPT-AGENT-VPS.md` | prompt dla agenta, który wdraża stronę na VPS |
| `kono-state/` | rejestr decyzji i karty zadań |

## Test

```bash
cd site && python3 -m http.server 8000 &
node tools/smoke-test.cjs http://localhost:8000     # lokalnie
node tools/smoke-test.cjs https://revagy.pl         # po wdrożeniu (statystyki są zastępowane atrapą)
```

## Wdrożenie

Wdrożenie wykonuje agent na serwerze właściciela według `deploy/PROMPT-AGENT-VPS.md`, z gałęzi `main`.
Po zmianie stylów lub skryptów podbij parametr `?v=` w plikach HTML, żeby przeglądarki pobrały nową wersję.

## Analityka

| Warstwa | Co zapisuje | Kiedy |
|---|---|---|
| Matomo (`stats.revagy.pl`) | odsłony, źródło wejścia, kliknięcia z nazwą sekcji, widoki i czas sekcji, przewinięcie, aktywny czas, ustawienia kalkulatora, IP, przeglądarka | po zgodzie w banerze |
| Logi nginx + GoAccess (`stats.revagy.pl/logi/`) | IP, user agent, adres, strona odsyłająca, kod odpowiedzi każdego żądania, także botów | zawsze, 90 dni |

## Filmy

Filmy są własne: powstają z animowanych scen w `tools/scenes/`. Po zmianie sceny:

```bash
node tools/render-videos.cjs            # wszystkie
node tools/render-videos.cjs hero-flow  # jedna scena
```

Wymaga Playwrighta z Chromium oraz `ffmpeg`. Scenę można też otworzyć w przeglądarce i obejrzeć na żywo.

## Wzorzec i granica kopiowania

Układ, rytm sekcji i rodzaj animacji są wzorowane na stronie Revolut Business „konta wielowalutowe”
(decyzje D-002 i D-003 w `kono-state/decisions/REJESTR_DECYZJI_BIZNESOWYCH.md`). W repo nie ma żadnych
zasobów, tekstów, fontów ani filmów Revoluta.

## Treści poglądowe

Widoki ekranów w makietach i filmach oraz nazwy firm w przykładach są poglądowe i tak opisane w stopce.
Liczby w sekcji pod hero („14 dni”, „120+”, „60%”, „24/7”) to deklaracje firmy przyjęte decyzją D-009.
