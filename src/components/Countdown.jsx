import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'

gsap.registerPlugin(ScrollTrigger)

export default function Countdown() {
  const sectionRef = useRef(null)
  const gridRef = useRef(null)
  const daysRef = useRef(null)

  useEffect(() => {
    // Day counter
    const start = new Date('2026-02-04')
    const now = new Date()
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24))
    if (daysRef.current && days > 0) {
      daysRef.current.dataset.count = days
      daysRef.current.textContent = days
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // ── 3D Card flip entrance ──
      const cards = gridRef.current?.querySelectorAll('.stat-card')
      if (cards?.length) {
        gsap.set(cards, {
          rotateY: 90,
          rotateX: -15,
          scale: 0.7,
          opacity: 0,
          transformOrigin: 'center center',
          transformPerspective: 800,
        })

        ScrollTrigger.create({
          trigger: gridRef.current,
          start: 'top 82%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              rotateY: 0,
              rotateX: 0,
              scale: 1,
              opacity: 1,
              duration: 1.1,
              stagger: 0.15,
              ease: 'back.out(1.4)',
            })
          }
        })
      }

      // ── Counter animation ──
      const statNums = section.querySelectorAll('.stat-num[data-count]')
      statNums?.forEach(el => {
        const target = parseInt(el.dataset.count)
        ScrollTrigger.create({
          trigger: el, start: 'top 85%', once: true,
          onEnter: () => {
            gsap.fromTo({ val: 0 }, { val: target }, {
              duration: 1.5, ease: 'power2.out',
              onUpdate: function () {
                el.textContent = Math.round(this.targets()[0].val)
              }
            })
          }
        })
      })

      // ── 3D perspective tilt on scroll (scrubbed) ──
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        '--section-rotate': '8deg',
        ease: 'none',
      })

    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="countdown-section countdown-3d" ref={sectionRef}>
      <TextReveal
        text="look how far we've come"
        tag="div"
        className="section-label"
        mode="words"
        stagger={0.06}
        duration={0.7}
      />
      <TextReveal
        text="2 months of us"
        tag="h2"
        className="section-title"
        mode="chars"
        stagger={0.03}
        duration={0.9}
        delay={0.1}
        style={{ fontStyle: 'normal' }}
      />
      <div className="stats-grid" ref={gridRef}>
        <div className="stat-card">
          <div className="stat-num" ref={daysRef} data-count="59">59</div>
          <div className="stat-label">Days together</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">∞</div>
          <div className="stat-label">Memories made</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">1</div>
          <div className="stat-label">Person for me</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">❤️</div>
          <div className="stat-label">You, always</div>
        </div>
      </div>
    </section>
  )
}
