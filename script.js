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
  {
    // Placeholder 1 — abstract warm tones
    src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=900&q=80',
    caption: 'Pie de foto'
  },
  {
    // Placeholder 2 — blue/green painterly
    src: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=900&q=80',
    caption: 'Pie de foto'
  },
  {
    // Placeholder 3 — textured warm abstract
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
    caption: 'Pie de foto'
  },
  {
    // Placeholder 4 — cool geometric
    src: 'https://images.unsplash.com/photo-1567359781514-81173b801d98?w=900&q=80',
    caption: 'Pie de foto'
  },
  {
    // Placeholder 5 — organic color field
    src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&q=80',
    caption: 'Pie de foto'
  },
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
  bgA.style.backgroundImage  = `url('${slide.src}')`;
  imgA.src                   = slide.src;
  bgA.style.opacity          = '1';
  bgB.style.opacity          = '0';
  imgA.style.opacity         = '1';
  imgB.style.opacity         = '0';
  caption.textContent        = slide.caption;
}

// ──────────────────────────────────────────────
// TRANSITION TO NEXT SLIDE
// Both background and central image swap together
// ──────────────────────────────────────────────
async function nextSlide() {
  if (isAnimating) return;
  isAnimating = true;

  const nextIndex = (current + 1) % SLIDES.length;
  const nextSrc   = SLIDES[nextIndex].src;

  // Preload the next image so the swap is crisp
  await preload(nextSrc);

  if (isSlotA) {
    // A is visible → load next into B, then crossfade B in
    bgB.style.backgroundImage = `url('${nextSrc}')`;
    imgB.src                  = nextSrc;

    // Trigger reflow so the opacity transition fires
    void imgB.offsetWidth;

    bgA.style.opacity = '0';
    bgB.style.opacity = '1';
    imgA.style.opacity = '0';
    imgB.style.opacity = '1';
  } else {
    // B is visible → load next into A, then crossfade A in
    bgA.style.backgroundImage = `url('${nextSrc}')`;
    imgA.src                  = nextSrc;

    void imgA.offsetWidth;

    bgB.style.opacity = '0';
    bgA.style.opacity = '1';
    imgB.style.opacity = '0';
    imgA.style.opacity = '1';
  }

  // Update caption after a short delay (mid-fade feels natural)
  setTimeout(() => {
    caption.textContent = SLIDES[nextIndex].caption;
  }, FADE_DURATION * 0.45);

  // Wait for fade to finish
  await new Promise(r => setTimeout(r, FADE_DURATION));

  // Flip state
  isSlotA  = !isSlotA;
  current  = nextIndex;
  isAnimating = false;
}

// ──────────────────────────────────────────────
// BOOT
// ──────────────────────────────────────────────
(function init() {
  initSlide();

  // Preload the second image immediately so first swap is instant
  if (SLIDES.length > 1) preload(SLIDES[1].src);

  // Start the slideshow loop
  setInterval(nextSlide, INTERVAL_MS);
})();
