'use client'

import { useState, useEffect } from 'react'

export default function LiveDateTime() {
  const [dateTime, setDateTime] = useState({
    location: 'Brooklyn, NY',
    dayOfWeek: '',
    date: '',
    dateShort: '',
    time: '',
    timezone: 'EST'
  })

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      
      // Get day of week
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' })
      
      // Get formatted date: "December 05, 2025"
      const month = now.toLocaleDateString('en-US', { month: 'long' })
      const day = now.getDate().toString().padStart(2, '0')
      const year = now.getFullYear()
      const date = `${month} ${day}, ${year}`
      
      // Get short date for mobile: "Dec 5, 2025"
      const monthShort = now.toLocaleDateString('en-US', { month: 'short' })
      const dateShort = `${monthShort} ${now.getDate()}, ${year}`
      
      // Get time in 24-hour format: "17:36"
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')
      const time = `${hours}:${minutes}:${seconds}`
      
      // Get timezone abbreviation using Intl
      const timeZone = 'America/New_York' // Brooklyn, NY timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'short'
      })
      const parts = formatter.formatToParts(now)
      const timezone = parts.find(part => part.type === 'timeZoneName')?.value || 'EST'
      
      setDateTime({
        location: 'Brooklyn, NY',
        dayOfWeek,
        date,
        dateShort,
        time,
        timezone
      })
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  return (
    <p className="text-xs font-mono text-black/40 dark:text-[#e5e5e5]/40 uppercase tracking-wider mt-4">
      <span className="hidden md:inline">{dateTime.location} | {dateTime.dayOfWeek}, {dateTime.date} | {dateTime.time} {dateTime.timezone}</span>
      <span className="md:hidden">{dateTime.location} | {dateTime.dateShort} | {dateTime.time} {dateTime.timezone}</span>
    </p>
  )
}

