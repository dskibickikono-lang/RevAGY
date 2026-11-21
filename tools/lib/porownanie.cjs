'use strict';
/* Porównanie dwóch wersji index.html na poziomie znaczników, atrybutów i tekstów
   oraz dopasowanie różnic do listy dozwolonych zmian etapu (tools/etapy/zmiana-strony-glownej.json). */

const { tokenize, collapse, VOID } = require('./html.cjs');

/** Sekwencja porównywana: znaczniki otwierające (z atrybutami), zamykające i niepuste teksty.
    Komentarze, DOCTYPE i teksty złożone z samych białych znaków są pomijane. */
function sekwencja(html) {
  const out = [];
  for (const t of tokenize(html)) {
    if (t.type === 'start') {
      const attrs = t.attrs.map(([k, v]) => [k, v]);
      const sorted = [...attrs].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
      out.push({ k: 'start', name: t.name, attrs, line: t.line, self: t.selfClosing || VOID.has(t.name),
        key: `S|${t.name}|${JSON.stringify(sorted)}`, skel: `S|${t.name}` });
    } else if (t.type === 'end') {
      out.push({ k: 'end', name: t.name, line: t.line, key: `E|${t.name}`, skel: `E|${t.name}` });
    } else if (t.type === 'text') {
      const text = collapse(t.text);
      if (text) out.push({ k: 'text', text, line: t.line, key: `T|${text}`, skel: 'T' });
    }
  }
  return out;
}

