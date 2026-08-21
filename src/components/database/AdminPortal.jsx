import { useEffect, useState } from 'react'
import AuthModal from '../auth/AuthModal.jsx'
import DatabaseDashboard from './DatabaseDashboard.jsx'
import { clearExperienceProgress } from '../../utils/experienceProgress.js'

async function postWithCsrf(path) {
  const tokenResponse = await fetch('/api/csrf-token')
  const { csrf_token: csrfToken } = await tokenResponse.json()
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
    body: '{}',
  })
}

export default function AdminPortal() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [authVisible, setAuthVisible] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me')
      .then((response) => response.ok ? response.json() : { user: null })
      .then((data) => {
        if (cancelled) return
        setUser(data.user ?? null)
        setAuthVisible(!data.user?.is_admin)
      })
      .catch(() => {
        if (!cancelled) setAuthVisible(true)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => { cancelled = true }
  }, [])

  async function logout() {
    await postWithCsrf('/api/auth/logout')
    clearExperienceProgress()
    window.location.replace('/')
  }

  return (
    <main className="admin-portal">
      {!ready && <div className="admin-portal-loading">SYSU ADMIN · VERIFYING SESSION…</div>}
      {ready && !user?.is_admin && (
        <section className="admin-portal-gate">
          <img src="/branding/sysu-emblem.png" alt="中山大学校徽" />
          <small>FLASK × SQLITE / RESTRICTED ACCESS</small>
          <h1>管理员数据控制台</h1>
          <p>此页面与主站相互独立，仅管理员账号可以进入。</p>
          <button type="button" onClick={() => setAuthVisible(true)}>ADMIN LOG IN</button>
          <a href="/">返回中山大学 SYSU 主站</a>
        </section>
      )}
      {ready && user?.is_admin && (
        <DatabaseDashboard
          visible
          standalone
          onClose={() => { window.location.href = '/' }}
          onLogout={logout}
        />
      )}
      <AuthModal
        visible={authVisible}
        user={null}
        onAuthenticated={(nextUser) => {
          setUser(nextUser)
          setAuthVisible(!nextUser?.is_admin)
        }}
        onLogout={logout}
        onClose={() => setAuthVisible(false)}
      />
    </main>
  )
}
