import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface Post {
  day: number
  entry?: number // Entry number within the day (1, 2, etc.). If undefined, it's the default entry (backward compatible)
  date: string
  title?: string
  content: string
  rawContent: string
}

// Project start date: December 6, 2025 (today)
// We'll use EST/EDT timezone (America/New_York) for date calculations
// Day counter starts today and increments at midnight EST
export const START_DATE_STRING = '2025-12-06' // YYYY-MM-DD format
export const TOTAL_DAYS = 1000

export function calculateDayNumber(date: Date): number {
  // Get the date in EST/EDT timezone (Brooklyn, NY)
  const estDateString = date.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }) // Returns YYYY-MM-DD
  const startDateString = START_DATE_STRING
  
  // Parse dates as YYYY-MM-DD strings and compare
  const [startYear, startMonth, startDay] = startDateString.split('-').map(Number)
  const [currentYear, currentMonth, currentDay] = estDateString.split('-').map(Number)
  
  // Create date objects at midnight in local time for calculation
  const start = new Date(startYear, startMonth - 1, startDay)
  const current = new Date(currentYear, currentMonth - 1, currentDay)
  
  // Calculate difference in days
  const diffTime = current.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diffDays) // Ensure minimum of 1
}

export function getCurrentDay(): number {
  return calculateDayNumber(new Date())
}

export async function getPostByDay(day: number, entry?: number): Promise<Post | null> {
  try {
    // If entry is specified, look for day-X-Y.md, otherwise try day-X.md first (backward compatible)
    let fileName: string
    if (entry !== undefined) {
      fileName = `day-${day}-${entry}.md`
    } else {
      // Try default file first (day-X.md), then fall back to entry 1 if it doesn't exist
      const defaultFile = `day-${day}.md`
      const defaultPath = path.join(postsDirectory, defaultFile)
      if (fs.existsSync(defaultPath)) {
        fileName = defaultFile
      } else {
        fileName = `day-${day}-1.md`
      }
    }

    const fullPath = path.join(postsDirectory, fileName)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    // Process markdown to HTML
    const processedContent = await remark().use(html).process(content)
    const contentHtml = processedContent.toString()

    // Parse entry number from filename if not explicitly provided
    let parsedEntry: number | undefined = entry
    if (parsedEntry === undefined) {
      const match = fileName.match(/^day-\d+-(\d+)\.md$/)
      if (match) {
        parsedEntry = parseInt(match[1])
      }
      // If it's day-X.md format, entry is undefined (backward compatible)
    }

    return {
      day,
      entry: parsedEntry,
      date: data.date || '',
      title: data.title,
      content: contentHtml,
      rawContent: content,
    }
  } catch (error) {
    console.error(`Error reading post for day ${day}, entry ${entry}:`, error)
    return null
  }
}

export function getAllPosts(): Post[] {
  try {
    // Check if directory exists
    if (!fs.existsSync(postsDirectory)) {
      return []
    }

    const fileNames = fs.readdirSync(postsDirectory)
    const posts = fileNames
      .filter(fileName => fileName.endsWith('.md') && fileName.startsWith('day-'))
      .map(fileName => {
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)

        // Extract day and entry from filename
        // Supports: day-X.md (backward compatible, entry undefined)
        //          day-X-Y.md (entry Y)
        const match = fileName.match(/^day-(\d+)(?:-(\d+))?\.md$/)
        if (!match) {
          return null
        }

        const day = parseInt(match[1])
        const entry = match[2] ? parseInt(match[2]) : undefined

        return {
          day,
          entry,
          date: data.date || '',
          title: data.title,
          content: '',
          rawContent: content,
        }
      })
      .filter((post): post is Post => post !== null)
      .sort((a, b) => {
        // Sort by day (newest first), then by entry (ascending)
        if (b.day !== a.day) {
          return b.day - a.day
        }
        const aEntry = a.entry ?? 0
        const bEntry = b.entry ?? 0
        return aEntry - bEntry
      })

    return posts
  } catch (error) {
    console.error('Error reading posts:', error)
    return []
  }
}

// Get all entries for a specific day
export function getEntriesForDay(day: number): Post[] {
  const allPosts = getAllPosts()
  return allPosts.filter(post => post.day === day)
}

// Get the latest entry (considering all entries across all days)
export function getLatestEntry(): Post | null {
  const posts = getAllPosts()
  return posts.length > 0 ? posts[0] : null
}

export function getLatestPost(): Post | null {
  return getLatestEntry()
}

export async function getLatestPostWithContent(): Promise<Post | null> {
  const latestPost = getLatestEntry()
  if (!latestPost) return null

  return await getPostByDay(latestPost.day, latestPost.entry)
}

export function getAdjacentPosts(currentDay: number, currentEntry?: number): { 
  prev: { day: number, entry?: number } | null, 
  next: { day: number, entry?: number } | null 
} {
  const posts = getAllPosts()
  const currentIndex = posts.findIndex(post => 
    post.day === currentDay && 
    (currentEntry === undefined ? post.entry === undefined : post.entry === currentEntry)
  )

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: currentIndex > 0 ? { day: posts[currentIndex - 1].day, entry: posts[currentIndex - 1].entry } : null,
    next: currentIndex < posts.length - 1 ? { day: posts[currentIndex + 1].day, entry: posts[currentIndex + 1].entry } : null,
  }
}
