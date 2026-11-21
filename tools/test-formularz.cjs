#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const babelParser = require('@babel/parser');
const { chromium } = require('playwright');
const { startLocalHarness, SECURITY_HEADERS, MATOMO_MOCK_JS } = require('./smoke-test.cjs');
const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'revagy-form-'));
const dist = path.join(temp, 'dist');
const leadId = 'ld_' + 'a'.repeat(32);
function installTurnstileMock() {
  let token = 'test-turnstile-token';
  let timer = null;
  window.__resets = 0;
  window.turnstile = {
    render(selector, options) {
      window.__turnstileOptions = options;
      const iframe = document.createElement('iframe');
      iframe.src = 'https://challenges.cloudflare.com/test-frame';
      iframe.title = 'Ochrona przed spamem';
      iframe.width = '150'; iframe.height = '140';
      document.querySelector(selector).append(iframe);
      clearTimeout(timer);
      if (window.__failTurnstileErrorCallback) {
        token = '';
        options['error-callback']();
      } else if (window.__holdInitialToken) {
        token = '';
      } else if (window.__delayTurnstileMs) {
        token = '';
        timer = setTimeout(() => {
          token = 'delayed-turnstile-token';
          options.callback(token);
        }, window.__delayTurnstileMs);
      } else {
        token = 'test-turnstile-token';
        options.callback(token);
      }
      return 'test-widget';
    },
    reset() {
      window.__resets++;
      clearTimeout(timer);
      if (window.__failTurnstileErrorCallback) {
        token = '';
        window.__turnstileOptions['error-callback']();
      } else if (window.__delayTurnstileMs) {
        token = '';
        const nextToken = window.__resetTurnstileToken || ('test-turnstile-token-r' + window.__resets);
        timer = setTimeout(() => {
          token = nextToken;
          window.__turnstileOptions.callback(token);
        }, window.__delayTurnstileMs);
      } else if (window.__holdInitialToken) {
        token = '';
      } else {
        token = window.__resetTurnstileToken || ('test-turnstile-token-r' + window.__resets);
        window.__turnstileOptions.callback(token);
      }
    },
    getResponse() { return token; }
  };
}
const mock = `(${installTurnstileMock.toString()})();`;
function payloadHash(body) {
  const normalized = {};
  for (const k of Object.keys(body || {}).sort()) {
    if (k === 'cf-turnstile-response' || k === 't_ms' || k === 'website') continue;
    normalized[k] = body[k];
  }
  return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}
