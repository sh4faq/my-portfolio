/* ============================================================
   site.js
   Minimal interactions for the mono-minimal redesign:
   - Subtle scroll-reveal on the hero and sections (IntersectionObserver)
   - Terminal Easter egg toggle (press '/' or '`' to open, Esc to close)
   ============================================================ */

(function () {
  'use strict';

  // Tell the stylesheet JS is on so it can hide sections for reveal.
  // Without this class, every section is fully visible by default
  // (no scroll-reveal animation, but content is never blank).
  document.documentElement.classList.add('js-ready');

  // ----------------------------------------------------------
  // 1. Scroll-reveal
  // ----------------------------------------------------------
  const revealEls = document.querySelectorAll('.section');

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ----------------------------------------------------------
  // 2. Terminal Easter egg
  // ----------------------------------------------------------
  const overlay = document.getElementById('terminal-overlay');
  const termInput = document.getElementById('terminal-input');
  const closeBtn = document.getElementById('terminal-close');

  if (!overlay || !termInput) return;

  let isOpen = false;

  function openTerminal() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    isOpen = true;
    // Wait for the slide-up to start before focusing,
    // otherwise the page jumps to the input.
    requestAnimationFrame(() => {
      setTimeout(() => termInput.focus(), 120);
    });
  }

  function closeTerminal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    isOpen = false;
    termInput.blur();
  }

  function toggleTerminal() {
    if (isOpen) closeTerminal();
    else openTerminal();
  }

  closeBtn?.addEventListener('click', closeTerminal);

  document.addEventListener('keydown', (e) => {
    const target = e.target;
    const isTyping =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);

    // Esc closes the terminal even when typing inside it
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closeTerminal();
      return;
    }

    if (isTyping) return;

    // '/' or '`' opens (or toggles) the terminal
    if (e.key === '/' || e.key === '`' || e.key === '~') {
      e.preventDefault();
      toggleTerminal();
    }
  });

  // Clicking the dark overlay (not the frame) closes the terminal.
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeTerminal();
  });

  // ----------------------------------------------------------
  // 3. Lightbox for project media
  // ----------------------------------------------------------
  const lightbox = document.getElementById('lightbox');
  const lightboxStage = document.getElementById('lightbox-stage');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const mediaButtons = document.querySelectorAll('.entry-media');

  if (!lightbox || !lightboxStage) return;

  let lightboxOpen = false;
  let activeLightboxMedia = null;

  function openLightbox(src, type, caption) {
    // Clear previous stage content (and stop any playing video).
    while (lightboxStage.firstChild) {
      lightboxStage.removeChild(lightboxStage.firstChild);
    }

    if (type === 'video') {
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.muted = false;
      video.playsInline = true;
      lightboxStage.appendChild(video);
      activeLightboxMedia = video;
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = caption || '';
      lightboxStage.appendChild(img);
      activeLightboxMedia = img;
    }

    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxOpen = true;
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxOpen = false;

    // Stop video playback in lightbox before clearing,
    // and tear down after the transition so the close animation looks clean.
    if (activeLightboxMedia && activeLightboxMedia.tagName === 'VIDEO') {
      try { activeLightboxMedia.pause(); } catch (_) { /* noop */ }
    }
    setTimeout(() => {
      while (lightboxStage.firstChild) {
        lightboxStage.removeChild(lightboxStage.firstChild);
      }
      activeLightboxMedia = null;
    }, 320);
  }

  mediaButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.mediaSrc;
      const type = btn.dataset.mediaType || 'video';
      const caption = btn.dataset.caption || '';
      if (src) openLightbox(src, type, caption);
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);

  // Backdrop click closes the lightbox.
  lightbox.addEventListener('click', (e) => {
    if (
      e.target === lightbox ||
      e.target.hasAttribute('data-lightbox-close')
    ) {
      closeLightbox();
    }
  });

  // Esc key closes lightbox first if open, otherwise terminal.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxOpen) {
      e.preventDefault();
      closeLightbox();
    }
  });
})();
