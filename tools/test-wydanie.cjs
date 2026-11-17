#!/usr/bin/env node
/* Izolowane testy skryptu deploy/wydanie.sh w katalogach tymczasowych (/tmp).
   Nigdy nie używa produkcyjnego /var/www/revagy.pl ani aktywnego symlinka current.
   Sprawdza Fazy D i D2: walidacje wejścia, uprawnienia, symlinki/hardlinki/FIFO,
   przerwania w 3 punktach, retry zgodne i niezgodne, współbieżność pod flock,
   inicjalizację manifestu starego release i bezpieczny rollback. */
'use strict';

const assert = require('node:assert/strict');
const { execFileSync, spawn, spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'deploy', 'wydanie.sh');

const SHA_OLD = 'dc8221716605a74aa71657a531a120f618f0975b';
const SHA_NEW = '1111111111111111111111111111111111111111';
const SHA_ALT = '2222222222222222222222222222222222222222';
const SHA_OTHER = '3333333333333333333333333333333333333333';

const REQUIRED_FILES = [
  'index.html',
  'polityka-prywatnosci.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'site.webmanifest',
  'favicon.ico',
  'assets/css/styles.css',
  'assets/js/app.js',
  'assets/js/analytics.js',
];

function sha256Buf(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function makeSampleDist(dir, tag = 'v1') {
  fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
  fs.chmodSync(dir, 0o755);
  for (const rel of REQUIRED_FILES) {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true, mode: 0o755 });
    const content = rel.endsWith('.ico')
      ? Buffer.from([0x00, 0x00, 0x01, 0x00, tag.charCodeAt(0)])
      : Buffer.from(`<!doctype html><!-- ${rel} ${tag} -->\n`, 'utf8');
    fs.writeFileSync(p, content);
    fs.chmodSync(p, 0o644);
  }
  // Ustaw 0755 dla wszystkich podkatalogów
  const fixDirs = (d) => {
    fs.chmodSync(d, 0o755);
    for (const e of fs.readdirSync(d)) {
      const full = path.join(d, e);
      if (fs.statSync(full).isDirectory()) fixDirs(full);
    }
  };
  fixDirs(dir);
}

function buildManifest(dir, outFile) {
  const rels = [];
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      const st = fs.lstatSync(full);
      if (st.isDirectory()) walk(full);
      else if (st.isFile()) rels.push(path.relative(dir, full).split(path.sep).join('/'));
    }
  };
  walk(dir);
  rels.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const lines = rels.map((rel) => `${sha256Buf(fs.readFileSync(path.join(dir, rel)))}  ${rel}\n`).join('');
  fs.writeFileSync(outFile, lines, { encoding: 'utf8', mode: 0o644 });
  fs.chmodSync(outFile, 0o644);
  return { file: outFile, sha256: sha256Buf(Buffer.from(lines, 'utf8')), text: lines };
}

function setupBase(tmpRoot, withOldManifest = true) {
  const base = path.join(tmpRoot, 'base');
  fs.mkdirSync(path.join(base, 'releases'), { recursive: true, mode: 0o755 });
  fs.mkdirSync(path.join(base, 'manifests'), { recursive: true, mode: 0o755 });
  fs.chmodSync(base, 0o755);
  fs.chmodSync(path.join(base, 'releases'), 0o755);
  fs.chmodSync(path.join(base, 'manifests'), 0o755);

  const oldDir = path.join(base, 'releases', SHA_OLD);
  makeSampleDist(oldDir, 'old');
  const oldMan = buildManifest(oldDir, path.join(tmpRoot, 'old.sha256'));
  if (withOldManifest) {
    fs.copyFileSync(oldMan.file, path.join(base, 'manifests', `${SHA_OLD}.sha256`));
    fs.chmodSync(path.join(base, 'manifests', `${SHA_OLD}.sha256`), 0o644);
  }
  fs.symlinkSync(oldDir, path.join(base, 'current'));
  return { base, oldDir, oldMan };
}

function runScript(base, args, extraEnv = {}) {
  return spawnSync('sh', [SCRIPT, ...args], {
    env: { ...process.env, REVAGY_BASE: base, ...extraEnv },
    encoding: 'utf8',
  });
}

