export const TURNSTILE_SITEKEY = (import.meta.env.PUBLIC_TURNSTILE_SITEKEY || '').trim();

// Tekst i wersja stanowią jedno wydanie informacji, zgodne z tabelą bramki.
export const KONTAKT_NOTICE = {
  version: 'revagy-2026-11-v1',
  text: 'Dane z formularza przetwarzamy, żeby odpowiedzieć na Twoje zapytanie (art. 6 ust. 1 lit. b lub f RODO). Administratorem jest Dawid Skibicki, prowadzący działalność pod marką REVAGY. Odbiorcy: Hetzner (serwer), Attio (CRM), Cloudflare Turnstile (ochrona przed spamem), Google (poczta i powiadomienia). Część z nich może przetwarzać dane poza EOG na podstawie standardowych klauzul umownych. Zapytanie przechowujemy przez czas obsługi i do 3 lat po jej zakończeniu. To nie jest zgoda na marketing. Szczegóły: ',
  url: 'https://revagy.pl/polityka-prywatnosci.html',
};
