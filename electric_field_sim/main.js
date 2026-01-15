import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuration
const MAX_PARTICLES = 3000; // Limit for InstancedMesh
const BOUNDS = 30; // Bounds to kill lines
const STEP_SIZE = 0.2; // Step size for tracing
const LINE_DENSITY = 0.6; // Distance between cones on a line

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;

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

// 1. Positive Charge (RED) - Source
const redMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff3333, // Red
    emissive: 0x330000,
    roughness: 0.1, metalness: 0.1, transmission: 0.6, thickness: 2.0,
    clearcoat: 1.0, side: THREE.FrontSide
});
const posCharge = new THREE.Mesh(chargeGeo, redMaterial);
posCharge.position.set(-8, 0, 0);
scene.add(posCharge);

// 2. Negative Charge (GREEN) - Sink
const greenMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ffaa, // Green
    emissive: 0x002211,
    roughness: 0.1, metalness: 0.1, transmission: 0.6, thickness: 2.0,
    clearcoat: 1.0, side: THREE.FrontSide
});
const negCharge = new THREE.Mesh(chargeGeo, greenMaterial);
negCharge.position.set(8, 0, 0);
scene.add(negCharge);

// Physics: Field Calculation
// k * q / r^2
const k = 100; // Constant to scale visualization
const q1 = 1;  // Positive
const q2 = -1; // Negative

function getField(pos) {
    const E = new THREE.Vector3(0, 0, 0);

    // Contribution from Positive Charge
    const r1 = new THREE.Vector3().subVectors(pos, posCharge.position);
    const d1Sq = r1.lengthSq();
    if (d1Sq > 0.1) {
        const mag1 = (k * q1) / (d1Sq * Math.sqrt(d1Sq)); // E = k*q/r^2 * r_hat = k*q*r / r^3
        E.addScaledVector(r1, mag1);
    }

    // Contribution from Negative Charge
    const r2 = new THREE.Vector3().subVectors(pos, negCharge.position);
    const d2Sq = r2.lengthSq();
    if (d2Sq > 0.1) {
        const mag2 = (k * q2) / (d2Sq * Math.sqrt(d2Sq));
        E.addScaledVector(r2, mag2);
    }

    return E;
}

// --- Field Visualization (Tracing) ---

// Geometry for cones (reused)
// Points towards +Y default. rotateX(-PI/2) -> Points -Z. 
// We want it to point along the tangent. LookAt does Z.
const coneGeo = new THREE.CylinderGeometry(0.01, 0.1, 0.4, 6);
coneGeo.rotateX(-Math.PI / 2); // Axis is now Z, pointing to -Z (base to tip? No, Tip is -Z wait.)
// Default Cylinder: +Y. 
// radiusTop is 0.01 (tip?), radiusBottom 0.1 (base).
// rotateX(-90): +Y becomes -Z. 
// So Tip is at -Z. Base is at +Z.
// lookAt: turns +Z to face target. So Base faces target. 
// We want Tip to face target (direction of field).
// SO we should actually rotate so Tip is at +Z.
// +Y to +Z is rotateX(90).
coneGeo.rotateX(Math.PI); // Correction: Re-orienting.
// Let's reset. 
// Cylinder: Top(0) at +Y/2, Bottom(0.1) at -Y/2.
// We want "Forward" (+Z) to be the Tip.
// So we want Top at +Z.
// Rotate +Y to +Z -> rotateX(PI/2).
coneGeo.rotateX(Math.PI); // Let's try standardizing in logic

// Material (Static, minimal cost)
const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });

// Instance Data
const instances = []; // Store matrix/color for valid particles

function traceLine(startPoint) {
    let rawPos = startPoint.clone();
    let currentPos = startPoint.clone();
    let steps = 0;

    // Trace forward
    while (steps < 500) {
        // 1. Calculate Field
        const E = getField(currentPos);
        const mag = E.length();

        if (mag < 0.01) break; // Too weak (infinity)

        const dir = E.clone().normalize();

        // 2. Add particle at current position?
        // Let's add particles at regular distance intervals
        if (steps % 3 === 0) { // Density control
            instances.push({ pos: currentPos.clone(), dir: dir.clone() });
        }

        // 3. Step forward (Euler)
        currentPos.addScaledVector(dir, STEP_SIZE);
        steps++;

        // 4. Check Termination
        // Hit negative charge?
        if (currentPos.distanceTo(negCharge.position) < 2.5) break;

        // Out of bounds?
        if (currentPos.length() > BOUNDS) break;
    }
}

// Generate Lines
// Seed points on the surface of the Positive Charge
const linesCount = 80;
// Fibonacci sphere for even distribution
const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

for (let i = 0; i < linesCount; i++) {
    const y = 1 - (i / (linesCount - 1)) * 2; // y goes from 1 to -1
    const radius = Math.sqrt(1 - y * y); // radius at y

    const theta = phi * i;

    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    // Start at surface of pos charge (radius 2) + offset
    const start = new THREE.Vector3(x, y, z).multiplyScalar(2.1).add(posCharge.position);
    traceLine(start);
}

// Create InstancedMesh
const totalParticles = instances.length;
const mesh = new THREE.InstancedMesh(coneGeo, coneMaterial, totalParticles);
mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage); // Static field

const dummy = new THREE.Object3D();
const blueColor = new THREE.Color(0x00aaff); // Maybe tint them? User said white cones. Let's keep white.

for (let i = 0; i < totalParticles; i++) {
    const { pos, dir } = instances[i];

    dummy.position.copy(pos);

    // Orient: Look in direction of field
    // We want +Z to point in 'dir'
    // target = pos + dir
    const target = pos.clone().add(dir);
    dummy.lookAt(target);

    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
}

scene.add(mesh);

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Auto-rotate
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
