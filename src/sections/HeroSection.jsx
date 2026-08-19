import { useRef } from 'react'
import { gsap } from 'gsap'

export default function HeroSection({ onStart }) {
  const enterButtonRef = useRef(null)

  function shakeEnterButton() {
    const button = enterButtonRef.current
    if (!button) return

    gsap.killTweensOf(button)
    gsap.timeline()
      .to(button, {
        x: 22,
        scale: 1.035,
        rotation: 7,
        duration: 0.075,
        ease: 'power4.out',
      })
      .to(button, {
        x: -4,
        rotation: 2,
        duration: 0.055,
        ease: 'none',
      })
      .to(button, {
        x: 15,
        rotation: 6,
        duration: 0.05,
        ease: 'none',
      })
      .to(button, {
        x: -2,
        rotation: 3,
        duration: 0.05,
        ease: 'none',
      })
      .to(button, {
        x: 8,
        rotation: 5,
        duration: 0.045,
        ease: 'none',
      })
      .to(button, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 4,
        duration: 0.16,
        ease: 'back.out(2.8)',
      })
  }

  function settleEnterButton() {
    const button = enterButtonRef.current
    if (!button) return

    gsap.killTweensOf(button)
    gsap.to(button, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 4,
      duration: 0.18,
      ease: 'back.out(2.5)',
    })
  }

  return (
    <section className="hero-scaffold" id="top">
      <div className="hero-giant-word hero-giant-word--left" aria-hidden="true">SYSU</div>
      <div className="hero-giant-word hero-giant-word--right" aria-hidden="true">
        SUN YAT-SEN UNIVERSITY
      </div>

      <div className="hero-visual-frame">
        <img
          className="hero-campus-image"
          src="/backgrounds/sysu-campus-anime.png"
          alt="漫画风格的中山大学校园建筑与花木景色"
        />
        <div className="hero-image-halftone" aria-hidden="true" />

        <button
          ref={enterButtonRef}
          className="hero-archive-entry"
          type="button"
          onClick={onStart}
          onPointerEnter={shakeEnterButton}
          onPointerLeave={settleEnterButton}
        >
          <b>ENTER</b>
        </button>
      </div>

      <div className="hero-emblem-sticker">
        <img src="/branding/sysu-emblem.png" alt="中山大学校徽" />
        <span>SYSU · 1924</span>
      </div>

      <div className="hero-corner-code" aria-hidden="true">
        <b>01</b><span>SYSU / MAIN VISUAL</span>
      </div>
    </section>
  )
}
