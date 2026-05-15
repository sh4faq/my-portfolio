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
})();
