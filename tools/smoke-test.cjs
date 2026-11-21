#!/usr/bin/env node
/* Test dymny strony REVAGY w Chromium (Playwright). Kończy się kodem 1, jeśli coś nie przejdzie.

   Lokalnie z wbudowanym serwerem TLS/HTTPS dla dist/ lub site/ (pełne testy zgody i nagłówków):
                    node tools/smoke-test.cjs --serve=dist
                    node tools/smoke-test.cjs --serve=site
   Lokalnie (prosty serwer HTTP bez domeny produkcyjnej):
                    node tools/smoke-test.cjs http://localhost:8000
   Izolowany nginx z --map:
                    node tools/smoke-test.cjs https://revagy.pl:18443 --map=127.0.0.1 --local-harness=/path/to/dist
   Produkcja (żądania do stats.revagy.pl przechwytywane atrapą):
                    node tools/smoke-test.cjs https://revagy.pl
   Pełne zrzuty strony głównej i podstron z tools/podstrony.json (1280 i 390 px):
                    node tools/smoke-test.cjs --serve=dist --zrzuty=zrzuty

   W trybie --serve test porównuje też wysokości sekcji strony głównej z bazą (tools/lib/baza.cjs),
   podawaną przez lokalny serwer pod /__baza.html. Podstrony z tools/podstrony.json są sprawdzane w każdym trybie.

   Na domenie produkcyjnej żądania do stats.revagy.pl są przechwytywane i zastępowane atrapą,
   więc test nie zapisuje niczego w prawdziwych statystykach. */
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const os = require('node:os');
const path = require('node:path');
const { wczytajBaze } = require('./lib/baza.cjs');
const { wczytajPodstrony, wczytajGeometrie } = require('./lib/dane.cjs');
const {
  zmierzWysokosciWPrzegladarce, porownajWysokosci, zbierzStyleWPrzegladarce, roznicaStylow,
  sprawdzMenuHref, proporcje16x9, nazwaZrzutu, adresKanoniczny,
} = require('./lib/smoke.cjs');

const args = process.argv.slice(2);
const serveArg = args.find((a) => a.startsWith('--serve='));
const localHarnessArg = args.find((a) => a.startsWith('--local-harness='));
const zrzutyArg = args.find((a) => a.startsWith('--zrzuty='));
const zrzutyDir = zrzutyArg ? path.resolve(zrzutyArg.slice('--zrzuty='.length)) : null;
let mapTo = (args.find((a) => a.startsWith('--map=')) || '').slice(6);
let baseArg = args.find((a) => !a.startsWith('--'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

// Ten sam plik CSP, który właściciel instaluje w nginx; bez drugiej kopii polityki.
const SECURITY_HEADERS = Object.fromEntries(
  [...fs.readFileSync(path.join(__dirname, '../deploy/nginx/revagy-naglowki.conf'), 'utf8')
    .matchAll(/^add_header\s+(\S+)\s+"([^"]+)"\s+always;/gm)]
    .map((match) => [match[1], match[2]])
);
if (!SECURITY_HEADERS['Content-Security-Policy']) throw new Error('Brak CSP we wzorcu nginx');

// Ścieżka, pod którą lokalny serwer podaje bazę strony głównej do porównania geometrii.
const BAZA_PATH = '/__baza.html';

function startLocalHarness(dirPath, { bazaHtml = null } = {}) {
  const rootDir = fs.realpathSync(path.resolve(dirPath));
  const certDir = fs.mkdtempSync(path.join(os.tmpdir(), 'revagy-smoke-tls-'));
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
    '-keyout', keyPath, '-out', certPath, '-days', '1',
    '-subj', '/CN=revagy.pl',
    '-addext', 'subjectAltName=DNS:revagy.pl,DNS:www.revagy.pl',
  ], { stdio: 'ignore' });

  const handler = (req, res) => {
    const reqUrl = new URL(req.url, 'https://revagy.pl');
    let pathname = decodeURIComponent(reqUrl.pathname);

    if (/\/\.([^/]|$)/.test(pathname) && !pathname.startsWith('/.well-known/')) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Revagy-Local-Harness': rootDir });
      res.end('Forbidden');
      return;
    }

    if (pathname === BAZA_PATH && bazaHtml !== null) {
      const body = Buffer.from(bazaHtml, 'utf8');
      res.writeHead(200, {
        ...SECURITY_HEADERS,
        'Content-Type': MIME['.html'],
        'Cache-Control': 'no-cache',
        'Accept-Ranges': 'bytes',
        'X-Revagy-Local-Harness': rootDir,
        'Content-Length': String(body.length),
      });
      res.end(body);
      return;
    }

    if (pathname === '/') pathname = '/index.html';
    const candidate = path.resolve(rootDir, '.' + pathname);
    let filePath = candidate;
    let status = 200;

    if (!candidate.startsWith(rootDir + path.sep) && candidate !== rootDir) {
      status = 403;
      filePath = null;
    } else if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
      const notFound = path.join(rootDir, '404.html');
      if (fs.existsSync(notFound)) {
        status = 404;
        filePath = notFound;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Revagy-Local-Harness': rootDir });
        res.end('Not Found');
        return;
      }
    }

    if (status === 403 || !filePath) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Revagy-Local-Harness': rootDir });
      res.end('Forbidden');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const stat = fs.statSync(filePath);
    const cache = ext === '.html'
      ? 'no-cache'
      : (ext === '.css' || ext === '.js' || ext === '.webmanifest' ? 'public, max-age=86400' : 'public, max-age=2592000');
    const headers = {
      ...SECURITY_HEADERS,
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': cache,
      'Accept-Ranges': 'bytes',
      'X-Revagy-Local-Harness': rootDir,
    };

    const range = req.headers.range;
    if (status === 200 && range && /^bytes=\d*-\d*$/.test(range)) {
      const [sStr, eStr] = range.slice(6).split('-');
      const start = sStr ? parseInt(sStr, 10) : 0;
      const end = eStr ? Math.min(parseInt(eStr, 10), stat.size - 1) : stat.size - 1;
      if (start <= end && start < stat.size) {
        headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
        headers['Content-Length'] = String(end - start + 1);
        res.writeHead(206, headers);
        fs.createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }

    headers['Content-Length'] = String(stat.size);
    res.writeHead(status, headers);
    fs.createReadStream(filePath).pipe(res);
  };

  const tlsServer = https.createServer({
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }, handler);
  const httpServer = http.createServer(handler);

  return new Promise((resolve) => {
    tlsServer.listen(0, '127.0.0.1', () => {
      const tlsPort = tlsServer.address().port;
      httpServer.listen(0, '127.0.0.1', () => {
        const httpPort = httpServer.address().port;
        resolve({
          rootDir,
          tlsBase: `https://revagy.pl:${tlsPort}`,
          httpBase: `http://127.0.0.1:${httpPort}`,
          close: () => {
            tlsServer.close();
            httpServer.close();
            fs.rmSync(certDir, { recursive: true, force: true });
          },
        });
      });
    });
  });
}

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); };
const skip = (name, why) => { results.push({ name, ok: null, detail: why }); };

