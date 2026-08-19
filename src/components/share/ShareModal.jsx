import { useEffect, useState } from 'react'

const SHARE_IMAGES = Array.from({ length: 5 }, (_, index) => `/share/campus-0${index + 1}.png`)

const SHARE_IMAGE_FOCUS = {
  '/share/campus-03.png': '52% 92%',
}

function randomImage(previous = '') {
  const candidates = SHARE_IMAGES.filter((image) => image !== previous)
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export default function ShareModal({ visible, onClose }) {
  const [image, setImage] = useState(SHARE_IMAGES[0])
  const [notice, setNotice] = useState('SHARE A PIECE OF SYSU')

  useEffect(() => {
    if (!visible) return
    setImage((current) => randomImage(current))
    setNotice('SHARE A PIECE OF SYSU')
  }, [visible])

  if (!visible) return null

  async function share() {
    const shareData = {
      title: '中山大学 SYSU',
      text: '一起探索中山大学的历史、文化、学科与校园。',
      url: window.location.href,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setNotice('SHARED · 已唤起系统分享')
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setNotice('LINK COPIED · 链接已复制')
      }
    } catch (error) {
      if (error.name !== 'AbortError') setNotice('COPY THE LINK AND SHARE')
    }
  }

  return (
    <div className="share-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="share-modal" role="dialog" aria-modal="true" aria-label="分享中山大学页面">
        <button className="share-modal-close" type="button" onClick={onClose} aria-label="关闭">×</button>
        <header>
          <small>SYSU VISUAL POSTCARD / RANDOM 01—05</small>
          <h2>SHARE<br />SYSU</h2>
        </header>
        <figure className="share-postcard">
          <img
            key={image}
            src={image}
            alt="随机展示的中山大学校园水彩插画"
            style={{ objectPosition: SHARE_IMAGE_FOCUS[image] ?? '50% 50%' }}
          />
          <figcaption>
            <img src="/branding/sysu-emblem.png" alt="" />
            <span>中山大学</span>
            <b>SUN YAT-SEN UNIVERSITY · 1924</b>
          </figcaption>
        </figure>
        <footer>
          <p>{notice}</p>
          <button type="button" onClick={() => setImage((current) => randomImage(current))}>CHANGE FRAME</button>
          <button type="button" className="is-primary" onClick={share}>SHARE NOW</button>
        </footer>
      </section>
    </div>
  )
}
