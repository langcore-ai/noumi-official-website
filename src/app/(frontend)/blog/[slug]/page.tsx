import Link from 'next/link'
import { notFound } from 'next/navigation'

import { OfficialContentSections } from '@/components/site/official/OfficialContentSections'
import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { OfficialRawHtml } from '@/components/site/official/OfficialRawHtml'
import { getOfficialBlogPost, getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

import styles from './blog-post.module.css'

/**
 * 博客详情 props
 */
type BlogPostPageProps = {
  /** 路由参数 */
  params: Promise<{ slug: string }>
}

/**
 * 生成文章 metadata
 * @param props 路由参数
 * @returns metadata
 */
export async function generateMetadata(props: BlogPostPageProps) {
  const { slug } = await props.params
  const post = await getOfficialBlogPost(slug)

  if (!post) {
    return {}
  }

  return createOfficialMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.lead || '',
    image: post.ogImage?.url,
    pathname: `/blog/${post.slug}`,
    type: 'article',
  })
}

/**
 * 博客详情页
 * @param props 路由参数
 * @returns 页面内容
 */
export default async function BlogPostPage(props: BlogPostPageProps) {
  const { slug } = await props.params
  const [post, useCases] = await Promise.all([
    getOfficialBlogPost(slug),
    getOfficialUseCaseNavItems(),
  ])

  if (!post) {
    notFound()
  }

  if (post.renderMode === 'html') {
    return (
      <div className="page-body">
        <OfficialHomeHeader useCases={useCases} />
        <OfficialRawHtml html={post.htmlContent || ''} />
        <OfficialHomeFooter useCases={useCases} />
      </div>
    )
  }

  return (
    <div className={`${styles.blogPostPage} page-body`}>
      <OfficialHomeHeader useCases={useCases} />

      <main className={styles.postWrap}>
        <Link className={`${styles.postBack} reveal`} href="/blog">← Back to Blog</Link>

        <article>
          <header className={`${styles.postHeader} reveal d1`}>
            <div className={styles.postTags}>
              {post.tags[0] ? <span className={styles.postTag}>{post.tags[0]}</span> : null}
              <span className={styles.postMetaRow}>
                {[post.publishedAt, post.readingTime].filter(Boolean).join(' · ')}
              </span>
            </div>
            <h1>{post.title}</h1>
            {post.lead || post.excerpt ? <p className={styles.postLead}>{post.lead || post.excerpt}</p> : null}
          </header>

          {post.coverImage?.url ? (
            <figure className={`${styles.postCover} reveal d2`}>
              <img alt={`${post.title} cover image`} src={post.coverImage.url} />
            </figure>
          ) : null}
        </article>
      </main>

      <OfficialContentSections article sections={post.sections} />

      {post.relatedPosts[0] ? (
        <section className={`${styles.postWrap} ${styles.moreSection}`}>
          <div className={styles.moreTop}>
            <h2>More from the blog</h2>
            <Link className={styles.moreViewAll} href="/blog">View all →</Link>
          </div>
          <Link className={styles.moreCard} href={`/blog/${post.relatedPosts[0].slug}`}>
            <div className={styles.moreThumb}>
              {post.relatedPosts[0].coverImage?.url ? (
                <img
                  alt={`${post.relatedPosts[0].title} cover image`}
                  src={post.relatedPosts[0].coverImage.url}
                />
              ) : null}
            </div>
            <div className={styles.moreBody}>
              <div className={styles.moreTags}>
                {post.relatedPosts[0].tags[0] ? <span className={styles.moreTag}>{post.relatedPosts[0].tags[0]}</span> : null}
                <span className={styles.moreMetaText}>
                  {[post.relatedPosts[0].readingTime, post.relatedPosts[0].publishedAt].filter(Boolean).join(' · ')}
                </span>
              </div>
              <h3>{post.relatedPosts[0].title}</h3>
              <p>{post.relatedPosts[0].excerpt || post.relatedPosts[0].lead || ''}</p>
              <span className={styles.moreRead}>Read article →</span>
            </div>
          </Link>
        </section>
      ) : null}

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
