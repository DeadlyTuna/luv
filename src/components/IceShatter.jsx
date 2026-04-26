import { useEffect, useRef, useState } from 'react'
import TextReveal from './TextReveal'

export default function IceShatter() {
  const canvasRef = useRef(null)
  const [cracks, setCracks] = useState(0)
  const [shattered, setShattered] = useState(false)
  const cracksRef = useRef(0)
  const crackLinesRef = useRef([])
  const TOTAL_HITS = 12

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth
      canvas.height = canvas.parentElement.offsetHeight
      drawIce()
    }

    const drawIce = () => {
      const W = canvas.width, H = canvas.height

      // Base ice layer
      const grad = ctx.createLinearGradient(0, 0, W, H)
      grad.addColorStop(0, 'rgba(180,220,255,0.25)')
      grad.addColorStop(0.3, 'rgba(140,200,255,0.18)')
      grad.addColorStop(0.6, 'rgba(200,230,255,0.22)')
      grad.addColorStop(1, 'rgba(160,210,255,0.2)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Frost texture
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * W
        const y = Math.random() * H
        const r = 1 + Math.random() * 3
        ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.08})`
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw existing cracks
      crackLinesRef.current.forEach(crack => {
        drawCrack(ctx, crack)
      })
    }

    const drawCrack = (ctx, crack) => {
      ctx.beginPath()
      ctx.moveTo(crack.x, crack.y)
      crack.branches.forEach(branch => {
        ctx.lineTo(branch.x, branch.y)
        // Sub-branches
        branch.subs?.forEach(sub => {
          ctx.moveTo(branch.x, branch.y)
          ctx.lineTo(sub.x, sub.y)
        })
        ctx.moveTo(branch.x, branch.y)
      })
      ctx.strokeStyle = 'rgba(200,230,255,0.6)'
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 4
      ctx.shadowColor = 'rgba(200,230,255,0.5)'
      ctx.stroke()
      ctx.shadowBlur = 0

      // Inner bright line
      ctx.beginPath()
      ctx.moveTo(crack.x, crack.y)
      crack.branches.forEach(branch => {
        ctx.lineTo(branch.x, branch.y)
      })
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const handleTap = (e) => {
    if (shattered) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top

    // Generate crack pattern
    const branchCount = 4 + Math.floor(Math.random() * 5)
    const branches = []
    for (let i = 0; i < branchCount; i++) {
      const angle = (Math.PI * 2 / branchCount) * i + (Math.random() - 0.5) * 0.8
      const len = 40 + Math.random() * 100 + cracksRef.current * 8
      const bx = x + Math.cos(angle) * len
      const by = y + Math.sin(angle) * len

      // Sub-branches
      const subs = []
      const subCount = Math.floor(Math.random() * 3)
      for (let j = 0; j < subCount; j++) {
        const subAngle = angle + (Math.random() - 0.5) * 1.2
        const subLen = 20 + Math.random() * 50
        subs.push({
          x: bx + Math.cos(subAngle) * subLen,
          y: by + Math.sin(subAngle) * subLen,
        })
      }

      branches.push({ x: bx, y: by, subs })
    }

    const crack = { x, y, branches }
    crackLinesRef.current.push(crack)

    // Draw the new crack with animation
    const drawAnimated = () => {
      const W = canvas.width, H = canvas.height

      // Draw crack
      ctx.beginPath()
      ctx.moveTo(x, y)
      branches.forEach(b => {
        ctx.lineTo(b.x, b.y)
        b.subs?.forEach(s => {
          ctx.moveTo(b.x, b.y)
          ctx.lineTo(s.x, s.y)
        })
        ctx.moveTo(b.x, b.y)
      })
      ctx.strokeStyle = 'rgba(200,230,255,0.7)'
      ctx.lineWidth = 1.5 + cracksRef.current * 0.2
      ctx.shadowBlur = 6
      ctx.shadowColor = 'rgba(200,230,255,0.6)'
      ctx.stroke()
      ctx.shadowBlur = 0

      // Impact flash
      const flashGrad = ctx.createRadialGradient(x, y, 0, x, y, 30)
      flashGrad.addColorStop(0, 'rgba(255,255,255,0.3)')
      flashGrad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = flashGrad
      ctx.beginPath()
      ctx.arc(x, y, 30, 0, Math.PI * 2)
      ctx.fill()
    }
    drawAnimated()

    // Screen shake
    const section = canvas.parentElement.parentElement
    if (section) {
      section.style.transform = `translate(${(Math.random()-0.5)*8}px, ${(Math.random()-0.5)*8}px)`
      setTimeout(() => { section.style.transform = '' }, 150)
    }

    cracksRef.current++
    setCracks(cracksRef.current)

    // Check if shattered
    if (cracksRef.current >= TOTAL_HITS) {
      // SHATTER!
      setTimeout(() => {
        shatterAnimation(canvas, ctx)
      }, 300)
    }
  }

  const shatterAnimation = (canvas, ctx) => {
    const W = canvas.width, H = canvas.height

    // Create glass shards
    const shards = []
    for (let i = 0; i < 40; i++) {
      shards.push({
        x: Math.random() * W,
        y: Math.random() * H,
        w: 20 + Math.random() * 60,
        h: 20 + Math.random() * 60,
        vx: (Math.random() - 0.5) * 15,
        vy: Math.random() * 8 + 2,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        alpha: 0.8,
      })
    }

    let frame = 0
    const animate = () => {
      frame++
      ctx.clearRect(0, 0, W, H)

      shards.forEach(s => {
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.5 // gravity
        s.rot += s.vr
        s.alpha *= 0.97

        ctx.save()
        ctx.translate(s.x, s.y)
        ctx.rotate(s.rot)
        ctx.fillStyle = `rgba(180,220,255,${s.alpha * 0.3})`
        ctx.strokeStyle = `rgba(200,240,255,${s.alpha * 0.5})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(-s.w/2, -s.h/2)
        ctx.lineTo(s.w/3, -s.h/2)
        ctx.lineTo(s.w/2, s.h/3)
        ctx.lineTo(-s.w/4, s.h/2)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      })

      if (frame < 60) {
        requestAnimationFrame(animate)
      } else {
        ctx.clearRect(0, 0, W, H)
        setShattered(true)
      }
    }
    animate()
  }

  return (
    <section className="ice-shatter-section">
      <div className="ice-shatter-header">
        <TextReveal
          text="break through"
          tag="div"
          className="section-label"
          mode="words"
          stagger={0.06}
          duration={0.7}
        />
        {!shattered && (
          <div className="ice-shatter-counter">
            {TOTAL_HITS - cracks} tap{TOTAL_HITS - cracks !== 1 ? 's' : ''} remaining
          </div>
        )}
      </div>

      <div className="ice-shatter-wrap" onClick={handleTap} onTouchStart={handleTap}>
        <canvas ref={canvasRef} className="ice-shatter-canvas" />

        {!shattered && (
          <div className="ice-shatter-hint">
            🔨 tap the ice to shatter all the barriers between us
          </div>
        )}

        {shattered && (
          <div className="ice-shatter-revealed">
            <div className="ice-revealed-emoji">☀️</div>
            <div className="ice-revealed-text">
              Nothing can stand between us.<br />Not distance, not time, not ice.
            </div>
            <div className="ice-revealed-sub">happy 2 months, Cherry 💖</div>
          </div>
        )}
      </div>
    </section>
  )
}
