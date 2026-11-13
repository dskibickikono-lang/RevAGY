/* REVAGY — interakcje i animacje prototypu. Bez zależności. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pl = new Intl.NumberFormat('pl-PL');

  /* ---------- nagłówek ---------- */
  const header = $('.site-header');
  const onScrollHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  const navItems = $$('.nav-item.has-panel');
  const closePanels = (except) => navItems.forEach((item) => {
    if (item === except) return;
    item.classList.remove('is-open');
    $('.nav-link', item).setAttribute('aria-expanded', 'false');
  });
  navItems.forEach((item) => {
    const btn = $('.nav-link', item);
    let timer;
    const open = () => { clearTimeout(timer); closePanels(item); item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };
    const close = () => { item.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
    let hovering = false;
    item.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; open(); } });
    item.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hovering = false; timer = setTimeout(close, 140); } });
    // mysz otwiera najechaniem, więc klik nie może zamykać; dotyk i klawiatura przełączają
    btn.addEventListener('click', () => (hovering || !item.classList.contains('is-open') ? open() : close()));
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) close(); });
    $$('a', item).forEach((a) => a.addEventListener('click', close));
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav-item')) closePanels(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePanels(); setMenu(false); } });

  const menuBtn = $('.menu-toggle');
  const menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menu || menu.hidden === !open) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    header.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.matchMedia('(min-width: 1021px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- pojawianie się sekcji ---------- */
  const reveals = $$('.reveal');
  if (hasIO && !reduced) {
    document.documentElement.classList.add('js-motion');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- liczniki ---------- */
  const counters = $$('[data-count]');
  if (hasIO && !reduced) {
    const run = (el) => {
      const target = Number(el.dataset.count);
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const p = clamp((now - start) / dur, 0, 1);
        el.textContent = pl.format(Math.round(target * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- filmy: odtwarzaj tylko w kadrze ---------- */
  const videos = $$('video[data-autoplay]');
  const userPaused = new WeakSet();
  const tryPlay = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  if (hasIO && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting && !userPaused.has(v)) tryPlay(v);
        else v.pause();
      });
    }, { threshold: 0.15 });
    videos.forEach((v) => io.observe(v));
  }
  const toggle = $('[data-video-toggle]');
  const mainVideo = $('[data-main-video]');
  if (toggle && mainVideo) {
    const sync = () => {
      toggle.setAttribute('aria-pressed', String(mainVideo.paused));
      toggle.setAttribute('aria-label', mainVideo.paused ? 'Odtwórz film' : 'Wstrzymaj film');
    };
    toggle.addEventListener('click', () => {
      if (mainVideo.paused) { userPaused.delete(mainVideo); tryPlay(mainVideo); }
      else { userPaused.add(mainVideo); mainVideo.pause(); }
    });
    mainVideo.addEventListener('play', sync);
    mainVideo.addEventListener('pause', sync);
    sync();
  }

  /* ---------- efekty zależne od scrolla ---------- */
  const parallax = $('[data-parallax]');
  const hero = $('[data-hero]');
  const scaler = $('[data-scale]');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = window.innerHeight;
    if (parallax && hero) {
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0) parallax.style.transform = `translate3d(0, ${clamp(-r.top * 0.16, 0, 90).toFixed(1)}px, 0)`;
    }
    if (scaler) {
      const r = scaler.parentElement.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.75), 0, 1);
      scaler.style.setProperty('--s', (0.86 + 0.14 * (1 - Math.pow(1 - p, 3))).toFixed(4));
    }
  };
  if (!reduced) {
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    frame();
  }

  /* ---------- podgląd „na żywo” w hero ---------- */
  const feed = $('[data-feed]');
  if (feed && !reduced) {
    const stamps = ['teraz', '1 min', '3 min', '6 min'];
    setInterval(() => {
      if (document.hidden) return;
      const last = feed.lastElementChild;
      last.classList.remove('enter');
      feed.prepend(last);
      void last.offsetWidth;
      last.classList.add('enter');
      $$('time', feed).forEach((t, i) => { t.textContent = stamps[i] || ''; });
    }, 2800);
  }

  /* ---------- kalkulator ---------- */
  const people = $('#calc-people');
  if (people) {
    const hours = $('#calc-hours');
    const rate = $('#calc-rate');
    const shares = $$('input[name="share"]');
    const shown = { hours: 0, year: 0, fte: 0 };
    let raf;
    const setFill = (input) => {
      const p = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty('--p', `${p}%`);
    };
    const paint = () => {
      $('#res-hours').textContent = pl.format(Math.round(shown.hours));
      $('#res-year').textContent = pl.format(Math.round(shown.year / 1000) * 1000);
      $('#res-fte').textContent = shown.fte.toFixed(1).replace('.', ',');
    };
    const update = (instant) => {
      const n = Number(people.value);
      const h = Number(hours.value);
      const r = Number(rate.value);
      const share = Number((shares.find((s) => s.checked) || shares[1]).value);
      const now = n * h * 4.33;
      const saved = now * share;
      const target = { hours: saved, year: saved * 12 * r, fte: saved / 160 };

      $('#out-people').textContent = pl.format(n);
      $('#out-hours').textContent = `${h} h`;
      $('#out-rate').textContent = `${r} zł`;
      [people, hours, rate].forEach(setFill);
      $('#lab-now').textContent = `${pl.format(Math.round(now))} h`;
      $('#lab-after').textContent = `${pl.format(Math.round(now - saved))} h`;
      $('#bar-after').style.width = `${(1 - share) * 100}%`;

      cancelAnimationFrame(raf);
      if (instant || reduced) { Object.assign(shown, target); paint(); return; }
      const from = { ...shown };
      const start = performance.now();
      const step = (t) => {
        const p = clamp((t - start) / 450, 0, 1);
        const e = 1 - Math.pow(1 - p, 3);
        Object.keys(target).forEach((k) => { shown[k] = from[k] + (target[k] - from[k]) * e; });
        paint();
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    [people, hours, rate, ...shares].forEach((el) => el.addEventListener('input', () => update(false)));
    update(true);
  }

  /* ---------- proces: sticky scroll ---------- */
  const story = $('[data-story]');
  if (story) {
    const steps = $$('.story-step', story);
    const panes = $$('.pane', story);
    const title = $('[data-story-title]', story);
    const names = ['audyt', 'projekt', 'wdrożenie', 'opieka'];
    let active = 0;
    const setActive = (i) => {
      if (i === active) return;
      active = i;
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      panes.forEach((p, k) => p.classList.toggle('is-active', k === i));
      if (title) title.textContent = names[i];
    };
    const pick = () => {
      const mid = window.innerHeight * 0.55;
      let best = 0;
      let bestDist = Infinity;
      steps.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setActive(best);
    };
    let pending = false;
    window.addEventListener('scroll', () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; pick(); });
    }, { passive: true });
    steps.forEach((s, i) => s.addEventListener('click', () => setActive(i)));
  }

  /* ---------- karuzela ---------- */
  const car = $('[data-carousel]');
  if (car) {
    const prev = $('[data-car-prev]');
    const next = $('[data-car-next]');
    const stepSize = () => {
      const card = car.firstElementChild;
      return card ? card.getBoundingClientRect().width + 20 : 400;
    };
    const syncNav = () => {
      const max = car.scrollWidth - car.clientWidth - 4;
      prev.disabled = car.scrollLeft <= 4;
      next.disabled = car.scrollLeft >= max;
    };
    const go = (dir) => car.scrollBy({ left: dir * stepSize(), behavior: reduced ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    car.addEventListener('scroll', syncNav, { passive: true });
    window.addEventListener('resize', syncNav);
    car.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    // przeciąganie myszą
    let down = false; let startX = 0; let startLeft = 0; let moved = false;
    car.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = car.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; car.classList.add('is-drag'); }
      if (moved) car.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (moved) {
        car.classList.remove('is-drag');
        const s = stepSize();
        car.scrollTo({ left: Math.round(car.scrollLeft / s) * s, behavior: reduced ? 'auto' : 'smooth' });
      }
    });
    syncNav();
  }

  /* ---------- marquee: podwój zawartość dla płynnej pętli ---------- */
  $$('[data-marquee]').forEach((row) => {
    $$('li', row).forEach((li) => {
      const clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      row.appendChild(clone);
    });
  });

  /* ---------- pakiety ---------- */
  const plans = $('[data-plans]');
  if (plans) {
    const tabs = $$('[data-mode]', plans.parentElement).filter((el) => el.matches('button'));
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      plans.dataset.mode = tab.dataset.mode;
    }));
  }

  /* ---------- FAQ ---------- */
  $$('[data-faq] .qa').forEach((qa) => {
    const btn = $('button', qa);
    btn.addEventListener('click', () => {
      const open = !qa.classList.contains('is-open');
      qa.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- formularz (prototyp: nic nie wysyła) ---------- */
  const form = $('[data-form]');
  if (form) {
    const msg = $('[data-form-msg]');
    const email = $('#cta-email');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      msg.textContent = ok
        ? 'To prototyp: adres wygląda poprawnie, ale formularz niczego jeszcze nie wysyła.'
        : 'Wpisz adres w formacie imie@firma.pl.';
      if (!ok) email.focus();
    });
  }
})();
