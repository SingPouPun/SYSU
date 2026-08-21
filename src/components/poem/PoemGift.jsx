import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { readExperienceProgress, writeExperienceProgress } from '../../utils/experienceProgress.js'

export default function PoemGift({ visible, onClose }) {
  const [opened, setOpened] = useState(() => readExperienceProgress('sysu-poem-opened', false) === true)

  useEffect(() => {
    if (visible) setOpened(readExperienceProgress('sysu-poem-opened', false) === true)
  }, [visible])

  useEffect(() => {
    if (!visible) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [visible, onClose])

  if (!visible) return null

  return createPortal(
    <div className={`poem-gift${opened ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="poem-gift-title">
      <button className="poem-gift-backdrop" type="button" aria-label="关闭小诗礼包" onClick={onClose} />
      <section className="poem-gift-package">
        <button className="poem-gift-close" type="button" aria-label="关闭" onClick={onClose}>×</button>
        <button
          className="poem-gift-seal"
          type="button"
          aria-label="展开一首小诗"
          aria-expanded={opened}
          tabIndex={opened ? -1 : 0}
          onClick={() => {
            setOpened(true)
            writeExperienceProgress('sysu-poem-opened', true)
          }}
        >
          <strong id="poem-gift-title">
            <img src="/poem/poem-title-calligraphy.jpg" alt="小诗" />
          </strong>
          <span>轻触启封</span>
        </button>
        <article className="poem-gift-paper" aria-hidden={!opened}>
          <img
            className="poem-gift-body-calligraphy"
            src="/poem/poem-body-calligraphy.jpg"
            alt="一叶辞柯一岁秋，桂香入袖几回眸。欲把心事裁成句，只恐言轻负此秋。"
          />
        </article>
      </section>
    </div>,
    document.body,
  )
}
