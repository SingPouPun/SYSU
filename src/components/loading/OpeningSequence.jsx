import SysuLionRunner from './SysuLionRunner.jsx'

const INITIAL_GLYPHS = ['大', '山', '中', '学']

export default function OpeningSequence({ visible, onFinish }) {
  if (!visible) return null

  return (
    <section className="opening-scaffold" aria-label="启动动画教学骨架">
      <div className="opening-meta"><span>SYSU / BOOT SEQUENCE</span><span>DAY 1 · WAITING FOR TIMELINE</span></div>
      <div className="opening-tiles">
        {INITIAL_GLYPHS.map((glyph, index) => (
          <div className="opening-tile" key={`${glyph}-${index}`}>
            <small>0{index + 1}</small><b>{glyph}</b>
          </div>
        ))}
      </div>
      <SysuLionRunner mode="opening" />
      <p>第一项任务：让中大狮奔跑，并让“大山中学”清晰重排为“中山大学”</p>
      <button type="button" onClick={onFinish}>暂时进入骨架 →</button>
    </section>
  )
}
