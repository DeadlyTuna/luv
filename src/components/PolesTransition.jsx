import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const NUM_POLES = 12

/**
 * PolesTransition — 3D rotating vertical poles that cascade-flip
 * to reveal the next section like a venetian blind.
 *
 * Props:
 *  - frontColor: CSS color/gradient for the front face (outgoing section)
 *  - backColor:  CSS color/gradient for the back face (incoming section)
 */
export default function PolesTransition({ frontColor = '#f7e8d0', backColor = '#000' }) {
  const containerRef = useRef(null)
  const polesRef = useRef([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const poles = polesRef.current.filter(Boolean)
    if (!poles.length) return

    // Set initial state
    poles.forEach(pole => {
      gsap.set(pole, {
        rotateY: 0,
        transformPerspective: 1200,
        transformOrigin: 'center center',
      })
    })

    const ctx = gsap.context(() => {
      // Create a timeline scrubbed to scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 0.6,
        }
      })

      // Stagger the pole rotations — each pole flips 180° around Y axis
      poles.forEach((pole, i) => {
        const delay = i * 0.04 // stagger
        tl.to(pole, {
          rotateY: 180,
          duration: 0.5,
          ease: 'power2.inOut',
        }, delay)
      })

    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <div className="poles-transition" ref={containerRef}>
      {Array.from({ length: NUM_POLES }, (_, i) => (
        <div
          key={i}
          className="pole"
          ref={el => polesRef.current[i] = el}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div
            className="pole-face pole-front"
            style={{ background: frontColor }}
          />
          <div
            className="pole-face pole-back"
            style={{ background: backColor }}
          />
        </div>
      ))}
    </div>
  )
}
