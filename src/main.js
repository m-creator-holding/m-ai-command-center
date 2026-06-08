import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// ═══════════════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════════════

const DEPARTMENTS = [
  // Ring 1 — Directors/Core
  { id: 'backend',     name: 'BACKEND',       ring: 1, seq: 0, tasks: 23, workers: 5, blockers: 0, status: 'active'   },
  { id: 'frontend',    name: 'FRONTEND',      ring: 1, seq: 1, tasks: 18, workers: 4, blockers: 0, status: 'active'   },
  { id: 'design',      name: 'DESIGN',        ring: 1, seq: 2, tasks: 8,  workers: 2, blockers: 2, status: 'warning'  },
  { id: 'quality',     name: 'QUALITY',       ring: 1, seq: 3, tasks: 15, workers: 3, blockers: 0, status: 'active'   },
  { id: 'infra',       name: 'INFRA',         ring: 1, seq: 4, tasks: 11, workers: 3, blockers: 1, status: 'active'   },
  { id: 'governance',  name: 'GOVERNANCE',    ring: 1, seq: 5, tasks: 6,  workers: 2, blockers: 0, status: 'active'   },
  { id: 'ri',          name: 'R&I',           ring: 1, seq: 6, tasks: 9,  workers: 2, blockers: 0, status: 'active'   },
  // Ring 2 — Operations
  { id: 'database',    name: 'DATABASE',      ring: 2, seq: 0, tasks: 19, workers: 2, blockers: 0, status: 'active'   },
  { id: 'security',    name: 'SECURITY',      ring: 2, seq: 1, tasks: 14, workers: 2, blockers: 5, status: 'critical' },
  { id: 'devops',      name: 'DEVOPS',        ring: 2, seq: 2, tasks: 12, workers: 2, blockers: 1, status: 'active'   },
  { id: 'integration', name: 'INTEGRATIONS',  ring: 2, seq: 3, tasks: 5,  workers: 1, blockers: 3, status: 'warning'  },
  { id: 'innovation',  name: 'INNOVATION',    ring: 2, seq: 4, tasks: 7,  workers: 2, blockers: 0, status: 'active'   },
  { id: 'operations',  name: 'OPERATIONS',    ring: 2, seq: 5, tasks: 8,  workers: 1, blockers: 0, status: 'active'   },
  { id: 'legal',       name: 'LEGAL',         ring: 2, seq: 6, tasks: 3,  workers: 1, blockers: 0, status: 'inactive' },
];

const ATTENTION_QUEUE = [
  'Deploy gate — Phase 4 release approval',
  'Security audit — 5 critical blockers',
  'DB migration — schema change v14',
  'Integration НЗСН — live API gate',
  'Legal clearance — PII processing',
];

const COLORS = {
  active:   0x00C8FF,
  warning:  0xFFB700,
  critical: 0xFF3030,
  inactive: 0x2A4455,
  bg:       0x030810,
};

// ═══════════════════════════════════════════════════════════════
//  RENDERER + SCENE + CAMERA
// ═══════════════════════════════════════════════════════════════

const container = document.getElementById('canvas-container');
const W = window.innerWidth;
const H = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.45;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.bg);
scene.fog = new THREE.FogExp2(COLORS.bg, 0.00025);

const camera = new THREE.PerspectiveCamera(52, W / H, 0.5, 3000);
camera.position.set(0, 160, 480);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 120;
controls.maxDistance = 1100;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.18;
controls.target.set(0, 0, 0);

// ═══════════════════════════════════════════════════════════════
//  POST-PROCESSING — BLOOM
// ═══════════════════════════════════════════════════════════════

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(W, H),
  0.75,   // strength
  0.38,   // radius
  0.08    // threshold — only elements above 8% brightness glow
);
composer.addPass(bloom);

// ═══════════════════════════════════════════════════════════════
//  LIGHTS
// ═══════════════════════════════════════════════════════════════

scene.add(new THREE.AmbientLight(0x0A1828, 4));

const coreLight = new THREE.PointLight(0x00C8FF, 60, 600, 1.8);
coreLight.position.set(0, 0, 0);
scene.add(coreLight);

const fillLight = new THREE.PointLight(0x002244, 20, 800, 1.5);
fillLight.position.set(200, 100, 200);
scene.add(fillLight);

// ═══════════════════════════════════════════════════════════════
//  STAR FIELD
// ═══════════════════════════════════════════════════════════════

function buildStarField(count = 5500) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 650 + Math.random() * 1400;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = 0.4 + Math.random() * 0.8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xA8C4D8,
    size: 0.7,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
  });
  return new THREE.Points(geo, mat);
}

