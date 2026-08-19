import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const smoothstep = (value) => {
  const progress = clamp(value)
  return progress * progress * (3 - 2 * progress)
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

function drawLiftStar(context, x, y, radius, alpha, phase) {
  const flickerFrame = Math.floor(phase * 9) % 6
  const horizontal = [0.65, 0.92, 0.74, 1, 0.62, 0.86][flickerFrame]
  const vertical = [1, 0.7, 0.9, 0.62, 0.82, 0.68][flickerFrame]

  context.save()
  context.translate(x, y)
  context.globalCompositeOperation = 'lighter'
  context.globalAlpha = alpha
  context.fillStyle = '#fff9dc'
  context.beginPath()
  context.arc(0, 0, Math.max(1.2, radius * 0.58), 0, Math.PI * 2)
  context.globalAlpha = alpha * 0.12
  context.fill()
  context.globalAlpha = alpha
  context.beginPath()
  context.arc(0, 0, Math.max(0.7, radius * 0.22), 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = '#fff'
  context.lineWidth = Math.max(0.65, radius * 0.075)
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(-radius * horizontal, 0)
  context.lineTo(radius * horizontal, 0)
  context.moveTo(0, -radius * 1.28 * vertical)
  context.lineTo(0, radius * 1.28 * vertical)
  context.stroke()
  context.restore()
}

export default function MapStarLift({ routes, svgRef, onHandoff, onComplete }) {
  const canvasRef = useRef(null)
  const onHandoffRef = useRef(onHandoff)
  const onCompleteRef = useRef(onComplete)

  onHandoffRef.current = onHandoff
  onCompleteRef.current = onComplete

  useEffect(() => {
    const canvas = canvasRef.current
    const svg = svgRef.current
    if (!canvas || !svg || !routes.length) return undefined

    const context = canvas.getContext('2d')
    const random = seededRandom(1924 + routes.length * 17)
    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = 1
    let frame = 0
    let handedOff = false
    let completed = false
    const startedAt = performance.now()

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(width * height > 2400000 ? 1.15 : 1.35, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function toScreenPoint(origin) {
      const point = svg.createSVGPoint()
      point.x = origin[0]
      point.y = origin[1]
      const screen = point.matrixTransform(svg.getScreenCTM())
      return { x: screen.x, y: screen.y }
    }

    resize()
    const maxCount = Math.max(...routes.map((route) => route.count), 1)
    const particles = routes.flatMap((route, routeIndex) => {
      const origin = toScreenPoint(route.origin)
      const density = 14 + Math.round((route.count / maxCount) * 30)
      return Array.from({ length: density }, (_, particleIndex) => ({
        origin,
        delay: routeIndex * 0.025 + particleIndex * 0.009 + random() * 0.22,
        drift: (random() - 0.5) * (70 + random() * 155),
        sway: 10 + random() * 38,
        rise: 90 + random() * Math.max(180, height * 0.38),
        skyX: random() * width,
        skyY: random() * height,
        size: 2.4 + random() * 6.2,
        phase: random() * 7,
        depth: 0.35 + random() * 0.9,
      }))
    })

    function draw(now) {
      const elapsed = (now - startedAt) / 1000
      const fillProgress = smoothstep((elapsed - 1.7) / 3.5)
      const handoffFade = smoothstep((elapsed - 5.25) / 1.05)
      context.clearRect(0, 0, width, height)

      // The black sky is only a bridge.  Once MessageResonance is mounted
      // underneath, fade this layer away instead of cutting to it abruptly.
      context.globalAlpha = clamp(fillProgress * 1.04) * (1 - handoffFade)
      context.fillStyle = '#000'
      context.fillRect(0, 0, width, height)

      particles.forEach((particle, index) => {
        const life = clamp((elapsed - particle.delay) / (5.15 - particle.delay * 0.12))
        if (life <= 0) return
        const riseProgress = smoothstep(life / 0.62)
        const skyProgress = smoothstep((life - 0.48) / 0.52)
        const risingX = particle.origin.x + particle.drift * riseProgress
        const risingY = particle.origin.y - particle.rise * riseProgress
        const x = risingX + (particle.skyX - risingX) * skyProgress
          + Math.sin(life * Math.PI * 2.1 + particle.phase) * particle.sway * (0.2 + skyProgress * 0.34)
        const y = risingY + (particle.skyY - risingY) * skyProgress
        const alpha = clamp(Math.sin(Math.min(1, life) * Math.PI) * 1.2 + fillProgress * 0.42)
          * (1 - handoffFade)
        const size = particle.size * (0.46 + life * 1.12) * particle.depth
        drawLiftStar(context, x, y, size, alpha, now * 0.006 + index * 0.37)
      })

      if (!handedOff && elapsed >= 5.08) {
        handedOff = true
        onHandoffRef.current?.()
      }
      if (!completed && elapsed >= 6.42) {
        completed = true
        onCompleteRef.current?.()
        return
      }
      frame = window.requestAnimationFrame(draw)
    }

    frame = window.requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [routes, svgRef])

  return createPortal(
    <div className="message-map-star-lift" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>,
    document.body,
  )
}