const ALLOWED_HOSTS = new Set(['revagy.pl', 'www.revagy.pl', 'stats.revagy.pl', 'localhost', '127.0.0.1']);

const MATOMO_MOCK_JS = `(function(){
  var q = Array.isArray(window._paq) ? window._paq.slice() : [];
  var prev = [];
  try { prev = JSON.parse(sessionStorage.getItem('__revagy_paq_log') || '[]'); } catch (e) {}
  window.__wyslane = prev.slice();
  function setTestCookies() {
    document.cookie = '_pk_id.1.1fff=test-visitor-1; path=/; SameSite=Lax';
    document.cookie = '_pk_ses.1.1fff=1; path=/; SameSite=Lax';
  }
  function clearPkCookies() {
    try { sessionStorage.setItem('__revagy_delete_cookies_called', '1'); } catch (e) {}
    document.cookie.split(';').forEach(function(pair) {
      var name = pair.split('=')[0].trim();
      if (name.indexOf('_pk_') === 0) {
        document.cookie = name + '=; Max-Age=0; path=/';
        document.cookie = name + '=; Max-Age=0; path=/; domain=.revagy.pl';
      }
    });
  }
  function handle(c) {
    window.__wyslane.push(c);
    try { sessionStorage.setItem('__revagy_paq_log', JSON.stringify(window.__wyslane)); } catch (e) {}
    if (Array.isArray(c)) {
      if (c[0] === 'trackPageView') setTestCookies();
      if (c[0] === 'deleteCookies') clearPkCookies();
    }
  }
  q.forEach(handle);
  window._paq = { push: handle };
})();`;

// Atrapa Turnstile: build z prawdziwym PUBLIC_TURNSTILE_SITEKEY ładuje api.js z challenges.cloudflare.com,
// a test dymny nie wychodzi do internetu. Pełne zachowanie formularza sprawdza tools/test-formularz.cjs.
const TURNSTILE_MOCK_JS = `window.turnstile = {
  render: function () { return 'smoke-widget'; },
  execute: function () {}, reset: function () {}, remove: function () {},
  getResponse: function () { return ''; }, isExpired: function () { return false; }
};`;

async function newPage(browser, viewport, extra = {}, { enforceIsolation = false, allowHttpErrors = false } = {}) {
  const direct = (mapTo || enforceIsolation)
    ? { ignoreHTTPSErrors: true, proxy: { server: 'http://127.0.0.1:9', bypass: 'revagy.pl,www.revagy.pl,stats.revagy.pl,localhost,127.0.0.1' } }
    : {};
  const context = await browser.newContext({
    viewport,
    serviceWorkers: 'block',
    ...direct,
    ...extra,
  });
  const page = await context.newPage();
  const log = { errors: [], failed: [], stats: [], blockedExternal: [] };

  page.on('pageerror', (e) => log.errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') log.errors.push(`console: ${m.text()}`); });
  page.on('response', (r) => {
    if (allowHttpErrors) return;
    if (r.status() >= 400 && !r.url().includes('stats.revagy.pl')) {
      log.failed.push(`${r.status()} ${r.url()}`);
    }
  });

  // Atrapa Matomo + blokada wyjścia poza harness instalowana przed pierwszą nawigacją
  await context.route('**/*', (route) => {
    const reqUrl = route.request().url();
    if (reqUrl.startsWith('data:') || reqUrl.startsWith('blob:')) {
      return route.continue();
    }
    let parsed;
    try { parsed = new URL(reqUrl); } catch { return route.abort(); }

    if (parsed.hostname === 'stats.revagy.pl') {
      log.stats.push(reqUrl);
      if (parsed.pathname.endsWith('/matomo.js')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/javascript; charset=utf-8',
          body: MATOMO_MOCK_JS,
        });
      }
      return route.fulfill({ status: 204, body: '' });
    }

    if (parsed.hostname === 'challenges.cloudflare.com') {
      if (parsed.pathname.endsWith('/api.js')) {
        return route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: TURNSTILE_MOCK_JS });
      }
      return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><html lang="pl"><title>Ochrona</title></html>' });
    }

    if (enforceIsolation && !ALLOWED_HOSTS.has(parsed.hostname)) {
      log.blockedExternal.push(reqUrl);
      return route.abort();
    }

    return route.continue();
  });

  return { context, page, log };
}

