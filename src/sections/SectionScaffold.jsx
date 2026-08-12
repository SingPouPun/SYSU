export default function SectionScaffold({ id, index, english, title, day, children }) {
  return (
    <section className="chapter-scaffold" id={id}>
      <header>
        <span>{index}</span>
        <div><small>{english} / SYSU</small><h2>{title}</h2></div>
        <i />
      </header>
      <div className="chapter-placeholder">
        <b>DAY {day}</b>
        {children}
      </div>
    </section>
  )
}
