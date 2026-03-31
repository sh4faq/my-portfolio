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
})();
