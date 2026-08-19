import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const LINES = [
  '檀木葳蕤，晶莹悄上枝头，恰似故人游。',
  '叶纵飘零，清川悠然自流，又逢一金秋。',
  '尺素未寄，万般心曲萦喉，欲书却还休。',
  '砚池尚温，斜倚玉栏西楼，清辉托雁首。',
]

export default function PoemGift({ visible, onClose }) {
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    if (visible) setOpened(false)
  }, [visible])

  if (!visible) return null

  return createPortal(
    <div className={`poem-gift${opened ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="中大小词礼包">
      <button className="poem-gift-backdrop" type="button" aria-label="关闭小词礼包" onClick={onClose} />
      <section className="poem-gift-package">
        <button className="poem-gift-close" type="button" aria-label="关闭" onClick={onClose}>×</button>
        {!opened ? (
          <button className="poem-gift-seal" type="button" onClick={() => setOpened(true)}>
            <small>SYSU · MESSAGE GIFT</small>
            <strong>一阕小词</strong>
            <span>启封</span>
          </button>
        ) : (
          <article className="poem-gift-paper">
            <header><b>中山大学 SYSU</b></header>
            <div>{LINES.map((line) => <p key={line}>{line}</p>)}</div>
            <footer><span>山高水长</span><i>中大</i></footer>
          </article>
        )}
      </section>
    </div>,
    document.body,
  )
}
