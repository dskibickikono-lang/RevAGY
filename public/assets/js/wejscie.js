/* REVAGY — zapis pierwszego wejścia na podstronie (plan 6.2). Bez zależności.
   Ten sam klucz, te same pola i to samo czyszczenie co public/assets/js/kontakt.js:66-76,
   więc formularz kontaktowy odczyta ten zapis bez zmian w swoim skrypcie.
   Istniejącego zapisu nie nadpisuje. Przy zablokowanej pamięci nic nie robi. */
(() => {
  'use strict';

  const KEY = 'fg_first_touch';
  const touchNames = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'referrer', 'landing_path'];
  const singleLine = (value, max) => String(value || '').replace(/[\r\n]/g, '').slice(0, max);
  const cleanTouch = (data) => Object.fromEntries(touchNames.filter((n) => Boolean(data && typeof data[n] === 'string'))
    .map((n) => [n, singleLine(data[n], n.startsWith('utm_') ? 100 : 300)]));

  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(location.search);
    const firstTouch = cleanTouch(Object.assign({}, Object.fromEntries(params), { referrer: document.referrer, landing_path: location.pathname }));
    sessionStorage.setItem(KEY, JSON.stringify(firstTouch));
  } catch (_) { /* Pamięć sesji zablokowana albo pełna: formularz użyje danych bieżącego wejścia. */ }
})();
