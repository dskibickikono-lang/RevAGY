#!/usr/bin/env node
/* Test dymny strony REVAGY w Chromium (Playwright). Kończy się kodem 1, jeśli coś nie przejdzie.

   Lokalnie:        cd site && python3 -m http.server 8000   →   node tools/smoke-test.cjs http://localhost:8000
   Produkcja:       node tools/smoke-test.cjs https://revagy.pl
   Przed zmianą DNS (nginx na tej samej maszynie, certyfikat testowy):
                    node tools/smoke-test.cjs https://revagy.pl --map=127.0.0.1

   Na domenie produkcyjnej żądania do stats.revagy.pl są przechwytywane i zastępowane atrapą,
   więc test nie zapisuje niczego w prawdziwych statystykach. */
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith('--')) || 'http://localhost:8000').replace(/\/$/, '');
const mapTo = (args.find((a) => a.startsWith('--map=')) || '').slice(6);
const host = new URL(base).hostname;
const production = ['revagy.pl', 'www.revagy.pl'].includes(host);

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); };
const skip = (name, why) => { results.push({ name, ok: null, detail: why }); };

async function newPage(browser, viewport, extra = {}) {
  // W trybie --map ruch do domen strony idzie prosto na wskazany adres, z pominięciem proxy środowiska.
  const direct = mapTo ? { ignoreHTTPSErrors: true, proxy: { server: 'http://127.0.0.1:9', bypass: 'revagy.pl,www.revagy.pl,stats.revagy.pl' } } : {};
  const context = await browser.newContext({ viewport, ...direct, ...extra });
  const page = await context.newPage();
  const log = { errors: [], failed: [], stats: [] };
  page.on('pageerror', (e) => log.errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') log.errors.push(`console: ${m.text()}`); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('stats.revagy.pl')) log.failed.push(`${r.status()} ${r.url()}`); });
  await context.route('https://stats.revagy.pl/**', (route) => {
    log.stats.push(route.request().url());
    // Atrapa zachowuje się jak prawdziwy matomo.js: podmienia kolejkę _paq na własny obiekt.
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '(function(){var q=window._paq||[];window.__wyslane=q.slice();window._paq={push:function(c){window.__wyslane.push(c);}};})();' });
  });
  return { context, page, log };
}
const scrollTo = (page, sel, offset = 120) => page.evaluate(([s, o]) => {
  const el = document.querySelector(s);
  window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - o, behavior: 'instant' });
}, [sel, offset]);

