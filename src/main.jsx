import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import poem from '../poem.config.json'
import './styles.css'

const milestones = [
  { year: '1924', title: '国立广东大学成立', text: '孙中山先生整合广州多所学校，亲手创办国立广东大学，并题写“博学、审问、慎思、明辨、笃行”。' },
  { year: '1926', title: '定名国立中山大学', text: '学校定名为国立中山大学，承续中山先生的教育理想与家国担当。' },
  { year: '1952', title: '院系调整', text: '在全国高等学校院系调整中发展壮大，逐步形成多学科并进的办学格局。' },
  { year: '2001', title: '强强合并', text: '中山大学与中山医科大学合并，进一步确立文理医工综合发展的优势。' },
  { year: '2017', title: '进入“双一流”', text: '入选国家世界一流大学建设高校，11个学科进入“双一流”建设名单。' },
  { year: '2024', title: '世纪中大', text: '百年新起点，三校区五校园协同发展，面向湾区、面向海洋、面向未来。' },
]

const mottos = [
  ['博学', '广泛学习，拥抱完整而开放的知识世界。'],
  ['审问', '保持好奇，以追问抵达问题的深处。'],
  ['慎思', '冷静思考，不让答案停在表面。'],
  ['明辨', '辨析真伪，在复杂世界中形成判断。'],
  ['笃行', '把所知化为行动，让理想落到大地。'],
]

const subjects = {
  人文: ['哲学', '工商管理'],
  理学: ['数学', '化学', '生物学', '生态学'],
  工学: ['材料科学与工程', '电子科学与技术'],
  医学: ['基础医学', '临床医学', '药学'],
}

const campuses = [
  { key: 'SOUTH', city: '广州', name: '南校园', tone: 'heritage', line: '红砖绿瓦，古树成荫', text: '康乐园里，海棠窗、怀士堂、惺亭与百年古树共同保留着中大的历史肌理。', icon: '窗' },
  { key: 'NORTH', city: '广州', name: '北校园', tone: 'medical', line: '医学薪火，仁心济世', text: '根植医学传统，连接课堂、实验室与医院，让严谨科学始终回应生命所需。', icon: '医' },
  { key: 'EAST', city: '广州', name: '东校园', tone: 'youth', line: '大学城中，青春开放', text: '开阔水岸、现代教学空间与年轻社群，在这里组成充满活力的学习现场。', icon: '青' },
  { key: 'ZHUHAI', city: '珠海', name: '珠海校区', tone: 'ocean', line: '山海相拥，深空深海', text: '面朝南海，彩虹桥与图书馆相映，深空、深海、深地学科群向远方延伸。', icon: '海' },
  { key: 'SHENZHEN', city: '深圳', name: '深圳校区', tone: 'future', line: '湾区前沿，医工交叉', text: '现代校园坐落光明，以新工科与医学为支点，连接科技创新和城市未来。', icon: '新' },
]

const sectionItems = [
  ['01', '历史', 'history'], ['02', '文化', 'culture'], ['03', '学科', 'subjects'], ['04', '校园', 'campuses'], ['05', '寄语', 'messages']
]

const initialProgress = () => {
  try { return { history: false, culture: false, subjects: false, campuses: false, messages: false, ...JSON.parse(localStorage.getItem('sysu-progress') || '{}') } }
  catch { return { history: false, culture: false, subjects: false, campuses: false, messages: false } }
}

function useApi() {
  const [csrf, setCsrf] = useState('')
  useEffect(() => { fetch('/api/csrf-token').then(r => r.json()).then(d => setCsrf(d.csrf_token)).catch(() => {}) }, [])
  const send = async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf, ...(options.headers || {}) } })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || '连接失败，请稍后重试')
    return data
  }
  return { csrf, send }
}

