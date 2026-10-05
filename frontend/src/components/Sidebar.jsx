import { useRef, useState } from 'react'
import { api } from '../api'

export default function Sidebar({ user, sessions, activeId, open, onNew, onSelect, onDelete, onLogout }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(null)
  const [toast, setToast] = useState('')

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const upload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    setUploading(file.name)
    try {
      const r = await api('/documents/upload', { method: 'POST', body: fd })
      flash(`${r.filename}: ${r.pages} pages ready`)
    } catch (err) {
      flash(err.message)
    }
    setUploading(null)
    e.target.value = ''
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-10 flex w-[75%] max-w-72 flex-col border-r border-rule bg-panel transition-transform md:static md:w-auto md:max-w-none md:translate-x-0 ${
        open ? 'translate-x-0 shadow-[0_0_0_100vmax_rgba(0,0,0,.35)]' : '-translate-x-full'
      }`}
    >
      <div className="grid gap-2 p-3.5 pt-14 md:pt-3.5">
        <button onClick={onNew} className="rounded-md bg-brand px-3 py-2 font-medium text-white">
          New chat
        </button>
        <button
          onClick={() => fileRef.current.click()}
          disabled={!!uploading}
          className="truncate rounded-md border border-rule px-3 py-2 text-left hover:border-brand disabled:opacity-60"
        >
          {uploading ? `Uploading ${uploading}…` : 'Upload a PDF'}
        </button>
        <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={upload} />
        {toast && <p role="status" className="rounded-md bg-paper px-2 py-1.5 text-sm text-muted">{toast}</p>}
      </div>

      <nav className="flex-1 overflow-auto px-2" aria-label="Your chats">
        {sessions.length === 0 && <p className="px-2 py-1.5 text-sm text-muted">No chats yet.</p>}
        {sessions.map((s) => (
          <div
            key={s.session_id}
            className={`group flex items-center rounded-md ${s.session_id === activeId ? 'bg-paper' : ''}`}
          >
            <button
              onClick={() => onSelect(s.session_id)}
              className="min-w-0 flex-1 truncate p-2 text-left"
            >
              {s.title}
            </button>
            <button
              aria-label={`Delete chat: ${s.title}`}
              onClick={() => confirm('Delete this chat?') && onDelete(s.session_id)}
              className="px-2 py-1.5 text-muted opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-rule px-3.5 py-3">
        <span className="truncate text-sm text-muted">{user.name}</span>
        <button onClick={onLogout} className="p-1 text-brand">Log out</button>
      </div>
    </aside>
  )
}
