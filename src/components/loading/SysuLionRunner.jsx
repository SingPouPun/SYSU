/**
 * DAY 1 教学接口：中大狮加载角色。
 * 这里只建立动作分层，最终奔跑时间轴由我们接下来共同完成。
 */
export default function SysuLionRunner({ mode = 'opening', label = '' }) {
  return (
    <div className={`lion-runner-scaffold lion-runner--${mode}`} aria-label="中大狮加载动画骨架">
      <div className="lion-motion-stage">
        <div className="lion-speed-lines" aria-hidden="true"><i /><i /><i /></div>
        <div className="lion-art-slot" aria-hidden="true">
          <span className="lion-mane">中</span>
          <span className="lion-body" />
          <span className="lion-leg lion-leg--front" />
          <span className="lion-leg lion-leg--back" />
          <span className="lion-tail" />
        </div>
        <div className="lion-ground" />
      </div>
      <div className="lion-loading-copy">
        <strong>{mode === 'opening' ? '大山中学 → 中山大学' : `正在进入 · ${label}`}</strong>
        <span>{mode === 'opening' ? 'SYSU IDENTITY REORDERING' : 'SYSU CHAPTER LOADING'}</span>
      </div>
    </div>
  )
}
