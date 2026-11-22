'use strict';
/* tools/lighthouse.cjs bez sieci i bez Chrome: konfiguracja, mediana, progi, lokalny serwer
   oraz pełny przebieg z atrapą polecenia Lighthouse (skrypt Node zapisujący raport JSON). */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const zlib = require('node:zlib');
const { tmp, zapisz, uruchom, TOOLS } = require('./pomoc.cjs');
const lh = require('../lighthouse.cjs');

const SKRYPT = path.join(TOOLS, 'lighthouse.cjs');

const dobra = () => ({
  opis: 'test',
  wersja: '13.6.0',
  przebiegi: 3,
  strony: [{ plik: 'finanse.html', progi: { performance: 90, accessibility: 95, seo: 100 } }],
});

/* ---------- konfiguracja ---------- */

test('lighthouse: konfiguracja z repozytorium jest poprawna', () => {
  const k = lh.wczytajKonfiguracje(path.join(TOOLS, 'lighthouse.json'));
  assert.match(k.wersja, /^\d+\.\d+\.\d+$/);
  assert.ok(k.strony.length >= 1);
});

test('lighthouse: poprawna konfiguracja nie ma błędów', () => {
  assert.deepEqual(lh.sprawdzKonfiguracje(dobra()), []);
});

test('lighthouse: błędne pola konfiguracji dają czytelne błędy', () => {
  const przypadki = [
    [(k) => { k.wersja = 'latest'; }, /„wersja” musi być dokładną wersją/],
    [(k) => { k.wersja = '^13.6.0'; }, /„wersja” musi być dokładną wersją/],
    [(k) => { k.przebiegi = 0; }, /„przebiegi” musi być liczbą całkowitą/],
    [(k) => { k.przebiegi = 2.5; }, /„przebiegi” musi być liczbą całkowitą/],
    [(k) => { k.strony = []; }, /„strony” musi być niepustą listą/],
    [(k) => { k.progi = {}; }, /nieznane pole „progi”/],
    [(k) => { k.opis = 5; }, /„opis” musi być tekstem/],
    [(k) => { k.strony[0].plik = '../etc/passwd.html'; }, /strony\[0\]\.plik musi być względną ścieżką/],
    [(k) => { k.strony[0].plik = '/finanse.html'; }, /strony\[0\]\.plik musi być względną ścieżką/],
    [(k) => { k.strony[0].plik = 'finanse.css'; }, /strony\[0\]\.plik musi być względną ścieżką/],
    [(k) => { k.strony.push({ ...k.strony[0] }); }, /strony\[1\]\.plik „finanse\.html” jest na liście drugi raz/],
    [(k) => { k.strony[0].progi = {}; }, /strony\[0\]\.progi musi być niepustym obiektem/],
    [(k) => { k.strony[0].progi['best-practices'] = 90; }, /nieznana kategoria „best-practices”/],
    [(k) => { k.strony[0].progi.seo = 101; }, /strony\[0\]\.progi\.seo musi być liczbą całkowitą od 0 do 100/],
    [(k) => { k.strony[0].progi.performance = '90'; }, /progi\.performance musi być liczbą całkowitą/],
    [(k) => { k.strony[0].adres = 'x'; }, /strony\[0\]: nieznane pole „adres”/],
  ];
  for (const [zmien, wzor] of przypadki) {
    const k = dobra();
    zmien(k);
    const bledy = lh.sprawdzKonfiguracje(k);
    assert.ok(bledy.some((b) => wzor.test(b)), `${wzor}: ${JSON.stringify(bledy)}`);
  }
  assert.deepEqual(lh.sprawdzKonfiguracje([]), ['konfiguracja musi być obiektem JSON']);
});

test('lighthouse: zły JSON konfiguracji to błąd uruchomienia z nazwą pliku', () => {
  const dir = tmp('revagy-lh-konfig-');
  const p = zapisz(dir, 'lh.json', '{ "wersja": ');
  assert.throws(() => lh.wczytajKonfiguracje(p), /nie jest poprawnym JSON/);
});

