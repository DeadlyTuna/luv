import { useEffect, useRef } from 'react'

export default function Hero() {
  const titleRef = useRef(null)
  const subRef = useRef(null)
  const tagRef = useRef(null)

  // Scroll parallax
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const max = window.innerHeight
      if (y < max) {
        const ratio = y / max
        if (titleRef.current) {
          titleRef.current.style.transform = `translateY(${ratio * 80}px) scale(${1 - ratio * 0.12})`
          titleRef.current.style.opacity = Math.max(0, 1 - ratio * 1.4)
        }
        if (subRef.current) {
          subRef.current.style.transform = `translateY(${ratio * 50}px)`
          subRef.current.style.opacity = Math.max(0, 1 - ratio * 1.7)
        }
        if (tagRef.current) {
          tagRef.current.style.transform = `translateY(${ratio * 30}px)`
          tagRef.current.style.opacity = Math.max(0, 1 - ratio * 2)
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Heart cursor
  useEffect(() => {
    const size = 32
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')
    ctx.font = `${size * 0.85}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('❤️', size / 2, size / 2 + 1)
    const url = c.toDataURL()
    document.documentElement.style.cursor = `url(${url}) ${size / 2} ${size / 2}, auto`
  }, [])

  return (
    <section className="hero">
      <div className="hero-tag" ref={tagRef}>❤️ a love note, just for you</div>
      <h1 className="hero-title" ref={titleRef}>Hey <em>Cherry</em>,</h1>
      <p className="hero-sub" ref={subRef}>Happy 2 Months — from Harsh, with everything ❤️</p>
      <div className="hero-scroll">
        <span>scroll down</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
