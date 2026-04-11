import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Countdown() {
  const sectionRef = useRef(null)
  const labelRef = useRef(null)
  const titleRef = useRef(null)
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
    const ctx = gsap.context(() => {
      // Title entrance
      if (labelRef.current && titleRef.current) {
        gsap.set(titleRef.current, { y: 40, opacity: 0 })
        gsap.set(labelRef.current, { y: 20, opacity: 0 })
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            gsap.to(labelRef.current, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
            gsap.to(titleRef.current, { y: 0, opacity: 1, duration: 1, delay: 0.15, ease: 'power3.out' })
          }
        })
      }

      // Stat cards stagger
      const cards = gridRef.current?.querySelectorAll('.stat-card')
      if (cards?.length) {
        gsap.set(cards, { y: 60, opacity: 0, scale: 0.92 })
        ScrollTrigger.create({
          trigger: gridRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              y: 0, opacity: 1, scale: 1,
              duration: 0.9, stagger: 0.12,
              ease: 'back.out(1.6)',
            })
          }
        })
      }

      // Counter animation
      const statNums = sectionRef.current?.querySelectorAll('.stat-num[data-count]')
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
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="countdown-section" ref={sectionRef}>
      <div className="section-label reveal" ref={labelRef}>look how far we've come</div>
      <h2 className="section-title reveal" ref={titleRef}>
        2 months of <em style={{ fontStyle: 'italic', color: 'var(--rose)' }}>us</em>
      </h2>
      <div className="stats-grid" ref={gridRef}>
        <div className="stat-card reveal">
          <div className="stat-num" ref={daysRef} data-count="59">59</div>
          <div className="stat-label">Days together</div>
        </div>
        <div className="stat-card reveal" style={{ transitionDelay: '0.1s' }}>
          <div className="stat-num">∞</div>
          <div className="stat-label">Memories made</div>
        </div>
        <div className="stat-card reveal" style={{ transitionDelay: '0.2s' }}>
          <div className="stat-num">1</div>
          <div className="stat-label">Person for me</div>
        </div>
        <div className="stat-card reveal" style={{ transitionDelay: '0.3s' }}>
          <div className="stat-num">❤️</div>
          <div className="stat-label">You, always</div>
        </div>
      </div>
    </section>
  )
}