/* ---------- mediana i progi ---------- */

test('lighthouse: mediana', () => {
  assert.equal(lh.mediana([90]), 90);
  assert.equal(lh.mediana([95, 80, 90]), 90);
  assert.equal(lh.mediana([100, 70, 90, 80]), 85);
  assert.equal(lh.mediana([88, 88, 92]), 88);
  assert.throws(() => lh.mediana([]));
});

function raport({ performance, accessibility, seo }, audyty = {}) {
  const audits = {
    'color-contrast': { title: 'Kontrast kolorów', score: 1, scoreDisplayMode: 'binary' },
    'image-alt': { title: 'Obrazy mają alt', score: 1, scoreDisplayMode: 'binary' },
    'aria-allowed-attr': { title: 'Atrybuty ARIA', score: null, scoreDisplayMode: 'notApplicable' },
    'meta-description': { title: 'Opis meta', score: 1, scoreDisplayMode: 'binary' },
    'structured-data': { title: 'Dane strukturalne', score: null, scoreDisplayMode: 'manual' },
  };
  for (const [id, score] of Object.entries(audyty)) audits[id] = { ...audits[id], score };
  return {
    lighthouseVersion: '13.6.0',
    categories: {
      performance: { score: performance, auditRefs: [] },
      accessibility: { score: accessibility, auditRefs: [{ id: 'color-contrast', weight: 7 }, { id: 'image-alt', weight: 10 }, { id: 'aria-allowed-attr', weight: 10 }] },
      seo: { score: seo, auditRefs: [{ id: 'meta-description', weight: 1 }, { id: 'structured-data', weight: 0 }] },
    },
    audits,
  };
}

test('lighthouse: wyniki kategorii są zaokrąglane do 0–100, brak wyniku to błąd', () => {
  assert.deepEqual(lh.wynikiKategorii(raport({ performance: 0.894, accessibility: 0.955, seo: 1 })), { performance: 89, accessibility: 96, seo: 100 });
  assert.throws(() => lh.wynikiKategorii(raport({ performance: null, accessibility: 1, seo: 1 })), /kategorii performance/);
  const zBledem = { ...raport({ performance: 1, accessibility: 1, seo: 1 }), runtimeError: { code: 'NO_FCP', message: 'brak FCP' } };
  assert.throws(() => lh.wynikiKategorii(zBledem), /NO_FCP/);
});

test('lighthouse: ocena progów na medianie każdej kategorii osobno', () => {
  const strona = dobra().strony[0];
  const ok = lh.ocenStrone(strona, [
    raport({ performance: 0.85, accessibility: 0.96, seo: 1 }),
    raport({ performance: 0.93, accessibility: 0.95, seo: 1 }),
    raport({ performance: 0.91, accessibility: 0.99, seo: 0.9 }),
  ]);
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.kategorie.performance, { wyniki: [85, 93, 91], mediana: 91, prog: 90, ok: true });
  assert.equal(ok.kategorie.seo.mediana, 100);

  const nie = lh.ocenStrone(strona, [
    raport({ performance: 0.95, accessibility: 0.9, seo: 1 }, { 'color-contrast': 0 }),
    raport({ performance: 0.95, accessibility: 0.94, seo: 1 }, { 'color-contrast': 0, 'image-alt': 0 }),
    raport({ performance: 0.95, accessibility: 0.97, seo: 1 }),
  ]);
  assert.equal(nie.ok, false);
  assert.equal(nie.kategorie.accessibility.mediana, 94);
  assert.equal(nie.kategorie.accessibility.ok, false);
  assert.equal(nie.kategorie.performance.ok, true);
  // Audyty z przebiegu medianowego (2.), bez audytów „notApplicable” i „manual”.
  assert.equal(nie.audyty.accessibility.przebieg, 2);
  assert.deepEqual(nie.audyty.accessibility.lista.map((a) => a.id), ['color-contrast', 'image-alt']);
  assert.equal(nie.audyty.accessibility.lista[0].tytul, 'Kontrast kolorów');
  assert.deepEqual(nie.audyty.seo.lista, []);
});

