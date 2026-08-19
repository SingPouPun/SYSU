import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import ProgressRail from '../components/layout/ProgressRail.jsx'
import OpeningSequence from '../components/loading/OpeningSequence.jsx'
import ChapterTransition from '../components/transitions/ChapterTransition.jsx'
import CdChapterTransition from '../components/transitions/CdChapterTransition.jsx'
import ArchiveLibrary from '../components/books/ArchiveLibrary.jsx'
import HeroSection from '../sections/HeroSection.jsx'
import HistorySection from '../sections/HistorySection.jsx'
import CultureSection from '../sections/CultureSection.jsx'
import DisciplinesSection from '../sections/DisciplinesSection.jsx'
import CampusesSection from '../sections/CampusesSection.jsx'
import MessagesSection from '../sections/MessagesSection.jsx'
import PoemGift from '../components/poem/PoemGift.jsx'
import AuthModal from '../components/auth/AuthModal.jsx'
import ShareModal from '../components/share/ShareModal.jsx'
import AdminPortal from '../components/database/AdminPortal.jsx'
import { CHAPTERS } from '../data/chapters.js'

const PAGE_SECTIONS = [
  { id: 'top', name: '首页', kind: 'direct' },
  { id: 'archives', name: '档案', kind: 'direct' },
  ...CHAPTERS.map((chapter) => ({ ...chapter, kind: 'chapter' })),
]

const ARCHIVE_RETURN_TRANSITION = {
  id: 'archives',
  name: '中大档案',
  glyphs: ['返', '回', '档', '案'],
}

