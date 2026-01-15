import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuration
const PARTICLE_COUNT = 5000; // Dense field
const BOUNDS = 25; // Area to fill

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
controls.autoRotate = false; // Stopped rotation

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

function getField(pos) {
    const E = new THREE.Vector3(0, 0, 0);

    // Positive Charge Contribution
    const r1 = new THREE.Vector3().subVectors(pos, posCharge.position);
    const d1Sq = r1.lengthSq();
    if (d1Sq > 0.1) {
        const mag1 = (k * q1) / (d1Sq * Math.sqrt(d1Sq));
        E.addScaledVector(r1, mag1);
    }

    // Negative Charge Contribution
    const r2 = new THREE.Vector3().subVectors(pos, negCharge.position);
    const d2Sq = r2.lengthSq();
    if (d2Sq > 0.1) {
        const mag2 = (k * q2) / (d2Sq * Math.sqrt(d2Sq));
        E.addScaledVector(r2, mag2);
    }

    return E;
}

// --- Vector Field Visualization (Random Points) ---

// Geometry: Tapered cone pointing towards +Z 
const coneGeo = new THREE.CylinderGeometry(0.01, 0.1, 0.4, 6);
coneGeo.rotateX(Math.PI / 2);

const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }); // Opacity controlled by instance color

const mesh = new THREE.InstancedMesh(coneGeo, coneMaterial, PARTICLE_COUNT);
mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

const dummy = new THREE.Object3D();
const posVector = new THREE.Vector3();
const color = new THREE.Color();

for (let i = 0; i < PARTICLE_COUNT; i++) {
    // 1. Random Position
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 10) {
        posVector.set(
            (Math.random() - 0.5) * BOUNDS * 2,
            (Math.random() - 0.5) * BOUNDS * 1.5,
            (Math.random() - 0.5) * BOUNDS * 1.5
        );

        if (posVector.distanceTo(posCharge.position) > 2.2 &&
            posVector.distanceTo(negCharge.position) > 2.2) {
            valid = true;
        }
        attempts++;
    }

    if (valid) {
        dummy.position.copy(posVector);

        // 2. Calculate Field
        const E = getField(posVector);
        const mag = E.length();
        const dir = E.clone().normalize();

        // 3. Orient
        const target = posVector.clone().add(dir);
        dummy.lookAt(target);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // 4. Intensity Scaling
        // Map Magnitude to Brightness
        // High magnitude -> Bright White
        // Low magnitude -> Dim Grey
        const sensitivity = 0.5;
        const brightness = Math.min(1.0, 0.1 + mag * sensitivity);

        color.setHSL(0, 0, brightness);
        mesh.setColorAt(i, color);

    } else {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
}

mesh.instanceColor.needsUpdate = true;
scene.add(mesh);

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
