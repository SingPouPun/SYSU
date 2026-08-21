import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  CULTURE_ANTHEM_SCENES,
  CULTURE_ASSETS,
  CULTURE_SHOT_ONE,
} from './cultureExperienceConfig.js'
import { readExperienceProgress, writeExperienceProgress } from '../../utils/experienceProgress.js'

gsap.registerPlugin(ScrollTrigger)

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function smoothRange(value, start, end) {
  const progress = clamp((value - start) / (end - start))
  return progress * progress * (3 - 2 * progress)
}

function frameVisibility(progress, center, spacing) {
  const distance = Math.abs(progress - center) / spacing
  return 1 - smoothRange(distance, 0.48, 0.98)
}

function LyricArt({ line, order }) {
  return (
    <img
      className={`culture-lyric-art culture-lyric-art--${line.position}`}
      src={line.src}
      alt=""
      aria-hidden="true"
      style={{ '--culture-line-order': order }}
    />
  )
}

function WindowFrame({ src, fit = 'contain', lines = [], kind = 'anthem', reveal, revealed, onReveal }) {
  return (
    <figure className={`culture-window-frame culture-window-frame--${kind}${reveal ? ' culture-window-frame--finale' : ''}${revealed ? ' is-revealed' : ''}`}>
      <img className="culture-window-image" src={src} alt="" decoding="async" draggable="false" style={{ objectFit: fit }} />
      {reveal && (
        <>
          <img className="culture-window-reveal-image" src={reveal} alt="" decoding="async" draggable="false" />
          <button
            className="culture-huaishi-hotspot"
            type="button"
            aria-label="查看怀士堂石碑"
            onClick={onReveal}
          >
            <i />
          </button>
        </>
      )}
      {lines.map((item, index) => (
        <LyricArt key={item.src} line={item} order={index} />
      ))}
    </figure>
  )
}

function FullEmblem() {
  return (
    <div className="culture-full-emblem" aria-hidden="true">
      <img className="culture-emblem-whole" src={CULTURE_ASSETS.emblem.full} alt="" />
      <span className="culture-emblem-focus">
        <img src={CULTURE_ASSETS.emblem.full} alt="" />
      </span>
      <img className="culture-emblem-reflection" src={CULTURE_ASSETS.emblem.full} alt="" />
    </div>
  )
}

function HaitangViewport({ frames, finaleRevealed, onFinaleReveal }) {
  return (
    <div className="culture-window-shell">
      <svg className="culture-window-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id="culture-haitang-clip" clipPathUnits="objectBoundingBox">
            <path d="M.5,.035 C.66,.035 .735,.145 .735,.27 C.89,.27 .985,.365 .985,.5 C.985,.635 .89,.73 .735,.73 C.735,.865 .65,.97 .5,.97 C.35,.97 .265,.865 .265,.73 C.11,.73 .015,.635 .015,.5 C.015,.365 .11,.27 .265,.27 C.265,.145 .34,.035 .5,.035 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="culture-window-viewport">
        {frames.map((frame, index) => (
          <WindowFrame
            key={`${frame.src}-${index}`}
            {...frame}
            revealed={Boolean(frame.reveal && finaleRevealed)}
            onReveal={frame.reveal ? onFinaleReveal : undefined}
          />
        ))}
      </div>

      <svg
        className="culture-window-outline"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M50 3.5C66 3.5 73.5 14.5 73.5 27C89 27 98.5 36.5 98.5 50C98.5 63.5 89 73 73.5 73C73.5 86.5 65 97 50 97C35 97 26.5 86.5 26.5 73C11 73 1.5 63.5 1.5 50C1.5 36.5 11 27 26.5 27C26.5 14.5 34 3.5 50 3.5Z" />
      </svg>
    </div>
  )
}

