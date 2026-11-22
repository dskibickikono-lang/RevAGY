/* REVAGY — Microsoft Clarity (projekt zhlvuu1fed) uruchamiany wyłącznie po zgodzie analitycznej.
   Zgoda to ta sama decyzja co dla Matomo: baner i „Ustawienia prywatności” z analytics.js
   (klucz revagy-zgoda-analityka w localStorage). Bez zgody plik nie wysyła żadnego żądania do clarity.ms.
   Wycofanie zgody: Clarity kasuje swoje ciasteczka (_clck, _clsk), a przy kolejnych wejściach się nie ładuje. */
(() => {
  'use strict';

  const CFG = {
    tagUrl: 'https://www.clarity.ms/tag/zhlvuu1fed',
    hosts: ['revagy.pl', 'www.revagy.pl'], // poza produkcją Clarity się nie ładuje (jak Matomo)
    storageKey: 'revagy-zgoda-analityka',
  };

  const onProduction = CFG.hosts.includes(location.hostname);
  const readChoice = () => { try { return localStorage.getItem(CFG.storageKey); } catch (err) { return null; } };

  let started = false;
  function start() {
    if (started || !onProduction) return;
    started = true;
    // Kolejka jak w oficjalnym fragmencie Clarity: wywołania sprzed załadowania tagu czekają w clarity.q.
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    // Zgoda z banera obejmuje statystyki, nie reklamy.
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    const s = document.createElement('script');
    s.async = true;
    s.src = CFG.tagUrl;
    document.head.appendChild(s);
  }

  function withdraw() {
    if (typeof window.clarity === 'function') window.clarity('consent', false);
  }

  // Decyzja w banerze (analytics.js zapisuje ją przed tym słuchaczem, bo baner jest niżej w drzewie).
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-consent]');
    if (!btn) return;
    if (btn.dataset.consent === 'tak') start();
    else withdraw();
  });

  if (readChoice() === 'tak') start();
})();
