import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function HeartUnlock({ onUnlock }) {
  const canvasRef = useRef(null)
  const [unlocked, setUnlocked] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [hint, setHint] = useState('')
  const pointsRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth
      canvas.height = canvas.parentElement.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Draw background
    const drawBg = () => {
      const W = canvas.width, H = canvas.height
      ctx.fillStyle = 'rgba(5,3,12,0.98)'
      ctx.fillRect(0, 0, W, H)

      // Subtle radial glow
      const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W,H) * 0.5)
      grad.addColorStop(0, 'rgba(255,107,138,0.04)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }
    drawBg()

    return () => window.removeEventListener('resize', resize)
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const startDraw = (e) => {
    e.preventDefault()
    setDrawing(true)
    setHint('')
    pointsRef.current = [getPos(e)]
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = 'rgba(255,107,138,0.8)'
    ctx.shadowBlur = 12
    ctx.shadowColor = 'rgba(255,107,138,0.6)'
    ctx.beginPath()
    const p = getPos(e)
    ctx.moveTo(p.x, p.y)
  }

  const moveDraw = (e) => {
    if (!drawing) return
    e.preventDefault()
    const p = getPos(e)
    pointsRef.current.push(p)
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const endDraw = () => {
    if (!drawing) return
    setDrawing(false)
    const ctx = canvasRef.current.getContext('2d')
    ctx.shadowBlur = 0

    const pts = pointsRef.current
    if (pts.length < 20) {
      setHint('draw bigger!')
      clearCanvas()
      return
    }

    // Analyze if the shape is a heart
    const isHeart = analyzeHeart(pts)

    if (isHeart) {
      // SUCCESS! Ignite the drawing
      igniteDrawing(pts)
    } else {
      setHint('try drawing a heart ❤️')
      setTimeout(clearCanvas, 1500)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(5,3,12,0.98)'
    ctx.fillRect(0, 0, W, H)
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W,H) * 0.5)
    grad.addColorStop(0, 'rgba(255,107,138,0.04)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  }

  const analyzeHeart = (pts) => {
    if (pts.length < 20) return false

    // Find bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    pts.forEach(p => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y)
    })

    const w = maxX - minX
    const h = maxY - minY

    // Basic checks: must have some size and be roughly heart-proportioned
    if (w < 40 || h < 40) return false
    const ratio = w / h
    if (ratio < 0.5 || ratio > 2.5) return false

    // Check if path is roughly closed (start near end)
    const first = pts[0]
    const last = pts[pts.length - 1]
    const closeDist = Math.hypot(first.x - last.x, first.y - last.y)
    const maxDim = Math.max(w, h)
    if (closeDist > maxDim * 0.5) return false

    // Check for the "dip" at the top (the valley between the two bumps)
    // Normalize points to 0-1
    const normalized = pts.map(p => ({
      x: (p.x - minX) / w,
      y: (p.y - minY) / h,
    }))

    // Find topmost points in left and right halves
    const leftTop = normalized.filter(p => p.x < 0.5).reduce((a, b) => a.y < b.y ? a : b, { y: 1 })
    const rightTop = normalized.filter(p => p.x >= 0.5).reduce((a, b) => a.y < b.y ? a : b, { y: 1 })

    // Check for top center dip (points near x=0.5 should be lower than the humps)
    const centerTop = normalized.filter(p => p.x > 0.3 && p.x < 0.7 && p.y < 0.4)

    // Check for bottom point  
    const bottomPts = normalized.filter(p => p.y > 0.7)
    const hasBottom = bottomPts.length > 0

    // Be generous with the detection — if basic shape checks pass, accept it
    return hasBottom && (leftTop.y < 0.4 || rightTop.y < 0.4)
  }

  const igniteDrawing = (pts) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    // Ignite animation: redraw path in golden fire
    let frame = 0
    const maxFrames = 60

    const animate = () => {
      frame++
      if (frame > maxFrames) {
        // Burn away
        let burnFrame = 0
        const burnAnim = () => {
          burnFrame++
          ctx.fillStyle = `rgba(5,3,12,${0.08})`
          ctx.fillRect(0, 0, W, H)

          // Random fire particles
          for (let i = 0; i < 8; i++) {
            const idx = Math.floor(Math.random() * pts.length)
            const p = pts[idx]
            const size = 3 + Math.random() * 8
            const hue = 30 + Math.random() * 30
            ctx.fillStyle = `hsla(${hue}, 100%, ${50 + Math.random() * 30}%, ${0.8 - burnFrame * 0.02})`
            ctx.beginPath()
            ctx.arc(p.x + (Math.random()-0.5)*10, p.y - Math.random()*burnFrame*2, size, 0, Math.PI * 2)
            ctx.fill()
          }

          if (burnFrame < 50) {
            requestAnimationFrame(burnAnim)
          } else {
            // Fully revealed — trigger unlock
            setUnlocked(true)
            if (onUnlock) onUnlock()
          }
        }
        burnAnim()
        return
      }

      // Draw golden fire along path
      const progress = frame / maxFrames
      const endIdx = Math.floor(pts.length * progress)

      for (let i = Math.max(0, endIdx - 8); i < endIdx; i++) {
        const p = pts[i]
        if (!p) continue
        const hue = 30 + Math.sin(i * 0.1) * 20
        const size = 2 + Math.random() * 4
        ctx.shadowBlur = 15
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`
        ctx.fillStyle = `hsla(${hue}, 100%, ${55 + Math.random() * 25}%, 0.9)`
        ctx.beginPath()
        ctx.arc(p.x + (Math.random()-0.5)*4, p.y + (Math.random()-0.5)*4, size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      requestAnimationFrame(animate)
    }
    animate()
  }

  if (unlocked) return null

  return (
    <section className="heart-unlock-section">
      <div className="heart-unlock-prompt">
        <div className="heart-unlock-title">draw the shape of my devotion</div>
        <div className="heart-unlock-sub">to unlock what lies beneath ❤️</div>
      </div>

      <div className="heart-unlock-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="heart-unlock-canvas"
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={endDraw}
        />
      </div>

      {hint && <div className="heart-unlock-hint">{hint}</div>}
    </section>
  )
}
