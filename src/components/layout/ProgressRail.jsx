export default function ProgressRail({ pages, activePage, onNavigate }) {
  const activeIndex = Math.max(
    0,
    pages.findIndex((page) => page.id === activePage),
  )

  function movePage(step) {
    const nextIndex = (activeIndex + step + pages.length) % pages.length
    onNavigate(pages[nextIndex])
  }

  return (
    <aside className="progress-rail" aria-label="大章节导航进度">
      <button type="button" aria-label="进入上一页面" onClick={() => movePage(-1)}>
        <i className="progress-rail-chevron progress-rail-chevron--up" />
      </button>

      <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>

      <div className="progress-rail-dots" aria-label="页面位置">
        {pages.map((page, index) => (
          <button
            type="button"
            key={page.id}
            className={index === activeIndex ? 'is-active' : ''}
            aria-label={`进入${page.name}`}
            onClick={() => onNavigate(page)}
          />
        ))}
      </div>

      <button type="button" aria-label="进入下一页面" onClick={() => movePage(1)}>
        <i className="progress-rail-chevron progress-rail-chevron--down" />
      </button>

      <span>{String(pages.length).padStart(2, '0')}</span>
    </aside>
  )
}
