// globe.js — Interactive 3D Earth with famous tourist place pins
// Triggered when #openGlobe is clicked

let globeInitialized = false;

function initGlobe() {
  if (globeInitialized) return;
  globeInitialized = true;

  const overlay = document.getElementById('globeOverlay');
  const canvas  = document.getElementById('globeCanvas');

  // ── Scene / Camera / Renderer ──────────────────────────────────────────────
  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x000510);

  const W = window.innerWidth;
  const H = window.innerHeight;

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
  camera.position.z = 2.8;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(W, H);

  // ── Stars ──────────────────────────────────────────────────────────────────
  (function addStars() {
    const count = 1800;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 80 + Math.random() * 40;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo  = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat  = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(geo, mat));
  })();

  // ── Earth ──────────────────────────────────────────────────────────────────
  const earthGeo = new THREE.SphereGeometry(1, 64, 64);
  const texLoader = new THREE.TextureLoader();

  // Use a reliable earth texture
  const earthMat = new THREE.MeshPhongMaterial({
    map:          texLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'),
    specularMap:  texLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'),
    specular:     new THREE.Color(0x2a4a6a),
    shininess:    18,
  });

  const earth = new THREE.Mesh(earthGeo, earthMat);
  scene.add(earth);

  // Atmosphere glow
  const atmGeo = new THREE.SphereGeometry(1.018, 64, 64);
  const atmMat = new THREE.MeshPhongMaterial({
    color:       0x4488ff,
    transparent: true,
    opacity:     0.08,
    side:        THREE.BackSide,
  });
  scene.add(new THREE.Mesh(atmGeo, atmMat));

  // ── Lighting ───────────────────────────────────────────────────────────────
  const sunLight = new THREE.DirectionalLight(0xfff5e4, 1.6);
  sunLight.position.set(5, 3, 5);
  scene.add(sunLight);

  const ambLight = new THREE.AmbientLight(0x112244, 0.8);
  scene.add(ambLight);

  // ── Tourist places data ────────────────────────────────────────────────────
  const PLACES = [
    { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, emoji: '🗼', desc: 'City of Love & the Eiffel Tower', img: 'photos/destinations/paris.jpg', color: 0xff6b9d },
    { name: 'Santorini', country: 'Greece', lat: 36.3932, lon: 25.4615, emoji: '🏛️', desc: 'Iconic blue domes above the Aegean Sea', img: 'https://picsum.photos/seed/santorini/800/500', color: 0x4fc3f7 },
    { name: 'Venice', country: 'Italy', lat: 45.4408, lon: 12.3155, emoji: '🛶', desc: 'Romantic canals and gondola rides', img: 'photos/destinations/venice.jpg', color: 0xffb300 },
    { name: 'Kyoto', country: 'Japan', lat: 35.0116, lon: 135.7681, emoji: '⛩️', desc: 'Cherry blossoms & thousand temples', img: 'photos/destinations/kyoto.jpg', color: 0xf48fb1 },
    { name: 'Maldives', country: 'Maldives', lat: 3.2028, lon: 73.2207, emoji: '🏝️', desc: 'Crystal lagoons & overwater bungalows', img: 'photos/destinations/maldives.jpg', color: 0x26c6da },
    { name: 'Machu Picchu', country: 'Peru', lat: -13.1631, lon: -72.5450, emoji: '🏔️', desc: 'Ancient Inca citadel in the clouds', img: 'https://picsum.photos/seed/machupicchu/800/500', color: 0xa5d6a7 },
    { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, emoji: '🗽', desc: 'The city that never sleeps', img: 'photos/destinations/newyork.jpg', color: 0xce93d8 },
    { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, emoji: '🌆', desc: 'Futuristic skyline in the desert', img: 'photos/destinations/dubai.jpg', color: 0xffcc80 },
    { name: 'Bali', country: 'Indonesia', lat: -8.3405, lon: 115.0920, emoji: '🌺', desc: 'Island of Gods & tropical paradise', img: 'photos/destinations/bali.jpg', color: 0x80cbc4 },
    { name: 'Swiss Alps', country: 'Switzerland', lat: 46.8182, lon: 8.2275, emoji: '🏔️', desc: 'Snow-capped peaks & cozy chalets', img: 'photos/destinations/swissalps.jpg', color: 0xb3e5fc },
    { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378, emoji: '🏰', desc: 'Fairytale old town & medieval bridges', img: 'photos/destinations/prague.jpg', color: 0xffab91 },
    { name: 'Amalfi Coast', country: 'Italy', lat: 40.6333, lon: 14.6029, emoji: '🚢', desc: 'Cliffside villages above turquoise sea', img: 'photos/destinations/amalfi.jpg', color: 0x80deea },
    { name: 'Queenstown', country: 'New Zealand', lat: -45.0312, lon: 168.6626, emoji: '🏄', desc: 'Adventure capital of the world', img: 'https://picsum.photos/seed/queenstown/800/500', color: 0x69f0ae },
    { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, emoji: '🎭', desc: 'Carnival, beaches & Christ the Redeemer', img: 'photos/destinations/rio.jpg', color: 0xffd740 },
    { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, emoji: '🌊', desc: 'City of dreams on the Arabian Sea', img: 'https://picsum.photos/seed/mumbai/800/500', color: 0xff8a65 },
    { name: 'Havana', country: 'Cuba', lat: 23.1136, lon: -82.3666, emoji: '🎺', desc: 'Vintage charm & colorful colonial streets', img: 'https://picsum.photos/seed/havana/800/500', color: 0xf48fb1 },
    { name: 'Banff', country: 'Canada', lat: 51.1784, lon: -115.5708, emoji: '🦌', desc: 'Turquoise lakes & Rocky Mountain wilderness', img: 'photos/destinations/banff.jpg', color: 0x80cbc4 },
    { name: 'Iceland', country: 'Iceland', lat: 64.9631, lon: -19.0208, emoji: '🌋', desc: 'Northern Lights & fire & ice landscape', img: 'https://picsum.photos/seed/iceland/800/500', color: 0x9fa8da },
    { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, emoji: '🦁', desc: 'Where oceans meet under Table Mountain', img: 'photos/destinations/capetown.jpg', color: 0xa5d6a7 },
    { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, emoji: '🕌', desc: 'Where East meets West across the Bosphorus', img: 'https://picsum.photos/seed/istanbul/800/500', color: 0xffcc80 },
  ];

  // ── Helper: lat/lon → 3D vector ────────────────────────────────────────────
  function latLonTo3D(lat, lon, r) {
    const phi   = (90 - lat)  * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // ── Build pin meshes ────────────────────────────────────────────────────────
  const pinGroup = new THREE.Group();
  earth.add(pinGroup);                 // pins rotate with earth

  const pinMeshes = [];                // for raycasting

  PLACES.forEach((place, idx) => {
    const pos = latLonTo3D(place.lat, place.lon, 1.0);

    // Glowing dot — larger radius for easier clicking
    const dotGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: place.color });
    const dot    = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(pos);
    dot.userData = { placeIdx: idx };
    pinGroup.add(dot);
    pinMeshes.push(dot);

    // Pulsing ring
    const ringGeo = new THREE.RingGeometry(0.028, 0.040, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: place.color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const ring    = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos.clone().multiplyScalar(1.001));
    ring.lookAt(new THREE.Vector3(0, 0, 0));    // face inward, will flip
    ring.userData = { isPulse: true, phase: Math.random() * Math.PI * 2 };
    pinGroup.add(ring);
  });

  // ── Info card DOM ──────────────────────────────────────────────────────────
  const card = document.createElement('div');
  card.id = 'globePinCard';
  card.innerHTML = `
    <button class="gpc-close-expanded" id="gpcCloseExp" aria-label="Close expanded view">✖</button>
    <div class="gpc-image-container">
      <img src="" id="gpcImg" alt="Location preview" />
    </div>
    <div class="gpc-content">
      <div class="gpc-emoji" id="gpcEmoji">🗼</div>
      <div class="gpc-name"  id="gpcName">Paris</div>
      <div class="gpc-country" id="gpcCountry">France</div>
      <div class="gpc-desc"  id="gpcDesc">City of Love & the Eiffel Tower</div>
      <div class="gpc-longdesc" id="gpcLongDesc"></div>
      <div class="gpc-expand-hint" id="gpcExpandHint">CLICK TO EXPLORE</div>
    </div>
  `;
  overlay.appendChild(card);

  // Card click logic to trigger expand
  card.addEventListener('click', e => {
    // If clicking the close button when expanded, just collapse it
    if (e.target.id === 'gpcCloseExp') {
      card.classList.remove('expanded');
      e.stopPropagation();
      return;
    }
    // Expand if not already expanded
    if (!card.classList.contains('expanded')) {
      card.classList.add('expanded');
    }
  });

  // ── Title & hint overlays ──────────────────────────────────────────────────
  const titleEl = document.createElement('div');
  titleEl.id = 'globeTitle';
  titleEl.innerHTML = `<span class="gt-label">places</span><span class="gt-main">we'll explore 🌍</span>`;
  overlay.appendChild(titleEl);

  const hintEl = document.createElement('div');
  hintEl.id = 'globeHint';
  hintEl.textContent = '✨ drag to spin · click a pin to discover';
  overlay.appendChild(hintEl);

  // ── Raycaster & mouse ─────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const mouse     = new THREE.Vector2();
  let   hoveredDot = null;

  function updateMouse(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    mouse.x =  (x / window.innerWidth)  * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
  }

  let cardPinned = false;   // true after user clicked a pin

  canvas.addEventListener('mousemove', e => {
    if (isDragging) return;   // skip hover checks during drag
    updateMouse(e);

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(pinMeshes);

    if (hits.length > 0) {
      canvas.style.cursor = 'pointer';
      hoveredDot = hits[0].object;
    } else {
      canvas.style.cursor = 'grab';
      hoveredDot = null;
      // Only auto-hide card while cursor moves if it wasn't pinned by a click
      if (!cardPinned) card.classList.remove('visible');
    }
  });

  canvas.addEventListener('click', e => {
    if (dragDelta > 5) return; // was a drag, not a click
    updateMouse(e);

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(pinMeshes);

    if (hits.length > 0) {
      const place = PLACES[hits[0].object.userData.placeIdx];
      // Reset expanded state and populate card
      card.classList.remove('expanded');
      
      document.getElementById('gpcEmoji').textContent   = place.emoji;
      document.getElementById('gpcName').textContent    = place.name;
      document.getElementById('gpcCountry').textContent = place.country;
      document.getElementById('gpcDesc').textContent    = place.desc;
      document.getElementById('gpcImg').src             = place.img;
      document.getElementById('gpcLongDesc').innerHTML  = `Can't wait to explore the beautiful sights of <b>${place.name}</b> with you. Packing our bags, taking endless photos, and making memories that will last a lifetime. ❤️`;
      
      card.style.borderColor = '#' + place.color.toString(16).padStart(6, '0');
      card.classList.add('visible');
      cardPinned = true;
    } else {
      card.classList.remove('visible');
      card.classList.remove('expanded');
      cardPinned = false;
    }
  });

  // ── Drag to rotate ─────────────────────────────────────────────────────────
  let isDragging = false;
  let prevMouseX = 0, prevMouseY = 0;
  let mouseDownX = 0, mouseDownY = 0;  // track start of click
  let dragDelta  = 0;
  let rotVelX = 0, rotVelY = 0;       // momentum
  const DRAG_DAMP = 0.92;

  canvas.addEventListener('mousedown', e => {
    isDragging  = true;
    dragDelta   = 0;
    mouseDownX  = e.clientX;
    mouseDownY  = e.clientY;
    prevMouseX  = e.clientX;
    prevMouseY  = e.clientY;
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouseX;
    const dy = e.clientY - prevMouseY;
    rotVelY    += dx * 0.0012; // Reduced drag sensitivity (was 0.004)
    rotVelX    += dy * 0.0012; // Reduced drag sensitivity
    prevMouseX  = e.clientX;
    prevMouseY  = e.clientY;
    // Use straight-line distance from mousedown start for click discrimination
    const totalDx = e.clientX - mouseDownX;
    const totalDy = e.clientY - mouseDownY;
    dragDelta = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });

  // Touch support
  let prevTouchX = 0, prevTouchY = 0;
  canvas.addEventListener('touchstart', e => {
    prevTouchX = e.touches[0].clientX;
    prevTouchY = e.touches[0].clientY;
    isDragging = true; dragDelta = 0;
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const dx = e.touches[0].clientX - prevTouchX;
    const dy = e.touches[0].clientY - prevTouchY;
    rotVelY   += dx * 0.0012; // Reduced touch drag sensitivity
    rotVelX   += dy * 0.0012; 
    prevTouchX = e.touches[0].clientX;
    prevTouchY = e.touches[0].clientY;
  }, { passive: false });
  canvas.addEventListener('touchend', () => { isDragging = false; });

  // ── Animate ───────────────────────────────────────────────────────────────
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    // Auto-rotate (slow) — only when not dragging
    if (!isDragging) {
      rotVelY += 0.00015; // Decreased from 0.001 to make the auto-drift much slower
    }

    // Apply momentum
    earth.rotation.y += rotVelY;
    earth.rotation.x += rotVelX;
    rotVelY *= DRAG_DAMP;
    rotVelX *= DRAG_DAMP;

    // Clamp vertical tilt
    earth.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, earth.rotation.x));

    // Pulse rings
    pinGroup.children.forEach(child => {
      if (child.userData.isPulse) {
        const s = 1 + 0.35 * Math.sin(t * 2 + child.userData.phase);
        child.scale.setScalar(s);
        child.material.opacity = 0.5 - 0.3 * Math.abs(Math.sin(t * 2 + child.userData.phase));
      }
    });

    // Hover glow
    if (hoveredDot) {
      hoveredDot.scale.setScalar(1.6 + 0.2 * Math.sin(t * 6));
    }
    pinMeshes.forEach(m => {
      if (m !== hoveredDot) m.scale.setScalar(1);
    });

    renderer.render(scene, camera);
  }
  animate();

  // ── Resize ────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  canvas.style.cursor = 'grab';
}
