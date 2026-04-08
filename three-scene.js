// three-scene.js — Floating particle hearts background for the memory section
// Uses Three.js r128

function initFloatingHearts(containerId, canvasId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = document.getElementById(canvasId);

  const scene = new THREE.Scene();
  const W = container.clientWidth;
  const H = container.clientHeight;

  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  // ── Particle hearts ──
  const count = 120;
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);

  const palette = [
    new THREE.Color('#e8567a'),
    new THREE.Color('#f7c0d0'),
    new THREE.Color('#d4956a'),
    new THREE.Color('#fce4ec'),
    new THREE.Color('#f9a8c9'),
  ];

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    sizes[i] = 18 + Math.random() * 32;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  // Heart sprite texture drawn on canvas
  function makeHeartTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const x = 32, y = 28, s = 14;
    ctx.moveTo(x, y + s * 0.6);
    ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 1.6, y + s * 0.8, x, y + s * 1.6);
    ctx.bezierCurveTo(x + s * 1.6, y + s * 0.8, x + s, y - s * 0.4, x, y + s * 0.6);
    ctx.fill();
    return new THREE.CanvasTexture(c);
  }

  const mat = new THREE.PointsMaterial({
    size: 0.4,
    map: makeHeartTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // ── Gentle ambient light glow plane ──
  const glowGeo = new THREE.PlaneGeometry(20, 14);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xfce4ec,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  });
  const glowPlane = new THREE.Mesh(glowGeo, glowMat);
  glowPlane.position.z = -3;
  scene.add(glowPlane);

  // ── Mouse parallax ──
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Animate ──
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.004;

    particles.rotation.y = mouseX * 0.08 + Math.sin(t * 0.3) * 0.05;
    particles.rotation.x = mouseY * 0.05 + Math.cos(t * 0.2) * 0.03;

    // Float particles upward slowly, wrap around
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.003 + Math.sin(t + i) * 0.001;
      if (pos[i * 3 + 1] > 5.5) pos[i * 3 + 1] = -5.5;
    }
    geo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  // ── Resize ──
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

// Initialize floating hearts for the memory wall and the love letter
initFloatingHearts('three-canvas-container', 'three-canvas');
initFloatingHearts('letter-canvas-container', 'letter-canvas');
// Globe is now handled by globe.js

// ═══════════════════════════════════════════════════
// 🌍 MINI GLOBE PREVIEW — rendered inside the photo card
// ═══════════════════════════════════════════════════
function initMiniGlobe() {
  const canvas = document.getElementById('miniGlobeCanvas');
  if (!canvas) return;

  const parent = canvas.parentElement;         // photo-frame-img div
  const SIZE   = parent.clientWidth || 260;
  canvas.width  = SIZE;
  canvas.height = SIZE;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.z = 2.55;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(SIZE, SIZE);
  renderer.setClearColor(0x000510);

  // ── Stars ──────────────────────────────────────────────────────────────────
  (function () {
    const n   = 500;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r  = 12 + Math.random() * 6;
      pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph);
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.65 });
    scene.add(new THREE.Points(geo, mat));
  })();

  // ── Earth ──────────────────────────────────────────────────────────────────
  const earthGeo = new THREE.SphereGeometry(1, 48, 48);
  const texLoader = new THREE.TextureLoader();

  const earthMat = new THREE.MeshPhongMaterial({
    map:         texLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'),
    specularMap: texLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'),
    specular:    new THREE.Color(0x224466),
    shininess:   14,
  });

  const earth = new THREE.Mesh(earthGeo, earthMat);
  scene.add(earth);

  // Atmosphere rim glow
  const atmGeo = new THREE.SphereGeometry(1.015, 48, 48);
  const atmMat = new THREE.MeshPhongMaterial({
    color: 0x3399ff, transparent: true, opacity: 0.07, side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(atmGeo, atmMat));

  // ── Lights ─────────────────────────────────────────────────────────────────
  const sun = new THREE.DirectionalLight(0xfff5e4, 1.5);
  sun.position.set(4, 2, 4);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x112244, 0.9));

  // ── A few coloured dots for the famous locations ───────────────────────────
  const SPOTS = [
    { lat: 48.8566,  lon:  2.3522,  color: 0xff6b9d },   // Paris
    { lat: 35.0116,  lon: 135.7681, color: 0xf48fb1 },   // Kyoto
    { lat: 25.2048,  lon: 55.2708,  color: 0xffcc80 },   // Dubai
    { lat: -8.3405,  lon: 115.0920, color: 0x80cbc4 },   // BaliL
    { lat: 19.0760,  lon: 72.8777,  color: 0xff8a65 },   // Mumbai
    { lat: 36.3932,  lon: 25.4615,  color: 0x4fc3f7 },   // Santorini
    { lat: 40.7128,  lon:-74.0060,  color: 0xce93d8 },   // New York
    { lat:-22.9068,  lon:-43.1729,  color: 0xffd740 },   // Rio
  ];

  function latLonTo3D(lat, lon, r) {
    const phi   = (90 - lat)  * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  const pinGroup = new THREE.Group();
  earth.add(pinGroup);

  SPOTS.forEach(s => {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 12, 12),
      new THREE.MeshBasicMaterial({ color: s.color })
    );
    dot.position.copy(latLonTo3D(s.lat, s.lon, 1));
    pinGroup.add(dot);
  });

  // ── Animate ────────────────────────────────────────────────────────────────
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.002; // Reduced time step for a much slower spin
    earth.rotation.y = t * 0.15; // Slow down Y axis spin
    earth.rotation.x = Math.sin(t * 0.1) * 0.1; // Gentle wobble
    renderer.render(scene, camera);
  }
  animate();

  // ── Resize when card resizes ───────────────────────────────────────────────
  const ro = new ResizeObserver(() => {
    const s = parent.clientWidth;
    if (s < 10) return;
    canvas.width  = s;
    canvas.height = s;
    renderer.setSize(s, s);
  });
  ro.observe(parent);
}

// Start the mini globe as soon as DOM is loaded
// (it runs immediately since scripts are at end of body)
initMiniGlobe();