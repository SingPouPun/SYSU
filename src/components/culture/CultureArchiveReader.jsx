import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const CULTURE_RECORDS = [
  {
    id: 'motto',
    number: '01',
    title: '校训',
    english: 'MOTTO',
    code: 'SYSU / SPIRIT-01',
    headline: '博学 · 审问 · 慎思 · 明辨 · 笃行',
    summary: '五个递进的动作，从求知、追问到判断与实践，构成中大人治学与行事的精神坐标。',
    note: '语出《礼记·中庸》，强调完整而持续的求学过程。',
    tags: ['求知', '思辨', '实践'],
  },
  {
    id: 'anthem',
    number: '02',
    title: '校歌',
    english: 'ANTHEM',
    code: 'SYSU / SOUND-02',
    headline: '白云山高 · 珠江水长',
    summary: '旋律与文字共同保存学校的城市记忆、办学理想和青年担当，让文化不只被阅读，也能够被听见。',
    note: '本页先以节奏档案呈现，后续可接入正式授权音频与完整歌词。',
    tags: ['山水', '歌声', '传承'],
  },
  {
    id: 'emblem',
    number: '03',
    title: '校徽',
    english: 'EMBLEM',
    code: 'SYSU / SYMBOL-03',
    headline: '海棠窗中的中大建筑',
    summary: '圆形徽章内，以海棠式窗格包围标志性建筑，中文校名、英文校名与“1924”共同形成学校识别。',
    note: '中大绿在此作为文化主色，也连接校园植物、建筑与历史记忆。',
    tags: ['海棠窗', '1924', '中大绿'],
  },
  {
    id: 'architecture',
    number: '04',
    title: '建筑',
    english: 'ARCHITECTURE',
    code: 'SYSU / SPACE-04',
    headline: '红砖绿瓦 · 山海新城',
    summary: '从康乐园的岭南建筑，到珠海与深圳的现代校园，空间风貌记录着中山大学不断生长的尺度。',
    note: '建筑既是校园景观，也是教学、生活与集体记忆发生的容器。',
    tags: ['红砖', '绿瓦', '五校园'],
  },
]

function RecordVisual({ record }) {
  if (record.id === 'motto') {
    return (
      <div className="culture-motto-visual" aria-label="校训五字">
        {['博学', '审问', '慎思', '明辨', '笃行'].map((word, index) => (
          <span key={word}><small>0{index + 1}</small><b>{word}</b></span>
        ))}
      </div>
    )
  }

  if (record.id === 'anthem') {
    return (
      <div className="culture-anthem-visual" aria-label="校歌曲谱视觉">
        <div className="culture-sound-bars" aria-hidden="true">
          {[34, 68, 45, 88, 57, 100, 72, 43, 82, 54, 96, 66].map((height, index) => (
            <i key={`${height}-${index}`} style={{ '--bar-height': `${height}%`, '--bar-delay': `${index * -0.07}s` }} />
          ))}
        </div>
        <strong>白云山高<br />珠江水长</strong>
        <small>SYSU SCHOOL ANTHEM / RHYTHM ARCHIVE</small>
      </div>
    )
  }

  if (record.id === 'emblem') {
    return (
      <div className="culture-emblem-visual">
        <span aria-hidden="true">SYSU</span>
        <img src="/branding/sysu-emblem.png" alt="中山大学校徽" />
        <small>EST. 1924</small>
      </div>
    )
  }

  return (
    <div className="culture-architecture-visual">
      <span aria-hidden="true">SPACE</span>
      <img src="/backgrounds/sysu-building-cutout.png" alt="中山大学建筑插画" />
      <small>GUANGZHOU · ZHUHAI · SHENZHEN</small>
    </div>
  )
}

