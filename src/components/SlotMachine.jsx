import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from './TextReveal'

gsap.registerPlugin(ScrollTrigger)

const REASONS = [
  "Your smile makes my entire day",
  "The way you laugh at my dumb jokes",
  "How you always know what to say",
  "Your eyes — I could stare forever",
  "You make me want to be better",
  "The way you hold my hand",
  "Your voice is my favourite sound",
  "How you care about everyone",
  "You're the bravest person I know",
  "The way you scrunch your nose",
  "You make everything feel safe",
  "How passionate you are about things",
  "Your hugs feel like home",
  "The way you look at me",
  "You understand me like no one else",
  "How you dance when you're happy",
  "Your kindness is beyond words",
  "The random texts that make me smile",
  "How smart and driven you are",
  "You're my favourite notification",
  "The way you say my name",
  "Your determination inspires me",
  "How you never give up on us",
  "You make ordinary moments magical",
  "Because you chose me too ❤️",
  "The way you light up a room",
  "How comfortable silence feels with you",
  "Your terrible puns (I love them)",
  "Because falling for you was effortless",
  "You're the plot twist I never expected",
  "The way you smell (always amazing)",
  "How you remember the little things",
  "Your playlist is immaculate",
  "Because missing you is a compliment to how good you are",
  "The way you get excited about food",
  "How you make me feel at ease",
  "Your selfies brighten my day",
  "Because every love song makes sense now",
  "The way you care about my dreams",
  "Simply because you're you, and that's enough ✨",
]

export default function SlotMachine() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentReason, setCurrentReason] = useState(null)
  const [displayText, setDisplayText] = useState('')
  const [count, setCount] = useState(0)
  const reelRef = useRef(null)
  const sectionRef = useRef(null)
  const heartBurstRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const ctx = gsap.context(() => {
      gsap.set('.slot-machine-container', {
        y: 60,
        opacity: 0,
        scale: 0.9,
        transformPerspective: 1200,
        rotateX: 15,
      })
      ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to('.slot-machine-container', {
            y: 0, opacity: 1, scale: 1, rotateX: 0,
            duration: 1.2,
            ease: 'back.out(1.4)',
          })
        },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  const spin = () => {
    if (isSpinning) return
    setIsSpinning(true)

    // Rapid cycling through reasons
    let cycles = 0
    const maxCycles = 20 + Math.floor(Math.random() * 15)
    const finalIdx = Math.floor(Math.random() * REASONS.length)

    const cycle = () => {
      cycles++
      const idx = cycles < maxCycles
        ? Math.floor(Math.random() * REASONS.length)
        : finalIdx
      setDisplayText(REASONS[idx])

      if (cycles < maxCycles) {
        const delay = 50 + (cycles / maxCycles) * 200 // Slows down
        setTimeout(cycle, delay)
      } else {
        // Landing!
        setCurrentReason(REASONS[finalIdx])
        setIsSpinning(false)
        setCount(c => c + 1)

        // Burst hearts
        if (heartBurstRef.current) {
          const burst = heartBurstRef.current
          for (let i = 0; i < 12; i++) {
            const heart = document.createElement('span')
            heart.className = 'slot-heart-particle'
            heart.textContent = '❤️'
            heart.style.setProperty('--angle', (i * 30) + 'deg')
            heart.style.setProperty('--dist', (40 + Math.random() * 60) + 'px')
            burst.appendChild(heart)
            setTimeout(() => heart.remove(), 1200)
          }
        }

        // Shake effect
        if (reelRef.current) {
          gsap.fromTo(reelRef.current,
            { scale: 1.08 },
            { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' }
          )
        }
      }
    }
    cycle()
  }

  return (
    <section className="slot-section" ref={sectionRef}>
      <TextReveal
        text="why do I love you?"
        tag="div"
        className="section-label"
        mode="words"
        stagger={0.06}
        duration={0.7}
      />
      <TextReveal
        text="let me count the ways"
        tag="h2"
        className="section-title"
        mode="chars"
        stagger={0.03}
        duration={0.9}
        delay={0.1}
      />

      <div className="slot-machine-container">
        <div className="slot-machine">
          <div className="slot-reel" ref={reelRef}>
            <div className={`slot-display ${isSpinning ? 'spinning' : ''} ${currentReason ? 'landed' : ''}`}>
              {displayText || 'Press the button to find out ✨'}
            </div>
          </div>

          <div className="slot-heart-burst" ref={heartBurstRef} />

          <button
            className={`slot-button ${isSpinning ? 'active' : ''}`}
            onClick={spin}
            disabled={isSpinning}
            id="slotButton"
          >
            <span className="slot-btn-icon">{isSpinning ? '💫' : '💝'}</span>
            <span className="slot-btn-text">
              {isSpinning ? 'Finding a reason...' : count === 0 ? 'Tell me why' : 'Another reason!'}
            </span>
          </button>

          {count > 0 && (
            <div className="slot-counter">
              {count} reason{count > 1 ? 's' : ''} discovered 💕
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
