import Link from 'next/link'
import { notFound } from 'next/navigation'

import { OfficialContentSections } from '@/components/site/official/OfficialContentSections'
import { OfficialRawHtml } from '@/components/site/official/OfficialRawHtml'
import { getOfficialBlogPost } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'
import { renderMarkdownToHtml } from '@/lib/site/markdown'

import './blog-article.css'
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

/** 原型 FAQ 图标结构：竖线在展开时由 CSS 隐藏，形成减号。 */
function FaqIcon() {
  return (
    <div className="faq-icon-wrap">
      <div className="faq-vertical-line" />
      <div className="faq-horizontal-line" />
    </div>
  )
}

/**
 * 博客详情页
 * Markdown 模式使用原型 `blog-article.html` 的版式（banner-section-2 / blog-post-section-2 /
 * FAQ / 上一篇 / cta-section），正文与 FAQ 回答经白名单净化后输出。
 * @param props 路由参数
 * @returns 页面内容
 */
export default async function BlogPostPage(props: BlogPostPageProps) {
  const { slug } = await props.params
  const post = await getOfficialBlogPost(slug)

  if (!post) {
    notFound()
  }

  // HTML 模式保留原样渲染，作为迁移期间的回滚路径。
  if (post.renderMode === 'html') {
    return (
      <div className="page-body">
        <OfficialRawHtml html={post.htmlContent || ''} />
      </div>
    )
  }

  if (post.renderMode === 'markdown') {
    const previousPost = post.relatedPosts[0]

    return (
      <div className="page-body">
        <main className="prototype-page body-14 blog-article">
          <section className="banner-section-2">
            <div className="w-layout-blockcontainer regular-container w-container">
              <div className="blog-post-banner-wrap">
                <div className="blog-post-title-wrap blog-title-wrap-width">
                  {post.tags[0] ? (
                    <Link className="blog-category-wrap-2 blog-title-left" href="/blog">
                      {post.tags[0]}
                    </Link>
                  ) : null}
                  <h1 className="blog-post-title-2 blog-title-left">{post.title}</h1>
                </div>

                <div className="blog-post-author-area-2">
                  <div className="blog-author-wrap">
                    {post.author || post.publishedAt ? (
                      <div className="blog-author-name-wrap">
                        {post.author ? (
                          <div className="blog-author-name-2">{post.author}</div>
                        ) : null}
                        {post.publishedAt ? (
                          <p className="blog-date-2">{post.publishedAt}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="blog-post-social-area">
                    {post.readingTime ? (
                      <div className="text-block-33 blog-date-2">{post.readingTime}</div>
                    ) : null}
                  </div>
                </div>

                {post.coverImage?.url ? (
                  <div className="blog-post-image-area">
                    <div className="blog-post-image-wrap">
                      <img
                        alt={`${post.title} cover image`}
                        className="blog-post-image"
                        loading="lazy"
                        src={post.coverImage.url}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <section className="blog-post-section-2">
                <div className="w-layout-blockcontainer small-container small-container-width small-containermaxw w-container">
                  {post.excerpt || post.lead ? (
                    <p className="blog-article-lead">{post.excerpt || post.lead}</p>
                  ) : null}

                  <div
                    className="regular-summary-2 regular-summary-limit w-richtext blog-article-body"
                    // 渲染结果已过 rehype-sanitize 白名单，可安全注入。
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdownToHtml(post.markdownContent || ''),
                    }}
                  />

                  {previousPost ? (
                    <div className="w-layout-blockcontainer container-3 w-container">
                      <div className="section-top-area section-top-center">
                        <div className="section-title-area">
                          <div className="section-title-wrap left-align">
                            <div className="subtitle-wrap">
                              <div className="subtitle-arrow-wrap left">
                                <img
                                  alt="Subtitle Arrow"
                                  className="subtitle-arrow"
                                  loading="lazy"
                                  src="/assets/prototype/images/subtitle-arrow_1.svg"
                                />
                              </div>
                              <p className="subtitle-2">Previous post</p>
                              <div className="subtitle-arrow-wrap right">
                                <img
                                  alt="Subtitle Arrow"
                                  className="subtitle-arrow"
                                  loading="lazy"
                                  src="/assets/prototype/images/subtitle-arrow.svg"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="blog-card-area-2 blog-card-center">
                        {previousPost.coverImage?.url ? (
                          <div className="w-layout-blockcontainer container w-container">
                            <img alt="" loading="lazy" src={previousPost.coverImage.url} />
                          </div>
                        ) : null}
                        <div className="w-layout-blockcontainer container-2 w-container">
                          <div className="text-block-34">{previousPost.title}</div>
                          <div className="text-block-35">
                            {previousPost.excerpt || previousPost.lead || ''}
                          </div>
                          <Link
                            className="white-button white-button-new w-inline-block"
                            href={`/blog/${previousPost.slug}`}
                          >
                            <div className="button-text-wrap">
                              <div className="button-text">
                                <div>Read More</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </section>

          {post.faqItems.length > 0 ? (
            <section className="regular-section bottom-space">
              <div className="w-layout-blockcontainer regular-container w-container">
                <div className="section-title-area">
                  <div className="section-title-wrap medium">
                    <div className="subtitle-wrap">
                      <div className="subtitle-arrow-wrap left">
                        <img
                          alt="Subtitle Arrow"
                          className="subtitle-arrow"
                          loading="lazy"
                          src="/assets/prototype/images/subtitle-arrow_1.svg"
                        />
                      </div>
                      <p className="subtitle">FAQ</p>
                      <div className="subtitle-arrow-wrap right">
                        <img
                          alt="Subtitle Arrow"
                          className="subtitle-arrow"
                          loading="lazy"
                          src="/assets/prototype/images/subtitle-arrow.svg"
                        />
                      </div>
                    </div>
                    <h2 className="section-title">Frequently Asked Questions</h2>
                  </div>
                </div>

                <div className="faq-area">
                  {post.faqItems.map((item) => (
                    <details className="faq w-dropdown" key={item.id}>
                      <summary className="faq-question w-dropdown-toggle">
                        <div>{item.question}</div>
                        <FaqIcon />
                      </summary>
                      <div className="faq-answer-wrap faq-answer-align w-dropdown-list">
                        <div
                          className="faq-answer blog-article-faq-answer"
                          // 渲染结果已过 rehype-sanitize 白名单，可安全注入。
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdownToHtml(item.answerMarkdown),
                          }}
                        />
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

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
                            data-analytics-cta-id="blog_article_band_try_free"
                            data-analytics-event="official_cta_clicked"
                            data-analytics-placement="cta_band"
                            href="https://www.noumi.ai/auth"
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

  return (
    <div className={`${styles.blogPostPage} page-body`}>
      <main className={styles.postWrap}>
        <Link className={`${styles.postBack} reveal`} href="/blog">
          ← Back to Blog
        </Link>

        <article>
          <header className={`${styles.postHeader} reveal d1`}>
            <div className={styles.postTags}>
              {post.tags[0] ? <span className={styles.postTag}>{post.tags[0]}</span> : null}
              <span className={styles.postMetaRow}>
                {[post.publishedAt, post.readingTime].filter(Boolean).join(' · ')}
              </span>
            </div>
            <h1>{post.title}</h1>
            {post.lead || post.excerpt ? (
              <p className={styles.postLead}>{post.lead || post.excerpt}</p>
            ) : null}
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
            <Link className={styles.moreViewAll} href="/blog">
              View all →
            </Link>
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
                {post.relatedPosts[0].tags[0] ? (
                  <span className={styles.moreTag}>{post.relatedPosts[0].tags[0]}</span>
                ) : null}
                <span className={styles.moreMetaText}>
                  {[post.relatedPosts[0].readingTime, post.relatedPosts[0].publishedAt]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              <h3>{post.relatedPosts[0].title}</h3>
              <p>{post.relatedPosts[0].excerpt || post.relatedPosts[0].lead || ''}</p>
              <span className={styles.moreRead}>Read article →</span>
            </div>
          </Link>
        </section>
      ) : null}
    </div>
  )
}
