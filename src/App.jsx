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
import FloatingPetals from './components/FloatingPetals'

gsap.registerPlugin(ScrollTrigger)

// Section transition overlay with clip-path wipe
function SectionTransition({ from, to, shape = 'diagonal' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Scrub a clip-path animation synced to scroll
    const clipPaths = {
      diagonal: {
        start: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
        end: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
      circle: {
        start: 'circle(0% at 50% 50%)',
        end: 'circle(150% at 50% 50%)',
      },
      diamond: {
        start: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        end: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      },
    }

    const clip = clipPaths[shape] || clipPaths.diagonal

    gsap.fromTo(el, {
      clipPath: clip.start,
      opacity: 1,
    }, {
      clipPath: clip.end,
      opacity: 1,
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
      ease: 'none',
    })
  }, [shape])

  return (
    <div
      ref={ref}
      className="section-transition"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    />
  )
}

// Scroll progress bar
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

  // ── Enhanced section transitions with 3D perspective ──
  useEffect(() => {
    const sections = document.querySelectorAll('.slide-section')
    sections.forEach((section, i) => {
      // 3D perspective entrance for each section
      gsap.set(section, {
        opacity: 0,
        y: 60,
        rotateX: -8,
        transformPerspective: 1200,
        transformOrigin: 'center top',
      })

      ScrollTrigger.create({
        trigger: section,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(section, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.3,
            ease: 'expo.out',
            delay: 0.05,
          })
        }
      })
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <>
      {/* Global effects */}
      <CursorEffects />
      <FloatingPetals />
      <ScrollProgress />

      {/* Main content */}
      <Hero />

      <SectionTransition from="var(--rose-pale)" to="var(--warm)" shape="diagonal" />
      <div className="slide-section"><Countdown /></div>

      <SectionTransition from="var(--warm)" to="#000" shape="circle" />
      <div className="slide-section"><SpaceSection /></div>

      <SectionTransition from="#000" to="var(--cream)" shape="diamond" />
      <div className="slide-section"><MemoryWall /></div>

      <div className="slide-section">
        <ScrollScenes onOpenSlideshow={openSlideshow} onGlobeOpen={() => setGlobeOpen(true)} />
      </div>

      <SectionTransition from="var(--cream)" to="var(--rose-pale)" shape="diagonal" />
      <div className="slide-section"><Envelope /></div>

      <Footer />

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
