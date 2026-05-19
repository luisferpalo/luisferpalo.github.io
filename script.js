/* ═══════════════════════════════════════════════
   LUISFERPALO — script.js
   Synchronized background + central image slideshow
   ═══════════════════════════════════════════════ */

// ──────────────────────────────────────────────
// SLIDES ARRAY
// Each entry has: src (image URL) and caption (text shown below image)
//
// ⚠️  TO SWAP FOR YOUR OWN IMAGES:
//     Replace the `src` strings with your local file paths, e.g.:
//       src: './images/obra-01.jpg'
//     Make sure the files are in the same repo before deploying to GitHub Pages.
// ──────────────────────────────────────────────
const SLIDES = [
  { src: 'assets/img/00.jpg', caption: '' },
  { src: 'assets/img/01.png', caption: '' },
  { src: 'assets/img/02.jpg', caption: '' },
  { src: 'assets/img/03.JPG', caption: '' },
  { src: 'assets/img/04.png', caption: '' },
  { src: 'assets/img/05.png', caption: '' },
  { src: 'assets/img/06.png', caption: '' },
  { src: 'assets/img/07.png', caption: '' },
  { src: 'assets/img/08.jpg', caption: '' },
  { src: 'assets/img/09.png', caption: '' },
  { src: 'assets/img/11.png', caption: '' },
  { src: 'assets/img/12.png', caption: '' },
];

// ──────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────
const INTERVAL_MS    = 3000;   // Time between slides (ms)
const FADE_DURATION  = 1000;   // Must match CSS --transition-fade (ms)

// ──────────────────────────────────────────────
// DOM REFS
// ──────────────────────────────────────────────
const bgA     = document.getElementById('bg-a');
const bgB     = document.getElementById('bg-b');
const imgA    = document.getElementById('img-a');
const imgB    = document.getElementById('img-b');
const caption = document.getElementById('caption');

// ──────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────
let current    = 0;      // Index of the slide currently visible
let isSlotA    = true;   // Tracks which img/bg slot is "active" (A or B)
let isAnimating = false; // Guard — prevents overlap during fade

// ──────────────────────────────────────────────
// PRELOAD — load an image src in the background
// ──────────────────────────────────────────────
function preload(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

// ──────────────────────────────────────────────
// SET INITIAL STATE (no animation, just paint)
// ──────────────────────────────────────────────
function initSlide() {
  const slide = SLIDES[current];
  bgA.style.backgroundImage = `url('${slide.src}')`;
  imgA.src                  = slide.src;
  bgA.style.opacity         = '1';
  bgB.style.opacity         = '0';
  imgA.style.opacity        = '1';
  imgB.style.opacity        = '0';
}

// ──────────────────────────────────────────────
// TRANSITION TO NEXT SLIDE
// Both background and central image swap together
// ──────────────────────────────────────────────
function nextSlide() {
  if (isAnimating) return;
  isAnimating = true;

  const nextIndex = (current + 1) % SLIDES.length;
  const nextSrc   = SLIDES[nextIndex].src;

  if (isSlotA) {
    bgB.style.backgroundImage = `url('${nextSrc}')`;
    imgB.src                  = nextSrc;
    void imgB.offsetWidth;
    bgA.style.opacity  = '0';
    bgB.style.opacity  = '1';
    imgA.style.opacity = '0';
    imgB.style.opacity = '1';
  } else {
    bgA.style.backgroundImage = `url('${nextSrc}')`;
    imgA.src                  = nextSrc;
    void imgA.offsetWidth;
    bgB.style.opacity  = '0';
    bgA.style.opacity  = '1';
    imgB.style.opacity = '0';
    imgA.style.opacity = '1';
  }

  setTimeout(() => {
    isSlotA     = !isSlotA;
    current     = nextIndex;
    isAnimating = false;
  }, FADE_DURATION);
}

// ──────────────────────────────────────────────
// BOOT
// ──────────────────────────────────────────────
(function init() {
  initSlide();
  setInterval(nextSlide, INTERVAL_MS);
})();
