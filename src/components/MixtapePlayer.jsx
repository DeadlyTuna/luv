import { useState, useRef, useEffect, useCallback } from 'react'

export default function MixtapePlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const analyserRef = useRef(null)
  const audioCtxRef = useRef(null)

  const TRACKS = [
    { title: 'Our Song', artist: 'Harsh × Simran', file: '/music/track1.mp3', color: '#ff6b8a' },
    { title: 'First Dance', artist: 'Harsh × Simran', file: '/music/track2.mp3', color: '#ffb88c' },
    { title: 'Late Night Calls', artist: 'Harsh × Simran', file: '/music/track3.mp3', color: '#c9a0ff' },
  ]

  // Setup audio analyser for visualisation
  const setupAnalyser = useCallback(() => {
    if (audioCtxRef.current || !audioRef.current) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const source = ctx.createMediaElementSource(audioRef.current)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      source.connect(analyser)
      analyser.connect(ctx.destination)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
    } catch (e) {
      // Audio context might already exist
    }
  }, [])

  // Visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 200, H = 60
    canvas.width = W
    canvas.height = H

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, W, H)

      if (analyserRef.current && isPlaying) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(data)
        const bars = 32
        const barW = W / bars
        for (let i = 0; i < bars; i++) {
          const v = data[i] / 255
          const h = v * H * 0.85
          const gradient = ctx.createLinearGradient(0, H, 0, H - h)
          gradient.addColorStop(0, TRACKS[currentTrack].color)
          gradient.addColorStop(1, TRACKS[currentTrack].color + '40')
          ctx.fillStyle = gradient
          ctx.fillRect(i * barW + 1, H - h, barW - 2, h)
        }
      } else {
        // Idle wave animation
        const t = Date.now() * 0.002
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(255,107,138,0.3)'
        ctx.lineWidth = 2
        for (let x = 0; x < W; x++) {
          const y = H / 2 + Math.sin(x * 0.05 + t) * 8 + Math.sin(x * 0.02 + t * 1.3) * 5
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, currentTrack])

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
      try { await audio.play() } catch (e) { /* user interaction needed */ }
    }
    setIsPlaying(!isPlaying)
  }

  const nextTrack = () => {
    const next = (currentTrack + 1) % TRACKS.length
    setCurrentTrack(next)
    setProgress(0)
    if (audioRef.current) {
      audioRef.current.src = TRACKS[next].file
      if (isPlaying) audioRef.current.play().catch(() => {})
    }
  }

  const prevTrack = () => {
    const prev = (currentTrack - 1 + TRACKS.length) % TRACKS.length
    setCurrentTrack(prev)
    setProgress(0)
    if (audioRef.current) {
      audioRef.current.src = TRACKS[prev].file
      if (isPlaying) audioRef.current.play().catch(() => {})
    }
  }

  // Track progress
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const update = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration)
    }
    audio.addEventListener('timeupdate', update)
    audio.addEventListener('ended', nextTrack)
    return () => {
      audio.removeEventListener('timeupdate', update)
      audio.removeEventListener('ended', nextTrack)
    }
  }, [currentTrack])

  return (
    <>
      <audio ref={audioRef} src={TRACKS[currentTrack].file} preload="none" />

      {/* Floating toggle button */}
      <button
        className={`mixtape-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Our Mixtape 🎵"
        id="mixtapeToggle"
      >
        <div className={`vinyl-icon ${isPlaying ? 'spinning' : ''}`}>
          <div className="vinyl-grooves" />
          <div className="vinyl-label" style={{ background: TRACKS[currentTrack].color }} />
        </div>
      </button>

      {/* Player panel */}
      <div className={`mixtape-player ${isOpen ? 'open' : ''}`}>
        <div className="mixtape-glass" />

        {/* Vinyl record */}
        <div className={`mixtape-vinyl ${isPlaying ? 'spinning' : ''}`}>
          <div className="vinyl-record">
            <div className="vinyl-groove v1" />
            <div className="vinyl-groove v2" />
            <div className="vinyl-groove v3" />
            <div className="vinyl-center" style={{ background: `linear-gradient(135deg, ${TRACKS[currentTrack].color}, ${TRACKS[currentTrack].color}88)` }}>
              <span>♥</span>
            </div>
          </div>
        </div>

        {/* Track info */}
        <div className="mixtape-info">
          <div className="mixtape-track-title">{TRACKS[currentTrack].title}</div>
          <div className="mixtape-track-artist">{TRACKS[currentTrack].artist}</div>
        </div>

        {/* Visualizer */}
        <canvas ref={canvasRef} className="mixtape-visualizer" />

        {/* Progress bar */}
        <div className="mixtape-progress">
          <div className="mixtape-progress-fill" style={{ width: `${progress * 100}%`, background: TRACKS[currentTrack].color }} />
        </div>

        {/* Controls */}
        <div className="mixtape-controls">
          <button onClick={prevTrack} className="mixtape-btn" id="mixtapePrev" title="Previous">⏮</button>
          <button onClick={togglePlay} className="mixtape-btn mixtape-btn-play" id="mixtapePlay" title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={nextTrack} className="mixtape-btn" id="mixtapeNext" title="Next">⏭</button>
        </div>

        <div className="mixtape-hint">drop your mp3s in /public/music/ 🎶</div>
      </div>
    </>
  )
}
