import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as THREE from 'three'

const PLACES = [
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, emoji: '🗼', desc: 'City of Love & the Eiffel Tower', img: 'https://picsum.photos/seed/paris/800/500', color: 0xff6b9d },
  { name: 'Santorini', country: 'Greece', lat: 36.3932, lon: 25.4615, emoji: '🏛️', desc: 'Iconic blue domes above the Aegean Sea', img: 'https://picsum.photos/seed/santorini/800/500', color: 0x4fc3f7 },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lon: 12.3155, emoji: '🛶', desc: 'Romantic canals and gondola rides', img: 'https://picsum.photos/seed/venice/800/500', color: 0xffb300 },
  { name: 'Kyoto', country: 'Japan', lat: 35.0116, lon: 135.7681, emoji: '⛩️', desc: 'Cherry blossoms & thousand temples', img: 'https://picsum.photos/seed/kyoto/800/500', color: 0xf48fb1 },
  { name: 'Maldives', country: 'Maldives', lat: 3.2028, lon: 73.2207, emoji: '🏝️', desc: 'Crystal lagoons & overwater bungalows', img: 'https://picsum.photos/seed/maldives/800/500', color: 0x26c6da },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, emoji: '🗽', desc: 'The city that never sleeps', img: 'https://picsum.photos/seed/newyork/800/500', color: 0xce93d8 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, emoji: '🌆', desc: 'Futuristic skyline in the desert', img: 'https://picsum.photos/seed/dubai/800/500', color: 0xffcc80 },
  { name: 'Bali', country: 'Indonesia', lat: -8.3405, lon: 115.0920, emoji: '🌺', desc: 'Island of Gods & tropical paradise', img: 'https://picsum.photos/seed/bali/800/500', color: 0x80cbc4 },
  { name: 'Swiss Alps', country: 'Switzerland', lat: 46.8182, lon: 8.2275, emoji: '🏔️', desc: 'Snow-capped peaks & cozy chalets', img: 'https://picsum.photos/seed/swissalps/800/500', color: 0xb3e5fc },
  { name: 'Machu Picchu', country: 'Peru', lat: -13.1631, lon: -72.5450, emoji: '🏔️', desc: 'Ancient Inca citadel in the clouds', img: 'https://picsum.photos/seed/machupicchu/800/500', color: 0xa5d6a7 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, emoji: '🎭', desc: 'Carnival, beaches & Christ the Redeemer', img: 'https://picsum.photos/seed/riodejaneiro/800/500', color: 0xffd740 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, emoji: '🕌', desc: 'Where East meets West across the Bosphorus', img: 'https://picsum.photos/seed/istanbul/800/500', color: 0xffcc80 },
]

function latLonTo3D(lat, lon, r) {
  const phi   = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  )
}

