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
      
      const timeZone = 'America/New_York'

      // All values in New York time
      const dayOfWeek = now.toLocaleDateString('en-US', { timeZone, weekday: 'long' })

      const month = now.toLocaleDateString('en-US', { timeZone, month: 'long' })
      const day = now.toLocaleDateString('en-US', { timeZone, day: '2-digit' })
      const year = now.toLocaleDateString('en-US', { timeZone, year: 'numeric' })
      const date = `${month} ${day}, ${year}`

      const monthShort = now.toLocaleDateString('en-US', { timeZone, month: 'short' })
      const dayNum = now.toLocaleDateString('en-US', { timeZone, day: 'numeric' })
      const dateShort = `${monthShort} ${dayNum}, ${year}`

      const time = now.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

      const formatter = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
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

