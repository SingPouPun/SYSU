import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const CAMPUSES = [
  { id: 'south', name: '南校园', nickname: '康乐园', city: '广州', map: '/campuses/south-map.png', photos: ['/campuses/south-map.png', '/campuses/south.jpg'] },
  { id: 'east', name: '东校园', nickname: '中东', city: '广州', map: '/campuses/east-map.png', photos: ['/campuses/east-map.png', '/campuses/east.png'] },
  { id: 'north', name: '北校园', nickname: '红楼', city: '广州', map: '/campuses/north-map.png', photos: ['/campuses/north-map.png', '/campuses/north.jpg'] },
  { id: 'zhuhai', name: '珠海校区', nickname: '中珠', city: '珠海', map: '/campuses/zhuhai-map.png', photos: ['/campuses/zhuhai-map.png', '/campuses/zhuhai.jpg'] },
  { id: 'shenzhen', name: '深圳校区', nickname: '中深', city: '深圳', map: '/campuses/shenzhen-map.png', photos: ['/campuses/shenzhen-map.png', '/campuses/shenzhen.jpg'] },
]

const CARD_LANDING = [
  { x: 0.43, y: 0.25, rotation: -7 },
  { x: 0.65, y: 0.23, rotation: 5 },
  { x: 0.82, y: 0.38, rotation: -3 },
  { x: 0.49, y: 0.69, rotation: 7 },
  { x: 0.73, y: 0.71, rotation: -5 },
]

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

