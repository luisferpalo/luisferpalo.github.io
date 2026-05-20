/* ═══════════════════════════════════════════════
   LUISFERPALO — script.js
   Slideshow with crossfade, progress bar nav,
   pause control, keyboard nav, touch swipe
   ═══════════════════════════════════════════════ */

const SLIDES = [
  { src: 'assets/img/00.webp' },
  { src: 'assets/img/01.webp' },
  { src: 'assets/img/02.webp' },
  { src: 'assets/img/03.webp' },
  { src: 'assets/img/04.webp' },
  { src: 'assets/img/05.webp' },
  { src: 'assets/img/06.webp' },
  { src: 'assets/img/07.webp' },
  { src: 'assets/img/08.webp' },
  { src: 'assets/img/09.webp' },
  { src: 'assets/img/11.webp' },
  { src: 'assets/img/12.webp' },
];

const INTERVAL_MS   = 4000;
const FADE_DURATION = 900;

// ── DOM ──────────────────────────────────────
const bgA       = document.getElementById('bg-a');
const bgB       = document.getElementById('bg-b');
const imgA      = document.getElementById('img-a');
const imgB      = document.getElementById('img-b');
const imageWrap = document.querySelector('.image-wrap');
const navEl     = document.getElementById('slide-nav');
const pauseBtn  = document.getElementById('pause-btn');

// ── STATE ────────────────────────────────────
let current     = 0;
let isSlotA     = true;
let isAnimating = false;
let isPaused    = false;
let timer       = null;
let progressRAF = null;
let progressStart = null;

// ── PRELOAD ──────────────────────────────────
const cache = new Set();
function preload(src) {
  if (cache.has(src)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => { cache.add(src); resolve(); };
    img.src = src;
  });
}

// ── PROGRESS BAR DOTS ────────────────────────
function buildNav() {
  navEl.innerHTML = '';
  SLIDES.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'nav-dot';
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    const fill = document.createElement('span');
    fill.className = 'nav-dot__fill';
    dot.appendChild(fill);
    dot.addEventListener('click', () => goTo(i));
    navEl.appendChild(dot);
  });
}

function updateNav(idx) {
  navEl.querySelectorAll('.nav-dot').forEach((dot, i) => {
    dot.classList.toggle('is-active', i === idx);
    dot.classList.toggle('is-past', i < idx);
    const fill = dot.querySelector('.nav-dot__fill');
    fill.style.transition = 'none';
    fill.style.width = i < idx ? '100%' : '0%';
  });
}

function startProgress() {
  cancelAnimationFrame(progressRAF);
  const fill = navEl.querySelectorAll('.nav-dot')[current]?.querySelector('.nav-dot__fill');
  if (!fill) return;
  progressStart = performance.now();
  function tick(now) {
    if (isPaused) return;
    const elapsed = now - progressStart;
    const pct = Math.min((elapsed / INTERVAL_MS) * 100, 100);
    fill.style.transition = 'none';
    fill.style.width = pct + '%';
    if (pct < 100) progressRAF = requestAnimationFrame(tick);
  }
  progressRAF = requestAnimationFrame(tick);
}

// ── TRANSITION ───────────────────────────────
function crossfade(nextSrc) {
  if (isSlotA) {
    bgB.style.backgroundImage = `url('${nextSrc}')`;
    imgB.src = nextSrc;
    void imgB.offsetWidth;
    bgA.style.opacity  = '0';
    bgB.style.opacity  = '1';
    imgA.style.opacity = '0';
    imgB.style.opacity = '1';
  } else {
    bgA.style.backgroundImage = `url('${nextSrc}')`;
    imgA.src = nextSrc;
    void imgA.offsetWidth;
    bgB.style.opacity  = '0';
    bgA.style.opacity  = '1';
    imgB.style.opacity = '0';
    imgA.style.opacity = '1';
  }
}

