'use client'

import { useState, useEffect } from 'react'

export default function WritePage() {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [status, setStatus] = useState<'idle' | 'posting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [postedDay, setPostedDay] = useState<number | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('pf-auth')
    if (saved) {
      setPassword(saved)
      setAuthenticated(true)
    }
  }, [])

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
      <div className="flex items-center justify-center min-h-[60vh]">
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
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
    <div className="min-h-[60vh] flex flex-col">
      {/* Optional title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="title (optional)"
        className="w-full bg-transparent font-sans text-2xl font-light focus:outline-none mb-8 placeholder:text-black/20 dark:placeholder:text-[#e5e5e5]/20"
      />

      {/* Main writing area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
        placeholder="write."
        className="w-full bg-transparent font-sans text-base leading-[1.8] font-light focus:outline-none resize-none flex-1 min-h-[40vh] placeholder:text-black/20 dark:placeholder:text-[#e5e5e5]/20"
      />

      {/* Bottom bar */}
      <div className="flex items-center justify-between pt-8 mt-auto">
        <div className="font-mono text-xs text-black/30 dark:text-[#e5e5e5]/30 tabular-nums">
          {content.trim().split(/\s+/).filter(Boolean).length} words
        </div>

        <div className="flex items-center gap-4">
          {status === 'error' && (
            <span className="font-mono text-xs text-red-500">{errorMsg}</span>
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
