import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'

const HISTORY_ERAS = [
  { id: 'foundation', title: '肇基', accent: '#824536', images: ['/history/foundation-01.png'] },
  { id: 'naming', title: '正名', accent: '#354B65', images: ['/history/naming-01.png', '/history/naming-02.png', '/history/naming-03.png'] },
  { id: 'continuance', title: '弦歌', accent: '#53656A', images: ['/history/continuance-01.png'] },
  { id: 'restructure', title: '重构', accent: '#486276', images: ['/history/restructure-01.png'] },
  { id: 'renewal', title: '开新', accent: '#397269', images: ['/history/renewal-01.png'] },
  { id: 'merger', title: '合璧', accent: '#276D70', images: ['/history/merger-01.png'] },
  { id: 'three-campuses', title: '鼎立', accent: '#856B3C', images: ['/history/three-campuses-01.png'] },
  { id: 'century', title: '世纪', accent: '#792F38', images: ['/history/century-01.jpg', '/history/century-02.jpg', '/history/century-03.png', '/history/century-04.webp', '/history/century-05.webp', '/history/century-06.webp', '/campuses/south-02.webp'] },
]

const HISTORY_PROGRESS_KEY = 'sysu-history-card-progress'

function loadHistoryProgress() {
  const fallback = { unlocked: false, viewed: [], futureUnlocked: false, futureRead: false }

  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_PROGRESS_KEY) ?? 'null')
    if (!stored || typeof stored !== 'object') return fallback

    const viewed = Array.isArray(stored.viewed)
      ? stored.viewed.filter((index) => Number.isInteger(index) && index >= 0 && index < HISTORY_ERAS.length)
      : []
    const futureRead = stored.futureRead === true
    const futureUnlocked = futureRead || stored.futureUnlocked === true

    return {
      unlocked: futureUnlocked || viewed.length > 0 || stored.unlocked === true,
      viewed: futureUnlocked ? HISTORY_ERAS.map((_, index) => index) : [...new Set(viewed)],
      futureUnlocked,
      futureRead,
    }
  } catch {
    return fallback
  }
}

function finalPose(root, index) {
  const width = root.clientWidth
  const cardWidth = root.querySelector('.history-era-card')?.offsetWidth ?? 140
  const usableWidth = Math.min(Math.max(width - cardWidth - 32, 120), 1080)
  const normalized = index / (HISTORY_ERAS.length - 1)
  const distanceFromCenter = Math.abs(index - 3.5) / 3.5

  return {
    x: (normalized - 0.5) * usableWidth,
    y: 18 + distanceFromCenter ** 1.65 * 92,
    rotation: (index - 3.5) * 4.8,
    scale: 1 - distanceFromCenter * 0.09,
  }
}

function completedPose(root, index) {
  const pose = finalPose(root, index)
  return {
    ...pose,
    x: pose.x * 0.84,
    y: pose.y + Math.min(Math.max(root.clientHeight * 0.17, 96), 132),
    scale: pose.scale * 0.82,
  }
}

