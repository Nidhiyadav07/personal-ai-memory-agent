import { useState } from 'react'
import { api } from '../api'

const inputCls =
  'w-full rounded-md border border-rule bg-paper px-3 py-2 text-ink placeholder:text-muted'

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : form
      onAuth(await api(`/auth/${mode}`, { method: 'POST', json: body }))
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full grid place-items-center p-5">
      <div className="w-full max-w-sm rounded-xl border border-rule bg-panel p-7">
        <h1 className="font-serif text-2xl font-semibold">Study Memory</h1>
        <p className="mt-1 mb-5 text-muted">Your PDFs and chats, private to your account.</p>

        <div className="mb-4 flex gap-1 border-b border-rule" role="tablist">
          {[['login', 'Log in'], ['register', 'Create account']].map(([m, label]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); setError('') }}
              className={`-mb-px border-b-2 px-3 py-2 ${
                mode === m ? 'border-brand font-medium' : 'border-transparent text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="mb-1 block font-medium">Name</label>
              <input id="name" className={inputCls} value={form.name} onChange={set('name')} autoComplete="name" required />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block font-medium">Email</label>
            <input id="email" type="email" className={inputCls} value={form.email} onChange={set('email')} autoComplete="email" required />
          </div>
          <div>
            <label htmlFor="pw" className="mb-1 block font-medium">Password</label>
            <input
              id="pw" type="password" minLength={8} maxLength={72} className={inputCls}
              value={form.password} onChange={set('password')} required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {mode === 'register' && <p className="mt-1 text-sm text-muted">At least 8 characters.</p>}
          </div>
          <button
            disabled={loading}
            className="mt-2 w-full rounded-md bg-brand px-4 py-2.5 font-medium text-white disabled:opacity-60"
          >
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
          <p role="alert" className="min-h-5 text-sm text-danger">{error}</p>
        </form>
      </div>
    </div>
  )
}
