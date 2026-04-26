import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'

gsap.registerPlugin(ScrollTrigger)

const HIDDEN_MESSAGES = [
  { x: 15, y: 25, emoji: '💌', text: 'You make my heart race' },
  { x: 78, y: 40, emoji: '🌟', text: 'You are my lucky star' },
  { x: 35, y: 70, emoji: '🔑', text: 'You hold the key to my heart' },
  { x: 65, y: 18, emoji: '🦋', text: 'You give me butterflies' },
  { x: 50, y: 55, emoji: '💎', text: 'You are my treasure' },
]

export default function FlashlightSection() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const [found, setFound] = useState([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [allFound, setAllFound] = useState(false)
  const foundRef = useRef([])

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = section.offsetWidth
      canvas.height = section.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let mx = canvas.width / 2, my = canvas.height / 2
    let rafId

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      const W = canvas.width, H = canvas.height

      // Fill dark
      ctx.fillStyle = 'rgba(5, 3, 12, 0.97)'
      ctx.fillRect(0, 0, W, H)

      // Flashlight beam — radial gradient hole
      ctx.globalCompositeOperation = 'destination-out'
      const beamR = Math.min(W, H) * 0.12
      const grad = ctx.createRadialGradient(mx, my, 0, mx, my, beamR)
      grad.addColorStop(0, 'rgba(0,0,0,1)')
      grad.addColorStop(0.5, 'rgba(0,0,0,0.8)')
      grad.addColorStop(0.8, 'rgba(0,0,0,0.3)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(mx, my, beamR, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'

      // Subtle warm glow at cursor
      const glowGrad = ctx.createRadialGradient(mx, my, 0, mx, my, beamR * 0.6)
      glowGrad.addColorStop(0, 'rgba(255,184,140,0.06)')
      glowGrad.addColorStop(1, 'rgba(255,184,140,0)')
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(mx, my, beamR * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
    draw()

    const onMove = (e) => {
      const rect = section.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      mx = clientX - rect.left
      my = clientY - rect.top
      setMousePos({ x: mx / section.offsetWidth * 100, y: my / section.offsetHeight * 100 })

      // Check if flashlight is near a hidden message
      HIDDEN_MESSAGES.forEach((msg, i) => {
        if (foundRef.current.includes(i)) return
        const msgX = (msg.x / 100) * section.offsetWidth
        const msgY = (msg.y / 100) * section.offsetHeight
        const dist = Math.hypot(mx - msgX, my - msgY)
        const beamR = Math.min(section.offsetWidth, section.offsetHeight) * 0.12
        if (dist < beamR * 0.5) {
          foundRef.current = [...foundRef.current, i]
          setFound([...foundRef.current])
          if (foundRef.current.length === HIDDEN_MESSAGES.length) {
            setAllFound(true)
          }
        }
      })
    }

    section.addEventListener('mousemove', onMove)
    section.addEventListener('touchmove', onMove, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('touchmove', onMove)
    }
  }, [])

  return (
    <section className="flashlight-section" ref={sectionRef}>
      {/* Hidden messages layer (behind the dark canvas) */}
      <div className="flashlight-messages">
        {HIDDEN_MESSAGES.map((msg, i) => (
          <div
            key={i}
            className={`flashlight-msg ${found.includes(i) ? 'found' : ''}`}
            style={{ left: msg.x + '%', top: msg.y + '%' }}
          >
            <span className="flashlight-msg-emoji">{msg.emoji}</span>
            <span className="flashlight-msg-text">{msg.text}</span>
          </div>
        ))}
      </div>

      {/* Dark overlay canvas */}
      <canvas ref={canvasRef} className="flashlight-canvas" />

      {/* UI hints */}
      <div className="flashlight-header">
        <TextReveal
          text="whispers in the dark"
          tag="div"
          className="section-label"
          mode="words"
          stagger={0.06}
          duration={0.7}
        />
        <div className="flashlight-counter">
          {found.length} / {HIDDEN_MESSAGES.length} secrets found
        </div>
      </div>

      {!allFound && (
        <div className="flashlight-hint">
          🔦 move your cursor to search the darkness
        </div>
      )}

      {allFound && (
        <div className="flashlight-complete">
          ✨ You found all my secrets — just like you found your way to my heart ✨
        </div>
      )}
    </section>
  )
}
