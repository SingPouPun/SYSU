import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const SHAPES = [
  { id: 'campus', image: '/mascot/buildings/building-01.png', color: '#d9f7e8' },
  { id: 'association', image: '/branding/medical-engineering-association.png', color: '#d9c4ff' },
  { id: 'emblem', image: '/branding/sysu-emblem-shangao-shuichang.png', color: '#baf2d3' },
]
const shapeSourceCache = new Map()

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const easeInOut = (value) => value < 0.5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2

function mixColor(from, to, amount) {
  const read = (color) => color.match(/[\da-f]{2}/gi).map((value) => Number.parseInt(value, 16))
  const start = read(from)
  const end = read(to)
  const mixed = start.map((value, index) => Math.round(value + (end[index] - value) * amount))
  return `rgb(${mixed.join(' ')})`
}

function seededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = source
  })
}

function chooseEvenly(candidates, amount, random) {
  if (!candidates.length) return Array.from({ length: amount }, () => ({ x: random(), y: random() }))
  const stride = candidates.length / amount
  return Array.from({ length: amount }, (_, index) => candidates[Math.min(candidates.length - 1, Math.floor(index * stride))])
}

function createShapeMask(image, kind, amount, random) {
  const cacheKey = `${image.src}:${kind}`
  const cached = shapeSourceCache.get(cacheKey)
  if (cached) {
    return {
      points: chooseEvenly(cached.candidates, amount, random),
      stencil: cached.stencil,
    }
  }

  const width = kind === 'campus' ? 760 : kind === 'emblem' ? 1080 : 580
  const height = kind === 'campus' ? 340 : kind === 'emblem' ? 450 : 580
  const source = document.createElement('canvas')
  const sourceContext = source.getContext('2d', { willReadFrequently: true })
  source.width = width
  source.height = height
  const padding = kind === 'campus' ? 18 : 36
  const scale = Math.min((width - padding * 2) / image.width, (height - padding * 2) / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  sourceContext.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
  const pixels = sourceContext.getImageData(0, 0, width, height).data
  const candidates = []
  const stencil = document.createElement('canvas')
  const stencilContext = stencil.getContext('2d')
  stencil.width = width
  stencil.height = height
  const stencilPixels = stencilContext.createImageData(width, height)
  const tint = kind === 'association' ? [202, 178, 245] : [119, 225, 170]

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4
      const red = pixels[pixelIndex]
      const green = pixels[pixelIndex + 1]
      const blue = pixels[pixelIndex + 2]
      const alpha = pixels[pixelIndex + 3]
      const luminance = red * 0.299 + green * 0.587 + blue * 0.114
      const saturation = Math.max(red, green, blue) - Math.min(red, green, blue)
      const selected = kind === 'emblem'
        ? alpha > 45
        : kind === 'association'
          ? alpha > 45 && (luminance < 190 || saturation > 55)
          : alpha > 45 && luminance < 205
      if (!selected) continue
      candidates.push({ x: x / width, y: y / height })
      stencilPixels.data[pixelIndex] = tint[0]
      stencilPixels.data[pixelIndex + 1] = tint[1]
      stencilPixels.data[pixelIndex + 2] = tint[2]
      stencilPixels.data[pixelIndex + 3] = 255
    }
  }
  stencilContext.putImageData(stencilPixels, 0, 0)
  shapeSourceCache.set(cacheKey, { candidates, stencil })
  return { points: chooseEvenly(candidates, amount, random), stencil }
}

export function preloadMessageResonanceAssets() {
  return Promise.all(SHAPES.map((shape) => loadImage(shape.image))).then((images) => {
    images.forEach((image, index) => createShapeMask(image, SHAPES[index].id, 1, Math.random))
  })
}

