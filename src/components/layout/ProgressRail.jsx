export default function ProgressRail({ chapters, activeChapter }) {
  return (
    <aside className="progress-rail" aria-label="探索进度">
      <span>SYSU</span>
      {chapters.map((chapter) => <i key={chapter.id} className={chapter.id === activeChapter ? 'is-active' : ''} />)}
      <span>1924</span>
    </aside>
  )
}
