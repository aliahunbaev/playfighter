'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Post {
  day: number
  title?: string
  date: string
}

interface GridProps {
  postsByDay: Map<number, Post>
  currentDay?: number
  totalDays: number
}

export default function Grid({ postsByDay, currentDay, totalDays }: GridProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)

  const handleMouseMove = (e: React.MouseEvent, day: number) => {
    if (postsByDay.has(day)) {
      setHoveredDay(day)
      setTooltipPosition({ x: e.clientX, y: e.clientY })
      setShowTooltip(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (showTooltip && hoveredDay) {
        setTooltipPosition({ x: e.clientX, y: e.clientY })
      }
    }

    if (showTooltip) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [showTooltip, hoveredDay])

  const handleMouseLeave = () => {
    setShowTooltip(false)
    setHoveredDay(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).replace(',', '').toUpperCase()
  }

  return (
    <>
      <div className="w-full">
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(auto-fill, 10px)', justifyContent: 'start' }}>
          {[...Array(totalDays)].map((_, i) => {
            const day = i + 1
            const post = postsByDay.get(day)
            const hasPost = !!post

            const commonClasses = `w-[10px] h-[10px] transition-colors duration-300 relative flex-shrink-0 ${
              hasPost
                ? 'bg-black dark:bg-[#e5e5e5] hover:opacity-80 cursor-pointer'
                : 'bg-black/5 dark:bg-white/10'
            }`

            if (hasPost) {
              return (
                <Link
                  key={day}
                  href={`/day/${day}`}
                  className={commonClasses}
                  onMouseMove={(e) => handleMouseMove(e, day)}
                  onMouseLeave={handleMouseLeave}
                  title={`Day ${day}: ${post.title || 'Entry ' + day}`}
                />
              )
            }

            return (
              <div
                key={day}
                className={commonClasses}
                title={`Day ${day}`}
              />
            )
          })}
        </div>
      </div>

      {/* Cursor-following tooltip */}
      {showTooltip && hoveredDay && postsByDay.has(hoveredDay) && (
        <div
          className="fixed pointer-events-none z-50 bg-black dark:bg-[#1a1a1a] text-white dark:text-[#e5e5e5] px-3 py-2 rounded shadow-lg whitespace-nowrap"
          style={{
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y - 15}px`,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-mono text-xs font-bold tabular-nums">
            {hoveredDay.toString().padStart(4, '0')}
          </div>
          {postsByDay.get(hoveredDay)?.title && (
            <div className="font-sans text-xs font-light mt-1 max-w-[200px] truncate" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              {postsByDay.get(hoveredDay)?.title}
            </div>
          )}
          <div className="font-mono text-[10px] text-white/70 dark:text-[#e5e5e5]/70 uppercase tracking-wider mt-1">
            {formatDate(postsByDay.get(hoveredDay)!.date)}
          </div>
        </div>
      )}
    </>
  )
}