(async () => {
  const launchArgs = [];
  if (mapTo) launchArgs.push(`--host-resolver-rules=MAP revagy.pl ${mapTo}, MAP www.revagy.pl ${mapTo}, MAP stats.revagy.pl ${mapTo}`);
  const browser = await chromium.launch({ args: launchArgs });

  /* ---------- komputer: pierwsza wizyta, bez decyzji ---------- */
  {
    const { context, page, log } = await newPage(browser, { width: 1440, height: 900 });
    const res = await page.goto(`${base}/`, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    check('strona główna odpowiada 200', res.status() === 200, String(res.status()));
    check('tytuł zawiera REVAGY', (await page.title()).includes('REVAGY'));
    check('baner zgody widoczny przy pierwszej wizycie', await page.locator('.consent').isVisible());
    check('adres kanoniczny to https://revagy.pl/', (await page.getAttribute('link[rel=canonical]', 'href')) === 'https://revagy.pl/');

    await page.hover('.nav-item.has-panel >> nth=0');
    await page.click('.nav-item.has-panel >> nth=0 >> .nav-link');
    check('menu rozwijane otwiera się', await page.evaluate(() => document.querySelector('.nav-item').classList.contains('is-open')));
    await page.keyboard.press('Escape');
    check('menu zamyka się klawiszem Esc', await page.evaluate(() => !document.querySelector('.nav-item').classList.contains('is-open')));

    await scrollTo(page, '#kalkulator');
    await page.fill('#calc-people', '20'); await page.fill('#calc-hours', '10'); await page.fill('#calc-rate', '100');
    await page.click('label[for="share-80"]');
    await page.waitForTimeout(700);
    const calc = await page.evaluate(() => ['res-hours', 'res-year', 'res-fte'].map((id) => document.getElementById(id).textContent.replace(/\s/g, '')));
    check('kalkulator liczy zgodnie ze wzorem (693 h, 831 000 zł, 4,3 etatu)', calc.join('|') === '693|831000|4,3', calc.join('|'));

    await page.evaluate(() => { const s = document.querySelectorAll('.story-step')[2]; window.scrollTo({ top: window.scrollY + s.getBoundingClientRect().top - 250, behavior: 'instant' }); });
    await page.waitForTimeout(500);
    const story = await page.evaluate(() => ({ pane: [...document.querySelectorAll('.pane')].findIndex((p) => p.classList.contains('is-active')), top: Math.round(document.querySelector('.story-stage').getBoundingClientRect().top) }));
    check('sekcja procesu: przyklejony ekran pokazuje krok 3', story.pane === 2 && story.top > 60 && story.top < 400, JSON.stringify(story));

    await scrollTo(page, '#zastosowania');
    await page.waitForTimeout(400);
    const before = await page.evaluate(() => document.querySelector('[data-carousel]').scrollLeft);
    await page.click('[data-car-next]');
    await page.waitForTimeout(900);
    check('karuzela przewija się strzałką', (await page.evaluate(() => document.querySelector('[data-carousel]').scrollLeft)) > before + 200);
    check('pasek integracji jest zapętlony', await page.evaluate(() => document.querySelector('[data-marquee]').children.length === 22));

    await scrollTo(page, '#film');
    await page.waitForTimeout(1500);
    const videos = await page.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({ src: v.currentSrc.split('/').pop(), ready: v.readyState })));
    check('3 filmy mają wybrane źródło', videos.length === 3 && videos.every((v) => /\.(webm|mp4)$/.test(v.src)), JSON.stringify(videos));
    check('film z agentem odtwarza się w kadrze', await page.evaluate(() => { const v = document.querySelector('[data-main-video]'); return !v.paused && v.readyState >= 2; }));

    await scrollTo(page, '#pakiety');
    await page.click('button[data-mode="opieka"]');
    check('przełącznik pakietów zmienia zakres', await page.evaluate(() => getComputedStyle(document.querySelector('.m-projekt')).display === 'none' && getComputedStyle(document.querySelector('.m-opieka')).display !== 'none'));

    await scrollTo(page, '#faq');
    await page.click('#qb-3');
    await page.waitForTimeout(700);
    check('FAQ rozwija odpowiedź', await page.evaluate(() => document.querySelector('#qa-3').getBoundingClientRect().height > 40));

    await scrollTo(page, '#kontakt');
    const mail = await page.getAttribute('.cta-mail', 'href');
    check('kontakt prowadzi na kontakt@revagy.pl', mail.startsWith('mailto:kontakt@revagy.pl'), mail);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.click('[data-copy]');
    await page.waitForTimeout(300);
    check('„Kopiuj adres” potwierdza skopiowanie lub pokazuje adres', /Skopiowano|kontakt@revagy\.pl/.test(await page.textContent('[data-copy-msg]')));
    check('stopka zawiera NIP 7441749535', (await page.textContent('.footer-legal')).includes('7441749535'));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check('brak przewijania w poziomie (1440 px)', overflow === 0, String(overflow));
    const cookies = await context.cookies();
    check('bez decyzji: zero ciasteczek i zero żądań do statystyk', cookies.length === 0 && log.stats.length === 0, `ciasteczka=${cookies.length} żądania=${log.stats.length}`);

    await page.click('[data-consent="nie"]');
    await page.click('a.btn-dark[href="#kontakt"]');
    await page.waitForTimeout(500);
    const stored = await page.evaluate(() => localStorage.getItem('revagy-zgoda-analityka'));
    check('odmowa: baner znika, decyzja zapisana, statystyki milczą', stored === 'nie' && !(await page.locator('.consent').count()) && log.stats.length === 0, `zapis=${stored} żądania=${log.stats.length}`);

    check('brak błędów JS i naruszeń CSP', log.errors.length === 0, log.errors.join(' | '));
    check('brak nieudanych żądań', log.failed.length === 0, log.failed.join(' | '));
    await context.close();
  }

  /* ---------- komputer: zgoda na statystyki ---------- */
  {
    const { context, page, log } = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(`${base}/`, { waitUntil: 'load' });
    await page.click('[data-consent="tak"]');
    await page.waitForTimeout(800);
    await page.click('.hero-cta .btn-light');
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(800);
    const paq = await page.evaluate(() => (window.__wyslane || (Array.isArray(window._paq) ? window._paq : [])).map((c) => c.slice(0, 4).join(' › ')));
    if (production) {
      check('zgoda: ładuje się skrypt Matomo z stats.revagy.pl', log.stats.some((u) => u.endsWith('/matomo.js')), log.stats.join(' | '));
      check('zgoda: zapisana odsłona strony', paq.some((c) => c.startsWith('trackPageView')));
      check('zgoda: zapisane kliknięcie w przycisk hero', paq.some((c) => c.startsWith('trackEvent › Klik › hero')), paq.filter((c) => c.includes('Klik')).join(' | '));
      check('zgoda: zapisany widok sekcji i głębokość przewinięcia', paq.some((c) => c.includes('Sekcja › Widok')) && paq.some((c) => c.includes('Przewinięcie')), `${paq.length} wywołań`);
      check('zgoda: adres trackera i identyfikator strony', paq.includes('setTrackerUrl › https://stats.revagy.pl/matomo.php') && paq.includes('setSiteId › 1'));
    } else {
      check('poza domeną produkcyjną tracker się nie ładuje mimo zgody', log.stats.length === 0 && paq.length === 0, `żądania=${log.stats.length} paq=${paq.length}`);
    }
    check('zgoda: brak błędów JS i naruszeń CSP', log.errors.length === 0, log.errors.join(' | '));
    await context.close();
  }

  /* ---------- podstrony ---------- */
  {
    const { context, page, log } = await newPage(browser, { width: 1280, height: 900 });
    const res = await page.goto(`${base}/polityka-prywatnosci.html`, { waitUntil: 'load' });
    check('polityka prywatności odpowiada 200', res.status() === 200);
    check('polityka podaje administratora i NIP', await page.evaluate(() => document.body.textContent.includes('Dawid Skibicki') && document.body.textContent.includes('7441749535')));
    await page.click('[data-consent="nie"]');
    await page.click('main [data-consent-open]');
    check('„Ustawienia prywatności” otwierają baner ponownie', await page.locator('.consent').isVisible());
    check('polityka: brak błędów', log.errors.length === 0 && log.failed.length === 0, [...log.errors, ...log.failed].join(' | '));

    const lost = await page.goto(`${base}/nie/ma/takiej-strony`, { waitUntil: 'load' });
    const custom = await page.evaluate(() => document.body.textContent.includes('BŁĄD 404'));
    if (custom) check('nieistniejący adres: kod 404 i własna strona błędu ze stylami', lost.status() === 404 && await page.evaluate(() => getComputedStyle(document.querySelector('.lost')).borderRadius !== '0px'), String(lost.status()));
    else skip('własna strona 404', 'ten serwer nie ma skonfigurowanej strony 404 (sprawdzane na nginx)');
    await context.close();
  }

  /* ---------- telefon ---------- */
  {
    const { context, page, log } = await newPage(browser, { width: 390, height: 844 }, { hasTouch: true, isMobile: true });
    await page.goto(`${base}/`, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    await page.click('[data-consent="nie"]');
    await page.click('.menu-toggle');
    await page.waitForTimeout(400);
    check('telefon: menu się otwiera', await page.evaluate(() => !document.querySelector('#mobile-menu').hidden));
    await page.click('#mobile-menu a[href="#proces"]');
    await page.waitForTimeout(1000);
    check('telefon: menu zamyka się po wyborze', await page.evaluate(() => document.querySelector('#mobile-menu').hidden));
    const fit = await page.evaluate(() => { const d = document.querySelector('.device').getBoundingClientRect(); return { left: Math.round(d.left), right: Math.round(d.right), over: document.documentElement.scrollWidth - document.documentElement.clientWidth }; });
    check('telefon: ekran procesu mieści się, brak przewijania w poziomie', fit.left >= 12 && fit.right <= 378 && fit.over === 0, JSON.stringify(fit));
    check('telefon: brak błędów', log.errors.length === 0 && log.failed.length === 0, [...log.errors, ...log.failed].join(' | '));
    await context.close();
  }

  await browser.close();
  const failed = results.filter((r) => r.ok === false);
  for (const r of results) console.log(`${r.ok === null ? 'POMINIĘTY' : r.ok ? 'OK       ' : 'BŁĄD     '} ${r.name}${r.detail && r.ok !== true ? `  [${r.detail}]` : ''}`);
  const passed = results.filter((r) => r.ok === true).length;
  console.log(`\n${base}: ${passed} z ${results.length} przeszło, ${failed.length} błędów, ${results.length - passed - failed.length} pominiętych`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
