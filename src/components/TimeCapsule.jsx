import { useState, useRef, useEffect } from 'react'
import TextReveal from './TextReveal'

const ANNIVERSARY_DATE = new Date('2027-02-04') // 1-year anniversary

export default function TimeCapsule() {
  const [letter, setLetter] = useState('')
  const [sealed, setSealed] = useState(false)
  const [existing, setExisting] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [sealing, setSealing] = useState(false)
  const lockRef = useRef(null)

  // Check for existing capsule
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timecapsule_letter')
      const savedDate = localStorage.getItem('timecapsule_date')
      if (saved && savedDate) {
        setExisting({ letter: saved, date: savedDate })
        setSealed(true)
      }
    } catch (e) {}
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!sealed) return
    const tick = () => {
      const now = new Date()
      const diff = ANNIVERSARY_DATE - now
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, unlocked: true })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        unlocked: false,
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [sealed])

  const sealCapsule = () => {
    if (!letter.trim() || sealing) return
    setSealing(true)

    // Locking animation
    setTimeout(() => {
      try {
        localStorage.setItem('timecapsule_letter', letter)
        localStorage.setItem('timecapsule_date', new Date().toISOString())
      } catch (e) {}

      setSealing(false)
      setSealed(true)
      setExisting({ letter, date: new Date().toISOString() })
    }, 2000)
  }

  const canOpen = timeLeft?.unlocked

  return (
    <section className="capsule-section">
      <TextReveal
        text="for the future us"
        tag="div"
        className="section-label"
        mode="words"
        stagger={0.06}
        duration={0.7}
      />
      <TextReveal
        text="time capsule"
        tag="h2"
        className="section-title"
        mode="chars"
        stagger={0.03}
        duration={0.9}
        delay={0.1}
      />

      <div className="capsule-container">
        {!sealed ? (
          /* Writing mode */
          <div className="capsule-write">
            <div className="capsule-icon">🔒</div>
            <div className="capsule-instruction">
              Write a letter, a wish, or a prediction for our 1-year anniversary.
              <br />It will be sealed and locked until <strong>February 4, 2027</strong>.
            </div>

            <textarea
              className="capsule-textarea"
              placeholder="Dear future us..."
              value={letter}
              onChange={e => setLetter(e.target.value)}
              maxLength={2000}
              id="capsuleTextarea"
            />

            <div className="capsule-char-count">{letter.length} / 2000</div>

            <button
              className={`capsule-seal-btn ${sealing ? 'sealing' : ''}`}
              onClick={sealCapsule}
              disabled={!letter.trim() || sealing}
              id="capsuleSealBtn"
            >
              <span className="capsule-seal-icon">{sealing ? '⏳' : '🔐'}</span>
              <span>{sealing ? 'Sealing...' : 'Seal the capsule'}</span>
            </button>

            {sealing && (
              <div className="capsule-sealing-animation">
                <div className="capsule-lock-spin" ref={lockRef}>🔒</div>
              </div>
            )}
          </div>
        ) : (
          /* Sealed mode */
          <div className="capsule-sealed">
            <div className={`capsule-vault ${canOpen ? 'unlocked' : ''}`}>
              <div className="capsule-vault-icon">{canOpen ? '🔓' : '🔒'}</div>
              <div className="capsule-vault-glow" />
            </div>

            {!canOpen ? (
              <>
                <div className="capsule-sealed-text">
                  ✨ Your time capsule is sealed ✨
                </div>
                <div className="capsule-sealed-sub">
                  Sealed on {new Date(existing?.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>

                {timeLeft && (
                  <div className="capsule-countdown">
                    <div className="capsule-time-unit">
                      <span className="capsule-time-num">{timeLeft.days}</span>
                      <span className="capsule-time-label">days</span>
                    </div>
                    <div className="capsule-time-sep">:</div>
                    <div className="capsule-time-unit">
                      <span className="capsule-time-num">{String(timeLeft.hours).padStart(2,'0')}</span>
                      <span className="capsule-time-label">hrs</span>
                    </div>
                    <div className="capsule-time-sep">:</div>
                    <div className="capsule-time-unit">
                      <span className="capsule-time-num">{String(timeLeft.minutes).padStart(2,'0')}</span>
                      <span className="capsule-time-label">min</span>
                    </div>
                    <div className="capsule-time-sep">:</div>
                    <div className="capsule-time-unit">
                      <span className="capsule-time-num">{String(timeLeft.seconds).padStart(2,'0')}</span>
                      <span className="capsule-time-label">sec</span>
                    </div>
                  </div>
                )}

                <div className="capsule-locked-hint">
                  this letter cannot be opened until our 1-year anniversary 💕
                </div>
              </>
            ) : (
              <>
                <div className="capsule-unlocked-text">
                  🎉 The time has come! Your capsule is unlocked!
                </div>
                <div className="capsule-letter-reveal">
                  <div className="capsule-letter-content">
                    {existing?.letter}
                  </div>
                  <div className="capsule-letter-date">
                    Written on {new Date(existing?.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
