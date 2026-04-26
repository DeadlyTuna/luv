import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'

gsap.registerPlugin(ScrollTrigger)

// Heart shape parametric equation
function heartPoint(t, scale) {
  const x = 16 * Math.pow(Math.sin(t), 3)
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t))
  return { x: x * scale, y: y * scale }
}

export default function ChaosHeart() {
  const canvasRef = useRef(null)
  const sectionRef = useRef(null)
  const [assembled, setAssembled] = useState(false)
  const assembledRef = useRef(false)
  const clickedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = section.offsetWidth
      canvas.height = Math.min(section.offsetHeight, 600)
    }
    resize()
    window.addEventListener('resize', resize)

    const PARTICLE_COUNT = 200
    const particles = []

    // Initialize chaotic particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2
      const heartPos = heartPoint(angle, 12)
      particles.push({
        // Current position (chaotic)
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        // Velocity
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        // Heart target position (center of canvas + heart offset)
        tx: heartPos.x,
        ty: heartPos.y,
        // Visual
        size: 2 + Math.random() * 3,
        hue: 340 + Math.random() * 30,
        alpha: 0.5 + Math.random() * 0.5,
        // State
        assembling: false,
        assembled: false,
      })
    }

    let t = 0
    let magnetStrength = 0

    const draw = () => {
      requestAnimationFrame(draw)
      t += 0.016
      const W = canvas.width, H = canvas.height
      const cx = W / 2, cy = H / 2

      // Fade trail
      ctx.fillStyle = 'rgba(5, 3, 12, 0.15)'
      ctx.fillRect(0, 0, W, H)

      particles.forEach(p => {
        if (clickedRef.current && !assembledRef.current) {
          // Magnetic pull toward heart shape
          magnetStrength = Math.min(magnetStrength + 0.002, 1)
          const targetX = cx + p.tx
          const targetY = cy + p.ty - 20
          const dx = targetX - p.x
          const dy = targetY - p.y
          const dist = Math.hypot(dx, dy)

          // Accelerate toward target with elastic feel
          p.vx += dx * 0.008 * magnetStrength
          p.vy += dy * 0.008 * magnetStrength
          p.vx *= 0.96
          p.vy *= 0.96

          p.x += p.vx
          p.y += p.vy

          // Check if assembled
          if (dist < 3 && !p.assembled) {
            p.assembled = true
            p.x = targetX
            p.y = targetY
          }

          // Check if all assembled
          if (particles.every(pp => pp.assembled) && !assembledRef.current) {
            assembledRef.current = true
            setAssembled(true)
          }
        } else if (assembledRef.current) {
          // Gentle floating / breathing when assembled
          const targetX = cx + p.tx
          const targetY = cy + p.ty - 20
          const breathe = 1 + Math.sin(t * 2) * 0.03
          p.x = cx + p.tx * breathe
          p.y = cy + (p.ty - 20) * breathe
        } else {
          // Chaotic bouncing
          p.x += p.vx
          p.y += p.vy

          // Bounce off walls
          if (p.x < 0 || p.x > W) p.vx *= -0.9
          if (p.y < 0 || p.y > H) p.vy *= -0.9

          // Keep in bounds
          p.x = Math.max(0, Math.min(W, p.x))
          p.y = Math.max(0, Math.min(H, p.y))

          // Slight gravity toward center for visual interest
          p.vx += (cx - p.x) * 0.0001
          p.vy += (cy - p.y) * 0.0001
        }

        // Draw particle
        const glow = assembledRef.current ? 8 : 3
        ctx.shadowBlur = glow
        ctx.shadowColor = `hsla(${p.hue}, 80%, 65%, 0.6)`
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Draw connections between nearby assembled particles
      if (assembledRef.current) {
        ctx.strokeStyle = 'rgba(255,107,138,0.08)'
        ctx.lineWidth = 0.5
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const dist = Math.hypot(dx, dy)
            if (dist < 30) {
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }
      }
    }
    draw()

    return () => window.removeEventListener('resize', resize)
  }, [])

  const handleClick = () => {
    if (!clickedRef.current) {
      clickedRef.current = true
    }
  }

  return (
    <section className="chaos-heart-section" ref={sectionRef}>
      <TextReveal
        text="chaos becomes love"
        tag="div"
        className="section-label"
        mode="words"
        stagger={0.06}
        duration={0.7}
      />
      <TextReveal
        text="click to find order"
        tag="h2"
        className="section-title"
        mode="chars"
        stagger={0.03}
        duration={0.9}
        delay={0.1}
      />

      <div className="chaos-heart-canvas-wrap" onClick={handleClick}>
        <canvas ref={canvasRef} className="chaos-heart-canvas" />
        {!clickedRef.current && !assembled && (
          <div className="chaos-heart-hint">
            ✨ click anywhere to create order from chaos ✨
          </div>
        )}
        {assembled && (
          <div className="chaos-heart-message">
            just like that, everything fell into place when I found you 💖
          </div>
        )}
      </div>
    </section>
  )
}
