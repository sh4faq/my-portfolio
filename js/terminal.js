// Interactive Terminal
(function () {
    const output = document.getElementById('terminal-output');
    const input = document.getElementById('terminal-input');
    if (!output || !input) return;

    const history = [];
    let historyIndex = -1;

    // Project data for terminal
    const projects = [
        'MCP-Kali-Server', 'Burp Suite Automation API', 'Bug Bounty Hunting',
        'Flash MMO Protocol RE', 'Game Asset RE Toolkit', 'Full-Stack Merchant System',
        'Yonkers Car Wash', 'Wholesome Habits', 'HackTheBox Labs', 'CodePath Blue Team',
        'Gesture-Based Fruit Ninja', 'Point Cloud Hand Destruction'
    ];

    const commands = {
        help: () => [
            '<span class="terminal-output-text">Available commands:</span>',
            '',
            '  <span class="cmd-highlight">about</span>        — Who I am',
            '  <span class="cmd-highlight">skills</span>       — Technical skills',
            '  <span class="cmd-highlight">projects</span>     — View my work',
            '  <span class="cmd-highlight">experience</span>   — Work history',
            '  <span class="cmd-highlight">education</span>    — Academic background',
            '  <span class="cmd-highlight">certs</span>        — Certifications',
            '  <span class="cmd-highlight">contact</span>      — Get in touch',
            '  <span class="cmd-highlight">resume</span>       — Download my resume',
            '  <span class="cmd-highlight">clear</span>        — Clear terminal',
            '  <span class="cmd-highlight">whoami</span>       — Who are you?',
            '  <span class="cmd-highlight">ls</span>           — List sections',
            '  <span class="cmd-highlight">cd &lt;section&gt;</span> — Navigate to section',
        ],

        about: () => [
            '<span class="terminal-success">Hamzeh Emreish</span>',
            '',
            'Security Researcher & Full-Stack Developer based in New York.',
            'CompTIA Security+ certified. CS student at CUNY Lehman College.',
            '',
            'I build secure systems, hunt vulnerabilities, and contribute',
            'to open-source security tools. Currently active on HackerOne',
            'and Bugcrowd with triaged findings across multiple programs.',
        ],

        skills: () => [
            '<span class="terminal-success">Technical Skills</span>',
            '',
            '  <span class="cmd-highlight">[Offensive]</span>  Burp Suite, Metasploit, SQLMap, Hydra, Nikto',
            '  <span class="cmd-highlight">[Recon]</span>      subfinder, httpx, nuclei, gobuster, shodan',
            '  <span class="cmd-highlight">[Defense]</span>    Splunk, SNORT, Auditd, NGINX/Amplify',
            '  <span class="cmd-highlight">[Code]</span>       Python, JavaScript, Bash, Java, React',
            '  <span class="cmd-highlight">[RE]</span>         Ghidra, Cheat Engine, Protocol Analysis',
            '  <span class="cmd-highlight">[Infra]</span>      Docker, Proxmox, VMware, Hyper-V',
            '  <span class="cmd-highlight">[Web]</span>        React, Node.js, Express, PostgreSQL',
        ],

        projects: () => {
            const lines = ['<span class="terminal-success">Projects</span>', ''];
            projects.forEach((name, i) => {
                lines.push(`  <span class="cmd-highlight">[${i}]</span> ${name}`);
            });
            lines.push('', 'Type <span class="cmd-highlight">project &lt;number&gt;</span> for details.');
            return lines;
        },

        experience: () => [
            '<span class="terminal-success">Experience</span>',
            '',
            '  <span class="cmd-highlight">Yonkers Car Wash</span> — Website & Management System (2025–Present)',
            '  <span class="cmd-highlight">Equinox</span> — Manager on Duty (2023–Present)',
            '  <span class="cmd-highlight">Central Deli</span> — Co-Owner (2023–2025)',
            '  <span class="cmd-highlight">Bug Bounty</span> — HackerOne / Bugcrowd (2024–Present)',
            '',
            'Scroll down or type <span class="cmd-highlight">cd experience</span> to see full details.',
        ],

        education: () => [
            '<span class="terminal-success">Education</span>',
            '',
            '  <span class="cmd-highlight">CUNY Lehman College</span>',
            '  B.S. Computer Science | GPA: 3.4 | Expected May 2026',
            '',
            '  <span class="cmd-highlight">Self-Directed Cybersecurity</span>',
            '  CTFs, HackTheBox, bug bounties, PortSwigger Academy (2022–Present)',
        ],

        certs: () => [
            '<span class="terminal-success">Certifications</span>',
            '',
            '  ✓ CompTIA Security+ SY0-701 — July 2024',
            '  ✓ Google Cybersecurity Certificate — August 2024',
            '  ✓ CodePath Intermediate Cyber & Python — October 2024',
        ],

        contact: () => [
            '<span class="terminal-success">Contact</span>',
            '',
            '  <span class="cmd-highlight">LinkedIn</span>  <a href="https://www.linkedin.com/in/hamzeh-emreish" target="_blank" class="terminal-link">linkedin.com/in/hamzeh-emreish</a>',
            '  <span class="cmd-highlight">GitHub</span>    <a href="https://github.com/sh4faq" target="_blank" class="terminal-link">github.com/sh4faq</a>',
        ],

        resume: () => {
            const link = document.createElement('a');
            link.href = 'Hamzeh_Emreish_Resume.pdf';
            link.download = 'Hamzeh_Emreish_Resume.pdf';
            link.click();
            return ['<span class="terminal-success">Downloading resume...</span>'];
        },

        clear: () => {
            output.innerHTML = '';
            return [];
        },

        whoami: () => ['<span class="terminal-output-text">visitor — but feel free to explore.</span>'],

        ls: () => [
            '<span class="terminal-output-text">drwxr-xr-x  projects/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  skills/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  experience/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  education/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  certifications/</span>',
            '<span class="terminal-output-text">drwxr-xr-x  contact/</span>',
        ],

        exit: () => ['<span class="terminal-output-text">Nice try. There is no escape.</span>'],
    };

    // Project details for "project <n>"
    const projectDetails = [
        { title: 'MCP-Kali-Server', desc: 'AI-powered pentesting framework. Added 12 recon tools, SSH sessions, reverse shells. PR #5 merged.', tech: 'Python, Flask, Docker, Git' },
        { title: 'Burp Suite Automation API', desc: 'REST API extension for Burp Suite. Automates scans and enables AI tool integration.', tech: 'Python, Jython, Burp Suite, Flask' },
        { title: 'Bug Bounty Hunting', desc: 'Active on HackerOne & Bugcrowd. Triaged findings: mail relay (Medium), hardcoded API creds (High), user enumeration (High).', tech: 'Burp Suite, Recon tools' },
        { title: 'Flash MMO Protocol RE', desc: 'Reverse-engineered SmartFoxServer protocol, decompiled SWF/DLLs, found client-side anti-cheat bypass.', tech: 'Wireshark, Ghidra, Cheat Engine, JPEXS' },
        { title: 'Game Asset RE Toolkit', desc: 'Reverse-engineered VXL/HVA/MIX formats for Red Alert 2 modding. Built Blender exporter addon.', tech: 'Python, Blender API, Hex Editing' },
        { title: 'Full-Stack Merchant System', desc: 'PERN stack CRUD app with search, sort, dark mode. Deployed on Vercel + Railway.', tech: 'React, Node.js, Express, PostgreSQL' },
        { title: 'Yonkers Car Wash', desc: 'Full website & CRM. VIP signup wizard, membership management, Netlify Forms, remote monitoring.', tech: 'HTML/CSS/JS, Netlify, Responsive Design' },
        { title: 'Wholesome Habits', desc: 'Nutrition consulting site. Glassmorphism UI, 3D tilt effects, booking flows.', tech: 'React, JavaScript ES6+, CSS3' },
        { title: 'HackTheBox Labs', desc: 'Completed numerous labs focused on ethical hacking and bug bounty methodologies.', tech: 'Pentesting, CTF, Linux' },
        { title: 'CodePath Blue Team', desc: 'Infrastructure hardening: NGINX rate-limiting, SNORT IDS, Auditd, Splunk log analysis.', tech: 'NGINX, SNORT, Splunk, Wireshark' },
    ];

    function handleCommand(cmd) {
        const trimmed = cmd.trim().toLowerCase();
        const parts = trimmed.split(/\s+/);
        const base = parts[0];

        // Echo the command
        addLine(`<span class="terminal-prompt-text">visitor@hamzeh.dev:~$</span> <span class="terminal-cmd-text">${escapeHtml(cmd)}</span>`);

        if (!base) return;

        // cd <section>
        if (base === 'cd' && parts[1]) {
            const sectionMap = {
                projects: 'projects', skills: 'skills', experience: 'experience',
                education: 'education', certifications: 'certifications', contact: 'contact',
                home: 'hero', terminal: 'hero',
            };
            const target = sectionMap[parts[1]];
            if (target) {
                const el = document.getElementById(target);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                addLine(`<span class="terminal-success">Navigating to ${parts[1]}...</span>`);
            } else {
                addLine(`<span class="terminal-error">cd: no such directory: ${escapeHtml(parts[1])}</span>`);
            }
            return;
        }

        // sudo hire hamzeh
        if (trimmed === 'sudo hire hamzeh') {
            addLine('<span class="terminal-success">Permission granted. Sending offer letter... 📨</span>');
            return;
        }

        // project <n>
        if (base === 'project' && parts[1] !== undefined) {
            const idx = parseInt(parts[1], 10);
            if (idx >= 0 && idx < projectDetails.length) {
                const p = projectDetails[idx];
                const lines = [
                    `<span class="terminal-success">${p.title}</span>`,
                    '',
                    `  ${p.desc}`,
                    '',
                    `  <span class="cmd-highlight">Tech:</span> ${p.tech}`,
                ];
                lines.forEach((l) => addLine(l));
            } else {
                addLine(`<span class="terminal-error">project: index out of range (0-${projectDetails.length - 1})</span>`);
            }
            return;
        }

        // Known commands
        if (commands[base]) {
            const result = commands[base]();
            result.forEach((line) => addLine(line));
            return;
        }

        // Unknown
        addLine(`<span class="terminal-error">command not found: ${escapeHtml(base)}. Type 'help' for available commands.</span>`);
    }

    function addLine(html) {
        const div = document.createElement('div');
        div.className = 'terminal-line';
        div.innerHTML = html;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    // Input handling
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value;
            if (cmd.trim()) {
                history.push(cmd);
                historyIndex = history.length;
            }
            handleCommand(cmd);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = history[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                historyIndex++;
                input.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                input.value = '';
            }
        }
    });

    // Click anywhere on terminal focuses input
    document.querySelector('.terminal').addEventListener('click', () => {
        input.focus();
    });

    // Mobile auto-demo
    if ('ontouchstart' in window && window.innerWidth < 768) {
        const demoCmds = ['help', 'about', 'projects'];
        let i = 0;
        function runDemo() {
            if (i >= demoCmds.length) return;
            handleCommand(demoCmds[i]);
            i++;
            setTimeout(runDemo, 2000);
        }
        setTimeout(runDemo, 1500);
    }
})();