scene.add(buildStarField());

// ═══════════════════════════════════════════════════════════════
//  COORDINATOR CORE — FRESNEL SHADER
// ═══════════════════════════════════════════════════════════════

const fresnelVert = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal    = normalize(normalMatrix * normal);
    vViewDir   = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fresnelFrag = /* glsl */`
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float ndv = max(dot(vNormal, vViewDir), 0.0);
    float fresnel = pow(1.0 - ndv, 2.8);
    float pulse = 0.72 + 0.28 * sin(uTime * 1.4);
    float glow  = fresnel * 2.8 * pulse + 0.06;
    vec3  col   = vec3(0.0, 0.78, 1.0);
    float alpha = fresnel * 0.88 + 0.06;
    gl_FragColor = vec4(col * glow, alpha);
  }
`;

const fresnelUniforms = { uTime: { value: 0 } };

const coordGroup = new THREE.Group();
scene.add(coordGroup);

// Solid inner core
const innerCore = new THREE.Mesh(
  new THREE.SphereGeometry(38, 32, 32),
  new THREE.MeshPhongMaterial({
    color: 0x001A2E,
    emissive: 0x003355,
    emissiveIntensity: 0.8,
    shininess: 120,
    transparent: true,
    opacity: 0.92,
  })
);
coordGroup.add(innerCore);

// Fresnel shell
const fresnelShell = new THREE.Mesh(
  new THREE.SphereGeometry(46, 32, 32),
  new THREE.ShaderMaterial({
    uniforms: fresnelUniforms,
    vertexShader: fresnelVert,
    fragmentShader: fresnelFrag,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  })
);
coordGroup.add(fresnelShell);

// Gyroscope rings around coordinator
const GYRO_RINGS = 6;
const gyroRings = [];
for (let i = 0; i < GYRO_RINGS; i++) {
  const radius = 56 + i * 6;
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.35, 8, 80),
    new THREE.MeshBasicMaterial({
      color: 0x00C8FF,
      transparent: true,
      opacity: 0.22 - i * 0.025,
    })
  );
  mesh.rotation.x = (Math.PI / GYRO_RINGS) * i + 0.3;
  mesh.rotation.z = (Math.PI / (GYRO_RINGS * 0.7)) * i;
  mesh.userData.spinX = (0.003 + i * 0.0008) * (i % 2 === 0 ? 1 : -1);
  mesh.userData.spinY = (0.002 + i * 0.0005) * (i % 3 === 0 ? 1 : -1);
  coordGroup.add(mesh);
  gyroRings.push(mesh);
}

// ═══════════════════════════════════════════════════════════════
//  ORBITAL PATHS
// ═══════════════════════════════════════════════════════════════

const ORBIT_R = [0, 210, 360];  // index 0 = coordinator
const ORBIT_TILT = [0, 0.36, 0.22]; // radians X-axis tilt

function createOrbitPath(ringIdx) {
  const r = ORBIT_R[ringIdx];
  const tilt = ORBIT_TILT[ringIdx];
  const geo = new THREE.TorusGeometry(r, 0.35, 8, 160);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x00C8FF,
    transparent: true,
    opacity: ringIdx === 1 ? 0.14 : 0.09,
  });
  const torus = new THREE.Mesh(geo, mat);
  torus.rotation.x = Math.PI / 2 + tilt;
  scene.add(torus);
  return torus;
}

createOrbitPath(1);
createOrbitPath(2);

// ═══════════════════════════════════════════════════════════════
//  DEPARTMENT NODES
// ═══════════════════════════════════════════════════════════════

const nodeObjects = [];  // for raycasting
const nodeGroups  = [];  // {group, dept, worldPos}

function statusColor(s) {
  if (s === 'active')   return COLORS.active;
  if (s === 'warning')  return COLORS.warning;
  if (s === 'critical') return COLORS.critical;
  return COLORS.inactive;
}

