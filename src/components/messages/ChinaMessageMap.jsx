import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MessageResonance, { preloadMessageResonanceAssets } from './MessageResonance.jsx'
import MapStarLift from './MapStarLift.jsx'
import { DEMO_MODE } from '../../config/runtime.js'

const VIEWBOX = { width: 1240, height: 790 }
const GEO_BOUNDS = { minLng: 73, maxLng: 135, minLat: 17, maxLat: 54 }
const SHENZHEN = [114.0579, 22.5431]

function fallbackEmoticon(content) {
  if (/(想念|怀念|记得|故人|归来|母校|回忆)/.test(content)) return '( ´•̥̥̥ω•̥̥̥` )'
  if (/(笃行|奋斗|坚持|不息|勇敢|努力|前行)/.test(content)) return 'ᕦ(ò_óˇ)ᕤ'
  if (/(开心|快乐|青春|热烈|庆|相遇|美好|哈哈|喜欢)/.test(content)) return '(๑˃̵ᴗ˂̵)و'
  if (/(愿|祝|期待|未来|加油|前程|光|希望)/.test(content)) return '✧(◍˃̶ᗜ˂̶◍)✧'
  if (/(山|海|月|秋|清|风|江|云)/.test(content)) return '( ´ ▽ ` )ﾉ'
  return '(｡•̀ᴗ-)✧'
}

function project([longitude, latitude]) {
  const x = 42 + ((longitude - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng)) * 916
  const y = 42 + ((GEO_BOUNDS.maxLat - latitude) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) * 700
  return [x, y]
}

