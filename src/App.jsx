import { useState, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './components/Hero'
import Countdown from './components/Countdown'
import SpaceSection from './components/SpaceSection'
import MemoryWall from './components/MemoryWall'
import ScrollScenes from './components/ScrollScenes'
import Envelope from './components/Envelope'
import Footer from './components/Footer'
import SlideshowOverlay from './components/SlideshowOverlay'
import GlobeOverlay from './components/GlobeOverlay'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [slideshowOpen, setSlideshowOpen] = useState(false)
  const [slideshowPhotos, setSlideshowPhotos] = useState([])
  const [slideshowRect, setSlideshowRect] = useState(null)
  const [globeOpen, setGlobeOpen] = useState(false)

  const openSlideshow = useCallback((photos, rect) => {
    setSlideshowPhotos(photos)
    setSlideshowRect(rect)
    setSlideshowOpen(true)
  }, [])

  // ── Section slide-in transitions ──
  useEffect(() => {
    const sections = document.querySelectorAll('.slide-section')
    sections.forEach((section, i) => {
      const fromLeft = i % 2 === 0
      gsap.set(section, { x: fromLeft ? -80 : 80, opacity: 0 })
      ScrollTrigger.create({
        trigger: section,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(section, {
            x: 0, opacity: 1,
            duration: 1.1,
            ease: 'expo.out',
          })
        }
      })
    })

    // Clip-path reveal for hero children
    const heroTitle = document.querySelector('.hero-title')
    const heroSub   = document.querySelector('.hero-sub')
    const heroTag   = document.querySelector('.hero-tag')
    ;[heroTag, heroTitle, heroSub].forEach((el, i) => {
      if (!el) return
      gsap.from(el, {
        y: 60, opacity: 0, duration: 1.2,
        delay: 0.3 + i * 0.18,
        ease: 'expo.out',
      })
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <>
      <Hero />
      <div className="slide-section"><Countdown /></div>
      <div className="slide-section"><SpaceSection /></div>
      <div className="slide-section"><MemoryWall /></div>
      <div className="slide-section"><ScrollScenes onOpenSlideshow={openSlideshow} onGlobeOpen={() => setGlobeOpen(true)} /></div>
      <div className="slide-section"><Envelope /></div>
      <Footer />

      <SlideshowOverlay
        isOpen={slideshowOpen}
        photos={slideshowPhotos}
        savedRect={slideshowRect}
        onClose={() => setSlideshowOpen(false)}
      />
      <GlobeOverlay
        isOpen={globeOpen}
        onClose={() => setGlobeOpen(false)}
      />
    </>
  )
}
