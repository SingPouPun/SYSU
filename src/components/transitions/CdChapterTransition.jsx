import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function CdChapterTransition({ chapter, onCovered, onComplete }) {
  const rootRef = useRef(null)
  const artRef = useRef(null)
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
    let context
    let cancelled = false

    const playTransition = () => {
      if (cancelled || !rootRef.current) return

      context = gsap.context(() => {
        const disc = rootRef.current?.querySelector('.cd-transition-disc')
        const discDiameter = disc?.getBoundingClientRect().width || 620
        const viewportDiagonal = Math.hypot(window.innerWidth, window.innerHeight)
        const coverScale = Math.max(1.25, viewportDiagonal / discDiameter * 1.06)
        const revealRadius = viewportDiagonal / 2 + 12
        const timeline = gsap.timeline()

        gsap.set(rootRef.current, { autoAlpha: 0 })
        gsap.set('.cd-transition-copy', { autoAlpha: 0, x: -28 })
        gsap.set('.cd-transition-copy-tile', { autoAlpha: 0, scale: 0.55 })

        timeline
          .to(rootRef.current, {
            autoAlpha: 1,
            duration: 0.16,
            ease: 'power1.out',
          }, 0)
          .fromTo('.cd-transition-disc', {
            x: '55vw',
            scale: 0.24,
            rotation: -240,
            autoAlpha: 0,
          }, {
            x: 0,
            scale: 0.78,
            rotation: 620,
            autoAlpha: 1,
            duration: 0.62,
            ease: 'power4.out',
          }, 0.06)
          .to('.cd-transition-copy', {
            x: 0,
            autoAlpha: 1,
            duration: 0.32,
            ease: 'back.out(1.8)',
          }, 0.48)
          .to('.cd-transition-disc', {
            scale: 0.68,
            rotation: 680,
            duration: 0.16,
            ease: 'power2.in',
          }, 0.76)
          .to('.cd-transition-disc', {
            scale: 0.8,
            rotation: 720,
            duration: 0.22,
            ease: 'back.out(2.3)',
          }, 0.92)
          .to('.cd-transition-copy-tile', {
            autoAlpha: 1,
            scale: 1,
            duration: 0.2,
            stagger: 0.055,
            ease: 'back.out(2.6)',
          }, 0.64)
          .to('.cd-transition-copy', {
            y: -22,
            autoAlpha: 0,
            duration: 0.24,
            ease: 'power2.inOut',
          }, 1.14)
          .to('.cd-transition-disc', {
            scale: coverScale * 1.62,
            rotation: 2180,
            duration: 1.62,
            ease: 'power2.inOut',
          }, 1.16)
          .call(onCovered, [], 1.96)
          .to(rootRef.current, {
            '--cd-reveal': `${revealRadius}px`,
            duration: 0.76,
            ease: 'power2.inOut',
          }, 2)
          .to(rootRef.current, { autoAlpha: 0, duration: 0.01 }, 2.78)
          .call(finishOnce, [], 2.79)

        failsafe = window.setTimeout(finishOnce, 3700)
      }, rootRef)
    }

    const image = artRef.current
    if (image?.decode) {
      image.decode().catch(() => undefined).then(playTransition)
    } else {
      playTransition()
    }

    return () => {
      cancelled = true
      window.clearTimeout(failsafe)
      context?.revert()
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
        '--cd-reveal': '0px',
      }}
      aria-label={`正在载入${chapter.name}章节`}
      aria-live="polite"
    >
      <div className="cd-transition-grid" aria-hidden="true" />

      <div className="cd-transition-disc" aria-hidden="true">
        {chapter.coverImage && (
          <img
            ref={artRef}
            className="cd-transition-art"
            src={chapter.coverImage}
            alt=""
            decoding="sync"
          />
        )}
        <span className="cd-transition-spectrum" />
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

    </section>
  )
}