function ringToPath(ring) {
  return ring.map((coordinate, index) => {
    const [x, y] = project(coordinate)
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ') + ' Z'
}

function geometryToPath(geometry) {
  if (!geometry) return ''
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  return polygons.flatMap((polygon) => polygon.map(ringToPath)).join(' ')
}

function routePath(origin, destination) {
  const [x1, y1] = project(origin)
  const [x2, y2] = project(destination)
  const distance = Math.hypot(x2 - x1, y2 - y1)
  const curve = Math.min(120, Math.max(35, distance * 0.24))
  const controlX = (x1 + x2) / 2
  const controlY = Math.min(y1, y2) - curve
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${controlX.toFixed(1)},${controlY.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
}

export default function ChinaMessageMap({ active = false, user, onRequestLogin, onMessageSubmitted }) {
  const [features, setFeatures] = useState([])
  const [selectedProvince, setSelectedProvince] = useState('广东省')
  const [loadError, setLoadError] = useState(false)
  const [messageSummary, setMessageSummary] = useState(null)
  const [resonanceOpen, setResonanceOpen] = useState(false)
  const [resonanceReplay, setResonanceReplay] = useState(0)
  const [resonanceCompleted, setResonanceCompleted] = useState(false)
  const [mapLaunching, setMapLaunching] = useState(false)
  const [barrageEnabled, setBarrageEnabled] = useState(false)
  const [draft, setDraft] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const launchTimerRef = useRef(null)
  const mapSvgRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    fetch('/data/china-provinces.json')
      .then((response) => {
        if (!response.ok) throw new Error('Map data unavailable')
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setFeatures(data.features ?? [])
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const warmAssets = () => preloadMessageResonanceAssets().catch(() => undefined)
    const idleId = 'requestIdleCallback' in window
      ? window.requestIdleCallback(warmAssets, { timeout: 2400 })
      : window.setTimeout(warmAssets, 900)

    return () => {
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleId)
      else window.clearTimeout(idleId)
    }
  }, [])

  // 两个动画都通过 portal 挂在 document.body。离开寄语章节时必须主动卸载，
  // 否则固定定位的 Canvas 仍可能压在校史等前序章节上方。
  useEffect(() => {
    if (active) return
    window.clearTimeout(launchTimerRef.current)
    launchTimerRef.current = null
    setMapLaunching(false)
    setResonanceOpen(false)
  }, [active])

  useEffect(() => {
    if (import.meta.env.DEV && DEMO_MODE) {
      let cancelled = false
      import('../../data/demoMessages.js').then(({ DEMO_MESSAGE_SUMMARY }) => {
        if (!cancelled) setMessageSummary(DEMO_MESSAGE_SUMMARY)
      })
      return () => { cancelled = true }
    }
    let cancelled = false
    let timer
    const refreshMessages = () => fetch('/api/messages')
      .then((response) => {
        if (!response.ok) throw new Error('Messages unavailable')
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setMessageSummary(data)
      })
      .catch(() => undefined)

    refreshMessages()
    timer = window.setInterval(refreshMessages, 15000)
    window.addEventListener('sysu:messages-changed', refreshMessages)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.removeEventListener('sysu:messages-changed', refreshMessages)
    }
  }, [])

  const messageSignals = useMemo(() => {
    const signals = {}
    messageSummary?.messages?.filter((message) => message.province).forEach((message) => {
      const current = signals[message.province] ?? { count: 0, message: message.content }
      signals[message.province] = {
        count: current.count + 1,
        message: message.content,
      }
    })
    return signals
  }, [messageSummary])

  const barrageMessages = useMemo(() => {
    const source = messageSummary?.messages ?? []
    return source.slice(0, 40).map((message, index) => ({
      ...message,
      emoticon: message.emoticon || fallbackEmoticon(message.content),
      lane: index % 7,
      duration: 15 + (index * 7) % 11,
      delay: (index * 2.7) % 18,
    }))
  }, [messageSummary])

  const activeRoutes = useMemo(() => features
    .filter((feature) => feature.properties.name && messageSignals[feature.properties.name])
    .map((feature) => ({
      name: feature.properties.name,
      count: messageSignals[feature.properties.name].count,
      origin: project(feature.properties.centroid ?? feature.properties.center),
      path: routePath(
        feature.properties.centroid ?? feature.properties.center,
        SHENZHEN,
      ),
    })), [features, messageSignals])
  const nineDashFeature = useMemo(
    () => features.find((feature) => feature.properties.adchar === 'JD'),
    [features],
  )
  const southChinaSeaIslands = useMemo(
    () => features.find((feature) => feature.properties.name === '海南省'),
    [features],
  )

  const selected = messageSignals[selectedProvince]
    ?? { count: 0, message: '这里尚未点亮，等待第一封来自此地的中大寄语。' }
  const total = messageSummary?.count ?? 0
  const goal = messageSummary?.goal ?? 40
  const progressPercent = Math.min(100, Math.round((total / Math.max(goal, 1)) * 100))
  const isAdmin = Boolean(user?.is_admin)
  const qualified = total >= goal || isAdmin
  const [shenzhenX, shenzhenY] = project(SHENZHEN)

  useEffect(() => () => window.clearTimeout(launchTimerRef.current), [])

  const markResonanceComplete = useCallback(() => {
    window.sessionStorage.setItem(`sysu-message-resonance-${goal}`, 'played')
    setResonanceCompleted(true)
  }, [goal])

  const closeResonance = useCallback(() => {
    window.clearTimeout(launchTimerRef.current)
    launchTimerRef.current = null
    setMapLaunching(false)
    setResonanceOpen(false)
    if (resonanceCompleted) window.dispatchEvent(new CustomEvent('sysu:poem-gift-ready'))
  }, [resonanceCompleted])

  const replayResonance = () => {
    if (mapLaunching) return
    setResonanceReplay((value) => value + 1)
    setResonanceCompleted(false)
    setMapLaunching(true)
    window.clearTimeout(launchTimerRef.current)
    launchTimerRef.current = window.setTimeout(() => setMapLaunching(false), 7600)
  }

  const submitMessage = async (event) => {
    event.preventDefault()
    if (DEMO_MODE) {
      setSubmitStatus({ type: 'success', text: '演示模式使用内存数据，不会写入生产数据库。' })
      return
    }
    if (!user) {
      onRequestLogin?.()
      return
    }
    const content = draft.trim()
    if (!content || submitting) return
    setSubmitting(true)
    setSubmitStatus(null)
    try {
      const tokenResponse = await fetch('/api/csrf-token')
      const { csrf_token: csrfToken } = await tokenResponse.json()
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ content, visibility }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '寄语提交失败')
      setDraft('')
      setSubmitStatus({ type: 'success', text: '寄语已化作一颗星光。' })
      onMessageSubmitted?.(data.message)
      window.dispatchEvent(new CustomEvent('sysu:messages-changed'))
    } catch (error) {
      setSubmitStatus({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`message-map-lab${mapLaunching ? ' is-launching-stars' : ''}${resonanceOpen ? ' is-resonance-open' : ''}`}>
      <div className="message-map-toolbar">
        <span>SYSU MESSAGE MIGRATION</span>
        <b>{progressPercent}%</b>
        <i>{Object.keys(messageSignals).length} 个省份已点亮</i>
        <button
          type="button"
          className={barrageEnabled ? 'is-active' : ''}
          aria-pressed={barrageEnabled}
          onClick={() => setBarrageEnabled((value) => !value)}
        >
          弹幕 {barrageEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="message-map-layout">
        <div className="message-map-stage">
          <div className="message-map-watermark" aria-hidden="true">CHINA<br />→ SYSU</div>

          {barrageEnabled && (
            <div className="message-barrage" aria-label="已有中大寄语弹幕">
              {barrageMessages.map((message) => (
                <span
                  key={message.id}
                  style={{
                    '--barrage-lane': message.lane,
                    '--barrage-duration': `${message.duration}s`,
                    '--barrage-delay': `-${message.delay}s`,
                  }}
                >
                  <small>{message.province || '中大'}</small>
                  {message.content}
                  <b>{message.emoticon}</b>
                </span>
              ))}
            </div>
          )}

          {loadError ? (
            <p className="message-map-error">地图数据暂时无法载入</p>
          ) : (
            <svg
              ref={mapSvgRef}
              className="message-map-svg"
              viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
              role="img"
              aria-label="来自中国各省的中大寄语汇聚至深圳"
            >
              <defs>
                <filter id="message-map-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <clipPath id="message-map-nine-dash-clip">
                  <rect x="982" y="318" width="232" height="406" rx="17" />
                </clipPath>
              </defs>

              <g className="message-map-provinces">
                {features.filter((feature) => feature.properties.name).map((feature) => {
                  const name = feature.properties.name
                  const messageData = messageSignals[name]
                  const intensity = messageData ? Math.min(1, 0.28 + messageData.count / 20) : 0

                  return (
                    <path
                      className={`message-map-province ${messageData ? 'is-lit' : ''} ${selectedProvince === name ? 'is-selected' : ''}`}
                      d={geometryToPath(feature.geometry)}
                      data-name={name}
                      key={feature.properties.adcode}
                      style={{ '--province-intensity': `${Math.round(intensity * 100)}%` }}
                      onPointerEnter={() => setSelectedProvince(name)}
                      onFocus={() => setSelectedProvince(name)}
                      tabIndex="0"
                    >
                      <title>{name}：{messageData?.count ?? 0} 封寄语</title>
                    </path>
                  )
                })}
              </g>

              {nineDashFeature && southChinaSeaIslands && (
                <g className="message-map-nine-dash-inset" aria-hidden="true">
                  <rect x="970" y="304" width="256" height="434" rx="22" />
                  <g clipPath="url(#message-map-nine-dash-clip)">
                    <path
                      className="message-map-inset-islands"
                      d={geometryToPath(southChinaSeaIslands.geometry)}
                      transform="translate(428 -270)"
                    />
                    <path
                      className="message-map-nine-dash"
                      d={geometryToPath(nineDashFeature.geometry)}
                      transform="translate(428 -270)"
                    />
                  </g>
                </g>
              )}

              <g className="message-map-routes" aria-hidden="true">
                {activeRoutes.map((route, index) => (
                  <g key={route.name}>
                    <path className="message-map-route-shadow" d={route.path} />
                    <path
                      className="message-map-route"
                      d={route.path}
                      id={`message-route-${index}`}
                      style={{ '--route-delay': `${-index * 0.31}s` }}
                    />
                    <circle className="message-map-traveller" r="3.6" style={{ '--route-delay': `${-index * 0.23}s` }}>
                      <animateMotion dur={`${2.8 + (index % 4) * 0.32}s`} repeatCount="indefinite" begin={`${index * -0.27}s`} path={route.path} />
                    </circle>
                  </g>
                ))}
              </g>

              <g className="message-map-shenzhen" transform={`translate(${shenzhenX} ${shenzhenY})`}>
                <circle className="message-map-shenzhen-core" r="8" />
                <path d="M13 -7 33 -23" />
                <text x="38" y="-25">深圳校区</text>
                <text className="message-map-shenzhen-en" x="38" y="-11">SYSU SHENZHEN</text>
              </g>
            </svg>
          )}

          <div className="message-map-legend" aria-hidden="true">
            <span>未收到</span><i /><i /><i /><b>寄语密集</b>
          </div>

          {qualified && resonanceOpen && (
            <MessageResonance
              replayKey={resonanceReplay}
              onComplete={markResonanceComplete}
              onClose={closeResonance}
            />
          )}
          {mapLaunching && activeRoutes.length > 0 && (
            <MapStarLift
              routes={activeRoutes}
              svgRef={mapSvgRef}
              onHandoff={() => setResonanceOpen(true)}
              onComplete={() => setMapLaunching(false)}
            />
          )}
        </div>

        <aside className="message-map-inspector">
          <small>PROVINCE SIGNAL</small>
          <strong>{selectedProvince}</strong>
          <div className="message-map-count"><b>{String(selected.count).padStart(2, '0')}</b><span>封寄语<br />MESSAGES</span></div>
          <blockquote>“{selected.message}”</blockquote>
          <form className="message-compose" onSubmit={submitMessage}>
            {DEMO_MODE ? (
              <p className="message-compose-complete">演示模式：40 条寄语仅保存在前端内存中。</p>
            ) : !user ? (
              <button className="message-compose-login" type="button" onClick={onRequestLogin}>
                登录后留下寄语
              </button>
            ) : user.has_message ? (
              <p className="message-compose-complete">你已留下本账号唯一的一封寄语。</p>
            ) : (
              <>
                <label htmlFor="sysu-message-content">写给中大的话</label>
                <textarea
                  id="sysu-message-content"
                  value={draft}
                  maxLength="80"
                  placeholder="1–80 字"
                  onChange={(event) => setDraft(event.target.value)}
                  required
                />
                <div className="message-compose-visibility" aria-label="寄语可见范围">
                  <label>
                    <input
                      type="radio"
                      name="message-visibility"
                      value="public"
                      checked={visibility === 'public'}
                      onChange={() => setVisibility('public')}
                    />
                    <span>所有人可见</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="message-visibility"
                      value="private"
                      checked={visibility === 'private'}
                      onChange={() => setVisibility('private')}
                    />
                    <span>仅本人及管理员可见</span>
                  </label>
                </div>
                <button className="message-compose-submit" type="submit" disabled={submitting || !draft.trim()}>
                  {submitting ? '正在送出' : '送出寄语'}
                </button>
              </>
            )}
            {submitStatus && <p className={`message-compose-status is-${submitStatus.type}`}>{submitStatus.text}</p>}
          </form>
          <div className="message-map-progress">
            <span><b>寄语汇聚进度</b><i>{progressPercent}%</i></span>
            <em><i style={{ width: `${progressPercent}%` }} /></em>
          </div>
          <button
            type="button"
            disabled={mapLaunching || !qualified}
            onClick={qualified ? replayResonance : undefined}
          >
            {mapLaunching ? '星光正在升起' : isAdmin && total < goal ? '管理员预览' : qualified ? '开始' : `进度 ${progressPercent}%`}
          </button>
        </aside>
      </div>
    </div>
  )
}
