
/**
 * ElectricFieldSim - Flexible 3D Visualization class
 */
class ElectricFieldSim {
    constructor(containerId, config) {
        this.containerId = containerId;
        this.config = Object.assign({
            bgColor: 0x111111,
            lineColor: 0xffffff,
            particleCount: 2400,
            cylinderRadius: 1.5,
            cylinderHeight: 4.0,
            cameraPosition: { x: 0, y: 0, z: 10 }, // Default Front/Side
            interactive: false, // Does nothing for now as we have no controls
            view: 'default'
        }, config);

        this.init();
    }

    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.warn(`Container ${this.containerId} not found.`);
            return;
        }

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.bgColor);

        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        this.camera.position.set(
            this.config.cameraPosition.x,
            this.config.cameraPosition.y,
            this.config.cameraPosition.z
        );
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.buildScene();

        // Bind Resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Animation Loop
        this.animate();
    }

    buildScene() {
        // --- 1. Central Axis (Line) ---
        // Thicker radius (0.08) for visibility
        const lineGeo = new THREE.CylinderGeometry(0.08, 0.08, 14, 12);
        const lineMat = new THREE.MeshBasicMaterial({ color: this.config.lineColor });
        this.infiniteLine = new THREE.Mesh(lineGeo, lineMat);
        this.infiniteLine.rotation.z = Math.PI / 2; // X-axis alignment
        this.scene.add(this.infiniteLine);

        // --- 2. Field Cloud (Points) ---
        // Logic specific to count
        const totalPoints = this.config.particleCount;

        // Approximate grid dimensions based on total count
        // Ratio roughly: h:t:r = 4:4:1 ? 
        // Let's deduce roughly.
        // If 2400: 20 * 20 * 6 = 2400.
        // If 400: 10 * 10 * 4 = 400.

        // Simple scaler
        const densityScale = Math.pow(totalPoints / 2400, 1 / 3);
        const hCount = Math.floor(20 * densityScale) || 5;
        const tCount = Math.floor(20 * densityScale) || 8;
        const rCount = Math.floor(6 * densityScale) || 3;

        const pointsGeo = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];

        const rMin = 0.05, rMax = 3.0;
        const hMin = -3.5, hMax = 3.5;

        // Viridis Palette
        const c1 = new THREE.Color(0x440154);
        const c2 = new THREE.Color(0x21918c);
        const c3 = new THREE.Color(0xfde725); // Yellow

        for (let rIdx = 0; rIdx < rCount; rIdx++) {
            const tR = rIdx / Math.max(rCount - 1, 1);
            const r = rMin + tR * (rMax - rMin);

            for (let tIdx = 0; tIdx < tCount; tIdx++) {
                const theta = (tIdx / tCount) * Math.PI * 2;

                for (let hIdx = 0; hIdx < hCount; hIdx++) {
                    const tH = hIdx / Math.max(hCount - 1, 1);
                    const h = hMin + tH * (hMax - hMin);

                    // Vertical Gen -> Rotate later
                    const x = r * Math.cos(theta);
                    const y = h;
                    const z = r * Math.sin(theta);

                    positions.push(x, y, z);

                    // Colors
                    const magFactor = 1.0 - tR;
                    const c = new THREE.Color();
                    if (magFactor < 0.5) c.lerpColors(c1, c2, magFactor * 2.0);
                    else c.lerpColors(c2, c3, (magFactor - 0.5) * 2.0);
                    colors.push(c.r, c.g, c.b);

                    sizes.push((magFactor + 0.2) * 2.0);
                }
            }
        }

        pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        pointsGeo.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
        pointsGeo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: { scale: { value: 200.0 } },
            vertexShader: `
                attribute float size;
                attribute vec3 customColor;
                varying vec3 vColor;
                void main() {
                    vColor = customColor;
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                    gl_PointSize = size * ( 200.0 / -mvPosition.z ); 
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
                    gl_FragColor = vec4( vColor, 0.6 ); 
                }
            `,
            transparent: true,
            depthWrite: false
        });

        this.fieldPoints = new THREE.Points(pointsGeo, shaderMaterial);

        // Rotate MESH to X-axis
        this.fieldPoints.rotation.z = Math.PI / 2;
        this.scene.add(this.fieldPoints);
    }

    onWindowResize() {
        if (!this.container || !this.camera || !this.renderer) return;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        if (!this.renderer) return;
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate Simulations
document.addEventListener('DOMContentLoaded', () => {

    // Sidebar Visualization (Medium Density, Isometric 3D View)
    // "Igual que el dibujo de viridis" (Isometric) + "Laterl izquierdo"
    new ElectricFieldSim('canvas-container', {
        particleCount: 1000, // "Unos pocos puntos más" (vs 500)
        cameraPosition: { x: 5, y: 5, z: 8 }, // Isometric View
    });

});
