import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Photos in public/photos/u/ — 1-38 skipping 25, and 28 is .jpg
const PHOTOS_U = [
  ...Array.from({ length: 24 }, (_, i) => `/photos/u/${i + 1}.png`),   // 1-24
  ...Array.from({ length: 2 },  (_, i) => `/photos/u/${i + 26}.png`),  // 26-27
  '/photos/u/28.jpg',
  ...Array.from({ length: 10 }, (_, i) => `/photos/u/${i + 29}.png`),  // 29-38
]


// Mini globe preview for photo card
function MiniGlobeCanvas({ canvasRef }) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    const SIZE = parent.clientWidth || 260
    canvas.width = SIZE; canvas.height = SIZE

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.z = 2.55

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(SIZE, SIZE)
    renderer.setClearColor(0x000510)

    // Stars
    const n = 500, pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      const r = 12 + Math.random() * 6
      pos[i*3] = r*Math.sin(ph)*Math.cos(th); pos[i*3+1] = r*Math.cos(ph); pos[i*3+2] = r*Math.sin(ph)*Math.sin(th)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.65 })))

    const texLoader = new THREE.TextureLoader()
    const earthMat = new THREE.MeshPhongMaterial({
      map: texLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'),
      specularMap: texLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'),
      specular: new THREE.Color(0x224466), shininess: 14,
    })
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), earthMat)
    scene.add(earth)
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.015, 48, 48), new THREE.MeshPhongMaterial({ color: 0x3399ff, transparent: true, opacity: 0.07, side: THREE.BackSide })))
    const sun = new THREE.DirectionalLight(0xfff5e4, 1.5); sun.position.set(4,2,4)
    scene.add(sun); scene.add(new THREE.AmbientLight(0x112244, 0.9))

    let t = 0, rafId
    const animate = () => {
      rafId = requestAnimationFrame(animate); t += 0.002
      earth.rotation.y = t * 0.15; earth.rotation.x = Math.sin(t * 0.1) * 0.1
      renderer.render(scene, camera)
    }
    animate()

    const ro = new ResizeObserver(() => {
      const s = parent.clientWidth; if (s < 10) return
      canvas.width = s; canvas.height = s; renderer.setSize(s, s)
    })
    ro.observe(parent)

    return () => { cancelAnimationFrame(rafId); renderer.dispose(); ro.disconnect() }
  }, [canvasRef])

  return null
}

function SlideshowPreviewCard({ id, previewTrackId, photos, caption, date, onOpen, glowColor }) {
  const trackRef = useRef(null)
  const previewIdxRef = useRef(0)
  const imgsRef = useRef([])

  useEffect(() => {
    const track = trackRef.current
    if (!track || !photos.length) return
    imgsRef.current = photos.map((src, i) => {
      const img = document.createElement('img')
      img.src = src; img.alt = ''; img.loading = 'eager'
      if (i === 0) img.classList.add('ss-prev-active')
      track.appendChild(img)
      return img
    })

    const timer = setInterval(() => {
      imgsRef.current[previewIdxRef.current].classList.remove('ss-prev-active')
      previewIdxRef.current = (previewIdxRef.current + 1) % photos.length
      imgsRef.current[previewIdxRef.current].classList.add('ss-prev-active')
    }, 1500)

    return () => { clearInterval(timer); track.innerHTML = '' }
  }, [photos])

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const vw = window.innerWidth, vh = window.innerHeight
    onOpen(photos, {
      t: +(rect.top / vh * 100).toFixed(2),
      ri: +((vw - rect.right) / vw * 100).toFixed(2),
      b: +((vh - rect.bottom) / vh * 100).toFixed(2),
      l: +(rect.left / vw * 100).toFixed(2),
    })
  }

  return (
    <div className="photo-frame slideshow-card" id={id} onClick={handleClick}>
      <div className="pin" />
      <div className="slideshow-face">
        <div className="slideshow-preview-track" ref={trackRef} />
        <div className="slideshow-face-overlay">
          <span className="slideshow-face-label" />
          <span className="slideshow-face-hint">tap to open</span>
        </div>
      </div>
      <div className="photo-frame-caption">{caption}</div>
      <div className="photo-frame-date">{date}</div>
    </div>
  )
}

function GlobeCard({ onGlobeOpen }) {
  const canvasRef = useRef(null)
  return (
    <div className="photo-frame globe-card-trigger" onClick={onGlobeOpen} title="Click to explore the world!">
      <div className="pin pin--globe" />
      <div className="photo-frame-img globe-preview-frame" style={{ background: '#000510', padding: 0, overflow: 'hidden' }}>
        <canvas ref={canvasRef} id="miniGlobeCanvas" />
        <MiniGlobeCanvas canvasRef={canvasRef} />
        <div className="globe-card-hint">🌍 tap to explore</div>
      </div>
      <div className="photo-frame-caption">places we'll explore</div>
      <div className="photo-frame-date">click to open &rarr;</div>
    </div>
  )
}

