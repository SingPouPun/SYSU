import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function SiteHeader({
  chapters,
  activeChapter,
  activePage,
  visible,
  onReveal,
  onHome,
  onNavigate,
  onShare,
  onDatabase,
  onAccount,
  user,
}) {
  const markRef = useRef(null)
  const pageOrder = ['top', 'archives', ...chapters.map((chapter) => chapter.id)]
  const pageIndex = Math.max(0, pageOrder.indexOf(activePage))
  const activeNavIndex = chapters.findIndex((chapter) => chapter.id === activeChapter)
  const previousActiveNavIndexRef = useRef(activeNavIndex)
  const pillIsAppearing = activeNavIndex >= 0 && previousActiveNavIndexRef.current < 0

  useLayoutEffect(() => {
    previousActiveNavIndexRef.current = activeNavIndex
  }, [activeNavIndex])

  function bounceMark() {
    const mark = markRef.current
    if (!mark) return

    gsap.killTweensOf(mark)
    gsap.timeline()
      .to(mark, {
        y: -24,
        rotation: -14,
        scaleX: 0.86,
        scaleY: 1.2,
        duration: 0.17,
        ease: 'power3.out',
      })
      .to(mark, {
        y: 9,
        rotation: 7,
        scaleX: 1.18,
        scaleY: 0.82,
        duration: 0.13,
        ease: 'power3.in',
      })
      .to(mark, {
        y: -8,
        rotation: -7,
        scaleX: 0.95,
        scaleY: 1.08,
        duration: 0.16,
        ease: 'power2.out',
      })
      .to(mark, {
        y: 0,
        rotation: -5,
        scaleX: 1,
        scaleY: 1,
        duration: 0.34,
        ease: 'elastic.out(1, 0.32)',
      })
  }

  function settleMark() {
    const mark = markRef.current
    if (!mark) return

    gsap.to(mark, {
      y: 0,
      rotation: -5,
      scaleX: 1,
      scaleY: 1,
      duration: 0.3,
      ease: 'back.out(2.2)',
    })
  }

  return (
    <header
      className={`site-header ${visible ? 'is-visible' : 'is-hidden'}`}
      onPointerEnter={onReveal}
    >
      <button
        type="button"
        className="sysu-comic-mark"
        data-page={activePage}
        style={{ '--page-index': pageIndex }}
        aria-label="返回首页"
        onClick={onHome}
        onPointerEnter={bounceMark}
        onPointerLeave={settleMark}
      >
        <span className="sysu-century-mark" ref={markRef} aria-hidden="true">
          <img src="/branding/sysu-century-comic.png" alt="" />
        </span>
      </button>

      <div className="site-header-name" aria-hidden="true">
        <b>中山大学</b><small>SYSU</small>
      </div>

      <div className="site-header-channel" aria-hidden="true">
        <span>SYSU CAMPUS ARCHIVE</span>
        <i />
        <small>1924—2026</small>
      </div>

      <nav
        aria-label="章节导航"
        className={[
          activeNavIndex >= 0 ? 'has-active-chapter' : '',
          pillIsAppearing ? 'pill-is-appearing' : '',
        ].filter(Boolean).join(' ')}
        style={{ '--active-nav-index': Math.max(0, activeNavIndex) }}
      >
        <i className="site-header-active-pill" aria-hidden="true" />
        {chapters.map((chapter) => (
          <button
            type="button"
            key={chapter.id}
            className={activeChapter === chapter.id ? 'is-active' : ''}
            onClick={() => onNavigate(chapter)}
          >
            <small>{chapter.index}</small>{chapter.name}
          </button>
        ))}
      </nav>

      <div className="site-header-tools">
        {onDatabase && (
          <button type="button" aria-label="管理员数据库" onClick={onDatabase}>
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <ellipse cx="18" cy="9" rx="9" ry="4" />
              <path d="M9 9v8c0 2.2 4 4 9 4s9-1.8 9-4V9M9 17v8c0 2.2 4 4 9 4s9-1.8 9-4v-8" />
            </svg>
          </button>
        )}
        <button type="button" aria-label="分享页面" onClick={onShare}>
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="9" cy="18" r="4" />
            <circle cx="25" cy="9" r="4" />
            <circle cx="25" cy="27" r="4" />
            <path d="m12.5 16 9-5M12.5 20l9 5" />
          </svg>
        </button>
        <button type="button" className={user ? 'is-signed-in' : ''} aria-label={user ? `${user.username}的个人中心` : '登录或注册'} onClick={onAccount}>
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="10" r="5" />
            <path d="M9.5 29v-6.5c0-3.2 2.6-5.8 5.8-5.8h5.4c3.2 0 5.8 2.6 5.8 5.8V29z" />
          </svg>
        </button>
      </div>

      <button className="site-header-enter" type="button" onClick={onHome}>
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="15" />
          <path d="M12 23 20 15l8 8" />
        </svg>
        <span>TOP</span>
      </button>
    </header>
  )
}
