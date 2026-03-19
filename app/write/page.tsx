'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import DarkModeToggle from '../components/DarkModeToggle'

const TIMER_STEPS = [5, 10, 15, 20, 25, 30, 35, 40, 45] // minutes

export default function WritePage() {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [status, setStatus] = useState<'idle' | 'posting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [postedDay, setPostedDay] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus timer state
  const [timerMinutes, setTimerMinutes] = useState(0) // 0 = off, otherwise minutes selected
  const [timerSeconds, setTimerSeconds] = useState(0) // countdown in seconds
  const [timerActive, setTimerActive] = useState(false)
  const [barVisible, setBarVisible] = useState(true)
  const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Scroll on textarea to set timer duration (only when timer is not active)
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta || timerActive) return

    const handleWheel = (e: WheelEvent) => {
      // Only intercept if holding shift (to not break normal scrolling)
      if (!e.shiftKey) return
      e.preventDefault()

      setTimerMinutes(prev => {
        const currentIdx = TIMER_STEPS.indexOf(prev)
        if (e.deltaY > 0) {
          // Scroll down = increase
          if (currentIdx < TIMER_STEPS.length - 1) return TIMER_STEPS[currentIdx + 1]
          if (currentIdx === -1) return TIMER_STEPS[0]
          return prev
        } else {
          // Scroll up = decrease
          if (currentIdx > 0) return TIMER_STEPS[currentIdx - 1]
          if (currentIdx === 0) return 0
          return prev
        }
      })
    }

    ta.addEventListener('wheel', handleWheel, { passive: false })
    return () => ta.removeEventListener('wheel', handleWheel)
  }, [timerActive])

  // Start timer
  const startTimer = useCallback(() => {
    if (timerMinutes === 0) return
    setTimerSeconds(timerMinutes * 60)
    setTimerActive(true)
    setBarVisible(false)
  }, [timerMinutes])

  // Countdown
  useEffect(() => {
    if (!timerActive || timerSeconds <= 0) return
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setTimerActive(false)
          setBarVisible(true)
          setTimerMinutes(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerActive, timerSeconds])

  // Mouse movement brings bar back during focus mode
  useEffect(() => {
    if (!timerActive) return

    const handleMouseMove = () => {
      setBarVisible(true)
      if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current)
      cursorTimeoutRef.current = setTimeout(() => {
        if (timerActive) setBarVisible(false)
      }, 2000) // hide again after 2s of no movement
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current)
    }
  }, [timerActive])

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

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
      {/* Title — same size as body */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="title (optional)"
        className="w-full bg-transparent font-sans text-base leading-[1.8] font-light focus:outline-none mb-4 placeholder:text-black/20 dark:placeholder:text-[#e5e5e5]/20"
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

      {/* Fixed bottom bar — fades during focus mode */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-cream dark:bg-[#0a0a0a] border-t border-black/5 dark:border-[#e5e5e5]/5 z-40 transition-opacity duration-500"
        style={{ opacity: barVisible ? 1 : 0, pointerEvents: barVisible ? 'auto' : 'none' }}
      >
        <div className="max-w-reading mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DarkModeToggle />

            {/* Focus timer */}
            {!timerActive && timerMinutes > 0 && (
              <button
                onClick={startTimer}
                className="font-mono text-xs text-black/40 dark:text-[#e5e5e5]/40 hover:text-black dark:hover:text-[#e5e5e5] transition-colors uppercase tracking-wider"
              >
                {timerMinutes}:00 — start
              </button>
            )}
            {!timerActive && timerMinutes === 0 && (
              <span className="font-mono text-xs text-black/20 dark:text-[#e5e5e5]/20 uppercase tracking-wider">
                shift + scroll to set timer
              </span>
            )}
            {timerActive && (
              <button
                onClick={() => { setTimerActive(false); setBarVisible(true); setTimerMinutes(0); setTimerSeconds(0) }}
                className="font-mono text-xs text-black/40 dark:text-[#e5e5e5]/40 hover:text-black dark:hover:text-[#e5e5e5] transition-colors tabular-nums"
              >
                {formatTimer(timerSeconds)}
              </button>
            )}
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
    </div>
  )
}