export default function HistoryCardOrbit() {
  const initialProgressRef = useRef(null)
  if (initialProgressRef.current === null) initialProgressRef.current = loadHistoryProgress()
  const initialProgress = initialProgressRef.current
  const rootRef = useRef(null)
  const activeIndexRef = useRef(null)
  const viewedErasRef = useRef(new Set(initialProgress.viewed))
  const futureUnlockingRef = useRef(false)
  const futureModeRef = useRef(initialProgress.futureUnlocked)
  const futureReadRef = useRef(initialProgress.futureRead)
  const archiveUnlockedRef = useRef(initialProgress.unlocked)
  const entranceTimelineRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [viewedCount, setViewedCount] = useState(initialProgress.viewed.length)
  const [futureMode, setFutureMode] = useState(initialProgress.futureUnlocked)
  const [futureOpen, setFutureOpen] = useState(false)
  const [archiveUnlocked, setArchiveUnlocked] = useState(initialProgress.unlocked)
  const [archiveComplete, setArchiveComplete] = useState(initialProgress.futureRead)

  activeIndexRef.current = activeIndex

  function persistProgress(overrides = {}) {
    const progress = {
      unlocked: archiveUnlockedRef.current,
      viewed: [...viewedErasRef.current].sort((a, b) => a - b),
      futureUnlocked: futureModeRef.current,
      futureRead: futureReadRef.current,
      ...overrides,
    }

    try {
      localStorage.setItem(HISTORY_PROGRESS_KEY, JSON.stringify(progress))
    } catch {
      // 无痕或受限环境中仍保留本次会话内的阅读进度。
    }
  }

  useLayoutEffect(() => {
    if (activeIndex === null) return undefined
    const viewer = rootRef.current?.querySelector('.history-era-viewer')
    if (!viewer) return undefined

    gsap.fromTo(viewer, {
      autoAlpha: 0,
      y: 54,
      scale: 0.76,
      rotationX: -8,
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      duration: 0.82,
      ease: 'power3.out',
    })

    return () => gsap.killTweensOf(viewer)
  }, [activeIndex])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const slots = [...root.querySelectorAll('.history-era-slot')]

    function settleCards(duration = 0) {
      slots.forEach((slot, index) => {
        gsap.to(slot, {
          ...finalPose(root, index),
          autoAlpha: 1,
          zIndex: 10 + index,
          duration,
          ease: duration ? 'power3.inOut' : 'none',
          overwrite: true,
        })
      })
    }

    function settleCompletedArchive(duration = 0) {
      const newChapterCard = root.querySelector('.history-new-chapter-card')
      slots.forEach((slot, index) => {
        gsap.to(slot, {
          ...completedPose(root, index),
          autoAlpha: 1,
          zIndex: 10 + index,
          duration,
          ease: duration ? 'power3.inOut' : 'none',
          overwrite: true,
        })
      })
      gsap.to(newChapterCard, {
        x: 0,
        y: Math.max(root.clientHeight * -0.22, -166),
        rotationY: 0,
        scale: 0.9,
        autoAlpha: 1,
        zIndex: 70,
        duration,
        ease: duration ? 'power3.inOut' : 'none',
        overwrite: true,
      })
      root.classList.add('is-ready', 'is-future-ready', 'has-complete-archive')
    }

    function playCdEntrance() {
      if (futureModeRef.current || futureUnlockingRef.current) return

      if (archiveUnlockedRef.current) {
        settleCards(0)
        root.classList.add('is-ready')
        return
      }

      entranceTimelineRef.current?.kill()
      archiveUnlockedRef.current = true
      setArchiveUnlocked(true)
      persistProgress({ unlocked: true })
      setActiveIndex(null)
      root.classList.add('is-history-entering')
      root.classList.remove('is-ready')

      const width = root.clientWidth
      const height = root.clientHeight
      const radiusX = Math.min(width * 0.29, 350)
      const radiusY = Math.min(height * 0.2, 142)
      const leftPose = finalPose(root, 0)

      slots.forEach((slot, index) => {
        gsap.set(slot, {
          x: width * 0.68 + index * 10,
          y: height * 0.48 + index * 6,
          rotation: 18,
          scale: 0.62,
          autoAlpha: 0,
          zIndex: 40 - index,
        })
      })

      const orbit = { angle: 0 }
      const timeline = gsap.timeline()
      entranceTimelineRef.current = timeline

      timeline
        .to(slots, {
          x: (index) => Math.cos(Math.PI / 2 + (index / slots.length) * Math.PI * 2) * radiusX,
          y: (index) => Math.sin(Math.PI / 2 + (index / slots.length) * Math.PI * 2) * radiusY - 45,
          rotation: 0,
          scale: 0.86,
          autoAlpha: 1,
          duration: 0.34,
          stagger: 0.008,
          ease: 'power3.in',
        })
        .to(orbit, {
          angle: Math.PI * 6,
          duration: 1.62,
          ease: 'none',
          onUpdate: () => {
            slots.forEach((slot, index) => {
              const angle = Math.PI / 2 + orbit.angle + (index / slots.length) * Math.PI * 2
              const depth = (Math.sin(angle) + 1) / 2
              gsap.set(slot, {
                x: Math.cos(angle) * radiusX,
                y: Math.sin(angle) * radiusY - 45,
                rotation: Math.cos(angle) * 12,
                scale: 0.75 + depth * 0.25,
                zIndex: Math.round(10 + depth * 30),
              })
            })
          },
        })
        .to(slots, {
          x: leftPose.x,
          y: leftPose.y,
          rotation: leftPose.rotation,
          scale: leftPose.scale,
          autoAlpha: 1,
          zIndex: (index) => 20 + index,
          duration: 0.38,
          ease: 'power3.inOut',
        })
        .set(slots.slice(1), {
          autoAlpha: 0,
          x: leftPose.x,
          y: leftPose.y,
          rotation: leftPose.rotation,
          scale: leftPose.scale,
        })
        .to(slots.slice(1), {
          x: (index) => finalPose(root, index + 1).x,
          y: (index) => finalPose(root, index + 1).y,
          rotation: (index) => finalPose(root, index + 1).rotation,
          scale: (index) => finalPose(root, index + 1).scale,
          autoAlpha: 1,
          zIndex: (index) => 11 + index,
          duration: 0.46,
          stagger: {
            each: 0.085,
            from: 'start',
          },
          ease: 'expo.out',
        })
        .add(() => {
          root.classList.remove('is-history-entering')
          root.classList.add('is-ready')
        }, '>-0.18')
    }

    function handleCdChapterEntered(event) {
      if (event.detail?.id !== 'history') return
      if (futureReadRef.current) {
        settleCompletedArchive(0)
      } else if (futureModeRef.current) {
        gsap.set(slots, { autoAlpha: 0 })
        gsap.set(root.querySelector('.history-new-chapter-card'), { autoAlpha: 1, rotationY: 0, scale: 1 })
        root.classList.add('is-future-ready')
      } else {
        playCdEntrance()
      }
    }

    gsap.set(slots, {
      x: root.clientWidth * 0.7,
      y: root.clientHeight * 0.48,
      scale: 0.62,
      autoAlpha: 0,
      transformOrigin: '50% 72%',
    })
    window.addEventListener('sysu:cd-chapter-entered', handleCdChapterEntered)

    if (futureReadRef.current) {
      settleCompletedArchive(0)
    } else if (futureModeRef.current) {
      gsap.set(slots, { autoAlpha: 0 })
      gsap.set(root.querySelector('.history-new-chapter-card'), { autoAlpha: 1, rotationY: 0, scale: 1 })
      root.classList.add('is-future-ready')
    } else if (archiveUnlockedRef.current) {
      settleCards(0)
      root.classList.add('is-ready')
    }

    const resizeObserver = new ResizeObserver(() => {
      if (futureReadRef.current && activeIndexRef.current === null) {
        settleCompletedArchive(0.3)
      } else if (archiveUnlockedRef.current && activeIndexRef.current === null && !futureModeRef.current && !futureUnlockingRef.current) {
        settleCards(0.3)
      }
    })
    resizeObserver.observe(root)

    return () => {
      window.removeEventListener('sysu:cd-chapter-entered', handleCdChapterEntered)
      resizeObserver.disconnect()
      entranceTimelineRef.current?.kill()
      gsap.killTweensOf(slots)
    }
  }, [])

  function selectEra(index) {
    if (!archiveUnlockedRef.current || activeIndexRef.current !== null || futureUnlockingRef.current || (futureModeRef.current && !futureReadRef.current)) return

    const root = rootRef.current
    const slots = [...root.querySelectorAll('.history-era-slot')]
    viewedErasRef.current.add(index)
    setViewedCount(viewedErasRef.current.size)
    persistProgress()
    setActiveImageIndex(0)
    setActiveIndex(index)

    slots.forEach((slot, slotIndex) => {
      if (slotIndex === index) {
        gsap.to(slot, {
          x: 0,
          y: 2,
          rotation: 0,
          scale: 1.18,
          autoAlpha: 0,
          zIndex: 60,
          duration: 0.7,
          ease: 'power3.inOut',
          overwrite: true,
        })
      } else {
        const pose = finalPose(root, slotIndex)
        gsap.to(slot, {
          x: pose.x * 1.08,
          y: pose.y + 152,
          rotation: pose.rotation,
          scale: pose.scale * 0.78,
          autoAlpha: 0.16,
          zIndex: 4 + slotIndex,
          duration: 0.68,
          ease: 'power3.inOut',
          overwrite: true,
        })
      }
    })
  }

  function restoreCards(duration = 0.74) {
    const root = rootRef.current
    const slots = [...root.querySelectorAll('.history-era-slot')]
    slots.forEach((slot, index) => {
      gsap.to(slot, {
        ...(futureReadRef.current ? completedPose(root, index) : finalPose(root, index)),
        autoAlpha: 1,
        zIndex: 10 + index,
        duration,
        ease: 'power3.inOut',
        overwrite: true,
      })
    })
  }

  function unlockFutureChapter() {
    if (futureModeRef.current) return
    futureUnlockingRef.current = true

    const root = rootRef.current
    const slots = [...root.querySelectorAll('.history-era-slot')]
    const newChapterCard = root.querySelector('.history-new-chapter-card')
    const mergedTopCard = slots.at(-1)?.querySelector('.history-era-card')
    root.classList.remove('is-ready')

    const timeline = gsap.timeline()
    timeline
      .to(slots, {
        x: 0,
        y: 24,
        rotation: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 1.15,
        stagger: { amount: 0.42, from: 'edges' },
        ease: 'power3.inOut',
      })
      .to(slots.slice(0, -1), {
        autoAlpha: 0,
        duration: 0.18,
        stagger: 0.018,
        ease: 'power2.out',
      })
      .to(mergedTopCard, {
        rotationY: 90,
        duration: 0.36,
        ease: 'power2.in',
      })
      .call(() => {
        gsap.set(slots.at(-1), { autoAlpha: 0 })
        gsap.set(newChapterCard, {
          autoAlpha: 1,
          rotationY: -90,
          scale: 1,
        })
        futureModeRef.current = true
        setFutureMode(true)
        persistProgress({ futureUnlocked: true })
      })
      .to(newChapterCard, {
        rotationY: 0,
        duration: 0.36,
        ease: 'power2.out',
      })
      .call(() => {
        futureUnlockingRef.current = false
        root.classList.add('is-future-ready')
      })
  }

  function closeViewer() {
    if (activeIndex === null) return
    const viewer = rootRef.current.querySelector('.history-era-viewer')
    const shouldUnlock = viewedErasRef.current.size === HISTORY_ERAS.length && !futureModeRef.current
    if (shouldUnlock) {
      futureUnlockingRef.current = true
      rootRef.current.classList.add('is-future-unlocking')
      rootRef.current.classList.remove('is-ready')
    }

    gsap.to(viewer, {
      autoAlpha: 0,
      y: 40,
      scale: 0.84,
      duration: 0.42,
      ease: 'power3.in',
      onComplete: () => {
        activeIndexRef.current = null
        setActiveIndex(null)
        restoreCards()
        if (shouldUnlock) {
          window.setTimeout(unlockFutureChapter, 780)
        }
      },
    })
  }

  function changeActiveImage(nextIndex) {
    if (!activeEra || activeEra.images.length < 2) return
    const imageCount = activeEra.images.length
    setActiveImageIndex((nextIndex + imageCount) % imageCount)
  }

  function closeFutureChapter() {
    setFutureOpen(false)
    if (futureReadRef.current) return

    const root = rootRef.current
    const slots = [...root.querySelectorAll('.history-era-slot')]
    const newChapterCard = root.querySelector('.history-new-chapter-card')
    futureReadRef.current = true
    setArchiveComplete(true)
    persistProgress({ futureRead: true, futureUnlocked: true })
    root.classList.add('has-complete-archive', 'is-ready')

    gsap.timeline()
      .to(newChapterCard, {
        y: Math.max(root.clientHeight * -0.22, -166),
        scale: 0.9,
        duration: 0.72,
        ease: 'power3.inOut',
      })
      .set(slots, {
        x: 0,
        y: 120,
        rotation: 0,
        scale: 0.62,
        autoAlpha: 0,
      })
      .to(slots, {
        x: (index) => completedPose(root, index).x,
        y: (index) => completedPose(root, index).y,
        rotation: (index) => completedPose(root, index).rotation,
        scale: (index) => completedPose(root, index).scale,
        autoAlpha: 1,
        zIndex: (index) => 10 + index,
        duration: 0.72,
        stagger: 0.065,
        ease: 'expo.out',
      }, '-=0.28')
  }

  function moveCardWithPointer(event) {
    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5

    gsap.to(card, {
      '--history-tilt-x': `${-vertical * 9}deg`,
      '--history-tilt-y': `${horizontal * 11}deg`,
      '--history-sheen-x': `${50 + horizontal * 72}%`,
      '--history-sheen-y': `${50 + vertical * 72}%`,
      duration: 0.24,
      ease: 'power2.out',
      overwrite: true,
    })
    gsap.to(card.querySelector('.history-era-cover strong'), {
      x: horizontal * 7,
      y: vertical * 5,
      duration: 0.28,
      ease: 'power2.out',
      overwrite: true,
    })
  }

  function resetCardPointer(event) {
    const card = event.currentTarget
    gsap.to(card, {
      '--history-tilt-x': '0deg',
      '--history-tilt-y': '0deg',
      '--history-sheen-x': '50%',
      '--history-sheen-y': '50%',
      duration: 0.42,
      ease: 'back.out(1.7)',
      overwrite: true,
    })
    gsap.to(card.querySelector('.history-era-cover strong'), {
      x: 0,
      y: 0,
      duration: 0.42,
      ease: 'back.out(1.7)',
      overwrite: true,
    })
  }

  const activeEra = activeIndex === null ? null : HISTORY_ERAS[activeIndex]

  return (
    <div className={`history-card-orbit ${archiveUnlocked ? 'is-archive-unlocked' : ''} ${activeIndex !== null ? 'has-active-card' : ''} ${futureMode ? 'has-future-card' : ''} ${archiveComplete ? 'has-complete-archive' : ''}`} ref={rootRef}>
      <div className="history-orbit-caption" aria-live="polite">
        <small>{futureMode ? 'THE NEXT CHAPTER' : `SYSU CENTURY ARCHIVE · ${viewedCount}/8`}</small>
        <strong>{futureMode ? '2026-' : '1924—2024'}</strong>
      </div>

      {HISTORY_ERAS.map((era, index) => (
        <div className="history-era-slot" key={era.id}>
          <button
            className={`history-era-card ${viewedErasRef.current.has(index) ? 'is-viewed' : ''}`}
            style={{ '--history-accent': era.accent }}
            data-button-feedback="custom"
            type="button"
            onClick={() => selectEra(index)}
            onPointerMove={moveCardWithPointer}
            onPointerLeave={resetCardPointer}
            tabIndex={archiveUnlocked && activeIndex === null && (!futureMode || archiveComplete) ? 0 : -1}
            aria-label={`查看${era.title}阶段`}
          >
            <span className="history-era-cover">
              <small>SYSU · H-{String(index + 1).padStart(2, '0')}</small>
              <strong aria-label={era.title}><span>{era.title[0]}</span><span>{era.title[1]}</span></strong>
              <img className="history-cover-emblem" src="/branding/sysu-emblem.png" alt="" aria-hidden="true" />
              <i>HISTORY ARCHIVE</i>
            </span>
            <span className="history-card-sheen" aria-hidden="true" />
          </button>
        </div>
      ))}

      {activeEra && (
        <section className="history-era-viewer" aria-label={`${activeEra.title}阶段图片`}>
          <header>
            <span>{String(activeIndex + 1).padStart(2, '0')} / 08</span>
            <div><small>SYSU HISTORY ARCHIVE</small><strong>{activeEra.title}</strong></div>
            <button type="button" onClick={closeViewer}>返回牌阵 ×</button>
          </header>
          <div className="history-era-viewer-media">
            {activeEra.images.length > 0 ? activeEra.images.map((image, imageIndex) => (
              <img
                className={activeImageIndex === imageIndex ? 'is-current' : ''}
                src={image}
                alt={`${activeEra.title}阶段校史图片 ${imageIndex + 1}`}
                key={image}
              />
            )) : <div className="history-era-empty"><b>鼎</b><span>图片资料待补充</span></div>}
          </div>
          {activeEra.images.length > 1 && (
            <>
              <button className="history-viewer-arrow history-viewer-arrow--prev" type="button" onClick={() => changeActiveImage(activeImageIndex - 1)} aria-label="上一张图片">‹</button>
              <button className="history-viewer-arrow history-viewer-arrow--next" type="button" onClick={() => changeActiveImage(activeImageIndex + 1)} aria-label="下一张图片">›</button>
            </>
          )}
          <footer>
            <strong>{activeEra.title}</strong>
            <span>{activeEra.images.length > 1 ? `${String(activeImageIndex + 1).padStart(2, '0')} / ${String(activeEra.images.length).padStart(2, '0')} · MANUAL SELECT` : 'SYSU · ARCHIVE IMAGE'}</span>
            <i>{activeEra.images.map((image, imageIndex) => <button className={activeImageIndex === imageIndex ? 'is-current' : ''} type="button" aria-label={`查看第${imageIndex + 1}张图片`} onClick={() => changeActiveImage(imageIndex)} key={image} />)}</i>
          </footer>
        </section>
      )}

      <button
        className="history-new-chapter-card"
        style={{ '--history-accent': '#E7C65A' }}
        data-button-feedback="custom"
        type="button"
        onClick={() => setFutureOpen(true)}
        onPointerMove={moveCardWithPointer}
        onPointerLeave={resetCardPointer}
      >
        <span className="history-era-cover history-new-chapter-cover">
          <small>SYSU · H-09</small>
          <strong aria-label="新章"><span>新</span><span>章</span></strong>
          <img className="history-cover-emblem" src="/branding/sysu-emblem.png" alt="" aria-hidden="true" />
          <i>FUTURE ARCHIVE</i>
        </span>
        <span className="history-card-sheen" aria-hidden="true" />
      </button>

      {futureOpen && createPortal(
        <section className="history-future-overlay" aria-label="校史新章">
          <img src="/history/new-chapter.png" alt="中山大学新章校园绘景" />
          <button type="button" onClick={closeFutureChapter} aria-label="关闭新章图片">×</button>
        </section>,
        document.body,
      )}
    </div>
  )
}
