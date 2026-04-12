import { useState, useCallback, useEffect, useRef } from 'react'
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
import CursorEffects from './components/CursorEffects'
import RoseVines from './components/RoseVines'
import SpaceBackground from './components/SpaceBackground'

gsap.registerPlugin(ScrollTrigger)

// ── Central 3D Pole ──
function CentralPole() {
  const poleRef = useRef(null)

  useEffect(() => {
    const pole = poleRef.current
    if (!pole) return

    // Rotate the pole based on total scroll progress
    gsap.to(pole, {
      rotateY: 720,
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      },
      ease: 'none',
    })
  }, [])

  return (
    <div className="central-pole-container">
      <div className="central-pole" ref={poleRef}>
        <div className="pole-glow" />
        <div className="pole-core" />
        <div className="pole-shine" />
      </div>
    </div>
  )
}

// ── Scroll Progress Bar ──
function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    gsap.to(bar, {
      scaleX: 1,
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
      ease: 'none',
    })
  }, [])

  return (
    <div className="scroll-progress-track">
      <div className="scroll-progress-bar" ref={barRef} />
    </div>
  )
}

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

  // ── 3D rotating panel entrance for each page ──
  useEffect(() => {
    const panels = document.querySelectorAll('.page-panel')

    panels.forEach((panel, i) => {
      // Alternate rotation direction for variety, but keep it subtle to prevent layout breaking
      const fromRight = i % 2 === 0
      const startRotY = fromRight ? 15 : -15

      gsap.set(panel, {
        rotateY: startRotY,
        rotateX: 10,
        y: 80,
        z: -150,
        opacity: 0,
        scale: 0.95,
        transformPerspective: 1200,
        transformOrigin: '50% 50%',
      })

      // Entrance animation
      ScrollTrigger.create({
        trigger: panel,
        start: 'top 95%',
        end: 'center center',
        scrub: 1.2,
        onUpdate: (self) => {
          const p = self.progress
          const easeP = gsap.parseEase('power2.out')(p)
          gsap.set(panel, {
            rotateY: startRotY * (1 - easeP),
            rotateX: 10 * (1 - easeP),
            y: 80 * (1 - easeP),
            z: -150 * (1 - easeP),
            opacity: Math.min(1, p * 3),
            scale: 0.95 + 0.05 * easeP,
          })
        }
      })

      // Exit animation
      ScrollTrigger.create({
        trigger: panel,
        start: 'bottom 40%',
        end: 'bottom 0%',
        scrub: 1.2,
        onUpdate: (self) => {
          const p = self.progress
          const exitRotY = fromRight ? -10 : 10
          if (p > 0) {
            gsap.set(panel, {
              rotateY: exitRotY * p,
              rotateX: -5 * p,
              y: -50 * p,
              z: -100 * p,
              opacity: 1 - (p * 1.5),
            })
          }
        }
      })
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <>
      {/* Fixed background layers */}
      <SpaceBackground />
      <CentralPole />
      <RoseVines />
      <CursorEffects />
      <ScrollProgress />

      {/* Page panels — each section is a distinct "page" */}
      <div className="pages-container">
        <div className="page-panel page-hero">
          <Hero />
        </div>

        <div className="page-panel page-countdown">
          <Countdown />
        </div>

        <div className="page-panel page-space">
          <SpaceSection />
        </div>

        <div className="page-panel page-memory">
          <MemoryWall />
        </div>

        <div className="page-panel page-scenes">
          <ScrollScenes
            onOpenSlideshow={openSlideshow}
            onGlobeOpen={() => setGlobeOpen(true)}
          />
        </div>

        <div className="page-panel page-envelope">
          <Envelope />
        </div>

        <div className="page-panel page-footer">
          <Footer />
        </div>
      </div>

      {/* Overlays */}
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
