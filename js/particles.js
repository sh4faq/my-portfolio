// Three.js Dot Particle Background
(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.position.z = 30;

    // Determine particle count based on device
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const particleCount = isLowEnd ? 60 : isMobile ? 80 : 150;
    const connectionDistance = isMobile ? 7 : 10;

    // Colors from design system
    const colors = [0x3b82f6, 0x06b6d4, 0x8b5cf6];

    // Build a single Points cloud — use grid jitter for even coverage
    const positions = new Float32Array(particleCount * 3);
    const colorsArr = new Float32Array(particleCount * 3);
    const velocities = [];

    // Calculate grid dimensions for even spacing
    const spreadX = 60;
    const spreadY = 60;
    const spreadZ = 20;
    const cols = Math.ceil(Math.cbrt(particleCount * (spreadX / spreadY)));
    const rows = Math.ceil(particleCount / cols);
    const cellW = spreadX / cols;
    const cellH = spreadY / rows;

    for (let i = 0; i < particleCount; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        // Place at grid cell center + random jitter within cell
        positions[i * 3]     = -spreadX / 2 + col * cellW + (Math.random() * cellW);
        positions[i * 3 + 1] = -spreadY / 2 + row * cellH + (Math.random() * cellH);
        positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ;

        const c = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
        colorsArr[i * 3]     = c.r;
        colorsArr[i * 3 + 1] = c.g;
        colorsArr[i * 3 + 2] = c.b;

        velocities.push(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.01
        );
    }

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeo.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));

    const pointsMat = new THREE.PointsMaterial({
        size: isMobile ? 0.12 : 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
    });

    const points = new THREE.Points(pointsGeo, pointsMat);
    const group = new THREE.Group();
    group.add(points);
    scene.add(group);

    // Connection lines
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.06,
    });

    let linesGeometry = new THREE.BufferGeometry();
    let lines = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(lines);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Scroll parallax
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Animation visibility
    let isVisible = true;
    const observer = new IntersectionObserver(
        (entries) => {
            isVisible = entries[0].isIntersecting;
        },
        { threshold: 0 }
    );
    observer.observe(canvas);

    function updateConnections() {
        const pos = pointsGeo.attributes.position.array;
        const linePositions = [];
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dx = pos[i * 3] - pos[j * 3];
                const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist < connectionDistance) {
                    linePositions.push(
                        pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
                        pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
                    );
                }
            }
        }

        scene.remove(lines);
        linesGeometry.dispose();
        linesGeometry = new THREE.BufferGeometry();
        if (linePositions.length > 0) {
            linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        }
        lines = new THREE.LineSegments(linesGeometry, linesMaterial);
        scene.add(lines);
    }

    let frameCount = 0;

    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;

        frameCount++;

        const pos = pointsGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3]     += velocities[i * 3];
            pos[i * 3 + 1] += velocities[i * 3 + 1];
            pos[i * 3 + 2] += velocities[i * 3 + 2];

            // Wrap around boundaries
            if (pos[i * 3] > 30) pos[i * 3] = -30;
            if (pos[i * 3] < -30) pos[i * 3] = 30;
            if (pos[i * 3 + 1] > 30) pos[i * 3 + 1] = -30;
            if (pos[i * 3 + 1] < -30) pos[i * 3 + 1] = 30;
        }
        pointsGeo.attributes.position.needsUpdate = true;

        // Update connections every 3 frames for performance
        if (frameCount % 3 === 0) {
            updateConnections();
        }

        // Smooth camera parallax
        camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;

        // Scroll parallax
        group.position.y += (scrollY * 0.01 - group.position.y) * 0.05;

        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();
