import { useEffect, useRef, useCallback } from 'react'

const HEART_COLORS = ['#ff6b8a', '#ff91b8', '#ffb88c', '#c9a0ff', '#fce4ec', '#ff4081', '#e8567a']

function createHeartSVG(color) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`)}`
}

export default function KonamiCode() {
  const overlayRef = useRef(null)
  const bufferRef = useRef([])
  const activeRef = useRef(false)
  const CODE = ['l', 'o', 'v', 'e']

  const spawnConfetti = useCallback(() => {
    const overlay = overlayRef.current
    if (!overlay || activeRef.current) return
    activeRef.current = true

    overlay.classList.add('active')

    // Create 120 particles
    const particles = []
    for (let i = 0; i < 120; i++) {
      const el = document.createElement('div')
      const isHeart = Math.random() > 0.4
      const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)]

      if (isHeart) {
        el.className = 'konami-heart'
        const img = document.createElement('img')
        img.src = createHeartSVG(color)
        img.style.width = (16 + Math.random() * 28) + 'px'
        el.appendChild(img)
      } else {
        el.className = 'konami-confetti'
        el.style.background = color
        el.style.width = (6 + Math.random() * 8) + 'px'
        el.style.height = (6 + Math.random() * 14) + 'px'
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
      }

      el.style.left = Math.random() * 100 + 'vw'
      el.style.top = -20 + 'px'
      el.style.setProperty('--fall-x', (Math.random() - 0.5) * 300 + 'px')
      el.style.setProperty('--fall-r', Math.random() * 1080 - 540 + 'deg')
      el.style.setProperty('--fall-duration', (2.5 + Math.random() * 3) + 's')
      el.style.setProperty('--fall-delay', Math.random() * 1.5 + 's')
      el.style.animationDelay = el.style.getPropertyValue('--fall-delay')

      overlay.appendChild(el)
      particles.push(el)
    }

    // Show the "I LOVE YOU" text
    const text = document.createElement('div')
    text.className = 'konami-text'
    text.innerHTML = '💖 I Love You, Cherry! 💖'
    overlay.appendChild(text)

    // Clean up after 5 seconds
    setTimeout(() => {
      particles.forEach(p => p.remove())
      text.remove()
      overlay.classList.remove('active')
      activeRef.current = false
    }, 5500)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      const key = e.key.toLowerCase()
      const buf = bufferRef.current
      buf.push(key)

      // Keep only last 4 keys
      if (buf.length > 4) buf.shift()

      // Check if last 4 keys spell LOVE
      if (buf.length === 4 && buf.join('') === CODE.join('')) {
        spawnConfetti()
        bufferRef.current = []
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [spawnConfetti])

  return (
    <div className="konami-overlay" ref={overlayRef} />
  )
}
