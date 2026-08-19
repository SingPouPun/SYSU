import { useRef } from 'react'
import { gsap } from 'gsap'

export default function ArchiveBook({ book, onSelect, position = 'current' }) {
  const caseRef = useRef(null)
  const shotCompleteRef = useRef(false)
  const coverStyle = {
    '--archive-accent': book.accent,
    '--archive-secondary': book.secondary,
    '--archive-panel': book.panel,
    '--archive-cover-image': book.coverImage ? `url(${book.coverImage})` : 'none',
  }
  const isPreview = position !== 'current'

  function revealDisc() {
    if (isPreview || !caseRef.current) return

    const caseElement = caseRef.current
    const orbitItem = caseElement.closest('.archive-orbit-item')
    const disc = orbitItem?.querySelector('.archive-cd-disc')
    const trails = orbitItem?.querySelectorAll('.archive-cd-trails i') ?? []
    const ejectDistance = Math.min(166, window.innerWidth * 0.22)

    shotCompleteRef.current = false
    gsap.killTweensOf([caseElement, disc, ...trails])
    gsap.set(disc, { x: -14, y: 0, scale: 0.86, rotation: -24, autoAlpha: 0 })
    gsap.set(trails, { x: 4, scale: 0.72, autoAlpha: 0 })

    gsap.timeline()
      .to(caseElement, {
        x: -12,
        y: -3,
        scaleX: 0.985,
        scaleY: 1.012,
        rotationY: 2,
        transformPerspective: 1200,
        duration: 0.075,
        ease: 'power3.in',
      }, 0)
      .to(disc, {
        x: ejectDistance + 24,
        scale: 1.025,
        rotation: 510,
        autoAlpha: 1,
        duration: 0.19,
        ease: 'power4.out',
      }, 0.055)
      .to(trails, {
        x: (index) => ejectDistance * (0.5 + index * 0.12),
        scale: (index) => 0.96 - index * 0.12,
        autoAlpha: (index) => 0.34 - index * 0.08,
        duration: 0.12,
        stagger: 0.018,
        ease: 'power4.out',
      }, 0.06)
      .to(caseElement, {
        x: 3,
        y: -8,
        scaleX: 1.035,
        scaleY: 1.035,
        rotationY: -3,
        rotationX: 1,
        duration: 0.18,
        ease: 'back.out(2.6)',
      }, 0.08)
      .to(disc, {
        x: ejectDistance,
        scale: 1,
        rotation: 590,
        duration: 0.24,
        ease: 'back.out(2.1)',
      }, 0.24)
      .to(trails, {
        x: ejectDistance - 22,
        scale: 0.78,
        autoAlpha: 0,
        duration: 0.22,
        stagger: 0.025,
        ease: 'power2.out',
      }, 0.2)
      .call(() => {
        shotCompleteRef.current = true
      }, [], 0.46)
      .to(disc, {
        rotation: '+=360',
        duration: 4.8,
        repeat: -1,
        ease: 'none',
      }, 0.46)
  }

  function moveCase(event) {
    if (isPreview || !caseRef.current) return

    const caseElement = caseRef.current
    const orbitItem = caseElement.closest('.archive-orbit-item')
    const disc = orbitItem?.querySelector('.archive-cd-disc')
    const bounds = caseElement.getBoundingClientRect()
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5

    if (!shotCompleteRef.current) return

    gsap.to(caseElement, {
      x: horizontal * 6,
      y: -8 + vertical * 3,
      rotationX: 1 - vertical * 2.4,
      rotationY: -3 + horizontal * 2.8,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    gsap.to(caseElement.querySelector('.archive-book-title'), {
      x: horizontal * 5,
      y: vertical * 3,
      duration: 0.32,
      ease: 'power2.out',
      overwrite: true,
    })
    gsap.to(caseElement.querySelector('.archive-book-art'), {
      x: horizontal * 9,
      y: vertical * 6,
      duration: 0.36,
      ease: 'power2.out',
      overwrite: true,
    })
    gsap.to(disc, {
      y: vertical * 5,
      duration: 0.36,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  function hideDisc() {
    if (isPreview || !caseRef.current) return

    const caseElement = caseRef.current
    const orbitItem = caseElement.closest('.archive-orbit-item')
    const disc = orbitItem?.querySelector('.archive-cd-disc')
    const trails = orbitItem?.querySelectorAll('.archive-cd-trails i') ?? []

    shotCompleteRef.current = false
    gsap.killTweensOf([caseElement, disc, ...trails])
    gsap.timeline()
      .to(disc, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 0.86,
        autoAlpha: 0,
        duration: 0.42,
        ease: 'back.in(1.45)',
      }, 0)
      .to(trails, {
        x: 0,
        scale: 0.72,
        autoAlpha: 0,
        duration: 0.18,
        ease: 'power2.in',
      }, 0)
      .to(caseElement, {
        x: 0,
        y: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        rotationX: 0,
        rotationY: 0,
        duration: 0.46,
        ease: 'back.out(1.8)',
      }, 0.14)
      .to([
        caseElement.querySelector('.archive-book-title'),
        caseElement.querySelector('.archive-book-art'),
      ], {
        x: 0,
        y: 0,
        duration: 0.42,
        ease: 'back.out(1.7)',
      }, 0.14)
  }

  return (
    <button
      ref={caseRef}
      type="button"
      disabled={isPreview}
      data-button-feedback="custom"
      onClick={() => onSelect?.(book)}
      onPointerEnter={revealDisc}
      onPointerMove={moveCase}
      onPointerLeave={hideDisc}
      onFocus={revealDisc}
      onBlur={hideDisc}
      aria-label={!isPreview ? `打开${book.title}档案CD` : undefined}
      aria-hidden={isPreview || undefined}
      className={`archive-book-scaffold archive-cd-case archive-book--${position}`}
      style={coverStyle}
    >
      <span className="archive-book-sheen" aria-hidden="true" />
      <span className="archive-cd-case-edge" aria-hidden="true" />
      <span className="archive-book-spine" aria-hidden="true" />
      <span className="archive-book-corner">SYSU · {book.number}</span>

      <span className="archive-book-title">
        <small>{book.english}</small>
        <b>{book.title}</b>
      </span>

      <span className="archive-book-art" aria-hidden="true">
        <i>{book.coverGlyph}</i>
      </span>

      <span className="archive-book-footer">
        <small>{book.description}</small>
        <i>{isPreview ? book.number : 'CLICK TO ACCESS MEDIA'}</i>
      </span>
    </button>
  )
}
