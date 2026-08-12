export default function PoemGift({ visible, onClose }) {
  if (!visible) return null
  return (
    <div className="poem-scaffold" role="dialog" aria-modal="true" aria-label="诗卷教学骨架">
      <div>
        <span>DAY 4</span><h2>宣纸诗卷</h2>
        <p>这里将实现宣纸展开、楷体显墨、竖排诗句与朱红印章。</p>
        <button type="button" onClick={onClose}>关闭骨架</button>
      </div>
    </div>
  )
}