function LoadingGate({ onDone }) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState(0)
  const first = ['大', '山', '中', '学']
  const second = ['中', '山', '大', '学']
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), reduce ? 100 : 1600)
    const t2 = setTimeout(() => setPhase(2), reduce ? 250 : 3000)
    const t3 = setTimeout(onDone, reduce ? 450 : 3900)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [onDone, reduce])
  return <motion.div className="loader" exit={{ opacity: 0 }}>
    <div className="loader-top mono"><span>SYSU / LINK START</span><span>{phase < 2 ? 'REASSEMBLING IDENTITY' : 'ACCESS GRANTED'}</span></div>
    <div className={`loader-window phase-${phase}`} aria-label="中山大学加载动画">
      {(phase ? second : first).map((char, index) => <motion.div
        layout key={char} className="loader-tile"
        transition={{ type: 'spring', stiffness: 160, damping: 16 }}
      ><span>{char}</span><small>0{index + 1}</small></motion.div>)}
    </div>
    <div className="loader-progress"><i style={{ width: `${phase === 0 ? 34 : phase === 1 ? 76 : 100}%` }} /></div>
    <button className="skip" onClick={onDone}>跳过 SKIP ↗</button>
  </motion.div>
}

function Badge({ dark = false }) {
  return <div className={`badge ${dark ? 'dark' : ''}`} aria-label="中山大学1924标志">
    <span className="badge-ring">SUN YAT-SEN · 1924 · SYSU</span><b>中大</b><i>博学<br/>笃行</i>
  </div>
}

function SectionHead({ index, en, title, dark = false }) {
  return <header className={`section-head ${dark ? 'on-dark' : ''}`}>
    <div className="section-index mono">{index}<span> / 05</span></div>
    <div><p className="eyebrow">{en} · SYSU</p><h2>{title}</h2></div>
    <div className="head-line" />
  </header>
}

function Hero({ progress }) {
  const complete = Object.values(progress).filter(Boolean).length
  return <section className="hero" id="top">
    <div className="hero-grid" aria-hidden="true" />
    <div className="ticker mono">SUN YAT-SEN UNIVERSITY · EST.1924 · 博学 审问 慎思 明辨 笃行 · <span>SUN YAT-SEN UNIVERSITY · EST.1924 ·</span></div>
    <nav className="topbar">
      <a className="brand" href="#top"><Badge dark /><span>中山大学<small>SUN YAT-SEN UNIVERSITY</small></span></a>
      <div className="navlinks">{sectionItems.map(([n, label, id]) => <a href={`#${id}`} key={id}><em>{n}</em>{label}</a>)}</div>
      <div className="progress-chip mono">EXPLORE {complete}/5</div>
    </nav>
    <div className="hero-copy">
      <motion.p initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="hero-kicker mono">WELCOME TO / GUANGDONG, CHINA</motion.p>
      <motion.h1 initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .2 }} data-shadow="中山大学">中山大学</motion.h1>
      <div className="hero-sub"><strong>SUN YAT-SEN<br/>UNIVERSITY</strong><span>三校区 · 五校园<br/>ONE SYSU / FIVE CAMPUSES</span></div>
      <a className="primary-btn" href="#history">开始探索 <b>↘</b></a>
    </div>
    <div className="hero-art">
      <div className="sun-disc" />
      <div className="arch arch-back"><i/><i/><i/></div>
      <div className="arch arch-front"><i/><i/><i/></div>
      <div className="kapok">✦</div>
      <span className="sticker sticker-a mono">100 YEARS<br/>AND BEYOND</span>
      <span className="sticker sticker-b">山高水长</span>
    </div>
    <div className="hero-bottom mono"><span>22.52° N / 113.39° E</span><span>SCROLL TO EXPLORE ↓</span><span>SYSU SIGNAL / ONLINE</span></div>
  </section>
}

function History({ complete }) {
  const [active, setActive] = useState(0)
  const choose = index => { setActive(index); complete('history') }
  return <section className="history paper-section" id="history">
    <SectionHead index="01" en="HISTORY ARCHIVE" title="百年校史" />
    <div className="history-layout">
      <div className="year-display"><span className="mono">FILE / {String(active + 1).padStart(2, '0')}</span><b>{milestones[active].year}</b><i>年</i></div>
      <motion.article key={active} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="archive-card">
        <div className="tape">ARCHIVE VERIFIED</div><small className="mono">SYSU HISTORY DATABASE</small>
        <h3>{milestones[active].title}</h3><p>{milestones[active].text}</p>
        <div className="archive-seal">中大<br/>史志</div>
      </motion.article>
    </div>
    <div className="timeline" role="tablist" aria-label="中山大学历史时间轴">
      {milestones.map((item, index) => <button role="tab" aria-selected={active === index} className={active === index ? 'active' : ''} key={item.year} onClick={() => choose(index)}><i/><b>{item.year}</b><span>{item.title}</span></button>)}
    </div>
    <p className="interaction-hint mono">DRAG / CLICK YEAR TO READ ARCHIVE ↔</p>
  </section>
}

