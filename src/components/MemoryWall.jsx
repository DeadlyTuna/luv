import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WALL_PHOTOS = Array.from({ length: 20 }, (_, i) => `/photos/memory_wall/${i + 1}.png`)

function makeHeartTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, 64, 64)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  const x = 32, y = 28, s = 14
  ctx.moveTo(x, y + s * 0.6)
  ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 1.6, y + s * 0.8, x, y + s * 1.6)
  ctx.bezierCurveTo(x + s * 1.6, y + s * 0.8, x + s, y - s * 0.4, x, y + s * 0.6)
  ctx.fill()
  return new THREE.CanvasTexture(c)
}

// Polaroid card component
function Polaroid({ src, rot }) {
  return (
    <div className="polaroid" style={{ transform: `rotate(${rot}deg)` }}>
      <img src={src} alt="memory" loading="lazy" />
    </div>
  )
}

// A single infinite marquee row — pure CSS animation, no reliance on scrollWidth
function MarqueeRow({ photos, reversed }) {
  // Triple the photos for seamless infinite loop
  const items = [...photos, ...photos, ...photos]
  return (
    <div className="wall-row-wrapper">
      <div className={`wall-marquee-inner${reversed ? ' reversed' : ''}`}>
        {items.map((src, i) => (
          <Polaroid
            key={i}
            src={src}
            rot={(((i * 7919) % 13) - 6) + (Math.random() - 0.5) * 2}
          />
        ))}
      </div>
    </div>
  )
}

export default function MemoryWall() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const headerRef = useRef(null)

  // Three.js floating hearts
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const scene = new THREE.Scene()
    const W = container.clientWidth || window.innerWidth
    const H = container.clientHeight || 600
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.z = 6

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)

    const count = 120
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#e8567a'), new THREE.Color('#f7c0d0'),
      new THREE.Color('#d4956a'), new THREE.Color('#fce4ec'), new THREE.Color('#f9a8c9'),
    ]

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.4, map: makeHeartTexture(), vertexColors: true,
      transparent: true, opacity: 0.75, depthWrite: false, sizeAttenuation: true,
    })

    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    let mouseX = 0, mouseY = 0
    const onMouseMove = e => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    document.addEventListener('mousemove', onMouseMove)

    let t = 0, rafId
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      t += 0.004
      particles.rotation.y = mouseX * 0.08 + Math.sin(t * 0.3) * 0.05
      particles.rotation.x = mouseY * 0.05 + Math.cos(t * 0.2) * 0.03
      const pos = geo.attributes.position.array
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += 0.003 + Math.sin(t + i) * 0.001
        if (pos[i * 3 + 1] > 5.5) pos[i * 3 + 1] = -5.5
      }
      geo.attributes.position.needsUpdate = true
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      renderer.dispose()
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // Header entrance
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const label = header.querySelector('.section-label')
    const title = header.querySelector('.section-title')
    gsap.set([label, title], { y: 40, opacity: 0 })
    ScrollTrigger.create({
      trigger: header, start: 'top 80%', once: true,
      onEnter: () => {
        gsap.to(label, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
        gsap.to(title, { y: 0, opacity: 1, duration: 1, delay: 0.15, ease: 'power3.out' })
      }
    })
  }, [])

  return (
    <section className="memory-scene-wrapper">
      <div className="memory-scene-header" ref={headerRef}>
        <div className="section-label">our little world</div>
        <h2 className="section-title">the memory wall</h2>
      </div>

      <div id="three-canvas-container" ref={containerRef} style={{ position: 'relative', overflow: 'hidden', minHeight: '600px' }}>
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
        />

        <div style={{ position: 'relative', zIndex: 5, paddingTop: '8vh', paddingBottom: '6vh' }}>
          <MarqueeRow photos={WALL_PHOTOS} reversed={false} />
          <div style={{ height: '2rem' }} />
          <MarqueeRow photos={WALL_PHOTOS} reversed={true} />
        </div>

        <div className="scene-scroll-hint" style={{ zIndex: 10 }}>✨ scroll to relive memories ✨</div>
      </div>
    </section>
  )
}