function fitPoint(point, kind, width, height) {
  if (kind === 'campus') return { x: width * (0.07 + point.x * 0.86), y: height * (0.24 + point.y * 0.52) }
  if (kind === 'emblem') {
    const emblemSize = Math.min(width * 0.34, height * 0.72)
    if (point.x < 0.3) {
      return { x: width * (0.005 + (point.x / 0.3) * 0.33), y: height * (0.055 + point.y * 0.89) }
    }
    if (point.x > 0.7) {
      return { x: width * (0.665 + ((point.x - 0.7) / 0.3) * 0.33), y: height * (0.055 + point.y * 0.89) }
    }
    return {
      x: width / 2 - emblemSize / 2 + ((point.x - 0.3) / 0.4) * emblemSize,
      y: height / 2 - emblemSize / 2 + point.y * emblemSize,
    }
  }
  const size = Math.min(width, height) * 0.72
  return { x: width / 2 + (point.x - 0.5) * size, y: height / 2 + (point.y - 0.5) * size }
}

function drawCrossStar(context, x, y, size, alpha, rotation = 0, tick = 0, seed = 0) {
  const frame = Math.floor(tick / 78 + seed) % 8
  const horizontal = [0.56, 0.78, 1, 0.72, 0.48, 0.86, 0.64, 0.94][frame]
  const vertical = [1, 0.7, 0.88, 0.58, 0.96, 0.66, 0.82, 0.52][frame]
  const ringScale = [0.84, 1.05, 0.92, 1.12, 0.88, 1, 0.9, 1.08][frame]
  context.save()
  context.translate(x, y)
  context.rotate(rotation + (frame - 3.5) * 0.012)
  context.globalAlpha = alpha
  context.strokeStyle = '#fff'
  context.lineCap = 'round'
  context.lineWidth = Math.max(1, size * 0.055)
  context.shadowColor = '#fff'
  context.shadowBlur = size * (0.28 + (frame % 3) * 0.1)
  context.beginPath()
  context.moveTo(-size * horizontal, 0)
  context.lineTo(size * horizontal, 0)
  context.moveTo(0, -size * 1.28 * vertical)
  context.lineTo(0, size * 1.28 * vertical)
  context.stroke()
  context.lineWidth *= 0.48
  context.beginPath()
  context.ellipse(0, 0, size * 0.46 * ringScale, size * 0.46 / ringScale, 0, frame * 0.17, Math.PI * 1.82 + frame * 0.17)
  context.stroke()
  if (frame === 1 || frame === 5) {
    context.globalAlpha *= 0.44
    context.beginPath()
    context.arc(0, 0, size * 0.62, -0.35, 1.3)
    context.stroke()
  }
  context.restore()
}

function drawStencil(context, mask, kind, width, height, alpha, color) {
  if (alpha <= 0) return
  context.save()
  context.globalAlpha = alpha
  context.globalCompositeOperation = 'screen'
  context.imageSmoothingEnabled = true
  context.shadowColor = color
  context.shadowBlur = 46
  if (kind === 'campus') context.drawImage(mask, width * 0.07, height * 0.24, width * 0.86, height * 0.52)
  else if (kind === 'emblem') {
    const leftWidth = mask.width * 0.3
    const centerWidth = mask.width * 0.4
    const emblemSize = Math.min(width * 0.34, height * 0.72)
    context.drawImage(mask, 0, 0, leftWidth, mask.height, width * 0.005, height * 0.055, width * 0.33, height * 0.89)
    context.drawImage(mask, leftWidth, 0, centerWidth, mask.height, width / 2 - emblemSize / 2, height / 2 - emblemSize / 2, emblemSize, emblemSize)
    context.drawImage(mask, leftWidth + centerWidth, 0, leftWidth, mask.height, width * 0.665, height * 0.055, width * 0.33, height * 0.89)
  }
  else {
    const size = Math.min(width, height) * 0.72
    context.drawImage(mask, width / 2 - size / 2, height / 2 - size / 2, size, size)
  }
  context.restore()
}

