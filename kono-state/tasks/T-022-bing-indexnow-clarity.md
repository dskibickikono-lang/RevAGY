---
id: T-022
title: Bing Webmaster Tools + IndexNow + Microsoft Clarity za zgodą
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/bing-indexnow-clarity
base: main (e10cab9)
depends_on: T-014
pr: (uzupełniane po otwarciu PR)
sha: (uzupełniane po commicie)
decisions: [D-008, D-015, D-021, D-039]
---

# T-022 — Bing Webmaster Tools, IndexNow i Microsoft Clarity za zgodą

## Cel

1. Weryfikacja witryny w Bing Webmaster Tools plikiem `BingSiteAuth.xml`.
2. IndexNow: publiczny klucz na stronie i ręczne zgłoszenie adresów z mapy witryny po wydaniu.
3. Microsoft Clarity (projekt `zhlvuu1fed`) ładowany wyłącznie po zgodzie analitycznej w istniejącym banerze,
   tym samym, który włącza Matomo („Ustawienia prywatności”). Wygląd, animacje, teksty i układ bez zmian (D-015, D-021).

## Zakres

1. `public/BingSiteAuth.xml` — plik od właściciela bez zmian (bajtowo). Serwuje go `location /` vhosta
   (`try_files`, `text/xml` z `mime.types`); żadna reguła nie blokuje ani nie przekierowuje `.xml` w korzeniu
   (przekierowania dotyczą tylko konkretnych `.html`, blokada tylko plików ukrytych).
2. IndexNow:
   - klucz `0c8dd46a3a9f367c383554c85d42412e` (`openssl rand -hex 16`), plik `public/0c8dd46a3a9f367c383554c85d42412e.txt`
     z samym kluczem (bez znaku nowej linii). Klucz jest publiczny z definicji;
   - `tools/indexnow-ping.cjs` (Node 22, bez zależności): czyta klucz i `public/sitemap.xml`, sprawdza, że
     `https://revagy.pl/<klucz>.txt` zwraca klucz, i wysyła `{host, key, keyLocation, urlList}` do
     `https://api.indexnow.org/indexnow`. `--dry-run` tylko wypisuje zgłoszenie. Nie jest wpięty w CI;
     uruchamia go właściciel po wdrożeniu (README, sekcja „Po wydaniu: IndexNow”);
   - testy jednostkowe `tools/tests/indexnow.test.cjs` (bez sieci).
3. Microsoft Clarity:
   - `public/assets/js/clarity.js` — jedyne miejsce z logiką; `src/components/Clarity.astro` — jedyny znacznik
     `<script src="assets/js/clarity.js?v=1" defer>`, użyty w `BaseLayout` (po `analytics.js`) i `PodstronaLayout`;
   - zgoda: ten sam klucz `revagy-zgoda-analityka` co Matomo. Przy wejściu ze zgodą i po kliknięciu „Zgadzam się”
     skrypt tworzy kolejkę `window.clarity` jak oficjalny fragment, wysyła sygnał zgody i wstawia
     `https://www.clarity.ms/tag/zhlvuu1fed`. Bez zgody: zero żądań do `clarity.ms`;
   - wycofanie („Odrzucam” w banerze): `window.clarity('consent', false)`, jeśli Clarity działa (Clarity kasuje
     `_clck`/`_clsk`); przy kolejnych wejściach tag się nie ładuje;
   - tylko na `revagy.pl` i `www.revagy.pl`, jak Matomo; `analytics.js` bez zmian (także `?v=4`);
   - niezmienniki `clarity.js` w `tools/validate-dist.cjs`; lista skryptów stron w walidatorze i `tools/podstrony.json`.
4. CSP (`deploy/nginx/revagy-naglowki.conf`), według dokumentacji Microsoft „Clarity Content Security Policy”:
   `script-src` + `https://www.clarity.ms https://scripts.clarity.ms`, `connect-src` + `https://*.clarity.ms`,
   `img-src` + `https://*.clarity.ms https://c.bing.com`. `scripts.clarity.ms` jest konieczne, bo tag z
   `www.clarity.ms` dociąga stamtąd właściwy skrypt. Wymaga wdrożenia nginx przez właściciela.
5. Polityka prywatności: Microsoft Clarity jako narzędzie statystyk tylko za zgodą (dostawca, transfer poza EOG,
   nagrania z maskowaniem, ciasteczka `_clck`/`_clsk`, okresy przechowywania); poprawione zdania, które przestały
   być prawdziwe („nie ma zewnętrznych skryptów śledzących”, „nie przekazujemy zewnętrznym narzędziom analitycznym”).
   Data wersji 22 listopada 2026; `lastmod` polityki w `sitemap.xml` = 2026-11-22.
