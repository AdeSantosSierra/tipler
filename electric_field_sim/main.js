import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuration
const PARTICLE_COUNT = 1500; // Increased density
const BOUNDS = 20;
const CHARGE_STRENGTH = 100; // kQ
const PARTICLE_CHARGE = 1;
const DT = 0.016; // Time step

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); // Very dark grey background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2); // Brighter light for glass effect
pointLight.position.set(5, 5, 5); // Offset light to show sphericity better
scene.add(pointLight);
const pointLight2 = new THREE.PointLight(0xffffff, 1);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

// Central Charge - Elegant Translucent Green
const chargeGeometry = new THREE.SphereGeometry(2, 64, 64);
const chargeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ffaa, // Light Green
    emissive: 0x002211,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.6, // Glass-like transparency
    thickness: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.FrontSide
});
const centralCharge = new THREE.Mesh(chargeGeometry, chargeMaterial);
scene.add(centralCharge);

// Particles System (InstancedMesh with Cylinders for lines)
const lineLength = 0.6;
// Tapered cylinder: radiusTop=0.0 (point), radiusBottom=0.03
const geometry = new THREE.CylinderGeometry(0.005, 0.04, lineLength, 6);
geometry.rotateX(-Math.PI / 2); // Point towards -Z (Tip)

// Custom Shader Material for "Blink/Flow" effect
const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
});

// Inject shader logic
const uniforms = {
    uTime: { value: 0 }
};

material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;

    shader.vertexShader = `
        varying vec2 vUv;
        ${shader.vertexShader}
    `.replace(
        '#include <uv_vertex>',
        `
        #include <uv_vertex>
        vUv = uv;
        `
    );

    shader.fragmentShader = `
        uniform float uTime;
        varying vec2 vUv;
        ${shader.fragmentShader}
    `.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>
        
        // Flow effect: "Back to Front"
        // vUv.y goes 0 (bottom/base) to 1 (top/tip).
        // To move Base -> Tip, we want phase to travel 0 -> 1.
        
        float speed = 3.0;
        // Direction: Base(0) -> Tip(1). 
        // We want the pulse to appear at 0 when time=0, then move to 1.
        
        float progress = fract(uTime * 0.5); // 0 to 1 over time
        float wavePos = progress * 2.0 - 0.5; // range: -0.5 to 1.5 to cover full length
        
        // Distance from wave center
        float dist = abs(vUv.y - wavePos);
        float glow = 1.0 - smoothstep(0.0, 0.4, dist);
        
        // Modulate alpha
        diffuseColor.a *= (0.2 + 0.8 * glow);
        `
    );
};

const particlesMesh = new THREE.InstancedMesh(geometry, material, PARTICLE_COUNT);
particlesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

// Initialize colors
const colors = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT; i++) {
    colors[i * 3] = 1;
    colors[i * 3 + 1] = 1;
    colors[i * 3 + 2] = 1;
}
particlesMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
scene.add(particlesMesh);

// Data
const positions = new Float32Array(PARTICLE_COUNT * 3);
const dummy = new THREE.Object3D();
const color = new THREE.Color();
const center = new THREE.Vector3(0, 0, 0);

function initFieldLine(i) {
    const r = Math.pow(Math.random(), 1 / 3) * BOUNDS;

    if (r < 2.5) {
        initFieldLine(i);
        return;
    }

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
}

// Initialize
for (let i = 0; i < PARTICLE_COUNT; i++) {
    initFieldLine(i);
}

// Initial positioning and coloring (Static)
function updateFieldLines() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x = positions[i * 3];
        let y = positions[i * 3 + 1];
        let z = positions[i * 3 + 2];

        // 1. Position
        dummy.position.set(x, y, z);
        const dist = dummy.position.distanceTo(center);

        // 2. Orientation
        dummy.lookAt(center);

        // 3. Brightness/Intensity based on distance
        // Closer = Brighter.
        const intensity = Math.min(1.0, 25.0 / (dist * dist));
        color.setHSL(0.6, 0.0, intensity);
        particlesMesh.setColorAt(i, color);

        dummy.updateMatrix();
        particlesMesh.setMatrixAt(i, dummy.matrix);
    }
    particlesMesh.instanceMatrix.needsUpdate = true;
    if (particlesMesh.instanceColor) particlesMesh.instanceColor.needsUpdate = true;
}

updateFieldLines();

// Auto-rotation
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    uniforms.uTime.value = time;

    controls.update(); // Handles auto-rotate
    renderer.render(scene, camera);
}

// Window Resize Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
