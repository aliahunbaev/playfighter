'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Post {
  day: number
  title?: string
  date: string
}

interface HomeGridProps {
  postsByDay: Map<number, Post>
  currentDay: number
  totalDays: number
}

export default function HomeGrid({ postsByDay, currentDay, totalDays }: HomeGridProps) {
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
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-[3px] md:gap-[2px] mb-4" style={{ gridTemplateColumns: 'repeat(50, minmax(0, 1fr))' }}>
          {[...Array(totalDays)].map((_, i) => {
            const day = i + 1
            const post = postsByDay.get(day)
            const hasPost = !!post
            const isPast = day <= currentDay

            const commonClasses = `aspect-square transition-colors duration-300 relative ${
              isPast
                ? hasPost
                  ? 'bg-black dark:bg-white hover:opacity-80 cursor-pointer'
                  : 'bg-black dark:bg-white'
                : 'bg-black/5 dark:bg-white/5'
            }`

            if (isPast && hasPost) {
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
          className="fixed pointer-events-none z-50 bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded shadow-lg whitespace-nowrap"
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
          <div className="font-mono text-[10px] text-white/70 dark:text-black/70 uppercase tracking-wider mt-1">
            {formatDate(postsByDay.get(hoveredDay)!.date)}
          </div>
        </div>
      )}
    </>
  )
}

