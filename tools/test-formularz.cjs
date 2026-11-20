#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const { startLocalHarness, SECURITY_HEADERS, MATOMO_MOCK_JS } = require('./smoke-test.cjs');
const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'revagy-form-'));
const dist = path.join(temp, 'dist');
const leadId = 'ld_' + 'a'.repeat(32);
const mock = `(() => {
  let token = 'test-turnstile-token';
  window.__resets = 0;
  window.turnstile = {
    render(selector, options) {
      window.__turnstileOptions = options;
      const iframe = document.createElement('iframe');
      iframe.src = 'https://challenges.cloudflare.com/test-frame';
      iframe.title = 'Ochrona przed spamem';
      iframe.width = '150'; iframe.height = '140';
      document.querySelector(selector).append(iframe);
      options.callback(token);
      return 'test-widget';
    },
    reset() { window.__resets++; token = 'test-turnstile-token'; window.__turnstileOptions.callback(token); },
    getResponse() { return token; }
  };
})();`;
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
      const state = { code: 503, data: { error: 'queue_full' }, turnstile: 0, failChallenge: false, hold: false };
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
            if (state.failChallenge) return route.abort();
            return route.fulfill({ contentType: 'application/javascript', body: mock });
          }
          return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="pl"><title>Ochrona</title></html>' });
        }
        if (url.hostname === 'stats.revagy.pl') return route.fulfill({ contentType: 'application/javascript', body: url.pathname.endsWith('matomo.js') ? MATOMO_MOCK_JS : '' });
        if (url.origin === harness.tlsBase && url.pathname === '/api/kontakt') {
          requests.push({ body: route.request().postDataJSON(), headers: await route.request().allHeaders(), method: route.request().method() });
          if (state.hold) return; // Timeout kontrolowany zegarem przeglądarki.
          if (state.code === 'network') return route.abort('failed');
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
      await page.locator('#kontakt-company').fill('Firma Testowa');
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
    await page.locator('#kontakt-phone').fill('abc');
    await submit.click();
    assert.equal(requests.length, 0);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'kontakt-phone');
    await page.locator('#kontakt-phone').fill('+48 123 456 789');
    await send(503, { error: 'queue_full' });
    assert.equal(await status.locator('a').getAttribute('href'), 'mailto:kontakt@revagy.pl');
    const first = requests[0];
    assert.equal(first.method, 'POST');
    assert.equal(first.headers.origin, harness.tlsBase);
    assert.match(first.headers['idempotency-key'], /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.equal(first.headers['content-type'], 'application/json');
    assert.deepEqual(Object.keys(first.body).sort(), ['schema_version', 'name', 'email', 'company', 'phone', 'topic', 'volume', 'message', 'website', 'notice_version', 'cf-turnstile-response', 't_ms', 'utm_source', 'utm_campaign', 'utm_content', 'referrer', 'landing_path'].sort());
    assert.equal(first.body.schema_version, 'lead.v1');
    assert.equal(first.body.notice_version, 'revagy-2026-11-v1');
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
      await send(code, data);
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
    ok('brak JavaScript/fetch, błąd ładowania Turnstile i zablokowana pamięć przeglądarki');
    for (const item of [t, nojs, old, fail, privateTab]) {
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