export default function GlobeOverlay({ isOpen, onClose }) {
  const canvasRef = useRef(null)
  const readyRef  = useRef(false)   // three.js initialised
  const rafRef    = useRef(null)
  const [pinned,   setPinned]   = useState(null)
  const [expanded, setExpanded] = useState(false)

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handler = e => { if (e.key === 'Escape') onClose() }
      document.addEventListener('keydown', handler)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handler)
      }
    }
  }, [isOpen, onClose])

  // Init Three.js — only on first open, canvas must be visible
  useEffect(() => {
    if (!isOpen || readyRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    readyRef.current = true

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000510)
    const W = window.innerWidth, H = window.innerHeight
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000)
    camera.position.z = 2.8
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)

    // Stars
    const starCount = 1800
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 80 + Math.random() * 40
      starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      starPos[i*3+1] = r * Math.cos(phi)
      starPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.7 })))

    // ── Earth with real textures (CDN — same as mini globe, reliably works) ──
    const loader = new THREE.TextureLoader()
    const BASE = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets'

    const earthTex   = loader.load(`${BASE}/earth_atmos_2048.jpg`)
    const specTex    = loader.load(`${BASE}/earth_specular_2048.jpg`)

    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        map:         earthTex,
        specularMap: specTex,
        specular:    new THREE.Color(0x3366aa),
        shininess:   28,
      })
    )
    scene.add(earthMesh)

    // Atmosphere glow shell
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.025, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0x4499ff, transparent: true, opacity: 0.10, side: THREE.BackSide })
    ))

    // Cloud layer — procedurally generated so no extra network request
    const cloudC = document.createElement('canvas')
    cloudC.width = 512; cloudC.height = 256
    const cctx = cloudC.getContext('2d')
    cctx.fillStyle = 'rgba(0,0,0,0)'; cctx.clearRect(0, 0, 512, 256)
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512, y = Math.random() * 256
      const r = 6 + Math.random() * 24
      const a = 0.04 + Math.random() * 0.18
      const g = cctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)')
      cctx.fillStyle = g; cctx.beginPath(); cctx.arc(x, y, r, 0, Math.PI * 2); cctx.fill()
    }
    const cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.012, 48, 48),
      new THREE.MeshPhongMaterial({
        map: new THREE.CanvasTexture(cloudC),
        transparent: true, opacity: 0.50, depthWrite: false,
      })
    )
    scene.add(cloudMesh)

    const sun = new THREE.DirectionalLight(0xfff5e4, 2.0)
    sun.position.set(5, 3, 5)
    scene.add(sun)
    scene.add(new THREE.AmbientLight(0x223355, 1.0))

    // Pins
    const pinGroup = new THREE.Group()
    earthMesh.add(pinGroup)
    const pinMeshes = []
    PLACES.forEach((place, idx) => {
      const pos = latLonTo3D(place.lat, place.lon, 1.0)
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 16, 16),
        new THREE.MeshBasicMaterial({ color: place.color })
      )
      dot.position.copy(pos)
      dot.userData = { placeIdx: idx }
      pinGroup.add(dot)
      pinMeshes.push(dot)

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.028, 0.042, 32),
        new THREE.MeshBasicMaterial({ color: place.color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
      )
      ring.position.copy(pos.clone().multiplyScalar(1.001))
      ring.lookAt(new THREE.Vector3(0, 0, 0))
      ring.userData = { isPulse: true, phase: Math.random() * Math.PI * 2 }
      pinGroup.add(ring)
    })

    // Interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let hoveredDot = null
    let isDragging = false, dragDelta = 0
    let prevMX = 0, prevMY = 0, downX = 0, downY = 0
    let rotVelX = 0, rotVelY = 0
    const DAMP = 0.92

    canvas.addEventListener('mousedown', e => {
      isDragging = true; dragDelta = 0
      downX = prevMX = e.clientX; downY = prevMY = e.clientY
      canvas.style.cursor = 'grabbing'
    })
    window.addEventListener('mousemove', e => {
      if (!isDragging) return
      rotVelY += (e.clientX - prevMX) * 0.0012
      rotVelX += (e.clientY - prevMY) * 0.0012
      prevMX = e.clientX; prevMY = e.clientY
      dragDelta = Math.hypot(e.clientX - downX, e.clientY - downY)
    })
    window.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'grab' })

    canvas.addEventListener('mousemove', e => {
      if (isDragging) return
      mouse.x =  (e.clientX / W) * 2 - 1
      mouse.y = -(e.clientY / H) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(pinMeshes)
      if (hits.length > 0) {
        hoveredDot = hits[0].object
        canvas.style.cursor = 'pointer'
      } else {
        hoveredDot = null
        canvas.style.cursor = 'grab'
      }
    })

    canvas.addEventListener('click', e => {
      if (dragDelta > 5) return
      mouse.x =  (e.clientX / W) * 2 - 1
      mouse.y = -(e.clientY / H) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(pinMeshes)
      if (hits.length > 0) {
        setPinned(PLACES[hits[0].object.userData.placeIdx])
        setExpanded(false)
      } else {
        setPinned(null)
      }
    })

    let t = 0
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      t += 0.01
      if (!isDragging) rotVelY += 0.00015
      earthMesh.rotation.y += rotVelY
      earthMesh.rotation.x += rotVelX
      rotVelY *= DAMP; rotVelX *= DAMP
      earthMesh.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, earthMesh.rotation.x))

      // Clouds rotate independently (slightly faster and counter-tilted)
      cloudMesh.rotation.y = earthMesh.rotation.y + t * 0.008
      cloudMesh.rotation.x = earthMesh.rotation.x * 0.85

      pinGroup.children.forEach(child => {
        if (child.userData.isPulse) {
          const s = 1 + 0.35 * Math.sin(t * 2 + child.userData.phase)
          child.scale.setScalar(s)
          child.material.opacity = 0.5 - 0.3 * Math.abs(Math.sin(t * 2 + child.userData.phase))
        }
      })
      pinMeshes.forEach(m => { m.scale.setScalar(m === hoveredDot ? 1.7 + 0.2 * Math.sin(t * 6) : 1) })
      renderer.render(scene, camera)
    }
    animate()
    canvas.style.cursor = 'grab'

    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      renderer.dispose()
      window.removeEventListener('resize', onResize)
    }
  }, [isOpen]) // runs on first isOpen=true, readyRef prevents re-run

  // Always render into portal — visibility toggled by CSS class
  return createPortal(
    <div className={`globe-overlay${isOpen ? ' open' : ''}`}>
      <canvas ref={canvasRef} id="globeCanvas" />
      <button id="closeGlobe" onClick={onClose} title="Close">✖</button>
      <div id="globeTitle">
        <span className="gt-label">places</span>
        <span className="gt-main">we'll explore 🌍</span>
      </div>
      <div id="globeHint">✨ drag to spin · click a pin to discover</div>

      {pinned && (
        <div
          id="globePinCard"
          className={`visible${expanded ? ' expanded' : ''}`}
          style={{ borderColor: '#' + pinned.color.toString(16).padStart(6, '0') }}
          onClick={() => !expanded && setExpanded(true)}
        >
          <button
            className="gpc-close-expanded"
            onClick={e => { e.stopPropagation(); setExpanded(false) }}
            aria-label="Close"
          >✖</button>
          <div className="gpc-image-container">
            <img src={pinned.img} alt={pinned.name} />
          </div>
          <div className="gpc-content">
            <div className="gpc-emoji">{pinned.emoji}</div>
            <div className="gpc-name">{pinned.name}</div>
            <div className="gpc-country">{pinned.country}</div>
            <div className="gpc-desc">{pinned.desc}</div>
            <div className="gpc-longdesc">
              Can't wait to explore the beautiful sights of <b>{pinned.name}</b> with you — packing our bags, taking endless photos, and making memories that will last a lifetime. ❤️
            </div>
            {!expanded && <div className="gpc-expand-hint">CLICK TO EXPLORE</div>}
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
