import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const subRef = useRef(null)
  const tagRef = useRef(null)
  const scrollRef = useRef(null)
  const bgLayer1Ref = useRef(null)
  const bgLayer2Ref = useRef(null)

  // 3D Scroll parallax — scrubbed to scroll position
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Multi-layer parallax depth on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        }
      })

      // Title flies backward in 3D space
      if (titleRef.current) {
        tl.to(titleRef.current, {
          y: 150,
          scale: 0.75,
          rotateX: 25,
          opacity: 0,
          filter: 'blur(8px)',
          ease: 'none',
        }, 0)
      }

      // Subtitle separates in Z-space
      if (subRef.current) {
        tl.to(subRef.current, {
          y: 100,
          rotateX: 15,
          opacity: 0,
          filter: 'blur(6px)',
          ease: 'none',
        }, 0)
      }

      // Tag floats away faster
      if (tagRef.current) {
        tl.to(tagRef.current, {
          y: 60,
          scale: 0.8,
          opacity: 0,
          filter: 'blur(4px)',
          ease: 'none',
        }, 0)
      }

      // Scroll indicator fades immediately
      if (scrollRef.current) {
        tl.to(scrollRef.current, {
          opacity: 0,
          y: 40,
          ease: 'none',
        }, 0)
      }

      // Background layers parallax at different speeds
      if (bgLayer1Ref.current) {
        tl.to(bgLayer1Ref.current, {
          y: -80,
          scale: 1.15,
          ease: 'none',
        }, 0)
      }
      if (bgLayer2Ref.current) {
        tl.to(bgLayer2Ref.current, {
          y: -40,
          scale: 1.08,
          opacity: 0.3,
          ease: 'none',
        }, 0)
      }
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="hero hero-3d" ref={sectionRef}>
      {/* Parallax background layers */}
      <div className="hero-bg-layer hero-bg-layer-1" ref={bgLayer1Ref} />
      <div className="hero-bg-layer hero-bg-layer-2" ref={bgLayer2Ref} />

      <div className="hero-tag" ref={tagRef}>❤️ a love note, just for you</div>

      <TextReveal
        text="Hey Cherry,"
        tag="h1"
        className="hero-title"
        mode="chars"
        trigger="mount"
        stagger={0.05}
        duration={1.0}
        delay={0.3}
        from={{ y: '120%', rotateX: -90, opacity: 0 }}
      />
      <div ref={titleRef} style={{ display: 'none' }} />

      <TextReveal
        text="Happy 2 Months — from Harsh, with everything ❤️"
        tag="p"
        className="hero-sub"
        mode="words"
        trigger="mount"
        stagger={0.06}
        duration={0.9}
        delay={0.7}
      />
      <div ref={subRef} style={{ display: 'none' }} />

      <div className="hero-scroll" ref={scrollRef}>
        <span>scroll down</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