export default function MessageResonance({ onClose, onComplete, replayKey = 0 }) {
  const canvasRef = useRef(null)
  const animationRef = useRef({ mode: 'flight', shapeIndex: -1, ready: false })
  const particlesRef = useRef([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d', { alpha: false, desynchronized: true })
    let frame = 0
    let cancelled = false
    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = 1
    let tunnelGradient = null
    const random = seededRandom(1924 + replayKey)
    // 轮廓清晰度由均匀取样和最后的 stencil 光保证；粒子数量按屏幕面积分档，
    // 避免高分辨率窗口同时承担过大的像素缓冲与逐点绘制开销。
    const amount = width < 720 ? 2500 : width * height > 2400000 ? 3600 : 4600
    const startedAt = performance.now()
    const state = animationRef.current
    state.mode = 'flight'
    state.shapeIndex = -1
    state.ready = false
    state.transitionAt = startedAt
    // The map lift already supplies the first movement. Start this star field
    // gently so the hand-off reads as one continuous ascent, not a speed cut.
    state.flightAt = startedAt

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(width * height > 2400000 ? 1.12 : 1.35, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      tunnelGradient = context.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.72,
      )
      tunnelGradient.addColorStop(0, 'rgb(0 0 0 / 0)')
      tunnelGradient.addColorStop(0.48, 'rgb(225 236 255 / 0.16)')
      tunnelGradient.addColorStop(1, 'rgb(189 211 255 / 0.72)')
      if (state.masks && particlesRef.current.length) {
        particlesRef.current.forEach((particle, index) => {
          SHAPES.forEach((shape) => {
            particle.targets[shape.id] = fitPoint(state.masks[shape.id].points[index], shape.id, width, height)
          })
        })
      }
    }
    resize()

    Promise.all(SHAPES.map((shape) => loadImage(shape.image))).then((images) => {
      if (cancelled) return
      const masks = Object.fromEntries(SHAPES.map((shape, index) => [shape.id, createShapeMask(images[index], shape.id, amount, random)]))
      const particles = Array.from({ length: amount }, (_, index) => ({
        angle: random() * Math.PI * 2,
        spread: 18 + random() * Math.max(width, height) * 0.7,
        depth: 0.1 + random() * 0.9,
        speed: 0.1 + random() * 0.23,
        size: 0.45 + random() * 1.12,
        delay: random() * 0.18,
        visibleAt: random() * 5.2,
        color: index % 11 === 0 ? '#d9bf72' : '#fff',
        scatterAngle: random() * Math.PI * 2,
        scatterPower: 70 + random() * 230,
        current: { x: width / 2, y: height / 2 },
        from: { x: width / 2, y: height / 2 },
        targets: Object.fromEntries(SHAPES.map((shape) => [shape.id, fitPoint(masks[shape.id].points[index], shape.id, width, height)])),
      }))
      particlesRef.current = particles
      state.masks = masks

      const drawFlight = (now, opacity = 1, flightStart = state.flightAt) => {
        const elapsed = Math.max(0, (now - flightStart) / 1000)
        const buildUp = clamp(elapsed / 9)
        const visibleShare = clamp(0.18 + elapsed * 0.085, 0.18, 1)
        const speedMultiplier = 0.58 + buildUp * 2.8
        context.globalCompositeOperation = 'lighter'
        particles.forEach((particle, index) => {
          if (index / particles.length > visibleShare || elapsed < particle.visibleAt) return
          particle.depth -= particle.speed * speedMultiplier * 0.016
          if (particle.depth < 0.042) particle.depth = 1
          const radius = particle.spread / Math.max(0.05, particle.depth)
          const x = width / 2 + Math.cos(particle.angle) * radius
          const y = height / 2 + Math.sin(particle.angle) * radius * 0.63
          const tail = radius * (0.965 - buildUp * 0.035)
          const previousX = width / 2 + Math.cos(particle.angle) * tail
          const previousY = height / 2 + Math.sin(particle.angle) * tail * 0.63
          particle.current.x = x
          particle.current.y = y
          const flicker = 0.42 + Math.sin(elapsed * (2.4 + particle.speed * 9) + index) * 0.3
          context.globalAlpha = clamp(flicker + buildUp * 0.26) * opacity
          context.strokeStyle = particle.color
          context.lineWidth = particle.size * (0.65 + (1 - particle.depth) * 1.3)
          context.beginPath()
          context.moveTo(previousX, previousY)
          context.lineTo(x, y)
          context.stroke()
          if (index % 127 === 0 && Math.floor(elapsed * 7 + index) % 4 < 3) {
            drawCrossStar(
              context,
              x,
              y,
              8 + (1 - particle.depth) * 15,
              0.5 + buildUp * 0.45,
              particle.angle * 0.12,
              now,
              index,
            )
          }
        })
      }

      const draw = (now) => {
        if (cancelled) return
        context.clearRect(0, 0, width, height)
        context.fillStyle = '#000'
        context.fillRect(0, 0, width, height)

        if (state.mode === 'flight') {
          drawFlight(now)
          if (!state.ready && now - state.transitionAt >= 1200) {
            state.ready = true
            setReady(true)
          }
        } else if (state.mode === 'warp') {
          const progress = clamp((now - state.transitionAt) / 1900)
          const eased = easeInOut(progress)
          const acceleration = 1 + eased ** 1.25 * 29
          context.globalCompositeOperation = 'lighter'
          context.shadowBlur = 0
          particles.forEach((particle) => {
            const dx = particle.from.x - width / 2
            const dy = particle.from.y - height / 2
            const x = width / 2 + dx * acceleration
            const y = height / 2 + dy * acceleration
            particle.current.x = x
            particle.current.y = y
            context.globalAlpha = 0.72 + eased * 0.28
            context.strokeStyle = particle.color
            context.shadowColor = particle.color
            context.lineWidth = particle.size * (0.75 + eased * 3.1)
            context.beginPath()
            context.moveTo(width / 2 + dx * Math.max(1, acceleration - 7 - eased * 3), height / 2 + dy * Math.max(1, acceleration - 7 - eased * 3))
            context.lineTo(x, y)
            context.stroke()
          })
          context.shadowBlur = 0
          context.globalCompositeOperation = 'screen'
          context.globalAlpha = eased * 0.23
          context.fillStyle = tunnelGradient
          context.fillRect(0, 0, width, height)
          if (progress >= 1) {
            particles.forEach((particle, index) => {
              const radius = Math.max(width, height) * (0.18 + particle.depth * 0.95)
              const angle = particle.scatterAngle + index * 0.0007
              particle.current.x = width / 2 + Math.cos(angle) * radius
              particle.current.y = height / 2 + Math.sin(angle) * radius * 0.72
              particle.from.x = particle.current.x
              particle.from.y = particle.current.y
            })
            state.mode = 'morph'
            state.shapeIndex = 0
            state.transitionAt = now
          }
        } else if (state.mode === 'remorph') {
          const progress = clamp((now - state.transitionAt) / 3600)
          const smooth = easeInOut(progress)
          const nextShape = SHAPES[state.nextShapeIndex]
          const currentShape = SHAPES[state.shapeIndex]
          const transitionColor = mixColor(currentShape.color, nextShape.color, smooth)
          context.globalCompositeOperation = 'lighter'
          particles.forEach((particle, index) => {
            const target = particle.targets[nextShape.id]
            const startAngle = Math.atan2(particle.from.y - height / 2, particle.from.x - width / 2)
            const outward = 72 + particle.scatterPower * 0.52
            const controlX = width / 2 + Math.cos(startAngle + (index % 2 ? 0.38 : -0.38)) * outward
            const controlY = height / 2 + Math.sin(startAngle + (index % 2 ? 0.38 : -0.38)) * outward
            const inverse = 1 - smooth
            const x = inverse ** 2 * particle.from.x + 2 * inverse * smooth * controlX + smooth ** 2 * target.x
            const y = inverse ** 2 * particle.from.y + 2 * inverse * smooth * controlY + smooth ** 2 * target.y
            particle.current.x = x
            particle.current.y = y
            const midFade = 1 - Math.sin(progress * Math.PI) * 0.28
            context.globalAlpha = (0.68 + Math.sin(now * 0.0036 + index * 0.27) * 0.3) * midFade
            context.fillStyle = index % 9 ? transitionColor : '#fff'
            context.beginPath()
            context.arc(x, y, particle.size * (0.86 + Math.sin(progress * Math.PI) * 0.58), 0, Math.PI * 2)
            context.fill()
          })
          if (progress >= 1) {
            particles.forEach((particle) => {
              particle.from.x = particle.current.x
              particle.from.y = particle.current.y
            })
            state.shapeIndex = state.nextShapeIndex
            state.mode = 'shape'
            state.ready = true
            state.arrivedAt = now
            setReady(true)
          }
        } else {
          const shape = SHAPES[state.shapeIndex]
          const mask = state.masks[shape.id]
          const morphing = state.mode === 'morph'
          const morphDuration = shape.id === 'campus' ? 5400 : 3800
          const baseProgress = morphing ? clamp((now - state.transitionAt) / morphDuration) : 1
          let allSettled = true
          context.globalCompositeOperation = 'lighter'
          context.shadowColor = shape.color
          context.shadowBlur = 0
          particles.forEach((particle, index) => {
            const localProgress = clamp((baseProgress - particle.delay) / (1 - particle.delay))
            const progress = easeInOut(localProgress)
            const target = particle.targets[shape.id]
            let x = particle.from.x + (target.x - particle.from.x) * progress
            let y = particle.from.y + (target.y - particle.from.y) * progress
            particle.current.x = x
            particle.current.y = y
            if (localProgress < 1) allSettled = false
            const pulse = 0.72 + Math.sin(now * 0.0034 + index * 0.31) * 0.28
            context.globalAlpha = pulse * (morphing ? clamp(baseProgress * 1.2) : 0.98)
            context.fillStyle = index % 9 ? shape.color : '#fff'
            context.beginPath()
            context.arc(x, y, particle.size * (0.74 + pulse * 0.34), 0, Math.PI * 2)
            context.fill()
          })
          context.shadowBlur = 0
          if (morphing && allSettled) {
            state.mode = 'shape'
            state.ready = true
            state.arrivedAt = now
            setReady(true)
          }
          if (!morphing) {
            const glowArrival = easeInOut(clamp((now - state.arrivedAt) / 1400))
            const glowPulse = (0.2 + (Math.sin(now * 0.0028) + 1) * 0.055) * glowArrival
            drawStencil(context, mask.stencil, shape.id, width, height, glowPulse, shape.color)
          }
        }
        context.globalAlpha = 1
        context.globalCompositeOperation = 'source-over'
        context.shadowBlur = 0
        frame = requestAnimationFrame(draw)
      }
      frame = requestAnimationFrame(draw)
    })

    window.addEventListener('resize', resize)
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [replayKey])

  function advance(event) {
    if (event.target.closest('button') || !ready) return
    const state = animationRef.current
    setReady(false)
    state.ready = false
    particlesRef.current.forEach((particle) => {
      particle.from.x = particle.current.x
      particle.from.y = particle.current.y
    })
    if (state.mode === 'flight') {
      state.mode = 'warp'
      state.transitionAt = performance.now()
      return
    }
    if (state.mode !== 'shape' || state.shapeIndex >= SHAPES.length - 1) return
    state.nextShapeIndex = state.shapeIndex + 1
    state.mode = 'remorph'
    state.transitionAt = performance.now()
    if (state.nextShapeIndex === SHAPES.length - 1) onComplete?.()
  }

  return createPortal(
    <section
      className="message-resonance-fullscreen"
      onClick={advance}
      aria-label="寄语星光汇聚"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <button className="message-resonance-close" type="button" onClick={onClose} aria-label="退出汇聚动画">×</button>
    </section>,
    document.body,
  )
}
