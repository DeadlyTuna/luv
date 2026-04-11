import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'

function SlideshowPortal({ isOpen, photos, savedRect, onClose }) {
  const overlayRef = useRef(null)
  const wrapRef = useRef(null)
  const dotsRef = useRef(null)
  const currentNumRef = useRef(null)
  const totalRef = useRef(null)
  const progressFillRef = useRef(null)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [animating, setAnimating] = useState(false)
  const activeImgsRef = useRef([])
  const activeDotsRef = useRef([])

  const goToIdxRef = useRef(null)

  // Build gallery when photos change
  useEffect(() => {
    if (!isOpen || !photos.length) return
    const wrap = wrapRef.current
    const dotsEl = dotsRef.current
    if (!wrap || !dotsEl) return

    wrap.innerHTML = ''; dotsEl.innerHTML = ''
    activeImgsRef.current = []; activeDotsRef.current = []
    setCurrentIdx(0)

    if (totalRef.current) totalRef.current.textContent = photos.length

    photos.forEach((src, i) => {
      const img = document.createElement('img')
      img.src = src; img.alt = `Photo ${i + 1}`
      img.loading = i < 3 ? 'eager' : 'lazy'
      img.className = 'ss-photo' + (i === 0 ? ' ss-active' : '')
      wrap.appendChild(img)
      activeImgsRef.current.push(img)
    })

    photos.forEach((_, i) => {
      const d = document.createElement('button')
      d.className = 'ss-dot' + (i === 0 ? ' ss-dot-active' : '')
      d.setAttribute('aria-label', `Go to photo ${i + 1}`)
      d.addEventListener('click', e => { e.stopPropagation(); goToIdxRef.current?.(i) })
      dotsEl.appendChild(d)
      activeDotsRef.current.push(d)
    })
  }, [isOpen, photos])

  const updateMeta = useCallback((idx, total) => {
    if (currentNumRef.current) currentNumRef.current.textContent = idx + 1
    if (progressFillRef.current) progressFillRef.current.style.width = ((idx + 1) / total * 100) + '%'
    activeDotsRef.current.forEach((d, i) => d.classList.toggle('ss-dot-active', i === idx))
  }, [])

  const goToIdx = useCallback((idx, dir) => {
    const N = photos.length
    if (animating || idx === currentIdx) return
    idx = ((idx % N) + N) % N
    dir = dir ?? (idx > currentIdx ? 1 : -1)
    setAnimating(true)

    const outImg = activeImgsRef.current[currentIdx]
    const inImg = activeImgsRef.current[idx]
    gsap.set(inImg, { opacity: 0, x: dir > 0 ? '6%' : '-6%', scale: 1.04 })
    inImg.classList.add('ss-active')
    gsap.to(outImg, { opacity: 0, x: dir > 0 ? '-6%' : '6%', scale: 0.97, duration: 0.45, ease: 'power2.in',
      onComplete: () => { outImg.classList.remove('ss-active'); gsap.set(outImg, { clearProps: 'all' }) }
    })
    gsap.to(inImg, { opacity: 1, x: '0%', scale: 1, duration: 0.55, ease: 'power3.out', delay: 0.1,
      onComplete: () => setAnimating(false)
    })
    setCurrentIdx(idx)
    updateMeta(idx, N)
  }, [animating, currentIdx, photos.length, updateMeta])

  // Keep ref in sync so dot listeners can always reach latest version
  useEffect(() => { goToIdxRef.current = goToIdx }, [goToIdx])

  const next = useCallback(() => goToIdx(currentIdx + 1, 1), [goToIdx, currentIdx])
  const prev = useCallback(() => goToIdx(currentIdx - 1, -1), [goToIdx, currentIdx])

  // Open animation
  useEffect(() => {
    if (!isOpen || !savedRect) return
    const overlay = overlayRef.current
    if (!overlay) return
    const { t, ri, b, l } = savedRect
    gsap.fromTo(overlay,
      { clipPath: `inset(${t}% ${ri}% ${b}% ${l}% round 14px)` },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.78, ease: 'expo.inOut' }
    )
    gsap.fromTo(wrapRef.current, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)', delay: 0.38 })
  }, [isOpen, savedRect])

  // Keyboard
  useEffect(() => {
    if (!isOpen) return
    const handler = e => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [isOpen, next, prev, onClose])

  // Touch swipe
  let touchStartX = useRef(0)

  if (!isOpen) return null

  return createPortal(
    <div
      className="ss-overlay"
      ref={overlayRef}
      style={{ display: 'flex' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 45) dx < 0 ? next() : prev() }}
    >
      <button className="ss-close" onClick={onClose} aria-label="Close">✕</button>
      <button className="ss-nav ss-nav-prev" onClick={prev} aria-label="Previous">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <div className="ss-stage">
        <div className="ss-photo-wrap" ref={wrapRef} />
        <div className="ss-meta">
          <div className="ss-counter">
            <span ref={currentNumRef}>1</span><span className="ss-sep">/</span><span ref={totalRef}>1</span>
          </div>
          <div className="ss-progress-bar"><div className="ss-progress-fill" ref={progressFillRef} /></div>
          <div className="ss-dots" ref={dotsRef} />
        </div>
      </div>
      <button className="ss-nav ss-nav-next" onClick={next} aria-label="Next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
      <div className="ss-hint">← → arrows &nbsp;·&nbsp; swipe &nbsp;·&nbsp; esc to close</div>
    </div>,
    document.body
  )
}

export default function SlideshowOverlay(props) {
  return <SlideshowPortal {...props} />
}
