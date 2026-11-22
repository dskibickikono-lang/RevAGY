'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { tmp, zapisz, uruchom, TOOLS } = require('./pomoc.cjs');
const { sprawdzPodstrone } = require('../lib/podstrona.cjs');

const PLIK = 'integracja-systemow.html';
const ADRES = `https://revagy.pl/${PLIK}`;
const PYTANIA = [
  { pytanie: 'Czy musimy wymieniać któryś system?', odpowiedz: 'Nie. Łączymy te, na których pracujecie.' },
  { pytanie: 'Ile to kosztuje?', odpowiedz: 'Konsultacja jest bezpłatna. Audyt kosztuje 1 990 zł.' },
];

function graf({ url = ADRES, pytania = PYTANIA, wideo = false, bez = [] } = {}) {
  const g = [
    { '@type': 'WebPage', '@id': `${url}#strona`, url, name: 'Integracja' },
    { '@type': 'BreadcrumbList', itemListElement: [] },
    { '@type': 'Service', name: 'Integracja', provider: { '@id': 'https://revagy.pl/#organizacja' } },
  ];
  if (pytania) g.push({ '@type': 'FAQPage', mainEntity: pytania.map((q) => ({ '@type': 'Question', name: q.pytanie, acceptedAnswer: { '@type': 'Answer', text: q.odpowiedz } })) });
  if (wideo) g.push({ '@type': 'VideoObject', name: 'Film' });
  return { '@context': 'https://schema.org', '@graph': g.filter((n) => !bez.includes(n['@type'])) };
}

const qa = (pytania) => pytania.map((q, i) => `
      <div class="${i === 0 ? 'qa is-open' : 'qa'}">
        <h3><button type="button" aria-expanded="${i === 0}" aria-controls="qa-${i + 1}" id="qb-${i + 1}">${q.pytanie}<span class="plus" aria-hidden="true"></span></button></h3>
        <div class="qa-body" id="qa-${i + 1}" role="region" aria-labelledby="qb-${i + 1}"><div><p>${q.odpowiedz}</p></div></div>
      </div>`).join('');

const KADR = '<div class="film-outer"><div class="film" data-scale><img src="assets/video/integracja-systemow-kadr.jpg" width="1600" height="900" alt="Poglądowy ekran" loading="lazy" decoding="async"></div></div>';
const WIDEO = '<div class="film-outer"><div class="film" data-scale><video data-autoplay data-main-video muted loop playsinline preload="none" poster="assets/video/integracja-systemow.jpg"><source src="assets/video/integracja-systemow.webm" type="video/webm"></video></div></div>';