function buildNode(dept) {
  const r = ORBIT_R[dept.ring];
  const count = DEPARTMENTS.filter(d => d.ring === dept.ring).length;
  const angle = (dept.seq / count) * Math.PI * 2 + (dept.ring === 2 ? Math.PI / count : 0);

  const tilt = ORBIT_TILT[dept.ring];
  // Position on tilted orbit: x = cos*r, y = sin*tilt*r, z = sin*r (approximate)
  const x =  Math.cos(angle) * r;
  const z =  Math.sin(angle) * r;
  const y =  Math.sin(angle) * r * Math.sin(tilt);

  const group = new THREE.Group();
  group.position.set(x, y, z);

  const col = statusColor(dept.status);
  const nodeR = 6 + (dept.tasks / 30) * 8;

  // Core sphere
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(nodeR, 14, 14),
    new THREE.MeshPhongMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.6,
      shininess: 60,
    })
  );
  group.add(core);

  // Wireframe shell (icosahedron)
  const wireGeo = new THREE.IcosahedronGeometry(nodeR * 1.65, 1);
  const wire = new THREE.Mesh(
    wireGeo,
    new THREE.MeshBasicMaterial({
      color: col,
      wireframe: true,
      transparent: true,
      opacity: dept.status === 'inactive' ? 0.08 : 0.18,
    })
  );
  wire.userData.spinSpeed = 0.004 + Math.random() * 0.003;
  group.add(wire);

  // Blocker ring (amber halo for warning/critical)
  if (dept.status === 'warning' || dept.status === 'critical') {
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(nodeR * 1.9, 0.5, 8, 48),
      new THREE.MeshBasicMaterial({
        color: dept.status === 'critical' ? 0xFF3030 : 0xFFB700,
        transparent: true,
        opacity: 0.55,
      })
    );
    halo.rotation.x = Math.PI / 2;
    halo.userData.isHalo = true;
    group.add(halo);
  }

  // Agent satellites
  const agentCount = Math.min(dept.workers, 4);
  for (let a = 0; a < agentCount; a++) {
    const agentAngle = (a / agentCount) * Math.PI * 2;
    const agentR = nodeR * 2.4;
    const ax = Math.cos(agentAngle) * agentR;
    const ay = Math.sin(agentAngle) * agentR * 0.35;
    const az = Math.sin(agentAngle) * agentR;
    const agent = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x00C8FF })
    );
    agent.position.set(ax, ay, az);
    agent.userData.isAgent = true;
    agent.userData.orbitR = agentR;
    agent.userData.orbitAngle = agentAngle;
    agent.userData.orbitSpeed = 0.012 + Math.random() * 0.008;
    group.add(agent);
  }

  group.userData.dept = dept;
  group.userData.wire = wire;
  scene.add(group);

  nodeObjects.push(core);
  core.userData.group = group;
  core.userData.dept  = dept;

  nodeGroups.push({ group, dept, worldPos: new THREE.Vector3(x, y, z) });
}

DEPARTMENTS.forEach(buildNode);

// ═══════════════════════════════════════════════════════════════
//  SIGNAL BEAMS  (coordinator → random dept nodes)
// ═══════════════════════════════════════════════════════════════

const signals = [];

class SignalBeam {
  constructor(targetGroup) {
    const from = new THREE.Vector3(0, 0, 0);
    const to   = targetGroup.worldPos.clone();
    const mid  = new THREE.Vector3(
      (from.x + to.x) / 2 + (Math.random() - 0.5) * 60,
      (from.y + to.y) / 2 + 50 + Math.random() * 40,
      (from.z + to.z) / 2 + (Math.random() - 0.5) * 60
    );
    this.curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    this.t = 0;
    this.speed = 0.006 + Math.random() * 0.005;
    this.done  = false;

    // Static faint line
    const pts = this.curve.getPoints(60);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    this.line = new THREE.Line(
      lineGeo,
      new THREE.LineBasicMaterial({ color: 0x00C8FF, transparent: true, opacity: 0.07 })
    );
    scene.add(this.line);

    // Moving head dot
    const dotColor = statusColor(targetGroup.dept.status);
    this.dot = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 6, 6),
      new THREE.MeshBasicMaterial({ color: dotColor })
    );
    scene.add(this.dot);
  }

  update() {
    this.t += this.speed;
    if (this.t >= 1) { this.t = 1; this.done = true; }
    const pos = this.curve.getPoint(this.t);
    this.dot.position.copy(pos);
  }

  dispose() {
    scene.remove(this.line);
    scene.remove(this.dot);
    this.line.geometry.dispose();
    this.dot.geometry.dispose();
  }
}

let signalTimer = 0;
const SIGNAL_INTERVAL = 1.8; // seconds between new signals

function spawnSignal() {
  if (signals.length < 12) {
    const target = nodeGroups[Math.floor(Math.random() * nodeGroups.length)];
    signals.push(new SignalBeam(target));
  }
}

// ═══════════════════════════════════════════════════════════════
//  BACKGROUND GRID (horizon)
// ═══════════════════════════════════════════════════════════════

