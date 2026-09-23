import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import { getOfficialBlogPosts } from '@/lib/site/official-cms'
import { BLOG_PAGE_JSON_LD, OFFICIAL_JSON_LD_PAGE_META } from '@/lib/site/json-ld'
import { createOfficialMetadata, OFFICIAL_PRODUCT_AUTH_URL } from '@/lib/site/official-site'

import { BlogTabs } from './BlogTabs'
import './blog-index.css'

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
 * 版式与原型 `blog.html` 保持一致（banner-section + blog-tab + blog-card + cta-section），
 * 数据来自 CMS 已发布文章，分类按钮由文章标签动态生成。
 * @returns 文章列表
 */
export default async function BlogIndexPage() {
  const posts = await getOfficialBlogPosts()
  const categories = Array.from(
    new Set(posts.map((post) => post.tags[0]).filter((tag): tag is string => Boolean(tag))),
  )

  return (
    <div className="page-body">
      <StructuredData data={BLOG_PAGE_JSON_LD} />

      <main className="prototype-page body-8 blog-index">
        <section className="banner-section">
          <div className="w-layout-blockcontainer regular-container w-container">
            <div className="banner-title-area">
              <div className="subtitle-wrap">
                <div className="subtitle-arrow-wrap left">
                  <img
                    alt="Subtitle Arrow"
                    className="subtitle-arrow"
                    loading="lazy"
                    src="/assets/prototype/images/subtitle-arrow_1.svg"
                  />
                </div>
                <p className="subtitle">Blog</p>
                <div className="subtitle-arrow-wrap right">
                  <img
                    alt="Subtitle Arrow"
                    className="subtitle-arrow"
                    loading="lazy"
                    src="/assets/prototype/images/subtitle-arrow.svg"
                  />
                </div>
              </div>
              <h1 className="banner-title">The Knowledge Professionals Treasure Trove</h1>
            </div>
          </div>
        </section>

        <section className="regular-section bottom-space blog-index-section">
          <div className="w-layout-blockcontainer regular-container w-container">
            <BlogTabs categories={categories}>
              <div className="blog-collection-list-wrap w-dyn-list">
                <div className="blog-collection-list w-dyn-items" role="list">
                  {posts.map((post) => (
                    <div
                      className="blog-collection-item w-dyn-item"
                      data-tag={post.tags[0] ?? ''}
                      key={post.slug}
                      role="listitem"
                    >
                      <div className="blog-card">
                        <div className="blog-top-wrap">
                          <div className="blog-author-wrap">
                            {post.author ? (
                              <div className="blog-author-name-wrap">
                                <span className="blog-author-name">{post.author}</span>
                                {post.publishedAt ? (
                                  <p className="blog-date">{post.publishedAt}</p>
                                ) : null}
                              </div>
                            ) : post.publishedAt ? (
                              <p className="blog-date">{post.publishedAt}</p>
                            ) : null}
                          </div>
                          {post.tags[0] ? (
                            <span className="blog-category">{post.tags[0]}</span>
                          ) : null}
                        </div>

                        {post.coverImage?.url ? (
                          <Link
                            aria-hidden="true"
                            className="blog-image-area w-inline-block"
                            href={`/blog/${post.slug}`}
                            tabIndex={-1}
                          >
                            <div className="blog-image-wrap">
                              <img
                                alt=""
                                className="blog-image"
                                loading="lazy"
                                src={post.coverImage.url}
                              />
                            </div>
                          </Link>
                        ) : null}

                        <h2 className="blog-card-heading">
                          <Link className="blog-title" href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h2>
                        {post.excerpt || post.lead ? (
                          <p className="blog-card-excerpt">{post.excerpt || post.lead}</p>
                        ) : null}
                        <div className="blog-card-footer">
                          <Link
                            className="blog-read-link"
                            href={`/blog/${post.slug}`}
                            aria-label={`Read article: ${post.title}`}
                          >
                            Read article <span aria-hidden="true">↗</span>
                          </Link>
                          {post.readingTime ? <span>{post.readingTime}</span> : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {posts.length === 0 ? (
                  <div className="w-dyn-empty">
                    <div>No items found.</div>
                  </div>
                ) : null}
              </div>
            </BlogTabs>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-whole-area">
            <div className="w-layout-blockcontainer medium-container w-container">
              <div className="cta-area">
                <div className="cta-wrap">
                  <div className="cta-title-wrap">
                    <h2 className="cta-title">Get Started Today</h2>
                    <div className="cta-content-wrap">
                      <p className="cta-content">Get to know me. I&apos;ll get to know you.</p>
                    </div>
                    <div className="cta-button-area">
                      <div className="cta-button-wrap">
                        <Link
                          className="primary-button w-inline-block"
                          data-analytics-cta-id="blog_band_try_free"
                          data-analytics-event="official_cta_clicked"
                          data-analytics-placement="cta_band"
                          href={OFFICIAL_PRODUCT_AUTH_URL}
                        >
                          <div className="button-text-wrap">
                            <div className="button-text">
                              <div>Join Waitlist</div>
                            </div>
                            <div className="button-arrow-wrap">
                              <img
                                alt="Button Arrow"
                                className="button-arrow"
                                loading="lazy"
                                src="/assets/prototype/images/button-arrow.svg"
                              />
                            </div>
                            <div className="button-arrow-wrap two">
                              <img
                                alt="Button Arrow"
                                className="button-arrow"
                                loading="lazy"
                                src="/assets/prototype/images/button-arrow.svg"
                              />
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
