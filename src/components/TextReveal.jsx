import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * TextReveal — splits text into animated spans
 * 
 * Props:
 *  - text: string to animate
 *  - tag: wrapper element ('h1', 'h2', 'div', 'span', etc.)
 *  - mode: 'chars' | 'words' (default 'words')
 *  - className: CSS class for the wrapper
 *  - style: inline styles
 *  - trigger: 'scroll' | 'mount' (default 'scroll')
 *  - stagger: stagger delay between items (default 0.04)
 *  - duration: animation duration per item (default 0.8)
 *  - once: only animate once (default true)
 *  - delay: extra delay before animation starts (default 0)
 *  - from: gsap .from() properties (default { y: '110%', rotateX: -80, opacity: 0 })
 */
export default function TextReveal({
  text = '',
  tag: Tag = 'div',
  mode = 'words',
  className = '',
  style = {},
  trigger = 'scroll',
  stagger = 0.04,
  duration = 0.8,
  once = true,
  delay = 0,
  from = null,
  children,
}) {
  const wrapperRef = useRef(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const spans = wrapper.querySelectorAll('.tr-item')
    if (!spans.length) return

    const defaults = from || {
      y: '100%',
      rotateX: -60,
      opacity: 0,
    }

    gsap.set(spans, defaults)

    const animProps = {
      y: '0%',
      rotateX: 0,
      opacity: 1,
      duration,
      stagger,
      ease: 'expo.out',
      delay,
    }

    if (trigger === 'scroll') {
      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top 85%',
        once,
        onEnter: () => gsap.to(spans, animProps),
        ...(once ? {} : {
          onLeaveBack: () => gsap.set(spans, defaults),
        }),
      })
    } else {
      gsap.to(spans, animProps)
    }

    return () => {
      ScrollTrigger.getAll()
        .filter(t => t.trigger === wrapper)
        .forEach(t => t.kill())
    }
  }, [text, mode, trigger, stagger, duration, once, delay, from])

  // Split text into spans
  const renderContent = () => {
    const content = text || (typeof children === 'string' ? children : '')
    if (!content) return children

    if (mode === 'chars') {
      return content.split('').map((char, i) => (
        <span key={i} className="tr-clip">
          <span className="tr-item" style={{ display: 'inline-block', willChange: 'transform, opacity' }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))
    }

    // Words mode
    return content.split(' ').map((word, i, arr) => (
      <span key={i} className="tr-clip" style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
        <span className="tr-item" style={{ display: 'inline-block', willChange: 'transform, opacity' }}>
          {word}{i < arr.length - 1 ? '\u00A0' : ''}
        </span>
      </span>
    ))
  }

  return (
    <Tag
      ref={wrapperRef}
      className={`text-reveal ${className}`}
      style={{ ...style, perspective: '600px' }}
    >
      {renderContent()}
    </Tag>
  )
}
