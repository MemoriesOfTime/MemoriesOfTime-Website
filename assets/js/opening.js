(() => {
  const overlay = document.getElementById('siteOpening');
  if (!overlay) return;

  const hash = window.location.hash;
  const forceFull = hash === '#opening';
  const forceShort = hash === '#opening-short';
  if ((hash && !forceFull && !forceShort) || hash === '#noopening') {
    overlay.remove();
    return;
  }

  let seen = false;
  try {
    seen = sessionStorage.getItem('mot_opening_seen') === '1';
    sessionStorage.setItem('mot_opening_seen', '1');
  } catch {}

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const short = !forceFull && (forceShort || seen || reducedMotion);
  const faces = [...overlay.querySelectorAll('.opening-face')];
  const finalFace = overlay.querySelector('.opening-face-final');
  const caption = document.getElementById('openingCaption');
  const pageRegions = [document.getElementById('nav-container'), document.getElementById('app')].filter(Boolean);
  const timers = new Set();
  let contentReady = document.documentElement.classList.contains('app-ready');
  let waitingForContent = false;
  let revealFromEnvelope = false;
  let finished = false;

  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  caption.textContent = `BIENVENUE · ${pad(now.getDate())} · ${pad(now.getMonth() + 1)} · ${now.getFullYear()}`;

  function later(callback, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }

  function showFace(face) {
    faces.forEach(item => item.classList.toggle('is-active', item === face));
  }

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(timer => window.clearTimeout(timer));
    timers.clear();
    overlay.classList.add('is-leaving');
    document.documentElement.classList.remove('opening-active');
    document.documentElement.classList.toggle('opening-entering', revealFromEnvelope);
    pageRegions.forEach(region => { region.inert = false; });

    window.setTimeout(() => {
      overlay.remove();
      document.documentElement.classList.remove('opening-entering');
      document.removeEventListener('keydown', onKeydown);
      window.removeEventListener('mot:appready', onAppReady);
      window.dispatchEvent(new CustomEvent('mot:openingdone'));
    }, reducedMotion ? 20 : revealFromEnvelope ? 850 : 540);
  }

  function requestFinish() {
    if (contentReady) {
      revealFromEnvelope = !short;
      finish();
      return;
    }
    waitingForContent = true;
    overlay.classList.add('is-waiting');
    showFace(finalFace);
  }

  function onAppReady() {
    contentReady = true;
    if (waitingForContent) finish();
  }

  function onKeydown(event) {
    if (event.key === 'Escape') finish();
  }

  overlay.classList.add('is-playing');
  overlay.classList.toggle('opening--short', short);
  document.documentElement.classList.add('opening-active');
  pageRegions.forEach(region => { region.inert = true; });
  overlay.addEventListener('click', finish);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('mot:appready', onAppReady);

  if (short) {
    showFace(finalFace);
    later(requestFinish, reducedMotion ? 400 : 650);
  } else {
    later(requestFinish, 1680);
  }
  later(finish, 5000);
})();