function Culture({ complete }) {
  const [open, setOpen] = useState(-1)
  return <section className="culture dark-section" id="culture">
    <SectionHead index="02" en="CULTURE CODE" title="校训解码" dark />
    <div className="motto-intro"><p>1924年11月11日，孙中山先生亲笔题写十字训词。五个动作，构成一代代中大人的精神坐标。</p><div className="soundwave">|||| |||||| | ||||| || |||||||</div></div>
    <div className="motto-grid">
      {mottos.map(([word, text], index) => <button key={word} className={`motto-card ${open === index ? 'open' : ''}`} onClick={() => { setOpen(open === index ? -1 : index); complete('culture') }}>
        <span className="corner mono">0{index + 1}</span><b>{word}</b><em>{text}</em><i>{open === index ? 'CLOSE ×' : 'DECODE +'}</i>
      </button>)}
    </div>
    <div className="culture-quote">“学在中大，追求卓越”<span>LEARN · QUESTION · THINK · DISCERN · PRACTICE</span></div>
  </section>
}

function Subjects({ complete }) {
  const tabs = Object.keys(subjects)
  const [tab, setTab] = useState(tabs[0])
  return <section className="subjects paper-section" id="subjects">
    <SectionHead index="03" en="DISCIPLINE TERMINAL" title="学科优势" />
    <div className="terminal">
      <div className="terminal-bar mono"><span>SYSU_DISCIPLINE.EXE</span><span>11 WORLD-CLASS DISCIPLINES</span><i/><i/><i/></div>
      <div className="terminal-body">
        <aside><p>SELECT FIELD</p>{tabs.map((name, index) => <button className={tab === name ? 'active' : ''} key={name} onClick={() => { setTab(name); if (name !== tabs[0]) complete('subjects') }}><span>0{index + 1}</span>{name}<b>→</b></button>)}</aside>
        <div className="subject-screen">
          <AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="subject-list">
            {subjects[tab].map((item, index) => <article key={item}><span className="mono">SYSU / {String(index + 1).padStart(2, '0')}</span><h3>{item}</h3><p>面向学术前沿与国家重大战略，汇入中大多学科交叉发展的知识网络。</p><i>↗</i></article>)}
          </motion.div></AnimatePresence>
          <div className="radar" aria-hidden="true"><i/><i/><i/><b>SYSU</b></div>
        </div>
      </div>
    </div>
    <div className="stats-strip"><b>11<span>个“双一流”建设学科</span></b><b>14<span>个第四轮学科评估A类学科</span></b><b>13<span>除军事学外全学科门类</span></b></div>
  </section>
}

function CampusVisual({ campus }) {
  return <div className={`campus-visual ${campus.tone}`}>
    <img className="campus-photo" src={`/campuses/${campus.key === 'SOUTH' ? 'south.jpg' : campus.key === 'NORTH' ? 'north.jpg' : campus.key === 'EAST' ? 'east.png' : campus.key === 'ZHUHAI' ? 'zhuhai.jpg' : 'shenzhen.jpg'}`} alt={`${campus.city}${campus.name}校园景色`} />
    <div className="sky"/><div className="cloud c1"/><div className="cloud c2"/>
    <div className="building"><i/><i/><i/><i/><i/></div>
    <div className="trees"><i/><i/><i/><i/></div><div className="water"/>
    <div className="campus-glyph">{campus.icon}</div>
  </div>
}