export default function CultureArchiveReader() {
  const rootRef = useRef(null)
  const sheetRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasEntered, setHasEntered] = useState(false)
  const activeRecord = CULTURE_RECORDS[activeIndex]

  useEffect(() => {
    const root = rootRef.current
    if (!root || hasEntered) return undefined

    function handleCdChapterEntered(event) {
      if (event.detail?.id === 'culture') setHasEntered(true)
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setHasEntered(true)
      observer.disconnect()
    }, { threshold: 0.24 })

    observer.observe(root)
    window.addEventListener('sysu:cd-chapter-entered', handleCdChapterEntered)
    return () => {
      observer.disconnect()
      window.removeEventListener('sysu:cd-chapter-entered', handleCdChapterEntered)
    }
  }, [hasEntered])

  useLayoutEffect(() => {
    const root = rootRef.current
    const sheet = sheetRef.current
    if (!root || !sheet || !hasEntered) return undefined

    const context = gsap.context(() => {
      const timeline = gsap.timeline()
      timeline
        .fromTo(sheet, {
          x: 72,
          y: 12,
          autoAlpha: 0,
          clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 24% 100%, 0 76%, 0 22%)',
        }, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          clipPath: 'polygon(5% 0, 100% 0, 100% 89%, 92% 100%, 0 100%, 0 12%)',
          duration: 0.62,
          ease: 'power3.out',
        })
        .fromTo('.culture-record-copy > *', {
          x: 38,
          autoAlpha: 0,
        }, {
          x: 0,
          autoAlpha: 1,
          duration: 0.42,
          stagger: 0.055,
          ease: 'power3.out',
        }, '-=0.38')
        .fromTo('.culture-record-visual', {
          x: 44,
          rotation: 2.5,
          autoAlpha: 0,
        }, {
          x: 0,
          rotation: 0,
          autoAlpha: 1,
          duration: 0.52,
          ease: 'back.out(1.25)',
        }, '-=0.34')
        .fromTo('.culture-archive-scan', {
          xPercent: -130,
          autoAlpha: 0,
        }, {
          xPercent: 155,
          autoAlpha: 0.62,
          duration: 0.72,
          ease: 'power2.inOut',
        }, '-=0.28')
        .set('.culture-archive-scan', { autoAlpha: 0 })
    }, root)

    return () => context.revert()
  }, [activeIndex, hasEntered])

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100
    event.currentTarget.style.setProperty('--culture-light-x', `${x}%`)
    event.currentTarget.style.setProperty('--culture-light-y', `${y}%`)
  }

  return (
    <div
      className={`culture-archive-reader${hasEntered ? ' is-entered' : ''}`}
      ref={rootRef}
      onPointerMove={handlePointerMove}
    >
      <div className="culture-archive-backdrop" aria-hidden="true">
        <b>CULTURE</b><span>02 / SYSU</span>
      </div>

      <nav className="culture-archive-tabs" aria-label="中大文化档案">
        {CULTURE_RECORDS.map((record, index) => (
          <button
            type="button"
            key={record.id}
            className={index === activeIndex ? 'is-active' : ''}
            aria-current={index === activeIndex ? 'page' : undefined}
            onClick={() => setActiveIndex(index)}
          >
            <span>{record.number}</span>
            <b>{record.title}</b>
            <small>{record.english}</small>
          </button>
        ))}
      </nav>

      <div className="culture-archive-page-stack">
        <i className="culture-paper-layer culture-paper-layer--back" aria-hidden="true" />
        <i className="culture-paper-layer culture-paper-layer--middle" aria-hidden="true" />
        <article
          className="culture-archive-sheet"
          data-record={activeRecord.id}
          ref={sheetRef}
          key={activeRecord.id}
        >
          <div className="culture-archive-scan" aria-hidden="true" />
          <header className="culture-record-header">
            <span>{activeRecord.code}</span>
            <b>{activeRecord.number} / 04</b>
          </header>

          <div className="culture-record-layout">
            <div className="culture-record-copy">
              <small>{activeRecord.english} / CULTURE FILE</small>
              <h3>{activeRecord.title}</h3>
              <h4>{activeRecord.headline}</h4>
              <p>{activeRecord.summary}</p>
              <blockquote>{activeRecord.note}</blockquote>
              <div className="culture-record-tags">
                {activeRecord.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>
            <div className="culture-record-visual">
              <RecordVisual record={activeRecord} />
            </div>
          </div>

          <footer className="culture-record-footer">
            <span>SYSU CULTURAL ARCHIVE</span>
            <i />
            <b>{String(activeIndex + 1).padStart(2, '0')}</b>
          </footer>
        </article>
      </div>
    </div>
  )
}
