import { getAllPosts, TOTAL_DAYS, getCurrentDay } from '@/lib/posts'
import Link from 'next/link'
import Grid from '../components/Grid'

export default function ArchivePage() {
  const posts = getAllPosts()
  const currentDay = getCurrentDay()
  // Only show entry from December 5th (day 1)
  const filteredPosts = posts.filter(post => post.day === 1)
  const postsByDay = new Map(filteredPosts.map(post => [post.day, post]))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).replace(',', '').toUpperCase()
  }

  return (
    <div>
      {filteredPosts.length > 0 ? (
        <>
          {/* Grid - Full Width */}
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-6 mb-12">
            <Grid postsByDay={postsByDay} currentDay={currentDay} totalDays={TOTAL_DAYS} />
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Entry List */}
          <div className="pt-12">
            <div className="space-y-2">
              {filteredPosts.map((post) => (
                <Link
                  key={post.day}
                  href={`/day/${post.day}`}
                  className="block group py-4 hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-baseline gap-6">
                    <span className="font-mono text-lg font-bold tabular-nums text-black/60 dark:text-[#e5e5e5]/60 group-hover:text-black dark:group-hover:text-[#e5e5e5] transition-colors flex-shrink-0" style={{ minWidth: '80px' }}>
                      {post.day.toString().padStart(4, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sans text-lg font-light" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                        {post.title || 'Entry ' + post.day}
                      </h3>
                      <div className="font-mono text-xs text-black/30 dark:text-[#e5e5e5]/30 uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatDate(post.date)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          </div>
        </>
      ) : (
        <div className="text-center text-black/50 dark:text-[#e5e5e5]/50 font-sans py-12">
          <p className="font-light">No posts yet. The archive will fill up day by day.</p>
        </div>
      )}
    </div>
  )
}