test('lighthouse: kategoria bez progu nie zatrzymuje, przy parzystej liczbie przebiegów audyty z ostatniego', () => {
  const r = lh.ocenStrone({ plik: 'a.html', progi: { seo: 90 } }, [
    raport({ performance: 0.1, accessibility: 0.8, seo: 0.9 }, { 'meta-description': 0 }),
    raport({ performance: 0.2, accessibility: 0.9, seo: 1 }),
  ]);
  assert.equal(r.ok, true);
  assert.equal(r.kategorie.performance.prog, null);
  assert.equal(r.kategorie.seo.mediana, 95);
  assert.equal(r.audyty.seo.przebieg, 2);
  assert.equal(r.audyty.accessibility.przebieg, 2);
});

test('lighthouse: polecenie domyślne i podmienione', () => {
  assert.deepEqual(lh.polecenieLighthouse('13.6.0', { env: {} }), ['npx', '--yes', 'lighthouse@13.6.0']);
  assert.deepEqual(lh.polecenieLighthouse('13.6.0', { env: { LIGHTHOUSE_POLECENIE: 'node  /x/atrapa.cjs' } }), ['node', '/x/atrapa.cjs']);
  assert.deepEqual(lh.polecenieLighthouse('13.6.0', { opcja: '["node","/a b/atrapa.cjs"]', env: { LIGHTHOUSE_POLECENIE: 'inne' } }), ['node', '/a b/atrapa.cjs']);
  assert.throws(() => lh.polecenieLighthouse('13.6.0', { opcja: '[1]', env: {} }), /tablica JSON/);
  const a = lh.argumentyLighthouse('http://127.0.0.1:1/finanse.html', '/w/finanse-1');
  assert.ok(a.includes('--only-categories=performance,accessibility,seo'));
  assert.ok(a.includes('--chrome-flags=--headless=new --no-sandbox'));
  assert.ok(a.includes('--output=json') && a.includes('--output=html'));
});

/* ---------- serwer ---------- */

function pobierz(adres, { gzip = false, sciezka } = {}) {
  const u = new URL(adres);
  return new Promise((resolve, reject) => {
    http.get({
      host: u.hostname, port: u.port, path: sciezka || u.pathname,
      headers: gzip ? { 'Accept-Encoding': 'gzip, deflate, br' } : {},
    }, (res) => {
      const c = [];
      res.on('data', (d) => c.push(d));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c) }));
    }).on('error', reject);
  });
}

