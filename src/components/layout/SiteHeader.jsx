export default function SiteHeader({ chapters, activeChapter, onNavigate }) {
  return (
    <header className="site-header">
      <a className="sysu-wordmark" href="#top" aria-label="返回首页">
        <b>中山大学</b><span>SYSU</span>
      </a>
      <nav aria-label="章节导航">
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
    </header>
  )
}
