---
id: T-024
title: "Baner zgody: zdanie o miejscu danych po włączeniu Microsoft Clarity"
channel: pm-local
requested_by: owner
status: wdrozone
created: 2026-11-22
updated: 2026-11-22
branch: fix/baner-zgody-clarity
base: main (c1f4d5c)
depends_on: T-022
pr: https://github.com/dskibickikono-lang/RevAGY/pull/28 (scalony do main)
sha: 9156d5321e2eeb7985517b23ea204c4f4f571180 (kod i kontrakt); main po scaleniu PR #28: 7cd0f71f89d60f7262de0db106545a18f48d7dbb
decisions: [D-015, D-021, D-039, D-040]
---

# T-024 — Baner zgody: zdanie o miejscu danych po włączeniu Microsoft Clarity

## Cel

Po T-022 (D-039) statystyki po zgodzie zbiera także Microsoft Clarity. Zdanie banera zgody
„Dane zostają na naszym serwerze.” przestało więc być prawdą. Baner ma mówić to samo co polityka prywatności.
Wygląd, układ i pozostałe teksty bez zmian (D-015, D-021).

Decyzja właściciela z 22.11.2026: nagłówek CSP dopuszczający Clarity zostaje na serwerze niepodmieniony,
dopóki baner nie zostanie poprawiony. Nagłówki zostaną podmienione razem z wydaniem tej poprawki.

## Zakres

1. `public/assets/js/analytics.js`: w treści banera jedno zdanie zastąpione nowym (sekcja niżej).
   Reszta banera, logika zgody i zdarzenia Matomo bez zmian.
2. Wersja skryptu `analytics.js?v=4` → `?v=5` w `src/layouts/BaseLayout.astro`, `src/layouts/PodstronaLayout.astro`,
   `tools/validate-dist.cjs` (lista skryptów stron) i `tools/podstrony.json`. Zmienia się jedna wartość atrybutu
   `src` na wszystkich 12 stronach.
3. Migawka strony głównej: `tools/baseline/index.baza.html` = `tools/baseline/index.html` z `main` (43efbf5),
   `tools/baseline/index.html` z jedną zmianą wersji skryptu; plik etapu `tools/etapy/zmiana-strony-glownej.json`.
4. `tools/smoke-test.cjs`: przy pierwszej wizycie na stronie głównej test sprawdza, że tekst banera zawiera
   „Microsoft Clarity” i nie zawiera „zostają na naszym serwerze”.
5. Kontrakt `tools/dom-contract.json` liczy PM z builda CI (nowa suma `analytics.js`, wpisy 12 stron).

## Brzmienie do akceptacji właściciela

Tekst prawny zatwierdza właściciel.

- **Było:** „Dane zostają na naszym serwerze.”
- **Jest (propozycja):** „Statystyki prowadzimy na własnym serwerze (Matomo) i w narzędziu Microsoft Clarity.”
  To samo sformułowanie co w zdaniu wstępnym polityki prywatności po T-022.
- **Wariant do wyboru:** „Dane trafiają na nasz serwer (Matomo) i do Microsoft Clarity, które zapisuje też przebieg
  wizyty.” Polityka prywatności mówi o nagraniach wizyt w Clarity; ten wariant mówi o tym wprost już w banerze.
  Właściciel decyduje, czy baner ma to mówić.

Cały akapit banera po zmianie:

> Za Twoją zgodą zapisujemy, które sekcje oglądasz, w co klikasz i jak długo, razem z adresem IP i danymi
> przeglądarki. Statystyki prowadzimy na własnym serwerze (Matomo) i w narzędziu Microsoft Clarity.
> Szczegóły: polityka prywatności.

## Strona główna: różnica migawki względem bazy

Baner jest wstawiany skryptem, więc HTML strony głównej zmienia się tylko o wersję skryptu. Baza
`tools/baseline/index.baza.html` to `tools/baseline/index.html` z `main` (43efbf5). Jedyna różnica (`compare-home`:
1 zmiana, wpis `atrybuty` w `tools/etapy/zmiana-strony-glownej.json`):

```diff
-<script src="assets/js/analytics.js?v=4" defer></script>
+<script src="assets/js/analytics.js?v=5" defer></script>
```

Teksty, pozostałe atrybuty, znaczniki, kolejność i geometria bez zmian.