function Campuses({ complete }) {
  const [active, setActive] = useState(0)
  const campus = campuses[active]
  const change = index => { setActive(index); complete('campuses') }
  return <section className="campuses dark-section" id="campuses">
    <SectionHead index="04" en="CAMPUS CHANNEL" title="三校区五校园" dark />
    <div className="campus-stage">
      <AnimatePresence mode="wait"><motion.div key={campus.key} initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }} exit={{ opacity: 0, x: -80 }} transition={{ duration: .55 }} className="campus-main">
        <CampusVisual campus={campus} />
        <div className="campus-copy"><span className="mono">CHANNEL / 0{active + 1}</span><h3><small>{campus.city}</small>{campus.name}</h3><strong>{campus.line}</strong><p>{campus.text}</p><button onClick={() => complete('campuses')}>地点档案已读取 ✓</button></div>
      </motion.div></AnimatePresence>
      <div className="campus-tabs">{campuses.map((item, index) => <button key={item.key} onClick={() => change(index)} className={active === index ? 'active' : ''}><span className="mono">0{index + 1}</span><b>{item.name}</b><i>{item.key}</i></button>)}</div>
    </div>
  </section>
}

function ParticleSeal({ count, messages }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animation, particles = []
    const resize = () => {
      const box = canvas.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2)
      canvas.width = box.width * dpr; canvas.height = box.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.max(40, Math.min(120, count * 2 || 40)); particles = Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2; const ring = i % 3
        const radius = Math.min(box.width, box.height) * (ring === 0 ? .34 : ring === 1 ? .25 : .15)
        let tx = box.width / 2 + Math.cos(a) * radius, ty = box.height / 2 + Math.sin(a) * radius
        if (count >= 40 && ring === 2) { tx = box.width / 2 + Math.cos(a) * radius * .7; ty = box.height / 2 + Math.sin(a) * radius * .7 }
        return { x: Math.random() * box.width, y: Math.random() * box.height, tx, ty, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1.8 + Math.random() * 2.5, c: i % 5 === 0 ? '#efff38' : i % 3 === 0 ? '#fff' : '#00b981' }
      })
    }
    resize(); window.addEventListener('resize', resize)
    let t = 0
    const draw = () => {
      const box = canvas.getBoundingClientRect(); ctx.clearRect(0, 0, box.width, box.height); t += .01
      particles.forEach((p, i) => {
        if (count >= 40) { p.x += (p.tx - p.x) * .035; p.y += (p.ty - p.y) * .035 }
        else { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > box.width) p.vx *= -1; if (p.y < 0 || p.y > box.height) p.vy *= -1 }
        ctx.beginPath(); ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 12; ctx.arc(p.x, p.y + Math.sin(t * 3 + i) * 2, p.r, 0, Math.PI * 2); ctx.fill()
      })
      if (count >= 40) {
        ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(0,185,129,.72)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(box.width / 2, box.height / 2, Math.min(box.width, box.height) * .34, 0, Math.PI * 2); ctx.stroke()
        ctx.fillStyle = '#f5f1e8'; ctx.textAlign = 'center'; ctx.font = '900 34px sans-serif'; ctx.fillText('中山大学', box.width / 2, box.height / 2 + 10)
        ctx.font = '700 12px monospace'; ctx.fillText('SUN YAT-SEN UNIVERSITY · 1924', box.width / 2, box.height / 2 + 35)
      }
      animation = requestAnimationFrame(draw)
    }
    draw(); return () => { cancelAnimationFrame(animation); window.removeEventListener('resize', resize) }
  }, [count, messages.length])
  return <canvas ref={canvasRef} className="particle-canvas" aria-label={count >= 40 ? '寄语粒子已聚合为中山大学校徽' : '寄语粒子正在漂浮'} />
}

