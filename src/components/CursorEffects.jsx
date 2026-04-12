import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const HEARTS = ['❤', '💕', '🩷', '✨', '❀', '♥']

export default function CursorEffects() {
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const trailRef = useRef(null)
  const pos = useRef({ x: -100, y: -100 })
  const mouse = useRef({ x: -100, y: -100 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const prevMouse = useRef({ x: -100, y: -100 })
  const rafId = useRef(null)
  const trailTimer = useRef(null)
  const isHovering = useRef(false)
  const isTouch = useRef(false)

  useEffect(() => {
    // Detect touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      isTouch.current = true
      return
    }

    // Hide default cursor
    document.documentElement.style.cursor = 'none'

    const ring = ringRef.current
    const dot = dotRef.current
    const trail = trailRef.current

    // ── Mouse move tracking ──
    const onMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY

      // Calculate velocity for trail intensity
      velocityRef.current.x = e.clientX - prevMouse.current.x
      velocityRef.current.y = e.clientY - prevMouse.current.y
      prevMouse.current.x = e.clientX
      prevMouse.current.y = e.clientY

      // Move inner dot directly
      gsap.set(dot, { x: e.clientX, y: e.clientY })
    }

    // ── Smooth ring follow (spring physics) ──
    const animate = () => {
      rafId.current = requestAnimationFrame(animate)

      const dx = mouse.current.x - pos.current.x
      const dy = mouse.current.y - pos.current.y

      const ease = isHovering.current ? 0.08 : 0.12
      pos.current.x += dx * ease
      pos.current.y += dy * ease

      gsap.set(ring, { x: pos.current.x, y: pos.current.y })
    }

    // ── Heart trail spawner ──
    const spawnHeart = () => {
      if (!trail) return
      const speed = Math.sqrt(
        velocityRef.current.x ** 2 + velocityRef.current.y ** 2
      )
      // Only spawn if cursor is moving
      if (speed < 2) return

      const heart = document.createElement('span')
      heart.className = 'cursor-heart'
      heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)]
      const size = 8 + Math.random() * 10
      const ox = (Math.random() - 0.5) * 20
      const oy = (Math.random() - 0.5) * 10

      heart.style.cssText = `
        left: ${mouse.current.x + ox}px;
        top: ${mouse.current.y + oy}px;
        font-size: ${size}px;
        --float-x: ${(Math.random() - 0.5) * 60}px;
      `
      trail.appendChild(heart)
      setTimeout(() => heart.remove(), 1200)
    }

    // ── Hover detection for interactive elements ──
    const magneticSelectors = 'a, button, .stat-card, .photo-frame, .polaroid, .slideshow-card, .globe-card-trigger, .envelope-graphic, .explore-btn, .ss-nav, .ss-close, .ss-dot'

    const onEnterInteractive = (e) => {
      isHovering.current = true
      ring.classList.add('cursor-hover')
      dot.classList.add('cursor-dot-hover')

      // Magnetic pull: shift ring toward element center
      const rect = e.currentTarget.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      gsap.to(pos.current, {
        x: cx,
        y: cy,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: true,
      })
    }

    const onLeaveInteractive = () => {
      isHovering.current = false
      ring.classList.remove('cursor-hover')
      dot.classList.remove('cursor-dot-hover')
    }

    // Attach hover listeners via event delegation
    const onOver = (e) => {
      const target = e.target.closest(magneticSelectors)
      if (target) onEnterInteractive(e)
    }
    const onOut = (e) => {
      const target = e.target.closest(magneticSelectors)
      if (target) onLeaveInteractive()
    }

    // ── Click burst effect ──
    const onClick = () => {
      gsap.fromTo(ring, { scale: 0.5 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' })

      // Spawn burst of hearts
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const heart = document.createElement('span')
          heart.className = 'cursor-heart cursor-burst'
          heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)]
          const angle = (i / 6) * Math.PI * 2
          const dist = 30 + Math.random() * 30
          heart.style.cssText = `
            left: ${mouse.current.x}px;
            top: ${mouse.current.y}px;
            font-size: ${12 + Math.random() * 8}px;
            --burst-x: ${Math.cos(angle) * dist}px;
            --burst-y: ${Math.sin(angle) * dist}px;
          `
          trail.appendChild(heart)
          setTimeout(() => heart.remove(), 900)
        }, i * 30)
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseout', onOut, { passive: true })
    document.addEventListener('click', onClick)
    animate()
    trailTimer.current = setInterval(spawnHeart, 50)

    // Also hide cursor on all elements
    const style = document.createElement('style')
    style.id = 'cursor-hide'
    style.textContent = '*, *::before, *::after { cursor: none !important; }'
    document.head.appendChild(style)

    return () => {
      cancelAnimationFrame(rafId.current)
      clearInterval(trailTimer.current)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('click', onClick)
      document.documentElement.style.cursor = ''
      const hideStyle = document.getElementById('cursor-hide')
      if (hideStyle) hideStyle.remove()
    }
  }, [])

  // Don't render on touch devices
  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null
  }

  return (
    <>
      <div className="cursor-ring" ref={ringRef} />
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-trail" ref={trailRef} />
    </>
  )
}