export default function ScrollScenes({ onOpenSlideshow, onGlobeOpen }) {
  const sectionRef = useRef(null)
  const [meFolderPhotos, setMeFolderPhotos] = useState([])

  // Probe me/ folder — 12 files known
  useEffect(() => {
    const maxCheck = 12
    const found = []
    let checked = 0
    for (let i = 1; i <= maxCheck; i++) {
      const src = `/photos/me/${i}.png`
      const img = new Image()
      img.onload = () => { found.push({ i, src }); check() }
      img.onerror = () => { check() }
      img.src = src
    }
    function check() {
      if (++checked === maxCheck) {
        found.sort((a, b) => a.i - b.i)
        setMeFolderPhotos(found.map(f => f.src))
      }
    }
  }, [])

  // GSAP scroll scenes
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const scenes = section.querySelectorAll('.scroll-scene')
    const ctx = gsap.context(() => {
      scenes.forEach(scene => {
        const backdrop = scene.querySelector('.scene-backdrop')
        const leftPanel = scene.querySelector('.photo-panel.left')
        const rightPanel = scene.querySelector('.photo-panel.right')
        const centerEl = scene.querySelector('.scene-center')

        gsap.set(backdrop, { scale: 0.7, opacity: 0, filter: 'blur(24px)' })
        if (leftPanel) gsap.set(leftPanel, { x: -200, opacity: 0, rotateZ: -12 })
        if (rightPanel) gsap.set(rightPanel, { x: 200, opacity: 0, rotateZ: 12 })
        if (centerEl) gsap.set(centerEl, { opacity: 0, y: 30 })

        const tl = gsap.timeline({
          scrollTrigger: { trigger: scene, start: 'top 80%', end: 'bottom 20%', toggleActions: 'play reverse play reverse' }
        })
        tl.to(backdrop, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' })
        if (leftPanel) tl.to(leftPanel, { x: 0, opacity: 1, rotateZ: -2, duration: 0.7, ease: 'back.out(1.4)' }, '-=0.5')
        if (rightPanel) tl.to(rightPanel, { x: 0, opacity: 1, rotateZ: 2, duration: 0.7, ease: 'back.out(1.4)' }, '<')
        if (centerEl) tl.to(centerEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')

        if (leftPanel || rightPanel) {
          const onMove = e => {
            const rect = scene.getBoundingClientRect()
            const mx = (e.clientX - rect.left) / rect.width - 0.5
            const my = (e.clientY - rect.top) / rect.height - 0.5
            if (leftPanel) gsap.to(leftPanel, { x: mx * -18, y: my * 10, duration: 0.6, ease: 'power1.out', overwrite: 'auto' })
            if (rightPanel) gsap.to(rightPanel, { x: mx * 18, y: my * 10, duration: 0.6, ease: 'power1.out', overwrite: 'auto' })
            gsap.to(backdrop, { x: mx * 8, y: my * 5, duration: 0.8, ease: 'power1.out', overwrite: 'auto' })
          }
          const onLeave = () => {
            if (leftPanel) gsap.to(leftPanel, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' })
            if (rightPanel) gsap.to(rightPanel, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' })
            gsap.to(backdrop, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' })
          }
          scene.addEventListener('mousemove', onMove)
          scene.addEventListener('mouseleave', onLeave)
        }
      })
    }, section)

    return () => ctx.revert()
  }, [meFolderPhotos])

  return (
    <section className="scroll-memory-section" ref={sectionRef}>
      {/* Scene 1 — Slideshow cards */}
      <div className="scroll-scene">
        <div className="scene-backdrop" />
        <div className="photo-panel left">
          <SlideshowPreviewCard
            id="slideshowCard"
            photos={PHOTOS_U}
            caption="You ✨"
            date="your amazing life"
            onOpen={onOpenSlideshow}
          />
        </div>
        <div className="scene-center">
          <span className="scene-center-emoji">🌸</span>
          <div className="scene-center-title">You being you</div>
          <div className="scene-center-sub">that first moment</div>
        </div>
        <div className="photo-panel right">
          <SlideshowPreviewCard
            id="slideshowCardMe"
            photos={meFolderPhotos}
            caption="Me ✨"
            date="Cuz its our anniversary lmao"
            onOpen={onOpenSlideshow}
          />
        </div>
      </div>

      {/* Scene 2 */}
      <div className="scroll-scene">
        <div className="scene-backdrop" style={{ background: 'linear-gradient(135deg,#fff8e1,#fce4ec,#e8f5e9)' }} />
        <div className="photo-panel left">
          <div className="photo-frame">
            <div className="pin" />
            <div className="photo-frame-img" style={{ background: '#fff8e1' }}><span>😂</span></div>
            <div className="photo-frame-caption">every random laugh</div>
            <div className="photo-frame-date">daily</div>
          </div>
        </div>
        <div className="scene-center">
          <span className="scene-center-emoji">💌</span>
          <div className="scene-center-title">Every little thing</div>
          <div className="scene-center-sub">good morning to good night</div>
        </div>
        <div className="photo-panel right">
          <div className="photo-frame">
            <div className="pin" />
            <div className="photo-frame-img" style={{ background: '#fce4ec' }}><span>💌</span></div>
            <div className="photo-frame-caption">every good morning text</div>
            <div className="photo-frame-date">always</div>
          </div>
        </div>
      </div>

      {/* Scene 3 — Globe */}
      <div className="scroll-scene">
        <div className="scene-backdrop" style={{ background: 'linear-gradient(135deg,#f3e5f5,#e3f2fd,#fff5f7)' }} />
        <div className="photo-panel left">
          <div className="photo-frame">
            <div className="pin" />
            <div className="photo-frame-img" style={{ background: '#f3e5f5' }}><span>🌅</span></div>
            <div className="photo-frame-caption">sunsets we'll see together</div>
            <div className="photo-frame-date">coming soon</div>
          </div>
        </div>
        <div className="scene-center">
          <span className="scene-center-emoji">✈️</span>
          <div className="scene-center-title">Our future is beautiful</div>
          <div className="scene-center-sub">places, sunsets &amp; us</div>
        </div>
        <div className="photo-panel right">
          <GlobeCard onGlobeOpen={onGlobeOpen} />
        </div>
      </div>
    </section>
  )
}
