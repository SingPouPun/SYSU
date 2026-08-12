import { useState } from 'react'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import ProgressRail from '../components/layout/ProgressRail.jsx'
import OpeningSequence from '../components/loading/OpeningSequence.jsx'
import ChapterTransition from '../components/transitions/ChapterTransition.jsx'
import ArchiveLibrary from '../components/books/ArchiveLibrary.jsx'
import HeroSection from '../sections/HeroSection.jsx'
import HistorySection from '../sections/HistorySection.jsx'
import CultureSection from '../sections/CultureSection.jsx'
import DisciplinesSection from '../sections/DisciplinesSection.jsx'
import CampusesSection from '../sections/CampusesSection.jsx'
import MessagesSection from '../sections/MessagesSection.jsx'
import PoemGift from '../components/poem/PoemGift.jsx'
import { CHAPTERS } from '../data/chapters.js'

export default function App() {
  const [openingVisible, setOpeningVisible] = useState(true)
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id)
  const [transition, setTransition] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const [poemVisible, setPoemVisible] = useState(false)

  function navigateTo(chapter) {
    // DAY 1：这里会接入可取消的 GSAP 四格章节转场时间轴。
    setTransition(chapter)
    setActiveChapter(chapter.id)
    window.setTimeout(() => {
      document.getElementById(chapter.id)?.scrollIntoView({ behavior: 'smooth' })
      setTransition(null)
    }, 450)
  }

  return (
    <div className="app-shell">
      <OpeningSequence visible={openingVisible} onFinish={() => setOpeningVisible(false)} />
      <ChapterTransition chapter={transition} />

      <SiteHeader chapters={CHAPTERS} activeChapter={activeChapter} onNavigate={navigateTo} />
      <ProgressRail chapters={CHAPTERS} activeChapter={activeChapter} />

      <main>
        <HeroSection onStart={() => navigateTo(CHAPTERS[0])} />
        <ArchiveLibrary selectedBook={selectedBook} onSelect={setSelectedBook} />
        <HistorySection />
        <CultureSection />
        <DisciplinesSection />
        <CampusesSection />
        <MessagesSection />
      </main>

      <footer className="workshop-footer">
        <strong>中山大学 SYSU</strong>
        <span>FOUR-DAY INTERACTIVE WEB WORKSHOP</span>
        <button type="button" onClick={() => setPoemVisible(true)}>诗卷组件预留位置</button>
      </footer>

      <PoemGift visible={poemVisible} onClose={() => setPoemVisible(false)} />
    </div>
  )
}
