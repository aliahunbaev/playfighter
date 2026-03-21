import { NextResponse } from 'next/server'

const START_DATE_STRING = '2025-12-06'

function calculateDayNumber(dateString: string): number {
  const [startYear, startMonth, startDay] = START_DATE_STRING.split('-').map(Number)
  const [currentYear, currentMonth, currentDay] = dateString.split('-').map(Number)
  const start = new Date(startYear, startMonth - 1, startDay)
  const current = new Date(currentYear, currentMonth - 1, currentDay)
  const diffTime = current.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diffDays)
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export async function POST(request: Request) {
  const { content, title, password, clientDate } = await request.json()

  if (!password || password !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'No content' }, { status: 400 })
  }

  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO || 'aliahunbaev/playfighter'

  if (!token) {
    return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 })
  }

  // Use client's local date if provided, fall back to server EST
  const dateString = clientDate || new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const day = calculateDayNumber(dateString)
  const date = formatDate(dateString)
  const path = `content/posts/day-${day}.md`

  // Check if file already exists
  const checkRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (checkRes.ok) {
    return NextResponse.json({ error: `Day ${day} already has an entry` }, { status: 409 })
  }

  // Build markdown content
  const frontmatter = title
    ? `---\ndate: "${date}"\ntitle: "${title}"\n---`
    : `---\ndate: "${date}"\n---`
  const fileContent = `${frontmatter}\n\n${content.trim()}\n`
  const encoded = Buffer.from(fileContent).toString('base64')

  // Create file via GitHub API
  const createRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `day ${day}`,
      content: encoded,
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    return NextResponse.json({ error: 'Failed to create post', details: err }, { status: 500 })
  }

  return NextResponse.json({ success: true, day })
}
