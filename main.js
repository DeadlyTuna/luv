// main.js — Confetti, floating hearts, scroll reveal, day counter

// ── ❤️ Heart Emoji Cursor ──
(function () {
  const size = 32;
  const c    = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.font = `${size * 0.85}px serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('❤️', size / 2, size / 2 + 1);

  const url = c.toDataURL();
  // hotspot: center of the heart
  const cursorVal = `url(${url}) ${size / 2} ${size / 2}, auto`;

  // Apply to whole document
  document.documentElement.style.cursor = cursorVal;

  // Keep native pointer/text cursors on interactive elements
  const style = document.createElement('style');
  style.textContent = `
    a, button, [role="button"], input, textarea, select,
    label, .slideshow-card, .photo-frame, .stat-card,
    .globe-card-trigger, .ss-nav, .ss-close, .ss-dot,
    .explore-btn, #closeGlobe {
      cursor: url(${url}) ${size / 2} ${size / 2}, pointer !important;
    }
  `;
  document.head.appendChild(style);
})();


// ── Confetti ──
(function () {
  const confettiEl = document.getElementById('confetti');
  if (!confettiEl) return;
  const colors = ['#e8567a', '#f7c0d0', '#d4956a', '#fce4ec', '#f9a8c9', '#fff0a0'];
  for (let i = 0; i < 30; i++) {
    const s = document.createElement('span');
    s.style.cssText = `
      left:${Math.random() * 100}%;
      top:-20px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      width:${4 + Math.random() * 8}px;
      height:${4 + Math.random() * 8}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration:${4 + Math.random() * 6}s;
      animation-delay:${Math.random() * 6}s;
    `;
    confettiEl.appendChild(s);
  }
})();

// ── Scroll reveal (for non-GSAP elements) ──
(function () {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => observer.observe(el));
})();

// ── Floating hearts on click ──
(function () {
  const emojis = ['❤️', '🌸', '✨', '💕', '🥰'];
  document.addEventListener('click', e => {
    const h = document.createElement('div');
    h.className = 'float-heart';
    h.style.left = e.clientX - 12 + 'px';
    h.style.top = e.clientY - 12 + 'px';
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 2000);
  });
})();

// ── Day counter ──
(function () {
  const start = new Date('2026-02-04');
  const now = new Date();
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const el = document.getElementById('days');
  if (el && days > 0) el.dataset.count = days;
})();

// ── Envelope Open Toggle ──
(function () {
  const envGraphic = document.getElementById('envelopeGraphic');
  const envLayout = document.getElementById('letterLayout');
  if (envGraphic && envLayout) {
    envGraphic.addEventListener('click', () => {
      envLayout.classList.add('is-open');
    });
  }
})();
// 🌍 Globe control — triggered by the photo card
const openGlobe    = document.getElementById('openGlobe');
const globeOverlay = document.getElementById('globeOverlay');
const closeGlobe   = document.getElementById('closeGlobe');

let globeStarted = false;

function openGlobeOverlay() {
  globeOverlay.classList.add('active');
  setTimeout(() => {
    if (!globeStarted) {
      initGlobe();
      globeStarted = true;
    }
  }, 120);
}

if (openGlobe) {
  openGlobe.addEventListener('click', openGlobeOverlay);
}

if (closeGlobe) {
  closeGlobe.addEventListener('click', () => {
    globeOverlay.classList.remove('active');
  });
}

// 📸 Memory Wall - Dynamic Polaroids
const marqueeTop = document.getElementById('marqueeTop');
const marqueeBottom = document.getElementById('marqueeBottom');

if (marqueeTop && marqueeBottom) {
  // Helper to create a polaroid element
  const createPolaroid = (id) => {
    const angle = (Math.random() * 8 - 4).toFixed(2); // Random tilt between -4deg and +4deg
    const p = document.createElement('div');
    p.className = 'polaroid-frame-wall';
    p.style.setProperty('--tape-angle', `${(Math.random() * 10 - 5).toFixed(1)}deg`);
    p.style.transform = `rotate(${angle}deg)`;
    
    p.innerHTML = `
      <div class="polaroid-img-box">
        <img src="photos/memory_wall/${id}.png" alt="Memory ${id}" loading="lazy" />
      </div>
    `;
    return p;
  };

  // Generate for Top Row (1-10)
  // We duplicate the list to ensure the CSS infinite marquee can loop seamlessly
  for (let loop = 0; loop < 2; loop++) {
    for (let i = 1; i <= 10; i++) {
      marqueeTop.appendChild(createPolaroid(i));
    }
  }

  // Generate for Bottom Row (11-20)
  for (let loop = 0; loop < 2; loop++) {
    for (let i = 11; i <= 20; i++) {
      marqueeBottom.appendChild(createPolaroid(i));
    }
  }
}