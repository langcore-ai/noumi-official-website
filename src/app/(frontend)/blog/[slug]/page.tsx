import { createManagedMetadata, getManagedJsonLd } from '@/lib/site/managed-settings'
import { StructuredData } from '@/components/site/StructuredData'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { OfficialContentSections } from '@/components/site/official/OfficialContentSections'
import { OfficialRawHtml } from '@/components/site/official/OfficialRawHtml'
import { getOfficialBlogPost } from '@/lib/site/official-cms'
import { renderMarkdownToHtml } from '@/lib/site/markdown'

import '../blog-shared.css'
import './blog-article.css'

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

  return createManagedMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.lead || '',
    image: post.ogImage?.url,
    pathname: `/blog/${post.slug}`,
    type: 'article',
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getOfficialBlogPost(slug)

  if (!post) {
    notFound()
  }

  const structuredData = await getManagedJsonLd(
    `/blog/${slug}`,
    typeof post.structuredData === 'object' ? post.structuredData : null,
  )
  const seo =
    structuredData && typeof structuredData === 'object' ? (
      <StructuredData data={structuredData} />
    ) : null

  if (post.renderMode === 'html') {
    return (
      <div className="noumi-blog blog-legacy">
        {seo}
        <OfficialRawHtml html={post.htmlContent || ''} />
      </div>
    )
  }

  const meta = [post.tags[0], post.author, post.publishedAt, post.readingTime].filter(Boolean)
  const lead = post.lead || post.excerpt

  return (
    <main className="noumi-blog blog-article">
      {seo}
      <article className="blog-frame">
        <header className="blog-article-header">
          <Link className="blog-back" href="/blog">
            ← Blog
          </Link>
          <h1>{post.title}</h1>
          {meta.length > 0 ? <p className="blog-meta">{meta.join(' · ')}</p> : null}
        </header>

        {post.coverImage?.url ? (
          <figure className="blog-article-cover">
            <img
              alt={post.coverImage.alt || `${post.title} cover`}
              fetchPriority="high"
              src={post.coverImage.url}
              width={post.coverImage.width ?? undefined}
              height={post.coverImage.height ?? undefined}
            />
          </figure>
        ) : null}

        {lead ? <p className="blog-article-lead blog-reading-width">{lead}</p> : null}

        {post.renderMode === 'markdown' ? (
          <div
            className="blog-article-body blog-prose"
            dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(post.markdownContent || '') }}
          />
        ) : (
          <div className="blog-article-sections">
            <OfficialContentSections article sections={post.sections} />
          </div>
        )}

        {post.faqItems.length ? (
          <section className="blog-faq blog-reading-width" aria-labelledby="blog-faq-title">
            <h2 id="blog-faq-title">Frequently asked questions</h2>
            {post.faqItems.map((item) => (
              <details key={item.id}>
                <summary>{item.question}</summary>
                <div
                  className="blog-prose"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(item.answerMarkdown) }}
                />
              </details>
            ))}
          </section>
        ) : null}

        {post.relatedPosts.length ? (
          <aside className="blog-related blog-reading-width" aria-labelledby="blog-related-title">
            <h2 id="blog-related-title">More from the blog</h2>
            <ul>
              {post.relatedPosts.map((related) => (
                <li key={related.slug}>
                  <Link href={`/blog/${related.slug}`}>
                    {related.coverImage?.url ? (
                      <img src={related.coverImage.url} alt="" loading="lazy" />
                    ) : null}
                    <span>{related.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </article>
    </main>
  )
}