function strona({ ld = graf(), ldRaw = null, ldAttrs = 'type="application/ld+json"', drugiBlok = false, canonical = ADRES, ogUrl = ADRES,
  widoczne = PYTANIA, film = KADR, styl = 'style="--d:80ms"' } = {}) {
  const blok = `<script ${ldAttrs}>${ldRaw ?? JSON.stringify(ld)}</script>`;
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>Integracja systemów | REVAGY</title>
${canonical === null ? '' : `<link rel="canonical" href="${canonical}">`}
${ogUrl === null ? '' : `<meta property="og:url" content="${ogUrl}">`}
${blok}${drugiBlok ? blok : ''}
</head>
<body>
<main id="start">
  <section class="section wrap" id="problemy"><div class="trio"><article class="trust reveal" ${styl}><p>Tekst</p></article></div></section>
  <section class="section" id="film">${film}</section>
  <section class="section wrap faq-section" id="pytania"><div class="faq" data-faq>${qa(widoczne)}
    </div></section>
</main>
</body>
</html>`;
}

const sprawdz = (html) => sprawdzPodstrone(PLIK, html);

test('podstrona: poprawna strona w stanie „kadr” i „film”', () => {
  assert.deepEqual(sprawdz(strona()), []);
  assert.deepEqual(sprawdz(strona({ ld: graf({ wideo: true }), film: WIDEO })), []);
  // białe znaki i encje w widocznym tekście nie mają znaczenia
  const [glowa, cialo] = strona().split('<main');
  const html = `${glowa}<main${cialo.replace('Nie. Łączymy te,', 'Nie.\n        Łączymy&nbsp;te,')}`;
  assert.notEqual(html, strona());
  assert.deepEqual(sprawdz(html), []);
});

test('podstrona: dokładnie jeden blok danych strukturalnych z samym atrybutem type', () => {
  assert.match(sprawdz(strona({ drugiBlok: true }))[0], /dokładnie jednego bloku.*jest 2/);
  const brak = sprawdz(strona().replace(/<script[\s\S]*?<\/script>/, ''));
  assert.ok(brak.some((b) => /dokładnie jednego bloku.*jest 0/.test(b)), brak.join('\n'));
  assert.ok(sprawdz(strona({ ldAttrs: 'type="application/ld+json" defer' })).some((b) => /niedozwolone atrybuty: defer/.test(b)));
});

test('podstrona: JSON, @context, WebPage i BreadcrumbList', () => {
  assert.ok(sprawdz(strona({ ldRaw: '{"@context": "https://schema.org", "@graph": [' })).some((b) => /nie są poprawnym JSON/.test(b)));
  assert.ok(sprawdz(strona({ ld: { ...graf(), '@context': 'http://schema.org' } })).some((b) => /bez @context/.test(b)));
  assert.ok(sprawdz(strona({ ld: graf({ bez: ['WebPage'] }) })).some((b) => /bez węzła @type=WebPage/.test(b)));
  assert.ok(sprawdz(strona({ ld: graf({ bez: ['BreadcrumbList'] }) })).some((b) => /bez węzła @type=BreadcrumbList/.test(b)));
  assert.ok(sprawdz(strona({ ldRaw: JSON.stringify(graf()).replace('"Integracja"', '"</script>"') })).length > 0);
});

test('podstrona: WebPage.url, adres kanoniczny i og:url równe adresowi z nazwy pliku', () => {
  assert.ok(sprawdz(strona({ canonical: 'https://revagy.pl/inna.html' })).some((b) => /adres kanoniczny: oczekiwano https:\/\/revagy\.pl\/integracja-systemow\.html/.test(b)));
  assert.ok(sprawdz(strona({ ogUrl: null })).some((b) => /og:url: .*jest brak/.test(b)));
  assert.ok(sprawdz(strona({ ld: graf({ url: 'https://revagy.pl/' }) })).some((b) => /WebPage\.url/.test(b)));
});

test('podstrona: FAQPage równe widocznym pytaniom', () => {
  const inne = [PYTANIA[0], { ...PYTANIA[1], odpowiedz: 'Audyt kosztuje 2 000 zł.' }];
  assert.ok(sprawdz(strona({ widoczne: inne })).some((b) => /FAQPage odpowiedź 2/.test(b)));
  assert.ok(sprawdz(strona({ widoczne: [PYTANIA[0]] })).some((b) => /FAQPage ma 2 pytań, a strona pokazuje 1/.test(b)));
  const zmienionePytanie = [{ ...PYTANIA[0], pytanie: 'Czy trzeba wymieniać system?' }, PYTANIA[1]];
  assert.ok(sprawdz(strona({ widoczne: zmienionePytanie })).some((b) => /FAQPage pytanie 1/.test(b)));
  assert.ok(sprawdz(strona({ ld: graf({ pytania: null }) })).some((b) => /nie mają FAQPage/.test(b)));
  // strona bez pytań i bez FAQPage jest poprawna
  assert.deepEqual(sprawdz(strona({ ld: graf({ pytania: null }), widoczne: [] })), []);
});

test('podstrona: VideoObject wtedy i tylko wtedy, gdy jest <video>', () => {
  assert.ok(sprawdz(strona({ ld: graf({ wideo: true }) })).some((b) => /VideoObject, a strona nie ma <video>/.test(b)));
  assert.ok(sprawdz(strona({ film: WIDEO })).some((b) => /ma <video>, a dane strukturalne nie mają VideoObject/.test(b)));
});

test('podstrona: atrybut style tylko jako --d:<liczba>ms', () => {
  assert.deepEqual(sprawdz(strona({ styl: 'style="--d:160ms"' })), []);
  for (const zly of ['style="margin-left:auto"', 'style="--d:80ms; color:red"', 'style="--d:fast"', 'style=""']) {
    const b = sprawdz(strona({ styl: zly }));
    assert.equal(b.length, 1, `${zly}: ${b.join('\n')}`);
    assert.match(b[0], /dozwolone tylko style="--d:<liczba>ms"/);
  }
});

test('validate-dist: reguły podstron są wołane dla stron z tools/podstrony.json', () => {
  // Spreparowany katalog: kontrakt i tak zgłosi brakujące pliki; sprawdzamy, że pojawiają się błędy reguł podstron.
  const dir = tmp();
  zapisz(dir, PLIK, strona({ styl: 'style="color:red"', canonical: 'https://revagy.pl/x.html' }));
  const r = uruchom([path.join(TOOLS, 'validate-dist.cjs'), dir]);
  assert.equal(r.kod, 1);
  const lista = JSON.parse(fs.readFileSync(path.join(TOOLS, 'podstrony.json'), 'utf8')).strony.map((s) => s.plik);
  if (!lista.includes(PLIK)) return; // rejestr podstron bez tej strony: reguła nie dotyczy
  assert.match(r.err, /integracja-systemow\.html: linia \d+: <article style="color:red">/);
  assert.match(r.err, /integracja-systemow\.html: adres kanoniczny: oczekiwano/);
  assert.doesNotMatch(r.err, /integracja-systemow\.html: nieoczekiwany blok JSON-LD/);
});

// Odnośnik pod odpowiedzią (Pytania.astro, pole `odnosnik`): osobny akapit z samym a.link-btn.
const zOdnosnikiem = (html, i, href = 'integracja-systemow.html', tekst = 'Integracja systemów') => {
  let n = -1;
  return html.replace(/<\/p><\/div><\/div>/g, (m) => (++n === i ? `</p><p><a class="link-btn" href="${href}">${tekst}</a></p></div></div>` : m));
};

test('podstrona: akapit z samym odnośnikiem pod odpowiedzią nie jest częścią odpowiedzi FAQPage', () => {
  const html = zOdnosnikiem(strona(), 1);
  assert.match(html, /<p><a class="link-btn" href="integracja-systemow\.html">Integracja systemów<\/a><\/p>/);
  assert.deepEqual(sprawdz(html), []);
  // Różnica w samym akapicie odpowiedzi nadal jest błędem, także gdy pod nią stoi odnośnik.
  const inne = zOdnosnikiem(strona({ widoczne: [PYTANIA[0], { ...PYTANIA[1], odpowiedz: 'Audyt kosztuje 2 000 zł.' }] }), 1);
  assert.ok(sprawdz(inne).some((b) => /FAQPage odpowiedź 2/.test(b)));
  // Odnośnik w środku zdania (nie osobny akapit) jest częścią tekstu odpowiedzi.
  const wTekscie = strona().replace('Audyt kosztuje 1 990 zł.</p>', 'Audyt kosztuje 1 990 zł. <a class="link-btn" href="x.html">Więcej</a></p>');
  assert.ok(sprawdz(wTekscie).some((b) => /FAQPage odpowiedź 2/.test(b)));
  // Akapit z odnośnikiem i dodatkowym tekstem też jest częścią odpowiedzi.
  const zTekstem = strona().replace('Audyt kosztuje 1 990 zł.</p>', 'Audyt kosztuje 1 990 zł.</p><p>Zobacz <a class="link-btn" href="x.html">tu</a></p>');
  assert.ok(sprawdz(zTekstem).some((b) => /FAQPage odpowiedź 2/.test(b)));
});

test('validate-dist: odnośnik pod odpowiedzią do nieistniejącego pliku na stronie spoza kontraktu jest błędem', () => {
  const lista = JSON.parse(fs.readFileSync(path.join(TOOLS, 'podstrony.json'), 'utf8')).strony.map((s) => s.plik);
  const kontrakt = JSON.parse(fs.readFileSync(path.join(TOOLS, 'dom-contract.json'), 'utf8'));
  const plik = lista.find((p) => !kontrakt.pages[p]);
  if (!plik) return; // wszystkie podstrony są już w kontrakcie: tę ścieżkę sprawdza pętla po contract.pages
  const dir = tmp();
  const adres = `https://revagy.pl/${plik}`;
  let html = strona({ ld: graf({ url: adres }), canonical: adres, ogUrl: adres });
  html = zOdnosnikiem(html, 0, 'nie-ma-takiej-strony.html', 'Brak');
  zapisz(dir, plik, html);
  const r = uruchom([path.join(TOOLS, 'validate-dist.cjs'), dir]);
  assert.equal(r.kod, 1);
  assert.match(r.err, new RegExp(`${plik.replace('.', '\\.')}: <a href="nie-ma-takiej-strony\\.html"> wskazuje na nieistniejący plik`));
});