function AuthModal({ onClose, onSuccess, api }) {
  const [mode, setMode] = useState('login'), [username, setUsername] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('')
    try { const data = await api.send(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify({ username, password }) }); onSuccess(data.user); onClose() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <motion.div className="auth-modal" initial={{ y: 50, rotate: -1 }} animate={{ y: 0, rotate: 0 }} role="dialog" aria-modal="true" aria-label="登录或注册">
      <button className="modal-close" onClick={onClose}>×</button><p className="eyebrow">SYSU IDENTITY TERMINAL</p><h3>{mode === 'login' ? '欢迎回来' : '创建通行证'}</h3>
      <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>登录 LOGIN</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>注册 REGISTER</button></div>
      <form onSubmit={submit}><label>用户名<input value={username} onChange={e => setUsername(e.target.value)} minLength="3" maxLength="20" required placeholder="3–20个字符" /></label><label>密码<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength="8" required placeholder="至少8位" /></label>{error && <p className="form-error">! {error}</p>}<button className="form-submit" disabled={busy || !api.csrf}>{busy ? '连接中…' : mode === 'login' ? '接入 SYSU →' : '完成注册 →'}</button></form>
    </motion.div>
  </motion.div>
}

function Messages({ complete, onUnlock }) {
  const api = useApi(); const [user, setUser] = useState(null), [messages, setMessages] = useState([]), [count, setCount] = useState(0), [auth, setAuth] = useState(false), [content, setContent] = useState(''), [notice, setNotice] = useState(''), [selected, setSelected] = useState(null)
  const load = async () => {
    try { const [me, data] = await Promise.all([fetch('/api/auth/me').then(r => r.json()), fetch('/api/messages').then(r => r.json())]); setUser(me.user); setMessages(data.messages); setCount(data.count) } catch { setNotice('后端尚未连接：请启动 Flask 服务') }
  }
  useEffect(() => { load() }, [])
  const post = async e => {
    e.preventDefault(); setNotice('')
    if (!user) return setAuth(true)
    try { const data = await api.send('/api/messages', { method: 'POST', body: JSON.stringify({ content }) }); setContent(''); setUser({ ...user, has_message: true }); await load(); if (data.resonance) onUnlock() }
    catch (err) { setNotice(err.message) }
  }
  const logout = async () => { try { await api.send('/api/auth/logout', { method: 'POST' }); setUser(null) } catch (err) { setNotice(err.message) } }
  const viewMessage = message => { setSelected(message); complete('messages') }
  return <section className="messages-section" id="messages">
    <SectionHead index="05" en="SYSU RESONANCE" title="中大寄语" dark />
    <div className="resonance-layout">
      <div className="particle-wrap"><ParticleSeal count={count} messages={messages} /><div className="resonance-count"><span className="mono">RESONANCE</span><b>{String(count).padStart(2, '0')}<i>/40</i></b><p>{count >= 40 ? '共鸣完成 · SYSU EMBLEM FORMED' : '每一条寄语，都是校徽中的一个光点'}</p></div></div>
      <div className="message-panel">
        <div className="identity-line">{user ? <><span>已接入 / <b>{user.username}</b></span><button onClick={logout}>退出</button></> : <><span>身份尚未接入</span><button onClick={() => setAuth(true)}>登录 / 注册</button></>}</div>
        <form className="message-form" onSubmit={post}><label>TO SYSU / 写下你的中大寄语</label><textarea value={content} onChange={e => setContent(e.target.value)} maxLength="80" placeholder={user?.has_message ? '你已经留下了属于自己的光点' : '山高水长，写给现在与未来……'} disabled={user?.has_message}/><div><span>{content.length}/80</span><button disabled={user?.has_message}>{user ? '发送光点 ↗' : '登录后寄语 ↗'}</button></div></form>
        {notice && <p className="notice">{notice}</p>}
        <div className="message-feed"><div className="feed-title mono"><span>LIVE SIGNAL</span><span>{messages.length} MESSAGES</span></div>{messages.slice(0, 8).map(message => <button key={message.id} onClick={() => viewMessage(message)}><i/><span><b>@{message.username}</b>{message.content}</span><small>{message.is_demo ? '演示寄语' : '刚刚'}</small></button>)}</div>
      </div>
    </div>
    <AnimatePresence>{auth && <AuthModal onClose={() => setAuth(false)} onSuccess={setUser} api={api} />}</AnimatePresence>
    <AnimatePresence>{selected && <motion.div className="message-toast" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}><button onClick={() => setSelected(null)}>×</button><span>@{selected.username}</span><p>{selected.content}</p></motion.div>}</AnimatePresence>
  </section>
}