function MainExperience() {
  const [openingVisible, setOpeningVisible] = useState(true)
  const [activeChapter, setActiveChapter] = useState('home')
  const [activePage, setActivePage] = useState('top')
  const [transition, setTransition] = useState(null)
  const [cdTransition, setCdTransition] = useState(null)
  const [poemVisible, setPoemVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [authVisible, setAuthVisible] = useState(false)
  const [shareVisible, setShareVisible] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState(null)
  const seenChaptersRef = useRef(new Set())
  const authPromptedRef = useRef(false)
  const navigationLockRef = useRef({ pageId: null, until: 0 })
  const lastScrollYRef = useRef(0)
  const headerHoldUntilRef = useRef(0)

  function lockPageNavigation(pageId, duration = 1000) {
    navigationLockRef.current = {
      pageId,
      until: performance.now() + duration,
    }
  }

  function showHeaderTemporarily(duration = 900) {
    headerHoldUntilRef.current = performance.now() + duration
    setHeaderVisible(true)
  }

  function resetViewport(behavior = 'auto') {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior }))
  }

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sysu-seen-chapters') ?? '[]')
      seenChaptersRef.current = new Set(Array.isArray(stored) ? stored : [])
    } catch {
      seenChaptersRef.current = new Set()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me')
      .then((response) => response.ok ? response.json() : { user: null })
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAuthReady(true)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (openingVisible || !authReady || user || authPromptedRef.current) return
    authPromptedRef.current = true
    setAuthVisible(true)
  }, [openingVisible, authReady, user])

  useEffect(() => {
    const revealPoemGift = () => setPoemVisible(true)
    window.addEventListener('sysu:poem-gift-ready', revealPoemGift)
    return () => window.removeEventListener('sysu:poem-gift-ready', revealPoemGift)
  }, [])

  // 所有按钮共用一次完整的点击反馈，不再依赖鼠标按住的时间长短。
  useEffect(() => {
    function playButtonFeedback(event) {
      const button = event.target.closest('button')
      if (!button || button.disabled) return
      if (button.dataset.buttonFeedback === 'custom') return

      const isCompactNavigation = button.closest('.site-header, .progress-rail')
      const pressedScale = isCompactNavigation ? 0.9 : 0.6

      gsap.killTweensOf(button, 'scale')
      gsap
        .timeline()
        .to(button, {
          scale: pressedScale,
          duration: isCompactNavigation ? 0.035 : 0.05,
          ease: 'power4.out',
        })
        .to(button, {
          scale: isCompactNavigation ? 1.015 : 1.04,
          duration: isCompactNavigation ? 0.055 : 0.065,
          ease: 'back.out(2.8)',
        })
        .to(button, {
          scale: 1,
          duration: 0.04,
          ease: 'power2.out',
        })
    }

    document.addEventListener('click', playButtonFeedback, true)
    return () => document.removeEventListener('click', playButtonFeedback, true)
  }, [])

  useEffect(() => {
    let frame = 0

    function updateActivePage() {
      frame = 0
      const navigationLock = navigationLockRef.current
      if (navigationLock.pageId && performance.now() < navigationLock.until) return

      if (navigationLock.pageId) {
        navigationLockRef.current = { pageId: null, until: 0 }
      }

      const focusLine = window.innerHeight * 0.43
      const visiblePage = PAGE_SECTIONS
        .map((page) => ({
          page,
          distance: Math.abs(document.getElementById(page.id)?.getBoundingClientRect().top - focusLine),
        }))
        .filter(({ distance }) => Number.isFinite(distance))
        .sort((a, b) => a.distance - b.distance)[0]?.page

      if (!visiblePage) return
      setActivePage(visiblePage.id)
      if (visiblePage.kind === 'chapter') {
        setActiveChapter(visiblePage.id)
        if (!seenChaptersRef.current.has(visiblePage.id)) rememberChapter(visiblePage.id)
      }
      if (visiblePage.id === 'top') setActiveChapter('home')
    }

    function handleScroll() {
      if (frame) return
      frame = window.requestAnimationFrame(updateActivePage)
    }

    updateActivePage()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    let frame = 0

    function updateHeaderVisibility() {
      frame = 0
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollYRef.current
      const archiveTop = document.getElementById('archives')?.offsetTop ?? window.innerHeight
      const isInsideFirstPage = currentScrollY < archiveTop - 2

      if (isInsideFirstPage || performance.now() < headerHoldUntilRef.current) {
        setHeaderVisible(true)
      } else if (scrollDelta > 8) {
        setHeaderVisible(false)
      } else if (scrollDelta < -8) {
        setHeaderVisible(true)
      }

      lastScrollYRef.current = currentScrollY
    }

    function handleHeaderScroll() {
      if (frame) return
      frame = window.requestAnimationFrame(updateHeaderVisibility)
    }

    lastScrollYRef.current = window.scrollY
    window.addEventListener('scroll', handleHeaderScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleHeaderScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  function rememberChapter(chapterId) {
    seenChaptersRef.current.add(chapterId)
    try {
      localStorage.setItem('sysu-seen-chapters', JSON.stringify([...seenChaptersRef.current]))
    } catch {
      // 无痕或受限环境中仍保留本次会话内的观看记录。
    }
  }

  function navigateTo(chapter) {
    if (transition || cdTransition) return

    if (seenChaptersRef.current.has(chapter.id)) {
      lockPageNavigation(chapter.id, 2400)
      setActiveChapter(chapter.id)
      setActivePage(chapter.id)
      showHeaderTemporarily()
      resetViewport()
      return
    }

    rememberChapter(chapter.id)
    setTransition(chapter)
  }

  function openChapterFromBook(chapter) {
    if (transition || cdTransition) return
    rememberChapter(chapter.id)
    setCdTransition(chapter)
  }

  function navigatePage(page) {
    if (page.kind === 'chapter') {
      rememberChapter(page.id)
      lockPageNavigation(page.id, 450)
      setActiveChapter(page.id)
      setActivePage(page.id)
      showHeaderTemporarily()
      resetViewport()
      return
    }

    lockPageNavigation(page.id, 450)
    setActivePage(page.id)
    showHeaderTemporarily()
    if (page.id === 'top') setActiveChapter('home')
    if (page.id === 'archives') setActiveChapter('home')
    resetViewport()
  }

  const revealTransitionTarget = useCallback(() => {
    if (!transition) return
    lockPageNavigation(transition.id, 500)
    setActiveChapter(transition.id === 'archives' ? 'home' : transition.id)
    setActivePage(transition.id)
    showHeaderTemporarily()
    resetViewport()
  }, [transition])

  const completeTransition = useCallback(() => {
    setTransition(null)
  }, [])

  const revealCdTransitionTarget = useCallback(() => {
    if (!cdTransition) return
    lockPageNavigation(cdTransition.id, 500)
    setActiveChapter(cdTransition.id)
    setActivePage(cdTransition.id)
    showHeaderTemporarily()
    resetViewport()
  }, [cdTransition])

  const completeCdTransition = useCallback(() => {
    const completedChapterId = cdTransition?.id
    setCdTransition(null)
    if (!completedChapterId) return

    window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('sysu:cd-chapter-entered', {
        detail: { id: completedChapterId },
      }))
    })
  }, [cdTransition])

  const revealHome = useCallback(() => {
    lockPageNavigation('top', 2400)
    setActiveChapter('home')
    setActivePage('top')
    showHeaderTemporarily()
    resetViewport()
  }, [])

  const revealArchiveLibrary = useCallback(() => {
    lockPageNavigation('archives', 2400)
    setActiveChapter('home')
    setActivePage('archives')
    showHeaderTemporarily()
    resetViewport()
  }, [])

  const returnToArchiveLibrary = useCallback(() => {
    if (transition || cdTransition) return
    setTransition(ARCHIVE_RETURN_TRANSITION)
  }, [transition, cdTransition])

  const activeContentChapter = CHAPTERS.find((chapter) => chapter.id === activePage)

  function renderActiveContent() {
    if (activePage === 'history') return <HistorySection />
    if (activePage === 'culture') return <CultureSection />
    if (activePage === 'disciplines') return <DisciplinesSection />
    if (activePage === 'campuses') return <CampusesSection />
    if (activePage === 'messages') return (
      <MessagesSection
        active
        user={user}
        onRequestLogin={() => setAuthVisible(true)}
        onMessageSubmitted={() => setUser((current) => (
          current ? { ...current, has_message: true } : current
        ))}
      />
    )
    return null
  }

  return (
    <div className="app-shell">
      <OpeningSequence
        visible={openingVisible}
        onCovered={revealHome}
        onFinish={() => setOpeningVisible(false)}
      />
      <ChapterTransition
        chapter={transition}
        onCovered={revealTransitionTarget}
        onComplete={completeTransition}
      />
      <CdChapterTransition
        chapter={cdTransition}
        onCovered={revealCdTransitionTarget}
        onComplete={completeCdTransition}
      />

      <SiteHeader
        chapters={CHAPTERS}
        activeChapter={activeChapter}
        activePage={activePage}
        visible={headerVisible}
        onReveal={() => setHeaderVisible(true)}
        onHome={revealHome}
        onNavigate={navigateTo}
        onShare={() => setShareVisible(true)}
        onDatabase={user?.is_admin ? () => window.open('/admin', 'sysu-admin-console') : undefined}
        onAccount={() => setAuthVisible(true)}
        user={user}
      />
      <div
        className="site-header-reveal-zone"
        aria-hidden="true"
        onPointerEnter={() => setHeaderVisible(true)}
      />
      <ProgressRail pages={PAGE_SECTIONS} activePage={activePage} onNavigate={navigatePage} />

      <main>
        {activePage === 'top' && <HeroSection onStart={revealArchiveLibrary} />}
        {activePage === 'archives' && <ArchiveLibrary onOpenChapter={openChapterFromBook} />}
        {activeContentChapter && (
          <div
            className="chapter-flow-shell chapter-flow-shell--single"
            style={{ '--chapter-accent': activeContentChapter.accent }}
          >
            <button
              className="chapter-return-archive"
              type="button"
              onClick={returnToArchiveLibrary}
              aria-label="返回CD档案页面"
            >
              <span aria-hidden="true">↙</span>
              <small>RETURN TO</small>
              <b>CD 档案</b>
            </button>
            {renderActiveContent()}
          </div>
        )}
      </main>

      {activePage === 'messages' && <footer className="workshop-footer">
        <strong>中山大学 SYSU</strong>
        <span>FOUR-DAY INTERACTIVE WEB WORKSHOP</span>
        <button type="button" onClick={() => setPoemVisible(true)}>再次品读 · 小词礼包</button>
      </footer>}

      <PoemGift visible={poemVisible} onClose={() => setPoemVisible(false)} />
      <AuthModal
        visible={authVisible}
        user={user}
        onAuthenticated={(nextUser) => {
          setUser(nextUser)
          setAuthVisible(false)
        }}
        onLogout={() => setUser(null)}
        onClose={() => setAuthVisible(false)}
        openAdminOnSuccess
      />
      <ShareModal visible={shareVisible} onClose={() => setShareVisible(false)} />
    </div>
  )
}

export default function App() {
  return window.location.pathname === '/admin' ? <AdminPortal /> : <MainExperience />
}