/** Najdłuższy wspólny podciąg dwóch tablic kluczy; zwraca pary indeksów [i, j]. */
function lcs(a, b) {
  const n = a.length;
  const m = b.length;
  let pre = 0;
  while (pre < n && pre < m && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (suf < n - pre && suf < m - pre && a[n - 1 - suf] === b[m - 1 - suf]) suf++;
  const pairs = [];
  for (let i = 0; i < pre; i++) pairs.push([i, i]);
  const A = a.slice(pre, n - suf);
  const B = b.slice(pre, m - suf);
  const N = A.length;
  const M = B.length;
  if (N && M) {
    if ((N + 1) * (M + 1) > 60e6) throw new Error(`Zbyt duża różnica do porównania (${N}×${M} tokenów)`);
    const W = M + 1;
    const dp = (N < 65535 && M < 65535) ? new Uint16Array((N + 1) * W) : new Uint32Array((N + 1) * W);
    for (let i = N - 1; i >= 0; i--) {
      for (let j = M - 1; j >= 0; j--) {
        dp[i * W + j] = A[i] === B[j] ? dp[(i + 1) * W + j + 1] + 1 : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < N && j < M) {
      if (A[i] === B[j]) { pairs.push([pre + i, pre + j]); i++; j++; }
      else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) i++;
      else j++;
    }
  }
  for (let k = 0; k < suf; k++) pairs.push([n - suf + k, m - suf + k]);
  return pairs;
}

const attrMap = (tok) => { const m = new Map(); for (const [k, v] of tok.attrs) if (!m.has(k)) m.set(k, v); return m; };

/** Grupuje niedopasowane tokeny w całe elementy (znacznik otwierający z poddrzewem i zamknięciem). */
function grupuj(seq, indices, rodzaj) {
  const set = new Set(indices);
  const used = new Set();
  const out = [];
  for (const i of indices) {
    if (used.has(i)) continue;
    const t = seq[i];
    if (t.k === 'start') {
      let e = i;
      if (!t.self) {
        let depth = 0;
        e = -1;
        for (let x = i; x < seq.length; x++) {
          const u = seq[x];
          if (u.k === 'start' && u.name === t.name && !u.self) depth++;
          else if (u.k === 'end' && u.name === t.name) { depth--; if (depth === 0) { e = x; break; } }
        }
      }
      let whole = e !== -1;
      for (let x = i; whole && x <= e; x++) if (!set.has(x) || used.has(x)) whole = false;
      if (whole) {
        const texts = [];
        for (let x = i; x <= e; x++) { used.add(x); if (seq[x].k === 'text') texts.push(seq[x].text); }
        const am = attrMap(t);
        out.push({ rodzaj, znacznik: t.name, klasa: am.has('class') ? am.get('class') : null, href: am.has('href') ? am.get('href') : null,
          tekst: collapse(texts.join(' ')), linia: t.line, atrybuty: Object.fromEntries(am) });
        continue;
      }
      used.add(i);
      const am = attrMap(t);
      out.push({ rodzaj, znacznik: t.name, klasa: am.has('class') ? am.get('class') : null, href: am.has('href') ? am.get('href') : null,
        tekst: '', linia: t.line, czesciowy: 'sam znacznik otwierający', atrybuty: Object.fromEntries(am) });
    } else if (t.k === 'end') {
      used.add(i);
      out.push({ rodzaj, znacznik: `/${t.name}`, klasa: null, href: null, tekst: '', linia: t.line, czesciowy: 'sam znacznik zamykający' });
    } else {
      used.add(i);
      out.push({ rodzaj, znacznik: '#text', klasa: null, href: null, tekst: t.text, linia: t.line });
    }
  }
  return out;
}

function zrownowazony(seq, s, e) {
  let d = 0;
  for (let k = s; k < e; k++) {
    const t = seq[k];
    if (t.k === 'start' && !t.self) d++;
    else if (t.k === 'end') { d--; if (d < 0) return false; }
  }
  return d === 0;
}

function przesun(seq, s, e, dopasowane) {
  if (zrownowazony(seq, s, e)) return [s, e];
  for (let k = 1; s - k >= 0 && dopasowane.has(s - k) && seq[s - k].key === seq[e - k].key; k++) {
    if (zrownowazony(seq, s - k, e - k)) return [s - k, e - k];
  }
  for (let k = 1; e + k - 1 < seq.length && dopasowane.has(e + k - 1) && seq[s + k - 1].key === seq[e + k - 1].key; k++) {
    if (zrownowazony(seq, s + k, e + k)) return [s + k, e + k];
  }
  return [s, e];
}

/** Zwraca listę różnic między bazą a migawką. */
function porownaj(bazaHtml, migawkaHtml) {
  const a = sekwencja(bazaHtml);
  const b = sekwencja(migawkaHtml);
  const exact = lcs(a.map((t) => t.key), b.map((t) => t.key));
  const zmiany = [];
  const gaps = [];
  let pa = 0;
  let pb = 0;
  for (const [i, j] of [...exact, [a.length, b.length]]) {
    if (i > pa || j > pb) gaps.push([pa, i, pb, j]);
    pa = i + 1;
    pb = j + 1;
  }
  // Czyste wstawienie albo usunięcie przesuwamy po równych tokenach tak, żeby obejmowało całe elementy
  // (np. nowy <li> przed takim samym <li> nie może wyglądać jak „…</a></li><li>”).
  const dopasowaneA = new Set(exact.map(([i]) => i));
  const dopasowaneB = new Set(exact.map(([, j]) => j));
  for (const g of gaps) {
    if (g[0] === g[1]) [g[2], g[3]] = przesun(b, g[2], g[3], dopasowaneB);
    else if (g[2] === g[3]) [g[0], g[1]] = przesun(a, g[0], g[1], dopasowaneA);
  }
  for (const [a0, a1, b0, b1] of gaps) {
    const ga = a.slice(a0, a1);
    const gb = b.slice(b0, b1);
    const skel = lcs(ga.map((t) => t.skel), gb.map((t) => t.skel));
    const matchedA = new Set();
    const matchedB = new Set();
    for (const [i, j] of skel) {
      matchedA.add(a0 + i);
      matchedB.add(b0 + j);
      const x = ga[i];
      const y = gb[j];
      if (x.k === 'text' && x.text !== y.text) {
        zmiany.push({ rodzaj: 'tekst', bylo: x.text, jest: y.text, linia: y.line, liniaBazy: x.line });
      } else if (x.k === 'start') {
        const ma = attrMap(x);
        const mb = attrMap(y);
        const names = [...new Set([...ma.keys(), ...mb.keys()])];
        for (const n of names) {
          const bylo = ma.has(n) ? ma.get(n) : null;
          const jest = mb.has(n) ? mb.get(n) : null;
          if (bylo !== jest) zmiany.push({ rodzaj: 'atrybut', znacznik: x.name, atrybut: n, bylo, jest, linia: y.line, liniaBazy: x.line });
        }
      }
    }
    const remA = [];
    for (let k = a0; k < a1; k++) if (!matchedA.has(k)) remA.push(k);
    const remB = [];
    for (let k = b0; k < b1; k++) if (!matchedB.has(k)) remB.push(k);
    for (const g of grupuj(a, remA, 'usuniete')) zmiany.push({ ...g, liniaBazy: g.linia, linia: null });
    zmiany.push(...grupuj(b, remB, 'dodane'));
  }
  return zmiany;
}

const SEKCJE = ['teksty', 'atrybuty', 'dodane', 'usuniete'];
const RODZAJ_SEKCJI = { tekst: 'teksty', atrybut: 'atrybuty', dodane: 'dodane', usuniete: 'usuniete' };

function sprawdzListe(lista) {
  const bledy = [];
  if (!lista || typeof lista !== 'object') return ['plik listy nie jest obiektem JSON'];
  const sg = lista['strona-glowna'];
  if (!sg || typeof sg !== 'object') return ['brak obiektu "strona-glowna"'];
  for (const s of SEKCJE) {
    if (sg[s] === undefined) continue;
    if (!Array.isArray(sg[s])) { bledy.push(`"strona-glowna.${s}" nie jest tablicą`); continue; }
    sg[s].forEach((w, i) => {
      if (!w || typeof w !== 'object') { bledy.push(`${s}[${i}] nie jest obiektem`); return; }
      if (w.razy !== undefined && !(Number.isInteger(w.razy) && w.razy >= 1)) bledy.push(`${s}[${i}].razy musi być liczbą całkowitą ≥ 1`);
      if (s === 'teksty' && (typeof w.bylo !== 'string' || typeof w.jest !== 'string')) bledy.push(`teksty[${i}] wymaga pól "bylo" i "jest" (tekst)`);
      if (s === 'atrybuty' && (typeof w.znacznik !== 'string' || typeof w.atrybut !== 'string' || !('bylo' in w) || !('jest' in w))) bledy.push(`atrybuty[${i}] wymaga pól "znacznik", "atrybut", "bylo", "jest"`);
      if ((s === 'dodane' || s === 'usuniete') && !['znacznik', 'klasa', 'href', 'tekst'].some((f) => w[f] !== undefined)) bledy.push(`${s}[${i}] wymaga co najmniej jednego z pól "znacznik", "klasa", "href", "tekst"`);
    });
  }
  return bledy;
}

function pasuje(rodzaj, w, z) {
  if (rodzaj === 'tekst') return w.bylo === z.bylo && w.jest === z.jest;
  if (rodzaj === 'atrybut') {
    return w.znacznik === z.znacznik && w.atrybut === z.atrybut && (w.bylo ?? null) === z.bylo && (w.jest ?? null) === z.jest;
  }
  return ['znacznik', 'klasa', 'href', 'tekst'].every((f) => w[f] === undefined || w[f] === z[f]);
}

/** Dopasowuje różnice do listy. Zwraca { zmiany (z polem wpis), problemy[] }. */
function dopasuj(zmiany, lista) {
  const problemy = [];
  const sg = (lista && lista['strona-glowna']) || {};
  const licz = {};
  for (const s of SEKCJE) licz[s] = (sg[s] || []).map(() => 0);
  for (const z of zmiany) {
    const s = RODZAJ_SEKCJI[z.rodzaj];
    const wpisy = sg[s] || [];
    let idx = -1;
    let wyczerpany = -1;
    for (let k = 0; k < wpisy.length; k++) {
      if (!pasuje(z.rodzaj, wpisy[k], z)) continue;
      if (licz[s][k] < (wpisy[k].razy ?? 1)) { idx = k; break; }
      if (wyczerpany === -1) wyczerpany = k;
    }
    if (idx !== -1) {
      licz[s][idx]++;
      z.wpis = `${s}[${idx}]`;
    } else {
      z.wpis = null;
      problemy.push(wyczerpany !== -1
        ? `${opisz(z)} — wpis ${s}[${wyczerpany}] został już zużyty ${wpisy[wyczerpany].razy ?? 1} raz(y)`
        : `${opisz(z)} — zmiana spoza listy`);
    }
  }
  for (const s of SEKCJE) {
    (sg[s] || []).forEach((w, k) => {
      const oczek = w.razy ?? 1;
      if (licz[s][k] !== oczek) problemy.push(`wpis ${s}[${k}] zużyty ${licz[s][k]} z ${oczek} raz(y): ${JSON.stringify(w)}`);
    });
  }
  return { zmiany, problemy };
}

const skr = (s, max = 200) => {
  if (s === null || s === undefined) return '∅';
  const t = String(s);
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

function opisz(z) {
  const gdzie = z.linia ? `linia ${z.linia} migawki` : `linia ${z.liniaBazy} bazy`;
  if (z.rodzaj === 'tekst') return `tekst (${gdzie}): „${skr(z.bylo)}” → „${skr(z.jest)}”`;
  if (z.rodzaj === 'atrybut') return `atrybut <${z.znacznik} ${z.atrybut}> (${gdzie}): „${skr(z.bylo)}” → „${skr(z.jest)}”`;
  const co = z.rodzaj === 'dodane' ? 'dodany' : 'usunięty';
  const szcz = [z.klasa ? `class="${z.klasa}"` : '', z.href ? `href="${z.href}"` : ''].filter(Boolean).join(' ');
  return `${co} <${z.znacznik}${szcz ? ' ' + szcz : ''}>${z.czesciowy ? ` (${z.czesciowy})` : ''} (${gdzie}): „${skr(z.tekst)}”`;
}

const md = (s) => skr(s, 300).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

function raportMarkdown({ zmiany, problemy, zrodlo, etap }) {
  const out = ['## Strona główna: zmiany względem bazy', ''];
  out.push(`Baza: ${zrodlo}. ${etap ? `Lista: etap ${etap}.` : ''}`.trim(), '');
  if (!zmiany.length) out.push('Brak zmian: migawka jest identyczna z bazą.', '');
  else {
    out.push('| # | Rodzaj | Gdzie | Było | Jest | Wpis listy |', '|---|---|---|---|---|---|');
    zmiany.forEach((z, i) => {
      const gdzie = z.linia ? `migawka:${z.linia}` : `baza:${z.liniaBazy}`;
      let rodzaj = z.rodzaj;
      let bylo = '';
      let jest = '';
      if (z.rodzaj === 'tekst') { bylo = z.bylo; jest = z.jest; }
      else if (z.rodzaj === 'atrybut') { rodzaj = `atrybut \`${z.znacznik} ${z.atrybut}\``; bylo = z.bylo ?? '∅'; jest = z.jest ?? '∅'; }
      else {
        const el = `<${z.znacznik}${z.klasa ? ` class="${z.klasa}"` : ''}${z.href ? ` href="${z.href}"` : ''}> ${z.tekst}`;
        if (z.rodzaj === 'dodane') jest = el; else bylo = el;
      }
      out.push(`| ${i + 1} | ${md(rodzaj)} | ${gdzie} | ${md(bylo)} | ${md(jest)} | ${z.wpis ? z.wpis : '**SPOZA LISTY**'} |`);
    });
    out.push('');
  }
  if (problemy.length) {
    out.push(`**Problemy: ${problemy.length}**`, '');
    for (const p of problemy.slice(0, 20)) out.push(`- ${md(p)}`);
    if (problemy.length > 20) out.push(`- … i ${problemy.length - 20} kolejnych`);
    out.push('');
  }
  return out.join('\n');
}

module.exports = { sekwencja, lcs, porownaj, dopasuj, sprawdzListe, opisz, raportMarkdown };
