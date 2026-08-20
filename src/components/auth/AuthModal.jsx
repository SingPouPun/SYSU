import { useEffect, useState } from 'react'

const PROVINCES = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省',
  '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省',
  '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省',
  '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区',
  '香港特别行政区', '澳门特别行政区', '台湾省',
]

async function readJson(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const fallback = response.status >= 500
      ? `服务器接口暂时不可用（HTTP ${response.status}），请检查云端数据库与函数日志`
      : `请求失败（HTTP ${response.status}）`
    throw new Error(data.error || fallback)
  }
  return data
}

async function fetchApi(path, options) {
  try {
    return await fetch(path, options)
  } catch {
    throw new Error('无法连接后端服务；本地运行请先启动 Flask，线上请检查部署状态')
  }
}

export default function AuthModal({
  visible,
  user,
  onAuthenticated,
  onClose,
  openAdminOnSuccess = false,
}) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '', province: '广东省', city: '' })
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (visible) setStatus('')
  }, [visible, mode])

  if (!visible) return null

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function requestWithCsrf(path, body) {
    const tokenResponse = await fetchApi('/api/csrf-token')
    const { csrf_token: csrfToken } = await readJson(tokenResponse)
    return readJson(await fetchApi(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify(body),
    }))
  }

  async function submit(event) {
    event.preventDefault()
    const pendingAdminWindow = mode === 'login' && openAdminOnSuccess
      ? window.open('', 'sysu-admin-console')
      : null
    if (pendingAdminWindow) {
      pendingAdminWindow.document.title = 'SYSU ADMIN / CONNECTING'
      pendingAdminWindow.document.body.innerHTML = '<main style="display:grid;min-height:100vh;place-items:center;margin:0;background:#151616;color:#f2f1e9;font:900 18px system-ui">SYSU ADMIN · CONNECTING…</main>'
    }
    setBusy(true)
    setStatus('')
    try {
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { username: form.username, password: form.password }
        : form
      const data = await requestWithCsrf(path, body)
      onAuthenticated(data.user)
      if (pendingAdminWindow) {
        if (data.user?.is_admin) pendingAdminWindow.location.replace('/admin')
        else pendingAdminWindow.close()
      } else if (openAdminOnSuccess && data.user?.is_admin) {
        window.open('/admin', '_blank', 'noopener')
      }
    } catch (error) {
      pendingAdminWindow?.close()
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="account-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className={`account-modal${user ? ' account-modal--profile' : ''}`} role="dialog" aria-modal="true" aria-label="中山大学账号入口">
        <button className="account-modal-close" type="button" onClick={onClose} aria-label="关闭">×</button>

        {user ? (
          <div className="account-profile-card">
            <strong>{user.username}</strong>
            <p>{user.province || '未填写省份'} {user.city || '未填写城市'}</p>
          </div>
        ) : (
          <>
            <div className="account-modal-brand">
              <img src="/branding/sysu-emblem.png" alt="" />
              <span>SYSU / CAMPUS ID</span>
              <b>你好，中大</b>
            </div>

            <div className="account-mode-tabs" role="tablist" aria-label="登录或注册">
              <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')}>登录</button>
              <button type="button" className={mode === 'signup' ? 'is-active' : ''} onClick={() => setMode('signup')}>注册</button>
            </div>

            <form className="account-form" onSubmit={submit}>
              <label>
                <span>USERNAME / 用户名</span>
                <input value={form.username} onChange={update('username')} minLength="3" maxLength="20" autoComplete="username" placeholder="请输入用户名" required />
              </label>
              <label>
                <span>PASSWORD / 密码</span>
                <input type="password" value={form.password} onChange={update('password')} minLength="8" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="请输入密码" required />
              </label>

              {mode === 'signup' && (
                <div className="account-location-fields">
                  <label>
                    <span>PROVINCE / 省份</span>
                    <select value={form.province} onChange={update('province')} required>
                      {PROVINCES.map((province) => <option key={province}>{province}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>CITY / 城市</span>
                    <input value={form.city} onChange={update('city')} maxLength="30" placeholder="请输入城市" required />
                  </label>
                </div>
              )}

              <p className={`account-form-status${status ? ' has-error' : ''}`} aria-live="polite">
                {status || (mode === 'signup' ? 'CREATE YOUR SYSU CAMPUS ID' : 'RETURN TO THE CAMPUS ARCHIVE')}
              </p>
              <button className="account-submit" type="submit" disabled={busy}>
                {busy ? '连接中…' : mode === 'login' ? '登录' : '注册'}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
