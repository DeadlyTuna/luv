import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'

// A single drifting fairy light (stardust)
function FairyLight({ x, y, size = 1.5, delay = 0 }) {
  const lightRef = useRef(null)

  useEffect(() => {
    gsap.to(lightRef.current, {
      y: '-=15',
      x: '+=10',
      opacity: 0.1,
      duration: 3 + Math.random() * 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      delay: delay
    })
  }, [delay])

  return (
    <circle
      ref={lightRef}
      cx={x} cy={y} r={size}
      fill="#fff"
      opacity="0.8"
      style={{ filter: `drop-shadow(0 0 ${size * 2}px #ffb3c6)` }}
    />
  )
}

// A single rose bud that blooms into a full rose
function BloomingRose({ x, y, delayRange = [2000, 8000], flip = false }) {
  const [isBlooming, setIsBlooming] = useState(false)
  
  useEffect(() => {
    // Random timeout to trigger bloom
    const delay = delayRange[0] + Math.random() * (delayRange[1] - delayRange[0])
    const timer = setTimeout(() => {
      setIsBlooming(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delayRange])

  return (
    <g transform={`translate(${x}, ${y}) ${flip ? 'scale(-1, 1)' : ''}`} className="rose-group">
      {/* Bud (Visible initially, fades slightly when full rose appears) */}
      <path d="M-3 2 C-5 8, 5 8, 3 2 Z" fill="#2a3c42" /> {/* Subtle leaf base for bud */}
      <circle cx="0" cy="0" r="5" fill="#544452" />
      <path d="M-3 -2 C-2 -6, 2 -6, 3 -2 Z" fill="#ff9eaa" opacity={isBlooming ? 0 : 0.6} style={{ transition: 'opacity 1s ease' }}/>
      
      {/* Full Rose (Sprouts/Scales up) */}
      <g 
        style={{ 
          transform: `scale(${isBlooming ? 1 : 0})`, 
          transformOrigin: '0px 0px', 
          transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' 
        }}
      >
        <path d="M0 -5 C14 -14, 14 14, 0 5 C-14 14, -14 -14, 0 -5 Z" fill="#ff7597"/>
        <path d="M-7 0 C-7 -10, 7 -10, 7 0 C5 7, -5 7, -7 0 Z" fill="#ff4d79"/>
        <path d="M-4 1 C-4 -5, 4 -5, 4 1 C2 4, -2 4, -4 1 Z" fill="#fc285f"/>
        <circle cx="0" cy="-1" r="2.5" fill="#ffdae3" />
      </g>
    </g>
  )
}

// A single repeatable segment of the vine (much thicker and green)
function VineSegment({ yOffset, isRight }) {
  // We use useMemo so random positions don't jump around on re-renders
  const roses = useMemo(() => {
    return [
      { id: 1, x: 26, y: yOffset + 40, flip: false, delay: [1500, 5000] },
      { id: 2, x: 65, y: yOffset + 120, flip: true, delay: [4000, 10000] },
      { id: 3, x: 20, y: yOffset + 210, flip: false, delay: [2500, 7000] },
      { id: 4, x: 70, y: yOffset + 280, flip: true, delay: [6000, 14000] }
    ]
  }, [yOffset])

  const fairyLights = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 70,
      y: yOffset + Math.random() * 480,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 3
    }))
  }, [yOffset])

  return (
    <g>
      {/* Magical Space Vine Path */}
      <path 
        d={`M45 ${yOffset} C80 ${yOffset + 80}, 10 ${yOffset + 160}, 45 ${yOffset + 240} C80 ${yOffset + 320}, 10 ${yOffset + 400}, 45 ${yOffset + 480}`} 
        stroke="#3b4d54" 
        strokeWidth="5" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* Ethereal Slate-Teal Leaves */}
      <path d={`M42 ${yOffset + 30} C30 ${yOffset + 10}, 20 ${yOffset + 20}, 38 ${yOffset + 45} Z`} fill="#2a3c42" />
      <path d={`M55 ${yOffset + 90} C70 ${yOffset + 70}, 80 ${yOffset + 80}, 58 ${yOffset + 105} Z`} fill="#1e2c30" />
      <path d={`M35 ${yOffset + 180} C20 ${yOffset + 160}, 10 ${yOffset + 170}, 31 ${yOffset + 195} Z`} fill="#2a3c42" />
      <path d={`M60 ${yOffset + 250} C75 ${yOffset + 230}, 85 ${yOffset + 240}, 62 ${yOffset + 265} Z`} fill="#1e2c30" />
      <path d={`M40 ${yOffset + 340} C25 ${yOffset + 320}, 15 ${yOffset + 330}, 36 ${yOffset + 355} Z`} fill="#2a3c42" />
      <path d={`M58 ${yOffset + 420} C73 ${yOffset + 400}, 83 ${yOffset + 410}, 60 ${yOffset + 435} Z`} fill="#1e2c30" />

      {/* Randomly Blooming Roses */}
      {roses.map(r => (
        <BloomingRose key={r.id} x={r.x} y={r.y} flip={r.flip} delayRange={r.delay} />
      ))}

      {/* Floating Stardust/Fairy Lights */}
      {fairyLights.map(f => (
        <FairyLight key={`light-${f.id}`} x={f.x} y={f.y} size={f.size} delay={f.delay} />
      ))}
    </g>
  )
}

export default function RoseVines() {
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  // Calculate how many segments we need to cover the viewport height (e.g. 3 segments of 480px = 1440px)
  const segments = [0, 480, 960, 1440]

  useEffect(() => {
    // Both vines start off-screen at the bottom and slide up
    gsap.fromTo([leftRef.current, rightRef.current], 
      { y: window.innerHeight, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 3.5, 
        ease: 'power3.out', 
        delay: 0.1 
      }
    )

    // Optional subtle sway animation once they are in place
    gsap.to(leftRef.current, {
      rotate: 1.5,
      transformOrigin: 'top left',
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    gsap.to(rightRef.current, {
      rotate: -1.5,
      transformOrigin: 'top right',
      duration: 5.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }, [])

  return (
    <div className="vines-container" style={{ position: 'fixed', inset: 0, zIndex: 12, pointerEvents: 'none', overflow: 'hidden' }}>
      
      {/* Left Vine */}
      <div 
        ref={leftRef} 
        style={{
          position: 'absolute',
          top: 0, left: '-20px',
          width: '100px', height: '100vh',
          filter: 'drop-shadow(3px 5px 8px rgba(0,0,0,0.6))'
        }} 
      >
        <svg width="100" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          {segments.map((y, i) => <VineSegment key={`left-${i}`} yOffset={y} isRight={false} />)}
        </svg>
      </div>
      
      {/* Right Vine */}
      {/* We drop the scaleX(-1) CSS transform which can cause layout off-screen issues.
          Instead, we just position it to the right and use the SVG natively. 
          We wrap the <g> in the SVG with scale(-1, 1) to flip it properly around its center. */}
      <div 
        ref={rightRef} 
        style={{
          position: 'absolute',
          top: 0, right: '-20px',
          width: '100px', height: '100vh',
          filter: 'drop-shadow(-3px 5px 8px rgba(0,0,0,0.6))'
        }} 
      >
        <svg width="100" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <g transform="translate(100, 0) scale(-1, 1)">
            {segments.map((y, i) => <VineSegment key={`right-${i}`} yOffset={y} isRight={true} />)}
          </g>
        </svg>
      </div>

    </div>
  )
}
