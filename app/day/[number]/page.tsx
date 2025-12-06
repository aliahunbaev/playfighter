import { getPostByDay, getAllPosts, getAdjacentPosts, TOTAL_DAYS } from '@/lib/posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    number: post.day.toString(),
  }))
}

export default async function DayPage({ params }: { params: { number: string } }) {
  const day = parseInt(params.number)

  if (isNaN(day) || day < 1 || day > TOTAL_DAYS) {
    notFound()
  }

  const post = await getPostByDay(day)

  if (!post) {
    notFound()
  }

  const { prev, next } = getAdjacentPosts(day)

  return (
    <div className="max-w-reading mx-auto">
      {/* Post Header */}
      <div className="mb-12 text-center">
        <h1 className="font-sans text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
          {post.title || 'Entry ' + post.day}
        </h1>
        <div className="flex gap-3 text-xs font-mono text-black/40 dark:text-[#e5e5e5]/40 uppercase tracking-wider justify-center">
          <span>{post.day.toString().padStart(4, '0')}</span>
          <span>•</span>
          <span>{new Date(post.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).toUpperCase()}</span>
        </div>
      </div>

      {/* Post Content */}
      <article>
        <div
          className="prose-content font-sans text-base leading-relaxed font-light"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Navigation */}
      <nav className="mt-20 pt-8 border-t border-black/10 dark:border-[#e5e5e5]/10 flex justify-between items-center text-sm font-mono">
        <div className="flex-1">
          {next !== null && (
            <Link
              href={`/day/${next}`}
              className="hover:opacity-60 transition-opacity uppercase tracking-wider"
            >
              ← Prev
            </Link>
          )}
        </div>
        <Link
          href="/archive"
          className="text-black/50 dark:text-[#e5e5e5]/50 hover:opacity-60 transition-opacity uppercase tracking-wider"
        >
          Archive
        </Link>
        <div className="flex-1 text-right">
          {prev !== null && (
            <Link
              href={`/day/${prev}`}
              className="hover:opacity-60 transition-opacity uppercase tracking-wider"
            >
              Next →
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
