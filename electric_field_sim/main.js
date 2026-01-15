import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

// Configuration
const BOUNDS = 20;
const RESOLUTION = 60; // Grid resolution for Marching Cubes

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setScissorTest(false);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = false;

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);
const pointLight2 = new THREE.PointLight(0xffffff, 1);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

// --- Charges ---
const chargeGeo = new THREE.SphereGeometry(2, 64, 64);

// 1. Positive Charge (RED)
const redMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff3333, // Red
    emissive: 0x330000,
    roughness: 0.1, metalness: 0.1, transmission: 0.6, thickness: 2.0,
    clearcoat: 1.0, side: THREE.FrontSide
});
const posCharge = new THREE.Mesh(chargeGeo, redMaterial);
posCharge.position.set(-8, 0, 0);
scene.add(posCharge);

// 2. Negative Charge (GREEN)
const greenMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ffaa, // Green
    emissive: 0x002211,
    roughness: 0.1, metalness: 0.1, transmission: 0.6, thickness: 2.0,
    clearcoat: 1.0, side: THREE.FrontSide
});
const negCharge = new THREE.Mesh(chargeGeo, greenMaterial);
negCharge.position.set(8, 0, 0);
scene.add(negCharge);

// Physics Constants
const k = 100;
const q1 = 1;
const q2 = -1;

// --- Scalar Potential Field Calculations ---
// V = k*q/r
function getPotential(x, y, z) {
    const pos = new THREE.Vector3(x, y, z);

    // Pot from q1 (+)
    const r1 = pos.distanceTo(posCharge.position);
    const v1 = (r1 > 0.5) ? (k * q1) / r1 : 1000; // avoid singularity

    // Pot from q2 (-)
    const r2 = pos.distanceTo(negCharge.position);
    const v2 = (r2 > 0.5) ? (k * q2) / r2 : -1000;

    return v1 + v2;
}

// --- Equipotential Surfaces (Layers) ---

// Helper to generate a single isosurface layer
function createIsoSurface(level, color, side = THREE.FrontSide) {
    const material = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        opacity: 0.3, // Glassy layers
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1.0,
        side: THREE.DoubleSide, // See inside/outside
        depthWrite: false // For transparency handling
    });

    const mc = new MarchingCubes(RESOLUTION, material, true, true, 100000);
    mc.position.set(0, 0, 0);
    mc.scale.set(BOUNDS, BOUNDS, BOUNDS); // Map 0..1 to -BOUNDS..BOUNDS? 
    // Wait, MarchingCubes grid bounds:
    // It creates a box from -scale to +scale? No, usually normalized.
    // Let's check docs logic usually:
    // It fills a volume. We need to map world coordinates to [0,1] grid coordinates.
    // Or rather, we sample the world at the grid points.

    // Populate
    const tempVec = new THREE.Vector3();

    // MarchingCubes uses a flat float32 array 'field'
    // Iterate X, Y, Z
    // Local coords -1 to 1 based on mc.position/scale

    // Actually simpler: reset() clears track.
    // We manually set values via setCell? Or direct array access?
    // Accessing `mc.field[i]` is fastest.

    // To position it correctly:
    // MC centered at 0, scaled by BOUNDS means it covers [-BOUNDS/2, BOUNDS/2]?
    // Let's assume scale=1 means [-1,1].
    // If we want to cover [-20, 20], we set scale to 20? 
    // Let's keep scale at 15 (radius) = 30 width?
    // We set mc.scale.set(15, 15, 15).

    mc.scale.set(15, 15, 15);
    mc.enableUvs = false;
    mc.enableColors = false;

    // Fill the field
    // Grid goes from 0 to RESOLUTION-1
    let iter = 0;
    for (let k = 0; k < RESOLUTION; k++) {
        for (let j = 0; j < RESOLUTION; j++) {
            for (let i = 0; i < RESOLUTION; i++) {
                // Determine World Position of this grid point
                // x goes from -15 to 15
                const x = (i / (RESOLUTION - 1) - 0.5) * 2 * 15;
                const y = (j / (RESOLUTION - 1) - 0.5) * 2 * 15;
                const z = (k / (RESOLUTION - 1) - 0.5) * 2 * 15;

                const val = getPotential(x, y, z);

                mc.field[iter] = val;
                iter++;
            }
        }
    }

    mc.isolation = level;
    mc.update(); // Generate geometry

    scene.add(mc);
    return mc;
}

// Create Layers
// Positive (Reddish)
createIsoSurface(5, 0xff5555);
createIsoSurface(10, 0xff2222);
createIsoSurface(20, 0xff0000);

// Negative (Greenish - matching the charge)
createIsoSurface(-5, 0x55ffaa);
createIsoSurface(-10, 0x22ff88);
createIsoSurface(-20, 0x00ff66);

// V=0 Plane (optional, usually infinite plane, might clip messy)
// createIsoSurface(0, 0xffffff);

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
