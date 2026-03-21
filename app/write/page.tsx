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
  const [timerEl, setTimerEl] = useState<HTMLDivElement | null>(null)
  const timerRef = useCallback((el: HTMLDivElement | null) => { setTimerEl(el) }, [])

  // Focus timer state
  const [timerMinutes, setTimerMinutes] = useState(15) // default 15 min
  const [timerSeconds, setTimerSeconds] = useState(0)
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

  // Scroll on timer element to change duration (accumulate delta for natural feel)
  const scrollAccumRef = useRef(0)
  const SCROLL_THRESHOLD = 80
  useEffect(() => {
    if (!timerEl || timerActive) return
    scrollAccumRef.current = 0
    const el = timerEl

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      scrollAccumRef.current += e.deltaY

      if (Math.abs(scrollAccumRef.current) >= SCROLL_THRESHOLD) {
        const direction = scrollAccumRef.current > 0 ? 'down' : 'up'
        scrollAccumRef.current = 0

        setTimerMinutes(prev => {
          const currentIdx = TIMER_STEPS.indexOf(prev)
          if (direction === 'up') {
            if (currentIdx < TIMER_STEPS.length - 1) return TIMER_STEPS[currentIdx + 1]
            if (currentIdx === -1) return TIMER_STEPS[0]
            return prev
          } else {
            if (currentIdx > 0) return TIMER_STEPS[currentIdx - 1]
            return prev
          }
        })
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [timerEl, timerActive])

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

  // Mouse movement brings bar back during focus mode; hide again after 2s idle
  useEffect(() => {
    if (!timerActive) return

    const handleMouseMove = () => {
      setBarVisible(true)
      if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current)
      cursorTimeoutRef.current = setTimeout(() => {
        setBarVisible(false)
      }, 2000)
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

  // Hide bar when typing (only during focus mode)
  const handleTyping = useCallback(() => {
    if (timerActive) {
      setBarVisible(false)
      if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current)
    }
  }, [timerActive])

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
        body: JSON.stringify({ content, title: title.trim() || undefined, password, clientDate: new Date().toLocaleDateString('en-CA') }),
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
    <div className="pb-[50vh]">
      {/* Title — same size as body */}
      <input
        type="text"
        value={title}
        onChange={(e) => { setTitle(e.target.value); handleTyping() }}
        placeholder="title (optional)"
        className="w-full bg-transparent font-sans text-base leading-[1.8] font-light focus:outline-none mb-4 placeholder:text-black/20 dark:placeholder:text-[#e5e5e5]/20"
      />

      {/* Main writing area — auto-expands, no scroll */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => { setContent(e.target.value); handleTyping() }}
        autoFocus
        placeholder="write."
        className="w-full bg-transparent font-sans text-base leading-[1.8] font-light focus:outline-none resize-none overflow-hidden placeholder:text-black/20 dark:placeholder:text-[#e5e5e5]/20"
        rows={1}
      />

      {/* Fixed bottom bar — transparent, edge-to-edge */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 transition-opacity duration-300 px-6 py-4"
        style={{ opacity: barVisible ? 1 : 0, pointerEvents: barVisible ? 'auto' : 'none' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DarkModeToggle />

            {/* Focus timer — hover and scroll to set, click to start/stop */}
            <div
              ref={timerRef}
              onClick={timerActive ? () => { setTimerActive(false); setBarVisible(true); setTimerMinutes(15); setTimerSeconds(0) } : startTimer}
              className="font-mono text-xs text-black/30 dark:text-[#e5e5e5]/30 hover:text-black dark:hover:text-[#e5e5e5] transition-colors tabular-nums cursor-pointer select-none py-2 px-1"
              title={timerActive ? 'Click to stop' : 'Scroll to adjust, click to start'}
            >
              {timerActive ? formatTimer(timerSeconds) : `${timerMinutes}:00`}
            </div>
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
