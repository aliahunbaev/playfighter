import { getLatestPostWithContent, getCurrentDay, getAllPosts, TOTAL_DAYS } from '@/lib/posts'
import LiveDateTime from './components/LiveDateTime'
import Grid from './components/Grid'

// Force dynamic rendering so the day counter updates without rebuilding
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const latestPost = await getLatestPostWithContent()
  const currentDay = getCurrentDay()
  const allPosts = getAllPosts()
  const postsByDay = new Map(allPosts.map(post => [post.day, post]))

  return (
    <div>
      {/* Day Counter */}
      <div className="mb-24">
        <div className="flex flex-col items-center mb-12 w-full">
          <div className="font-mono leading-none tabular-nums w-full text-center tracking-tight" style={{ fontSize: 'clamp(3.5rem, calc((min(100vw, 680px) - 3rem) / 8), 10rem)', letterSpacing: '-0.05em' }}>
            {currentDay.toString().padStart(4, '0')}<span className="text-black/20 dark:text-[#e5e5e5]/20">/</span><span className="text-black/20 dark:text-[#e5e5e5]/20">{TOTAL_DAYS}</span>
          </div>
          <LiveDateTime />
        </div>
      </div>

      {/* 1000 Dot Grid - Full Width */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-6">
        <Grid postsByDay={postsByDay} currentDay={currentDay} totalDays={TOTAL_DAYS} />
      </div>

      <div className="mb-24"></div>

      {/* Latest Entry */}
      {latestPost ? (
        <>
          <article className="mb-16">
            <div className="mb-12 text-center">
              <h1 className="font-sans text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                {latestPost.title || 'Entry ' + latestPost.day}
              </h1>
              <div className="flex gap-3 text-xs font-mono text-black/40 dark:text-[#e5e5e5]/40 uppercase tracking-wider justify-center">
                <span>{latestPost.day.toString().padStart(4, '0')}</span>
                <span>•</span>
                <span>{new Date(latestPost.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }).toUpperCase()}</span>
              </div>
            </div>

            <div
              className="prose-content font-sans text-base leading-relaxed font-light"
              dangerouslySetInnerHTML={{ __html: latestPost.content }}
            />
          </article>

        </>
      ) : (
        <div className="text-center text-black/50 dark:text-[#e5e5e5]/50 font-sans">
          <p>No posts yet. The journey begins soon.</p>
        </div>
      )}
    </div>
  )
}
