import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

// "[Page 3]" in an answer becomes a highlighted "p. 3" chip
function Answer({ text }) {
  const parts = text.split(/\[?Page (\d+)\]?/g)
  return parts.map((p, i) =>
    i % 2 ? (
      <span key={i} className="rounded-sm bg-hl px-1.5 py-px font-sans text-xs font-medium text-ink">
        p. {p}
      </span>
    ) : (
      p
    )
  )
}

export default function Chat({ sid, user, onSent }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

 useEffect(() => {
  let live = true

  async function loadMessages() {
    try {
      const m = await api(`/sessions/${sid}`)
      if (live) {
        setMessages(m)
      }
    } catch (err) {
      console.error('Failed to load session:', err)
    } finally {
      if (live) {
        setLoaded(true)
      }
    }
  }

  loadMessages()

  return () => {
    live = false
  }
}, [sid])


useEffect(() => {
  if (endRef.current) {
    endRef.current.scrollIntoView({ block: 'end' })
  }
}, [messages, busy])


  const send = async (e) => {
    e?.preventDefault()
    const question = input.trim()
    if (!question || busy) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: question }])
    setBusy(true)
    try {
      const r = await api('/chat', { method: 'POST', json: { session_id: sid, question } })
      setMessages((m) => [...m, { role: 'assistant', content: r.answer }])
      onSent()
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: err.message, error: true }])
    }
    setBusy(false)
    inputRef.current?.focus()
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) send(e)
  }

  return (
    <main className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-auto px-5 pt-14 pb-6 md:pt-7">
        {loaded && messages.length === 0 && (
          <div className="mx-auto mt-[12vh] max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold">
              Hi {user.name.split(' ')[0]}. What are you studying?
            </h2>
            <p className="mt-2 text-muted">
              Upload a PDF, then ask questions. Answers cite the page they came from.
            </p>
          </div>
        )}

        <div className="mx-auto grid max-w-2xl gap-5">
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="max-w-[85%] justify-self-end whitespace-pre-wrap break-words rounded-xl rounded-br-sm bg-brand px-3.5 py-2.5 text-white dark:text-paper">
                {m.content}
              </div>
            ) : (
              <div
                key={i}
                className={`whitespace-pre-wrap break-words font-serif text-[17px] leading-relaxed ${m.error ? 'text-danger' : ''}`}
              >
                <Answer text={m.content} />
              </div>
            )
          )}
          {busy && <p className="animate-pulse text-muted">Reading your notes…</p>}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={send} className="px-5 pb-5">
        <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-xl border border-rule bg-panel p-2 focus-within:border-brand">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
            onKeyDown={onKey}
            placeholder="Ask about your PDFs"
            aria-label="Your question"
            className="max-h-40 flex-1 resize-none bg-transparent p-1.5 outline-none"
          />
          <button
            disabled={busy || !input.trim()}
            className="rounded-md bg-brand px-4 py-2 font-medium text-white disabled:opacity-50 dark:text-paper"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  )
}
