export default function HeroSection({ onStart }) {
  return (
    <section className="hero-scaffold" id="top">
      <div className="hero-copy">
        <span>FOUR-DAY BUILD / START HERE</span>
        <h1>中山大学</h1>
        <h2>SUN YAT-SEN UNIVERSITY · SYSU</h2>
        <p>当前是可运行的教学骨架。视觉资产、UI动画与交互将由我们在四天内逐步完成。</p>
        <button type="button" onClick={onStart}>进入第一章 ↘</button>
      </div>
      <div className="hero-stage-mark" aria-hidden="true"><b>SYSU</b><span>1924</span></div>
    </section>
  )
}
