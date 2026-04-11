import { useState, useRef } from 'react'
import { gsap } from 'gsap'

export default function Envelope() {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    if (isOpen) return
    setIsOpen(true)
  }

  return (
    <section className="letter-section">
      <div className="letter-wrap">
        <div className="section-label" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          from the bottom of my heart
        </div>

        <div className={`letter-layout${isOpen ? ' is-open' : ''}`}>
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
            <div className="letter-inner">
              <div className="letter-card">
                <div className="letter-seal">H</div>
                <div className="letter-to">Dear Simran (Cherry) ❤️</div>
                <div className="letter-body">{`It's only been two months, but honestly… it feels like so much more, just because of how special every moment with you has been. Every conversation, every laugh, every little thing we've shared means more to me than I can put into words.

Spending time with you every day is the best part of my day. And those random plans when we meet… seeing you from a distance and walking towards you brings me a kind of happiness I can't even explain.

In just these two months, we've already made so many beautiful memories, and I can't wait to make more — traveling together, going to new places, and doing all the things we dream about.

I genuinely feel so lucky to have you… sometimes even like I don't deserve someone as amazing as you.

Thank you for being you. I'm really, really glad you're mine ❤️`}</div>
                <div className="letter-sign">— Harsh, always yours 🌸</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
