# RevAGY

Prototyp strony firmy REVAGY (automatyzacja procesów i wdrożenia AI w B2B).

Statyczna strona bez builda i bez zależności: HTML, CSS, czysty JS, własne fonty i własne filmy.

## Uruchomienie

```bash
cd site
python3 -m http.server 8000
# http://localhost:8000
```

## Struktura

| Ścieżka | Zawartość |
|---|---|
| `site/index.html` | cała strona (12 sekcji) |
| `site/assets/css/styles.css` | style, tokeny kolorów i typografii na górze pliku |
| `site/assets/js/app.js` | animacje i interakcje (menu, liczniki, kalkulator, sticky scroll, karuzela, FAQ) |
| `site/assets/video/` | 3 filmy (`.webm` + `.mp4`) i plakaty `.jpg` |
| `site/assets/fonts/` | Onest, Instrument Sans, JetBrains Mono (SIL OFL 1.1, licencje obok) |
| `tools/scenes/` | źródła filmów: animowane sceny HTML |
| `tools/render-videos.cjs` | nagrywa sceny klatka po klatce i koduje filmy |
| `kono-state/` | rejestr decyzji i karty zadań |

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

## Dane przykładowe

Liczby, widoki ekranów i nazwy firm na stronie są poglądowe. Formularz kontaktowy niczego nie wysyła.
Przed publikacją trzeba podmienić je na prawdziwe dane.
