import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import ArchiveBook from './ArchiveBook.jsx'
import { ARCHIVE_BOOKS, CHAPTERS } from '../../data/chapters.js'

const ORBIT_SLOTS = {
  0: { x: 0, y: 0, scale: 1, rotation: -1, opacity: 1, zIndex: 5 },
  1: { x: 355, y: 24, scale: 0.68, rotation: 3, opacity: 0.4, zIndex: 3 },
  2: { x: 0, y: -72, scale: 0.48, rotation: 0, opacity: 0.14, zIndex: 1 },
  3: { x: -355, y: 24, scale: 0.68, rotation: -3, opacity: 0.4, zIndex: 3 },
}

function getOrbitSlot(bookIndex, currentIndex) {
  return (bookIndex - currentIndex + ARCHIVE_BOOKS.length) % ARCHIVE_BOOKS.length
}

export default function ArchiveLibrary({ initialChapterId, onOpenChapter }) {
  const stageRef = useRef(null)
  const isSwitchingRef = useRef(false)
  const hasPositionedRef = useRef(false)
  const initialIndex = Math.max(
    0,
    ARCHIVE_BOOKS.findIndex((book) => book.chapter === initialChapterId),
  )
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const currentBook = ARCHIVE_BOOKS[currentIndex]

  useLayoutEffect(() => {
    let resizeFrame = 0

    function positionOrbitItems(duration) {
      const items = stageRef.current?.querySelectorAll('.archive-orbit-item') ?? []
      items.forEach((item) => {
        const bookIndex = Number(item.dataset.bookIndex)
        const slotIndex = getOrbitSlot(bookIndex, currentIndex)
        const slot = ORBIT_SLOTS[slotIndex]
        const orbitX = Math.min(window.innerWidth * 0.27, Math.abs(slot.x))

        gsap.to(item, {
          x: slot.x === 0 ? 0 : Math.sign(slot.x) * orbitX,
          y: slot.y,
          scale: slot.scale,
          rotation: slot.rotation,
          autoAlpha: slot.opacity,
          zIndex: slot.zIndex,
          filter: slotIndex === 0
            ? 'grayscale(0) brightness(1)'
            : 'grayscale(0.9) brightness(0.48)',
          duration,
          ease: 'power3.inOut',
          overwrite: true,
        })
      })
    }

    positionOrbitItems(hasPositionedRef.current ? 1.15 : 0)

    function handleResize() {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(() => {
        positionOrbitItems(0.32)
        resizeFrame = 0
      })
    }
    window.addEventListener('resize', handleResize)

    hasPositionedRef.current = true

    gsap.fromTo(
      ['.archive-current-number', '.archive-current-copy'],
      { y: 12, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.62,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.28,
      },
    )

    const unlockTimer = window.setTimeout(() => {
      isSwitchingRef.current = false
    }, 1180)

    return () => {
      window.clearTimeout(unlockTimer)
      window.removeEventListener('resize', handleResize)
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame)
    }
  }, [currentIndex])

  function rotateBooks(step) {
    if (isSwitchingRef.current) return
    isSwitchingRef.current = true
    setCurrentIndex((index) => (
      index + step + ARCHIVE_BOOKS.length
    ) % ARCHIVE_BOOKS.length)
  }

  function enterCurrentChapter(book) {
    const chapter = CHAPTERS.find((item) => item.id === book.chapter)
    if (chapter) onOpenChapter?.(chapter)
  }

  return (
    <section className="archive-library archive-library--cd" id="archives">
      <div className="archive-library-backdrop" aria-hidden="true" />

      <button
        className="archive-arrow archive-arrow--previous"
        type="button"
        aria-label="选择上一张档案CD"
        onClick={() => rotateBooks(-1)}
      >
        <svg viewBox="0 0 72 48" aria-hidden="true">
          <path d="M34 10 16 24l18 14M18 24h38" />
        </svg>
      </button>

      <button
        className="archive-arrow archive-arrow--next"
        type="button"
        aria-label="选择下一张档案CD"
        onClick={() => rotateBooks(1)}
      >
        <svg viewBox="0 0 72 48" aria-hidden="true">
          <path d="m38 10 18 14-18 14M54 24H16" />
        </svg>
      </button>

      <div className="archive-carousel archive-orbit" ref={stageRef}>
        <p className="archive-current-number">
          {String(currentIndex + 1).padStart(2, '0')} / {String(ARCHIVE_BOOKS.length).padStart(2, '0')}
        </p>

        <div className="archive-orbit-stage">
          {ARCHIVE_BOOKS.map((book, bookIndex) => {
            const isCurrent = bookIndex === currentIndex

            return (
              <div
                className={`archive-orbit-item ${isCurrent ? 'is-current' : ''}`}
                data-book-index={bookIndex}
                key={book.id}
                style={{
                  '--archive-accent': book.accent,
                  '--archive-secondary': book.secondary,
                  '--archive-panel': book.panel,
                }}
              >
                <span className="archive-cd-trails" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="archive-cd-disc" aria-hidden="true">
                  <img className="archive-cd-art" src={book.coverImage} alt="" />
                  <i className="archive-cd-spectrum" />
                  <span className="archive-cd-ring-copy">SYSU · MEDIA ARCHIVE · 1924 · 2026 ·</span>
                  <b>{book.coverGlyph}</b>
                  <small>{book.number}</small>
                  <em>{book.english}</em>
                  <i className="archive-cd-hub" />
                </span>

                <ArchiveBook
                  book={book}
                  onSelect={isCurrent ? enterCurrentChapter : undefined}
                  position={isCurrent ? 'current' : 'orbit'}
                />
              </div>
            )
          })}
        </div>

        <div className="archive-current-copy" aria-live="polite">
          <strong>{currentBook.title}</strong>
          <span>{currentBook.subtitle}</span>
        </div>
      </div>

      <div className="archive-library-status" aria-hidden="true">

        <i />
        <b>{currentBook.number}</b>
      </div>
    </section>
  )
}
