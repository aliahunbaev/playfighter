import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface Post {
  day: number
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

export async function getPostByDay(day: number): Promise<Post | null> {
  try {
    const fileName = `day-${day}.md`
    const fullPath = path.join(postsDirectory, fileName)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    // Process markdown to HTML
    const processedContent = await remark().use(html).process(content)
    const contentHtml = processedContent.toString()

    return {
      day,
      date: data.date || '',
      title: data.title,
      content: contentHtml,
      rawContent: content,
    }
  } catch (error) {
    console.error(`Error reading post for day ${day}:`, error)
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
      .filter(fileName => fileName.endsWith('.md'))
      .map(fileName => {
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)

        // Extract day number from filename (day-X.md)
        const day = parseInt(fileName.replace('day-', '').replace('.md', ''))

        return {
          day,
          date: data.date || '',
          title: data.title,
          content: '',
          rawContent: content,
        }
      })
      .sort((a, b) => b.day - a.day) // Sort by day, newest first

    return posts
  } catch (error) {
    console.error('Error reading posts:', error)
    return []
  }
}

export function getLatestPost(): Post | null {
  const posts = getAllPosts()
  return posts.length > 0 ? posts[0] : null
}

export async function getLatestPostWithContent(): Promise<Post | null> {
  const latestPost = getLatestPost()
  if (!latestPost) return null

  return await getPostByDay(latestPost.day)
}

export function getAdjacentPosts(currentDay: number): { prev: number | null, next: number | null } {
  const posts = getAllPosts()
  const currentIndex = posts.findIndex(post => post.day === currentDay)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: currentIndex > 0 ? posts[currentIndex - 1].day : null,
    next: currentIndex < posts.length - 1 ? posts[currentIndex + 1].day : null,
  }
}
