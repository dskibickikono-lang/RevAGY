/* REVAGY — analityka własna (Matomo na stats.revagy.pl) uruchamiana dopiero po zgodzie.
   Bez zgody ten plik niczego nie wysyła i nie zapisuje ciasteczek; zostają tylko logi serwera.
   Co zbieramy po zgodzie: odsłony, źródło wejścia, kliknięcia, widoki i czas sekcji,
   głębokość przewinięcia, czas na stronie, użycie kalkulatora. IP i przeglądarkę zapisuje Matomo. */
(() => {
  'use strict';

  const CFG = {
    matomoUrl: 'https://stats.revagy.pl/',
    siteId: '1',
    hosts: ['revagy.pl', 'www.revagy.pl'], // poza produkcją tracker się nie ładuje
    cookieDomain: '*.revagy.pl',
    storageKey: 'revagy-zgoda-analityka',
  };

  const onProduction = CFG.hosts.includes(location.hostname);
  const policyUrl = onProduction ? '/polityka-prywatnosci.html' : 'polityka-prywatnosci.html';
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- zapis decyzji ---------- */
  const readChoice = () => { try { return localStorage.getItem(CFG.storageKey); } catch (err) { return null; } };
  const saveChoice = (value) => { try { localStorage.setItem(CFG.storageKey, value); } catch (err) { /* tryb prywatny */ } };

  /* ---------- Matomo ---------- */
  let started = false;
  window._paq = window._paq || [];
  // Zawsze przez window._paq: po załadowaniu matomo.js podmienia tę kolejkę na własny obiekt,
  // więc zapamiętana wcześniej tablica przestałaby cokolwiek wysyłać.
  const paq = { push: (call) => window._paq.push(call) };
  const track = (category, action, name, value) => {
    if (!started) return;
    const call = ['trackEvent', category, action];
    if (name !== undefined) call.push(String(name).slice(0, 180));
    if (value !== undefined && Number.isFinite(value)) call.push(Math.round(value));
    paq.push(call);
  };

  function start() {
    if (started || !onProduction) return;
    started = true;
    paq.push(['setTrackerUrl', `${CFG.matomoUrl}matomo.php`]);
    paq.push(['setSiteId', CFG.siteId]);
    paq.push(['setCookieDomain', CFG.cookieDomain]);
    paq.push(['setDomains', CFG.hosts]);
    paq.push(['setSecureCookie', true]);
    paq.push(['alwaysUseSendBeacon']);
    paq.push(['enableJSErrorTracking']);
    paq.push(['enableLinkTracking']);
    paq.push(['enableHeartBeatTimer', 10]); // dokładny czas także dla jednej odsłony
    paq.push(['trackPageView']);
    const s = document.createElement('script');
    s.async = true;
    s.src = `${CFG.matomoUrl}matomo.js`;
    document.head.appendChild(s);
    instrument();
  }

  /* ---------- zdarzenia ---------- */
  function sectionName(el) {
    const s = el.closest('main > section, header, footer, .consent');
    if (!s) return 'strona';
    if (s.id) return s.id === 'top' ? 'nagłówek' : s.id;
    if (s.classList.contains('hero-outer')) return 'hero';
    if (s.classList.contains('stats')) return 'liczby';
    if (s.classList.contains('consent')) return 'zgoda';
    return s.tagName === 'FOOTER' ? 'stopka' : s.tagName.toLowerCase();
  }
  const labelOf = (el) => (el.dataset.track || el.getAttribute('aria-label') || el.textContent || el.value || '')
    .replace(/\s+/g, ' ').trim().slice(0, 80) || el.tagName.toLowerCase();

  function instrument() {
    // 1. Każde kliknięcie w link, przycisk lub kontrolkę: gdzie i w co
    document.addEventListener('click', (e) => {
      const el = e.target.closest('a, button, label, summary, [data-track]');
      if (el) track('Klik', sectionName(el), labelOf(el));
    }, true);

    // 2. Sekcje: pierwsze zobaczenie i łączny czas w kadrze
    const sections = $$('main > section');
    const seen = new Set();
    const visibleSince = new Map();
    const totals = new Map();
    const closeSpan = (el) => {
      if (!visibleSince.has(el)) return;
      totals.set(el, (totals.get(el) || 0) + (performance.now() - visibleSince.get(el)) / 1000);
      visibleSince.delete(el);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            if (!document.hidden) visibleSince.set(el, performance.now());
            if (!seen.has(el)) { seen.add(el); track('Sekcja', 'Widok', sectionName(el)); }
          } else closeSpan(el);
        });
      }, { threshold: 0.3 });
      sections.forEach((el) => io.observe(el));
    }

    // 3. Głębokość przewinięcia
    const marks = [25, 50, 75, 100];
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 100;
      while (marks.length && pct >= marks[0] - 1) track('Przewinięcie', 'Głębokość', `${marks.shift()}%`);
      if (!marks.length) window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // 4. Aktywny czas na stronie (liczony tylko, gdy karta jest widoczna)
    const steps = [30, 60, 180, 600];
    let active = 0;
    setInterval(() => {
      if (document.hidden) return;
      active += 5;
      if (steps.length && active >= steps[0]) track('Czas', 'Aktywny czas na stronie', `${steps.shift()} s`, active);
    }, 5000);

    // 5. Kalkulator: z jakimi ustawieniami odwiedzający kończy
    const calcInputs = $$('#kalkulator input');
    let calcTimer;
    calcInputs.forEach((input) => input.addEventListener('input', () => {
      clearTimeout(calcTimer);
      calcTimer = setTimeout(() => {
        const v = (id) => (document.getElementById(id) || {}).value;
        const share = (document.querySelector('input[name="share"]:checked') || {}).value;
        const hours = Number((document.getElementById('res-hours') || {}).textContent.replace(/\s/g, ''));
        track('Kalkulator', 'Ustawienia', `osoby=${v('calc-people')} godz=${v('calc-hours')} stawka=${v('calc-rate')} udział=${share}`, hours);
      }, 2000);
    }));

    // 6. Przy wyjściu: czas spędzony w każdej sekcji
    let flushed = false;
    const flush = () => {
      if (flushed) return;
      flushed = true;
      sections.forEach(closeSpan);
      totals.forEach((sec, el) => { if (sec >= 1) track('Sekcja', 'Czas w kadrze (s)', sectionName(el), sec); });
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) flush();
      else { flushed = false; totals.clear(); }
    });
    window.addEventListener('pagehide', flush);
  }

  /* ---------- baner zgody ---------- */
  let banner;
  function closeBanner() { if (banner) { banner.remove(); banner = null; } }
  function openBanner() {
    if (banner) return;
    banner = document.createElement('section');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.innerHTML = `
      <h2 id="consent-title">Statystyki odwiedzin</h2>
      <p>Za Twoją zgodą zapisujemy, które sekcje oglądasz, w co klikasz i jak długo, razem z adresem IP i danymi przeglądarki. Dane zostają na naszym serwerze. Szczegóły: <a href="${policyUrl}">polityka prywatności</a>.</p>
      <div class="consent-actions">
        <button type="button" class="btn btn-quiet" data-consent="nie">Odrzucam</button>
        <button type="button" class="btn btn-accent" data-consent="tak">Zgadzam się</button>
      </div>`;
    banner.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-consent]');
      if (!btn) return;
      const before = readChoice();
      saveChoice(btn.dataset.consent);
      closeBanner();
      if (btn.dataset.consent === 'tak') start();
      else if (before === 'tak' && started) { paq.push(['deleteCookies']); setTimeout(() => location.reload(), 150); }
    });
    document.body.appendChild(banner);
  }

  $$('[data-consent-open]').forEach((btn) => btn.addEventListener('click', openBanner));

  const choice = readChoice();
  if (choice === 'tak') start();
  else if (choice !== 'nie') openBanner();
})();