## Wdrożenie (po scaleniu, na polecenie właściciela)

Do czasu tego wdrożenia Clarity jest blokowane przez CSP także po zgodzie (strona działa, Matomo działa).

1. Wydanie strony z artefaktu CI `revagy-dist-<sha>` skryptem `deploy/wydanie.sh`.
2. Razem z wydaniem krok 2 z karty T-022: plik `deploy/nginx/revagy-naglowki.conf` na serwer
   (`/etc/nginx/snippets/revagy-naglowki.conf`), `nginx -t`, przeładowanie nginx.
3. Kontrole z kroku 3 karty T-022: `curl -sI https://revagy.pl/ | grep -i content-security-policy` (zawiera
   `clarity.ms`); w DevTools (Sieć, filtr `clarity`) bez zgody zero żądań, po „Zgadzam się” żądanie
   `tag/zhlvuu1fed`; pozostałe kontrole z tego kroku (`BingSiteAuth.xml`, plik klucza IndexNow).
   Dodatkowo: baner zgody pokazuje nowe zdanie (`analytics.js?v=5`).

## Do zamknięcia po scaleniu

- Notatka pod D-039 w rejestrze decyzji (`kono-state/decisions/REJESTR_DECYZJI_BIZNESOWYCH.md`) o tekście banera:
  przyjęte brzmienie i zamknięcie otwartej kwestii „Dane zostają na naszym serwerze”.

## Kontrakt i wynik CI (2026-11-22)

- Kontrakt policzony z plików wydania `43efbf5` z naniesioną tą samą zmianą (nowy `analytics.js` i `?v=5` na
  dwunastu stronach). Zmienione wpisy: 12 stron i `assets/js/analytics.js`. Lokalnie `check-all` 6 z 6.
- Przewidziany manifest wydania: `e5bd79533c98510e18ad4f90b250be46b583bc283a0b0b957d42ed3a355010b7`.
- Przebieg CI dla `9156d53` (run 45037408718), zielony: `check:dist` 6 z 6, manifest ten sam co przewidziany;
  test dymny 271 z 271, w tym nowe sprawdzenie tekstu banera; wysokości nagłówka, sekcji i stopki strony głównej
  na 1280 i 390 px równe bazie; testy `wydanie.sh` 16 z 16.
- Lighthouse dla `/finanse.html` (run 45037408708): wydajność 97, dostępność 96, SEO 100.
- Baner na zrzutach 375 i 393 px ma jeden wiersz tekstu więcej (sześć zamiast pięciu) i mieści się na ekranie
  razem z przyciskami.

## Scalenie i wdrożenie (2026-11-22)

- Właściciel przyjął brzmienie z PR („Statystyki prowadzimy na własnym serwerze (Matomo) i w narzędziu Microsoft
  Clarity.”) i scalił PR #28 do `main` commitem `7cd0f71f89d60f7262de0db106545a18f48d7dbb`. Decyzja zapisana jako D-040.
- CI na `main` (run 45037997117): `check:dist` 6 z 6, test dymny 271 z 271, testy `wydanie.sh` 16 z 16,
  manifest `e5bd79533c98510e18ad4f90b250be46b583bc283a0b0b957d42ed3a355010b7`, ten sam co przewidziany.
- Wdrożone na produkcję w wydaniu `7cd0f71f89d60f7262de0db106545a18f48d7dbb` (poprzednie: `43efbf5f8a246d33a9c4f68f3552616c2665fc7a`).
  Względem poprzedniego wydania zmieniło się 12 stron i `assets/js/analytics.js`.
- Razem z wydaniem podmieniony plik nagłówków nginx (krok 2 z karty T-022): w CSP doszły źródła `clarity.ms`
  i `c.bing.com`, pozostałe nagłówki bez zmian. `nginx -t` poprawne, nginx przeładowany.
- Po wydaniu: strony i pliki tekstowe bajtowo równe plikom z CI, `analytics.js` na produkcji ma nowe zdanie,
  nagłówek CSP zawiera `clarity.ms`, hosty współdzielone bez zmian.
- Do sprawdzenia przez właściciela w przeglądarce: bez zgody zero żądań do `clarity.ms`, po „Zgadzam się” żądanie
  taga Clarity (krok 3 z karty T-022).
