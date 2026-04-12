import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'

gsap.registerPlugin(ScrollTrigger)

export default function Envelope() {
  const [isOpen, setIsOpen] = useState(false)
  const sectionRef = useRef(null)
  const envelopeRef = useRef(null)
  const letterRef = useRef(null)

  const handleOpen = () => {
    if (isOpen) return
    setIsOpen(true)
  }

  // ── 3D scroll entrance for the envelope ──
  useEffect(() => {
    const section = sectionRef.current
    const envelope = envelopeRef.current
    if (!section || !envelope) return

    const ctx = gsap.context(() => {
      // Envelope flies in from below with 3D tilt
      gsap.set(envelope, {
        y: 120,
        rotateX: 35,
        scale: 0.85,
        opacity: 0,
        transformPerspective: 1000,
        transformOrigin: 'center bottom',
      })

      ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(envelope, {
            y: 0,
            rotateX: 0,
            scale: 1,
            opacity: 1,
            duration: 1.4,
            ease: 'expo.out',
          })
        }
      })
    }, section)

    return () => ctx.revert()
  }, [])

  // ── Staggered letter line reveal when opened ──
  useEffect(() => {
    if (!isOpen || !letterRef.current) return

    const lines = letterRef.current.querySelectorAll('.letter-line')
    if (!lines.length) return

    gsap.set(lines, { y: 30, opacity: 0, filter: 'blur(4px)' })
    gsap.to(lines, {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.7,
      stagger: 0.08,
      delay: 0.8,
      ease: 'power3.out',
    })
  }, [isOpen])

  // Split letter body into lines for staggered animation
  const letterText = `It's only been two months, but honestly… it feels like so much more, just because of how special every moment with you has been. Every conversation, every laugh, every little thing we've shared means more to me than I can put into words.

Spending time with you every day is the best part of my day. And those random plans when we meet… seeing you from a distance and walking towards you brings me a kind of happiness I can't even explain.

In just these two months, we've already made so many beautiful memories, and I can't wait to make more — traveling together, going to new places, and doing all the things we dream about.

I genuinely feel so lucky to have you… sometimes even like I don't deserve someone as amazing as you.

Thank you for being you. I'm really, really glad you're mine ❤️`

  const letterLines = letterText.split('\n').filter(l => l.trim())

  return (
    <section className="letter-section letter-3d" ref={sectionRef}>
      <div className="letter-wrap">
        <TextReveal
          text="from the bottom of my heart"
          tag="div"
          className="section-label"
          mode="words"
          stagger={0.06}
          duration={0.7}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        />

        <div className={`letter-layout${isOpen ? ' is-open' : ''}`} ref={envelopeRef}>
          {/* Envelope */}
          <div className="envelope-graphic" onClick={handleOpen}>
            <div className="env-back" />
            <div className="env-paper" />
            <div className="env-front" />
            <div className="env-flap">
              <div className="env-seal">H</div>
            </div>
            {!isOpen && <div className="env-hint">💌 tap to open</div>}
          </div>

          {/* Letter */}
          <div className="letter-wrapper">
            <div className="letter-inner" ref={letterRef}>
              <div className="letter-card">
                <div className="letter-seal">H</div>
                <div className="letter-to letter-line">Dear Simran (Cherry) ❤️</div>
                <div className="letter-body">
                  {letterLines.map((line, i) => (
                    <p key={i} className="letter-line">{line}</p>
                  ))}
                </div>
                <div className="letter-sign letter-line">— Harsh, always yours 🌸</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
