import Link from 'next/link'

import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { getOfficialBlogPosts, getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

/**
 * Blog 列表 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'Blog — Noumi | AI Agents, Memory & the Future of Work',
    description:
      'Stories and insights about AI agents, persistent memory, and how knowledge work is changing — from the team building Noumi, for the professionals who use it.',
    pathname: '/blog/',
  })
}

/**
 * Blog 列表页
 * @returns 文章列表
 */
export default async function BlogIndexPage() {
  const [posts, useCases] = await Promise.all([
    getOfficialBlogPosts(),
    getOfficialUseCaseNavItems(),
  ])

  return (
    <div className="page-body">
      <OfficialHomeHeader useCases={useCases} />

      <style>{`
        .blog-wrap { max-width: var(--max-w); margin: 0 auto; padding: 0 48px 120px; }
        .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-bottom: 72px; }
        .blog-card { display: flex; flex-direction: column; background: var(--cream); border: 1px solid var(--border-med); border-radius: 18px; overflow: hidden; transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease; text-decoration: none; color: inherit; }
        .blog-card:hover { box-shadow: 0 16px 48px rgba(28,27,46,0.10); transform: translateY(-4px); border-color: rgba(75,75,232,0.22); }
        .blog-card-cover { width: 100%; aspect-ratio: 16 / 9; overflow: hidden; line-height: 0; flex-shrink: 0; background: var(--cream-mid); }
        .blog-card-cover img { width: 100%; height: 100%; object-fit: cover; }
        .blog-card-body { padding: 22px 22px 24px; display: flex; flex-direction: column; flex: 1; }
        .blog-card-tags { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .blog-card-tag { background: rgba(75,75,232,0.08); border: 1px solid rgba(75,75,232,0.14); color: var(--accent); font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 16px; }
        .blog-card-meta { font-size: 12px; color: var(--ink-muted); font-weight: 300; }
        .blog-card-title { font-family: var(--ff-display); font-size: 19px; font-weight: 700; color: var(--ink); line-height: 1.25; letter-spacing: -0.02em; margin-bottom: 10px; transition: color 0.2s; }
        .blog-card:hover .blog-card-title { color: var(--accent); }
        .blog-card-excerpt { font-size: 14px; font-weight: 300; color: var(--ink-soft); line-height: 1.65; margin-bottom: 18px; flex: 1; }
        .blog-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--border); font-size: 13px; }
        .blog-card-read { color: var(--accent); font-weight: 600; display: flex; align-items: center; gap: 4px; transition: gap 0.2s; }
        .blog-card:hover .blog-card-read { gap: 8px; }
        .blog-card-time { font-size: 12px; color: var(--ink-muted); font-weight: 300; }
        .blog-subscribe { max-width: 500px; margin: 0 auto; text-align: center; padding: 48px 0; border-top: 1px solid var(--border); }
        .blog-subscribe h3 { font-family: var(--ff-display); font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 10px; }
        .blog-subscribe p { font-size: 14px; font-weight: 300; color: var(--ink-muted); margin-bottom: 24px; line-height: 1.6; }
        .subscribe-form { display: flex; gap: 10px; max-width: 420px; margin: 0 auto; }
        .subscribe-input { flex: 1; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-med); background: var(--cream-mid); font-family: var(--ff-body); font-size: 14px; color: var(--ink); outline: none; transition: border-color 0.2s; }
        .subscribe-btn { padding: 12px 20px; background: var(--ink); color: var(--cream); border: none; border-radius: 8px; font-family: var(--ff-body); font-size: 14px; font-weight: 500; white-space: nowrap; }
        @media (max-width: 960px) { .blog-wrap { padding: 0 24px 80px; } .blog-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .blog-grid { grid-template-columns: 1fr; } .subscribe-form { flex-direction: column; } }
      `}</style>

      <header className="page-hero">
        <span className="sec-label reveal">From the team</span>
        <h1 className="reveal d1">Blog</h1>
        <p className="reveal d2">
          Stories and insights about AI agents, persistent memory, and how knowledge work is changing.
        </p>
      </header>

      <main className="blog-wrap">
        <div className="blog-grid reveal">
          {posts.map((post) => (
            <Link className="blog-card" href={`/blog/${post.slug}/`} key={post.slug}>
              <div aria-hidden="true" className="blog-card-cover">
                {post.coverImage?.url ? <img alt="" src={post.coverImage.url} /> : null}
              </div>
              <div className="blog-card-body">
                <div className="blog-card-tags">
                  {post.tags[0] ? <span className="blog-card-tag">{post.tags[0]}</span> : null}
                  {post.publishedAt ? <span className="blog-card-meta">{post.publishedAt}</span> : null}
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-excerpt">{post.excerpt || post.lead || ''}</p>
                <div className="blog-card-footer">
                  <span className="blog-card-read">Read article →</span>
                  {post.readingTime ? <span className="blog-card-time">{post.readingTime}</span> : null}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="blog-subscribe reveal">
          <h3>Stay in the loop</h3>
          <p>No spam. Just the best thinking on AI agents, memory, and how knowledge work is changing.</p>
          <div className="subscribe-form">
            <input className="subscribe-input" placeholder="your@email.com" type="email" />
            <button className="subscribe-btn" type="button">Subscribe</button>
          </div>
        </div>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
