import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'

gsap.registerPlugin(ScrollTrigger)

const SCRATCH_CARDS = [
  { photo: '/photos/u/1.png', label: 'Our first photo together 📸', promise: null },
  { photo: '/photos/u/5.png', label: 'That perfect day ☀️', promise: null },
  { photo: '/photos/u/10.png', label: 'My favourite smile 😊', promise: null },
  { photo: null, label: null, promise: 'One free hug — redeemable anytime 🤗' },
  { photo: '/photos/u/15.png', label: 'Us being us 💫', promise: null },
  { photo: null, label: null, promise: 'A surprise date planned by me 🌹' },
]

function ScratchCard({ card, index }) {
  const canvasRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const isDrawing = useRef(false)
  const revealedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = 280
    const H = canvas.height = 200

    // Draw the scratch overlay — shimmery silver/gold
    const drawOverlay = () => {
      const grad = ctx.createLinearGradient(0, 0, W, H)
      grad.addColorStop(0, '#c0c0c0')
      grad.addColorStop(0.3, '#e8d5b7')
      grad.addColorStop(0.5, '#d4d4d4')
      grad.addColorStop(0.7, '#e8d5b7')
      grad.addColorStop(1, '#c0c0c0')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Sparkle pattern
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * W
        const y = Math.random() * H
        const s = 1 + Math.random() * 3
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`
        ctx.beginPath()
        ctx.arc(x, y, s, 0, Math.PI * 2)
        ctx.fill()
      }

      // Text
      ctx.fillStyle = 'rgba(80,60,80,0.6)'
      ctx.font = '600 16px "DM Sans", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('✨ Scratch to reveal ✨', W / 2, H / 2)
    }
    drawOverlay()

    const scratch = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, 22, 0, Math.PI * 2)
      ctx.fill()

      // Check how much is scratched
      const imageData = ctx.getImageData(0, 0, W, H)
      let cleared = 0
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) cleared++
      }
      const pct = cleared / (W * H)
      if (pct > 0.45 && !revealedRef.current) {
        revealedRef.current = true
        setRevealed(true)
        // Fade out remaining
        gsap.to(canvas, { opacity: 0, duration: 0.6, ease: 'power2.out' })
      }
    }

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      return {
        x: (clientX - rect.left) * (W / rect.width),
        y: (clientY - rect.top) * (H / rect.height),
      }
    }

    const onDown = (e) => {
      e.preventDefault()
      isDrawing.current = true
      const { x, y } = getPos(e)
      scratch(x, y)
    }
    const onMove = (e) => {
      if (!isDrawing.current) return
      e.preventDefault()
      const { x, y } = getPos(e)
      scratch(x, y)
    }
    const onUp = () => { isDrawing.current = false }

    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseup', onUp)
    canvas.addEventListener('mouseleave', onUp)
    canvas.addEventListener('touchstart', onDown, { passive: false })
    canvas.addEventListener('touchmove', onMove, { passive: false })
    canvas.addEventListener('touchend', onUp)

    return () => {
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('mouseleave', onUp)
      canvas.removeEventListener('touchstart', onDown)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('touchend', onUp)
    }
  }, [])

  return (
    <div className={`scratch-card ${revealed ? 'revealed' : ''}`} style={{ animationDelay: `${index * 0.15}s` }}>
      <div className="scratch-card-inner">
        {/* Revealed content underneath */}
        <div className="scratch-content">
          {card.photo ? (
            <>
              <img src={card.photo} alt={card.label} className="scratch-photo" />
              <div className="scratch-label">{card.label}</div>
            </>
          ) : (
            <div className="scratch-promise">
              <div className="scratch-promise-icon">🎁</div>
              <div className="scratch-promise-text">{card.promise}</div>
              <div className="scratch-promise-valid">Valid forever ❤️</div>
            </div>
          )}
        </div>

        {/* Canvas overlay */}
        <canvas ref={canvasRef} className="scratch-canvas" />
      </div>
    </div>
  )
}

export default function ScratchCards() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll('.scratch-card')
      gsap.set(cards, {
        y: 80,
        opacity: 0,
        scale: 0.85,
        rotateY: 20,
        transformPerspective: 800,
      })
      ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            y: 0, opacity: 1, scale: 1, rotateY: 0,
            duration: 1, stagger: 0.12,
            ease: 'back.out(1.4)',
          })
        },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section className="scratch-section" ref={sectionRef}>
      <TextReveal
        text="hidden surprises"
        tag="div"
        className="section-label"
        mode="words"
        stagger={0.06}
        duration={0.7}
      />
      <TextReveal
        text="scratch to discover"
        tag="h2"
        className="section-title"
        mode="chars"
        stagger={0.03}
        duration={0.9}
        delay={0.1}
      />

      <div className="scratch-grid">
        {SCRATCH_CARDS.map((card, i) => (
          <ScratchCard key={i} card={card} index={i} />
        ))}
      </div>
    </section>
  )
}
