import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

const ENTERING_LETTERS = [...'NOW ENTERING']
const TILE_FINAL_Y = [-8, 7, -4, 10]
const TILE_FINAL_ROTATION = [-2.2, 1.5, -0.9, 2.1]
const TILE_IMPACT_X = [1.48, 1.62, 1.43, 1.56]
const TILE_IMPACT_Y = [0.5, 0.4, 0.54, 0.46]

export default function ChapterTransition({ chapter, onCovered, onComplete }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (!chapter) return undefined

    const context = gsap.context(() => {
      const tiles = gsap.utils.toArray('.transition-tile')
      const enteringLetters = gsap.utils.toArray('.transition-entering-letter')
      const timeline = gsap.timeline()

      gsap.set('.transition-content', { autoAlpha: 0 })

      timeline
        .fromTo('.transition-curtain--dark', { xPercent: -112 }, {
          xPercent: 0,
          duration: 0.62,
          ease: 'power4.inOut',
        }, 0)
        .fromTo('.transition-curtain--light', { xPercent: 112 }, {
          xPercent: 0,
          duration: 0.62,
          ease: 'power4.inOut',
        }, 0.08)
        .call(onCovered, [], 0.72)
        .to('.transition-content', { autoAlpha: 1, duration: 0.12 }, 0.72)
        .fromTo(tiles, {
          x: (index) => [-125, -42, 48, 132][index],
          y: (index) => [-210, 190, -165, 215][index],
          rotation: (index) => [-16, 11, -9, 17][index],
          scale: (index) => [0.68, 0.76, 0.72, 0.66][index],
          autoAlpha: 0,
        }, {
          x: 0,
          y: (index) => TILE_FINAL_Y[index],
          rotation: (index) => TILE_FINAL_ROTATION[index],
          scale: 1,
          autoAlpha: 1,
          duration: (index) => [0.54, 0.47, 0.58, 0.5][index],
          stagger: 0.11,
          ease: 'back.out(1.65)',
        }, 0.92)
        .to(tiles, {
          scaleX: (index) => TILE_IMPACT_X[index],
          scaleY: (index) => TILE_IMPACT_Y[index],
          y: (index) => TILE_FINAL_Y[index] + 5,
          duration: (index) => [0.09, 0.11, 0.08, 0.1][index],
          stagger: 0.06,
          ease: 'power2.in',
        }, 1.65)
        .to(tiles, {
          scaleX: 1,
          scaleY: 1,
          y: (index) => TILE_FINAL_Y[index],
          rotation: (index) => TILE_FINAL_ROTATION[index],
          duration: (index) => [0.22, 0.27, 0.2, 0.25][index],
          stagger: 0.06,
          ease: 'back.out(2.7)',
        }, 1.75)
        .fromTo('.transition-title-group', { y: 24, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.38,
          ease: 'power3.out',
        }, 1.82)
        // 主画面完整停留约 2.2 秒后自动退场，避免重新变成一闪而过。
        .to('.transition-content', {
          autoAlpha: 0,
          scale: 1.035,
          duration: 0.26,
          ease: 'power2.in',
        }, 4.42)
        .to('.transition-curtain--dark', {
          xPercent: -112,
          duration: 0.62,
          ease: 'power4.inOut',
        }, 4.65)
        .to('.transition-curtain--light', {
          xPercent: 112,
          duration: 0.62,
          ease: 'power4.inOut',
        }, 4.71)
        .to(rootRef.current, { autoAlpha: 0, duration: 0.01 }, 5.34)
        .call(onComplete, [], 5.35)

      // 沿用首页 LOADING 的逐字起跳、落地压缩和弹性恢复。
      const enteringTimeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.65,
        delay: 2.9,
      })

      enteringLetters.forEach((letter, index) => {
        if (letter.dataset.space === 'true') return

        enteringTimeline
          .to(letter, {
            y: -8,
            rotation: index % 2 === 0 ? -5 : 5,
            scaleX: 0.9,
            scaleY: 1.18,
            duration: 0.14,
            ease: 'power2.out',
          })
          .to(letter, {
            y: 0,
            rotation: 0,
            scaleX: 1.16,
            scaleY: 0.84,
            duration: 0.1,
            ease: 'power2.in',
          })
          .to(letter, {
            scaleX: 1,
            scaleY: 1,
            duration: 0.2,
            ease: 'back.out(3)',
          })
      })
    }, rootRef)

    return () => context.revert()
  }, [chapter, onCovered, onComplete])

  if (!chapter) return null

  return (
    <section
      ref={rootRef}
      className="chapter-transition-scaffold"
      aria-label={`正在进入${chapter.name}章节`}
      aria-live="polite"
    >
      <div className="transition-curtain transition-curtain--dark" />
      <div className="transition-curtain transition-curtain--light" />

      <div className="transition-content">
        <div className="transition-grid">
          {chapter.glyphs.map((glyph, index) => (
            <span className="transition-tile" key={`${glyph}-${index}`}>

              <b>{glyph}</b>
            </span>
          ))}
        </div>

        <div className="transition-title-group">
          <span className="transition-entering-copy" aria-label="NOW ENTERING">
            {ENTERING_LETTERS.map((letter, index) => (
              <i
                className="transition-entering-letter"
                data-space={letter === ' '}
                key={`${letter}-${index}`}
                aria-hidden="true"
              >
                {letter === ' ' ? '\u00A0' : letter}
              </i>
            ))}
          </span>

        </div>

      </div>
    </section>
  )
}
