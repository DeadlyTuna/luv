import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function VoiceNoteOverlay({ isOpen, onClose }) {
  const canvasRef = useRef(null)
  const audioRef = useRef(null)
  const rafRef = useRef(null)
  const analyserRef = useRef(null)
  const audioCtxRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const h = e => { if (e.key === 'Escape') onClose() }
      document.addEventListener('keydown', h)
      return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', h) }
    }
  }, [isOpen, onClose])

  const setupAnalyser = useCallback(() => {
    if (audioCtxRef.current || !audioRef.current) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const source = ctx.createMediaElementSource(audioRef.current)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyser.connect(ctx.destination)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
    } catch (e) {}
  }, [])

  // Visualizer
  useEffect(() => {
    if (!isOpen) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      t += 0.008
      const W = canvas.width, H = canvas.height
      ctx.fillStyle = 'rgba(5,5,16,0.15)'
      ctx.fillRect(0, 0, W, H)

      const cx = W / 2, cy = H / 2

      if (analyserRef.current && isPlaying) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(data)

        // Circular visualizer — multiple rings
        for (let ring = 0; ring < 3; ring++) {
          const baseR = 100 + ring * 70
          const slices = 64
          ctx.beginPath()
          for (let i = 0; i <= slices; i++) {
            const angle = (i / slices) * Math.PI * 2 - Math.PI / 2
            const di = Math.floor((i / slices) * data.length)
            const v = data[di] / 255
            const r = baseR + v * (50 + ring * 20)
            const x = cx + Math.cos(angle + t * (ring + 1) * 0.3) * r
            const y = cy + Math.sin(angle + t * (ring + 1) * 0.3) * r
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          }
          ctx.closePath()
          const hue = 340 + ring * 30
          ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${0.7 - ring * 0.15})`
          ctx.lineWidth = 2.5 - ring * 0.5
          ctx.shadowBlur = 20
          ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`
          ctx.stroke()
          ctx.shadowBlur = 0
        }

        // Center pulse
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255
        const pulseR = 40 + avg * 60
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR)
        grad.addColorStop(0, `rgba(255,107,138,${0.4 + avg * 0.4})`)
        grad.addColorStop(0.6, `rgba(255,107,138,${avg * 0.2})`)
        grad.addColorStop(1, 'rgba(255,107,138,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
        ctx.fill()

        // Heart icon in center
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.font = `${24 + avg * 16}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('💗', cx, cy)
      } else {
        // Idle: gentle breathing rings
        for (let ring = 0; ring < 4; ring++) {
          const r = 80 + ring * 50 + Math.sin(t * 2 + ring) * 15
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255,107,138,${0.15 - ring * 0.03})`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '32px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🎙️', cx, cy)
      }
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isOpen, isPlaying])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    setupAnalyser()
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume()
    }
    if (isPlaying) {
      audio.pause()
    } else {
      try { await audio.play() } catch (e) {}
    }
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const update = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration)
    }
    const ended = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', update)
    audio.addEventListener('ended', ended)
    return () => {
      audio.removeEventListener('timeupdate', update)
      audio.removeEventListener('ended', ended)
    }
  }, [])

  return createPortal(
    <div className={`voicenote-overlay ${isOpen ? 'open' : ''}`}>
      <audio ref={audioRef} src="/music/voicenote.mp3" preload="none" />
      <canvas ref={canvasRef} className="voicenote-canvas" />

      <div className="voicenote-ui">
        <div className="voicenote-title">A message from Harsh 💌</div>
        <div className="voicenote-subtitle">press play and listen to my heart</div>

        <button className={`voicenote-play ${isPlaying ? 'playing' : ''}`} onClick={togglePlay} id="voicenotePlay">
          <span>{isPlaying ? '⏸' : '▶'}</span>
        </button>

        <div className="voicenote-progress">
          <div className="voicenote-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="voicenote-hint">drop your voice memo at /public/music/voicenote.mp3</div>
      </div>

      <button className="voicenote-close" onClick={onClose} id="voicenoteClose">✖</button>
    </div>,
    document.body
  )
}
