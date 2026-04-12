import { useEffect, useRef } from 'react'

/**
 * SpaceBackground — persistent animated starfield behind the entire site.
 * Multiple depth layers of stars + subtle nebula glows.
 */
export default function SpaceBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let W, H, rafId
    const stars = []
    const STAR_COUNT = 280

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()

    // Generate stars with depth layers
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.3 + Math.random() * 1.8,
        speed: 0.02 + Math.random() * 0.08, // twinkle speed
        phase: Math.random() * Math.PI * 2,
        depth: Math.random(), // 0 = far, 1 = near
        hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? 340 : 220) : 0, // some colored stars
      })
    }

    let t = 0
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      t += 0.008

      ctx.clearRect(0, 0, W, H)

      // Draw stars
      stars.forEach(s => {
        const flicker = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase))
        const alpha = flicker * (0.3 + s.depth * 0.7)
        const radius = s.r * (0.5 + s.depth * 0.5)

        if (s.hue !== 0) {
          ctx.fillStyle = `hsla(${s.hue}, 60%, 75%, ${alpha})`
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        }

        ctx.beginPath()
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2)
        ctx.fill()

        // Glow for brighter stars
        if (s.depth > 0.7 && radius > 1) {
          ctx.beginPath()
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, radius * 4)
          grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.15})`)
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = grad
          ctx.arc(s.x, s.y, radius * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      })
    }

    animate()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="space-bg-fixed">
      <canvas ref={canvasRef} className="space-bg-canvas" />
      <div className="space-bg-nebula" />
      <div className="space-bg-nebula space-bg-nebula-2" />
    </div>
  )
}
