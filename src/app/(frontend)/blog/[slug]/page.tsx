import Link from 'next/link'
import { notFound } from 'next/navigation'

import { OfficialContentSections } from '@/components/site/official/OfficialContentSections'
import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { OfficialRawHtml } from '@/components/site/official/OfficialRawHtml'
import { getOfficialBlogPost, getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

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
    pathname: `/blog/${post.slug}/`,
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
    <div className="page-body">
      <OfficialHomeHeader useCases={useCases} />

      <style>{`
        .post-wrap { max-width: 740px; margin: 0 auto; padding: 0 24px 120px; }
        .post-wrap--section { padding-bottom: 0; }
        .post-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; color: var(--ink-muted); font-weight: 500; padding: 28px 0 0; transition: color 0.2s; }
        .post-header { padding: 36px 0 0; }
        .post-tags { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
        .post-tag { background: rgba(75,75,232,0.08); border: 1px solid rgba(75,75,232,0.16); color: var(--accent); font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
        .post-meta-row { font-size: 13px; color: var(--ink-muted); font-weight: 300; }
        .post-header h1 { font-family: var(--ff-display); font-size: clamp(28px, 4vw, 46px); font-weight: 700; line-height: 1.12; letter-spacing: -0.03em; color: var(--ink); margin: 16px 0 20px; }
        .post-lead { font-size: 18px; font-weight: 300; color: var(--ink-soft); line-height: 1.7; margin-bottom: 0; border-bottom: 1px solid var(--border); padding-bottom: 32px; }
        .post-cover { margin: 32px 0 40px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(28,27,46,0.08); box-shadow: 0 8px 32px rgba(28,27,46,0.08); line-height: 0; }
        .post-cover img { width: 100%; display: block; }
        .post-more-section { margin-top: 64px; padding-top: 40px; border-top: 1px solid var(--border); }
        .post-more-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .post-more-top h2 { font-family: var(--ff-display); font-size: 22px; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; }
        .post-more-viewall { font-size: 13.5px; color: var(--ink-muted); font-weight: 500; transition: color 0.2s; }
        .post-more-card { display: flex; background: var(--cream-mid); border: 1px solid var(--border-med); border-radius: 16px; overflow: hidden; text-decoration: none; color: inherit; transition: box-shadow 0.25s ease, transform 0.25s ease; }
        .post-more-card:hover { box-shadow: 0 10px 32px rgba(28,27,46,0.09); transform: translateY(-3px); }
        .post-more-thumb { width: 220px; flex-shrink: 0; overflow: hidden; line-height: 0; background: var(--cream-dark); }
        .post-more-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .post-more-body { padding: 28px 32px; display: flex; flex-direction: column; justify-content: center; }
        .post-more-tags { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .post-more-tag { background: rgba(75,75,232,0.08); border: 1px solid rgba(75,75,232,0.14); color: var(--accent); font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 16px; }
        .post-more-meta-txt { font-size: 12px; color: var(--ink-muted); }
        .post-more-card h3 { font-family: var(--ff-display); font-size: clamp(17px,2vw,22px); font-weight: 700; color: var(--ink); letter-spacing: -0.02em; line-height: 1.25; margin-bottom: 10px; transition: color 0.2s; }
        .post-more-card p { font-size: 14px; color: var(--ink-soft); line-height: 1.65; font-weight: 300; margin-bottom: 18px; }
        .post-more-read { font-size: 13px; color: var(--accent); font-weight: 600; }
        .official-section-title { font-family: var(--ff-display); font-size: clamp(20px, 2.5vw, 26px); font-weight: 700; color: var(--ink); letter-spacing: -0.02em; margin: 2.5em 0 0.75em; padding-top: 0.5em; border-top: 1px solid var(--border); }
        .official-section-description, .official-richtext-panel p, .official-richtext-panel li, .markdown-content p, .markdown-content li, .markdown-content td { font-size: 16.5px; color: var(--ink-soft); line-height: 1.8; font-weight: 300; }
        .official-richtext-panel ul, .markdown-content ul, .markdown-content ol { margin: 1em 0 1.5em 1.5em; }
        .markdown-content h2, .markdown-content h3 { font-family: var(--ff-display); color: var(--ink); letter-spacing: -0.02em; }
        .markdown-content h2 { font-size: clamp(20px, 2.5vw, 26px); font-weight: 700; margin: 2.5em 0 0.75em; padding-top: 0.5em; border-top: 1px solid var(--border); }
        .markdown-content h3 { font-size: 18px; font-weight: 600; margin: 1.8em 0 0.6em; }
        .markdown-table { overflow-x: auto; margin: 1.5em 0 2em; }
        .markdown-table table { width: 100%; border-collapse: collapse; font-size: 14.5px; }
        .markdown-table th { background: var(--cream-mid); font-weight: 600; color: var(--ink); padding: 11px 16px; text-align: left; border-bottom: 2px solid var(--border-med); white-space: nowrap; }
        .markdown-table td { padding: 11px 16px; color: var(--ink-soft); border-bottom: 1px solid var(--border); vertical-align: top; }
        .official-image-block { margin: 32px 0 40px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(28,27,46,0.08); box-shadow: 0 8px 32px rgba(28,27,46,0.08); line-height: 0; }
        .official-image-block img { display: block; width: 100%; }
        .official-image-block figcaption { padding: 14px 18px; line-height: 1.6; font-size: 13px; color: var(--ink-muted); background: var(--cream-mid); }
      `}</style>

      <main className="post-wrap">
        <Link className="post-back reveal" href="/blog/">← Back to Blog</Link>

        <article>
          <header className="post-header reveal d1">
            <div className="post-tags">
              {post.tags[0] ? <span className="post-tag">{post.tags[0]}</span> : null}
              <span className="post-meta-row">
                {[post.publishedAt, post.readingTime].filter(Boolean).join(' · ')}
              </span>
            </div>
            <h1>{post.title}</h1>
            {post.lead || post.excerpt ? <p className="post-lead">{post.lead || post.excerpt}</p> : null}
          </header>

          {post.coverImage?.url ? (
            <figure aria-hidden="true" className="post-cover reveal d2">
              <img alt="" src={post.coverImage.url} />
            </figure>
          ) : null}
        </article>
      </main>

      <OfficialContentSections article sections={post.sections} />

      {post.relatedPosts[0] ? (
        <section className="post-wrap post-more-section">
          <div className="post-more-top">
            <h2>More from the blog</h2>
            <Link className="post-more-viewall" href="/blog/">View all →</Link>
          </div>
          <Link className="post-more-card" href={`/blog/${post.relatedPosts[0].slug}/`}>
            <div className="post-more-thumb">
              {post.relatedPosts[0].coverImage?.url ? <img alt="" src={post.relatedPosts[0].coverImage.url} /> : null}
            </div>
            <div className="post-more-body">
              <div className="post-more-tags">
                {post.relatedPosts[0].tags[0] ? <span className="post-more-tag">{post.relatedPosts[0].tags[0]}</span> : null}
                <span className="post-more-meta-txt">
                  {[post.relatedPosts[0].readingTime, post.relatedPosts[0].publishedAt].filter(Boolean).join(' · ')}
                </span>
              </div>
              <h3>{post.relatedPosts[0].title}</h3>
              <p>{post.relatedPosts[0].excerpt || post.relatedPosts[0].lead || ''}</p>
              <span className="post-more-read">Read article →</span>
            </div>
          </Link>
        </section>
      ) : null}

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
