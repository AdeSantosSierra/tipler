import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';

// Configuration
const WIDTH = 512; // Texture width -> 512x512 = 262,144 particles
const PARTICLES = WIDTH * WIDTH;
const BOUNDS = 40.0;
const BOUNDS_HALF = BOUNDS / 2.0;

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 30);

const renderer = new THREE.WebGLRenderer({ antialias: false }); // Antialias off for perf with massive points
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setScissorTest(false); // Not needed
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = false; // Static as requested before, can re-enable

// Lighting (visual only)
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// --- Charges ---
const chargeGeo = new THREE.SphereGeometry(2, 32, 32);

// Positive Charge (RED)
const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 }); // Basic for contrast
const posCharge = new THREE.Mesh(chargeGeo, redMaterial);
posCharge.position.set(-10, 0, 0);
scene.add(posCharge);

// Negative Charge (GREEN)
const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x88ffaa });
const negCharge = new THREE.Mesh(chargeGeo, greenMaterial);
negCharge.position.set(10, 0, 0);
scene.add(negCharge);

// --- GPGPU Setup ---
const gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

if (renderer.capabilities.isWebGL2 === false) {
    gpuCompute.setDataType(THREE.HalfFloatType);
}

// 1. Position Shader: The Physics Engine
const positionFragmentShader = `
    uniform float iTime;
    uniform float delta; // Time delta
    uniform vec3 posCharge;
    uniform vec3 negCharge;
    uniform float randSeed;

    const float MAX_SPEED = 60.0; 
    const float MIN_SPEED = 2.0;
    const float DAMPING = 0.98;

    // Pseudo-random function
    float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 tmpPos = texture2D( texturePosition, uv );
        vec3 pos = tmpPos.xyz;
        float life = tmpPos.w; // w component tracks life/reset state

        // Initialize velocity based on E-field
        vec3 E = vec3(0.0);
        
        // Coulomb Law: E = k * q / r^2 * dir
        // Constants folded into k=100 for visual scale
        
        // Positive Charge (+1)
        vec3 r1 = pos - posCharge;
        float d1Sq = dot(r1, r1);
        float d1 = sqrt(d1Sq);
        if (d1 < 1.0) d1 = 1.0; // avoid singularity
        E += (300.0 * r1) / (d1Sq * d1); // Push away

        // Negative Charge (-1)
        vec3 r2 = pos - negCharge;
        float d2Sq = dot(r2, r2);
        float d2 = sqrt(d2Sq);
        if (d2 < 1.0) d2 = 1.0;
        E -= (300.0 * r2) / (d2Sq * d2); // Pull towards

        // Movement Step
        // Move along E vector
        float mag = length(E);
        
        // Limit speed to avoid exploding particles
        // But also ensure they move.
        // We want constant "flow" speed mostly, but faster near charges.
        vec3 dir = (mag > 0.0001) ? normalize(E) : vec3(0.0);
        float speed = clamp(mag, MIN_SPEED, MAX_SPEED);
        
        pos += dir * speed * delta; // Integration step

        // --- Life/Reset Logic ---
        bool reset = false;

        // 1. Hit Negative Charge (Sink)
        if (d2 < 2.2) reset = true; 

        // 2. Out of Bounds
        if (abs(pos.x) > 40.0 || abs(pos.y) > 25.0 || abs(pos.z) > 25.0) reset = true;
        
        // 3. Life timer (random)
        // We can just use bounds for now.
        
        if (reset) {
            // Respawn near Positive Charge (Source) or Randomly in field?
            // "Flow Field" usually fills space.
            // Let's spawn RANDOMLY in the volume to maintain density
            // But maybe biased towards Source?
            // Let's spawn randomly in box.
            
            // Random offset based on current time/uv
            vec2 seed = uv + vec2(iTime * 0.1, randSeed);
            float rx = rand(seed) - 0.5;
            float ry = rand(seed + 1.0) - 0.5;
            float rz = rand(seed + 2.0) - 0.5;
            
            // Respawn primarily near source?
            // Try spawning on surface of sphere around red charge for "flow from source" look
            // pos = posCharge + normalize(vec3(rx,ry,rz)) * 2.5; 
            
            // OR Global volume spawn (better for visualization of whole field)
            pos = vec3(rx * 80.0, ry * 50.0, rz * 50.0);
        }

        gl_FragColor = vec4( pos, life );
    }
`;

// Initialize Texture Data
const dtPosition = gpuCompute.createTexture();
const posArray = dtPosition.image.data;

for (let i = 0; i < posArray.length; i += 4) {
    const x = Math.random() * 80 - 40;
    const y = Math.random() * 50 - 25;
    const z = Math.random() * 50 - 25;

    posArray[i + 0] = x;
    posArray[i + 1] = y;
    posArray[i + 2] = z;
    posArray[i + 3] = Math.random(); // Random life phase
}

// Add Variable
const positionVariable = gpuCompute.addVariable("texturePosition", positionFragmentShader, dtPosition);

// Inject Dependencies for position shader
gpuCompute.setVariableDependencies(positionVariable, [positionVariable]);

// Uniforms
const posUniforms = positionVariable.material.uniforms;
posUniforms["iTime"] = { value: 0.0 };
posUniforms["delta"] = { value: 0.0 };
posUniforms["posCharge"] = { value: posCharge.position };
posUniforms["negCharge"] = { value: negCharge.position };
posUniforms["randSeed"] = { value: Math.random() };

// Error Check
const error = gpuCompute.init();
if (error !== null) {
    console.error(error);
}

// --- Render Geometry (The Points) ---
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLES * 3);
const uvs = new Float32Array(PARTICLES * 2);

// We don't need actual position data in 'positions', just empty buffer.
// But we need UVs to look up the texture.
let p = 0;
for (let j = 0; j < WIDTH; j++) {
    for (let k = 0; k < WIDTH; k++) {
        uvs[p++] = k / (WIDTH - 1);
        uvs[p++] = j / (WIDTH - 1);
    }
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

// Render Vertex Shader: Standard lookup
const particleVertexShader = `
    uniform sampler2D texturePosition;
    varying float vMag;
    
    void main() {
        // Look up position from texture
        vec4 posData = texture2D( texturePosition, uv );
        vec3 pos = posData.xyz;
        
        // Optional: Velocity calc for visual flair in vertex shader?
        // Or just use distance based coloring
        gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
        gl_PointSize = 1.5; // Small dense points
        
        // Pass info to fragment
        // Hack: dist to negative charge = fast = bright?
        // Let's pass normalized position or something.
    }
`;

// Render Fragment Shader
const particleFragmentShader = `
    void main() {
        // Simple white points with circular shape
        // vec2 coord = gl_PointCoord - vec2(0.5);
        // if(length(coord) > 0.5) discard; // Circular points (expensive)
        
        // Just Square points for GPGPU performance usually fine or circular alpha
        // Let's do simple white
        gl_FragColor = vec4( 1.0, 1.0, 1.0, 0.6 ); 
    }
`;

// Uniforms for Render Material
const particleUniforms = {
    texturePosition: { value: null }
};

const material = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const points = new THREE.Points(geometry, material);
scene.add(points);


// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min(clock.getDelta(), 0.1); // Cap delta

    // Update GPGPU
    posUniforms["iTime"].value = now * 0.001;
    posUniforms["delta"].value = delta;
    posUniforms["randSeed"].value = Math.random();

    gpuCompute.compute();

    // Update Render Material with new Texture
    particleUniforms["texturePosition"].value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();
