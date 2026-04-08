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

})();