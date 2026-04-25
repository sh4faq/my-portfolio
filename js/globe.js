// 3D Interactive Wireframe Globe with Attack Arcs
// The signature hero element — security researcher portfolio.
// Replaces the old particle field. Full viewport, subtle parallax.
(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Cap DPR at 1.5 — cuts shader work ~44% vs DPR 2 with barely visible quality loss
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Globe params — leaner point count, still visually full
    const globeRadius = 5;
    const pointCount = isLowEnd ? 70 : isMobile ? 110 : 160;

    // ==========================================
    // WIREFRAME GLOBE (three layered shells)
    // ==========================================
    // Inner solid backing (darkens continents visually)
    const innerGeo = new THREE.SphereGeometry(globeRadius * 0.99, 48, 28);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0x020617,
        transparent: true,
        opacity: 0.82,
    });
    globeGroup.add(new THREE.Mesh(innerGeo, innerMat));

    // Primary wireframe (fine grid)
    const wireGeo = new THREE.SphereGeometry(globeRadius, 46, 24);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x1e40af,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
    });
    const wireSphere = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireSphere);

    // Outer glow shell (softer, cyan, bigger)
    const glowGeo = new THREE.SphereGeometry(globeRadius * 1.07, 36, 18);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
    });
    globeGroup.add(new THREE.Mesh(glowGeo, glowMat));

    // Halo ring (equatorial — adds depth)
    const haloGeo = new THREE.RingGeometry(globeRadius * 1.15, globeRadius * 1.18, 64);
    const haloMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2.4;
    globeGroup.add(halo);

    // ==========================================
    // SURFACE POINTS (Fibonacci sphere distribution)
    // ==========================================
    const pts = [];
    const dotsGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pointCount * 3);
    const colorArr = new Float32Array(pointCount * 3);
    const palette = [
        new THREE.Color(0x3b82f6), // primary blue
        new THREE.Color(0x06b6d4), // cyan
        new THREE.Color(0x8b5cf6), // violet
        new THREE.Color(0xf59e0b), // amber
        new THREE.Color(0x34d399), // phosphor
    ];

    for (let i = 0; i < pointCount; i++) {
        // Fibonacci sphere — even distribution
        const y = 1 - (i / (pointCount - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        positions[i * 3]     = x * globeRadius;
        positions[i * 3 + 1] = y * globeRadius;
        positions[i * 3 + 2] = z * globeRadius;

        const c = palette[Math.floor(Math.random() * palette.length)];
        colorArr[i * 3]     = c.r;
        colorArr[i * 3 + 1] = c.g;
        colorArr[i * 3 + 2] = c.b;

        pts.push(new THREE.Vector3(x * globeRadius, y * globeRadius, z * globeRadius));
    }

    dotsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dotsGeo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

    const dotsMat = new THREE.PointsMaterial({
        size: 0.09,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        sizeAttenuation: true,
    });
    globeGroup.add(new THREE.Points(dotsGeo, dotsMat));

    // ==========================================
    // ATTACK ARCS — animated curves between random pairs
    // ==========================================
    const activeArcs = [];
    const maxArcs = isMobile ? 3 : 6;
    const arcSegments = 36;

    function createArc() {
        const startIdx = Math.floor(Math.random() * pts.length);
        let endIdx = Math.floor(Math.random() * pts.length);
        let guard = 0;
        while (endIdx === startIdx && guard++ < 10) {
            endIdx = Math.floor(Math.random() * pts.length);
        }

        const start = pts[startIdx];
        const end = pts[endIdx];

        // Midpoint lifted outward for parabolic arc
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);
        const heightFactor = 1 + Math.min(distance * 0.18, 1.2);
        mid.normalize().multiplyScalar(globeRadius * heightFactor);

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const curvePts = curve.getPoints(arcSegments);

        // Full arc line (faint background)
        const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
        const arcColor = Math.random() > 0.6 ? 0xf59e0b : (Math.random() > 0.5 ? 0x06b6d4 : 0x8b5cf6);
        const lineMat = new THREE.LineBasicMaterial({
            color: arcColor,
            transparent: true,
            opacity: 0,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        globeGroup.add(line);

        // Traveling head dot (pulse)
        const headGeo = new THREE.SphereGeometry(0.07, 10, 10);
        const headMat = new THREE.MeshBasicMaterial({
            color: arcColor,
            transparent: true,
            opacity: 0,
        });
        const head = new THREE.Mesh(headGeo, headMat);
        globeGroup.add(head);

        // Origin pulse (expanding ring at start point)
        const originGeo = new THREE.RingGeometry(0.05, 0.15, 24);
        const originMat = new THREE.MeshBasicMaterial({
            color: arcColor,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
        });
        const origin = new THREE.Mesh(originGeo, originMat);
        origin.position.copy(start);
        origin.lookAt(start.clone().multiplyScalar(2));
        globeGroup.add(origin);

        return {
            line, lineMat, head, headMat, origin, originMat,
            curve,
            lifetime: 0,
            maxLife: 2.2 + Math.random() * 1.6,
        };
    }

    // ==========================================
    // INTERACTION — mouse + scroll
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        targetRotY = mouseX * 0.4;
        targetRotX = mouseY * 0.25;
    });

    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    // ==========================================
    // VISIBILITY — pause when off-screen
    // ==========================================
    let isVisible = true;
    const visObserver = new IntersectionObserver(
        (entries) => { isVisible = entries[0].isIntersecting; },
        { threshold: 0 }
    );
    visObserver.observe(canvas);

    // ==========================================
    // ANIMATION LOOP
    // ==========================================
    const clock = new THREE.Clock();
    let arcSpawnTimer = 0;
    const arcSpawnInterval = 0.4;

    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;

        const delta = Math.min(clock.getDelta(), 0.05);
        const t = clock.getElapsedTime();

        // Short-circuit render entirely once globe is effectively invisible
        // (saves ALL the per-frame GPU work while scrolling past hero)
        const scrollFadeCheck = Math.min(scrollY / window.innerHeight, 1);
        if (scrollFadeCheck >= 0.95) {
            canvas.style.opacity = '0';
            return;
        }

        // Smooth globe rotation — drift + mouse-driven
        if (!prefersReducedMotion) {
            globeGroup.rotation.y += delta * 0.09;
            globeGroup.rotation.y += (targetRotY - (globeGroup.rotation.y % (Math.PI * 2))) * 0.0008;
            globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.04;
        }

        // Scroll parallax — globe drops, shrinks, and fades as you scroll past hero
        const scrollProgress = Math.min(scrollY / window.innerHeight, 1);
        globeGroup.position.y = -scrollProgress * 3;
        globeGroup.position.x = scrollProgress * 2;
        globeGroup.scale.setScalar(1 - scrollProgress * 0.18);
        // Fade canvas opacity — globe should recede after hero to let content breathe
        canvas.style.opacity = Math.max(0.05, 1 - scrollProgress * 1.4);

        // Halo breathe
        const breathe = 1 + Math.sin(t * 0.6) * 0.03;
        halo.scale.set(breathe, breathe, 1);
        haloMat.opacity = 0.14 + Math.sin(t * 0.8) * 0.06;

        // Spawn arcs at interval
        arcSpawnTimer += delta;
        if (arcSpawnTimer > arcSpawnInterval && activeArcs.length < maxArcs) {
            activeArcs.push(createArc());
            arcSpawnTimer = 0;
        }

        // Update arcs
        for (let i = activeArcs.length - 1; i >= 0; i--) {
            const a = activeArcs[i];
            a.lifetime += delta;
            const p = a.lifetime / a.maxLife;

            if (p >= 1) {
                globeGroup.remove(a.line);
                globeGroup.remove(a.head);
                globeGroup.remove(a.origin);
                a.line.geometry.dispose();
                a.lineMat.dispose();
                a.head.geometry.dispose();
                a.headMat.dispose();
                a.origin.geometry.dispose();
                a.originMat.dispose();
                activeArcs.splice(i, 1);
                continue;
            }

            // Opacity envelope: fade in → hold → fade out
            let op;
            if (p < 0.15)      op = p / 0.15;
            else if (p < 0.75) op = 1;
            else               op = 1 - (p - 0.75) / 0.25;

            a.lineMat.opacity = op * 0.55;

            // Head travels first half of life, then fades with line
            const headT = Math.min(p * 1.8, 1);
            const pos = a.curve.getPoint(headT);
            a.head.position.copy(pos);
            a.headMat.opacity = op * (headT < 1 ? 1 : 0.7);
            const pulse = 1 + Math.sin(a.lifetime * 10) * 0.35;
            a.head.scale.setScalar(pulse);

            // Origin ring expands & fades
            const originScale = 1 + p * 4;
            a.origin.scale.setScalar(originScale);
            a.originMat.opacity = op * (1 - p) * 0.8;
        }

        renderer.render(scene, camera);
    }

    animate();

    // ==========================================
    // RESIZE
    // ==========================================
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();
