import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function RedThread() {
  const svgRef = useRef(null)
  const pathRef = useRef(null)
  const glowRef = useRef(null)
  const knotsRef = useRef([])

  useEffect(() => {
    const svg = svgRef.current
    const path = pathRef.current
    const glow = glowRef.current
    if (!svg || !path) return

    // Get total path length for draw animation
    const totalLength = path.getTotalLength()
    path.style.strokeDasharray = totalLength
    path.style.strokeDashoffset = totalLength
    if (glow) {
      glow.style.strokeDasharray = totalLength
      glow.style.strokeDashoffset = totalLength
    }

    // Animate path drawing on scroll
    gsap.to([path, glow], {
      strokeDashoffset: 0,
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
      ease: 'none',
    })

    // Animate knots appearing
    knotsRef.current.forEach((knot, i) => {
      if (!knot) return
      gsap.set(knot, { scale: 0, opacity: 0 })
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: `${(i + 1) * 12}% top`,
        end: `${(i + 1) * 12 + 3}% top`,
        scrub: true,
        onUpdate: (self) => {
          gsap.set(knot, {
            scale: self.progress,
            opacity: self.progress,
          })
        },
      })
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  // Build a flowing, organic S-curve path
  // The path goes from top to bottom of the viewport,
  // weaving left and right like a thread being pulled
  const W = 100
  const H = 6000 // tall enough to cover the full scroll
  const cx = W / 2

  // Generate flowing curves
  const segments = 12
  const segH = H / segments
  let d = `M ${cx} 0`
  const knotPositions = []

  for (let i = 0; i < segments; i++) {
    const y1 = i * segH
    const y2 = (i + 1) * segH
    const midY = (y1 + y2) / 2
    // Alternate left/right with varying amplitude
    const amp = 15 + Math.sin(i * 0.7) * 10
    const dir = i % 2 === 0 ? 1 : -1
    const cpx1 = cx + dir * amp
    const cpx2 = cx - dir * amp * 0.6

    d += ` C ${cpx1} ${y1 + segH * 0.3}, ${cpx2} ${midY + segH * 0.2}, ${cx + dir * 3} ${y2}`

    // Add knot positions at curves
    if (i > 0 && i % 2 === 0) {
      knotPositions.push({ x: cx + dir * 3, y: y2 })
    }
  }

  return (
    <div className="red-thread-container">
      <svg
        ref={svgRef}
        className="red-thread-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Glow layer */}
        <path
          ref={glowRef}
          d={d}
          className="red-thread-glow"
        />
        {/* Main thread */}
        <path
          ref={pathRef}
          d={d}
          className="red-thread-path"
        />
        {/* Knots / small hearts at intervals */}
        {knotPositions.map((pos, i) => (
          <g key={i} ref={el => knotsRef.current[i] = el} className="red-thread-knot">
            <circle cx={pos.x} cy={pos.y} r="4" className="knot-circle" />
            <text x={pos.x} y={pos.y + 1.5} textAnchor="middle" className="knot-heart" fontSize="6">♥</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
