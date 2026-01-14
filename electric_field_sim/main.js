import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuration
const PARTICLE_COUNT = 500;
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
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 0, 0); // Light emanating from center
scene.add(pointLight);

// Central Charge - Semi-translucent
const chargeGeometry = new THREE.SphereGeometry(2, 32, 32); // Slightly larger
const chargeMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff, // White
    emissive: 0x222222,
    transparent: true,
    opacity: 0.3,
    shininess: 100,
    side: THREE.DoubleSide
});
const centralCharge = new THREE.Mesh(chargeGeometry, chargeMaterial);
scene.add(centralCharge);

// Particles System (InstancedMesh with Cylinders for lines)
// Cylinder aligned with Y axis by default. We will rotate it to match field.
const lineLength = 0.6;
// Tapered cylinder: radiusTop=0.0 (point), radiusBottom=0.03
// This creates a cone pointing towards the +Y direction (before rotation)
// After rotateX(PI/2), it points towards +Z
// When we lookAt(center), +Z points to center. So the tip points to center.
const geometry = new THREE.CylinderGeometry(0.005, 0.04, lineLength, 6);
// User feedback: Lines were not pointing to center.
// Previous: rotateX(PI/2) -> Tip(+Y) to +Z.
// If user saw them pointing away, then +Z must be pointing away or visual confusion.
// Tried flipping to -PI/2 -> Tip(+Y) to -Z.
// If +Z points to center, then -Z (Tip) points AWAY.
// Wait, if I want to FLIP the previous behavior, I should change the rotation to -PI/2?
// Let's assume previous was "Backwards". So I flip it.
geometry.rotateX(-Math.PI / 2);

const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9, // Increased opacity for visibility
    blending: THREE.AdditiveBlending,
    depthWrite: false // Keep false for additive blending sort-free rendering
});
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
    // Spawn randomly within bounds
    // Use a distribution that ensures lines are visible at various depths
    // Volume distribution: r = cbrt(random) * R for uniform sphere volume, 
    // but we might want 1/r^2 density or uniform linear distribution.
    // Let's stick to uniform volume for now to fill the space.
    const r = Math.pow(Math.random(), 1 / 3) * BOUNDS;

    // Ensure we don't spawn inside the charge
    if (r < 2.5) {
        initFieldLine(i); // Retry
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
        // Point TOWARDS the center (Converging field)
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

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}

// Window Resize Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
