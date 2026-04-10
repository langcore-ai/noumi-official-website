import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import { getDateLocale, getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getPublishedBlogPosts } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * Blog 列表 metadata
 */
export async function generateMetadata() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)

  return createPageMetadata({
    locale,
    title: dictionary.blog.metadataTitle,
    description: dictionary.blog.metadataDescription,
    pathname: '/blog/',
  })
}

/**
 * Blog 列表页
 * @returns 文章列表
 */
export default async function BlogIndexPage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const posts = await getPublishedBlogPosts(locale)
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.blog.breadcrumb, pathname: '/blog/' },
  ], locale)

  return (
    <div className="page">
      <StructuredData data={breadcrumbJsonLd} />

      <section className="site-shell page__hero">
        <span className="page__eyebrow">{dictionary.blog.eyebrow}</span>
        <h1>{dictionary.blog.title}</h1>
        <p>{dictionary.blog.intro}</p>
      </section>

      {posts.length > 0 ? (
        <section className="site-shell section">
          <div className="blog-list">
            {posts.map((post) => (
              <article key={post.slug} className="blog-card">
                <div className="blog-card__meta">
                  {post.publishedAt ? (
                    <span>{new Date(post.publishedAt).toLocaleDateString(getDateLocale(locale))}</span>
                  ) : null}
                  {post.author ? <span>{post.author}</span> : null}
                </div>
                <h2>{post.title}</h2>
                {post.excerpt ? <p>{post.excerpt}</p> : null}
                <Link className="feature-grid__link" href={`/blog/${post.slug}/`}>
                  {dictionary.blog.readArticle}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
