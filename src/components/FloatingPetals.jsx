import { useEffect, useRef } from 'react'

const PETALS = ['🌸', '✨', '💕', '🩷', '❀']

export default function FloatingPetals() {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    function spawnPetal() {
      const p = document.createElement('span')
      p.className = 'petal'
      p.textContent = PETALS[Math.floor(Math.random() * PETALS.length)]
      const startX = Math.random() * 100
      const driftX = (Math.random() - 0.5) * 200
      const driftR = Math.random() * 720 - 360
      const duration = 8 + Math.random() * 10
      const size = 0.7 + Math.random() * 0.8

      p.style.cssText = `
        left:${startX}%;top:-30px;font-size:${size}rem;
        --drift-x:${driftX}px;--drift-r:${driftR}deg;
        animation-duration:${duration}s;animation-delay:0s;
      `
      container.appendChild(p)
      setTimeout(() => p.remove(), duration * 1000)
    }

    const interval = setInterval(spawnPetal, 1500)
    for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 300)

    return () => clearInterval(interval)
  }, [])

  return <div className="floating-petals" ref={ref} />
}
