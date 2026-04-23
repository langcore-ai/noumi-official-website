import Link from 'next/link'

import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { getOfficialBlogPosts, getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

import styles from './blog.module.css'

/**
 * Blog 列表 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'Blog — Noumi | AI Agents, Memory & the Future of Work',
    description:
      'Stories and insights about AI agents, persistent memory, and how knowledge work is changing — from the team building Noumi, for the professionals who use it.',
    pathname: '/blog',
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

      <header className="page-hero">
        <span className="sec-label reveal">From the team</span>
        <h1 className="reveal d1">Blog</h1>
        <p className="reveal d2">
          Stories and insights about AI agents, persistent memory, and how knowledge work is changing.
        </p>
      </header>

      <main className={styles.blogWrap}>
        <div className={`${styles.blogGrid} reveal`}>
          {posts.map((post) => (
            <Link className={styles.blogCard} href={`/blog/${post.slug}`} key={post.slug}>
              <div aria-hidden="true" className={styles.blogCardCover}>
                {post.coverImage?.url ? <img alt="" src={post.coverImage.url} /> : null}
              </div>
              <div className={styles.blogCardBody}>
                <div className={styles.blogCardTags}>
                  {post.tags[0] ? <span className={styles.blogCardTag}>{post.tags[0]}</span> : null}
                  {post.publishedAt ? <span className={styles.blogCardMeta}>{post.publishedAt}</span> : null}
                </div>
                <h2 className={styles.blogCardTitle}>{post.title}</h2>
                <p className={styles.blogCardExcerpt}>{post.excerpt || post.lead || ''}</p>
                <div className={styles.blogCardFooter}>
                  <span className={styles.blogCardRead}>Read article →</span>
                  {post.readingTime ? <span className={styles.blogCardTime}>{post.readingTime}</span> : null}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={`${styles.blogSubscribe} reveal`}>
          <h3>Stay in the loop</h3>
          <p>No spam. Just the best thinking on AI agents, memory, and how knowledge work is changing.</p>
          <div className={styles.subscribeForm}>
            <input className={styles.subscribeInput} placeholder="your@email.com" type="email" />
            <button className={styles.subscribeBtn} type="button">Subscribe</button>
          </div>
        </div>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
