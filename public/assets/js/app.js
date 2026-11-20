/* REVAGY — interakcje, animacje kinetyczne i kontrolery podstron P0–P2. Bez zależności. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pl = new Intl.NumberFormat('pl-PL');

  const norm = (str) =>
    String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .trim();

  /* ---------- 0. Atrybucja pierwszego wejścia w sesji (fg_first_touch dla formularza lead.v1) ---------- */
  const touchNames = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'referrer', 'landing_path'];
  const singleLine = (value, max) => String(value || '').replace(/[\r\n]/g, '').slice(0, max);
  const cleanTouch = (data) =>
    Object.fromEntries(
      touchNames
        .filter((n) => typeof data?.[n] === 'string')
        .map((n) => [n, singleLine(data[n], n.startsWith('utm_') ? 100 : 300)])
    );
  try {
    if (!sessionStorage.getItem('fg_first_touch')) {
      const params = new URLSearchParams(location.search);
      const firstTouch = cleanTouch({
        ...Object.fromEntries(params),
        referrer: document.referrer,
        landing_path: location.pathname,
      });
      sessionStorage.setItem('fg_first_touch', JSON.stringify(firstTouch));
    }
  } catch (_) {
    /* Przy zablokowanej pamięci sesji pomijamy zapis. */
  }

  /* ---------- 1. Nagłówek, dropdowny, menu mobilne i pasek postępu ---------- */
  const header = $('.site-header');
  const progressBar = $('[data-scroll-progress], .scroll-progress-bar');

  const onScrollHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (progressBar) {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = clamp((window.scrollY / maxScroll) * 100, 0, 100);
      progressBar.style.setProperty('--scroll-p', `${pct.toFixed(1)}%`);
    }
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  window.addEventListener('resize', onScrollHeader);

  const navItems = $$('.nav-item.has-panel');
  const closePanels = (except) =>
    navItems.forEach((item) => {
      if (item === except) return;
      item.classList.remove('is-open');
      const link = $('.nav-link', item);
      if (link) link.setAttribute('aria-expanded', 'false');
    });

  navItems.forEach((item) => {
    const btn = $('.nav-link', item);
    if (!btn) return;
    let timer;
    const open = () => {
      clearTimeout(timer);
      closePanels(item);
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      item.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    };
    let hovering = false;
    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') {
        hovering = true;
        open();
      }
    });
    item.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') {
        hovering = false;
        timer = setTimeout(close, 140);
      }
    });
    // mysz otwiera najechaniem, więc klik nie może zamykać; dotyk i klawiatura przełączają
    btn.addEventListener('click', () => (hovering || !item.classList.contains('is-open') ? open() : close()));
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) close();
    });
    $$('a', item).forEach((a) => a.addEventListener('click', close));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) closePanels();
  });

  const menuBtn = $('.menu-toggle');
  const menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menu || !menuBtn || menu.hidden === !open) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    if (header) header.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => {
      if (e.matches) setMenu(false);
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePanels();
      setMenu(false);
    }
  });

  /* ---------- 2. Guided Journey Rail ("Prowadzenie klienta za rękę") ---------- */
  const initJourneyRail = () => {
    const rail = $('.journey-rail');
    if (!rail) return;

    const labelledSections = $$('[data-step-label]', document);
    const rawSections = labelledSections.length > 0 ? labelledSections : $$('main > section', document);
    const sections = [];
    const seen = new Set();
    rawSections.forEach((sec) => {
      if (seen.has(sec)) return;
      seen.add(sec);
      const explicit = sec.dataset.stepLabel;
      const heading = $('h1, h2, h3', sec);
      const kicker = $('.kicker, .chip-glass', sec);
      let label = explicit || (heading && heading.textContent.trim()) || (kicker && kicker.textContent.trim()) || sec.id || '';
      label = label.replace(/\s+/g, ' ').trim();
      if (!label) return;
      if (label.length > 34) label = `${label.slice(0, 32).trim()}…`;
      sections.push({ el: sec, label });
    });

    if (sections.length < 2) {
      rail.hidden = true;
      return;
    }

    const dotsWrap = $('.journey-dots', rail);
    if (dotsWrap && dotsWrap.children.length === 0) {
      dotsWrap.innerHTML = sections
        .map(
          (s, i) =>
            `<button type="button" class="journey-dot${i === 0 ? ' is-active' : ''}" data-journey-dot="${i}" aria-label="Przejdź do sekcji ${i + 1}: ${s.label.replace(/"/g, '&quot;')}"></button>`
        )
        .join('');
    }

    const countEl = $('[data-journey-count]', rail);
    const labelEl = $('[data-journey-label]', rail);
    const nextBtn = $('[data-journey-next]', rail);
    const dots = $$('[data-journey-dot]', rail);
    const footer = $('.site-footer');
    let currentIdx = 0;

    const updateRail = () => {
      const pivot = window.innerHeight * 0.42;
      let best = 0;
      let bestDist = Infinity;
      sections.forEach((s, i) => {
        const r = s.el.getBoundingClientRect();
        const dist = r.top <= pivot && r.bottom >= pivot ? 0 : Math.min(Math.abs(r.top - pivot), Math.abs(r.bottom - pivot));
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      currentIdx = best;
      if (countEl) countEl.textContent = `Krok ${best + 1} z ${sections.length}`;
      if (labelEl) labelEl.textContent = sections[best].label;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === best));
      if (nextBtn) {
        const isLast = best >= sections.length - 1;
        nextBtn.textContent = isLast ? 'Na górę ↑' : 'Następny krok →';
      }
      if (footer) {
        const fr = footer.getBoundingClientRect();
        rail.classList.toggle('is-hidden', fr.top < window.innerHeight - 20);
      }
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.dataset.journeyDot) || 0;
        const target = sections[idx];
        if (target && target.el) {
          target.el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentIdx < sections.length - 1) {
          const next = sections[currentIdx + 1];
          if (next && next.el) next.el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        }
      });
    }

    window.addEventListener('scroll', updateRail, { passive: true });
    updateRail();
  };
  initJourneyRail();

  /* ---------- 3. Pojawianie się sekcji (.reveal -> .is-in) ---------- */
  const reveals = $$('.reveal');
  if (hasIO && !reduced && reveals.length > 0) {
    document.documentElement.classList.add('js-motion');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- 4. Liczniki ([data-count]) ---------- */
  const counters = $$('[data-count]');
  if (hasIO && !reduced && counters.length > 0) {
    const run = (el) => {
      const target = Number(el.dataset.count);
      if (Number.isNaN(target)) return;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const p = clamp((now - start) / dur, 0, 1);
        const val = Math.round(target * (1 - Math.pow(1 - p, 4)));
        el.textContent = `${prefix}${pl.format(val)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- 5. Filmy: odtwarzaj tylko w kadrze + [data-video-toggle] ---------- */
  const videos = $$('video[data-autoplay]');
  const userPaused = new WeakSet();
  const tryPlay = (v) => {
    try {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    } catch (_) {}
  };
  if (hasIO && !reduced && videos.length > 0) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target;
          if (entry.isIntersecting && !userPaused.has(v)) tryPlay(v);
          else v.pause();
        });
      },
      { threshold: 0.15 }
    );
    videos.forEach((v) => io.observe(v));
  }

  $$('[data-video-toggle]').forEach((toggle) => {
    const scope = toggle.closest('.film, .card-video, section') || document;
    const mainVideo = $('[data-main-video], video', scope) || $('[data-main-video]');
    if (!mainVideo) return;
    const sync = () => {
      const paused = mainVideo.paused;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.dataset.paused = String(paused);
      toggle.classList.toggle('is-paused', paused);
      toggle.setAttribute('aria-label', paused ? 'Odtwórz film' : 'Wstrzymaj film');
    };
    toggle.addEventListener('click', () => {
      if (mainVideo.paused) {
        userPaused.delete(mainVideo);
        tryPlay(mainVideo);
      } else {
        userPaused.add(mainVideo);
        mainVideo.pause();
      }
      sync();
    });
    mainVideo.addEventListener('play', sync);
    mainVideo.addEventListener('pause', sync);
    sync();
  });

  /* ---------- 6. Efekty zależne od scrolla ([data-parallax] & [data-scale]) ---------- */
  const parallaxes = $$('[data-parallax]');
  const scalers = $$('[data-scale]');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = window.innerHeight;
    parallaxes.forEach((parallax) => {
      const hero = parallax.closest('[data-hero], .hero, .page-hero') || $('[data-hero]');
      if (!hero) return;
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0) {
        parallax.style.transform = `translate3d(0, ${clamp(-r.top * 0.16, 0, 90).toFixed(1)}px, 0)`;
      }
    });
    scalers.forEach((scaler) => {
      const parent = scaler.parentElement || scaler;
      const r = parent.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.75), 0, 1);
      scaler.style.setProperty('--s', (0.86 + 0.14 * (1 - Math.pow(1 - p, 3))).toFixed(4));
    });
  };
  if (!reduced && (parallaxes.length > 0 || scalers.length > 0)) {
    const request = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    frame();
  }

  /* ---------- 7. Podgląd „na żywo” w hero ([data-feed]) ---------- */
  $$('[data-feed]').forEach((feed) => {
    if (reduced || feed.children.length < 2) return;
    const firstTime = $('time', feed);
    const useRelativeStamps = firstTime && firstTime.textContent.trim() === 'teraz';
    const stamps = ['teraz', '1 min', '3 min', '6 min'];
    setInterval(() => {
      if (document.hidden) return;
      const last = feed.lastElementChild;
      if (!last) return;
      last.classList.remove('enter');
      feed.prepend(last);
      void last.offsetWidth;
      last.classList.add('enter');
      if (useRelativeStamps) {
        $$('time', feed).forEach((t, i) => {
          t.textContent = stamps[i] || '';
        });
      }
    }, 2800);
  });

  /* ---------- 8. Kalkulator ROI (domyślnie 65 zł/h) ---------- */
  const people = $('#calc-people');
  if (people) {
    const hours = $('#calc-hours');
    const rate = $('#calc-rate');
    const shares = $$('input[name="share"]');
    const shown = { hours: 0, year: 0, fte: 0 };
    let raf;
    const setFill = (input) => {
      if (!input) return;
      const p = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty('--p', `${p}%`);
    };
    const paint = () => {
      const resHours = $('#res-hours');
      const resYear = $('#res-year');
      const resFte = $('#res-fte');
      if (resHours) resHours.textContent = pl.format(Math.round(shown.hours));
      if (resYear) resYear.textContent = pl.format(Math.round(shown.year / 1000) * 1000);
      if (resFte) resFte.textContent = shown.fte.toFixed(1).replace('.', ',');
    };
    const update = (instant) => {
      const n = Number(people.value);
      const h = Number(hours.value);
      const r = Number(rate.value);
      const share = Number((shares.find((s) => s.checked) || shares[1]).value);
      const now = n * h * 4.33;
      const saved = now * share;
      const target = { hours: saved, year: saved * 12 * r, fte: saved / 160 };

      const outPeople = $('#out-people');
      const outHours = $('#out-hours');
      const outRate = $('#out-rate');
      if (outPeople) outPeople.textContent = pl.format(n);
      if (outHours) outHours.textContent = `${h} h`;
      if (outRate) outRate.textContent = `${r} zł`;
      [people, hours, rate].forEach(setFill);

      const labNow = $('#lab-now');
      const labAfter = $('#lab-after');
      const barAfter = $('#bar-after');
      if (labNow) labNow.textContent = `${pl.format(Math.round(now))} h`;
      if (labAfter) labAfter.textContent = `${pl.format(Math.round(now - saved))} h`;
      if (barAfter) barAfter.style.width = `${(1 - share) * 100}%`;

      cancelAnimationFrame(raf);
      if (instant || reduced) {
        Object.assign(shown, target);
        paint();
        return;
      }
      const from = { ...shown };
      const start = performance.now();
      const step = (t) => {
        const p = clamp((t - start) / 450, 0, 1);
        const e = 1 - Math.pow(1 - p, 3);
        Object.keys(target).forEach((k) => {
          shown[k] = from[k] + (target[k] - from[k]) * e;
        });
        paint();
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    [people, hours, rate, ...shares].filter(Boolean).forEach((el) => {
      el.addEventListener('input', () => update(false));
      el.addEventListener('change', () => update(false));
    });
    update(true);
  }

  /* ---------- 9. Proces: Sticky-Scroll 4-step Story ([data-story]) ---------- */
  $$('[data-story]').forEach((story) => {
    const steps = $$('.story-step', story);
    const panes = $$('.pane', story);
    const title = $('[data-story-title]', story);
    const names = ['audyt', 'projekt', 'wdrożenie', 'opieka'];
    if (steps.length === 0) return;
    let active = 0;
    const setActive = (i) => {
      if (i === active) return;
      active = i;
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      panes.forEach((p, k) => p.classList.toggle('is-active', k === i));
      if (title) title.textContent = steps[i].dataset.title || names[i] || `krok-${i + 1}`;
    };
    const pick = () => {
      const mid = window.innerHeight * 0.55;
      let best = 0;
      let bestDist = Infinity;
      steps.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    let pending = false;
    window.addEventListener(
      'scroll',
      () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          pick();
        });
      },
      { passive: true }
    );
    steps.forEach((s, i) => s.addEventListener('click', () => setActive(i)));
  });

  /* ---------- 10. Karuzela ([data-carousel]) ---------- */
  $$('[data-carousel]').forEach((car) => {
    const scope = car.closest('section') || document;
    const prev = $('[data-car-prev]', scope) || $('[data-car-prev]');
    const next = $('[data-car-next]', scope) || $('[data-car-next]');
    const stepSize = () => {
      const card = car.firstElementChild;
      return card ? card.getBoundingClientRect().width + 20 : 400;
    };
    const syncNav = () => {
      const max = car.scrollWidth - car.clientWidth - 4;
      if (prev) prev.disabled = car.scrollLeft <= 4;
      if (next) next.disabled = car.scrollLeft >= max;
    };
    const go = (dir) => car.scrollBy({ left: dir * stepSize(), behavior: reduced ? 'auto' : 'smooth' });
    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));
    car.addEventListener('scroll', syncNav, { passive: true });
    window.addEventListener('resize', syncNav);
    car.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
    });
    // przeciąganie myszą
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    car.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = car.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        car.classList.add('is-drag');
      }
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
  });

  /* ---------- 11. Marquee ([data-marquee] + [data-marquee-toggle]) ---------- */
  $$('[data-marquee]').forEach((row) => {
    $$('li', row).forEach((li) => {
      const clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      row.appendChild(clone);
    });
  });

  $$('[data-marquee-toggle]').forEach((btn) => {
    const scope = btn.closest('section, .marquee-wrap') || document;
    const marquee = $('.marquee', scope) || $('.marquee');
    if (!marquee) return;
    btn.addEventListener('click', () => {
      const paused = marquee.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', String(paused));
      btn.dataset.paused = String(paused);
      btn.setAttribute('aria-label', paused ? 'Wznów przewijanie listy integracji' : 'Wstrzymaj przewijanie listy integracji');
      btn.textContent = paused ? 'Wznów ruch' : 'Wstrzymaj ruch';
    });
  });

  /* ---------- 12. Pakiety ([data-plans] Wdrożenie / Stała opieka) ---------- */
  $$('[data-plans]').forEach((plans) => {
    const scope = plans.closest('section') || plans.parentElement || document;
    const tabs = $$('[data-mode]', scope).filter((el) => el.matches('button'));
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          const active = t === tab;
          t.setAttribute('aria-selected', String(active));
          t.classList.toggle('is-active', active);
        });
        plans.dataset.mode = tab.dataset.mode;
      });
    });
  });

  /* ---------- 13. FAQ ([data-faq] smooth accordion toggles) ---------- */
  $$('[data-faq] .qa, .qa').forEach((qa) => {
    const btn = $('button', qa);
    if (!btn || btn.dataset.faqBound === 'true') return;
    btn.dataset.faqBound = 'true';
    btn.addEventListener('click', () => {
      const open = !qa.classList.contains('is-open');
      qa.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  $$('[data-faq] .faq-item, .faq-list .faq-item').forEach((item) => {
    const btn = $('button', item);
    if (!btn || btn.dataset.faqBound === 'true') return;
    btn.dataset.faqBound = 'true';
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- 14. [data-filter-group] (Filtrowanie kart na /realizacje) ---------- */
  const initFilterGroups = () => {
    $$('[data-filter-group]').forEach((group) => {
      const buttons = $$('button[data-filter], [data-filter]', group).filter((el) => el.matches('button, [role="tab"]'));
      if (buttons.length === 0) return;

      const findCards = () => {
        let cards = $$('[data-status], [data-category], [data-filter-item]', group).filter(
          (el) => !buttons.includes(el)
        );
        if (cards.length === 0) {
          const section = group.closest('section') || $('main') || document;
          cards = $$('[data-status], [data-category], [data-filter-item]', section).filter(
            (el) => !buttons.includes(el) && !group.contains(el)
          );
        }
        return cards;
      };

      const matchesFilter = (cardVal, filterVal) => {
        const f = norm(filterVal);
        if (!f || f === 'all' || f === 'wszystkie' || f === '*') return true;
        const c = norm(cardVal);
        if (!c) return false;
        const tokens = c.split(/[\s,|;/]+/);
        if (tokens.includes(f) || c.includes(f)) return true;
        if ((f === 'produkcja' || f === 'prod') && (c.includes('prod') || c.includes('produkcja'))) return true;
        if ((f === 'pilotaz' || f === 'pilot') && (c.includes('pilot') || c.includes('shadow'))) return true;
        if ((f === 'w-trakcie' || f === 'w trakcie' || f === 'wip' || f === 'trakcie') && (c.includes('wip') || c.includes('trakcie'))) return true;
        return false;
      };

      const updateCounts = (cards, visibleCount) => {
        $$('[data-filter-count]', group).forEach((el) => {
          const key = (el.dataset.filterCount || '').trim();
          if (!key) {
            el.textContent = String(visibleCount);
          } else if (key === 'all') {
            el.textContent = String(cards.length);
          } else {
            const count = cards.filter((card) => {
              const itemVal = card.dataset.filterItem || card.dataset.status || card.dataset.category || '';
              return itemVal === key || matchesFilter(itemVal, key);
            }).length;
            el.textContent = String(count);
          }
        });
      };

      const initialCards = findCards();
      updateCounts(initialCards, initialCards.length);

      const applyFilter = (activeBtn) => {
        const rawFilter =
          activeBtn.dataset.filter ||
          activeBtn.dataset.status ||
          activeBtn.textContent.replace(/\(\d+\)/g, '').trim();
        buttons.forEach((btn) => {
          const isCurrent = btn === activeBtn;
          btn.classList.toggle('is-active', isCurrent);
          if (btn.hasAttribute('aria-selected')) {
            btn.setAttribute('aria-selected', String(isCurrent));
          }
          if (btn.hasAttribute('aria-pressed')) {
            btn.setAttribute('aria-pressed', String(isCurrent));
          }
        });

        const cards = findCards();
        let visibleCount = 0;
        cards.forEach((card) => {
          const status = card.dataset.status || card.dataset.category || card.dataset.filterItem || '';
          const show = matchesFilter(status, rawFilter);
          card.hidden = !show;
          card.classList.toggle('is-filtered-out', !show);
          if (show) visibleCount += 1;
        });

        updateCounts(cards, visibleCount);
      };

      buttons.forEach((btn) => {
        btn.addEventListener('click', () => applyFilter(btn));
      });
    });
  };
  initFilterGroups();

  /* ---------- 15. [data-tabs] (Moduły Grupy KONO, 5 Triggerów APT, Soczewki /porownanie, Symulator Tabletu) ---------- */
  $$('[data-tabs]').forEach((tabsRoot) => {
    const rawButtons = $$(
      '[role="tab"], button[data-tab], button[data-tab-target], button[data-step], button[data-lens], .tab-btn, .sim-step',
      tabsRoot
    );
    const buttons = rawButtons.filter(
      (el) => el.matches('button, a, [role="tab"]') && !el.hasAttribute('data-tab-panel') && !el.hasAttribute('data-panel')
    );
    if (buttons.length === 0) return;

    const findPanels = () => {
      let panels = $$(
        '[role="tabpanel"], [data-tab-panel], [data-panel], .tab-panel, .sim-pane',
        tabsRoot
      ).filter((el) => !buttons.includes(el));
      if (panels.length === 0) {
        const sec = tabsRoot.closest('section') || document;
        panels = $$('[role="tabpanel"], [data-tab-panel], [data-panel], .tab-panel, .sim-pane', sec).filter(
          (el) => !buttons.includes(el)
        );
      }
      return panels;
    };

    let activeIdx = Math.max(
      0,
      buttons.findIndex((b) => b.classList.contains('is-active') || b.getAttribute('aria-selected') === 'true')
    );

    const activateTab = (idx) => {
      const targetIdx = clamp(idx, 0, buttons.length - 1);
      activeIdx = targetIdx;
      const activeBtn = buttons[targetIdx];
      const key =
        activeBtn.dataset.tab ||
        activeBtn.dataset.tabTarget ||
        activeBtn.dataset.step ||
        activeBtn.dataset.lens ||
        activeBtn.getAttribute('aria-controls') ||
        '';

      buttons.forEach((btn, i) => {
        const isAct = i === targetIdx;
        btn.classList.toggle('is-active', isAct);
        btn.setAttribute('aria-selected', String(isAct));
      });

      const panels = findPanels();
      if (panels.length > 0) {
        const hasKeyMatch =
          key &&
          panels.some(
            (p) =>
              (p.dataset.tabPanel || p.dataset.panel || p.dataset.tab || p.dataset.step || p.dataset.lens || p.id) ===
              key
          );

        panels.forEach((panel, i) => {
          const panelKey =
            panel.dataset.tabPanel ||
            panel.dataset.panel ||
            panel.dataset.tab ||
            panel.dataset.step ||
            panel.dataset.lens ||
            panel.id ||
            '';
          const isMatch = hasKeyMatch ? panelKey === key : i === targetIdx;
          panel.classList.toggle('is-active', isMatch);
          panel.hidden = !isMatch;
        });
      }

      // Podświetlanie wierszy tabeli porównawczej tr[data-lens] na /porownanie.html
      const section = tabsRoot.closest('section') || document;
      const lensRows = $$('tr[data-lens]', section);
      if (lensRows.length > 0 && key) {
        const normKey = norm(key);
        lensRows.forEach((row) => {
          const rowLens = norm(row.dataset.lens);
          const isAll = normKey === 'all' || normKey === 'wszystkie';
          const isRowMatch = isAll || rowLens.includes(normKey);
          row.classList.toggle('is-highlighted', isRowMatch);
          row.classList.toggle('is-dimmed', !isAll && !isRowMatch);
        });
      }

      const stepIndicator = $('[data-sim-indicator], [data-tab-indicator]', tabsRoot);
      if (stepIndicator) {
        stepIndicator.textContent = `Krok ${targetIdx + 1} z ${buttons.length}`;
      }
    };

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        if (btn.tagName === 'A') e.preventDefault();
        activateTab(i);
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = (activeIdx + 1) % buttons.length;
          buttons[next].focus();
          activateTab(next);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = (activeIdx - 1 + buttons.length) % buttons.length;
          buttons[prev].focus();
          activateTab(prev);
        }
      });
    });

    const prevBtn = $('[data-sim-prev], [data-tab-prev]', tabsRoot);
    const nextBtn = $('[data-sim-next], [data-tab-next]', tabsRoot);
    if (prevBtn) prevBtn.addEventListener('click', () => activateTab((activeIdx - 1 + buttons.length) % buttons.length));
    if (nextBtn) nextBtn.addEventListener('click', () => activateTab((activeIdx + 1) % buttons.length));

    activateTab(activeIdx);
  });

  /* ---------- 16. Kopiowanie adresu kontaktowego ([data-copy]) ---------- */
  $$('[data-copy]').forEach((btn) => {
    const scope = btn.parentElement || document;
    const msg = $('[data-copy-msg]', scope);
    btn.addEventListener('click', async () => {
      let done = false;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        done = true;
      } catch (err) {
        /* schowek niedostępny */
      }
      if (msg) msg.textContent = done ? ' Skopiowano.' : ` Adres: ${btn.dataset.copy}`;
    });
  });
})();