function distTestowy() {
  const root = tmp('revagy-lh-dist-');
  const dist = path.join(root, 'dist');
  zapisz(dist, 'finanse.html', `<!doctype html><title>Finanse</title>${'<p>tekst</p>'.repeat(200)}`);
  zapisz(dist, '404.html', '<!doctype html><title>Nie ma</title>');
  zapisz(dist, 'index.html', '<!doctype html><title>Start</title>');
  zapisz(dist, 'assets/css/styles.css', 'body{color:red}'.repeat(50));
  zapisz(dist, 'assets/js/app.js', 'console.log(1);');
  zapisz(dist, 'site.webmanifest', '{"name":"REVAGY"}');
  zapisz(dist, 'assets/img/a.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>');
  zapisz(dist, 'assets/video/a.webm', Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  zapisz(dist, 'assets/fonts/a.woff2', Buffer.from('wOF2'));
  zapisz(root, 'tajne.txt', 'poza katalogiem');
  return { root, dist };
}

test('lighthouse: serwer podaje typy MIME, gzip dla tekstu, 404 i nie wychodzi poza katalog', async () => {
  const { dist } = distTestowy();
  const s = await lh.startSerwer(dist);
  try {
    assert.match(s.adres, /^http:\/\/127\.0\.0\.1:\d+$/);

    const html = await pobierz(`${s.adres}/finanse.html`, { gzip: true });
    assert.equal(html.status, 200);
    assert.equal(html.headers['content-type'], 'text/html; charset=utf-8');
    assert.equal(html.headers['content-encoding'], 'gzip');
    assert.equal(html.headers['cache-control'], 'no-cache');
    assert.match(zlib.gunzipSync(html.body).toString('utf8'), /<title>Finanse<\/title>/);
    assert.equal(Number(html.headers['content-length']), html.body.length);

    const bez = await pobierz(`${s.adres}/finanse.html`);
    assert.equal(bez.headers['content-encoding'], undefined);
    assert.match(bez.body.toString('utf8'), /<title>Finanse<\/title>/);

    const oczekiwane = {
      '/assets/css/styles.css': ['text/css; charset=utf-8', true],
      '/assets/js/app.js': ['application/javascript; charset=utf-8', true],
      '/site.webmanifest': ['application/manifest+json', true],
      '/assets/img/a.svg': ['image/svg+xml', true],
      '/assets/video/a.webm': ['video/webm', false],
      '/assets/fonts/a.woff2': ['font/woff2', false],
    };
    for (const [p, [typ, gz]] of Object.entries(oczekiwane)) {
      const r = await pobierz(`${s.adres}${p}`, { gzip: true });
      assert.equal(r.status, 200, p);
      assert.equal(r.headers['content-type'], typ, p);
      assert.equal(r.headers['content-encoding'], gz ? 'gzip' : undefined, p);
    }

    const start = await pobierz(`${s.adres}/`);
    assert.match(start.body.toString('utf8'), /<title>Start<\/title>/);

    const brak = await pobierz(`${s.adres}/nie-ma.html`);
    assert.equal(brak.status, 404);
    assert.match(brak.body.toString('utf8'), /Nie ma/);

    for (const zla of ['/../tajne.txt', '/%2e%2e/tajne.txt', '/assets/..%2f..%2ftajne.txt', '/..%5c..%5ctajne.txt']) {
      const r = await pobierz(s.adres, { sciezka: zla });
      assert.ok([403, 404].includes(r.status), `${zla}: ${r.status}`);
      assert.doesNotMatch(r.body.toString('utf8'), /poza katalogiem/, zla);
    }
    assert.equal((await pobierz(s.adres, { sciezka: '/%E0%A4%A' })).status, 400);
  } finally {
    await s.close();
  }
});

test('lighthouse: serwer odrzuca dowiązanie wskazujące poza katalog', async (t) => {
  const { root, dist } = distTestowy();
  try { fs.symlinkSync(path.join(root, 'tajne.txt'), path.join(dist, 'link.txt')); } catch { t.skip('brak dowiązań'); return; }
  const s = await lh.startSerwer(dist);
  try {
    const r = await pobierz(`${s.adres}/link.txt`);
    assert.equal(r.status, 403);
  } finally { await s.close(); }
});

/* ---------- pełny przebieg z atrapą ---------- */

// Atrapa Lighthouse: pobiera adres z lokalnego serwera (dowód, że serwer działa w trakcie przebiegu),
// zapisuje <output-path>.report.json i .report.html z wynikami z ATRAPA_WYNIKI dla kolejnego przebiegu.
const ATRAPA = `'use strict';
const fs = require('node:fs');
const http = require('node:http');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.ATRAPA_LOG, JSON.stringify(args) + '\\n');
if (process.env.ATRAPA_TRYB === 'blad') { console.error('Chrome się nie uruchomił'); process.exit(1); }
const adres = args.find((a) => !a.startsWith('--'));
const baza = args.find((a) => a.startsWith('--output-path=')).slice('--output-path='.length);
const n = Number(baza.match(/-(\\d+)$/)[1]);
const w = JSON.parse(process.env.ATRAPA_WYNIKI)[n - 1];
http.get(adres, { headers: { 'Accept-Encoding': 'gzip' } }, (res) => {
  res.resume();
  res.on('end', () => {
    if (res.statusCode !== 200 || res.headers['content-encoding'] !== 'gzip') { console.error('zła odpowiedź ' + res.statusCode); process.exit(3); }
    const lhr = {
      lighthouseVersion: '13.6.0', requestedUrl: adres,
      categories: {
        performance: { score: w.performance, auditRefs: [] },
        accessibility: { score: w.accessibility, auditRefs: [{ id: 'color-contrast', weight: 7 }] },
        seo: { score: w.seo, auditRefs: [{ id: 'meta-description', weight: 1 }] },
      },
      audits: {
        'color-contrast': { title: 'Kontrast kolorów', score: w.accessibility < 1 ? 0 : 1, scoreDisplayMode: 'binary' },
        'meta-description': { title: 'Opis meta', score: 1, scoreDisplayMode: 'binary' },
      },
    };
    fs.writeFileSync(baza + '.report.json', JSON.stringify(lhr));
    fs.writeFileSync(baza + '.report.html', '<!doctype html><title>raport</title>');
  });
}).on('error', (e) => { console.error(e.message); process.exit(4); });
`;

function przygotuj(wyniki, { tryb } = {}) {
  const { root, dist } = distTestowy();
  const atrapa = zapisz(root, 'atrapa.cjs', ATRAPA);
  const konfig = zapisz(root, 'lh.json', dobra());
  const wynikiDir = path.join(root, 'wyniki');
  const log = path.join(root, 'log.txt');
  const summary = path.join(root, 'summary.md');
  const env = {
    LIGHTHOUSE_POLECENIE: JSON.stringify([process.execPath, atrapa]),
    ATRAPA_LOG: log,
    ATRAPA_WYNIKI: JSON.stringify(wyniki),
    GITHUB_STEP_SUMMARY: summary,
    ...(tryb ? { ATRAPA_TRYB: tryb } : {}),
  };
  const run = (extra = []) => uruchom([SKRYPT, dist, `--wyniki=${wynikiDir}`, `--konfig=${konfig}`, ...extra], { env });
  return { root, dist, wynikiDir, log, summary, konfig, run };
}

const wywolania = (log) => fs.readFileSync(log, 'utf8').trim().split('\n').map((l) => JSON.parse(l));

test('lighthouse: przebieg z atrapą, progi spełnione — kod 0, raporty, wynik.json, wynik.md i podsumowanie joba', () => {
  const p = przygotuj([
    { performance: 0.91, accessibility: 1, seo: 1 },
    { performance: 0.97, accessibility: 1, seo: 1 },
    { performance: 0.88, accessibility: 1, seo: 1 },
  ]);
  const r = p.run();
  assert.equal(r.kod, 0, r.out + r.err);
  assert.match(r.out, /OK: wszystkie progi spełnione/);

  const w = wywolania(p.log);
  assert.equal(w.length, 3);
  assert.match(w[0][0], /^http:\/\/127\.0\.0\.1:\d+\/finanse\.html$/);
  assert.ok(w[0].includes('--chrome-flags=--headless=new --no-sandbox'));
  assert.ok(w[0].includes('--quiet'));

  for (let n = 1; n <= 3; n++) {
    assert.ok(fs.existsSync(path.join(p.wynikiDir, `finanse-${n}.report.json`)));
    assert.ok(fs.existsSync(path.join(p.wynikiDir, `finanse-${n}.report.html`)));
  }
  const wynik = JSON.parse(fs.readFileSync(path.join(p.wynikiDir, 'wynik.json'), 'utf8'));
  assert.equal(wynik.kod, 0);
  assert.equal(wynik.ok, true);
  assert.equal(wynik.wersja, '13.6.0');
  assert.deepEqual(wynik.strony[0].kategorie.performance, { wyniki: [91, 97, 88], mediana: 91, prog: 90, ok: true });
  const md = fs.readFileSync(path.join(p.wynikiDir, 'wynik.md'), 'utf8');
  assert.match(md, /\| `finanse\.html` \| 91 \/ 90 \| 100 \/ 95 \| 100 \/ 100 \| OK \|/);
  assert.match(md, /Nie jest to pomiar produkcji/);
  assert.equal(fs.readFileSync(p.summary, 'utf8').trim(), md.trim());
});

test('lighthouse: przebieg z atrapą, próg niespełniony — kod 1 i lista audytów do poprawy', () => {
  const p = przygotuj([
    { performance: 0.95, accessibility: 0.9, seo: 1 },
    { performance: 0.95, accessibility: 0.93, seo: 1 },
    { performance: 0.95, accessibility: 0.99, seo: 1 },
  ]);
  const r = p.run();
  assert.equal(r.kod, 1, r.out + r.err);
  assert.match(r.err, /PRÓG NIESPEŁNIONY/);
  assert.match(r.out, /Dostępność\s+mediana\s+93\s+próg\s+95/);
  assert.match(r.out, /niezaliczony audyt Dostępność: color-contrast \(Kontrast kolorów\)/);
  const wynik = JSON.parse(fs.readFileSync(path.join(p.wynikiDir, 'wynik.json'), 'utf8'));
  assert.equal(wynik.kod, 1);
  assert.equal(wynik.strony[0].kategorie.accessibility.ok, false);
  assert.deepEqual(wynik.strony[0].audyty.accessibility.lista, [{ id: 'color-contrast', tytul: 'Kontrast kolorów' }]);
  const md = fs.readFileSync(path.join(p.wynikiDir, 'wynik.md'), 'utf8');
  assert.match(md, /PONIŻEJ PROGU/);
  assert.match(md, /- `color-contrast`: Kontrast kolorów/);
});

test('lighthouse: Lighthouse bez raportu — kod 2, opis błędu i wynik.json z błędem', () => {
  const p = przygotuj([], { tryb: 'blad' });
  const r = p.run();
  assert.equal(r.kod, 2, r.out + r.err);
  assert.match(r.err, /BŁĄD URUCHOMIENIA: Lighthouse nie zwrócił raportu dla finanse\.html \(przebieg 1, kod 1\)/);
  assert.match(r.err, /Chrome się nie uruchomił/);
  const wynik = JSON.parse(fs.readFileSync(path.join(p.wynikiDir, 'wynik.json'), 'utf8'));
  assert.equal(wynik.kod, 2);
  assert.match(wynik.blad, /nie zwrócił raportu/);
  assert.match(fs.readFileSync(p.summary, 'utf8'), /Błąd uruchomienia/);
});

test('lighthouse: brak strony w dist, zła konfiguracja i brak argumentu — kod 2, bez uruchamiania Lighthouse', () => {
  const p = przygotuj([]);
  fs.rmSync(path.join(p.dist, 'finanse.html'));
  const r = p.run();
  assert.equal(r.kod, 2, r.out + r.err);
  assert.match(r.err, /brak plików w .*: finanse\.html/);
  assert.equal(fs.existsSync(p.log), false);

  zapisz(p.root, 'lh.json', { ...dobra(), przebiegi: 0 });
  const zla = p.run();
  assert.equal(zla.kod, 2);
  assert.match(zla.err, /błędna konfiguracja .*\n\s+- „przebiegi” musi być liczbą całkowitą/);
  assert.match(fs.readFileSync(path.join(p.wynikiDir, 'wynik.json'), 'utf8'), /"kod": 2/);

  const bez = uruchom([SKRYPT]);
  assert.equal(bez.kod, 2);
  assert.match(bez.err, /Użycie/);
});

test('lighthouse: nieistniejące polecenie Lighthouse — kod 2', () => {
  const p = przygotuj([]);
  const r = uruchom([SKRYPT, p.dist, `--wyniki=${p.wynikiDir}`, `--konfig=${p.konfig}`, '--polecenie=/nie/ma/takiego-polecenia']);
  assert.equal(r.kod, 2, r.out + r.err);
  assert.match(r.err, /nie da się uruchomić \(spawn \/nie\/ma\/takiego-polecenia ENOENT\)/);
});
