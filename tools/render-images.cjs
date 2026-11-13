#!/usr/bin/env node
/* Generuje grafikę do udostępniania (og.jpg) i ikony strony z własnych źródeł.
   Użycie:  node tools/render-images.cjs      Wymaga: playwright (Chromium) i ffmpeg. */
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const IMG = path.join(ROOT, 'site', 'assets', 'img');
const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'revagy-img-'));
  const browser = await chromium.launch();

  // grafika do udostępniania 1200×630
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await og.goto(pathToFileURL(path.join(__dirname, 'scenes', 'og-image.html')).href);
  await og.evaluate(() => window.ready);
  await og.screenshot({ path: path.join(tmp, 'og.png') });
  ffmpeg(['-i', path.join(tmp, 'og.png'), '-q:v', '3', path.join(IMG, 'og.jpg')]);
  await og.close();

  // ikony z favicon.svg
  const svg = fs.readFileSync(path.join(IMG, 'favicon.svg'), 'utf8');
  for (const [name, size, pad] of [['apple-touch-icon.png', 180, 0], ['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['favicon-32.png', 32, 0]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px;padding:${pad}px;box-sizing:border-box">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body>`);
    const out = name === 'favicon-32.png' ? path.join(tmp, name) : path.join(IMG, name);
    await page.screenshot({ path: out, omitBackground: true });
    await page.close();
  }
  ffmpeg(['-i', path.join(tmp, 'favicon-32.png'), path.join(ROOT, 'site', 'favicon.ico')]);

  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  for (const f of ['og.jpg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) console.log(`${(fs.statSync(path.join(IMG, f)).size / 1024).toFixed(0).padStart(5)} kB  assets/img/${f}`);
  console.log(`${(fs.statSync(path.join(ROOT, 'site', 'favicon.ico')).size / 1024).toFixed(0).padStart(5)} kB  favicon.ico`);
})().catch((e) => { console.error(e); process.exit(1); });