export default function CampusFileGallery() {
  const rootRef = useRef(null)
  const viewerRef = useRef(null)
  const imageRef = useRef(null)
  const initializedRef = useRef(false)
  const openedRef = useRef(false)
  const landingJitterRef = useRef(CARD_LANDING.map(() => ({
    x: randomBetween(-26, 26),
    y: randomBetween(-20, 20),
    rotation: randomBetween(-2.5, 2.5),
  })))
  const [activeCampus, setActiveCampus] = useState(CAMPUSES[0])
  const [photoIndex, setPhotoIndex] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [envelopeOpen, setEnvelopeOpen] = useState(false)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray('.campus-file-card')
      gsap.set(cards, { x: 0, y: 0, rotation: 0, scale: 0.62, autoAlpha: 0 })
      gsap.set('.campus-envelope', { x: 0, rotation: -2.5 })
      gsap.set('.campus-envelope-mouth', { x: 0, scaleY: 1 })
    }, root)

    initializedRef.current = true

    const resizeObserver = new ResizeObserver(() => {
      if (!openedRef.current) return
      const cards = [...root.querySelectorAll('.campus-file-card')]
      const targets = getCardTargets(root, cards)
      gsap.to(cards, {
        x: (index) => targets[index].x,
        y: (index) => targets[index].y,
        rotation: (index) => targets[index].rotation,
        duration: 0.38,
        ease: 'power2.out',
        overwrite: true,
      })
    })
    resizeObserver.observe(root)

    return () => {
      resizeObserver.disconnect()
      context.revert()
    }
  }, [])

  function getCardTargets(root, cards) {
    const field = root.querySelector('.campus-card-field')
    const width = root.clientWidth
    const height = root.clientHeight
    const fieldX = field.offsetLeft
    const fieldY = field.offsetTop

    return cards.map((card, index) => {
      const halfWidth = card.offsetWidth / 2
      const halfHeight = card.offsetHeight / 2
      const jitter = landingJitterRef.current[index]
      const centerX = Math.min(
        width - halfWidth - 112,
        Math.max(halfWidth + 22, width * CARD_LANDING[index].x + jitter.x),
      )
      const centerY = Math.min(
        height - halfHeight - 22,
        Math.max(halfHeight + 22, height * CARD_LANDING[index].y + jitter.y),
      )

      return {
        x: centerX - fieldX,
        y: centerY - fieldY,
        rotation: CARD_LANDING[index].rotation + jitter.rotation,
      }
    })
  }

  function openEnvelope() {
    if (openedRef.current || !rootRef.current) return
    openedRef.current = true
    setEnvelopeOpen(true)

    const root = rootRef.current
    const cards = [...root.querySelectorAll('.campus-file-card')]
    const targets = getCardTargets(root, cards)

    gsap.timeline({ delay: 0.02 })
        .to('.campus-envelope', {
          x: -22,
          scaleX: 0.94,
          scaleY: 1.025,
          duration: 0.11,
          ease: 'power4.in',
        }, 0)
        .to('.campus-envelope-mouth', {
          x: 13,
          scaleY: 1.06,
          boxShadow: '14px 7px 0 rgb(0 0 0 / 24%)',
          duration: 0.18,
          ease: 'power3.out',
        }, 0.08)
        .to('.campus-envelope', {
          x: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 0.3,
          ease: 'back.out(2.2)',
        }, 0.13)
        .to(cards, {
          x: (index) => targets[index].x,
          y: (index) => targets[index].y,
          rotation: (index) => targets[index].rotation,
          scale: 1,
          autoAlpha: 1,
          duration: 0.74,
          stagger: 0.09,
          ease: 'back.out(1.65)',
        }, 0.22)
  }

  function openCampus(campus) {
    setActiveCampus(campus)
    setPhotoIndex(0)
    setViewerOpen(true)

    window.requestAnimationFrame(() => {
      gsap.fromTo(viewerRef.current, {
        autoAlpha: 0,
        scale: 0.94,
        y: 30,
      }, {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 0.52,
        ease: 'power3.out',
      })
      gsap.fromTo(imageRef.current, {
        xPercent: 18,
        scale: 1.07,
        filter: 'blur(9px)',
      }, {
        xPercent: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.78,
        ease: 'power3.inOut',
      })
    })
  }

  function changePhoto(step) {
    const nextIndex = (photoIndex + step + activeCampus.photos.length) % activeCampus.photos.length
    const direction = step > 0 ? 1 : -1
    const currentImage = imageRef.current

    gsap.to(currentImage, {
      xPercent: -direction * 22,
      scale: 0.97,
      filter: 'blur(8px)',
      autoAlpha: 0,
      duration: 0.34,
      ease: 'power2.in',
      onComplete: () => {
        setPhotoIndex(nextIndex)
        window.requestAnimationFrame(() => {
          gsap.fromTo(imageRef.current, {
            xPercent: direction * 24,
            scale: 1.05,
            filter: 'blur(10px)',
            autoAlpha: 0,
          }, {
            xPercent: 0,
            scale: 1,
            filter: 'blur(0px)',
            autoAlpha: 1,
            duration: 0.7,
            ease: 'power3.inOut',
          })
        })
      },
    })
  }

  function closeViewer() {
    gsap.to(viewerRef.current, {
      autoAlpha: 0,
      scale: 0.96,
      y: 24,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => setViewerOpen(false),
    })
  }

  return (
    <div className="campus-file-gallery" ref={rootRef}>
      <div className="campus-envelope-scene">
        <button
          className={`campus-envelope ${envelopeOpen ? 'is-open' : ''}`}
          type="button"
          data-button-feedback="custom"
          disabled={envelopeOpen}
          aria-label={envelopeOpen ? '校园信封已打开' : '打开校园信封'}
          onClick={openEnvelope}
        >
          <span className="campus-envelope-cover-art" aria-hidden="true">
            <i />
            <b />
            <span className="campus-envelope-sheen" />
          </span>
          <span className="campus-envelope-emblem" aria-hidden="true">
            <img src="/branding/sysu-emblem.png" alt="" />
          </span>
          <span className="campus-envelope-mouth" aria-hidden="true" />
          <i className="campus-envelope-click-ring" aria-hidden="true" />
        </button>

        <div className="campus-card-field">
          {CAMPUSES.map((campus, index) => (
            <button
              className="campus-file-card"
              data-button-feedback="custom"
              key={campus.id}
              type="button"
              onClick={() => openCampus(campus)}
              style={{ '--campus-index': index }}
              data-page={`0${index + 1}`}
            >
              <img src={campus.map} alt={`${campus.name}校园图`} />
              <span className="campus-card-shade" />
              
              <strong>
                {[...campus.nickname].map((glyph, glyphIndex) => (
                  <i key={`${campus.id}-${glyphIndex}`}>{glyph}</i>
                ))}
              </strong>
              
            </button>
          ))}
        </div>
      </div>

      {viewerOpen && (
        <div className="campus-photo-viewer" ref={viewerRef}>
          <div className="campus-viewer-frame">
            <img ref={imageRef} src={activeCampus.photos[photoIndex]} alt={`${activeCampus.name}第${photoIndex + 1}张档案图`} />
            <span className="campus-viewer-halftone" aria-hidden="true" />
          </div>
          <div className="campus-viewer-copy">
            <strong>{activeCampus.name}</strong>
          </div>
          <button className="campus-viewer-close" type="button" onClick={closeViewer}>返回名片</button>
          <button className="campus-viewer-arrow campus-viewer-arrow--prev" type="button" onClick={() => changePhoto(-1)} aria-label="上一张">‹</button>
          <button className="campus-viewer-arrow campus-viewer-arrow--next" type="button" onClick={() => changePhoto(1)} aria-label="下一张">›</button>
          <div className="campus-viewer-dots">
            {activeCampus.photos.map((photo, index) => (
              <button
                className={index === photoIndex ? 'is-active' : ''}
                type="button"
                key={photo}
                aria-label={`查看第${index + 1}张`}
                onClick={() => index !== photoIndex && changePhoto(index > photoIndex ? 1 : -1)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
