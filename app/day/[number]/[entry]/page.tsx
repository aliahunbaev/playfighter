import { getPostByDay, getAllPosts, getAdjacentPosts, getEntriesForDay, TOTAL_DAYS } from '@/lib/posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostNavigation from '@/app/components/PostNavigation'

export async function generateStaticParams() {
  const posts = getAllPosts()
  // Generate params for each entry (including entry number)
  return posts
    .filter(post => post.entry !== undefined) // Only entries with explicit entry numbers
    .map((post) => ({
      number: post.day.toString(),
      entry: post.entry!.toString(),
    }))
}

export default async function EntryPage({ params }: { params: { number: string; entry: string } }) {
  const day = parseInt(params.number)
  const entry = parseInt(params.entry)

  if (isNaN(day) || day < 1 || day > TOTAL_DAYS || isNaN(entry) || entry < 1) {
    notFound()
  }

  const post = await getPostByDay(day, entry)

  if (!post) {
    notFound()
  }

  // Get all entries for this day to show entry selector
  const entriesForDay = getEntriesForDay(day)
  const hasMultipleEntries = entriesForDay.length > 1

  const { prev, next } = getAdjacentPosts(day, entry)

  return (
    <PostNavigation prev={prev} next={next}>
      <div className="max-w-reading mx-auto">
        {/* Post Header */}
        <div className="mb-12 text-center">
          <h1 className="font-sans text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            {post.title || 'Entry ' + post.day}
          </h1>
          <div className="flex gap-3 text-xs font-mono text-black/40 dark:text-[#e5e5e5]/40 uppercase tracking-wider justify-center items-center">
            <span>{post.day.toString().padStart(4, '0')}</span>
            {hasMultipleEntries && (
              <>
                <span>•</span>
                <span className="text-black/30 dark:text-[#e5e5e5]/30">
                  ENTRY {entry} / {entriesForDay.length}
                </span>
              </>
            )}
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }).toUpperCase()}</span>
          </div>
          {hasMultipleEntries && (
            <div className="mt-6 flex gap-2 justify-center flex-wrap">
              {entriesForDay.map((e) => (
                <Link
                  key={e.entry || 'default'}
                  href={e.entry ? `/day/${day}/${e.entry}` : `/day/${day}`}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                    (e.entry || undefined) === entry
                      ? 'text-black dark:text-[#e5e5e5] border-b border-black dark:border-[#e5e5e5]'
                      : 'text-black/40 dark:text-[#e5e5e5]/40 hover:text-black/60 dark:hover:text-[#e5e5e5]/60'
                  }`}
                >
                  {e.entry || 1}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Post Content */}
        <article>
          <div
            className="prose-content font-sans text-base leading-relaxed font-light"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Navigation */}
        <nav className="mt-20 pt-12 flex justify-between items-center text-sm font-mono">
          <div className="flex-1">
            {next !== null ? (
              <Link
                href={next.entry ? `/day/${next.day}/${next.entry}` : `/day/${next.day}`}
                className="flex items-center gap-2 text-black/60 dark:text-[#e5e5e5]/60 hover:text-black dark:hover:text-[#e5e5e5] transition-colors tabular-nums group"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-black/60 dark:text-[#e5e5e5]/60 group-hover:text-black dark:group-hover:text-[#e5e5e5] transition-colors"
                >
                  <path 
                    d="M10 12L6 8L10 4" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{next.day.toString().padStart(4, '0')}{next.entry ? `-${next.entry}` : ''}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-2 text-black/10 dark:text-[#e5e5e5]/10 tabular-nums">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-black/10 dark:text-[#e5e5e5]/10"
                >
                  <path 
                    d="M10 12L6 8L10 4" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span>0000</span>
              </span>
            )}
          </div>
          <div className="flex-1 text-center">
            <Link
              href="/archive"
              className="text-black/50 dark:text-[#e5e5e5]/50 hover:text-black/80 dark:hover:text-[#e5e5e5]/80 transition-colors uppercase tracking-wider"
            >
              Archive
            </Link>
          </div>
          <div className="flex-1 text-right">
            {prev !== null ? (
              <Link
                href={prev.entry ? `/day/${prev.day}/${prev.entry}` : `/day/${prev.day}`}
                className="flex items-center justify-end gap-2 text-black/60 dark:text-[#e5e5e5]/60 hover:text-black dark:hover:text-[#e5e5e5] transition-colors tabular-nums group"
              >
                <span>{prev.day.toString().padStart(4, '0')}{prev.entry ? `-${prev.entry}` : ''}</span>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-black/60 dark:text-[#e5e5e5]/60 group-hover:text-black dark:group-hover:text-[#e5e5e5] transition-colors"
                >
                  <path 
                    d="M6 4L10 8L6 12" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : (
              <span className="flex items-center justify-end gap-2 text-black/10 dark:text-[#e5e5e5]/10 tabular-nums">
                <span>0000</span>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-black/10 dark:text-[#e5e5e5]/10"
                >
                  <path 
                    d="M6 4L10 8L6 12" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </div>
        </nav>
      </div>
    </PostNavigation>
  )
}

