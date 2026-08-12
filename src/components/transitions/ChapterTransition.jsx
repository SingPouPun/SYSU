import SysuLionRunner from '../loading/SysuLionRunner.jsx'

export default function ChapterTransition({ chapter }) {
  if (!chapter) return null

  return (
    <div className="chapter-transition-scaffold" aria-live="polite">
      <div className="transition-grid">
        {chapter.glyphs.map((glyph, index) => <span key={`${glyph}-${index}`}>{glyph}</span>)}
      </div>
      <SysuLionRunner mode="chapter" label={chapter.name} />
      <p>{chapter.english} / LOADING ARCHIVE</p>
    </div>
  )
}
