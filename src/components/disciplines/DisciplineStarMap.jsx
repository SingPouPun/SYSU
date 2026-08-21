import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { DISCIPLINE_CATALOG } from '../../data/disciplineCatalog.js'
import { readExperienceProgress, writeExperienceProgress } from '../../utils/experienceProgress.js'

const GOLD = '#e7c65a'
const NAVY = '#08264d'

const getCollegeKey = (item) => `${item.name}-${item.campus}`

function CollegeButtons({ colleges, onSelect, readColleges }) {
  const ringCount = Math.ceil(colleges.length / 7)
  const baseCount = Math.floor(colleges.length / ringCount)
  const remainder = colleges.length % ringCount
  const ringSizes = Array.from({ length: ringCount }, (_, index) => baseCount + (index < remainder ? 1 : 0))
  const radii = ringCount === 1 ? [150] : ringCount === 2 ? [128, 194] : [112, 176, 238]
  let offset = 0
  const rings = ringSizes.map((size, ring) => {
    const items = colleges.slice(offset, offset + size)
    offset += size
    return { items, ring, radius: radii[ring] }
  })

  return (
    <div className="discipline-college-ring" aria-label="学院列表">
      {rings.map(({ items, ring, radius }) => (
        <div
          className={`discipline-college-track${ring % 2 ? ' is-reverse' : ''}`}
          key={`${ring}-${radius}`}
          style={{ '--track-size': `${radius * 2}px`, '--track-duration': `${27 + ring * 8}s` }}
        >
          {items.map((item, localIndex) => {
            const globalIndex = ringSizes.slice(0, ring).reduce((sum, size) => sum + size, 0) + localIndex
            const angle = (localIndex / items.length) * 360 - 90 + (ring % 2 ? 180 / items.length : 0)
            const wasRead = readColleges.has(getCollegeKey(item))
            return (
              <button
                type="button"
                className={`discipline-college-chip${wasRead ? ' is-read' : ''}`}
                key={getCollegeKey(item)}
                style={{ '--college-angle': `${angle}deg`, '--college-radius': `${radius}px`, '--college-delay': `${globalIndex * 0.025}s` }}
                onClick={(event) => { event.stopPropagation(); onSelect(item) }}
                title={item.name}
              >
                <b>{String(globalIndex + 1).padStart(2, '0')}</b>
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function DisciplineStarMap() {
  const initialProgressRef = useRef(null)
  if (initialProgressRef.current === null) {
    const stored = readExperienceProgress('sysu-discipline-progress', {})
    const validIds = new Set(DISCIPLINE_CATALOG.map((item) => item.id))
    const validColleges = new Set(DISCIPLINE_CATALOG.flatMap((item) => item.colleges.map(getCollegeKey)))
    initialProgressRef.current = {
      visited: Array.isArray(stored?.visited) ? stored.visited.filter((id) => validIds.has(id)) : [],
      readColleges: Array.isArray(stored?.readColleges)
        ? stored.readColleges.filter((key) => validColleges.has(key))
        : [],
    }
  }
  const initialProgress = initialProgressRef.current
  const rootRef = useRef(null)
  const nodeRefs = useRef([])
  const canvasRefs = useRef([])
  const orbitAngle = useRef(0)
  const activeRef = useRef(null)
  const [activeId, setActiveId] = useState(null)
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [visited, setVisited] = useState(initialProgress.visited)
  const [readColleges, setReadColleges] = useState(() => new Set(initialProgress.readColleges))
  const activeCategory = DISCIPLINE_CATALOG.find((item) => item.id === activeId)
  const rays = useMemo(() => Array.from({ length: 68 }, (_, index) => ({ angle: index * (360 / 68), length: 84 + ((index * 37) % 76) })), [])

  useLayoutEffect(() => { activeRef.current = activeId }, [activeId])

  useLayoutEffect(() => {
    const root = rootRef.current
    const system = root?.querySelector('.discipline-lunar-system')
    if (!system) return undefined
    let previous = performance.now()

    const drawMoon = (canvas, phase) => {
      if (!canvas) return
      const context = canvas.getContext('2d')
      const size = canvas.width
      const radius = size * 0.34
      const center = size / 2
      const normalized = ((phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const offset = normalized <= Math.PI ? radius * (1 - Math.cos(normalized)) : -radius * (1 - Math.cos(normalized))
      context.clearRect(0, 0, size, size)
      context.fillStyle = GOLD
      context.beginPath(); context.arc(center, center, radius, 0, Math.PI * 2); context.fill()
      context.fillStyle = NAVY
      context.beginPath(); context.arc(center + offset, center, radius + 0.7, 0, Math.PI * 2); context.fill()
      context.strokeStyle = GOLD
      context.lineWidth = 2.6
      context.setLineDash([3, 3])
      context.beginPath(); context.arc(center, center, radius + 5, 0, Math.PI * 2); context.stroke()
    }

    const render = () => {
      const now = performance.now()
      const delta = Math.min(now - previous, 32)
      previous = now
      if (!activeRef.current) orbitAngle.current = (orbitAngle.current + delta * 0.000105) % (Math.PI * 2)
      const radius = Math.min(system.clientWidth * 0.43, 330)
      DISCIPLINE_CATALOG.forEach((item, index) => {
        const node = nodeRefs.current[index]
        const angle = orbitAngle.current + index * (Math.PI * 2 / DISCIPLINE_CATALOG.length) - Math.PI / 2
        const isActive = activeRef.current === item.id
        if (node) gsap.set(node, {
          x: isActive ? 0 : Math.cos(angle) * radius,
          y: isActive ? 0 : Math.sin(angle) * radius * 0.88,
          xPercent: -50,
          yPercent: -50,
        })
        drawMoon(canvasRefs.current[index], angle + index * 0.47)
      })
    }

    gsap.ticker.add(render)
    return () => gsap.ticker.remove(render)
  }, [])

  const chooseCategory = (item) => {
    if (activeId === item.id) {
      setActiveId(null)
      setSelectedCollege(null)
      return
    }
    setActiveId(item.id)
    setSelectedCollege(null)
    setVisited((current) => {
      const next = current.includes(item.id) ? current : [...current, item.id]
      writeExperienceProgress('sysu-discipline-progress', {
        visited: next,
        readColleges: [...readColleges],
      })
      return next
    })
  }

  const chooseCollege = (item) => {
    setSelectedCollege(item)
    setReadColleges((current) => {
      const next = new Set(current)
      next.add(getCollegeKey(item))
      writeExperienceProgress('sysu-discipline-progress', {
        visited,
        readColleges: [...next],
      })
      return next
    })
  }

  return (
    <div className={`discipline-star-map discipline-lunar-stage${activeId ? ' has-active-discipline' : ''}`} ref={rootRef}>
      <header className="discipline-map-caption">
        <small>SYSU DISCIPLINE LUNAR MAP / 03</small>
        
  
      </header>

      <div className="discipline-lunar-system">
        <svg className="discipline-radiance" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {rays.map((ray) => (
            <line
              key={ray.angle}
              x1={400 + Math.cos((ray.angle - 90) * Math.PI / 180) * 126}
              y1={400 + Math.sin((ray.angle - 90) * Math.PI / 180) * 126}
              x2={400 + Math.cos((ray.angle - 90) * Math.PI / 180) * (126 + ray.length * 0.78)}
              y2={400 + Math.sin((ray.angle - 90) * Math.PI / 180) * (126 + ray.length * 0.78)}
            />
          ))}
        </svg>
        <div className="discipline-radiance-dots" aria-hidden="true" />
        <div className="discipline-center-seal">
          <span aria-hidden="true" />
          <img src="/branding/sysu-emblem.png" alt="中山大学校徽" />
          
         
        </div>

        <div className="discipline-moon-orbit" aria-label="六大学科月相轨道">
          {DISCIPLINE_CATALOG.map((item, index) => {
            const isActive = activeId === item.id
            const isVisited = visited.includes(item.id)
            const isComplete = item.colleges.every((college) => readColleges.has(getCollegeKey(college)))
            return (
              <div
                className={`discipline-moon-node${isActive ? ' is-active' : ''}${isVisited ? ' is-visited' : ''}${isComplete ? ' is-complete' : ''}`}
                key={item.id}
                ref={(node) => { nodeRefs.current[index] = node }}
                onClick={() => chooseCategory(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') chooseCategory(item)
                }}
                role="button"
                tabIndex="0"
                aria-expanded={isActive}
                aria-label={`${item.glyph} ${item.english}`}
              >
                <span className="discipline-moon-face">
                  <canvas ref={(canvas) => { canvasRefs.current[index] = canvas }} width="112" height="112" aria-hidden="true" />
                  <b>{item.glyph}</b>
                  <small>{item.english}</small>
                </span>
                {isActive && <CollegeButtons colleges={item.colleges} onSelect={chooseCollege} readColleges={readColleges} />}
              </div>
            )
          })}
        </div>
      </div>

      {selectedCollege && (
        <article className="discipline-college-file" aria-live="polite">
          <button
            type="button"
            className="discipline-college-close"
            onClick={(event) => {
              event.stopPropagation()
              setSelectedCollege(null)
            }}
            aria-label="关闭学院介绍"
          >×</button>
          <div className="discipline-college-emblem" aria-label={`${selectedCollege.name}院徽风格占位标识`}>
            <img src="/branding/sysu-emblem.png" alt="" />
            <b>{selectedCollege.name.slice(0, 1)}</b>
          </div>
          <small>SYSU COLLEGE ARCHIVE</small>
          <h3>{selectedCollege.name}</h3>
          <p>{selectedCollege.campus}</p>
          <dl>
            <div><dt>开设专业</dt><dd>{selectedCollege.majors}</dd></div>
            <div><dt>学院简介</dt><dd>{selectedCollege.intro}</dd></div>
          </dl>
        
        </article>
      )}

      <aside className="discipline-lunar-index" aria-hidden="true">

      </aside>
      <footer className="discipline-map-footer">
        <span>{activeCategory ? `${activeCategory.glyph} / ${activeCategory.colleges.length} COLLEGES` : 'DISCIPLINE CONSTELLATION'}</span>
        <i />
        <b>SYSU · 03</b>
      </footer>
    </div>
  )
}
