import { useCallback, useEffect, useState } from 'react'
import { api, getToken, setToken, setUnauthorizedHandler } from './api'
import AuthScreen from './components/AuthScreen'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'

const newId = () => crypto.randomUUID()

export default function App() {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(!!getToken())
  const [sid, setSid] = useState(() => localStorage.getItem('sid') || newId())
  const [sessions, setSessions] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem('sid')
    setUser(null)
    setSessions([])
  }, [])

  useEffect(() => setUnauthorizedHandler(logout), [logout])

  useEffect(() => {
    if (!getToken()) return
    api('/auth/me').then(setUser).catch(() => {}).finally(() => setBooting(false))
  }, [])

  useEffect(() => localStorage.setItem('sid', sid), [sid])

  const refreshSessions = useCallback(
    () => api('/sessions').then(setSessions).catch(() => {}),
    []
  )
  useEffect(() => {
    if (user) refreshSessions()
  }, [user, refreshSessions])

  const handleAuth = ({ access_token, user }) => {
    setToken(access_token)
    setSid(newId())
    setUser(user)
  }

  const select = (id) => { setSid(id); setMenuOpen(false) }

  const remove = async (id) => {
    await api(`/sessions/${id}`, { method: 'DELETE' })
    if (id === sid) setSid(newId())
    refreshSessions()
  }

  if (booting) return null
  if (!user) return <AuthScreen onAuth={handleAuth} />

  return (
    <div className="h-full md:grid md:grid-cols-[270px_1fr]">
      <button
        className="md:hidden fixed top-2.5 left-2.5 z-20 rounded-md border border-rule bg-panel px-3 py-1.5 text-sm"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle chat list"
      >
        Chats
      </button>
      <Sidebar
        user={user}
        sessions={sessions}
        activeId={sid}
        open={menuOpen}
        onNew={() => select(newId())}
        onSelect={select}
        onDelete={remove}
        onLogout={logout}
      />
      <Chat key={sid} sid={sid} user={user} onSent={refreshSessions} />
    </div>
  )
}
