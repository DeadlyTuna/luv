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
import MixtapePlayer from './components/MixtapePlayer'
import KonamiCode from './components/KonamiCode'
import SlotMachine from './components/SlotMachine'
import ScratchCards from './components/ScratchCards'
import VoiceNoteOverlay from './components/VoiceNoteOverlay'
import RedThread from './components/RedThread'
import FlashlightSection from './components/FlashlightSection'
import ChaosHeart from './components/ChaosHeart'
import HeartUnlock from './components/HeartUnlock'
import ChatStory from './components/ChatStory'
import IceShatter from './components/IceShatter'
import FrequencyMatch from './components/FrequencyMatch'
import TimeCapsule from './components/TimeCapsule'

gsap.registerPlugin(ScrollTrigger)

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
  const [voiceNoteOpen, setVoiceNoteOpen] = useState(false)
  const [heartUnlocked, setHeartUnlocked] = useState(false)

  const openSlideshow = useCallback((photos, rect) => {
    setSlideshowPhotos(photos)
    setSlideshowRect(rect)
    setSlideshowOpen(true)
  }, [])

  // ── 3D rotating panel entrance for each page ──
  useEffect(() => {
    const panels = document.querySelectorAll('.page-panel')

    panels.forEach((panel, i) => {
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
      <RedThread />
      <RoseVines />
      <CursorEffects />
      <ScrollProgress />

      {/* Global interactive elements */}
      <MixtapePlayer />
      <KonamiCode />

      {/* Page panels */}
      <div className="pages-container">
        <div className="page-panel page-hero">
          <Hero onVoiceNoteOpen={() => setVoiceNoteOpen(true)} />
        </div>

        <div className="page-panel page-countdown">
          <Countdown />
        </div>

        <div className="page-panel page-frequency">
          <FrequencyMatch />
        </div>

        <div className="page-panel page-space">
          <SpaceSection />
        </div>

        <div className="page-panel page-memory">
          <MemoryWall />
        </div>

        <div className="page-panel page-chaos">
          <ChaosHeart />
        </div>

        <div className="page-panel page-slot">
          <SlotMachine />
        </div>

        <div className="page-panel page-ice">
          <IceShatter />
        </div>

        <div className="page-panel page-flashlight">
          <FlashlightSection />
        </div>

        <div className="page-panel page-heart-unlock">
          <HeartUnlock onUnlock={() => setHeartUnlocked(true)} />
          {heartUnlocked && (
            <div className="heart-unlock-reward">
              <div className="heart-reward-emoji">💎</div>
              <div className="heart-reward-text">You unlocked my heart. It was always yours. 💖</div>
            </div>
          )}
        </div>

        <div className="page-panel page-scratch">
          <ScratchCards />
        </div>

        <div className="page-panel page-chat">
          <ChatStory />
        </div>

        <div className="page-panel page-scenes">
          <ScrollScenes
            onOpenSlideshow={openSlideshow}
            onGlobeOpen={() => setGlobeOpen(true)}
          />
        </div>

        <div className="page-panel page-capsule">
          <TimeCapsule />
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
      <VoiceNoteOverlay
        isOpen={voiceNoteOpen}
        onClose={() => setVoiceNoteOpen(false)}
      />
    </>
  )
}
