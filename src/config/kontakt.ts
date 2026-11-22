import { PUBLIC_TURNSTILE_SITEKEY } from 'astro:env/client';

// Zmienna zadeklarowana w astro.config.mjs (env.schema). Pusta = jawny tryb bez formularza (wariant mailto).
export const TURNSTILE_SITEKEY = (PUBLIC_TURNSTILE_SITEKEY || '').trim();

// Klucz witryny Turnstile: cyfra, „x” i co najmniej 20 znaków (np. 0x4AAA…, klucze testowe 1x…, 2x…, 3x…).
if (TURNSTILE_SITEKEY && !/^[0-9]x[0-9A-Za-z_-]{20,}$/.test(TURNSTILE_SITEKEY)) {
  throw new Error('PUBLIC_TURNSTILE_SITEKEY ma nieprawidłowy format (oczekiwano klucza witryny Turnstile, np. 0x4AAA…).');
}
if (!TURNSTILE_SITEKEY) {
  console.warn('[kontakt] PUBLIC_TURNSTILE_SITEKEY jest pusty: build BEZ formularza (wariant mailto).');
}

// Tekst i wersja stanowią jedno wydanie informacji, zgodne z tabelą bramki.
export const KONTAKT_NOTICE = {
  version: 'revagy-2026-11-v1',
  text: 'Dane z formularza przetwarzamy, żeby odpowiedzieć na Twoje zapytanie (art. 6 ust. 1 lit. b lub f RODO). Administratorem jest Dawid Skibicki, prowadzący działalność pod marką REVAGY. Odbiorcy: Hetzner (serwer), Attio (CRM), Cloudflare Turnstile (ochrona przed spamem), Google (poczta i powiadomienia). Część z nich może przetwarzać dane poza EOG na podstawie standardowych klauzul umownych. Zapytanie przechowujemy przez czas obsługi i do 3 lat po jej zakończeniu. To nie jest zgoda na marketing. Szczegóły: ',
  url: 'https://revagy.pl/polityka-prywatnosci.html',
};
