'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface PostNavigationProps {
  prev: number | null
  next: number | null
  children: ReactNode
}

export default function PostNavigation({ prev, next, children }: PostNavigationProps) {
  const router = useRouter()
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is typing in an input, textarea, or has text selected
      const target = e.target as HTMLElement
      const selection = window.getSelection()?.toString()
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        (selection && selection.length > 0)
      ) {
        return
      }

      if (e.key === 'ArrowLeft' && next !== null) {
        router.push(`/day/${next}`)
      } else if (e.key === 'ArrowRight' && prev !== null) {
        router.push(`/day/${prev}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prev, next, router])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && next !== null) {
      router.push(`/day/${next}`)
    } else if (isRightSwipe && prev !== null) {
      router.push(`/day/${prev}`)
    }

    // Reset touch positions
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="touch-pan-y"
    >
      {children}
    </div>
  )
}