export default function CultureImmersiveStage() {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const [finaleRevealed, setFinaleRevealed] = useState(() => (
    readExperienceProgress('sysu-culture-stone-revealed', false) === true
  ))

  function revealFinale() {
    setFinaleRevealed(true)
    writeExperienceProgress('sysu-culture-stone-revealed', true)
  }

  const frames = useMemo(() => [
    ...CULTURE_ASSETS.opening.map((item) => ({ ...item, kind: 'opening', lines: [] })),
    ...CULTURE_ANTHEM_SCENES.map((item) => ({ ...item, kind: 'anthem', fit: 'contain' })),
  ], [])

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const frameElements = [...stage.querySelectorAll('.culture-window-frame')]
    const driver = { value: 0 }
    const frameStart = CULTURE_SHOT_ONE.introEnd
    const frameEnd = CULTURE_SHOT_ONE.outroStart
    const frameSpacing = (frameEnd - frameStart) / frames.length

    const updateStage = () => {
      const progress = driver.value
      const zoom = smoothRange(progress, 0.015, 0.155)
      const outerFade = smoothRange(progress, 0.075, 0.185)
      const windowTakeover = smoothRange(progress, 0.085, 0.205)
      const outro = smoothRange(progress, CULTURE_SHOT_ONE.outroStart, 1)
      const outroEmblemReveal = smoothRange(outro, 0.38, 1)
      const outroWindowFade = smoothRange(outro, 0.62, 1)
      const introEmblemOpacity = 1 - outerFade
      const emblemOpacity = Math.max(introEmblemOpacity, outroEmblemReveal)
      const emblemScale = outro > 0 ? 1 + (1 - outro) * 1.8 : 1 + zoom * 1.8
      const introFocus = smoothRange(progress, 0.025, 0.07) * (1 - smoothRange(progress, 0.15, 0.205))
      const outroFocus = smoothRange(outro, 0.12, 0.45) * (1 - smoothRange(outro, 0.78, 1))
      const windowScale = (0.2 + windowTakeover * 0.8) * (1 - outro * 0.8)

      stage.style.setProperty('--culture-full-emblem-opacity', emblemOpacity)
      stage.style.setProperty('--culture-emblem-scale', emblemScale)
      stage.style.setProperty('--culture-emblem-focus-opacity', Math.max(introFocus, outroFocus))
      stage.style.setProperty('--culture-black-opacity', 0)
      stage.style.setProperty('--culture-window-opacity', windowTakeover * (1 - outroWindowFade))
      stage.style.setProperty('--culture-window-scale', windowScale)
      stage.style.setProperty('--culture-reflection-opacity', Math.max(introEmblemOpacity * 0.22, outroEmblemReveal * 0.22))

      frameElements.forEach((element, index) => {
        const center = frameStart + frameSpacing * (index + 0.5)
        const visibility = frameVisibility(progress, center, frameSpacing)
        const local = clamp((progress - (center - frameSpacing / 2)) / frameSpacing)
        const lyricReveal = smoothRange(local, 0.34, 0.56)
        const isActive = visibility > 0.01
        const nextVisibility = isActive ? 'visible' : 'hidden'

        element.style.opacity = visibility
        if (element.style.visibility !== nextVisibility) {
          element.style.visibility = nextVisibility
          element.style.willChange = isActive ? 'opacity, transform' : 'auto'
        }
        element.style.transform = `scale(${1.035 - local * 0.035})`
        element.style.setProperty('--culture-lyric-opacity', visibility * lyricReveal)
        element.style.setProperty('--culture-lyric-shift', `${(1 - lyricReveal) * 22}px`)
      })
    }

    const context = gsap.context(() => {
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: `+=${reduceMotion ? 5000 : CULTURE_SHOT_ONE.scrollLength}`,
          scrub: reduceMotion ? 0.2 : 1,
          pin: stage,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      }).to(driver, {
        value: CULTURE_SHOT_ONE.endProgress,
        duration: 1,
        onUpdate: updateStage,
      })
    }, root)

    updateStage()
    const refresh = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      window.cancelAnimationFrame(refresh)
      context.revert()
    }
  }, [frames])

  return (
    <div className="culture-experience" ref={rootRef}>
      <div className="culture-immersive-stage" ref={stageRef}>
        <div className="culture-paper-field" aria-hidden="true" />
        <div className="culture-black-field" aria-hidden="true" />
        <HaitangViewport
          frames={frames}
          finaleRevealed={finaleRevealed}
          onFinaleReveal={revealFinale}
        />
        <FullEmblem />
        <div className="culture-scroll-cue" aria-hidden="true">
          <span><i /></span>
          <small>SCROLL</small>
        </div>
      </div>
    </div>
  )
}
