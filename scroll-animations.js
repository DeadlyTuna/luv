// scroll-animations.js — GSAP ScrollTrigger powered memory scenes
// Each scene: backdrop pops from behind (blurry → sharp), photos slide in from sides, then retreat

(function () {
  // Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // ── Animate each .scroll-scene ──
  const scenes = document.querySelectorAll('.scroll-scene');

  scenes.forEach((scene, i) => {
    const backdrop    = scene.querySelector('.scene-backdrop');
    const leftPanel   = scene.querySelector('.photo-panel.left');
    const rightPanel  = scene.querySelector('.photo-panel.right');
    const centerEl    = scene.querySelector('.scene-center');

    // Entry state
    gsap.set(backdrop, { scale: 0.7, opacity: 0, filter: 'blur(24px)' });
    if (leftPanel)  gsap.set(leftPanel,  { x: -200, opacity: 0, rotateZ: -12 });
    if (rightPanel) gsap.set(rightPanel, { x:  200, opacity: 0, rotateZ:  12 });
    if (centerEl)   gsap.set(centerEl,   { opacity: 0, y: 30 });

    // ScrollTrigger timeline for this scene
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: false,
        toggleActions: 'play reverse play reverse',
      }
    });

    // 1. Backdrop blooms in from behind — blurry first, then sharp
    tl.to(backdrop, {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.9,
      ease: 'power3.out',
    });

    // 2. Photos slide in from both sides simultaneously
    if (leftPanel) {
      tl.to(leftPanel, {
        x: 0,
        opacity: 1,
        rotateZ: -2,
        duration: 0.7,
        ease: 'back.out(1.4)',
      }, '-=0.5');
    }
    if (rightPanel) {
      tl.to(rightPanel, {
        x: 0,
        opacity: 1,
        rotateZ: 2,
        duration: 0.7,
        ease: 'back.out(1.4)',
      }, '<');
    }

    // 3. Center text fades in
    if (centerEl) {
      tl.to(centerEl, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.3');
    }

    // 4. Hover micro-parallax on the scene
    if (leftPanel || rightPanel) {
      scene.addEventListener('mousemove', e => {
        const rect = scene.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width  - 0.5;
        const my = (e.clientY - rect.top)  / rect.height - 0.5;

        if (leftPanel) {
          gsap.to(leftPanel, { x: mx * -18, y: my * 10, duration: 0.6, ease: 'power1.out', overwrite: 'auto' });
        }
        if (rightPanel) {
          gsap.to(rightPanel, { x: mx * 18, y: my * 10, duration: 0.6, ease: 'power1.out', overwrite: 'auto' });
        }
        gsap.to(backdrop, { x: mx * 8, y: my * 5, duration: 0.8, ease: 'power1.out', overwrite: 'auto' });
      });

      scene.addEventListener('mouseleave', () => {
        if (leftPanel)  gsap.to(leftPanel,  { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        if (rightPanel) gsap.to(rightPanel, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(backdrop, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      });
    }
  });

  // ── Stat counter animation ──
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  statNums.forEach(el => {
    const target = parseInt(el.dataset.count);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo({ val: 0 }, { val: target }, {
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val);
          }
        });
      }
    });
  });

  // ── Stat cards stagger from below ──
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length) {
    gsap.set(statCards, { y: 60, opacity: 0, scale: 0.92 });
    ScrollTrigger.create({
      trigger: '.stats-grid',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(statCards, {
          y: 0, opacity: 1, scale: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'back.out(1.6)',
        });
      }
    });
  }

  // ── Countdown section title parallax ──
  const countdownTitle = document.querySelector('.countdown-section .section-title');
  const countdownLabel = document.querySelector('.countdown-section .section-label');
  if (countdownTitle) {
    gsap.set(countdownTitle, { y: 40, opacity: 0 });
    gsap.set(countdownLabel, { y: 20, opacity: 0 });
    ScrollTrigger.create({
      trigger: '.countdown-section',
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(countdownLabel, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
        gsap.to(countdownTitle, { y: 0, opacity: 1, duration: 1, delay: 0.15, ease: 'power3.out' });
      }
    });
  }


  // ── Space Vibe Animation ──
  const spaceSection = document.querySelector('.space-section');
  if (spaceSection) {
    const stars = spaceSection.querySelector('.stars-bg');
    const texts = spaceSection.querySelectorAll('.space-text');
    const imgWrap = spaceSection.querySelector('.space-image-wrapper');

    // Scroll reveal timeline
    const spaceTl = gsap.timeline({
      scrollTrigger: {
        trigger: spaceSection,
        start: 'top 70%',
        end: 'bottom 20%',
        toggleActions: 'play reverse play reverse',
      }
    });

    // Fly in everything from below
    gsap.set(texts[0], { y: 120, opacity: 0 });
    gsap.set(texts[1], { y: 120, opacity: 0 });
    gsap.set(imgWrap, { y: 160, scale: 0.85, opacity: 0 });

    spaceTl.to(imgWrap, { y: 0, scale: 1, opacity: 1, duration: 1.6, ease: 'power3.out' });
    spaceTl.to(texts[0], { y: 0, opacity: 1, duration: 1.4, ease: 'power3.out' }, '-=1.1');
    spaceTl.to(texts[1], { y: 0, opacity: 1, duration: 1.4, ease: 'power3.out' }, '-=1.1');

    // Interactive Mouse Parallax
    spaceSection.addEventListener('mousemove', e => {
      const rect = spaceSection.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(stars, { x: mx * 40, y: my * 40, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(imgWrap, { rotateY: mx * 10, rotateX: -my * 10, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
    });

    spaceSection.addEventListener('mouseleave', () => {
      gsap.to(stars, { x: 0, y: 0, duration: 2, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(imgWrap, { rotateY: 0, rotateX: 0, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });
    });
  }

  // ── Letter / Envelope section entrance ──
  const letterSection = document.querySelector('.letter-section');
  if (letterSection) {
    const envGraphic = letterSection.querySelector('.envelope-graphic');
    const letterLabel = letterSection.querySelector('.section-label');

    if (envGraphic) {
      gsap.set(envGraphic, { y: 100, opacity: 0, scale: 0.9 });
      gsap.set(letterLabel, { y: 30, opacity: 0 });

      const letterTl = gsap.timeline({
        scrollTrigger: {
          trigger: letterSection,
          start: 'top 70%',
          once: true,
        }
      });

      letterTl.to(letterLabel, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
      letterTl.to(envGraphic, { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.4)' }, '-=0.3');
    }
  }

  // ── Memory scene header entrance ──
  const memHeader = document.querySelector('.memory-scene-header');
  if (memHeader) {
    const memLabel = memHeader.querySelector('.section-label');
    const memTitle = memHeader.querySelector('.section-title');
    gsap.set([memLabel, memTitle], { y: 40, opacity: 0 });
    ScrollTrigger.create({
      trigger: memHeader,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(memLabel, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
        gsap.to(memTitle, { y: 0, opacity: 1, duration: 1, delay: 0.15, ease: 'power3.out' });
      }
    });
  }

})();