function goTo(idx, direction) {
  if (isAnimating) return;
  isAnimating = true;

  const nextIndex = ((idx % SLIDES.length) + SLIDES.length) % SLIDES.length;
  const nextSrc   = SLIDES[nextIndex].src;

  // Instagram-style slide animation on mobile
  const isMobile = window.innerWidth <= 768;
  if (isMobile && imageWrap) {
    const dir = direction === 'prev' ? 1 : -1;
    imageWrap.style.transition = 'none';
    imageWrap.style.transform  = `translateX(0)`;
    void imageWrap.offsetWidth;
    imageWrap.style.transition = `transform ${FADE_DURATION}ms cubic-bezier(0.4,0,0.2,1)`;
    imageWrap.style.transform  = `translateX(${dir * -105}%)`;
    setTimeout(() => {
      imageWrap.style.transition = 'none';
      imageWrap.style.transform  = `translateX(${dir * 105}%)`;
      preload(nextSrc).then(() => {
        crossfade(nextSrc);
        void imageWrap.offsetWidth;
        imageWrap.style.transition = `transform ${FADE_DURATION}ms cubic-bezier(0.4,0,0.2,1)`;
        imageWrap.style.transform  = 'translateX(0)';
        finish(nextIndex);
      });
    }, FADE_DURATION);
  } else {
    preload(nextSrc).then(() => {
      crossfade(nextSrc);
      finish(nextIndex);
    });
  }
}

function finish(nextIndex) {
  setTimeout(() => {
    isSlotA   = !isSlotA;
    current   = nextIndex;
    isAnimating = false;
    updateNav(current);
    startProgress();
    scheduleNext();
    // Preload the one after
    const ahead = SLIDES[(current + 1) % SLIDES.length].src;
    preload(ahead);
  }, FADE_DURATION);
}

function next() { goTo(current + 1, 'next'); }
function prev() { goTo(current - 1, 'prev'); }

// ── TIMER ────────────────────────────────────
function scheduleNext() {
  clearTimeout(timer);
  if (!isPaused) timer = setTimeout(next, INTERVAL_MS);
}

function togglePause() {
  isPaused = !isPaused;
  pauseBtn.setAttribute('aria-label', isPaused ? 'Reproducir presentación' : 'Pausar presentación');
  pauseBtn.setAttribute('aria-pressed', isPaused);
  pauseBtn.querySelector('.pause-icon').style.display = isPaused ? 'none' : 'block';
  pauseBtn.querySelector('.play-icon').style.display  = isPaused ? 'block' : 'none';
  if (isPaused) {
    clearTimeout(timer);
    cancelAnimationFrame(progressRAF);
  } else {
    progressStart = performance.now() - (progressStart ? 0 : 0);
    startProgress();
    scheduleNext();
  }
}

// ── KEYBOARD ─────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft')  prev();
  if (e.key === ' ') { e.preventDefault(); togglePause(); }
});

// ── TOUCH / SWIPE ────────────────────────────
let touchStartX = 0;
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    dx < 0 ? next() : prev();
  }
}, { passive: true });

// ── TAP ZONES (mobile stories-style) ─────────
document.addEventListener('click', (e) => {
  if (window.innerWidth > 768) return;
  // Ignore if clicking a nav dot or pause button
  if (e.target.closest('#slide-nav') || e.target.closest('#pause-btn')) return;
  const x = e.clientX;
  if (x < window.innerWidth * 0.35) prev();
  else if (x > window.innerWidth * 0.65) next();
});

// ── INIT ─────────────────────────────────────
(function init() {
  // First image — paint immediately
  const first = SLIDES[0].src;
  preload(first).then(() => {
    bgA.style.backgroundImage = `url('${first}')`;
    imgA.src = first;
    void imgA.offsetWidth;
    bgA.style.opacity  = '1';
    bgB.style.opacity  = '0';
    imgA.style.opacity = '1';
    imgB.style.opacity = '0';
    buildNav();
    updateNav(0);
    startProgress();
    scheduleNext();
    // Preload second image
    if (SLIDES.length > 1) preload(SLIDES[1].src);
  });

  pauseBtn.addEventListener('click', togglePause);
})();