function runScriptAsync(base, args, extraEnv = {}) {
  return new Promise((resolve) => {
    const child = spawn('sh', [SCRIPT, ...args], {
      env: { ...process.env, REVAGY_BASE: base, ...extraEnv },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

const results = [];
async function test(name, fn) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'revagy-deploy-test-'));
  try {
    await fn(tmp);
    results.push({ name, ok: true });
    console.log(`OK   ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err });
    console.error(`FAIL ${name}: ${err.stack || err.message}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

(async () => {
  // 0. Składnia w dash
  const syntax = spawnSync('dash', ['-n', SCRIPT], { encoding: 'utf8' });
  assert.equal(syntax.status, 0, `dash -n failed: ${syntax.stderr}`);
  console.log('OK   dash -n składnia POSIX sh');

  // 1. Brak index.html
  await test('odrzuca źródło bez index.html', (tmp) => {
    const { base, oldDir } = setupBase(tmp);
    const src = path.join(tmp, 'src');
    makeSampleDist(src, 'new');
    const man = buildManifest(src, path.join(tmp, 'm.sha256'));
    fs.unlinkSync(path.join(src, 'index.html'));
    const r = runScript(base, [src, SHA_NEW, SHA_OLD, man.file, man.sha256]);
    assert.notEqual(r.status, 0);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(oldDir));
  });

  // 2. Niepełny dist (brak site.webmanifest)
  await test('odrzuca niepełny dist (brak site.webmanifest)', (tmp) => {
    const { base, oldDir } = setupBase(tmp);
    const src = path.join(tmp, 'src');
    makeSampleDist(src, 'new');
    fs.unlinkSync(path.join(src, 'site.webmanifest'));
    const man = buildManifest(src, path.join(tmp, 'm.sha256'));
    const r = runScript(base, [src, SHA_NEW, SHA_OLD, man.file, man.sha256]);
    assert.notEqual(r.status, 0);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(oldDir));
  });

  // 3. Nadmiarowy plik w dist względem manifestu
  await test('odrzuca nadmiarowy plik w dist względem manifestu', (tmp) => {
    const { base, oldDir } = setupBase(tmp);
    const src = path.join(tmp, 'src');
    makeSampleDist(src, 'new');
    const man = buildManifest(src, path.join(tmp, 'm.sha256'));
    fs.writeFileSync(path.join(src, 'extra.txt'), 'niespodzianka', { mode: 0o644 });
    const r = runScript(base, [src, SHA_NEW, SHA_OLD, man.file, man.sha256]);
    assert.notEqual(r.status, 0);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(oldDir));
  });

  // 4. Błędne SHA (skrócone, wielkie litery, spoza hex)
  await test('odrzuca błędne SHA (krótkie, wielkie litery, spoza hex)', (tmp) => {
    const { base } = setupBase(tmp);
    const src = path.join(tmp, 'src');
    makeSampleDist(src, 'new');
    const man = buildManifest(src, path.join(tmp, 'm.sha256'));
    for (const bad of ['1111111', 'abcdef1234567890abcdef1234567890ABCDEF12', 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz']) {
      const r = runScript(base, [src, bad, SHA_OLD, man.file, man.sha256]);
      assert.notEqual(r.status, 0, `expected failure for ${bad}`);
    }
  });

  // 5. Błędny sha256 manifestu lub nieposortowany manifest
  await test('odrzuca błędny sha256 manifestu lub nieposortowany manifest', (tmp) => {
    const { base } = setupBase(tmp);
    const src = path.join(tmp, 'src');
    makeSampleDist(src, 'new');
    const man = buildManifest(src, path.join(tmp, 'm.sha256'));
    const r1 = runScript(base, [src, SHA_NEW, SHA_OLD, man.file, '0'.repeat(64)]);
    assert.notEqual(r1.status, 0);

    const revLines = man.text.trimEnd().split('\n').reverse().join('\n') + '\n';
    const badMan = path.join(tmp, 'rev.sha256');
    fs.writeFileSync(badMan, revLines, { mode: 0o644 });
    const r2 = runScript(base, [src, SHA_NEW, SHA_OLD, badMan, sha256Buf(Buffer.from(revLines))]);
    assert.notEqual(r2.status, 0);
  });

  // 6. Symlink, hardlink i plik specjalny (FIFO) w źródle
  await test('odrzuca symlink, hardlink i FIFO w źródle', (tmp) => {
    const { base } = setupBase(tmp);

    // symlink
    const s1 = path.join(tmp, 's1');
    makeSampleDist(s1, 's1');
    fs.symlinkSync('/etc/passwd', path.join(s1, 'leak.txt'));
    const m1 = buildManifest(s1, path.join(tmp, 'm1.sha256'));
    assert.notEqual(runScript(base, [s1, SHA_NEW, SHA_OLD, m1.file, m1.sha256]).status, 0);

    // hardlink
    const s2 = path.join(tmp, 's2');
    makeSampleDist(s2, 's2');
    fs.linkSync(path.join(s2, 'robots.txt'), path.join(s2, 'robots-hard.txt'));
    const m2 = buildManifest(s2, path.join(tmp, 'm2.sha256'));
    assert.notEqual(runScript(base, [s2, SHA_NEW, SHA_OLD, m2.file, m2.sha256]).status, 0);

    // FIFO
    const s3 = path.join(tmp, 's3');
    makeSampleDist(s3, 's3');
    execFileSync('mkfifo', [path.join(s3, 'pipe.fifo')]);
    const m3 = buildManifest(s3, path.join(tmp, 'm3.sha256'));
    assert.notEqual(runScript(base, [s3, SHA_NEW, SHA_OLD, m3.file, m3.sha256]).status, 0);
  });

  // 7. Źródło wskazujące na current oraz niebezpieczne uprawnienia 0777
  await test('odrzuca źródło w current i uprawnienia zapisu dla innych (0777)', (tmp) => {
    const { base } = setupBase(tmp);
    const man = buildManifest(path.join(base, 'current'), path.join(tmp, 'm.sha256'));
    assert.notEqual(runScript(base, [path.join(base, 'current'), SHA_NEW, SHA_OLD, man.file, man.sha256]).status, 0);

    const src = path.join(tmp, 'src');
    makeSampleDist(src, 'new');
    const man2 = buildManifest(src, path.join(tmp, 'm2.sha256'));
    fs.chmodSync(src, 0o777);
    assert.notEqual(runScript(base, [src, SHA_NEW, SHA_OLD, man2.file, man2.sha256]).status, 0);
  });

  // 8. Przerwane kopiowanie w stagingu (current nienaruszone, brak śmieci w .staging)
  await test('przerwane kopiowanie w stagingu zostawia current na starym SHA i sprząta staging', (tmp) => {
    const { base, oldDir } = setupBase(tmp);
    const src = path.join(tmp, 'src');
    makeSampleDist(src, 'new');
    const man = buildManifest(src, path.join(tmp, 'm.sha256'));

    const fakeBin = path.join(tmp, 'bin');
    fs.mkdirSync(fakeBin, { mode: 0o755 });
    const cpWrapper = path.join(fakeBin, 'cp');
    // Pierwsze cp (weryfikacja src vs manifest nie używa cp; cp jest użyte przy kopiowaniu do stagingu)
    fs.writeFileSync(cpWrapper, '#!/bin/sh\necho "simulated copy crash" >&2\nexit 1\n', { mode: 0o755 });

    const r = runScript(base, [src, SHA_NEW, SHA_OLD, man.file, man.sha256], {
      PATH: `${fakeBin}:${process.env.PATH}`,
    });
    assert.notEqual(r.status, 0);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(oldDir));
    assert.equal(fs.existsSync(path.join(base, 'releases', SHA_NEW)), false);
    assert.equal(fs.existsSync(path.join(base, 'manifests', `${SHA_NEW}.sha256`)), false);
    assert.equal(fs.readdirSync(path.join(base, '.staging')).length, 0);
  });

  // 9. Przerwanie po zapisie manifestu przed finalizacją (mv -T stage->dest): niezgodne retry blokowane, zgodne kończy
  await test('przerwanie po zapisie manifestu przed finalizacją: niezgodne retry odrzucone, zgodne dokańcza', async (tmp) => {
    const { base, oldDir } = setupBase(tmp);
    const src = path.join(tmp, 'src');
    makeSampleDist(src, 'new');
    const man = buildManifest(src, path.join(tmp, 'm.sha256'));

    const fakeBin = path.join(tmp, 'bin');
    fs.mkdirSync(fakeBin, { mode: 0o755 });
    const mvWrapper = path.join(fakeBin, 'mv');
    // Przepuść mv -Tf (manifest), przerwij mv -T (staging -> releases/SHA_NEW)
    fs.writeFileSync(mvWrapper, `#!/bin/sh
case "$*" in
  *"releases/${SHA_NEW}"*) echo "crash before finalization" >&2; exit 1 ;;
  *) exec /bin/mv "$@" ;;
esac
`, { mode: 0o755 });

    const rFail = runScript(base, [src, SHA_NEW, SHA_OLD, man.file, man.sha256], {
      PATH: `${fakeBin}:${process.env.PATH}`,
    });
    assert.notEqual(rFail.status, 0);
    assert.equal(fs.existsSync(path.join(base, 'manifests', `${SHA_NEW}.sha256`)), true);
    assert.equal(fs.existsSync(path.join(base, 'releases', SHA_NEW)), false);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(oldDir));

    // Niezgodne retry dla tego samego SHA z inną zawartością -> ODRZUCONE
    const srcBad = path.join(tmp, 'src-bad');
    makeSampleDist(srcBad, 'tampered');
    const manBad = buildManifest(srcBad, path.join(tmp, 'mbad.sha256'));
    const rBadRetry = runScript(base, [srcBad, SHA_NEW, SHA_OLD, manBad.file, manBad.sha256]);
    assert.notEqual(rBadRetry.status, 0);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(oldDir));

    // Zgodne retry -> DOKAŃCZA
    const rGoodRetry = runScript(base, [src, SHA_NEW, SHA_OLD, man.file, man.sha256]);
    assert.equal(rGoodRetry.status, 0, rGoodRetry.stderr);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(path.join(base, 'releases', SHA_NEW)));
  });

  // 10. Przerwanie po finalizacji przed przełączeniem symlinka: bez manifestu blokada, z manifestem retry kończy
  await test('przerwanie po finalizacji przed symlinkiem: bez manifestu blokada, z manifestem retry kończy', (tmp) => {
    const { base, oldDir } = setupBase(tmp);
    const src = path.join(tmp, 'src');
    makeSampleDist(src, 'new');
    const man = buildManifest(src, path.join(tmp, 'm.sha256'));

    const fakeBin = path.join(tmp, 'bin');
    fs.mkdirSync(fakeBin, { mode: 0o755 });
    const lnWrapper = path.join(fakeBin, 'ln');
    fs.writeFileSync(lnWrapper, '#!/bin/sh\necho "crash before symlink switch" >&2\nexit 1\n', { mode: 0o755 });

    const rFail = runScript(base, [src, SHA_NEW, SHA_OLD, man.file, man.sha256], {
      PATH: `${fakeBin}:${process.env.PATH}`,
    });
    assert.notEqual(rFail.status, 0);
    assert.equal(fs.existsSync(path.join(base, 'releases', SHA_NEW)), true);
    assert.equal(fs.existsSync(path.join(base, 'manifests', `${SHA_NEW}.sha256`)), true);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(oldDir));

    // Symulacja katalogu bez manifestu (usunięcie manifestu) -> blokada automatycznej publikacji
    const manBak = fs.readFileSync(path.join(base, 'manifests', `${SHA_NEW}.sha256`));
    fs.unlinkSync(path.join(base, 'manifests', `${SHA_NEW}.sha256`));
    const rNoMan = runScript(base, [src, SHA_NEW, SHA_OLD, man.file, man.sha256]);
    assert.notEqual(rNoMan.status, 0);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(oldDir));

    // Przywrócenie zgodnego manifestu -> retry przełącza current
    fs.writeFileSync(path.join(base, 'manifests', `${SHA_NEW}.sha256`), manBak, { mode: 0o644 });
    const rOk = runScript(base, [src, SHA_NEW, SHA_OLD, man.file, man.sha256]);
    assert.equal(rOk.status, 0, rOk.stderr);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(path.join(base, 'releases', SHA_NEW)));
  });

  // 11. Istniejący release o tym samym SHA z inną zawartością
  await test('odrzuca istniejący release o tym samym SHA z inną zawartością', (tmp) => {
    const { base, oldDir } = setupBase(tmp);
    const src1 = path.join(tmp, 'src1');
    makeSampleDist(src1, 'v1');
    const man1 = buildManifest(src1, path.join(tmp, 'm1.sha256'));
    assert.equal(runScript(base, [src1, SHA_NEW, SHA_OLD, man1.file, man1.sha256]).status, 0);

    const src2 = path.join(tmp, 'src2');
    makeSampleDist(src2, 'v2-changed');
    const man2 = buildManifest(src2, path.join(tmp, 'm2.sha256'));
    const r = runScript(base, [src2, SHA_NEW, SHA_NEW, man2.file, man2.sha256]);
    assert.notEqual(r.status, 0);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(path.join(base, 'releases', SHA_NEW)));
    assert.equal(fs.existsSync(oldDir), true);
  });

  // 12. Konkurencja dwóch równoległych wydań dla tego samego oczekiwanego bieżącego SHA
  await test('konkurencja dwóch równoległych wydań pod flock: dokładnie jedno wygrywa', async (tmp) => {
    const { base } = setupBase(tmp);
    const srcA = path.join(tmp, 'srcA');
    const srcB = path.join(tmp, 'srcB');
    makeSampleDist(srcA, 'A');
    makeSampleDist(srcB, 'B');
    const manA = buildManifest(srcA, path.join(tmp, 'mA.sha256'));
    const manB = buildManifest(srcB, path.join(tmp, 'mB.sha256'));

    const fakeBin = path.join(tmp, 'bin');
    fs.mkdirSync(fakeBin, { mode: 0o755 });
    const cpSlow = path.join(fakeBin, 'cp');
    fs.writeFileSync(cpSlow, '#!/bin/sh\nsleep 0.35\nexec /bin/cp "$@"\n', { mode: 0o755 });

    const envSlow = { PATH: `${fakeBin}:${process.env.PATH}` };
    const [resA, resB] = await Promise.all([
      runScriptAsync(base, [srcA, SHA_NEW, SHA_OLD, manA.file, manA.sha256], envSlow),
      runScriptAsync(base, [srcB, SHA_ALT, SHA_OLD, manB.file, manB.sha256], envSlow),
    ]);

    const wins = [resA, resB].filter((r) => r.status === 0);
    const losses = [resA, resB].filter((r) => r.status !== 0);
    assert.equal(wins.length, 1, `expected 1 winner, got A=${resA.status} B=${resB.status}`);
    assert.equal(losses.length, 1);
    assert.match(losses[0].stderr, /Bieżący release niezgodny/);
  });

  // 13 & 14. Inicjalizacja manifestu zastanego release, poprawne przełączenie, nienaruszony poprzedni release i rollback
  await test('--init-manifest dla starego release, poprawne wydanie, nienaruszony stary release i --rollback', (tmp) => {
    const { base, oldDir, oldMan } = setupBase(tmp, false); // stary release bez manifestu

    // Rollback bez zainicjalizowanego manifestu jest zabroniony
    const src = path.join(tmp, 'src');
    makeSampleDist(src, 'new');
    const man = buildManifest(src, path.join(tmp, 'm.sha256'));
    assert.equal(runScript(base, [src, SHA_NEW, SHA_OLD, man.file, man.sha256]).status, 0);
    assert.notEqual(runScript(base, ['--rollback', SHA_OLD, SHA_NEW]).status, 0);

    // Niezgodny --init-manifest odrzucony
    assert.notEqual(runScript(base, ['--init-manifest', SHA_OLD, man.file, man.sha256]).status, 0);

    // Poprawny --init-manifest i rollback
    const initRes = runScript(base, ['--init-manifest', SHA_OLD, oldMan.file, oldMan.sha256]);
    assert.equal(initRes.status, 0, initRes.stderr);

    // Poprzedni release niezmieniony
    const oldCheck = buildManifest(oldDir, path.join(tmp, 'oldcheck.sha256'));
    assert.equal(oldCheck.sha256, oldMan.sha256);

    const rbRes = runScript(base, ['--rollback', SHA_OLD, SHA_NEW, oldMan.file, oldMan.sha256]);
    assert.equal(rbRes.status, 0, rbRes.stderr);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(oldDir));
  });

  // 15. Odrzucenie rollbacku po cudzym przełączeniu (oczekiwany bieżący SHA niezgodny)
  await test('odrzuca --rollback gdy current został przełączony przez kogoś innego', (tmp) => {
    const { base, oldMan } = setupBase(tmp, true);
    const src1 = path.join(tmp, 'src1');
    const src2 = path.join(tmp, 'src2');
    makeSampleDist(src1, '1');
    makeSampleDist(src2, '2');
    const man1 = buildManifest(src1, path.join(tmp, 'm1.sha256'));
    const man2 = buildManifest(src2, path.join(tmp, 'm2.sha256'));

    assert.equal(runScript(base, [src1, SHA_NEW, SHA_OLD, man1.file, man1.sha256]).status, 0);
    // Ktoś inny opublikował SHA_OTHER
    assert.equal(runScript(base, [src2, SHA_OTHER, SHA_NEW, man2.file, man2.sha256]).status, 0);

    // Próba rollbacku z oczekiwanym SHA_NEW (nieaktualnym!) musi się nie powieść
    const rb = runScript(base, ['--rollback', SHA_OLD, SHA_NEW, oldMan.file, oldMan.sha256]);
    assert.notEqual(rb.status, 0);
    assert.equal(fs.realpathSync(path.join(base, 'current')), fs.realpathSync(path.join(base, 'releases', SHA_OTHER)));
  });

  const failed = results.filter((r) => !r.ok);
  console.log(`\nTesty deploy/wydanie.sh: ${results.length - failed.length} z ${results.length} przeszło, ${failed.length} błędów.`);
  process.exit(failed.length ? 1 : 0);
})();
