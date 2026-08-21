import { useEffect, useState } from 'react'

const SHARE_IMAGES = Array.from({ length: 5 }, (_, index) => `/share/campus-0${index + 1}.png`)

const SHARE_IMAGE_FOCUS = {
  '/share/campus-03.png': '52% 92%',
}

function randomImage(previous = '') {
  const candidates = SHARE_IMAGES.filter((image) => image !== previous)
  return candidates[Math.floor(Math.random() * candidates.length)]
}

async function loadRaster(source) {
  const image = new Image()
  image.src = source
  await image.decode()
  return image
}

async function createPostcardFile(source) {
  const [image, emblem] = await Promise.all([
    loadRaster(source),
    loadRaster('/branding/sysu-emblem.png'),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)

  const fontSize = Math.max(54, Math.round(canvas.width * 0.12))
  const paddingX = Math.round(fontSize * 0.28)
  const paddingY = Math.round(fontSize * 0.18)
  context.save()
  context.translate(fontSize * 0.42, fontSize * 1.28)
  context.rotate(-12 * Math.PI / 180)
  context.font = `900 ${fontSize}px Arial Black, Arial, sans-serif`
  context.textBaseline = 'alphabetic'
  const textWidth = context.measureText('SYSU').width
  context.fillStyle = 'rgba(255, 255, 255, 0.82)'
  context.beginPath()
  context.roundRect(
    -paddingX,
    -fontSize - paddingY,
    textWidth + paddingX * 2,
    fontSize + paddingY * 2,
    fontSize * 0.18,
  )
  context.fill()
  context.fillStyle = '#006633'
  context.fillText('SYSU', 0, 0)
  context.restore()

  const badgeWidth = Math.round(canvas.width * 0.36)
  const badgeHeight = Math.round(canvas.width * 0.105)
  const badgeMargin = Math.round(canvas.width * 0.026)
  const badgeX = canvas.width - badgeWidth - badgeMargin
  const badgeY = canvas.height - badgeHeight - badgeMargin
  const badgePadding = Math.round(badgeHeight * 0.16)
  const emblemSize = badgeHeight - badgePadding * 2
  context.fillStyle = 'rgba(255, 255, 255, 0.86)'
  context.beginPath()
  context.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight * 0.22)
  context.fill()
  context.drawImage(emblem, badgeX + badgePadding, badgeY + badgePadding, emblemSize, emblemSize)
  const labelX = badgeX + badgePadding * 2 + emblemSize
  context.fillStyle = '#111211'
  context.font = `900 ${Math.round(badgeHeight * 0.3)}px sans-serif`
  context.fillText('中山大学', labelX, badgeY + badgeHeight * 0.46)
  context.font = `800 ${Math.round(badgeHeight * 0.105)}px Arial, sans-serif`
  context.fillText('SUN YAT-SEN UNIVERSITY · 1924', labelX, badgeY + badgeHeight * 0.7)

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('明信片生成失败')), 'image/png')
  })
  return new File([blob], 'SYSU-postcard.png', { type: 'image/png' })
}

function downloadPostcard(file) {
  const downloadUrl = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = file.name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
}

export default function ShareModal({ visible, onClose }) {
  const [image, setImage] = useState(SHARE_IMAGES[0])
  const [copying, setCopying] = useState(false)
  const [copyResult, setCopyResult] = useState('')

  useEffect(() => {
    if (!visible) return
    setImage((current) => randomImage(current))
    setCopyResult('')
  }, [visible])

  if (!visible) return null

  function changeFrame() {
    setImage((current) => randomImage(current))
    setCopyResult('')
  }

  async function copyPostcard() {
    setCopying(true)
    const filePromise = createPostcardFile(image)
    try {
      if (navigator.clipboard?.write && window.ClipboardItem) {
        const clipboardItem = new window.ClipboardItem({ 'image/png': filePromise.then((file) => file) })
        await navigator.clipboard.write([clipboardItem])
        setCopyResult('copied')
      } else {
        downloadPostcard(await filePromise)
        setCopyResult('downloaded')
      }
    } catch (error) {
      try {
        downloadPostcard(await filePromise)
        setCopyResult('downloaded')
      } catch (fallbackError) {
        console.error(fallbackError)
      }
    } finally {
      setCopying(false)
    }
  }

  return (
    <div className="share-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="share-modal" role="dialog" aria-modal="true" aria-label="分享中山大学页面">
        <button className="share-modal-close" type="button" onClick={onClose} aria-label="关闭">×</button>
        <figure className="share-postcard">
          <img
            key={image}
            src={image}
            alt="随机展示的中山大学校园水彩插画"
            style={{ objectPosition: SHARE_IMAGE_FOCUS[image] ?? '50% 50%' }}
          />
          <span className="share-postcard-stamp" aria-hidden="true">SYSU</span>
          <figcaption>
            <img src="/branding/sysu-emblem.png" alt="" />
            <span>中山大学</span>
            <b>SUN YAT-SEN UNIVERSITY · 1924</b>
          </figcaption>
        </figure>
        <footer>
          <button type="button" onClick={changeFrame}>CHANGE FRAME</button>
          <button type="button" className="is-primary" onClick={copyPostcard} disabled={copying}>
            {copying ? 'COPYING…' : copyResult === 'copied' ? 'COPIED ✓' : copyResult === 'downloaded' ? 'DOWNLOADED ✓' : 'COPY POSTCARD'}
          </button>
        </footer>
      </section>
    </div>
  )
}
