import { useState, useRef, useEffect } from 'react'
import TextReveal from './TextReveal'

export default function FrequencyMatch() {
  const canvasRef = useRef(null)
  const [time, setTime] = useState(50)
  const [patience, setPatience] = useState(50)
  const [love, setLove] = useState(50)
  const [matched, setMatched] = useState(false)
  const matchedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth
      canvas.height = 300
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const animate = () => {
      requestAnimationFrame(animate)
      t += 0.03
      const W = canvas.width, H = canvas.height

      ctx.fillStyle = 'rgba(5,3,12,0.3)'
      ctx.fillRect(0, 0, W, H)

      const midY = H / 2

      // Target wave (top — "His" frequency) — steady sine
      ctx.beginPath()
      ctx.strokeStyle = matchedRef.current ? 'rgba(255,200,100,0.9)' : 'rgba(255,107,138,0.6)'
      ctx.lineWidth = 2
      ctx.shadowBlur = matchedRef.current ? 15 : 8
      ctx.shadowColor = matchedRef.current ? 'rgba(255,200,100,0.5)' : 'rgba(255,107,138,0.4)'
      for (let x = 0; x < W; x++) {
        const freq = 0.02
        const amp = 40
        const y = midY - 50 + Math.sin(x * freq + t) * amp + Math.sin(x * freq * 2.1 + t * 0.7) * (amp * 0.3)
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Her wave (bottom) — controlled by sliders
      const herFreq = 0.008 + (time / 100) * 0.024      // target ~0.02
      const herAmp = 15 + (love / 100) * 50               // target ~40
      const herPhase = (patience / 100) * 4                // target to match phase

      ctx.beginPath()
      ctx.strokeStyle = matchedRef.current ? 'rgba(255,200,100,0.9)' : 'rgba(100,180,255,0.6)'
      ctx.lineWidth = 2
      ctx.shadowBlur = matchedRef.current ? 15 : 8
      ctx.shadowColor = matchedRef.current ? 'rgba(255,200,100,0.5)' : 'rgba(100,180,255,0.4)'
      for (let x = 0; x < W; x++) {
        const y = midY + 50 + Math.sin(x * herFreq + t * herPhase) * herAmp + Math.sin(x * herFreq * 2.1 + t * 0.7 * herPhase) * (herAmp * 0.3)
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '11px "DM Sans", sans-serif'
      ctx.fillText('his frequency', 12, midY - 85)
      ctx.fillText('her frequency', 12, midY + 15)

      // Center line
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(0, midY)
      ctx.lineTo(W, midY)
      ctx.stroke()
      ctx.setLineDash([])

      // Check match
      const freqMatch = Math.abs(herFreq - 0.02) < 0.004
      const ampMatch = Math.abs(herAmp - 40) < 8
      const phaseMatch = Math.abs(herPhase - 1) < 0.3

      if (freqMatch && ampMatch && phaseMatch && !matchedRef.current) {
        matchedRef.current = true
        setMatched(true)
      }
    }
    animate()

    return () => window.removeEventListener('resize', resize)
  }, [time, patience, love])

  return (
    <section className="frequency-section">
      <TextReveal
        text="find our frequency"
        tag="div"
        className="section-label"
        mode="words"
        stagger={0.06}
        duration={0.7}
      />
      <TextReveal
        text="tune in to my heart"
        tag="h2"
        className="section-title"
        mode="chars"
        stagger={0.03}
        duration={0.9}
        delay={0.1}
      />

      <div className="frequency-canvas-wrap">
        <canvas ref={canvasRef} className="frequency-canvas" />
      </div>

      {!matched ? (
        <div className="frequency-sliders">
          <div className="frequency-slider-group">
            <label className="frequency-slider-label">
              <span className="freq-label-icon">⏰</span> Time
            </label>
            <input
              type="range" min="0" max="100" value={time}
              onChange={e => setTime(+e.target.value)}
              className="frequency-slider"
              id="freqSliderTime"
            />
          </div>
          <div className="frequency-slider-group">
            <label className="frequency-slider-label">
              <span className="freq-label-icon">🕊️</span> Patience
            </label>
            <input
              type="range" min="0" max="100" value={patience}
              onChange={e => setPatience(+e.target.value)}
              className="frequency-slider"
              id="freqSliderPatience"
            />
          </div>
          <div className="frequency-slider-group">
            <label className="frequency-slider-label">
              <span className="freq-label-icon">💖</span> Love
            </label>
            <input
              type="range" min="0" max="100" value={love}
              onChange={e => setLove(+e.target.value)}
              className="frequency-slider"
              id="freqSliderLove"
            />
          </div>
          <div className="frequency-hint">
            align both waves to find our frequency ✨
          </div>
        </div>
      ) : (
        <div className="frequency-matched">
          <div className="frequency-matched-text">
            ✨ We're on the exact same frequency ✨
          </div>
          <div className="frequency-matched-sub">
            Time + Patience + Love = Us
          </div>
        </div>
      )}
    </section>
  )
}