function Gift({ onClose, replayKey }) {
  const reduce = useReducedMotion(), [opened, setOpened] = useState(false)
  return <motion.div className="gift-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={replayKey}>
    {!opened ? <motion.div className="envelope" initial={{ scale: .7, rotate: -4 }} animate={{ scale: 1, rotate: 0 }}><span className="mono">EXPLORATION COMPLETE</span><h3>一封来自中大的诗笺</h3><div className="seal">中大</div><button onClick={() => setOpened(true)}>启封 OPEN ↗</button><small>完成五章探索后获得</small></motion.div> : <motion.div className="scroll-wrap" initial={{ scaleY: reduce ? 1 : .03 }} animate={{ scaleY: 1 }} transition={{ duration: reduce ? 0 : 2.5, ease: [0.22, 1, 0.36, 1] }}>
      <div className="scroll-rod top"/><div className="paper-poem"><div className="ink-flower"/><div className="poem-content"><motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 2 }}>{poem.title}</motion.h3>{poem.lines.map((line, index) => <motion.p key={line} initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ delay: reduce ? 0 : 2.5 + index * .65 }}>{line}</motion.p>)}<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 5.4 }}>{poem.signature}</motion.span><motion.i className="red-stamp" initial={{ opacity: 0, scale: 1.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: reduce ? 0 : 5.8, type: 'spring' }}>中山<br/>大学</motion.i></div></div><div className="scroll-rod bottom"/>
      <div className="scroll-actions"><button onClick={onClose}>收卷 CLOSE</button><button onClick={() => setOpened(false)}>再次品读 REPLAY</button></div>
    </motion.div>}
  </motion.div>
}

function Footer({ onPoem }) {
  return <footer><Badge/><div><h2>中山大学 <span>SYSU</span></h2><p>SUN YAT-SEN UNIVERSITY · 1924—∞</p></div><button onClick={onPoem}>再次品读诗笺 ↗</button><div className="sources"><span>内容来源</span><a href="https://www.sysu.edu.cn/xxg/zdjj1.htm" target="_blank" rel="noreferrer">中大简介</a><a href="https://www.sysu.edu.cn/xxg/zdjj1/xywh.htm" target="_blank" rel="noreferrer">校园文化</a><a href="https://www.sysu.edu.cn/xxg/zdjj1/xkys.htm" target="_blank" rel="noreferrer">学科优势</a><a href="https://www.sysu.edu.cn/xxg/zdxq.htm" target="_blank" rel="noreferrer">中大校区</a></div>
  </footer>
}

function App() {
  const [loading, setLoading] = useState(sessionStorage.getItem('sysu-intro-seen') !== '1')
  const [progress, setProgress] = useState(initialProgress)
  const [gift, setGift] = useState(false), [replay, setReplay] = useState(0), [autoShown, setAutoShown] = useState(localStorage.getItem('sysu-gift-seen') === '1')
  const complete = key => setProgress(prev => prev[key] ? prev : { ...prev, [key]: true })
  useEffect(() => { localStorage.setItem('sysu-progress', JSON.stringify(progress)); if (Object.values(progress).every(Boolean) && !autoShown) { setGift(true); setAutoShown(true); localStorage.setItem('sysu-gift-seen', '1') } }, [progress, autoShown])
  const doneLoading = () => { sessionStorage.setItem('sysu-intro-seen', '1'); setLoading(false) }
  const openPoem = () => { setReplay(v => v + 1); setGift(true) }
  return <>
    <AnimatePresence>{loading && <LoadingGate onDone={doneLoading} />}</AnimatePresence>
    <Hero progress={progress}/><main><History complete={complete}/><Culture complete={complete}/><Subjects complete={complete}/><Campuses complete={complete}/><Messages complete={complete} onUnlock={() => {}}/></main><Footer onPoem={openPoem}/>
    <div className="side-rail mono"><span>SYSU</span><i/><span>1924</span></div>
    <AnimatePresence>{gift && <Gift onClose={() => setGift(false)} replayKey={replay}/>}</AnimatePresence>
  </>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
