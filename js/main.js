// Main Application — Loader, Sidebar, Scroll Tracking, Modals, Filters
(function () {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ==========================================
    // LOADER — always dismiss, even if GSAP fails
    // ==========================================
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
                // If GSAP loaded, animate hero; otherwise content is already visible
                if (typeof window.animateHero === 'function') {
                    window.animateHero();
                }
            }, 1400);
        }
    });

    // Fallback: force-hide loader after 4s no matter what
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader && !loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
        }
    }, 4000);

    // ==========================================
    // SIDEBAR ACTIVE SECTION TRACKING
    // ==========================================
    const sections = document.querySelectorAll('.section');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const indicator = document.querySelector('.sidebar-indicator');

    // Position the traveling indicator on the active link
    function moveIndicator(activeLink) {
        if (!indicator || !activeLink) return;
        const li = activeLink.closest('li');
        if (!li) return;
        indicator.style.top = li.offsetTop + 'px';
        indicator.style.height = li.offsetHeight + 'px';
    }

    // Initial position after layout settles
    const firstActive = document.querySelector('.sidebar-link.active');
    setTimeout(() => { if (firstActive) moveIndicator(firstActive); }, 100);
    window.addEventListener('resize', () => {
        const current = document.querySelector('.sidebar-link.active');
        if (current) moveIndicator(current);
    });

    // Track which sections are visible, activate the topmost one
    const visibleSections = new Set();
    const sectionOrder = Array.from(sections).map((s) => s.id);

    const observer = new IntersectionObserver(
        (entries) => {
            if (clickedSection) return;
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleSections.add(entry.target.id);
                } else {
                    visibleSections.delete(entry.target.id);
                }
            });
            // Activate the topmost visible section (by DOM order)
            for (const id of sectionOrder) {
                if (visibleSections.has(id)) {
                    setActiveLink(id);
                    break;
                }
            }
        },
        { threshold: 0.05, rootMargin: '0px 0px -60% 0px' }
    );

    sections.forEach((section) => observer.observe(section));

    function setActiveLink(sectionId) {
        sidebarLinks.forEach((link) => {
            const isActive = link.dataset.section === sectionId;
            link.classList.toggle('active', isActive);
            if (isActive) moveIndicator(link);
        });
        mobileLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });
    }

    // Detect when user scrolls to the very bottom — activate contact
    window.addEventListener('scroll', () => {
        if (clickedSection) return;
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 10)) {
            setActiveLink('contact');
        }
    });

    // Smooth scroll for nav links — force active state on click
    let clickedSection = null;
    [...sidebarLinks, ...mobileLinks].forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            const target = document.getElementById(sectionId);
            if (target) {
                // Immediately set active to the clicked section
                clickedSection = sectionId;
                setActiveLink(sectionId);
                target.scrollIntoView({ behavior: 'smooth' });
                // Lock the active state for 2s to prevent observer override
                setTimeout(() => { clickedSection = null; }, 2000);
            }
        });
    });

    // ==========================================
    // PROJECT FILTERS
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const showcaseRows = document.querySelectorAll('.showcase-row');

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            projectCards.forEach((card) => {
                if (filter === 'all') {
                    card.classList.remove('hidden');
                } else {
                    const categories = card.dataset.category.split(' ');
                    card.classList.toggle('hidden', !categories.includes(filter));
                }
            });

            showcaseRows.forEach((row) => {
                if (filter === 'all') {
                    row.classList.remove('hidden');
                } else {
                    const categories = row.dataset.category.split(' ');
                    row.classList.toggle('hidden', !categories.includes(filter));
                }
            });
        });
    });

    // ==========================================
    // PROJECT MODAL
    // ==========================================
    const modalOverlay = document.getElementById('project-modal');
    const modalClose = document.querySelector('.modal-close');

    // Full project data for modals
    const projectData = [
        {
            tag: 'Open Source',
            title: 'MCP-Kali-Server',
            meta: '<strong>Original:</strong> <a href="https://github.com/TriV3/MCP-Kali-Server" target="_blank">github.com/TriV3/MCP-Kali-Server</a><br><strong>My PR:</strong> <a href="https://github.com/TriV3/MCP-Kali-Server/pull/5" target="_blank">PR #5 (Merged)</a>',
            description: 'Contributed to an open source pentesting tool that lets AI assistants run security scans. My PR added recon tools I actually use, plus SSH sessions and reverse shells. Got merged after maintainer review.',
            details: '<h4>What I Added</h4><ul><li>12 recon tools: Subfinder, Httpx, Nuclei, Arjun, Fierce, Byp4xx, Subzy, Assetfinder, Waybackurls, Shodan</li><li>SSH session management for persistent connections</li><li>Reverse shell support for post-exploitation</li><li>Installation guide (INSTALL_TOOLS.md) for Go tools</li><li>Fixed .github files that were accidentally deleted</li></ul>',
            tech: ['Python', 'Flask', 'Docker', 'Git'],
            video: 'pics/MCP-server.mp4',
            links: [{ label: 'View PR', url: 'https://github.com/TriV3/MCP-Kali-Server/pull/5', primary: true }],
        },
        {
            tag: 'Security',
            title: 'Burp Suite Automation API',
            meta: '<strong>Repository:</strong> <a href="https://github.com/sh4faq" target="_blank">github.com/sh4faq</a><br><strong>Type:</strong> Security Automation Tool',
            description: 'Got tired of clicking around Burp Suite manually, so I built an extension that exposes it as a REST API. Now I can script my scans and let AI tools interact with it directly.',
            details: '<h4>What It Does</h4><ul><li>Exposes Burp\'s proxy, scanner, and repeater through HTTP endpoints</li><li>Pull proxy history, send requests to repeater, run scans — all via API</li><li>Works with Claude and other AI tools for automated testing</li><li>Saves time on repetitive web app testing</li></ul>',
            tech: ['Python', 'Jython', 'Burp Suite', 'Flask'],
            video: 'pics/burp-api.mp4',
            links: [{ label: 'GitHub', url: 'https://github.com/sh4faq', primary: true }],
        },
        {
            tag: 'Security',
            title: 'Bug Bounty Hunting',
            meta: '<strong>Platforms:</strong> HackerOne, Bugcrowd<br><strong>Status:</strong> Active (Jan 2024 – Present)',
            description: 'Active bug bounty hunter with triaged findings across multiple programs. Focus on authentication bypasses, misconfigurations, and API security.',
            details: '<h4>Triaged Findings</h4><ul><li><strong>Mail Relay Vulnerability (Medium, Triaged Valid):</strong> Unauthenticated mail relay enabling email spoofing with valid DKIM/SPF signatures</li><li><strong>Hardcoded API Credentials (High, Duplicate):</strong> CWE-798 vulnerability exposing production endpoints</li><li><strong>Admin User Enumeration (High, Duplicate):</strong> User enumeration via Cognito ForgotPassword API response differences</li></ul>',
            tech: ['Burp Suite', 'Recon', 'API Testing'],
            video: null,
            links: [],
        },
        {
            tag: 'Reverse Engineering',
            title: 'Flash MMO Protocol RE',
            meta: '<strong>Type:</strong> Security Research / Reverse Engineering<br><strong>Date:</strong> Jan 2025',
            description: 'Analyzed a multiplayer Flash game\'s security architecture to understand client-server communication and identify vulnerabilities in legacy game systems.',
            details: '<h4>What I Did</h4><ul><li>Captured and analyzed network traffic with Wireshark — reverse-engineered SmartFoxServer XML/CDATA/JSON protocol</li><li>Used Cheat Engine for memory inspection and runtime analysis</li><li>Decompiled SWF files with JPEXS to extract ActionScript source</li><li>Analyzed DLLs in Ghidra for native code components</li><li>Identified client-side anti-cheat bypass using MD5 + hardcoded salt</li><li>Documented Electron + Pepper Flash architecture</li></ul>',
            tech: ['Wireshark', 'Ghidra', 'Cheat Engine', 'JPEXS', 'Protocol Analysis'],
            video: null,
            links: [],
        },
        {
            tag: 'Reverse Engineering',
            title: 'Game Asset RE Toolkit',
            meta: '<strong>Repository:</strong> <a href="https://github.com/sh4faq/MentalOmega-Modding-Guide" target="_blank">github.com/sh4faq/MentalOmega-Modding-Guide</a><br><strong>Type:</strong> RE / Game Modding',
            description: 'Wanted to add custom units to Red Alert 2 mods but the file formats weren\'t documented. Reverse-engineered them and wrote a Blender exporter.',
            details: '<h4>What I Did</h4><ul><li>Figured out VXL (voxel), HVA (animation), and MIX (archive) formats via hex dumps</li><li>Built a Blender addon that exports 3D models to VXL format</li><li>Wrote a modding guide for the community</li></ul>',
            tech: ['Python', 'Blender API', 'Hex Editing', 'Reverse Engineering'],
            video: null,
            links: [{ label: 'GitHub', url: 'https://github.com/sh4faq/MentalOmega-Modding-Guide', primary: true }],
        },
        {
            tag: 'Web Dev',
            title: 'Full-Stack Merchant System',
            meta: '<strong>Live Demo:</strong> <a href="https://full-stack-pern-app.vercel.app" target="_blank">full-stack-pern-app.vercel.app</a><br><strong>Type:</strong> Full-Stack CRUD Application',
            description: 'Simple CRUD app to manage merchant data. Built to learn the PERN stack and deploy end-to-end.',
            details: '<h4>How It Works</h4><ul><li>React frontend with search, sort, and dark mode</li><li>Express API handles all CRUD operations</li><li>PostgreSQL database hosted on Railway</li><li>Frontend on Vercel, backend on Railway</li></ul>',
            tech: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Vercel', 'Railway'],
            video: 'pics/merchant-system.mp4',
            links: [{ label: 'Live Demo', url: 'https://full-stack-pern-app.vercel.app', primary: true }],
        },
        {
            tag: 'Web Dev',
            title: 'Yonkers Car Wash',
            meta: '<strong>Live Site:</strong> <a href="https://yonkerscarwashdetail.com" target="_blank">yonkerscarwashdetail.com</a><br><strong>Client:</strong> Yonkers Car Wash (975 Midland Ave, Yonkers, NY)',
            description: 'Full website & CRM system for a car wash business. 4-step VIP signup wizard, membership management, animated hero, Netlify Forms integration.',
            details: '<h4>Key Features</h4><ul><li>4-Step VIP Signup Wizard with real-time pricing and receipt generation</li><li>Animated hero section with three-lane vertical photo carousel</li><li>Membership management with pre-populated signup forms</li><li>Netlify Forms for customer inquiries</li><li>Maintenance page with animated effects</li></ul><h4>Business Impact</h4><ul><li>Increased membership renewals by 35%</li><li>Reduced enrollment time by 60% (10+ min to ~4 min)</li><li>Mobile conversions increased by 45%</li></ul>',
            tech: ['HTML5/CSS3/JS', 'Netlify', 'Responsive Design', 'Custom Animations'],
            video: 'pics/yonkers-wash.mp4',
            links: [{ label: 'Live Site', url: 'https://yonkerscarwashdetail.com', primary: true }],
        },
        {
            tag: 'Web Dev',
            title: 'Wholesome Habits',
            meta: '<strong>Live Site:</strong> <a href="https://wholesome-habits-demo.com" target="_blank">wholesome-habits-demo.com</a><br><strong>Type:</strong> Full-Stack React Application',
            description: 'Holistic nutrition consulting site with Apple-inspired glassmorphism, 3D tilt interactions, cursor tracking, and scroll-responsive design.',
            details: '<h4>Key Features</h4><ul><li>Glass-morphism effects with 3D tilt interactions and cursor tracking</li><li>React SPA with dynamic section routing and smooth scroll nav</li><li>Client testimonials with 5-star ratings and FAQ accordion</li><li>Multi-channel contact system with consultation prep guide</li><li>Reduced-motion support, 44px touch targets, semantic HTML</li></ul><h4>Business Impact</h4><ul><li>Professional, conversion-focused design matching wellness brand standards</li><li>Responsive with excellent mobile experience</li><li>Enabled direct client acquisition through booking flows</li></ul>',
            tech: ['React', 'JavaScript ES6+', 'CSS3', 'Lucide Icons', 'Responsive Design'],
            video: 'pics/wholesome-habits.mp4',
            links: [{ label: 'Live Site', url: 'https://wholesome-habits-demo.com', primary: true }],
        },
        {
            tag: 'Security',
            title: 'HackTheBox Labs',
            meta: '<strong>Type:</strong> Ethical Hacking Practice',
            description: 'Completed numerous HackTheBox labs with a focus on ethical hacking and bug bounty methodologies.',
            details: '<h4>Focus Areas</h4><ul><li>Linux and Windows box exploitation</li><li>Privilege escalation techniques</li><li>Web application vulnerabilities</li><li>Network enumeration and pivoting</li></ul>',
            tech: ['Pentesting', 'CTF', 'Linux', 'Windows'],
            video: null,
            links: [],
        },
        {
            tag: 'Security',
            title: 'CodePath Blue Team',
            meta: '<strong>Date:</strong> October 2024<br><strong>Type:</strong> Infrastructure Hardening',
            description: 'Hardened web infrastructure by configuring NGINX with rate-limiting and Amplify monitoring. Deployed IDS using SNORT and Auditd.',
            details: '<h4>What I Did</h4><ul><li>Configured NGINX with rate-limiting and Amplify monitoring</li><li>Deployed host intrusion detection using SNORT and Auditd</li><li>Analyzed network logs to detect intrusions and identify IOCs with Splunk and Wireshark</li></ul>',
            tech: ['NGINX', 'SNORT', 'Auditd', 'Splunk', 'Wireshark'],
            video: null,
            links: [],
        },
        {
            tag: 'Creative Coding',
            title: 'Fruit Ninja: Gesture Control',
            meta: '<strong>Type:</strong> Interactive Web Game<br><strong>Stack:</strong> Vanilla JS + Three.js + MediaPipe',
            description: 'Full Fruit Ninja clone played with real hand gestures via webcam. Features fish-tank VR parallax using face tracking and off-axis 3D projection.',
            details: '<h4>Technical Highlights</h4><ul><li>MediaPipe hand tracking with fingertip slice detection and blade mode switching (1-finger vs 5-finger)</li><li>Face tracking with iris-based depth estimation for fish-tank VR parallax effect</li><li>Three.js off-axis (Kooima) projection with 6-layer depth system inside a 3D box</li><li>Canvas2D fruit rendering with photorealistic shading, juice splatter particles, and screen splash effects</li><li>Multi-chapter wave system with 8 fruit types, bombs, powerups (freeze/frenzy/double), and 3 game modes</li><li>5,000+ lines of vanilla JavaScript — no frameworks</li></ul>',
            tech: ['JavaScript', 'Three.js', 'MediaPipe', 'Canvas2D', 'Off-Axis Projection', 'Computer Vision'],
            video: 'pics/fruit-ninja.mp4',
            links: [],
        },
        {
            tag: 'Creative Coding',
            title: 'Point Cloud Hand Destruction',
            meta: '<strong>Type:</strong> Real-time Interactive Art<br><strong>Tool:</strong> TouchDesigner + MediaPipe',
            description: 'Real-time interactive 3D point cloud that explodes and reforms based on hand gestures. Built in TouchDesigner with MediaPipe hand tracking integration.',
            details: '<h4>How It Works</h4><ul><li>3D point cloud loaded and rendered with instanced geometry</li><li>MediaPipe hand tracking maps wrist position (0-1) to a threshold</li><li>Threshold sweeps across the point cloud, displacing particles with noise</li><li>Feedback loop holds the displaced shape for a persistent destruction effect</li><li>Color wave (red) sweeps through as the threshold passes</li><li>Second hand can control rotation of the point cloud</li></ul>',
            tech: ['TouchDesigner', 'MediaPipe', 'Point Clouds', 'GLSL', 'Real-time VFX'],
            video: 'pics/touchdesigner-pointcloud.mp4',
            links: [],
        },
    ];

    // Open modal
    projectCards.forEach((card) => {
        card.addEventListener('click', () => {
            const idx = parseInt(card.dataset.project, 10);
            const data = projectData[idx];
            if (!data) return;

            document.getElementById('modal-tag').textContent = data.tag;
            document.getElementById('modal-title').textContent = data.title;
            document.getElementById('modal-meta').innerHTML = data.meta;
            document.getElementById('modal-description').innerHTML = data.description;
            document.getElementById('modal-details').innerHTML = data.details;

            // Tech tags
            const techEl = document.getElementById('modal-tech');
            techEl.innerHTML = data.tech.map((t) => `<span>${t}</span>`).join('');

            // Video
            const videoEl = document.getElementById('modal-video');
            if (data.video) {
                videoEl.innerHTML = `<video controls playsinline><source src="${data.video}" type="video/mp4">Your browser does not support video.</video>`;
            } else {
                videoEl.innerHTML = '';
            }

            // Links
            const linksEl = document.getElementById('modal-links');
            if (data.links.length > 0) {
                linksEl.innerHTML = data.links
                    .map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="${l.primary ? 'modal-link-primary' : 'modal-link-secondary'}">${l.label}</a>`)
                    .join('');
            } else {
                linksEl.innerHTML = '';
            }

            modalOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
        // Stop any playing videos
        const video = modalOverlay.querySelector('video');
        if (video) video.pause();
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ==========================================
    // SKILL CARD FLIP
    // ==========================================
    document.querySelectorAll('.skill-card').forEach((card) => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // ==========================================
    // MEDIA LIGHTBOX
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxClose = document.querySelector('.lightbox-close');

    function openLightbox(el) {
        if (!lightbox) return;
        if (el.tagName === 'VIDEO') {
            const src = el.querySelector('source') ? el.querySelector('source').src : el.src;
            lightboxContent.innerHTML = `<video controls autoplay playsinline><source src="${src}" type="video/mp4"></video>`;
        } else if (el.tagName === 'IMG') {
            lightboxContent.innerHTML = `<img src="${el.src}" alt="${el.alt || ''}">`;
        }
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        const vid = lightboxContent.querySelector('video');
        if (vid) vid.pause();
        setTimeout(() => { lightboxContent.innerHTML = ''; }, 300);
    }

    // Click any showcase media to open lightbox
    document.querySelectorAll('.showcase-video video, .showcase-media img, .showcase-media--grid img, .showcase-media--grid video').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openLightbox(el);
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) closeLightbox();
    });
})();