6. Testy: test dymny (atrapa tagu Clarity, rejestr żądań do `*.clarity.ms`/`c.bing.com`), test formularza
   (atrapa Clarity, Clarity nie dostaje wartości pól, składnia ES2018 `clarity.js`).

## Strona główna: różnica migawki

Proces jak w T-014: `tools/baseline/index.baza.html` = migawka etapu 6 (dotychczasowa `index.html`),
nowa migawka i kontrakt z builda z kluczem Turnstile jak w CI (`node tools/update-contract.cjs dist --snapshot`).
Jedyna różnica `index.html` względem bazy (`compare-home`: 1 zmiana, wpis „dodane” w
`tools/etapy/zmiana-strony-glownej.json`):

```diff
 <script src="assets/js/analytics.js?v=4" defer></script>
+<script src="assets/js/clarity.js?v=1" defer></script>
```

Teksty, atrybuty, style i pozostałe znaczniki bez zmian; geometria w teście dymnym równa bazie (1280 i 390 px).

Kontrakt (`tools/dom-contract.json`): `publicFiles` +3 (`BingSiteAuth.xml`, plik klucza, `assets/js/clarity.js`),
inna suma `sitemap.xml`; `htmlBaseline` i `pages` każdej z 11 stron — jeden skrypt więcej, `polityka-prywatnosci.html`
także nowa treść.

## Wynik lokalny (2026-11-22)

- `npm ci`, `npm run build` (z publicznym kluczem Turnstile jak w CI): 11 stron.
- `check-all`: 6 z 6 kroków, 64 pliki, 51/51 assetów, 11/11 stron, testy narzędzi 86/86.
  Manifest wydania: `f040a33806999a78e29f7fcaa02ad5a4628494ce188ab665a8b54837eca03491`.
- Test dymny `--serve=dist`: 222 z 222, w tym nowe kontrole Clarity, `BingSiteAuth.xml` i pliku klucza IndexNow.
- `test:form`: 14 z 14 grup; `test:deploy`: 16 z 16.

## Do potwierdzenia przez właściciela

- **Tekst polityki prywatności** (sekcja Clarity, odbiorcy, transfer poza EOG, okresy przechowywania) — tekst
  prawny akceptuje właściciel. Do sprawdzenia: rola Microsoft (podmiot przetwarzający czy współadministrator
  według aktualnych warunków Clarity), okresy przechowywania nagrań, czy włączyć do polityki ciasteczko
  Microsoft `MUID` (domeny `clarity.ms`/`bing.com`).
- **Sygnał zgody**: zamiast `clarity('consent')` (API v1, Microsoft oznacza je jako przewidziane do wycofania
  i nadaje nim też zgodę reklamową) skrypt wywołuje `clarity('consentv2', { ad_Storage: 'denied',
  analytics_Storage: 'granted' })`, bo baner pyta tylko o statystyki. Wycofanie zgody: `clarity('consent', false)`
  zgodnie ze zleceniem i dokumentacją. Do akceptacji albo zmiany na `consent` (v1).
- **Tekst banera** („Dane zostają na naszym serwerze”) przestaje być pełny po włączeniu Clarity. Nie zmieniony
  (zakaz zmian tekstów); otwarta kwestia w rejestrze decyzji.
- **Ustawienia projektu Clarity** (panel Microsoft, poza repo): tryb maskowania (zalecany „Strict” albo „Balanced”),
  „Cookie consent” włączone, adres `https://revagy.pl`.

## Wdrożenie (wyłącznie właściciel)

1. Scalenie PR do `main`, artefakt CI `revagy-dist-<sha>`, publikacja `deploy/wydanie.sh`.
2. CSP: `deploy/nginx/revagy-naglowki.conf` → `/etc/nginx/snippets/revagy-naglowki.conf`, `nginx -t`,
   `systemctl reload nginx`. Bez tego Clarity jest blokowane przez CSP także po zgodzie (strona działa).
3. Weryfikacja: `curl -sI https://revagy.pl/BingSiteAuth.xml` (200, `text/xml`),
   `curl -s https://revagy.pl/0c8dd46a3a9f367c383554c85d42412e.txt` (sam klucz),
   `curl -sI https://revagy.pl/ | grep -i content-security-policy` (zawiera `clarity.ms`);
   w DevTools (Sieć, filtr `clarity`) bez zgody zero żądań, po „Zgadzam się” żądanie `tag/zhlvuu1fed`.
4. Bing Webmaster Tools: „Zweryfikuj” metodą pliku XML; dodać `https://revagy.pl/sitemap.xml`.
5. `node tools/indexnow-ping.cjs` (oczekiwane 200 albo 202).
