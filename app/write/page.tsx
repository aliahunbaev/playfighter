'use client'

import { useState, useEffect, useRef } from 'react'

export default function WritePage() {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [status, setStatus] = useState<'idle' | 'posting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [postedDay, setPostedDay] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('pf-auth')
    if (saved) {
      setPassword(saved)
      setAuthenticated(true)
    }
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = ta.scrollHeight + 'px'
    }
  }, [content])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim()) {
      sessionStorage.setItem('pf-auth', password)
      setAuthenticated(true)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setStatus('posting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title: title.trim() || undefined, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong')
        if (res.status === 401) {
          sessionStorage.removeItem('pf-auth')
          setAuthenticated(false)
        }
        return
      }

      setStatus('success')
      setPostedDay(data.day)
      setContent('')
      setTitle('')
    } catch {
      setStatus('error')
      setErrorMsg('Network error')
    }
  }

  // Password gate
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <form onSubmit={handleAuth} className="w-full max-w-xs">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoFocus
            className="w-full bg-transparent border-b border-black/20 dark:border-[#e5e5e5]/20 py-3 font-sans text-base font-light focus:outline-none focus:border-black dark:focus:border-[#e5e5e5] transition-colors text-center placeholder:text-black/30 dark:placeholder:text-[#e5e5e5]/30"
          />
        </form>
      </div>
    )
  }

  // Success state
  if (status === 'success' && postedDay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
        <div className="font-mono text-sm text-black/40 dark:text-[#e5e5e5]/40 uppercase tracking-wider">
          day {postedDay} posted
        </div>
        <div className="flex gap-6">
          <a
            href={`/day/${postedDay}`}
            className="font-mono text-sm underline underline-offset-2 hover:opacity-60 transition-opacity"
          >
            view
          </a>
          <button
            onClick={() => { setStatus('idle'); setPostedDay(null) }}
            className="font-mono text-sm text-black/40 dark:text-[#e5e5e5]/40 hover:text-black dark:hover:text-[#e5e5e5] transition-colors"
          >
            write another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {/* Optional title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="title (optional)"
        className="w-full bg-transparent font-sans text-2xl font-light focus:outline-none mb-8 placeholder:text-black/20 dark:placeholder:text-[#e5e5e5]/20"
      />

      {/* Main writing area — auto-expands, no scroll */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
        placeholder="write."
        className="w-full bg-transparent font-sans text-base leading-[1.8] font-light focus:outline-none resize-none overflow-hidden placeholder:text-black/20 dark:placeholder:text-[#e5e5e5]/20"
        rows={1}
      />

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream dark:bg-[#0a0a0a] border-t border-black/5 dark:border-[#e5e5e5]/5 z-40">
        <div className="max-w-reading mx-auto px-6 py-4 flex items-center justify-end">
          {status === 'error' && (
            <span className="font-mono text-xs text-red-500 mr-4">{errorMsg}</span>
          )}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || status === 'posting'}
            className="font-mono text-sm uppercase tracking-wider hover:opacity-60 transition-opacity disabled:opacity-20 disabled:cursor-not-allowed"
          >
            {status === 'posting' ? 'posting...' : 'post'}
          </button>
        </div>
      </div>
    </div>
  )
}
