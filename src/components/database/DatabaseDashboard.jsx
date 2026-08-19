import { useEffect, useMemo, useState } from 'react'

function formatBytes(value = 0) {
  if (value < 1024) return `${value} B`
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 ** 2)).toFixed(2)} MB`
}

export default function DatabaseDashboard({ visible, onClose, onLogout, standalone = false }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!visible) return undefined
    let cancelled = false
    setError('')
    fetch('/api/dashboard')
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.error || '数据库统计暂时无法读取')
        return payload
      })
      .then((nextData) => {
        if (!cancelled) setData(nextData)
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message)
      })
    return () => { cancelled = true }
  }, [visible, refreshKey])

  const maxProvinceMessages = useMemo(
    () => Math.max(1, ...(data?.provinces ?? []).map((item) => item.messages)),
    [data],
  )

  if (!visible) return null

  return (
    <div className={`database-dashboard${standalone ? ' is-standalone' : ''}`} role={standalone ? undefined : 'dialog'} aria-modal={standalone ? undefined : 'true'} aria-label="SYSU 数据库可视化">
      {!standalone && <button className="database-dashboard-backdrop" type="button" aria-label="关闭数据库面板" onClick={onClose} />}
      <section className="database-dashboard-panel">
        <header>
          <div>
            <small>FLASK × SQLITE / LIVE DATABASE</small>
            <h2>数据控制台</h2>
          </div>
          <div className="database-dashboard-actions">
            <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>REFRESH</button>
            {standalone && <button type="button" onClick={onLogout}>LOG OUT</button>}
            <button type="button" aria-label={standalone ? '返回主站' : '关闭'} onClick={onClose}>{standalone ? '↙' : '×'}</button>
          </div>
        </header>

        {error && <p className="database-dashboard-error">{error}</p>}
        {!data && !error && <p className="database-dashboard-loading">LOADING DATABASE…</p>}

        {data && (
          <div className="database-dashboard-body">
            <div className="database-stat-grid">
              <article><small>USERS</small><strong>{data.counts.users}</strong><span>注册用户</span></article>
              <article><small>MESSAGES</small><strong>{data.counts.messages}</strong><span>全部寄语</span></article>
              <article><small>REAL DATA</small><strong>{data.counts.real_messages}</strong><span>真实寄语</span></article>
              <article><small>RESONANCE</small><strong>{data.counts.completion}%</strong><span>汇聚进度</span></article>
            </div>

            <div className="database-dashboard-grid">
              <article className="database-provinces-card">
                <div className="database-card-title"><b>省份信号</b><small>PROVINCE DISTRIBUTION</small></div>
                <div className="database-province-bars">
                  {(data.provinces.length ? data.provinces : [{ name: '暂无数据', users: 0, messages: 0 }]).slice(0, 10).map((item) => (
                    <div className="database-province-row" key={item.name}>
                      <span>{item.name}</span>
                      <i><em style={{ '--bar-width': `${(item.messages / maxProvinceMessages) * 100}%` }} /></i>
                      <b>{item.messages}</b>
                    </div>
                  ))}
                </div>
              </article>

              <article className="database-schema-card">
                <div className="database-card-title"><b>数据关系</b><small>USER 1 ─ 0..1 MESSAGE</small></div>
                <div className="database-schema-flow">
                  {data.schema.map((table, index) => (
                    <div className="database-table" key={table.name}>
                      <strong>{table.name.toUpperCase()}</strong>
                      {table.columns.map((column) => (
                        <span key={column.name}><b>{column.name}</b><small>{column.type}</small></span>
                      ))}
                      {index === 0 && <i aria-hidden="true">1 : 1</i>}
                    </div>
                  ))}
                </div>
                <footer>
                  <span>{data.database.engine}</span>
                  <span>{data.database.file}</span>
                  <span>{formatBytes(data.database.size_bytes)}</span>
                </footer>
              </article>
            </div>

            <article className="database-recent-card">
              <div className="database-card-title"><b>最近寄语</b><small>LATEST 12 RECORDS</small></div>
              <div className="database-record-table" role="table" aria-label="最近寄语记录">
                <div className="database-record-row is-heading" role="row">
                  <span>ID</span><span>USER</span><span>ORIGIN</span><span>MESSAGE</span><span>TYPE</span>
                </div>
                {data.recent_messages.map((message) => (
                  <div className="database-record-row" role="row" key={message.id}>
                    <span>{String(message.id).padStart(3, '0')}</span>
                    <span>{message.username}</span>
                    <span>{message.province || '—'} · {message.city || '—'}</span>
                    <span>{message.content}</span>
                    <span>{message.is_demo ? 'DEMO' : 'LIVE'}</span>
                  </div>
                ))}
                {!data.recent_messages.length && <p>等待第一条真实寄语写入数据库。</p>}
              </div>
            </article>
          </div>
        )}
      </section>
    </div>
  )
}
