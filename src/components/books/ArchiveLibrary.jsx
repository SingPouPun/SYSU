import ArchiveBook from './ArchiveBook.jsx'
import { ARCHIVE_BOOKS } from '../../data/chapters.js'

export default function ArchiveLibrary({ selectedBook, onSelect }) {
  return (
    <section className="archive-library" id="archives">
      <div className="section-label"><span>00</span><div><small>SYSU ARCHIVE LIBRARY</small><h2>中大设定档案</h2></div></div>
      <p className="library-intro">四卷书籍的结构已经预留。第二天我们会亲手加入飞入、封面沿书脊旋转180°、纸页弯曲和风吹翻页。</p>
      <div className="book-shelf">
        {ARCHIVE_BOOKS.map((book) => (
          <ArchiveBook key={book.id} book={book} isSelected={selectedBook === book.id} onSelect={onSelect} />
        ))}
      </div>
    </section>
  )
}
