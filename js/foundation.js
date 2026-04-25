// Foundation: Smooth scroll, custom cursor, scroll progress
// Loads first so other modules can rely on window.__lenis, etc.
(function () {
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Smooth scroll: rely on CSS `scroll-behavior: smooth` for native performance.
    // (Lenis removed — its RAF interpolation loop was the main source of scroll lag.)

    // ==========================================
    // SCROLL PROGRESS BAR
    // ==========================================
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        let ticking = false;
        const updateProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });
        updateProgress();
    }

    // ==========================================
    // CUSTOM CURSOR — RAF-batched, no blend-mode compositing
    // ==========================================
    if (isDesktop) {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');

        if (dot && ring) {
            let mx = window.innerWidth / 2;
            let my = window.innerHeight / 2;
            let rx = mx;
            let ry = my;
            let dirty = false;

            // Capture position only — paint happens in RAF
            document.addEventListener('mousemove', (e) => {
                mx = e.clientX;
                my = e.clientY;
                dirty = true;
            }, { passive: true });

            // Single RAF for both dot (snappy) and ring (eased)
            function raf() {
                if (dirty) {
                    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
                    dirty = false;
                }
                rx += (mx - rx) * 0.22;
                ry += (my - ry) * 0.22;
                ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
                requestAnimationFrame(raf);
            }
            raf();

            // Hover state — use event delegation with throttled target check
            const hoverSelector = 'a, button, [role="button"], input, textarea, .skill-card, .project-card, .cert-card, .edu-card, .terminal, .filter-btn, .timeline-card, .contact-link';
            document.addEventListener('pointerover', (e) => {
                if (e.target.closest && e.target.closest(hoverSelector)) {
                    ring.classList.add('cursor-hover');
                    dot.classList.add('cursor-hover');
                }
            }, { passive: true });
            document.addEventListener('pointerout', (e) => {
                if (!e.relatedTarget || (e.target.closest(hoverSelector) && !e.relatedTarget.closest?.(hoverSelector))) {
                    ring.classList.remove('cursor-hover');
                    dot.classList.remove('cursor-hover');
                }
            }, { passive: true });

            // Fade on window leave
            document.addEventListener('mouseleave', () => {
                dot.style.opacity = '0';
                ring.style.opacity = '0';
            });
            document.addEventListener('mouseenter', () => {
                dot.style.opacity = '';
                ring.style.opacity = '';
            });
        }
    } else {
        // Remove cursor nodes entirely on touch — they just clutter the DOM
        document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(el => el.remove());
    }

    // ==========================================
    // MAGNETIC BUTTONS — attracts cursor within radius
    // ==========================================
    if (isDesktop && !prefersReducedMotion) {
        const magnetSelector = '.sidebar-resume-btn, .showcase-link-primary, .modal-link-primary, .filter-btn, .project-view-btn, .contact-link';
        document.querySelectorAll(magnetSelector).forEach((el) => {
            el.classList.add('magnetic');
            const strength = el.classList.contains('contact-link') ? 0.18 : 0.28;

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    // ==========================================
    // 3D TILT ON CARDS — mouse-tracking perspective (RAF-throttled)
    // ==========================================
    if (isDesktop && !prefersReducedMotion) {
        const tiltSelector = '.project-card, .edu-card, .cert-card, .timeline-card, .skill-card';
        document.querySelectorAll(tiltSelector).forEach((card) => {
            card.style.transformStyle = 'preserve-3d';
            let pending = false;
            let lastE = null;
            const onMove = () => {
                pending = false;
                if (!lastE || card.classList.contains('flipped')) return;
                const rect = card.getBoundingClientRect();
                const x = (lastE.clientX - rect.left) / rect.width - 0.5;
                const y = (lastE.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateZ(6px)`;
            };
            card.addEventListener('mousemove', (e) => {
                lastE = e;
                if (!pending) {
                    pending = true;
                    requestAnimationFrame(onMove);
                }
            });
            card.addEventListener('mouseleave', () => {
                lastE = null;
                card.style.transform = '';
            });
        });
    }
})();
