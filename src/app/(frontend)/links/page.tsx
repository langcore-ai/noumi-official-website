import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import {
  OfficialHomeFooter,
  OfficialHomeHeader,
} from '@/components/site/official/OfficialHomeChrome'
import {
  getOfficialFriendlyLinks,
  getOfficialUseCaseNavItems,
  type OfficialFriendlyLinkView,
} from '@/lib/site/official-cms'
import { createOfficialMetadata, OFFICIAL_SITE_URL } from '@/lib/site/official-site'

import styles from './links.module.css'

/** links 页面 SEO 标题。 */
const LINKS_PAGE_TITLE = 'Noumi Directory Listings — Find Us Across the Web | Noumi'
/** links 页面 SEO 描述。 */
const LINKS_PAGE_DESCRIPTION =
  'Noumi is listed across leading AI tool directories and resource hubs. Find us, rate us, or share Noumi with your community.'
/** links 页面路径。 */
const LINKS_PAGE_PATH = '/links'

/**
 * links 页面 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: LINKS_PAGE_TITLE,
    description: LINKS_PAGE_DESCRIPTION,
    pathname: LINKS_PAGE_PATH,
  })
}

/**
 * 生成 links 页面结构化数据。
 * @param links 友情链接列表
 * @returns JSON-LD 数据
 */
function createLinksJsonLd(links: OfficialFriendlyLinkView[]) {
  const pageUrl = `${OFFICIAL_SITE_URL}${LINKS_PAGE_PATH}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: 'Noumi Directory Listings — Find Us Across the Web',
        description: LINKS_PAGE_DESCRIPTION,
        isPartOf: { '@id': `${OFFICIAL_SITE_URL}/#website` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: OFFICIAL_SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Directory Listings',
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#directory-list`,
        name: 'Noumi on AI Tool Directories',
        numberOfItems: links.length,
        itemListElement: links.map((link, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: link.title,
          url: link.href,
        })),
      },
    ],
  }
}

/**
 * 合并 reveal 动画类名。
 * @param delayClass 延迟类名
 * @returns className
 */
function getRevealClass(delayClass?: string): string {
  return ['reveal', styles.reveal, delayClass].filter(Boolean).join(' ')
}

/**
 * 复刻静态稿中的卡片进入延迟。
 * @param index 当前卡片序号
 * @returns className
 */
function getCardRevealClass(index: number): string {
  if (index === 0) {
    return getRevealClass()
  }

  return getRevealClass(index < 3 ? styles.d1 : styles.d2)
}

/**
 * 友情链接头像。
 * @param props 友情链接视图
 * @returns 头像节点
 */
function FriendlyLinkAvatar(props: { link: OfficialFriendlyLinkView }) {
  const { link } = props

  if (!link.avatar?.url) {
    return null
  }

  return <img alt="" aria-hidden="true" className={styles.cardAvatarImage} src={link.avatar.url} />
}

/**
 * 友情链接页面。
 * @returns links 页面
 */
export default async function LinksPage() {
  const [links, useCases] = await Promise.all([
    getOfficialFriendlyLinks(),
    getOfficialUseCaseNavItems(),
  ])

  return (
    <div className={`page-body ${styles.linksPage}`}>
      <StructuredData data={createLinksJsonLd(links)} />
      <OfficialHomeHeader useCases={useCases} />

      <main>
        <section aria-labelledby="links-h1" className={styles.hero}>
          <div className={`${styles.heroCat} ${getRevealClass()}`}>
            <img
              alt=""
              aria-hidden="true"
              className={styles.heroCatImage}
              src="/assets/links/title-cat.webp"
            />
          </div>
          <div className={`${styles.badge} ${getRevealClass(styles.d1)}`}>Directory Listings</div>
          <h1 className={`${styles.heroTitle} ${getRevealClass(styles.d2)}`} id="links-h1">
            Noumi, across the web.
          </h1>
          <p className={`${styles.heroSub} ${getRevealClass(styles.d3)}`}>
            We&apos;re listed and reviewed across leading AI tool directories.
            <br />
            Find us, rate us, or share Noumi with your community.
          </p>
        </section>

        <section aria-label="Directory listings" className={styles.gridSection}>
          <div className={styles.directoryGrid}>
            {links.map((link, index) => (
              <article
                className={`${styles.directoryCard} ${getCardRevealClass(index)}`}
                key={link.id}
              >
                <div className={styles.cardTop}>
                  <FriendlyLinkAvatar link={link} />
                  <div className={styles.cardInfo}>
                    <h2 className={styles.cardDomain}>{link.title}</h2>
                    <p className={styles.cardCategory}>{link.description}</p>
                  </div>
                </div>
                <div className={styles.cardBottom}>
                  <a
                    className={styles.cardVisit}
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Visit <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="links-cta" className={styles.ctaBand}>
          <h2 className={getRevealClass()} id="links-cta">
            Across the web.
            <br />
            Inside <em>your workflow.</em>
          </h2>
          <p className={getRevealClass(styles.d1)}>Free to start. No credit card required.</p>
          <Link
            className={`${styles.creamButton} ${getRevealClass(styles.d2)}`}
            data-analytics-cta-id="links_band_try_free"
            data-analytics-event="official_cta_clicked"
            data-analytics-placement="cta_band"
            data-analytics-target-path="/invite"
            href="/invite"
          >
            Try Noumi free <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
