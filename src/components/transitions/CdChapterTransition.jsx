import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function CdChapterTransition({ chapter, onCovered, onComplete }) {
  const rootRef = useRef(null)
  const completedRef = useRef(false)

  useLayoutEffect(() => {
    if (!chapter) return undefined

    let failsafe = 0
    completedRef.current = false
    const finishOnce = () => {
      if (completedRef.current) return
      completedRef.current = true
      if (rootRef.current) {
        rootRef.current.style.display = 'none'
        rootRef.current.style.visibility = 'hidden'
        rootRef.current.style.pointerEvents = 'none'
      }
      onComplete?.()
    }
    const context = gsap.context(() => {
      const timeline = gsap.timeline()

      gsap.set('.cd-transition-cover', { autoAlpha: 0 })
      gsap.set('.cd-transition-copy', { autoAlpha: 0, x: -28 })
      gsap.set('.cd-transition-copy-tile', { autoAlpha: 0, scale: 0.55 })

      timeline
        .fromTo('.cd-transition-disc', {
          x: '55vw',
          scale: 0.24,
          rotation: -180,
          autoAlpha: 0,
        }, {
          x: 0,
          scale: 0.76,
          rotation: 620,
          autoAlpha: 1,
          duration: 0.58,
          ease: 'power4.out',
        }, 0)
        .fromTo('.cd-transition-trail i', {
          x: '36vw',
          scale: 0.35,
          autoAlpha: 0,
        }, {
          x: 0,
          scale: 1,
          autoAlpha: (index) => 0.24 - index * 0.045,
          duration: 0.44,
          stagger: 0.035,
          ease: 'power4.out',
        }, 0.04)
        .to('.cd-transition-trail i', {
          autoAlpha: 0,
          duration: 0.22,
          stagger: 0.02,
        }, 0.43)
        .to('.cd-transition-copy', {
          x: 0,
          autoAlpha: 1,
          duration: 0.32,
          ease: 'back.out(1.8)',
        }, 0.42)
        .to('.cd-transition-disc', {
          scale: 0.68,
          rotation: 680,
          duration: 0.16,
          ease: 'power2.in',
        }, 0.7)
        .to('.cd-transition-disc', {
          scale: 0.8,
          rotation: 720,
          duration: 0.22,
          ease: 'back.out(2.3)',
        }, 0.86)
        .to('.cd-transition-copy-tile', {
          autoAlpha: 1,
          scale: 1,
          duration: 0.2,
          stagger: 0.055,
          ease: 'back.out(2.6)',
        }, 0.58)
        .to('.cd-transition-copy', {
          y: -18,
          autoAlpha: 0,
          duration: 0.2,
          ease: 'power2.in',
        }, 1.15)
        .to('.cd-transition-disc', {
          scale: 5.8,
          rotation: 1440,
          duration: 0.72,
          ease: 'power4.in',
        }, 1.16)
        .to('.cd-transition-cover', {
          autoAlpha: 1,
          duration: 0.14,
        }, 1.76)
        .call(onCovered, [], 1.87)
        .to('.cd-transition-disc', {
          autoAlpha: 0,
          duration: 0.16,
        }, 1.9)
        .to('.cd-transition-cover', {
          clipPath: 'circle(0% at 50% 50%)',
          duration: 0.68,
          ease: 'power3.inOut',
        }, 2.02)
        .to('.cd-transition-grid', {
          autoAlpha: 0,
          duration: 0.58,
          ease: 'power2.inOut',
        }, 2.02)
        .to(rootRef.current, { autoAlpha: 0, duration: 0.01 }, 2.72)
        .call(finishOnce, [], 2.73)

      failsafe = window.setTimeout(finishOnce, 3400)
    }, rootRef)

    return () => {
      window.clearTimeout(failsafe)
      context.revert()
    }
  }, [chapter, onCovered, onComplete])

  if (!chapter) return null

  return (
    <section
      ref={rootRef}
      className="cd-chapter-transition"
      style={{
        '--cd-accent': chapter.accent,
        '--cd-secondary': chapter.secondary,
        '--cd-panel': chapter.panel,
      }}
      aria-label={`正在载入${chapter.name}章节`}
      aria-live="polite"
    >
      <div className="cd-transition-grid" aria-hidden="true" />

      <div className="cd-transition-trail" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="cd-transition-disc" aria-hidden="true">
        {chapter.coverImage && <img className="cd-transition-art" src={chapter.coverImage} alt="" />}
        <span className="cd-transition-spectrum" />
        <span className="cd-transition-glyphs">{chapter.glyphs.join('')}</span>
        <small>SYSU · MEDIA ARCHIVE</small>
        <b>{chapter.number}</b>
        <i />
      </div>

      <div className="cd-transition-copy">
        <small>NOW PLAYING / SYSU</small>
        <div className="cd-transition-copy-tiles" aria-label={chapter.glyphs.join('')}>
          {chapter.glyphs.map((glyph, index) => (
            <strong className="cd-transition-copy-tile" key={`${glyph}-${index}`}>
              {glyph}
            </strong>
          ))}
        </div>
        <span>READING MEDIA · {chapter.number}</span>
      </div>

      <div className="cd-transition-cover" aria-hidden="true" />
    </section>
  )
}
