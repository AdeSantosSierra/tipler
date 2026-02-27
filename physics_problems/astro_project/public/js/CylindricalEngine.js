/**
 * Cylindrical Shells Engine (Three.js)
 * Modularized version for parameterizable physics visualizations.
 */

window.CylindricalEngine = (function () {
    let scene, camera, renderer, controls;
    let shells = [];
    let gaussianSurface = null;
    let labels = [];

    const COLORS = {
        inner: 0xae81ff,
        outer: 0x75507b,
        gauss: 0xe2d0f8,
        label: 0xf8f8f2
    };

    function init(container, config = {}) {
        const {
            height = 7,
            shells: shellConfigs = [
                { radius: 1.2, color: COLORS.inner, opacity: 0.55 },
                { radius: 2.2, color: COLORS.outer, opacity: 0.35 }
            ]
        } = config;

        // Correctly merge nested defaults
        const gaussian = {
            radius: 0.65,
            visible: true,
            color: COLORS.gauss,
            opacity: 0.28,
            ...config.gaussian
        };

        const cameraPos = {
            x: 7.5,
            y: 5,
            z: 8.5,
            ...config.cameraPos
        };

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;

        // Create Shells
        shellConfigs.forEach((s, i) => {
            const geometry = new THREE.CylinderGeometry(s.radius, s.radius, height, 48, 1, s.solid ? false : true);
            const material = new THREE.MeshBasicMaterial({
                color: s.color || COLORS.inner,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: s.opacity || 0.4,
                depthWrite: false
            });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            shells.push(mesh);

            // Label for Ri
            const labelText = s.label || `R${i + 1}`;
            const arrowDir = new THREE.Vector3(i === 0 ? 1 : 0, 0, i === 0 ? 0 : 1);
            const ay = height * 0.27;
            scene.add(new THREE.ArrowHelper(arrowDir, new THREE.Vector3(0, ay, 0), s.radius, s.color, s.radius * 0.1, s.radius * 0.05));

            const label = makeLabel(labelText, COLORS.label);
            label.position.set(arrowDir.x * (s.radius + 0.4), ay, arrowDir.z * (s.radius + 0.4));
            scene.add(label);
        });

        // Gaussian Surface
        if (gaussian.visible) {
            const gGeom = new THREE.CylinderGeometry(gaussian.radius, gaussian.radius, height * 0.72, 40, 1, false);
            const gMat = new THREE.MeshBasicMaterial({
                color: gaussian.color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: gaussian.opacity,
                depthWrite: false
            });
            gaussianSurface = new THREE.Mesh(gGeom, gMat);
            scene.add(gaussianSurface);

            // Label r and L
            const ay = height * 0.27;
            const dd = new THREE.Vector3(1, 0, 1).normalize();
            scene.add(new THREE.ArrowHelper(dd, new THREE.Vector3(0, ay, 0), gaussian.radius, COLORS.label, gaussian.radius * 0.2, gaussian.radius * 0.08));

            const lr = makeLabel('r', COLORS.label, 'Italic');
            lr.position.set(dd.x * (gaussian.radius + 0.4), ay, dd.z * (gaussian.radius + 0.4));
            scene.add(lr);

            // L
            const gh = height * 0.72;
            const lx = -gaussian.radius - 0.3;
            scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(lx, 0, 0.3), gh / 2, COLORS.label, 0.3, 0.15));
            scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(lx, 0, 0.3), gh / 2, COLORS.label, 0.3, 0.15));
            const lL = makeLabel('L', COLORS.label, 'Italic');
            lL.position.set(lx - 0.4, 0, 0.3);
            scene.add(lL);
        }

        animate();
    }

    function makeLabel(text, color, style = 'Bold') {
        const c = document.createElement('canvas');
        c.width = 140; c.height = 70;
        const ctx = c.getContext('2d');
        ctx.font = `${style} 46px Georgia`;
        ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 70, 38);
        const tex = new THREE.CanvasTexture(c);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.05, depthWrite: false }));
        sprite.scale.set(0.8, 0.4, 1);
        return sprite;
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    return { init };
})();
