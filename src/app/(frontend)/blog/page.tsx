import { createManagedMetadata, getManagedJsonLd } from '@/lib/site/managed-settings'
import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import { getOfficialBlogPosts } from '@/lib/site/official-cms'
import { BLOG_PAGE_JSON_LD, OFFICIAL_JSON_LD_PAGE_META } from '@/lib/site/json-ld'

import { BlogTabs } from './BlogTabs'
import '../prototype-pages.css'
import './blog-shared.css'
import './blog-index.css'

/**
 * Blog 列表 metadata
 */
export async function generateMetadata() {
  const meta = OFFICIAL_JSON_LD_PAGE_META.blog

  return createManagedMetadata({
    title: meta.title,
    description: meta.description,
    pathname: meta.pathname,
  })
}

export default async function BlogIndexPage() {
  const posts = await getOfficialBlogPosts()
  const categories = [...new Set(posts.flatMap((post) => post.tags.slice(0, 1)))]
  const featuredSlug = posts[0]?.slug

  return (
    <main className="noumi-blog blog-index">
      <StructuredData data={await getManagedJsonLd('/blog', BLOG_PAGE_JSON_LD)} />

      <div className="blog-frame">
        <header className="blog-masthead">
          <h1>Field notes from Noumi</h1>
        </header>

        <BlogTabs categories={categories}>
          {posts.length ? (
            <ul className="blog-list">
              {posts.map((post) => {
                const isFeatured = post.slug === featuredSlug
                const meta = [post.tags[0], post.publishedAt, post.readingTime].filter(Boolean)
                const excerpt = post.excerpt || post.lead

                return (
                  <li
                    className="blog-entry"
                    data-featured={isFeatured || undefined}
                    data-tag={post.tags[0] ?? ''}
                    key={post.slug}
                  >
                    <Link className="blog-entry-link" href={`/blog/${post.slug}`} prefetch={false}>
                      {post.coverImage?.url ? (
                        <div className="blog-entry-media">
                          <img
                            alt=""
                            fetchPriority={isFeatured ? 'high' : undefined}
                            loading={isFeatured ? 'eager' : 'lazy'}
                            src={post.coverImage.url}
                          />
                        </div>
                      ) : null}

                      <div className="blog-entry-copy">
                        <h2>{post.title}</h2>
                        {excerpt ? <p className="blog-entry-excerpt">{excerpt}</p> : null}
                        {meta.length ? <p className="blog-meta">{meta.join(' · ')}</p> : null}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="blog-empty">No articles yet.</p>
          )}
        </BlogTabs>
      </div>
    </main>
  )
}
