import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { StructuredData } from '@/components/site/StructuredData'
import { getDateLocale, getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getPublishedBlogPostBySlug, mapBlogSections } from '@/lib/site/cms'
import { createArticleJsonLd, createBreadcrumbJsonLd, createPageMetadata } from '@/lib/site/seo'

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
export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { slug } = await props.params
  const post = await getPublishedBlogPostBySlug(slug, locale)

  if (!post) {
    return {}
  }

  return createPageMetadata({
    locale,
    title: post.metaTitle?.trim() || post.title,
    description: post.metaDescription?.trim() || post.excerpt || '',
    pathname: `/blog/${post.slug}/`,
    type: 'article',
    image: typeof post.ogImage === 'object' ? post.ogImage : null,
  })
}

/**
 * 博客详情页
 * @param props 路由参数
 * @returns 页面内容
 */
export default async function BlogPostPage(props: BlogPostPageProps) {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const { slug } = await props.params
  const post = await getPublishedBlogPostBySlug(slug, locale)

  if (!post) {
    notFound()
  }

  const sections = mapBlogSections(post)
  const [breadcrumbJsonLd, articleJsonLd] = await Promise.all([
    createBreadcrumbJsonLd([
      { name: dictionary.common.brandName, pathname: '/' },
      { name: dictionary.blog.breadcrumb, pathname: '/blog/' },
      { name: post.title, pathname: `/blog/${post.slug}/` },
    ], locale),
    createArticleJsonLd({
      locale,
      title: post.title,
      description: post.metaDescription?.trim() || post.excerpt || '',
      pathname: `/blog/${post.slug}/`,
      publishedAt: post.publishedAt || new Date().toISOString(),
      author: post.author,
      image: typeof post.ogImage === 'object' ? post.ogImage : null,
    }),
  ])

  return (
    <div className="page">
      <StructuredData data={breadcrumbJsonLd} />
      <StructuredData data={articleJsonLd} />

      <section className="site-shell page__hero article">
        <nav aria-label={dictionary.common.breadcrumb} className="breadcrumbs">
          <Link href="/">{dictionary.common.brandName}</Link>
          <span>/</span>
          <Link href="/blog/">{dictionary.blog.breadcrumb}</Link>
          <span>/</span>
          <span aria-current="page">{post.title}</span>
        </nav>
        <div className="article__meta">
          {post.publishedAt ? (
            <span>{new Date(post.publishedAt).toLocaleDateString(getDateLocale(locale))}</span>
          ) : null}
          {post.author ? <span>{post.author}</span> : null}
          {(post.tags ?? []).map((tag) => (tag?.tag ? <span key={tag.id ?? tag.tag}>{tag.tag}</span> : null))}
        </div>
        <h1>{post.title}</h1>
        {post.excerpt ? <p>{post.excerpt}</p> : null}
      </section>

      {sections.length > 0 ? (
        <section className="site-shell section article">
          <div className="panel">
            {sections.map((section) => (
              <section key={section.title} className="section">
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {(section.bullets ?? []).length > 0 ? (
                  <ul>
                    {(section.bullets ?? []).map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