const PODGLADY = [
  { szer: 1280, viewport: { width: 1280, height: 800 }, extra: {} },
  { szer: 390, viewport: { width: 390, height: 844 }, extra: { hasTouch: true, isMobile: true } },
];

// Po załadowaniu strony: czekamy na kroje pisma i chwilę na skrypty.
async function poZaladowaniu(page, ms = 400) {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(ms);
}

const scrollTo = (page, sel, offset = 120) => page.evaluate(([s, o]) => {
  const el = document.querySelector(s);
  window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - o, behavior: 'instant' });
}, [sel, offset]);

if (require.main === module) (async () => {
  let harness = null;
  let expectedHarnessRoot = localHarnessArg ? fs.realpathSync(path.resolve(localHarnessArg.slice('--local-harness='.length))) : null;

  const repoRoot = path.join(__dirname, '..');
  const podstrony = wczytajPodstrony(path.join(__dirname, 'podstrony.json'));
  let baza = null;
  let bazaPomin = '';
  if (serveArg) {
    try {
      baza = wczytajBaze({ repoRoot, log: (m) => console.log(`baza: ${m}`) });
    } catch (e) {
      bazaPomin = `nie udało się wczytać bazy: ${e.message}`;
    }
    const distIndex = path.join(path.resolve(serveArg.slice('--serve='.length)), 'index.html');
    if (!baza && !bazaPomin) bazaPomin = 'brak bazy (REVAGY_BAZA_PLIK, REVAGY_BAZA_REF / GITHUB_BASE_REF, tools/baseline/index.baza.html)';
    else if (baza && fs.existsSync(distIndex) && fs.readFileSync(distIndex, 'utf8') === baza.html) bazaPomin = `baza (${baza.zrodlo}) jest identyczna z bieżącą stroną główną`;
    if (bazaPomin) baza = null;
    harness = await startLocalHarness(serveArg.slice('--serve='.length), { bazaHtml: baza ? baza.html : null });
    baseArg = harness.tlsBase;
    mapTo = '127.0.0.1';
    expectedHarnessRoot = harness.rootDir;
  }

  const base = (baseArg || 'http://localhost:8000').replace(/\/$/, '');
  const baseUrl = new URL(base);
  const host = baseUrl.hostname;
  const production = ['revagy.pl', 'www.revagy.pl'].includes(host);
  const isLocalHarness = Boolean(harness || expectedHarnessRoot);
  const enforceIsolation = Boolean(mapTo || isLocalHarness);

  const launchArgs = [];
  if (mapTo) {
    launchArgs.push(`--host-resolver-rules=MAP revagy.pl ${mapTo}, MAP www.revagy.pl ${mapTo}, MAP stats.revagy.pl ${mapTo}`);
  }
  // Playwright ładowany dopiero tutaj, żeby startLocalHarness dało się testować bez niego (tools/tests/).
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ args: launchArgs });

  try {
    /* ---------- 1. Komputer: brak decyzji + odmowa + przeładowanie + desktop UI ---------- */
    {
      const { context, page, log } = await newPage(browser, { width: 1440, height: 900 }, {}, { enforceIsolation });
      const res = await page.goto(`${base}/`, { waitUntil: 'load' });
      await page.waitForTimeout(1200);

      if (isLocalHarness) {
        const hdrs = res.headers();
        check('harness: jawny niepubliczny port (nie 443)', baseUrl.port !== '' && baseUrl.port !== '443', `port=${baseUrl.port}`);
        check('harness: marker lokalnego artefaktu X-Revagy-Local-Harness zgodny', hdrs['x-revagy-local-harness'] === expectedHarnessRoot, `${hdrs['x-revagy-local-harness']} vs ${expectedHarnessRoot}`);
      }

      check('strona główna odpowiada 200', res.status() === 200, String(res.status()));
      check('tytuł zawiera REVAGY', (await page.title()).includes('REVAGY'));
      check('baner zgody widoczny przy pierwszej wizycie', await page.locator('.consent').isVisible());
      const ld = await page.evaluate(() => {
        const el = document.querySelectorAll('script[type="application/ld+json"]');
        if (el.length !== 1) return { n: el.length };
        try { return { n: el.length, data: JSON.parse(el[0].textContent) }; } catch (e) { return { n: el.length, err: String(e) }; }
      });
      const ldOrg = ld.data && (ld.data['@graph'] || []).find((x) => x['@type'] === 'Organization');
      check('dane strukturalne: 1 blok JSON-LD z Organization REVAGY i profilem LinkedIn',
        ld.n === 1 && ldOrg && ldOrg.name === 'REVAGY' && (ldOrg.sameAs || []).includes('https://www.linkedin.com/company/revagy/'),
        JSON.stringify({ n: ld.n, err: ld.err, org: ldOrg && ldOrg.name }));
      check('formularz kontaktowy w sekcji #kontakt (gdy build ma klucz Turnstile)',
        await page.evaluate(() => {
          const f = document.querySelector('#kontakt #kontakt-form');
          return f ? f.getAttribute('action') === '/api/kontakt' && f.dataset.noticeVersion === 'revagy-2026-11-v1' : !document.querySelector('script[src*="kontakt.js"]');
        }));
      check('adres kanoniczny to https://revagy.pl/', (await page.getAttribute('link[rel=canonical]', 'href')) === 'https://revagy.pl/');

      await page.hover('.nav-item.has-panel >> nth=0');
      await page.click('.nav-item.has-panel >> nth=0 >> .nav-link');
      check('menu rozwijane otwiera się', await page.evaluate(() => document.querySelector('.nav-item').classList.contains('is-open')));
      await page.keyboard.press('Escape');
      check('menu zamyka się klawiszem Esc', await page.evaluate(() => !document.querySelector('.nav-item').classList.contains('is-open')));

      await page.focus('.nav-item.has-panel >> nth=1 >> .nav-link');
      await page.click('.nav-item.has-panel >> nth=1 >> .nav-link');
      check('menu drugie otwiera się po fokusie/kliku', await page.evaluate(() => document.querySelectorAll('.nav-item.has-panel')[1].classList.contains('is-open')));
      await page.keyboard.press('Escape');

      await scrollTo(page, '#kalkulator');
      await page.fill('#calc-people', '20');
      await page.fill('#calc-hours', '10');
      await page.fill('#calc-rate', '100');
      await page.click('label[for="share-80"]');
      await page.waitForTimeout(700);
      const calc = await page.evaluate(() => ['res-hours', 'res-year', 'res-fte'].map((id) => document.getElementById(id).textContent.replace(/\s/g, '')));
      check('kalkulator liczy zgodnie ze wzorem (693 h, 831 000 zł, 4,3 etatu)', calc.join('|') === '693|831000|4,3', calc.join('|'));

      await page.evaluate(() => {
        const s = document.querySelectorAll('.story-step')[2];
        window.scrollTo({ top: window.scrollY + s.getBoundingClientRect().top - 250, behavior: 'instant' });
      });
      await page.waitForTimeout(500);
      const story = await page.evaluate(() => ({
        pane: [...document.querySelectorAll('.pane')].findIndex((p) => p.classList.contains('is-active')),
        top: Math.round(document.querySelector('.story-stage').getBoundingClientRect().top),
      }));
      check('sekcja procesu: przyklejony ekran pokazuje krok 3', story.pane === 2 && story.top > 60 && story.top < 400, JSON.stringify(story));

      await scrollTo(page, '#zastosowania');
      await page.waitForTimeout(400);
      const before = await page.evaluate(() => document.querySelector('[data-carousel]').scrollLeft);
      await page.click('[data-car-next]');
      await page.waitForTimeout(900);
      const afterArrow = await page.evaluate(() => document.querySelector('[data-carousel]').scrollLeft);
      check('karuzela przewija się strzałką', afterArrow > before + 200);
      await page.locator('[data-carousel]').focus();
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(700);
      check('karuzela obsługuje klawiaturę (ArrowLeft)', (await page.evaluate(() => document.querySelector('[data-carousel]').scrollLeft)) < afterArrow - 100);
      check('pasek integracji jest zapętlony', await page.evaluate(() => document.querySelector('[data-marquee]').children.length === 22));

      await scrollTo(page, '#film');
      await page.waitForTimeout(1500);
      const videos = await page.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({ src: v.currentSrc.split('/').pop(), ready: v.readyState })));
      check('3 filmy mają wybrane źródło', videos.length === 3 && videos.every((v) => /\.(webm|mp4)$/.test(v.src)), JSON.stringify(videos));
      check('film z agentem odtwarza się w kadrze', await page.evaluate(() => { const v = document.querySelector('[data-main-video]'); return !v.paused && v.readyState >= 2; }));
      await page.click('[data-video-toggle]');
      await page.waitForTimeout(200);
      const pausedAfterToggle = await page.evaluate(() => document.querySelector('[data-main-video]').paused && document.querySelector('[data-video-toggle]').getAttribute('aria-pressed') === 'true');
      await page.click('[data-video-toggle]');
      await page.waitForTimeout(200);
      const playingAfterToggle = await page.evaluate(() => !document.querySelector('[data-main-video]').paused);
      check('przycisk pauzy/wznowienia filmu działa', pausedAfterToggle && playingAfterToggle);

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

      // Odmowa zgody
      await page.click('[data-consent="nie"]');
      await page.click('a.btn-dark[href="#kontakt"]');
      await page.waitForTimeout(500);
      const stored = await page.evaluate(() => localStorage.getItem('revagy-zgoda-analityka'));
      check('odmowa: baner znika, decyzja zapisana, statystyki milczą', stored === 'nie' && !(await page.locator('.consent').count()) && log.stats.length === 0, `zapis=${stored} żądania=${log.stats.length}`);

      // Przeładowanie po odmowie
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(500);
      const storedReload = await page.evaluate(() => localStorage.getItem('revagy-zgoda-analityka'));
      const cookiesReload = await context.cookies();
      check('odmowa po przeładowaniu: baner nie wraca, 0 żądań i 0 ciasteczek', storedReload === 'nie' && (await page.locator('.consent').count()) === 0 && log.stats.length === 0 && cookiesReload.length === 0);

      check('brak błędów JS i naruszeń CSP', log.errors.length === 0, log.errors.join(' | '));
      check('brak nieudanych żądań', log.failed.length === 0 && log.blockedExternal.length === 0, [...log.failed, ...log.blockedExternal].join(' | '));
      await context.close();
    }

    /* ---------- 2. Komputer: zgoda, zdarzenia, zapamiętana zgoda po reloadzie i wycofanie ---------- */
    {
      const { context, page, log } = await newPage(browser, { width: 1440, height: 900 }, {}, { enforceIsolation });
      await page.goto(`${base}/`, { waitUntil: 'load' });
      await page.click('[data-consent="tak"]');
      await page.waitForTimeout(800);
      await page.click('.hero-cta .btn-light');
      await scrollTo(page, '#kalkulator');
      await page.waitForTimeout(1200);
      await page.fill('#calc-people', '15');
      await page.dispatchEvent('#calc-people', 'input');
      await page.waitForTimeout(2300); // debounce 2000ms w analytics.js
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await page.waitForTimeout(600);
      await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
      await page.waitForTimeout(200);

      const paq = await page.evaluate(() => (window.__wyslane || (Array.isArray(window._paq) ? window._paq : [])).map((c) => c.slice(0, 4).join(' › ')));

      if (production) {
        const matomoReqs = log.stats.filter((u) => u.endsWith('/matomo.js'));
        const matomoScripts = await page.locator('script[src*="matomo.js"]').count();
        check('zgoda: dokładnie jedno ładowanie matomo.js', matomoReqs.length === 1 && matomoScripts === 1, `reqs=${matomoReqs.length} scripts=${matomoScripts}`);
        check('zgoda: dokładnie jeden trackPageView na ładowanie', paq.filter((c) => c.startsWith('trackPageView')).length === 1, paq.filter((c) => c.startsWith('trackPageView')).join(' | '));
        check('zgoda: zapisane kliknięcie w przycisk hero', paq.some((c) => c.startsWith('trackEvent › Klik › hero')), paq.filter((c) => c.includes('Klik')).join(' | '));
        check('zgoda: zapisany widok sekcji i głębokość przewinięcia', paq.some((c) => c.includes('Sekcja › Widok')) && paq.some((c) => c.includes('Przewinięcie')), `${paq.length} wywołań`);
        check('zgoda: zapisane ustawienia kalkulatora i czas sekcji', paq.some((c) => c.includes('Kalkulator › Ustawienia')) && paq.some((c) => c.includes('Sekcja › Czas w kadrze (s)')), paq.filter((c) => c.includes('Kalkulator') || c.includes('Czas w kadrze')).join(' | '));
        check('zgoda: adres trackera i identyfikator strony', paq.includes('setTrackerUrl › https://stats.revagy.pl/matomo.php') && paq.includes('setSiteId › 1'));

        // Zapamiętana zgoda po reloadzie
        log.stats.length = 0;
        await page.evaluate(() => { sessionStorage.removeItem('__revagy_paq_log'); });
        await page.reload({ waitUntil: 'load' });
        await page.waitForTimeout(800);
        const paqAfterReload = await page.evaluate(() => (window.__wyslane || []).map((c) => c.slice(0, 4).join(' › ')));
        const matomoScriptsReload = await page.locator('script[src*="matomo.js"]').count();
        check('zapamiętana zgoda: brak ponownego banera i brak podwójnej inicjalizacji',
          (await page.locator('.consent').count()) === 0 &&
          log.stats.filter((u) => u.endsWith('/matomo.js')).length === 1 &&
          matomoScriptsReload === 1 &&
          paqAfterReload.filter((c) => c.startsWith('trackPageView')).length === 1,
          `reqs=${log.stats.length} scripts=${matomoScriptsReload}`);

        // Ciasteczka testowe ustawione przed wycofaniem
        const cookiesBeforeWithdraw = (await context.cookies()).filter((c) => c.name.startsWith('_pk_'));
        check('zgoda: ciasteczka _pk_* obecne przed wycofaniem', cookiesBeforeWithdraw.length >= 2, cookiesBeforeWithdraw.map((c) => c.name).join(','));

        // Wycofanie zgody przez Ustawienia prywatności w stopce
        await page.click('footer [data-consent-open]');
        check('po decyzji można otworzyć Ustawienia prywatności ze stopki', await page.locator('.consent').isVisible());
        log.stats.length = 0;
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'load' }),
          page.click('[data-consent="nie"]'),
        ]);
        await page.waitForTimeout(600);
        const afterWithdraw = await page.evaluate(() => ({
          choice: localStorage.getItem('revagy-zgoda-analityka'),
          deleteCalled: sessionStorage.getItem('__revagy_delete_cookies_called'),
        }));
        const pkAfterWithdraw = (await context.cookies()).filter((c) => c.name.startsWith('_pk_'));
        check('wycofanie zgody: kod strony wywołał deleteCookies, symulacja Matomo usunęła _pk_*, brak żądań po przeładowaniu',
          afterWithdraw.choice === 'nie' &&
          afterWithdraw.deleteCalled === '1' &&
          pkAfterWithdraw.length === 0 &&
          log.stats.length === 0 &&
          (await page.locator('.consent').count()) === 0,
          JSON.stringify({ afterWithdraw, pkLen: pkAfterWithdraw.length, statsReqs: log.stats.length }));
      } else {
        check('poza domeną produkcyjną tracker się nie ładuje mimo zgody', log.stats.length === 0 && paq.length === 0, `żądania=${log.stats.length} paq=${paq.length}`);
      }

      check('zgoda: brak błędów JS i naruszeń CSP', log.errors.length === 0, log.errors.join(' | '));
      await context.close();
    }

    /* ---------- 3. Host poza revagy.pl / www.revagy.pl (gdy uruchomiono --serve) ---------- */
    if (harness) {
      const { context, page, log } = await newPage(browser, { width: 1280, height: 800 }, {}, { enforceIsolation: true });
      await page.goto(`${harness.httpBase}/`, { waitUntil: 'load' });
      await page.click('[data-consent="tak"]');
      await page.waitForTimeout(700);
      const paqLen = await page.evaluate(() => (Array.isArray(window._paq) ? window._paq.length : -1));
      const choice = await page.evaluate(() => localStorage.getItem('revagy-zgoda-analityka'));
      check('hostname poza revagy.pl/www.revagy.pl: tracker zablokowany mimo lokalnej zgody', choice === 'tak' && log.stats.length === 0 && paqLen === 0, `choice=${choice} stats=${log.stats.length} paq=${paqLen}`);
      check('hostname nieprodukcyjny: brak błędów JS', log.errors.length === 0, log.errors.join(' | '));
      await context.close();
    }

    /* ---------- 4. Podstrony, 404, endpointy SEO, .git 403, Range ---------- */
    {
      const { context, page, log } = await newPage(browser, { width: 1280, height: 900 }, {}, { enforceIsolation });
      const res = await page.goto(`${base}/polityka-prywatnosci.html`, { waitUntil: 'load' });
      check('polityka prywatności odpowiada 200', res.status() === 200);
      check('polityka podaje administratora i NIP', await page.evaluate(() => document.body.textContent.includes('Dawid Skibicki') && document.body.textContent.includes('7441749535')));
      await page.click('[data-consent="nie"]');
      await page.click('main [data-consent-open]');
      check('„Ustawienia prywatności” otwierają baner ponownie', await page.locator('.consent').isVisible());
      check('polityka: brak błędów', log.errors.length === 0 && log.failed.length === 0, [...log.errors, ...log.failed].join(' | '));

      const kontaktRes = await page.goto(`${base}/kontakt.html`, { waitUntil: 'load' });
      const kontaktState = await page.evaluate(() => ({
        form: Boolean(document.querySelector('#kontakt-form')),
        kontaktJs: Boolean(document.querySelector('script[src*="kontakt.js"]')),
        mail: Boolean(document.querySelector('a.cta-mail[href^="mailto:kontakt@revagy.pl"]')),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      check('podstrona /kontakt.html: 200, e-mail, formularz gdy jest klucz, 0 overflow',
        kontaktRes.status() === 200 && kontaktState.mail && kontaktState.form === kontaktState.kontaktJs && kontaktState.overflow === 0,
        JSON.stringify(kontaktState));
      check('kontakt: brak błędów', log.errors.length === 0 && log.failed.length === 0, [...log.errors, ...log.failed].join(' | '));

      const lostRes = await page.goto(`${base}/nie/ma/takiej-strony`, { waitUntil: 'load' });
      const custom = await page.evaluate(() => document.body.textContent.includes('BŁĄD 404'));
      if (custom) {
        check('nieistniejący adres: kod 404 i własna strona błędu ze stylami', lostRes.status() === 404 && await page.evaluate(() => getComputedStyle(document.querySelector('.lost')).borderRadius !== '0px'), String(lostRes.status()));
      } else {
        skip('własna strona 404', 'ten serwer nie ma skonfigurowanej strony 404 (sprawdzane na nginx / --serve)');
      }

      const seoChecks = await page.evaluate(async () => {
        const get = async (u, hdrs) => {
          const r = await fetch(u, hdrs ? { headers: hdrs } : undefined);
          return { status: r.status, ct: r.headers.get('content-type') || '', range: r.headers.get('content-range') || '' };
        };
        return {
          robots: await get('/robots.txt'),
          sitemap: await get('/sitemap.xml'),
          manifest: await get('/site.webmanifest'),
          llms: await get('/llms.txt'),
          llmsFull: await get('/llms-full.txt'),
          git: await get('/.git/config'),
          mp4: await get('/assets/video/hero-flow.mp4', { Range: 'bytes=0-1023' }),
        };
      });
      check('robots.txt, sitemap.xml i site.webmanifest odpowiadają 200',
        seoChecks.robots.status === 200 &&
        seoChecks.sitemap.status === 200 &&
        seoChecks.manifest.status === 200 &&
        (!(isLocalHarness || production) || seoChecks.manifest.ct.includes('application/manifest+json')),
        JSON.stringify({ robots: seoChecks.robots.status, sitemap: seoChecks.sitemap.status, manifest: seoChecks.manifest }));
      check('llms.txt i llms-full.txt odpowiadają 200 jako tekst',
        seoChecks.llms.status === 200 && seoChecks.llmsFull.status === 200 &&
        seoChecks.llms.ct.startsWith('text/plain') && seoChecks.llmsFull.ct.startsWith('text/plain'),
        JSON.stringify({ llms: seoChecks.llms, llmsFull: seoChecks.llmsFull }));
      if (isLocalHarness || production) {
        check('.git/config zwraca 403', seoChecks.git.status === 403, String(seoChecks.git.status));
        check('hero-flow.mp4 obsługuje Range 206 i video/mp4',
          seoChecks.mp4.status === 206 && seoChecks.mp4.ct.includes('video/mp4') && seoChecks.mp4.range.startsWith('bytes 0-1023/'),
          JSON.stringify(seoChecks.mp4));
      }
      await context.close();
    }

    /* ---------- 5. Telefon (390×844) ---------- */
    {
      const { context, page, log } = await newPage(browser, { width: 390, height: 844 }, { hasTouch: true, isMobile: true }, { enforceIsolation });
      await page.goto(`${base}/`, { waitUntil: 'load' });
      await page.waitForTimeout(600);
      await page.click('[data-consent="nie"]');
      await page.click('.menu-toggle');
      await page.waitForTimeout(400);
      check('telefon: menu się otwiera', await page.evaluate(() => !document.querySelector('#mobile-menu').hidden));
      await page.click('#mobile-menu a[href="#proces"]');
      await page.waitForTimeout(1000);
      check('telefon: menu zamyka się po wyborze', await page.evaluate(() => document.querySelector('#mobile-menu').hidden));
      const fit = await page.evaluate(() => {
        const d = document.querySelector('.device').getBoundingClientRect();
        return { left: Math.round(d.left), right: Math.round(d.right), over: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      check('telefon: ekran procesu mieści się, brak przewijania w poziomie', fit.left >= 12 && fit.right <= 378 && fit.over === 0, JSON.stringify(fit));
      check('telefon: brak błędów', log.errors.length === 0 && log.failed.length === 0, [...log.errors, ...log.failed].join(' | '));
      await context.close();
    }

    /* ---------- 6. Geometria strony głównej względem bazy (tylko --serve) ---------- */
    if (harness && baza) {
      let pominiete = [];
      try { pominiete = wczytajGeometrie(repoRoot); } catch (e) { check('geometria: plik etapu czytelny', false, e.message); }
      for (const { viewport, extra } of PODGLADY) {
        const pomiar = async (adres) => {
          const { context, page } = await newPage(browser, viewport, { ...extra, reducedMotion: 'reduce' }, { enforceIsolation });
          await page.goto(`${base}${adres}`, { waitUntil: 'load' });
          await poZaladowaniu(page, 600);
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await page.waitForTimeout(200);
          const w = await page.evaluate(zmierzWysokosciWPrzegladarce);
          await context.close();
          return w;
        };
        const wynik = porownajWysokosci(await pomiar(BAZA_PATH), await pomiar('/'), pominiete);
        check(`geometria ${viewport.width}×${viewport.height}: wysokości nagłówka, sekcji i stopki równe bazie (${baza.zrodlo})${wynik.pominiete.length ? `, pominięte: ${wynik.pominiete.join(', ')}` : ''}`,
          wynik.problemy.length === 0, wynik.problemy.slice(0, 10).join(' | '));
      }
    } else if (harness) {
      skip('geometria strony głównej względem bazy', bazaPomin);
    }

    /* ---------- 7. Zrzuty strony głównej (--zrzuty) ---------- */
    if (zrzutyDir) {
      fs.mkdirSync(zrzutyDir, { recursive: true });
      for (const { szer, viewport, extra } of PODGLADY) {
        const { context, page } = await newPage(browser, viewport, { ...extra, reducedMotion: 'reduce' }, { enforceIsolation });
        await page.goto(`${base}/`, { waitUntil: 'load' });
        await poZaladowaniu(page, 600);
        await page.screenshot({ path: path.join(zrzutyDir, nazwaZrzutu('/', szer)), fullPage: true });
        await context.close();
      }
    }

    /* ---------- 8. Podstrony z tools/podstrony.json ---------- */
    if (podstrony.length) {
      // Identyfikatory strony głównej (cele odnośników ./#sekcja) i wzorce stylów w obu szerokościach.
      const wzorce = {};
      let idsGlownej = [];
      for (const { szer, viewport, extra } of PODGLADY) {
        wzorce[szer] = [];
        for (const adres of ['/', '/kontakt.html', '/polityka-prywatnosci.html']) {
          const { context, page } = await newPage(browser, viewport, { ...extra, reducedMotion: 'reduce' }, { enforceIsolation });
          await page.goto(`${base}${adres}`, { waitUntil: 'load' });
          await poZaladowaniu(page);
          wzorce[szer].push(await page.evaluate(zbierzStyleWPrzegladarce));
          if (adres === '/' && !idsGlownej.length) idsGlownej = await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));
          await context.close();
        }
      }

      for (const strona of podstrony) {
        const adres = `/${strona.plik}`;
        const p = strona.plik;
        for (const { szer, viewport, extra } of PODGLADY) {
          const { context, page, log } = await newPage(browser, viewport, extra, { enforceIsolation });
          const res = await page.goto(`${base}${adres}`, { waitUntil: 'load' });
          await poZaladowaniu(page, 600);
          check(`${p} (${szer}): odpowiada 200`, res && res.status() === 200, res ? String(res.status()) : 'brak odpowiedzi');
          // Baner zgody nie może zasłaniać przycisków filmu i menu.
          if (await page.locator('[data-consent="nie"]').count()) await page.click('[data-consent="nie"]');

          if (szer === 1280) {
            const adresy = await page.evaluate(() => ({
              canonical: document.querySelector('link[rel=canonical]') && document.querySelector('link[rel=canonical]').getAttribute('href'),
              ogUrl: document.querySelector('meta[property="og:url"]') && document.querySelector('meta[property="og:url"]').getAttribute('content'),
            }));
            check(`${p}: adres kanoniczny i og:url to ${adresKanoniczny(p)}`, adresy.canonical === adresKanoniczny(p) && adresy.ogUrl === adresKanoniczny(p), JSON.stringify(adresy));
            const hrefs = await page.evaluate(() => [...document.querySelectorAll('header .main-nav a[href], #mobile-menu a[href]')].map((a) => a.getAttribute('href')));
            const menu = sprawdzMenuHref(hrefs, idsGlownej);
            check(`${p}: menu w nagłówku prowadzi do ./#sekcja na stronie głównej`, menu.length === 0, menu.join(' | '));
            check(`${p}: stopka zawiera NIP 7441749535`, await page.evaluate(() => { const f = document.querySelector('footer'); return Boolean(f && f.textContent.includes('7441749535')); }));
          }

          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          check(`${p} (${szer}): brak przewijania w poziomie`, overflow === 0, String(overflow));

          if (szer === 390) {
            const ok = await page.locator('.menu-toggle').count() && await page.locator('#mobile-menu').count();
            let otwarte = false;
            let zamkniete = false;
            if (ok) {
              await page.click('.menu-toggle');
              await page.waitForTimeout(400);
              otwarte = await page.evaluate(() => !document.querySelector('#mobile-menu').hidden);
              await page.click('.menu-toggle');
              await page.waitForTimeout(400);
              zamkniete = await page.evaluate(() => document.querySelector('#mobile-menu').hidden);
            }
            check(`${p} (390): menu mobilne otwiera się i zamyka`, ok && otwarte && zamkniete, JSON.stringify({ ok: Boolean(ok), otwarte, zamkniete }));
          }

          // Miejsce na film
          const ramka = await page.evaluate(() => {
            const f = document.querySelector('.film');
            if (!f) return null;
            const r = f.getBoundingClientRect();
            return { w: r.width, h: r.height, film: Boolean(f.querySelector('video[data-main-video]')) };
          });
          if (!ramka) {
            check(`${p} (${szer}): jest ramka .film`, false, 'brak .film');
          } else {
            check(`${p} (${szer}): ramka .film ma proporcje 16:9 (±1 px)`, proporcje16x9(ramka.w, ramka.h), `${ramka.w}×${ramka.h}`);
            await scrollTo(page, '.film');
            if (!ramka.film) {
              await page.waitForFunction(() => { const i = document.querySelector('.film img'); return i && i.complete; }, null, { timeout: 8000 }).catch(() => {});
              const img = await page.evaluate(() => { const i = document.querySelector('.film img'); return i ? { complete: i.complete, nw: i.naturalWidth, nh: i.naturalHeight } : null; });
              check(`${p} (${szer}): stan „kadr” — obraz załadowany`, img && img.complete && img.nw > 0 && img.nh > 0, JSON.stringify(img));
            } else if (szer === 1280) {
              await page.waitForTimeout(1500);
              const v = await page.evaluate(() => { const x = document.querySelector('[data-main-video]'); return { src: x.currentSrc.split('/').pop(), paused: x.paused, ready: x.readyState }; });
              check(`${p}: stan „film” — wybrane źródło i odtwarzanie w kadrze`, /\.(webm|mp4)$/.test(v.src) && !v.paused && v.ready >= 2, JSON.stringify(v));
              await page.click('[data-video-toggle]');
              await page.waitForTimeout(200);
              const pauza = await page.evaluate(() => document.querySelector('[data-main-video]').paused && document.querySelector('[data-video-toggle]').getAttribute('aria-pressed') === 'true');
              await page.click('[data-video-toggle]');
              await page.waitForTimeout(200);
              const wznowienie = await page.evaluate(() => !document.querySelector('[data-main-video]').paused);
              check(`${p}: stan „film” — przycisk pauzy/wznowienia działa`, pauza && wznowienie, JSON.stringify({ pauza, wznowienie }));
            }
          }

          check(`${p} (${szer}): brak błędów JS i nieudanych żądań`, log.errors.length === 0 && log.failed.length === 0 && log.blockedExternal.length === 0,
            [...log.errors, ...log.failed, ...log.blockedExternal].join(' | '));
          await context.close();

          // Ograniczony ruch: wyliczone style, zrzut i wstrzymany film
          {
            const { context: ctx, page: pg } = await newPage(browser, viewport, { ...extra, reducedMotion: 'reduce' }, { enforceIsolation });
            await pg.goto(`${base}${adres}`, { waitUntil: 'load' });
            await poZaladowaniu(pg);
            const roz = roznicaStylow(wzorce[szer], await pg.evaluate(zbierzStyleWPrzegladarce));
            const nowe = [...roz.kolory.map((x) => `kolor ${x}`), ...roz.kroje.map((x) => `krój ${x}`), ...roz.rozmiary.map((x) => `rozmiar ${x}`)];
            check(`${p} (${szer}): kolory, kroje i rozmiary pisma są podzbiorem strony głównej, kontaktu i polityki`, nowe.length === 0, nowe.slice(0, 12).join(' | '));
            if (zrzutyDir) await pg.screenshot({ path: path.join(zrzutyDir, nazwaZrzutu(p, szer)), fullPage: true });
            if (szer === 1280 && ramka && ramka.film) {
              await scrollTo(pg, '.film');
              await pg.waitForTimeout(1200);
              check(`${p}: przy ograniczonym ruchu film jest wstrzymany`, await pg.evaluate(() => document.querySelector('[data-main-video]').paused));
            }
            await ctx.close();
          }
        }
      }
    } else {
      skip('podstrony z tools/podstrony.json', 'lista jest pusta');
    }
  } finally {
    await browser.close();
    if (harness) harness.close();
  }

  const failed = results.filter((r) => r.ok === false);
  for (const r of results) {
    console.log(`${r.ok === null ? 'POMINIĘTY' : r.ok ? 'OK       ' : 'BŁĄD     '} ${r.name}${r.detail && r.ok !== true ? `  [${r.detail}]` : ''}`);
  }
  const passed = results.filter((r) => r.ok === true).length;
  console.log(`\n${base}: ${passed} z ${results.length} przeszło, ${failed.length} błędów, ${results.length - passed - failed.length} pominiętych`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

module.exports = { startLocalHarness, SECURITY_HEADERS, MATOMO_MOCK_JS, BAZA_PATH };
