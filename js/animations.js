// GSAP Animations
(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance (called by main.js after loader hides)
    window.animateHero = function () {
        const tl = gsap.timeline();
        tl.from('.hero-title', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' })
          .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
          .from('.terminal-wrapper', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
          .from('.scroll-indicator', { opacity: 0, duration: 0.5 }, '-=0.2');
    };

    // Section titles
    gsap.utils.toArray('.section-title').forEach((title) => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
        });
    });

    // Section subtitles
    gsap.utils.toArray('.section-subtitle').forEach((el) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 20,
            opacity: 0,
            duration: 0.6,
            delay: 0.1,
            ease: 'power3.out',
        });
    });

    // Project cards — staggered
    ScrollTrigger.batch('.project-card', {
        onEnter: (batch) => {
            gsap.fromTo(batch, {
                y: 50,
                opacity: 0,
            }, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
            });
        },
        start: 'top 85%',
        once: true,
    });

    // Skill cards — staggered
    ScrollTrigger.batch('.skill-card', {
        onEnter: (batch) => {
            gsap.fromTo(batch, {
                y: 40,
                opacity: 0,
                scale: 0.9,
            }, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.5,
                stagger: 0.06,
                ease: 'back.out(1.2)',
            });
        },
        start: 'top 85%',
        once: true,
    });

    // Showcase rows — alternating slide-in
    gsap.utils.toArray('.showcase-row').forEach((row) => {
        const isReverse = row.classList.contains('showcase-row--reverse');
        gsap.fromTo(row, {
            x: isReverse ? 60 : -60,
            opacity: 0,
        }, {
            scrollTrigger: {
                trigger: row,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
        });
    });

    // Timeline items
    gsap.utils.toArray('.timeline-item.left').forEach((el) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            x: -60,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
        });
    });

    gsap.utils.toArray('.timeline-item.right').forEach((el) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            x: 60,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
        });
    });

    // Timeline line draw effect
    gsap.from('.timeline-line', {
        scrollTrigger: {
            trigger: '.timeline',
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1,
        },
        scaleY: 0,
        transformOrigin: 'top center',
    });

    // Education cards
    ScrollTrigger.batch('.edu-card', {
        onEnter: (batch) => {
            gsap.fromTo(batch, {
                y: 40,
                opacity: 0,
            }, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.15,
                ease: 'power3.out',
            });
        },
        start: 'top 85%',
        once: true,
    });

    // Cert cards — scale up
    ScrollTrigger.batch('.cert-card', {
        onEnter: (batch) => {
            gsap.fromTo(batch, {
                scale: 0.85,
                opacity: 0,
            }, {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.4)',
            });
        },
        start: 'top 85%',
        once: true,
    });

    // Contact links
    ScrollTrigger.batch('.contact-link', {
        onEnter: (batch) => {
            gsap.fromTo(batch, {
                x: -30,
                opacity: 0,
            }, {
                x: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power3.out',
            });
        },
        start: 'top 85%',
        once: true,
    });

    // ==========================================
    // HERO STATS — counters animate up from 0
    // ==========================================
    gsap.utils.toArray('.hero-stat-value').forEach((el) => {
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const counter = { v: 0 };
        gsap.to(counter, {
            v: target,
            duration: 1.8,
            ease: 'power2.out',
            delay: 1.6,
            scrollTrigger: {
                trigger: el,
                start: 'top 95%',
                toggleActions: 'play none none none',
            },
            onUpdate: () => {
                el.textContent = Math.floor(counter.v) + suffix;
            },
        });
    });

    // ==========================================
    // SECTION TITLE LETTER STAGGER (split + reveal)
    // ==========================================
    gsap.utils.toArray('.section-title').forEach((title) => {
        // Skip if already split
        if (title.dataset.split) return;
        const text = title.textContent;
        title.dataset.split = '1';
        title.innerHTML = text
            .split('')
            .map((ch) => ch === ' '
                ? '<span class="char char-space">&nbsp;</span>'
                : `<span class="char">${ch}</span>`
            )
            .join('');
        const chars = title.querySelectorAll('.char');
        gsap.from(chars, {
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            yPercent: 110,
            opacity: 0,
            duration: 0.6,
            stagger: 0.025,
            ease: 'power3.out',
        });
    });

    // ==========================================
    // HERO ENTRANCE — refined timeline with status, tagline, stats
    // ==========================================
    window.animateHero = function () {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('.hero-status', { y: -20, opacity: 0, duration: 0.6 })
          .from('.hero-title', { y: 50, opacity: 0, duration: 1 }, '-=0.2')
          .from('.hero-subtitle > *', { y: 20, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.55')
          .from('.hero-tagline', { y: 20, opacity: 0, duration: 0.7 }, '-=0.45')
          .from('.terminal-wrapper', { y: 40, opacity: 0, duration: 0.8 }, '-=0.4')
          .from('.hero-stats', { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
          .from('.scroll-indicator', { opacity: 0, duration: 0.5 }, '-=0.2');
    };
})();
