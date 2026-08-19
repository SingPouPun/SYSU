import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

const BUILDINGS = [1, 2, 3, 4, 5]
const LOADING_LETTERS = [...'LOADING']

export default function SysuLionRunner({ mode = 'opening', label = '' }) {
  const runnerRef = useRef(null)

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const buildings = gsap.utils.toArray('.campus-building')
      const loadingLetters = gsap.utils.toArray('.building-loading-letter')
      const loadingPips = gsap.utils.toArray('.building-loading-pip')

      // 五栋建筑共用一条总时间轴。
      // forEach 每追加完一栋的完整动作，才会继续追加下一栋。
      const jumpTimeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.18,
      })

      buildings.forEach((building) => {
        jumpTimeline
          // 1. 起跳前先压低，像腿部正在蓄力。
          .to(building, {
            y: 2,
            scaleX: 1.13,
            scaleY: 0.82,
            filter: 'brightness(0) drop-shadow(2px 3px 0 #9b9b9b)',
            duration: 0.09,
            ease: 'power2.in',
          })
          // 2. 快速向上冲，建筑被纵向拉长。
          .to(building, {
            y: -29,
            scaleX: 0.93,
            scaleY: 1.13,
            filter: 'brightness(0) saturate(100%) invert(25%) sepia(82%) saturate(1280%) hue-rotate(119deg) brightness(82%) contrast(104%) drop-shadow(2px 3px 0 #a8a8a8)',
            duration: 0.2,
            ease: 'power3.out',
          })
          // 3. 到达最高点时短暂停顿并恢复比例。
          .to(building, {
            y: -33,
            scaleX: 1,
            scaleY: 1,
            duration: 0.11,
            ease: 'power1.out',
          })
          // 4. 加速落地，触地瞬间明显压扁。
          .to(building, {
            y: 0,
            scaleX: 1.6,
            scaleY: 0.4,
            filter: 'brightness(0) drop-shadow(2px 3px 0 #9b9b9b)',
            duration: 0.26,
            ease: 'power3.in',
          })
          // 5. back.out 产生超过原位再收回的弹性余震。
          .to(building, {
            scaleX: 1,
            scaleY: 1,
            duration: 0.25,
            ease: 'back.out(3)',
          })
      })

      // LOADING 的七个圆体字母依次跳起落下。
      const loadingTimeline = gsap.timeline({ repeat: -1 })

      loadingLetters.forEach((letter, index) => {
        loadingTimeline
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

      // 三个圆点依次轻轻点头。
      loadingPips.forEach((pip) => {
        loadingTimeline
          .to(pip, {
            y: -5,
            scale: 1.2,
            autoAlpha: 1,
            backgroundColor: '#006633',
            boxShadow: '2px 2px 0 #9b9b9b',
            duration: 0.12,
            ease: 'power2.out',
          })
          .to(pip, {
            y: 0,
            scale: 1,
            autoAlpha: 0.5,
            backgroundColor: '#111111',
            boxShadow: '2px 2px 0 #888888',
            duration: 0.16,
            ease: 'bounce.out',
          })
      })
    }, runnerRef)

    return () => context.revert()
  }, [])

  return (
    <div
      ref={runnerRef}
      className={`lion-runner-scaffold lion-runner--${mode} lion-runner--buildings`}
      aria-label="中大校园建筑加载动画"
    >
      <div className="lion-motion-stage">
        <div className="campus-buildings" aria-hidden="true">
          {BUILDINGS.map((buildingNumber) => (
            <div
              className={`campus-building-slot campus-building-slot--${buildingNumber}`}
              key={buildingNumber}
            >
              <img
                className="campus-building"
                src={`/mascot/buildings/building-${String(buildingNumber).padStart(2, '0')}.png`}
                alt=""
              />
            </div>
          ))}
        </div>
      </div>

      <div className="lion-loading-copy lion-loading-copy--buildings">
        <strong aria-label="LOADING">
          {LOADING_LETTERS.map((letter, index) => (
            <span
              className="building-loading-letter"
              key={`${letter}-${index}`}
              aria-hidden="true"
            >
              {letter}
            </span>
          ))}
        </strong>
        <div className="building-loading-pips" aria-hidden="true">
          <i className="building-loading-pip" />
          <i className="building-loading-pip" />
          <i className="building-loading-pip" />
        </div>
      </div>
    </div>
  )
}
