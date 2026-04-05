/*
  GALLERY SITE JAVASCRIPT
  -----------------------
  This file controls:
  1. Smooth scroll for internal links with data-target
  2. Lightbox open/close for exhibition images

  You usually do not need to edit this file unless you want to change the interaction.
*/

// Smooth scroll for gallery items that point to sections below
document.querySelectorAll('[data-target]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const id = link.getAttribute('data-target');
    const target = document.getElementById(id);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Lightbox elements
const lightbox = document.getElementById('gallery-lightbox');
const lightboxImg = lightbox.querySelector('img');
const closeBtn = lightbox.querySelector('button');

// Open lightbox when clicking on an exhibition image
document.querySelectorAll('.image-post[data-full]').forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    lightboxImg.src = item.getAttribute('data-full');
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});

// Close lightbox helper
function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
}

// Close events
closeBtn.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});