const gridHelper = new THREE.GridHelper(1600, 40, 0x001824, 0x001824);
gridHelper.position.y = -240;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.45;
scene.add(gridHelper);

// ═══════════════════════════════════════════════════════════════
//  RAYCASTING + INTERACTION
// ═══════════════════════════════════════════════════════════════

const raycaster  = new THREE.Raycaster();
const mouse      = new THREE.Vector2();
const tooltip    = document.getElementById('tooltip');
let   hoveredDept = null;

renderer.domElement.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(nodeObjects);

  if (hits.length > 0) {
    const dept = hits[0].object.userData.dept;
    hoveredDept = dept;
    renderer.domElement.style.cursor = 'pointer';

    document.getElementById('tt-name').textContent    = dept.name;
    document.getElementById('tt-tasks').textContent   = dept.tasks;
    document.getElementById('tt-workers').textContent = dept.workers;
    document.getElementById('tt-blockers').textContent = dept.blockers;
    document.getElementById('tt-status').textContent  = dept.status.toUpperCase();

    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 18) + 'px';
    tooltip.style.top  = (e.clientY - 20) + 'px';
  } else {
    hoveredDept = null;
    renderer.domElement.style.cursor = 'default';
    tooltip.style.display = 'none';
  }
});

// Mode buttons
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  const idx = parseInt(e.key) - 1;
  const btns = document.querySelectorAll('.mode-btn');
  if (idx >= 0 && idx < btns.length) {
    btns.forEach(b => b.classList.remove('active'));
    btns[idx].classList.add('active');
  }
});

// ═══════════════════════════════════════════════════════════════
//  HUD POPULATION
// ═══════════════════════════════════════════════════════════════

const deptList = document.getElementById('dept-list');
DEPARTMENTS.forEach(d => {
  const el = document.createElement('div');
  el.className = 'dept-item';
  el.innerHTML = `
    <div class="dept-indicator ${d.status}"></div>
    <div class="dept-name ${d.status}">${d.name}</div>
    <div class="dept-count">${d.tasks}</div>
  `;
  deptList.appendChild(el);
});

const queueEl = document.getElementById('queue-items');
ATTENTION_QUEUE.forEach(item => {
  const el = document.createElement('div');
  el.className = 'queue-item';
  el.innerHTML = `<span class="queue-bullet">›</span><span class="queue-text">${item}</span>`;
  queueEl.appendChild(el);
});

// Live clock
function updateClock() {
  const now = new Date();
  document.getElementById('live-clock').textContent =
    now.toLocaleTimeString('ru-RU', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// ═══════════════════════════════════════════════════════════════
//  ANIMATION LOOP
// ═══════════════════════════════════════════════════════════════

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Fresnel uniform
  fresnelUniforms.uTime.value = elapsed;

  // Coordinator gyroscope
  gyroRings.forEach(r => {
    r.rotation.x += r.userData.spinX;
    r.rotation.y += r.userData.spinY;
  });

  // Coordinator slow pulse scale
  const pulse = 1 + 0.025 * Math.sin(elapsed * 1.8);
  coordGroup.scale.setScalar(pulse);

  // Coordinator slow rotation
  coordGroup.rotation.y += 0.003;

  // Node wireframe spin + agent orbit
  nodeGroups.forEach(({ group }) => {
    const wire = group.userData.wire;
    if (wire) wire.rotation.y += wire.userData.spinSpeed;

    group.children.forEach(child => {
      if (child.userData.isAgent) {
        child.userData.orbitAngle += child.userData.orbitSpeed;
        const a = child.userData.orbitAngle;
        const r = child.userData.orbitR;
        child.position.x = Math.cos(a) * r;
        child.position.z = Math.sin(a) * r;
        child.position.y = Math.sin(a) * r * 0.35;
      }
      if (child.userData.isHalo) {
        child.rotation.z += 0.01;
      }
    });
  });

  // Signals
  signalTimer += delta;
  if (signalTimer >= SIGNAL_INTERVAL) {
    signalTimer = 0;
    spawnSignal();
  }

  for (let i = signals.length - 1; i >= 0; i--) {
    signals[i].update();
    if (signals[i].done) {
      signals[i].dispose();
      signals.splice(i, 1);
    }
  }

  // Core light gentle pulse
  coreLight.intensity = 55 + 15 * Math.sin(elapsed * 2.1);

  controls.update();
  composer.render();
}

animate();

// ═══════════════════════════════════════════════════════════════
//  RESIZE
// ═══════════════════════════════════════════════════════════════

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
});
