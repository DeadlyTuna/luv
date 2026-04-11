import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SpaceSection() {
  const sectionRef = useRef(null)
  const starsRef   = useRef(null)
  const imgWrapRef = useRef(null)
  const textLeftRef  = useRef(null)
  const textRightRef = useRef(null)

  useEffect(() => {
    const section  = sectionRef.current
    const stars    = starsRef.current
    const imgWrap  = imgWrapRef.current
    const tl = textLeftRef.current
    const tr = textRightRef.current
    if (!section || !imgWrap || !tl || !tr) return

    const ctx = gsap.context(() => {
      // Initial hidden state
      gsap.set(tl,      { y: 120, opacity: 0 })
      gsap.set(tr,      { y: 120, opacity: 0 })
      gsap.set(imgWrap, { y: 160, scale: 0.85, opacity: 0 })

      // Scroll-triggered reveal
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'bottom 20%',
          toggleActions: 'play reverse play reverse',
        }
      })
      timeline
        .to(imgWrap, { y: 0, scale: 1, opacity: 1, duration: 1.6, ease: 'power3.out' })
        .to(tl,      { y: 0, opacity: 1, duration: 1.4, ease: 'power3.out' }, '-=1.1')
        .to(tr,      { y: 0, opacity: 1, duration: 1.4, ease: 'power3.out' }, '<')
    }, section)

    // Mouse parallax
    const handleMove = (e) => {
      const rect = section.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / rect.width  - 0.5
      const my = (e.clientY - rect.top)  / rect.height - 0.5
      gsap.to(stars,   { x: mx * 40, y: my * 40, duration: 1.5, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(imgWrap, { rotateY: mx * 10, rotateX: -my * 10, duration: 0.8, ease: 'power2.out', overwrite: 'auto' })
    }
    const handleLeave = () => {
      gsap.to(stars,   { x: 0, y: 0, duration: 2, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(imgWrap, { rotateY: 0, rotateX: 0, duration: 1.5, ease: 'power2.out', overwrite: 'auto' })
    }

    section.addEventListener('mousemove', handleMove)
    section.addEventListener('mouseleave', handleLeave)

    return () => {
      ctx.revert()
      section.removeEventListener('mousemove', handleMove)
      section.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <section className="space-section" ref={sectionRef}>
      <div className="stars-bg" ref={starsRef} />
      <div className="space-content">
        <div className="space-text text-left" ref={textLeftRef}>
          <h3>She&rsquo;s breathtaking</h3>
          <p>Your smile lights up even the darkest skies. Every time you laugh, the entire world seems to pause.</p>
        </div>

        {/* Image wrapper — hover handled purely by CSS */}
        <div className="space-image-wrapper" ref={imgWrapRef}>
          <div className="space-image-glow" />
          <img
            src="/photos/u/37.png"
            alt="Her"
            className="space-image space-image-outline"
          />
          <img
            src="/photos/u/36.png"
            alt="Her"
            className="space-image space-image-hover"
          />
        </div>

        <div className="space-text text-right" ref={textRightRef}>
          <h3>She&rsquo;s my universe</h3>
          <p>I find endless comfort in your presence. You make everything feel so effortless, like we were written in the stars.</p>
        </div>
      </div>
    </section>
  )
}
