import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import {
  OfficialHomeFooter,
  OfficialHomeHeader,
} from '@/components/site/official/OfficialHomeChrome'
import { getOfficialBlogPosts, getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { BLOG_PAGE_JSON_LD, OFFICIAL_JSON_LD_PAGE_META } from '@/lib/site/json-ld'
import { createOfficialMetadata } from '@/lib/site/official-site'

import styles from './blog.module.css'

/**
 * Blog 列表 metadata
 */
export async function generateMetadata() {
  const meta = OFFICIAL_JSON_LD_PAGE_META.blog

  return createOfficialMetadata({
    title: meta.title,
    description: meta.description,
    pathname: meta.pathname,
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
      <StructuredData data={BLOG_PAGE_JSON_LD} />
      <OfficialHomeHeader activeItem="/blog" useCases={useCases} />

      <header className="page-hero">
        <span className="sec-label">From the team</span>
        <h1>Blog</h1>
        <p>
          Stories and insights about AI agents, persistent memory, and how knowledge work is changing.
        </p>
      </header>

      <main className={styles.blogWrap}>
        <div className={styles.blogGrid}>
          {posts.map((post) => (
            <Link className={styles.blogCard} href={`/blog/${post.slug}`} key={post.slug}>
              <div className={styles.blogCardCover}>
                {post.coverImage?.url ? (
                  <img alt={`${post.title} cover image`} src={post.coverImage.url} />
                ) : null}
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

        <div className={styles.blogSubscribe}>
          <h3>Stay in the loop</h3>
          <p>No spam. Just the best thinking on AI agents, memory, and how knowledge work is changing.</p>
          <div className={styles.subscribeForm}>
            <input className={styles.subscribeInput} placeholder="your@email.com" type="email" />
            <button className={styles.subscribeBtn} type="button">Subscribe</button>
          </div>
          <span aria-hidden="true" className={styles.blogFooterCat} />
        </div>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
