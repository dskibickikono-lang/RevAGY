/* Mini-silnik osi czasu dla scen DOM. Wszystko liczone z t (sekundy), bez zegara przeglądarki,
   dzięki czemu każda klatka filmu jest powtarzalna. */
window.TL = (() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (p) => 1 - Math.pow(1 - p, 3);
  const prog = (t, at, dur = 0.6) => ease(clamp((t - at) / dur));
  const lerp = (a, b, p) => a + (b - a) * p;

  // elementy z data-at pojawiają się (opacity + przesunięcie), data-out znikają
  function apply(t, root = document) {
    root.querySelectorAll('[data-at]').forEach((el) => {
      const dur = Number(el.dataset.dur || 0.6);
      let p = prog(t, Number(el.dataset.at), dur);
      if (el.dataset.out) p *= 1 - prog(t, Number(el.dataset.out), 0.4);
      const dy = Number(el.dataset.dy ?? 18);
      const dx = Number(el.dataset.dx ?? 0);
      const sc = Number(el.dataset.sc ?? 1);
      el.style.opacity = p.toFixed(4);
      el.style.transform = `translate(${((1 - p) * dx).toFixed(2)}px, ${((1 - p) * dy).toFixed(2)}px) scale(${lerp(sc, 1, p).toFixed(4)})`;
    });
  }

  function live(render, duration) {
    window.ready = document.fonts.ready.then(() => { render(0); return true; });
    if (!navigator.webdriver) {
      const loop = (ms) => { render((ms / 1000) % duration); requestAnimationFrame(loop); };
      window.ready.then(() => requestAnimationFrame(loop));
    }
  }
  return { clamp, ease, prog, lerp, apply, live };
})();
