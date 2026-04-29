/* ============================================================
   EDITORIAL — interactions
   ============================================================ */
(function () {
    'use strict';

    // --------------------------------------------------------
    // Masthead clock — local time (looks more "filed at" than UTC)
    // --------------------------------------------------------
    const clockEl = document.getElementById('masthead-clock');
    if (clockEl) {
        const tick = () => {
            const d = new Date();
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            clockEl.textContent = `${hh}:${mm}`;
        };
        tick();
        setInterval(tick, 30 * 1000);
    }

    // --------------------------------------------------------
    // Margin-index active link tracker
    // --------------------------------------------------------
    const sections = Array.from(document.querySelectorAll('main > section[id]'));
    const miLinks = Array.from(document.querySelectorAll('.mi-link'));

    function setActiveSection(id) {
        miLinks.forEach((l) => {
            l.classList.toggle('active', l.dataset.section === id);
        });
    }

    if (sections.length) {
        const ioActive = new IntersectionObserver(
            (entries) => {
                // Pick the entry whose top is closest to 30% of viewport
                let best = null;
                let bestDist = Infinity;
                entries.forEach((e) => {
                    if (!e.isIntersecting) return;
                    const dist = Math.abs(e.boundingClientRect.top - window.innerHeight * 0.25);
                    if (dist < bestDist) { bestDist = dist; best = e.target; }
                });
                if (best) setActiveSection(best.id);
            },
            { threshold: [0, 0.15, 0.4, 0.7], rootMargin: '-10% 0px -50% 0px' }
        );
        sections.forEach((s) => ioActive.observe(s));
    }

    // --------------------------------------------------------
    // Lazy video playback — never load+play more than what's visible.
    // Without this, autoplaying 7 videos simultaneously freezes the renderer.
    // --------------------------------------------------------
    const videos = document.querySelectorAll('video');
    if (videos.length) {
        const videoIO = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    const v = e.target;
                    if (e.isIntersecting) {
                        if (v.preload === 'none') {
                            v.preload = 'auto';
                            try { v.load(); } catch {}
                        }
                        const p = v.play();
                        if (p && p.catch) p.catch(() => {});
                    } else {
                        v.pause();
                    }
                });
            },
            { rootMargin: '120px 0px', threshold: 0.1 }
        );
        videos.forEach((v) => videoIO.observe(v));
    }

    // --------------------------------------------------------
    // Fade-up on scroll — every article-head, feature, credit-row, cv-item, lite-card
    // --------------------------------------------------------
    // Apply via JS too (covers any dynamically added) but CSS pre-applies it as well
    const fadeTargets = document.querySelectorAll(
        '.article-head, .feature, .credit-row, .cv-item, .lite-card, .more-card, .reach-link'
    );

    const ioFade = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('in-view');
                    ioFade.unobserve(e.target);
                }
            });
        },
        { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    );
    fadeTargets.forEach((el) => ioFade.observe(el));

    // Pre-reveal anything already inside the viewport on first paint so the
    // first screen never has invisible content waiting on IO.
    requestAnimationFrame(() => {
        fadeTargets.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
                el.classList.add('in-view');
                ioFade.unobserve(el);
            }
        });
    });

    // --------------------------------------------------------
    // Signature: invert-flash on margin-index navigation
    // Click a section in the index → page briefly inverts to dark,
    // scrolls to the section, then fades back to cream.
    // --------------------------------------------------------
    const flash = document.querySelector('.invert-flash');

    function flashTo(id) {
        const target = document.getElementById(id);
        if (!target || !flash) {
            const fallback = document.getElementById(id);
            if (fallback) fallback.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        // Fade dark in
        flash.classList.add('active');
        // After dark covers screen, jump scroll AND force-reveal destination
        // (so when the dark fades out, content is already visible — no IO lag)
        setTimeout(() => {
            target.scrollIntoView({ behavior: 'auto', block: 'start' });
            target.querySelectorAll(
                '.article-head, .feature, .credit-row, .cv-item, .lite-card, .more-card, .reach-link'
            ).forEach((el) => el.classList.add('in-view'));
            setTimeout(() => {
                flash.classList.remove('active');
            }, 280);
        }, 360);
    }

    miLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            flashTo(link.dataset.section);
            setActiveSection(link.dataset.section);
        });
    });

    // Logo also triggers flash to cover
    const logo = document.querySelector('.masthead-logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            flashTo('hero');
        });
    }

    // --------------------------------------------------------
    // Lightbox — click any feature image/video or the portrait to magnify.
    // Clones the media into the lightbox so the source keeps playing in place
    // when the lightbox closes.
    // --------------------------------------------------------
    const lightbox = document.getElementById('lightbox');
    const lightboxFrame = document.getElementById('lightbox-frame');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    function captionFor(el) {
        const feature = el.closest('.feature');
        if (feature) {
            const t = feature.querySelector('.feature-title');
            if (t) return t.textContent.trim();
        }
        if (el.closest('.portrait')) return 'Hamzeh, photographed in NYC.';
        return el.alt || '';
    }

    function openLightbox(el) {
        if (!lightbox) return;
        let clone;
        if (el.tagName === 'VIDEO') {
            const sourceSrc = el.querySelector('source')?.src || el.src;
            clone = document.createElement('video');
            clone.src = sourceSrc;
            clone.controls = true;
            clone.loop = true;
            clone.muted = true;
            clone.autoplay = true;
            clone.playsInline = true;
            clone.currentTime = el.currentTime || 0;
            // Pause the inline source so audio/sync doesn't double up
            try { el.pause(); } catch {}
        } else {
            clone = document.createElement('img');
            clone.src = el.currentSrc || el.src;
            clone.alt = el.alt || '';
        }
        lightboxFrame.innerHTML = '';
        lightboxFrame.appendChild(clone);
        lightboxCaption.textContent = captionFor(el);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => {
            const v = lightboxFrame.querySelector('video');
            if (v) try { v.pause(); v.src = ''; } catch {}
            lightboxFrame.innerHTML = '';
            lightboxCaption.textContent = '';
        }, 360);
    }

    if (lightbox) {
        document.querySelectorAll(
            '.feature-media img, .feature-media video, .portrait img'
        ).forEach((el) => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                openLightbox(el);
            });
        });

        lightboxClose?.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            // Click on backdrop (not on the frame or its contents) closes
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                closeLightbox();
            }
        });
    }

    // --------------------------------------------------------
    // Copy-to-clipboard + toast
    // --------------------------------------------------------
    const toast = document.getElementById('toast');
    let toastTimer = null;
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    document.querySelectorAll('[data-copy]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const text = btn.dataset.copy;
            const label = btn.dataset.copyLabel || 'text';
            try {
                await navigator.clipboard.writeText(text);
                showToast(`✓ Copied ${label}`);
            } catch {
                showToast('Press Ctrl+C to copy');
            }
        });
    });

    // --------------------------------------------------------
    // Project filters
    // --------------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const features = document.querySelectorAll('.feature');
    const moreCards = document.querySelectorAll('.more-card');

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            const apply = (el) => {
                if (filter === 'all') {
                    el.classList.remove('hidden');
                } else {
                    const cats = (el.dataset.category || '').split(' ');
                    el.classList.toggle('hidden', !cats.includes(filter));
                }
            };

            features.forEach(apply);
            moreCards.forEach(apply);
        });
    });

    // --------------------------------------------------------
    // Terminal — interactive, with section navigation that triggers flash
    // --------------------------------------------------------
    const output = document.getElementById('terminal-output');
    const input = document.getElementById('terminal-input');

    if (!output || !input) return;

    const history = [];
    let historyIdx = -1;

    const projects = [
        'MCP-Kali-Server', 'Burp Suite Automation API', 'Bug Bounty Hunting',
        'Flash MMO Protocol RE', 'Game Asset RE Toolkit', 'Full-Stack Merchant System',
        'Yonkers Car Wash', 'Wholesome Habits', 'HackTheBox Labs', 'CodePath Blue Team',
        'Fruit Ninja: Gesture Control', 'Point Cloud Hand Destruction'
    ];

    const projectDetails = [
        { title: 'MCP-Kali-Server', desc: 'AI pentesting framework — added 12 recon tools, SSH sessions, reverse shells. PR #5 merged.', tech: 'Python, Flask, Docker, Git' },
        { title: 'Burp Suite Automation API', desc: 'REST API extension for Burp. Automates scans and enables AI tool integration.', tech: 'Python, Jython, Burp Suite, Flask' },
        { title: 'Bug Bounty Hunting', desc: 'Active on HackerOne and Bugcrowd. Mail relay (Medium), hardcoded API creds (High), user enumeration (High).', tech: 'Burp Suite, Recon tools' },
        { title: 'Flash MMO Protocol RE', desc: 'Reverse-engineered SmartFoxServer protocol, decompiled SWF/DLLs, found anti-cheat bypass.', tech: 'Wireshark, Ghidra, Cheat Engine, JPEXS' },
        { title: 'Game Asset RE Toolkit', desc: 'Reverse-engineered VXL/HVA/MIX formats for Red Alert 2 modding. Built Blender exporter.', tech: 'Python, Blender API, Hex Editing' },
        { title: 'Full-Stack Merchant System', desc: 'PERN CRUD with search, sort, dark mode. Vercel + Railway.', tech: 'React, Node.js, Express, PostgreSQL' },
        { title: 'Yonkers Car Wash', desc: 'Full website + CRM. VIP signup wizard, membership, Netlify Forms, remote ICS monitoring.', tech: 'HTML/CSS/JS, Netlify, Tailscale' },
        { title: 'Wholesome Habits', desc: 'Nutrition consulting site. Glassmorphism, 3D tilt, booking flows.', tech: 'React, JS ES6+, CSS3' },
        { title: 'HackTheBox Labs', desc: 'Box exploitation, privesc, web vulns, network pivoting.', tech: 'Pentesting, CTF, Linux' },
        { title: 'CodePath Blue Team', desc: 'Infrastructure hardening: NGINX rate-limiting, SNORT IDS, Auditd, Splunk.', tech: 'NGINX, SNORT, Splunk, Wireshark' },
        { title: 'Fruit Ninja: Gesture Control', desc: 'Webcam-controlled Fruit Ninja with fish-tank VR via off-axis projection. 5,000+ lines of JS.', tech: 'JavaScript, Three.js, MediaPipe' },
        { title: 'Point Cloud Hand Destruction', desc: 'TouchDesigner point cloud destroyed by hand gestures. MediaPipe + GLSL feedback.', tech: 'TouchDesigner, MediaPipe, GLSL' },
    ];

    const sectionMap = {
        cover: 'hero', home: 'hero', terminal: 'hero',
        whoami: 'about', about: 'about',
        work: 'projects', projects: 'projects',
        tools: 'skills', skills: 'skills',
        career: 'experience', experience: 'experience',
        studies: 'education', education: 'education',
        credentials: 'certifications', certs: 'certifications',
        reach: 'contact', contact: 'contact',
    };

    const cmds = {
        help: () => [
            '<span class="terminal-output-text">Commands:</span>',
            '',
            '  <span class="cmd-highlight">about</span>        — Who I am',
            '  <span class="cmd-highlight">skills</span>       — Technical tools',
            '  <span class="cmd-highlight">projects</span>     — Selected work',
            '  <span class="cmd-highlight">experience</span>   — Career history',
            '  <span class="cmd-highlight">education</span>    — Studies',
            '  <span class="cmd-highlight">certs</span>        — Credentials',
            '  <span class="cmd-highlight">contact</span>      — Reach me',
            '  <span class="cmd-highlight">resume</span>       — Download résumé',
            '  <span class="cmd-highlight">cd &lt;section&gt;</span> — Navigate (cover, whoami, work, tools, career, studies, credentials, reach)',
            '  <span class="cmd-highlight">project &lt;n&gt;</span>  — Project details (0-11)',
            '  <span class="cmd-highlight">whoami</span>       — Who are you?',
            '  <span class="cmd-highlight">ls</span>           — List sections',
            '  <span class="cmd-highlight">clear</span>        — Clear terminal',
        ],
        about: () => [
            '<span class="terminal-success">Hamzeh Emreish</span>',
            '',
            'Security Researcher &amp; Full-Stack Developer based in New York.',
            'CompTIA Security+ certified. CS at CUNY Lehman, graduating May 2026.',
            '',
            'I build the things I need and break the things I want to understand.',
        ],
        skills: () => [
            '<span class="terminal-success">Tools of the Trade</span>',
            '',
            '  <span class="cmd-highlight">[offensive]</span>  Burp Suite, Metasploit, SQLMap, Hydra, Nikto',
            '  <span class="cmd-highlight">[recon]</span>      subfinder, httpx, nuclei, gobuster, shodan, ffuf',
            '  <span class="cmd-highlight">[defense]</span>    Splunk, SNORT, Auditd, NGINX/Amplify',
            '  <span class="cmd-highlight">[code]</span>       Python, JavaScript, Bash, Java, React',
            '  <span class="cmd-highlight">[re]</span>         Ghidra, Cheat Engine, JPEXS, Protocol Analysis',
            '  <span class="cmd-highlight">[infra]</span>      Docker, Proxmox, VMware, Hyper-V, Tailscale',
            '  <span class="cmd-highlight">[web]</span>        React, Node.js, Express, PostgreSQL',
        ],
        projects: () => {
            const lines = ['<span class="terminal-success">Selected Work</span>', ''];
            projects.forEach((n, i) => {
                lines.push(`  <span class="cmd-highlight">[${String(i).padStart(2, '0')}]</span> ${n}`);
            });
            lines.push('', 'Type <span class="cmd-highlight">project &lt;n&gt;</span> for details.');
            return lines;
        },
        experience: () => [
            '<span class="terminal-success">Career</span>',
            '',
            '  <span class="cmd-highlight">Yonkers Car Wash</span> — Website &amp; CRM (2025–Present)',
            '  <span class="cmd-highlight">Equinox</span> — Manager on Duty (2023–Present)',
            '  <span class="cmd-highlight">Central Deli</span> — Co-Owner (2023–2025)',
            '  <span class="cmd-highlight">Bug Bounty</span> — HackerOne / Bugcrowd (2024–Present)',
        ],
        education: () => [
            '<span class="terminal-success">Studies</span>',
            '',
            '  <span class="cmd-highlight">CUNY Lehman</span>  B.S. CS · GPA 3.4 · May 2026',
            '  <span class="cmd-highlight">SUNY WCC</span>     Computer Programming · 2 years',
            '  <span class="cmd-highlight">Self-directed</span>  Cybersecurity · 2022–Present',
        ],
        certs: () => [
            '<span class="terminal-success">Credentials</span>',
            '',
            '  ✓ CompTIA Security+ SY0-701 — July 2024',
            '  ✓ Google Cybersecurity — August 2024',
            '  ✓ CodePath Cybersecurity — October 2024',
        ],
        contact: () => [
            '<span class="terminal-success">Reach</span>',
            '',
            '  <span class="cmd-highlight">email</span>     hamzehemriesh920@gmail.com',
            '  <span class="cmd-highlight">linkedin</span>  <a href="https://www.linkedin.com/in/hamzeh-emreish" target="_blank" class="terminal-link">linkedin.com/in/hamzeh-emreish</a>',
            '  <span class="cmd-highlight">github</span>    <a href="https://github.com/sh4faq" target="_blank" class="terminal-link">github.com/sh4faq</a>',
        ],
        resume: () => {
            const a = document.createElement('a');
            a.href = 'Hamzeh_Emreish_Resume.pdf';
            a.download = 'Hamzeh_Emreish_Resume.pdf';
            a.click();
            return ['<span class="terminal-success">Downloading résumé...</span>'];
        },
        whoami: () => ['<span class="terminal-output-text">visitor — feel free to look around.</span>'],
        ls: () => [
            '<span class="terminal-output-text">drwxr-xr-x  cover/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  whoami/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  work/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  tools/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  career/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  studies/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  credentials/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  reach/</span>',
        ],
        clear: () => { output.innerHTML = ''; return []; },
        exit: () => ['<span class="terminal-output-text">there is no escape.</span>'],
    };

    function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function addLine(html) {
        const div = document.createElement('div');
        div.className = 'terminal-line';
        div.innerHTML = html;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    function handle(raw) {
        const cmd = raw.trim().toLowerCase();
        addLine(`<span class="terminal-prompt-text">visitor@hamzeh.hack:~$</span> <span class="terminal-cmd-text">${escapeHtml(raw)}</span>`);
        if (!cmd) return;

        const parts = cmd.split(/\s+/);
        const base = parts[0];

        if (cmd === 'sudo hire hamzeh') {
            addLine('<span class="terminal-success">Permission granted. Sending offer letter...</span>');
            return;
        }

        if (base === 'cd' && parts[1]) {
            const sec = sectionMap[parts[1]];
            if (sec) {
                addLine(`<span class="terminal-success">→ ${parts[1]}</span>`);
                flashTo(sec);
                setActiveSection(sec);
            } else {
                addLine(`<span class="terminal-error">cd: no such section: ${escapeHtml(parts[1])}</span>`);
            }
            return;
        }

        if (base === 'project' && parts[1] !== undefined) {
            const i = parseInt(parts[1], 10);
            if (i >= 0 && i < projectDetails.length) {
                const p = projectDetails[i];
                addLine(`<span class="terminal-success">${p.title}</span>`);
                addLine('');
                addLine(`  ${p.desc}`);
                addLine('');
                addLine(`  <span class="cmd-highlight">tech:</span> ${p.tech}`);
            } else {
                addLine(`<span class="terminal-error">project: index out of range (0-${projectDetails.length - 1})</span>`);
            }
            return;
        }

        if (cmds[base]) {
            cmds[base]().forEach(addLine);
            return;
        }

        addLine(`<span class="terminal-error">command not found: ${escapeHtml(base)}. Type 'help'.</span>`);
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const v = input.value;
            if (v.trim()) {
                history.push(v);
                historyIdx = history.length;
            }
            handle(v);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIdx > 0) { historyIdx--; input.value = history[historyIdx]; }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIdx < history.length - 1) { historyIdx++; input.value = history[historyIdx]; }
            else { historyIdx = history.length; input.value = ''; }
        }
    });

    document.querySelector('.terminal').addEventListener('click', () => input.focus());
})();
