// slideshow.js — Handles BOTH slideshow cards
// "You" card  → photos/u/  (1–38, no 25)
// "Me"  card  → photos/me/ (auto-detects up to 999 — just drop more files in!)

(function () {

  // ─────────────────────────────────────────
  //  PHOTO LISTS
  // ─────────────────────────────────────────

  const photosU = [
    'photos/u/1.png',  'photos/u/2.png',  'photos/u/3.png',  'photos/u/4.png',
    'photos/u/5.png',  'photos/u/6.png',  'photos/u/7.png',  'photos/u/8.png',
    'photos/u/9.png',  'photos/u/10.png', 'photos/u/11.png', 'photos/u/12.png',
    'photos/u/13.png', 'photos/u/14.png', 'photos/u/15.png', 'photos/u/16.png',
    'photos/u/17.png', 'photos/u/18.png', 'photos/u/19.png', 'photos/u/20.png',
    'photos/u/21.png', 'photos/u/22.png', 'photos/u/23.png', 'photos/u/24.png',
    'photos/u/26.png', 'photos/u/27.png', 'photos/u/28.jpg', 'photos/u/29.png',
    'photos/u/30.png', 'photos/u/31.png', 'photos/u/32.png', 'photos/u/33.png',
    'photos/u/34.png', 'photos/u/35.png', 'photos/u/36.png', 'photos/u/37.png',
    'photos/u/38.png'
  ];

  // Me folder: probe 1.png → 999.png, build list from whatever loads.
  // Any new pics you drop in (e.g. 11.png, 12.png) are auto-picked up on refresh.
  function buildMeList(maxCheck, callback) {
    const found = [];
    let checked = 0;
    for (let i = 1; i <= maxCheck; i++) {
      const src = `photos/me/${i}.png`;
      const img = new Image();
      img.onload  = () => { found.push({ i, src }); check(); };
      img.onerror = () => { check(); };
      img.src = src;
    }
    function check() {
      if (++checked === maxCheck) {
        found.sort((a, b) => a.i - b.i);
        callback(found.map(f => f.src));
      }
    }
  }

  // ─────────────────────────────────────────
  //  SHARED OVERLAY  (one overlay for both)
  // ─────────────────────────────────────────

  const overlay = document.createElement('div');
  overlay.className = 'ss-overlay';
  overlay.id = 'ssOverlay';
  overlay.innerHTML = `
    <button class="ss-close" id="ssClose" aria-label="Close">✕</button>

    <button class="ss-nav ss-nav-prev" id="ssPrev" aria-label="Previous">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>

    <div class="ss-stage">
      <div class="ss-photo-wrap" id="ssPhotoWrap"></div>
      <div class="ss-meta">
        <div class="ss-counter">
          <span id="ssCurrent">1</span><span class="ss-sep">/</span><span id="ssTotal">1</span>
        </div>
        <div class="ss-progress-bar"><div class="ss-progress-fill" id="ssProgressFill"></div></div>
        <div class="ss-dots" id="ssDots"></div>
      </div>
    </div>

    <button class="ss-nav ss-nav-next" id="ssNext" aria-label="Next">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>

    <div class="ss-hint">← → arrows &nbsp;·&nbsp; swipe &nbsp;·&nbsp; esc to close</div>
  `;
  document.body.appendChild(overlay);

  const wrap         = document.getElementById('ssPhotoWrap');
  const dotsEl       = document.getElementById('ssDots');
  const currentNumEl = document.getElementById('ssCurrent');
  const totalEl      = document.getElementById('ssTotal');
  const progressFill = document.getElementById('ssProgressFill');

  // Active gallery state
  let activePhotos  = [];
  let activeImgs    = [];
  let activeDots    = [];
  let currentIdx    = 0;
  let isOpen        = false;
  let animating     = false;
  let savedRect     = null;
  let savedCard     = null;

  // ─────────────────────────────────────────
  //  LOAD GALLERY INTO OVERLAY
  // ─────────────────────────────────────────
  function loadGallery(photos) {
    activePhotos = photos;
    const N = photos.length;

    // Clear old content
    wrap.innerHTML  = '';
    dotsEl.innerHTML = '';
    activeImgs  = [];
    activeDots  = [];
    currentIdx  = 0;

    totalEl.textContent = N;

    // Build full-size images
    photos.forEach((src, i) => {
      const img   = document.createElement('img');
      img.src     = src;
      img.alt     = `Photo ${i + 1}`;
      img.loading = i < 3 ? 'eager' : 'lazy';
      img.className = 'ss-photo' + (i === 0 ? ' ss-active' : '');
      wrap.appendChild(img);
      activeImgs.push(img);
    });

    // Build dots
    photos.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'ss-dot' + (i === 0 ? ' ss-dot-active' : '');
      d.setAttribute('aria-label', `Go to photo ${i + 1}`);
      d.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
      dotsEl.appendChild(d);
      activeDots.push(d);
    });

    updateMeta();
  }

  function updateMeta() {
    const N = activePhotos.length;
    currentNumEl.textContent = currentIdx + 1;
    progressFill.style.width = ((currentIdx + 1) / N * 100) + '%';
    activeDots.forEach((d, i) => d.classList.toggle('ss-dot-active', i === currentIdx));
    if (activeDots[currentIdx]) {
      activeDots[currentIdx].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }

  // ─────────────────────────────────────────
  //  NAVIGATE
  // ─────────────────────────────────────────
  function goTo(idx, dir) {
    const N = activePhotos.length;
    if (animating || idx === currentIdx) return;
    animating = true;
    idx = ((idx % N) + N) % N;
    dir = dir ?? (idx > currentIdx ? 1 : -1);

    const outImg = activeImgs[currentIdx];
    const inImg  = activeImgs[idx];

    gsap.set(inImg, { opacity: 0, x: dir > 0 ? '6%' : '-6%', scale: 1.04 });
    inImg.classList.add('ss-active');

    gsap.to(outImg, {
      opacity: 0, x: dir > 0 ? '-6%' : '6%', scale: 0.97,
      duration: 0.45, ease: 'power2.in',
      onComplete: () => {
        outImg.classList.remove('ss-active');
        gsap.set(outImg, { clearProps: 'all' });
      }
    });

    gsap.to(inImg, {
      opacity: 1, x: '0%', scale: 1,
      duration: 0.55, ease: 'power3.out', delay: 0.1,
      onComplete: () => { animating = false; }
    });

    currentIdx = idx;
    updateMeta();
  }

  const next = () => goTo(currentIdx + 1,  1);
  const prev = () => goTo(currentIdx - 1, -1);

  document.getElementById('ssNext').addEventListener('click', next);
  document.getElementById('ssPrev').addEventListener('click', prev);

  // ─────────────────────────────────────────
  //  OPEN / CLOSE
  // ─────────────────────────────────────────
  function openSlideshow(card) {
    if (isOpen) return;
    isOpen = true;
    savedCard = card;

    const r  = card.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    savedRect = {
      t:  +(r.top              / vh * 100).toFixed(2),
      ri: +((vw - r.right)     / vw * 100).toFixed(2),
      b:  +((vh - r.bottom)    / vh * 100).toFixed(2),
      l:  +(r.left             / vw * 100).toFixed(2)
    };

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const { t, ri, b, l } = savedRect;
    gsap.fromTo(overlay,
      { clipPath: `inset(${t}% ${ri}% ${b}% ${l}% round 14px)` },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        duration: 0.78, ease: 'expo.inOut',
        onStart: () => {
          gsap.fromTo(wrap,
            { scale: 0.88, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)', delay: 0.38 }
          );
        }
      }
    );

    gsap.fromTo(
      [document.getElementById('ssPrev'), document.getElementById('ssNext')],
      { opacity: 0, x: (i) => i === 0 ? -30 : 30 },
      { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out', delay: 0.65, stagger: 0.08 }
    );
  }

  function closeSlideshow() {
    if (!isOpen) return;
    isOpen = false;
    const { t, ri, b, l } = savedRect || { t: 20, ri: 20, b: 20, l: 20 };

    gsap.to(overlay, {
      clipPath: `inset(${t}% ${ri}% ${b}% ${l}% round 14px)`,
      duration: 0.62, ease: 'expo.inOut',
      onComplete: () => {
        overlay.style.display = 'none';
        gsap.set(overlay, { clearProps: 'clipPath' });
        document.body.style.overflow = '';
      }
    });
  }

  document.getElementById('ssClose').addEventListener('click', closeSlideshow);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSlideshow(); });

  // Keyboard + swipe
  document.addEventListener('keydown', e => {
    if (!isOpen) return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'Escape')     closeSlideshow();
  });
  let touchStartX = 0;
  overlay.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 45) dx < 0 ? next() : prev();
  });

  // ─────────────────────────────────────────
  //  INIT CARD — "YOU" (photos/u)
  // ─────────────────────────────────────────
  (function initYouCard() {
    const card         = document.getElementById('slideshowCard');
    const previewTrack = document.getElementById('previewTrack');
    if (!card || !previewTrack) return;

    const photos = photosU;
    const N = photos.length;
    let previewIdx = 0;

    const previewImgs = photos.map((src, i) => {
      const img = document.createElement('img');
      img.src = src; img.alt = ''; img.loading = 'eager';
      if (i === 0) img.classList.add('ss-prev-active');
      previewTrack.appendChild(img);
      return img;
    });

    let timer = setInterval(() => {
      previewImgs[previewIdx].classList.remove('ss-prev-active');
      previewIdx = (previewIdx + 1) % N;
      previewImgs[previewIdx].classList.add('ss-prev-active');
    }, 1500);

    // Glow pulse invite
    gsap.to(card, {
      boxShadow: '0 12px 48px rgba(232,86,122,0.35), 0 2px 8px rgba(0,0,0,0.12)',
      duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });

    card.addEventListener('click', () => {
      loadGallery(photos);
      openSlideshow(card);
      clearInterval(timer);
      // Resume after close — watch overlay visibility
      const resume = () => {
        if (!isOpen) {
          timer = setInterval(() => {
            previewImgs[previewIdx].classList.remove('ss-prev-active');
            previewIdx = (previewIdx + 1) % N;
            previewImgs[previewIdx].classList.add('ss-prev-active');
          }, 1500);
        } else {
          setTimeout(resume, 300);
        }
      };
      setTimeout(resume, 400);
    });
  })();

  // ─────────────────────────────────────────
  //  INIT CARD — "ME" (photos/me — auto-detect)
  // ─────────────────────────────────────────
  (function initMeCard() {
    const card         = document.getElementById('slideshowCardMe');
    const previewTrack = document.getElementById('previewTrackMe');
    if (!card || !previewTrack) return;

    // Probe up to 999 so new photos are picked up automatically
    buildMeList(999, function(photos) {
      if (!photos.length) return;

      const N = photos.length;
      let previewIdx = 0;

      const previewImgs = photos.map((src, i) => {
        const img = document.createElement('img');
        img.src = src; img.alt = ''; img.loading = 'eager';
        if (i === 0) img.classList.add('ss-prev-active');
        previewTrack.appendChild(img);
        return img;
      });

      let timer = setInterval(() => {
        previewImgs[previewIdx].classList.remove('ss-prev-active');
        previewIdx = (previewIdx + 1) % N;
        previewImgs[previewIdx].classList.add('ss-prev-active');
      }, 1500);

      // Glow pulse invite (slightly blue-ish for contrast with the "You" card)
      gsap.to(card, {
        boxShadow: '0 12px 48px rgba(100,180,232,0.3), 0 2px 8px rgba(0,0,0,0.12)',
        duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });

      card.addEventListener('click', () => {
        loadGallery(photos);
        openSlideshow(card);
        clearInterval(timer);
        const resume = () => {
          if (!isOpen) {
            timer = setInterval(() => {
              previewImgs[previewIdx].classList.remove('ss-prev-active');
              previewIdx = (previewIdx + 1) % N;
              previewImgs[previewIdx].classList.add('ss-prev-active');
            }, 1500);
          } else {
            setTimeout(resume, 300);
          }
        };
        setTimeout(resume, 400);
      });
    });
  })();

})();
