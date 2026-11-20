/* REVAGY — formularz lead.v1. Dane pól nie trafiają do analityki ani logów. */
(() => {
  'use strict';
  const form = document.getElementById('kontakt-form');
  if (!form) return;
  const status = form.querySelector('[data-status]');
  const button = form.querySelector('[type="submit"]');
  if (!status || !button) return;

  function say(text, mail = false) {
    status.textContent = text;
    if (mail) {
      const link = document.createElement('a');
      link.href = 'mailto:kontakt@revagy.pl';
      link.textContent = 'kontakt@revagy.pl';
      status.append(' ', link);
    }
  }
  if (!window.fetch || !window.crypto || !window.AbortController || typeof Object.fromEntries !== 'function') {
    say('Ta przeglądarka nie może wysłać formularza. Napisz:', true);
    return;
  }
  button.disabled = false;

  const names = ['name', 'email', 'company', 'phone', 'topic', 'volume', 'message'];
  const fields = Object.fromEntries(names.map((name) => [name, form.elements.namedItem(name)]));
  const hasField = (name) => Object.prototype.hasOwnProperty.call(fields, name);
  const genericError = 'Nie udało się wysłać. Spróbuj ponownie albo napisz:';
  const challengeError = document.getElementById('kontakt-challenge-error');
  const started = Date.now();
  let key = null;
  let previousContent = null;
  let sending = false;
  let widgetId;
  let loading = null;
  const tokenWaiters = new Set();
  let latestToken = null;

  function notifyTokenWaiters(value) {
    const waiters = Array.from(tokenWaiters);
    tokenWaiters.clear();
    waiters.forEach((resolve) => resolve(value));
  }
  function waitForToken(ms = 15000) {
    if (latestToken) return Promise.resolve(latestToken);
    return new Promise((resolve) => {
      let timer;
      const waiter = (tok) => {
        clearTimeout(timer);
        tokenWaiters.delete(waiter);
        resolve(tok || null);
      };
      timer = setTimeout(() => {
        tokenWaiters.delete(waiter);
        resolve(null);
      }, ms);
      tokenWaiters.add(waiter);
    });
  }

  // Zapisujemy wyłącznie dozwolone pola; zapis z pamięci także traktujemy jako dane wejściowe.
  const touchNames = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'referrer', 'landing_path'];
  const singleLine = (value, max) => String(value || '').replace(/[\r\n]/g, '').slice(0, max);
  const cleanTouch = (data) => Object.fromEntries(touchNames.filter((n) => Boolean(data && typeof data[n] === 'string'))
    .map((n) => [n, singleLine(data[n], n.startsWith('utm_') ? 100 : 300)]));
  const params = new URLSearchParams(location.search);
  let firstTouch = cleanTouch({ ...Object.fromEntries(params), referrer: document.referrer, landing_path: location.pathname });
  try {
    const saved = sessionStorage.getItem('fg_first_touch');
    if (saved) firstTouch = cleanTouch(JSON.parse(saved));
    else sessionStorage.setItem('fg_first_touch', JSON.stringify(firstTouch));
  } catch (_) { /* Przy zablokowanej pamięci zostają dane bieżącego wejścia. */ }

  function uuid4() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const h = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  function challengeUnavailable() {
    challengeError.textContent = 'Nie udało się uruchomić ochrony przed spamem.';
    say(genericError, true);
  }
  function resetChallenge() {
    latestToken = null;
    if (window.turnstile && widgetId !== undefined) {
      try {
        window.turnstile.reset(widgetId);
      } catch (_) {
        notifyTokenWaiters(null);
        challengeUnavailable();
      }
    }
  }
  function renderChallenge() {
    if (widgetId !== undefined) return;
    latestToken = null;
    widgetId = window.turnstile.render('#kontakt-challenge', {
      sitekey: form.dataset.sitekey,
      action: 'kontakt-revagy', language: 'pl', appearance: 'interaction-only',
      theme: 'dark', size: 'compact',
      callback: (tok) => {
        challengeError.textContent = '';
        latestToken = tok || (window.turnstile && widgetId !== undefined ? window.turnstile.getResponse(widgetId) : '') || null;
        notifyTokenWaiters(latestToken);
      },
      'expired-callback': resetChallenge,
      'timeout-callback': resetChallenge,
      'error-callback': () => {
        latestToken = null;
        notifyTokenWaiters(null);
        challengeUnavailable();
        return true;
      },
    });
  }
  function loadChallenge() {
    if (window.turnstile && typeof window.turnstile.render === 'function') {
      try {
        renderChallenge();
        loading = Promise.resolve(true);
        return loading;
      } catch (_) {
        loading = null;
        latestToken = null;
        notifyTokenWaiters(null);
        challengeUnavailable();
        return Promise.resolve(false);
      }
    }
    if (loading) return loading;
    loading = new Promise((resolve) => {
      const script = document.createElement('script');
      let finished = false;
      const finish = (ok) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        if (!ok) {
          loading = null;
          script.remove();
          latestToken = null;
          notifyTokenWaiters(null);
          challengeUnavailable();
        }
        resolve(ok);
      };
      const timer = setTimeout(() => finish(false), 20000);
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onerror = () => finish(false);
      script.onload = () => {
        if (finished) return;
        try {
          renderChallenge();
          finish(true);
        } catch (_) { finish(false); }
      };
      document.head.appendChild(script);
    });
    return loading;
  }
  form.addEventListener('focusin', loadChallenge);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        loadChallenge();
      }
    });
    observer.observe(form);
  }

  const errors = {
    name: 'Podaj imię i nazwisko: od 2 do 120 znaków, w jednym wierszu.',
    email: 'Podaj poprawny służbowy adres e-mail, do 254 znaków.',
    company: 'Podaj nazwę firmy: do 160 znaków, w jednym wierszu.',
    phone: 'Podaj od 6 do 32 znaków: cyfry, spacje, +, nawiasy lub myślnik.',
    topic: 'Wybierz temat zapytania.',
    volume: 'Wybierz jedną z podanych wielkości lub „Nie podaję”.',
    message: 'Wiadomość może mieć najwyżej 4000 znaków.',
  };
  function markError(name) {
    if (!hasField(name)) return false;
    fields[name].setAttribute('aria-invalid', 'true');
    document.getElementById(`kontakt-${name}-error`).textContent = errors[name];
    return true;
  }
  function clearErrors() {
    names.forEach((name) => {
      fields[name].setAttribute('aria-invalid', 'false');
      document.getElementById(`kontakt-${name}-error`).textContent = '';
    });
  }
  function focusError() {
    const firstBad = form.querySelector('[aria-invalid="true"]');
    if (firstBad) firstBad.focus();
  }
  function updateCount() {
    document.getElementById('kontakt-message-count').textContent = `${fields.message.value.length} / 4000 znaków`;
  }
  fields.message.addEventListener('input', updateCount);
  function validate(body) {
    const invalid = new Set();
    names.filter((n) => n !== 'message').forEach((n) => { if (/[\r\n]/.test(body[n] || '')) invalid.add(n); });
    if (body.name.trim().length < 2 || body.name.length > 120) invalid.add('name');
    if (!body.email || body.email.length > 254 || fields.email.validity.typeMismatch) invalid.add('email');
    if (!body.company.trim() || body.company.length > 160) invalid.add('company');
    const phone = body.phone.trim();
    if (phone && !/^[+0-9 ()-]{6,32}$/.test(phone)) invalid.add('phone');
    if (!['audyt', 'wdrozenie', 'kalkulator-roi', 'inne'].includes(body.topic)) invalid.add('topic');
    if (body.volume && !['do-50', '50-200', '200-1000', 'ponad-1000'].includes(body.volume)) invalid.add('volume');
    if (body.message.length > 4000) invalid.add('message');
    invalid.forEach(markError);
    return invalid.size === 0;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    clearErrors();
    const body = { schema_version: 'lead.v1', ...firstTouch };
    names.forEach((name) => { body[name] = fields[name].value; });
    // Weryfikacja CR/LF następuje przed trim, aby nie ukrywać niepoprawnej treści.
    if (!validate(body)) {
      say('Sprawdź zaznaczone pola.');
      focusError();
      return;
    }
    body.name = body.name.trim();
    body.email = body.email.trim();
    body.company = body.company.trim();
    body.phone = body.phone.trim();
    // Opcjonalne pola z enumem lub wzorcem pomijamy, gdy są puste.
    if (!body.phone) delete body.phone;
    if (!body.volume) delete body.volume;
    body.website = form.elements.namedItem('website').value;
    body.notice_version = form.dataset.noticeVersion;
    const content = JSON.stringify(body);
    if (content !== previousContent) key = null;
    previousContent = content;
    sending = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    form.setAttribute('aria-busy', 'true');
    let timeout;
    try {
      say('Sprawdzamy ochronę przed spamem…');
      if (!await loadChallenge()) return;
      let token = window.turnstile.getResponse(widgetId);
      if (!token) token = (await waitForToken(15000)) || window.turnstile.getResponse(widgetId);
      if (!token || token.length > 2048 || /[\r\n]/.test(token)) {
        challengeError.textContent = 'Potwierdź, że nie jesteś botem, i wyślij ponownie.';
        say(challengeError.textContent);
        return;
      }
      body['cf-turnstile-response'] = token;
      body.t_ms = Math.max(0, Date.now() - started);
      const json = JSON.stringify(body);
      if (new TextEncoder().encode(json).length > 16384) { say('Wiadomość jest za długa.'); return; }
      key = key || uuid4();
      say('Wysyłanie…');
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 20000);
      const response = await fetch('/api/kontakt', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: json,
      });
      const data = await response.json().catch(() => ({}));
      const code = response.status;
      if (code === 202 && data && data.ok === true && /^ld_[0-9a-f]{32}$/.test(data.lead_id)) {
        key = null;
        previousContent = null;
        form.reset();
        updateCount();
        resetChallenge();
        say('Dziękujemy, zapytanie dotarło. Odpiszemy w ciągu jednego dnia roboczego. Potwierdzenie wyślemy na podany adres e-mail.');
        status.focus();
        document.dispatchEvent(new CustomEvent('lead:accepted', { detail: { lead_id: data.lead_id } }));
      } else {
        resetChallenge();
        if (code === 400 && data && data.error === 'validation') {
          const rejected = Array.isArray(data && data.fields) ? data.fields : [];
          rejected.forEach(markError);
          say(rejected.some(hasField) ? 'Sprawdź zaznaczone pola.' : genericError, !rejected.some(hasField));
          focusError();
        } else if (code === 400 && data && data.error === 'challenge_failed') {
          say('Potwierdź, że nie jesteś botem, i wyślij ponownie.');
        } else if (code === 409 && data && data.error === 'notice_outdated') {
          say('Odśwież stronę i wyślij ponownie — zaktualizowaliśmy informację o danych. Wpisana treść zostanie w formularzu, jeśli nie zamkniesz karty.');
        } else if (code === 409 && data && data.error === 'idempotency_conflict') {
          key = null;
          say('Wyślij zapytanie ponownie. Wpisana treść została zachowana.');
        } else if (code === 413) say('Wiadomość jest za długa.');
        else if (code === 429) say('Za dużo prób. Spróbuj za minutę albo napisz:', true);
        else say(genericError, true);
      }
    } catch (_) {
      resetChallenge();
      say(genericError, true);
    }
    finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.setAttribute('aria-busy', 'false');
      form.setAttribute('aria-busy', 'false');
    }
  });
})();