const forbiddenAstNodes = new Set(['OptionalMemberExpression', 'OptionalCallExpression', 'SpreadElement', 'BigIntLiteral', 'PrivateName']);
function findForbiddenSyntax(node, jsRel, hits) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) findForbiddenSyntax(item, jsRel, hits);
    return;
  }
  const loc = node.loc && node.loc.start ? `:${node.loc.start.line}:${node.loc.start.column}` : '';
  if (typeof node.type === 'string') {
    if (forbiddenAstNodes.has(node.type)) hits.push(`${jsRel}${loc} (${node.type})`);
    else if (node.type === 'LogicalExpression' && node.operator === '??') hits.push(`${jsRel}${loc} (LogicalExpression ??)`);
    else if (node.type === 'AssignmentExpression' && ['??=', '||=', '&&='].includes(node.operator)) hits.push(`${jsRel}${loc} (AssignmentExpression ${node.operator})`);
    else if (node.type === 'CatchClause' && node.param === null) hits.push(`${jsRel}${loc} (optional catch {})`);
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === 'loc' || k === 'start' || k === 'end' || k === 'extra' || k === 'comments' || k === 'tokens' || k === 'leadingComments' || k === 'trailingComments' || k === 'innerComments') continue;
    if (v && typeof v === 'object') findForbiddenSyntax(v, jsRel, hits);
  }
}
let checks = 0;
function ok(name) { checks++; console.log(`OK ${name}`); }
(async () => {
  let browser, harness;
  try {
    execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', dist], {
      cwd: root, env: { ...process.env, PUBLIC_TURNSTILE_SITEKEY: '1x00000000000000000000AA' }, stdio: 'pipe',
    });
    execFileSync(process.execPath, ['tools/validate-dist.cjs', dist], { cwd: root, stdio: 'pipe' });
    ok('osobny build z formularzem i pełny kontrakt wydania');
    harness = await startLocalHarness(dist);
    browser = await chromium.launch({ args: ['--host-resolver-rules=MAP revagy.pl 127.0.0.1', '--no-proxy-server'] });
    const contexts = [];
    async function setup(options = {}) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true, serviceWorkers: 'block', ...options });
      contexts.push(context);
      const requests = [], errors = [], external = [];
      const idempotency = new Map();
      const state = { code: 503, data: { error: 'queue_full' }, turnstile: 0, failChallenge: false, holdChallenge: false, releaseChallenge: null, hold: false, idempotency };
      await context.addInitScript(() => {
        window.__violations = [];
        window.__accepted = [];
        document.addEventListener('securitypolicyviolation', (event) => window.__violations.push(event.violatedDirective));
        document.addEventListener('lead:accepted', (event) => window.__accepted.push(event.detail));
      });
      await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.hostname === 'challenges.cloudflare.com') {
          if (url.pathname.includes('api.js')) {
            state.turnstile++;
            if (state.holdChallenge) {
              await new Promise((resolve) => { state.releaseChallenge = resolve; });
            }
            if (state.failChallenge) return route.abort();
            return route.fulfill({ contentType: 'application/javascript', body: mock });
          }
          return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="pl"><title>Ochrona</title></html>' });
        }
        if (url.hostname === 'stats.revagy.pl') return route.fulfill({ contentType: 'application/javascript', body: url.pathname.endsWith('matomo.js') ? MATOMO_MOCK_JS : '' });
        if (url.origin === harness.tlsBase && url.pathname === '/api/kontakt') {
          const reqBody = route.request().postDataJSON();
          const reqHeaders = await route.request().allHeaders();
          requests.push({ body: reqBody, headers: reqHeaders, method: route.request().method() });
          const idemKey = reqHeaders['idempotency-key'];
          const hash = payloadHash(reqBody);
          if (idemKey) {
            const existing = idempotency.get(idemKey);
            if (existing && existing.hash !== hash) {
              return route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'idempotency_conflict' }) });
            }
            if (!existing) idempotency.set(idemKey, { hash, accepted: false });
          }
          if (state.hold) return; // Timeout kontrolowany zegarem przeglądarki.
          if (state.code === 'network') return route.abort('failed');
          if (idemKey && state.code === 202) idempotency.set(idemKey, { hash, accepted: true });
          return route.fulfill({ status: state.code, contentType: 'application/json', body: JSON.stringify(state.data) });
        }
        if (url.origin === harness.tlsBase) return route.continue();
        external.push(url.hostname);
        return route.abort();
      });
      const page = await context.newPage();
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (msg) => {
        // Oczekiwane błędy HTTP/sieci są częścią scenariuszy; wyjątki JS i CSP nigdy.
        if (msg.type() === 'error' && !/^Failed to load resource:/.test(msg.text())) errors.push(msg.text());
      });
      return { context, page, state, requests, errors, external };
    }
    const t = await setup();
    const { page, state, requests } = t;
    const response = await page.goto(harness.tlsBase + '/?utm_source=pierwsze&utm_campaign=test%0Akampania&utm_content=' + 'x'.repeat(120));
    assert.equal(response.headers()['content-security-policy'], SECURITY_HEADERS['Content-Security-Policy']);
    await page.waitForTimeout(250);
    assert.equal(state.turnstile, 0);
    assert.equal(await page.locator('#kontakt-form').count(), 1);
    for (const name of ['name', 'email', 'company', 'phone', 'topic', 'volume', 'message']) {
      const field = page.locator(`#kontakt-${name}`);
      assert.ok(await page.locator(`label[for="kontakt-${name}"]`).textContent());
      assert.equal(await field.getAttribute('aria-invalid'), 'false');
      assert.ok((await field.getAttribute('aria-describedby')).includes(`kontakt-${name}-error`));
    }
    assert.deepEqual(await page.locator('#kontakt-topic option').evaluateAll((opts) => opts.map((o) => o.value)), ['', 'audyt', 'wdrozenie', 'kalkulator-roi', 'inne']);
    assert.equal(await page.locator('#kontakt-form input[type=checkbox]').count(), 0);
    const honey = await page.locator('#kontakt-website').evaluate((el) => ({ left: el.getBoundingClientRect().right, display: getComputedStyle(el).display, tab: el.tabIndex, hidden: el.parentElement.getAttribute('aria-hidden'), auto: el.autocomplete, type: el.type }));
    assert.ok(honey.left < 0);
    assert.notEqual(honey.display, 'none');
    assert.deepEqual([honey.tab, honey.hidden, honey.auto, honey.type], [-1, 'true', 'off', 'text']);
    const expectedNotice = 'Dane z formularza przetwarzamy, żeby odpowiedzieć na Twoje zapytanie (art. 6 ust. 1 lit. b lub f RODO). Administratorem jest Dawid Skibicki, prowadzący działalność pod marką REVAGY. Odbiorcy: Hetzner (serwer), Attio (CRM), Cloudflare Turnstile (ochrona przed spamem), Google (poczta i powiadomienia). Część z nich może przetwarzać dane poza EOG na podstawie standardowych klauzul umownych. Zapytanie przechowujemy przez czas obsługi i do 3 lat po jej zakończeniu. To nie jest zgoda na marketing. Szczegóły: https://revagy.pl/polityka-prywatnosci.html';
    assert.equal(await page.locator('.kontakt-notice').textContent(), expectedNotice);
    assert.equal(await page.locator('.kontakt-notice a').getAttribute('href'), '/polityka-prywatnosci.html');
    ok('etykiety, dostępność, ukryta pułapka, dokładny tekst informacji i leniwe ładowanie');
    await page.locator('#kontakt-name').focus();
    await page.waitForFunction(() => !!window.__turnstileOptions);
    assert.deepEqual(await page.evaluate(() => { const o = window.__turnstileOptions; return [o.sitekey, o.action, o.language, o.appearance]; }), ['1x00000000000000000000AA', 'kontakt-revagy', 'pl', 'interaction-only']);
    await page.locator('#kontakt-name').press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'kontakt-email');
    const submit = page.locator('#kontakt-form [type=submit]');
    const status = page.locator('#kontakt-form [data-status]');
    async function send(code, data = {}) {
      state.code = code; state.data = data;
      const count = requests.length;
      await submit.click();
      await page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
      assert.equal(requests.length, count + 1);
    }
    async function fill() {
      await page.locator('#kontakt-name').fill('Osoba Testowa');
      await page.locator('#kontakt-email').fill('test@example.com');
      await page.locator('#kontakt-company').fill('  Firma Testowa  ');
      await page.locator('#kontakt-phone').fill('+48 123 456 789');
      await page.locator('#kontakt-topic').selectOption('audyt');
      await page.locator('#kontakt-volume').selectOption('50-200');
      await page.locator('#kontakt-message').fill('Przykładowa treść\nDrugi wiersz');
    }
    await submit.click();
    assert.equal(requests.length, 0);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'kontakt-name');
    await fill();
    // Wartość ustawiana programowo omija maxlength i sprawdza także walidację JS.
    for (const [name, value] of [['name', 'x'.repeat(121)], ['name', ' x '], ['company', 'x'.repeat(161)], ['company', '   '], ['email', 'x'.repeat(250) + '@example.com'], ['message', 'x'.repeat(4001)]]) {
      const field = page.locator(`#kontakt-${name}`);
      const previous = await field.inputValue();
      await field.evaluate((el, value) => { el.value = value; }, value);
      await submit.click();
      assert.equal(requests.length, 0);
      assert.equal(await field.getAttribute('aria-invalid'), 'true');
      await field.fill(previous);
    }
    const originalMessage = await page.locator('#kontakt-message').inputValue();
    await page.locator('#kontakt-message').fill('\u0001'.repeat(3000));
    await submit.click();
    assert.equal(requests.length, 0);
    assert.equal(await status.textContent(), 'Wiadomość jest za długa.');
    await page.locator('#kontakt-message').fill(originalMessage);
    for (const badPhone of ['abc', '  12345']) {
      await page.locator('#kontakt-phone').fill(badPhone);
      await submit.click();
      assert.equal(requests.length, 0);
      assert.equal(await page.locator('#kontakt-phone').getAttribute('aria-invalid'), 'true');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'kontakt-phone');
    }
    await page.locator('#kontakt-phone').fill('+48 123 456 789');
    await send(503, { error: 'queue_full' });
    assert.equal(await page.evaluate(() => window.__resets), 1);
    assert.equal(await status.locator('a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    const first = requests[0];
    assert.equal(first.method, 'POST');
    assert.equal(first.headers.origin, harness.tlsBase);
    assert.match(first.headers['idempotency-key'], /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.equal(first.headers['content-type'], 'application/json');
    assert.deepEqual(Object.keys(first.body).sort(), ['schema_version', 'name', 'email', 'company', 'phone', 'topic', 'volume', 'message', 'website', 'notice_version', 'cf-turnstile-response', 't_ms', 'utm_source', 'utm_campaign', 'utm_content', 'referrer', 'landing_path'].sort());
    assert.equal(first.body.schema_version, 'lead.v1');
    assert.equal(first.body.notice_version, 'revagy-2026-11-v1');
    assert.equal(first.body.company, 'Firma Testowa');
    assert.equal(first.body.website, '');
    assert.equal(first.body['cf-turnstile-response'], 'test-turnstile-token');
    assert.ok(Number.isInteger(first.body.t_ms) && first.body.t_ms >= 0);
    assert.equal(first.body.utm_source, 'pierwsze');
    assert.equal(first.body.utm_campaign, 'testkampania');
    assert.equal(first.body.utm_content.length, 100);
    assert.equal(first.body.landing_path, '/');
    assert.equal(first.body.message, 'Przykładowa treść\nDrugi wiersz');
    assert.ok(Buffer.byteLength(JSON.stringify(first.body)) <= 16384);
    assert.equal(await page.locator('#kontakt-message-count').textContent(), first.body.message.length + ' / 4000 znaków');
    ok('walidacja lokalna, klawiatura i pełny kontrakt JSON/UUID/Origin/UTM');
    for (const [code, data] of [[429, {}], [503, { error: 'challenge_unavailable' }], [403, { error: 'origin_not_allowed' }], [500, {}], [502, {}], ['network', {}]]) {
      const resetsBefore = await page.evaluate(() => window.__resets);
      await send(code, data);
      assert.equal(await page.evaluate(() => window.__resets), resetsBefore + 1);
      assert.equal(await status.locator('a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
      assert.equal(await page.locator('#kontakt-message').inputValue(), first.body.message);
      assert.equal(requests.at(-1).headers['idempotency-key'], first.headers['idempotency-key']);
    }
    await send(400, { error: 'validation', fields: ['email', 'company'] });
    assert.equal(await page.locator('#kontakt-email').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.locator('#kontakt-company').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'kontakt-email');
    assert.equal(await page.locator('#kontakt-email').inputValue(), first.body.email);
    await send(413);
    assert.equal(await status.textContent(), 'Wiadomość jest za długa.');
    await send(409, { error: 'notice_outdated' });
    assert.match(await status.textContent(), /^Odśwież stronę i wyślij ponownie/);
    await send(409, { error: 'idempotency_conflict' });
    await send(503);
    assert.notEqual(requests.at(-1).headers['idempotency-key'], first.headers['idempotency-key']);
    const conflictKey = requests.at(-1).headers['idempotency-key'];
    await page.locator('#kontakt-message').fill('Zmieniona treść');
    await send(503);
    assert.notEqual(requests.at(-1).headers['idempotency-key'], conflictKey);
    const beforeReset = await page.evaluate(() => window.__resets);
    await send(400, { error: 'challenge_failed' });
    assert.equal(await page.evaluate(() => window.__resets), beforeReset + 1);
    await page.evaluate(() => window.__turnstileOptions['expired-callback']());
    assert.equal(await page.evaluate(() => window.__resets), beforeReset + 2);
    ok('błędy 400/403/409/413/429/5xx i sieci zachowują dane; ponowienia i reset tokenu');
    state.hold = true;
    await page.clock.install();
    await submit.click();
    await page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').disabled);
    assert.equal(await submit.getAttribute('aria-busy'), 'true');
    await page.clock.fastForward(21000);
    await page.waitForFunction(() => !document.querySelector('#kontakt-form [type=submit]').disabled);
    assert.equal(await status.locator('a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    state.hold = false;
    const timeoutKey = requests.at(-1).headers['idempotency-key'];
    await send(202, { ok: true, lead_id: leadId });
    assert.equal(requests.at(-1).headers['idempotency-key'], timeoutKey);
    assert.equal(await status.textContent(), 'Dziękujemy, zapytanie dotarło. Odpiszemy w ciągu jednego dnia roboczego. Potwierdzenie wyślemy na podany adres e-mail.');
    assert.equal(await page.locator('#kontakt-name').inputValue(), '');
    assert.equal(await page.locator('#kontakt-message-count').textContent(), '0 / 4000 znaków');
    assert.equal(await status.evaluate((el) => document.activeElement === el), true);
    assert.deepEqual(await page.evaluate(() => window.__accepted), [{ lead_id: leadId }]);
    assert.deepEqual(await page.evaluate(() => window._paq), []);
    await fill();
    await send(503);
    assert.notEqual(requests.at(-1).headers['idempotency-key'], timeoutKey);
    ok('timeout 20 s, blokada wysyłki, sukces, fokus, zdarzenie i nowy klucz po 202');
    await page.goto(harness.tlsBase + '/?utm_source=drugie#kontakt');
    await page.waitForFunction(() => !!window.__turnstileOptions);
    assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('fg_first_touch')).utm_source), 'pierwsze');
    await fill();
    await page.locator('#kontakt-name').click();
    await page.evaluate(() => localStorage.setItem('revagy-zgoda-analityka', 'tak'));
    await page.reload();
    await page.waitForFunction(() => !!window.__wyslane && !!window.__turnstileOptions);
    await fill();
    await page.locator('label[for="kontakt-name"]').click();
    await page.locator('#kontakt-message').click();
    await send(202, { ok: true, lead_id: leadId });
    const tracked = await page.evaluate(() => window.__wyslane);
    assert.deepEqual(tracked.filter((x) => x[0] === 'trackEvent' && x[1] === 'Formularz'), [['trackEvent', 'Formularz', 'Przyjęty', `revagy / ${leadId}`]]);
    for (const value of [first.body.name, first.body.email, first.body.company, first.body.phone, first.body.message]) assert.ok(!JSON.stringify(tracked).includes(value));
    const mobile = await page.locator('#kontakt-form').evaluate((form) => ({ overflow: document.documentElement.scrollWidth - innerWidth, small: [...form.querySelectorAll('input:not([name=website]),select,textarea')].some((el) => parseFloat(getComputedStyle(el).fontSize) < 16) }));
    assert.deepEqual(mobile, { overflow: 0, small: false });
    await page.setViewportSize({ width: 1440, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    ok('pierwszy kontakt w sesji, Matomo wyłącznie po zgodzie bez danych pól, mobile 390×844 i desktop');

    const nojs = await setup({ javaScriptEnabled: false });
    await nojs.page.goto(harness.tlsBase + '/#kontakt');
    assert.ok(await nojs.page.locator('#kontakt noscript a').isVisible());
    assert.ok(await nojs.page.locator('#kontakt .cta-mail').isVisible());
    const old = await setup();
    await old.context.addInitScript(() => { window.fetch = undefined; });
    await old.page.goto(harness.tlsBase + '/#kontakt');
    assert.equal(await old.page.locator('#kontakt-form [data-status] a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    const fail = await setup();
    fail.state.failChallenge = true;
    await fail.page.goto(harness.tlsBase + '/#kontakt');
    await fail.page.waitForSelector('#kontakt-form [data-status] a');
    assert.equal(await fail.page.locator('#kontakt-form [data-status] a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    const turnstileLoadsBeforeRetry = fail.state.turnstile;
    assert.equal(turnstileLoadsBeforeRetry, 1);
    fail.state.failChallenge = false;
    fail.state.code = 202;
    fail.state.data = { ok: true, lead_id: leadId };
    await fail.page.evaluate(() => {
      window.__holdInitialToken = true;
      window.__delayTurnstileMs = 60;
      window.__resetTurnstileToken = 'fresh-after-expire-token';
    });
    await fail.page.evaluate(installTurnstileMock);
    await fail.page.locator('#kontakt-name').fill('Osoba Testowa');
    await fail.page.locator('#kontakt-email').fill('test@example.com');
    await fail.page.locator('#kontakt-company').fill('  Firma Testowa  ');
    await fail.page.locator('#kontakt-topic').selectOption('audyt');
    await fail.page.locator('#kontakt-form [type=submit]').click();
    await fail.page.waitForFunction(() => !!window.__turnstileOptions && document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'true');
    assert.equal(await fail.page.locator('#kontakt-form [data-status]').textContent(), 'Sprawdzamy ochronę przed spamem…');
    assert.equal(await fail.page.locator('script[src*="challenges.cloudflare.com"]').count(), 0);
    assert.equal(fail.state.turnstile, turnstileLoadsBeforeRetry);
    assert.equal(fail.requests.length, 0);
    await fail.page.evaluate(() => window.__turnstileOptions['expired-callback']());
    await fail.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
    assert.equal(await fail.page.locator('script[src*="challenges.cloudflare.com"]').count(), 0);
    assert.equal(fail.state.turnstile, turnstileLoadsBeforeRetry);
    assert.equal(await fail.page.evaluate(() => window.__resets), 2);
    assert.equal(fail.requests.length, 1);
    assert.equal(fail.requests[0].body.company, 'Firma Testowa');
    assert.equal(fail.requests[0].body['cf-turnstile-response'], 'fresh-after-expire-token');
    const subpageTouch = await setup();
    subpageTouch.state.code = 202;
    subpageTouch.state.data = { ok: true, lead_id: leadId };
    await subpageTouch.page.goto(harness.tlsBase + '/?utm_source=subpage_landing&utm_campaign=hr');
    await subpageTouch.page.goto(harness.tlsBase + '/kontakt.html');
    await subpageTouch.page.locator('#kontakt-name').fill('Osoba Testowa');
    await subpageTouch.page.locator('#kontakt-email').fill('test@example.com');
    await subpageTouch.page.locator('#kontakt-company').fill('  Firma Testowa  ');
    await subpageTouch.page.locator('#kontakt-topic').selectOption('audyt');
    await subpageTouch.page.locator('#kontakt-form [type=submit]').click();
    await subpageTouch.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
    assert.equal(subpageTouch.requests.length, 1);
    assert.equal(subpageTouch.requests[0].body.utm_source, 'subpage_landing');
    assert.equal(subpageTouch.requests[0].body.utm_campaign, 'hr');
    assert.equal(subpageTouch.requests[0].body.landing_path, '/');
    assert.equal(subpageTouch.requests[0].body.company, 'Firma Testowa');
    const privateTab = await setup();
    await privateTab.context.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Test zablokowanej pamięci'); }; });
    await privateTab.page.goto(harness.tlsBase + '/#kontakt');
    await privateTab.page.locator('#kontakt-name').fill('Osoba Testowa');
    await privateTab.page.locator('#kontakt-email').fill('test@example.com');
    await privateTab.page.locator('#kontakt-company').fill('Firma Testowa');
    await privateTab.page.locator('#kontakt-topic').selectOption('inne');
    await privateTab.page.locator('#kontakt-form [type=submit]').click();
    await privateTab.page.waitForSelector('#kontakt-form [data-status] a');
    assert.equal(privateTab.requests.length, 1);
    assert.ok(!Object.hasOwn(privateTab.requests[0].body, 'phone'));
    assert.ok(!Object.hasOwn(privateTab.requests[0].body, 'volume'));
    assert.equal(privateTab.requests[0].body.message, '');
    ok('brak JavaScript/fetch, błąd ładowania Turnstile + ponowienie z asynchronicznym callbackiem, UTM z podstrony i zablokowana pamięć przeglądarki');

    for (const jsRel of ['public/assets/js/kontakt.js', 'public/assets/js/app.js', 'public/assets/js/analytics.js']) {
      const jsCode = fs.readFileSync(path.join(root, jsRel), 'utf8');
      const ast = babelParser.parse(jsCode, { sourceType: 'script' });
      const hits = [];
      findForbiddenSyntax(ast.program, jsRel, hits);
      assert.deepEqual(hits, [], `${jsRel}: wykryto niedozwoloną składnię ES2020+: ${hits.join(', ')}`);
    }
    ok('zgodność składniowa AST app.js, kontakt.js i analytics.js (ES2018 / Safari 13)');

    const challengeErr = await setup();
    await challengeErr.context.addInitScript(() => { window.__failTurnstileErrorCallback = true; });
    await challengeErr.page.goto(harness.tlsBase + '/#kontakt');
    await challengeErr.page.waitForFunction(() => !!window.__turnstileOptions);
    assert.equal(await challengeErr.page.locator('#kontakt-form [data-status] a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    assert.equal(await challengeErr.page.locator('#kontakt-challenge-error').textContent(), 'Nie udało się uruchomić ochrony przed spamem.');
    await challengeErr.page.locator('#kontakt-name').fill('Osoba Testowa');
    await challengeErr.page.locator('#kontakt-email').fill('test@example.com');
    await challengeErr.page.locator('#kontakt-company').fill('Firma Testowa');
    await challengeErr.page.locator('#kontakt-topic').selectOption('audyt');
    const errStartedAt = Date.now();
    await challengeErr.page.locator('#kontakt-form [type=submit]').click();
    await challengeErr.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
    assert.ok(Date.now() - errStartedAt < 5000, 'submit po error-callback nie powinien czekać 15 s');
    assert.equal(await challengeErr.page.evaluate(() => window.__resets), 1);
    assert.equal(challengeErr.requests.length, 0);
    assert.equal(await challengeErr.page.locator('#kontakt-form [data-status] a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    assert.equal(await challengeErr.page.locator('#kontakt-challenge-error').textContent(), 'Nie udało się uruchomić ochrony przed spamem.');
    await challengeErr.page.evaluate(() => {
      window.__failTurnstileErrorCallback = false;
      window.__delayTurnstileMs = 60000;
    });
    const waiterStartedAt = Date.now();
    await challengeErr.page.locator('#kontakt-form [type=submit]').click();
    await challengeErr.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'true');
    await challengeErr.page.evaluate(() => window.__turnstileOptions['error-callback']());
    await challengeErr.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
    assert.ok(Date.now() - waiterStartedAt < 5000, 'error-callback podczas oczekiwania na token powinien od razu przywrócić fallback');
    assert.equal(challengeErr.requests.length, 0);
    assert.equal(await challengeErr.page.locator('#kontakt-form [data-status] a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    challengeErr.state.code = 202;
    challengeErr.state.data = { ok: true, lead_id: leadId };
    await challengeErr.page.evaluate(() => { window.__delayTurnstileMs = 0; });
    await challengeErr.page.locator('#kontakt-form [type=submit]').click();
    await challengeErr.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
    assert.equal(challengeErr.requests.length, 1);
    assert.equal(await challengeErr.page.locator('#kontakt-challenge-error').textContent(), '');
    ok('Turnstile error-callback: brak zwisu 15 s, natychmiastowy fallback mailto i czyste ponowienie');

    const lateChallenge = await setup();
    lateChallenge.state.holdChallenge = true;
    lateChallenge.state.code = 202;
    lateChallenge.state.data = { ok: true, lead_id: leadId };
    await lateChallenge.page.clock.install();
    await lateChallenge.page.goto(harness.tlsBase + '/#kontakt');
    await lateChallenge.page.waitForFunction(() => document.querySelectorAll('script[src*="challenges.cloudflare.com"]').length === 1);
    assert.equal(lateChallenge.state.turnstile, 1);
    await lateChallenge.page.clock.fastForward(21000);
    await lateChallenge.page.waitForSelector('#kontakt-form [data-status] a');
    assert.equal(await lateChallenge.page.locator('#kontakt-form [data-status] a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    assert.equal(await lateChallenge.page.locator('script[src*="challenges.cloudflare.com"]').count(), 1);
    assert.equal(lateChallenge.state.turnstile, 1);
    await lateChallenge.page.locator('#kontakt-name').focus();
    await lateChallenge.page.locator('#kontakt-name').fill('Osoba Testowa');
    await lateChallenge.page.locator('#kontakt-email').fill('test@example.com');
    await lateChallenge.page.locator('#kontakt-company').fill('Firma Testowa');
    await lateChallenge.page.locator('#kontakt-topic').selectOption('audyt');
    assert.equal(await lateChallenge.page.locator('script[src*="challenges.cloudflare.com"]').count(), 1);
    assert.equal(lateChallenge.state.turnstile, 1);
    await lateChallenge.page.locator('#kontakt-form [type=submit]').click();
    await lateChallenge.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'true');
    assert.equal(await lateChallenge.page.locator('script[src*="challenges.cloudflare.com"]').count(), 1);
    assert.equal(lateChallenge.state.turnstile, 1);
    lateChallenge.state.holdChallenge = false;
    lateChallenge.state.releaseChallenge();
    await lateChallenge.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
    assert.equal(await lateChallenge.page.locator('script[src*="challenges.cloudflare.com"]').count(), 1);
    assert.equal(lateChallenge.state.turnstile, 1);
    assert.equal(await lateChallenge.page.locator('#kontakt-challenge iframe').count(), 1);
    assert.equal(lateChallenge.requests.length, 1);
    assert.equal(lateChallenge.requests[0].body['cf-turnstile-response'], 'test-turnstile-token');
    assert.equal(await lateChallenge.page.locator('#kontakt-form [data-status]').textContent(), 'Dziękujemy, zapytanie dotarło. Odpiszemy w ciągu jednego dnia roboczego. Potwierdzenie wyślemy na podany adres e-mail.');
    ok('późne ładowanie api.js: brak duplikatu <script>, jedno renderowanie widgetu i udana wysyłka');

    const retryAfterTimeout = await setup();
    await retryAfterTimeout.page.clock.install();
    await retryAfterTimeout.page.goto(harness.tlsBase + '/#kontakt');
    await retryAfterTimeout.page.waitForFunction(() => !!window.__turnstileOptions);
    await retryAfterTimeout.page.locator('#kontakt-name').fill('Osoba Testowa');
    await retryAfterTimeout.page.locator('#kontakt-email').fill('test@example.com');
    await retryAfterTimeout.page.locator('#kontakt-company').fill('Firma Testowa');
    await retryAfterTimeout.page.locator('#kontakt-topic').selectOption('audyt');
    retryAfterTimeout.state.hold = true;
    await retryAfterTimeout.page.locator('#kontakt-form [type=submit]').click();
    await retryAfterTimeout.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'true');
    assert.equal(retryAfterTimeout.requests.length, 1);
    assert.equal(retryAfterTimeout.requests[0].body['cf-turnstile-response'], 'test-turnstile-token');
    const firstTimeoutKey = retryAfterTimeout.requests[0].headers['idempotency-key'];
    await retryAfterTimeout.page.clock.fastForward(21000);
    await retryAfterTimeout.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
    assert.equal(await retryAfterTimeout.page.evaluate(() => window.__resets), 1);
    retryAfterTimeout.state.hold = false;
    retryAfterTimeout.state.code = 202;
    retryAfterTimeout.state.data = { ok: true, lead_id: leadId };
    await retryAfterTimeout.page.locator('#kontakt-form [type=submit]').click();
    await retryAfterTimeout.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
    assert.equal(retryAfterTimeout.requests.length, 2);
    assert.equal(retryAfterTimeout.requests[1].body['cf-turnstile-response'], 'test-turnstile-token-r1');
    assert.ok(retryAfterTimeout.requests[1].body.t_ms > retryAfterTimeout.requests[0].body.t_ms);
    assert.equal(retryAfterTimeout.requests[1].headers['idempotency-key'], firstTimeoutKey);
    assert.equal(retryAfterTimeout.state.idempotency.get(firstTimeoutKey).accepted, true);
    assert.equal(await retryAfterTimeout.page.locator('#kontakt-form [data-status]').textContent(), 'Dziękujemy, zapytanie dotarło. Odpiszemy w ciągu jednego dnia roboczego. Potwierdzenie wyślemy na podany adres e-mail.');
    ok('ponowienie po timeout z zrotowanym tokenem Turnstile i nowym t_ms zachowuje Idempotency-Key i przechodzi weryfikację hasza (202)');

    const tokenTimeout = await setup();
    await tokenTimeout.context.addInitScript(() => { window.__failTurnstileErrorCallback = true; });
    await tokenTimeout.page.clock.install();
    await tokenTimeout.page.goto(harness.tlsBase + '/#kontakt');
    await tokenTimeout.page.waitForFunction(() => !!window.__turnstileOptions);
    assert.equal(await tokenTimeout.page.locator('#kontakt-challenge-error').textContent(), 'Nie udało się uruchomić ochrony przed spamem.');
    await tokenTimeout.page.locator('#kontakt-name').fill('Osoba Testowa');
    await tokenTimeout.page.locator('#kontakt-email').fill('test@example.com');
    await tokenTimeout.page.locator('#kontakt-company').fill('Firma Testowa');
    await tokenTimeout.page.locator('#kontakt-topic').selectOption('audyt');
    await tokenTimeout.page.evaluate(() => {
      window.__failTurnstileErrorCallback = false;
      window.__holdInitialToken = true;
    });
    await tokenTimeout.page.locator('#kontakt-form [type=submit]').click();
    await tokenTimeout.page.waitForFunction(() => window.__resets === 1 && document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'true');
    assert.equal(await tokenTimeout.page.locator('#kontakt-challenge-error').textContent(), '');
    await tokenTimeout.page.clock.fastForward(16000);
    await tokenTimeout.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
    assert.equal(tokenTimeout.requests.length, 0);
    assert.equal(await tokenTimeout.page.locator('#kontakt-challenge-error').textContent(), 'Potwierdź, że nie jesteś botem, i wyślij ponownie.');
    assert.equal(await tokenTimeout.page.locator('#kontakt-form [data-status] a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    assert.match(await tokenTimeout.page.locator('#kontakt-form [data-status]').textContent(), /^Potwierdź, że nie jesteś botem, i wyślij ponownie\./);
    ok('reset() czyści stary błąd ochrony, a timeout waitForToken(15000) pokazuje komunikat i link mailto');

    const lateIdle = await setup();
    lateIdle.state.holdChallenge = true;
    lateIdle.state.code = 202;
    lateIdle.state.data = { ok: true, lead_id: leadId };
    await lateIdle.page.clock.install();
    await lateIdle.page.goto(harness.tlsBase + '/#kontakt');
    await lateIdle.page.waitForFunction(() => document.querySelectorAll('script[src*="challenges.cloudflare.com"]').length === 1);
    await lateIdle.page.clock.fastForward(21000);
    await lateIdle.page.waitForSelector('#kontakt-form [data-status] a');
    assert.equal(await lateIdle.page.locator('#kontakt-form [data-status] a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    assert.equal(await lateIdle.page.locator('#kontakt-challenge-error').textContent(), 'Nie udało się uruchomić ochrony przed spamem.');
    lateIdle.state.holdChallenge = false;
    lateIdle.state.releaseChallenge();
    await lateIdle.page.waitForFunction(() => !!window.__turnstileOptions && document.querySelector('#kontakt-challenge iframe'));
    assert.equal(await lateIdle.page.locator('#kontakt-form [data-status]').textContent(), '');
    assert.equal(await lateIdle.page.locator('#kontakt-challenge-error').textContent(), '');
    assert.equal(await lateIdle.page.locator('#kontakt-form [data-status] a').count(), 0);
    await lateIdle.page.locator('#kontakt-name').fill('Osoba Testowa');
    await lateIdle.page.locator('#kontakt-email').fill('test@example.com');
    await lateIdle.page.locator('#kontakt-company').fill('Firma Testowa');
    await lateIdle.page.locator('#kontakt-topic').selectOption('audyt');
    await lateIdle.page.locator('#kontakt-form [type=submit]').click();
    await lateIdle.page.waitForFunction(() => document.querySelector('#kontakt-form [type=submit]').getAttribute('aria-busy') === 'false');
    assert.equal(lateIdle.requests.length, 1);
    assert.equal(await lateIdle.page.locator('#kontakt-form [data-status]').textContent(), 'Dziękujemy, zapytanie dotarło. Odpiszemy w ciągu jednego dnia roboczego. Potwierdzenie wyślemy na podany adres e-mail.');
    ok('późne załadowanie api.js w stanie bezczynności automatycznie czyści błąd preloadu w [data-status] i #kontakt-challenge-error');

    for (const item of [t, nojs, old, fail, subpageTouch, privateTab, challengeErr, tokenTimeout, lateChallenge, lateIdle, retryAfterTimeout]) {
      assert.deepEqual(item.errors, []);
      assert.deepEqual(item.external, []);
      if (item !== nojs) assert.deepEqual(await item.page.evaluate(() => window.__violations), []);
    }
    ok('brak błędów JS i naruszeń rzeczywistej CSP; pełna izolacja od usług');
    for (const context of contexts) await context.close();
    console.log(`FORMULARZ OK: ${checks} grup sprawdzeń.`);
  } finally {
    if (browser) await browser.close();
    if (harness) harness.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error.message);
  if (error.stdout) console.error(error.stdout.toString());
  process.exitCode = 1;
});
