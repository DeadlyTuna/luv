import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'

gsap.registerPlugin(ScrollTrigger)

export default function SpaceSection() {
  const sectionRef = useRef(null)
  const starsRef   = useRef(null)
  const stars2Ref  = useRef(null)
  const imgWrapRef = useRef(null)
  const textLeftRef  = useRef(null)
  const textRightRef = useRef(null)
  const nebulaRef = useRef(null)

  useEffect(() => {
    const section  = sectionRef.current
    const stars    = starsRef.current
    const stars2   = stars2Ref.current
    const imgWrap  = imgWrapRef.current
    const tl = textLeftRef.current
    const tr = textRightRef.current
    const nebula = nebulaRef.current
    if (!section || !imgWrap || !tl || !tr) return

    const ctx = gsap.context(() => {
      // ── Initial hidden state with 3D depth ──
      gsap.set(tl, { x: -200, opacity: 0, rotateY: 45, transformPerspective: 1200 })
      gsap.set(tr, { x: 200, opacity: 0, rotateY: -45, transformPerspective: 1200 })
      gsap.set(imgWrap, { y: 200, scale: 0.6, opacity: 0, rotateX: 30, transformPerspective: 1200 })

      // ── Scroll-triggered 3D reveal ──
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'center center',
          scrub: 1.5,
        }
      })
      timeline
        .to(imgWrap, { y: 0, scale: 1, opacity: 1, rotateX: 0, duration: 1, ease: 'none' })
        .to(tl, { x: 0, opacity: 1, rotateY: 0, duration: 0.8, ease: 'none' }, '-=0.6')
        .to(tr, { x: 0, opacity: 1, rotateY: 0, duration: 0.8, ease: 'none' }, '<')

      // ── Multi-layer star parallax (scrubbed to scroll) ──
      gsap.to(stars, {
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
        y: -180,
        ease: 'none',
      })

      if (stars2) {
        gsap.to(stars2, {
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
          y: -80,
          ease: 'none',
        })
      }

      // ── Nebula glow parallax ──
      if (nebula) {
        gsap.to(nebula, {
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          y: -120,
          scale: 1.3,
          opacity: 0.6,
          ease: 'none',
        })
      }

      // ── Image slow orbit rotation ──
      gsap.to(imgWrap, {
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
        rotateY: 12,
        rotateX: -5,
        ease: 'none',
      })
    }, section)

    // ── Mouse parallax (enhanced with 3D) ──
    const handleMove = (e) => {
      const rect = section.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / rect.width  - 0.5
      const my = (e.clientY - rect.top)  / rect.height - 0.5
      gsap.to(stars, { x: mx * 50, y: my * 50, duration: 1.5, ease: 'power2.out', overwrite: 'auto' })
      if (stars2) gsap.to(stars2, { x: mx * 25, y: my * 25, duration: 2, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(imgWrap, { rotateY: mx * 15, rotateX: -my * 15, duration: 0.8, ease: 'power2.out', overwrite: 'auto' })
      if (nebula) gsap.to(nebula, { x: mx * -30, y: my * -30, duration: 2.5, ease: 'power2.out', overwrite: 'auto' })
    }
    const handleLeave = () => {
      gsap.to(stars, { x: 0, y: 0, duration: 2, ease: 'power2.out', overwrite: 'auto' })
      if (stars2) gsap.to(stars2, { x: 0, y: 0, duration: 2, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(imgWrap, { rotateY: 0, rotateX: 0, duration: 1.5, ease: 'power2.out', overwrite: 'auto' })
      if (nebula) gsap.to(nebula, { x: 0, y: 0, duration: 2.5, ease: 'power2.out', overwrite: 'auto' })
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
    <section className="space-section space-3d" ref={sectionRef}>
      {/* Multi-depth star layers */}
      <div className="stars-bg stars-bg-far" ref={starsRef} />
      <div className="stars-bg stars-bg-near" ref={stars2Ref} />
      <div className="space-nebula" ref={nebulaRef} />

      <div className="space-content">
        <div className="space-text text-left" ref={textLeftRef}>
          <TextReveal
            text="She's breathtaking"
            tag="h3"
            mode="words"
            stagger={0.08}
            duration={1.0}
          />
          <TextReveal
            text="Your smile lights up even the darkest skies. Every time you laugh, the entire world seems to pause."
            tag="p"
            mode="words"
            stagger={0.03}
            duration={0.6}
            delay={0.2}
          />
        </div>

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
          <TextReveal
            text="She's my universe"
            tag="h3"
            mode="words"
            stagger={0.08}
            duration={1.0}
          />
          <TextReveal
            text="I find endless comfort in your presence. You make everything feel so effortless, like we were written in the stars."
            tag="p"
            mode="words"
            stagger={0.03}
            duration={0.6}
            delay={0.2}
          />
        </div>
      </div>
    </section>
  )
}
