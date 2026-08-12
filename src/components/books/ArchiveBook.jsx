export default function ArchiveBook({ book, isSelected, onSelect }) {
  return (
    <button
      type="button"
      className={`archive-book-scaffold ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelect(isSelected ? null : book.id)}
      aria-pressed={isSelected}
    >
      <span>{book.number}</span>
      <b>{book.title}</b>
      <small>{book.subtitle}</small>
      <i>DAY 2 · 3D BOOK TODO</i>
    </button>
  )
}
