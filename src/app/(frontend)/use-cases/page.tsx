import Link from 'next/link'

import {
  OfficialHomeFooter,
  OfficialHomeHeader,
} from '@/components/site/official/OfficialHomeChrome'
import {
  getOfficialUseCaseNavItems,
  getOfficialUseCasesPage,
  type OfficialUseCasesCardTone,
} from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

import { UseCasesFaq } from './UseCasesFaq'
import styles from './use-cases.module.css'

/** Use Cases 聚合页固定 Hero 配置。 */
const HERO = {
  eyebrow: 'Built for the context-heavy',
  titlePrefix: 'Find Your',
  titleAccent: 'Use Case',
  description: (
    <>
      Noumi is for people living inside complex, always-evolving context.
      <br />
      Tired of starting from scratch every time? You&apos;re in the right place.
    </>
  ),
}

/** Use Cases 聚合页固定 CTA 配置。 */
const CTA = {
  title: 'Stop starting from scratch.',
  accent: 'Start compounding.',
  description: 'Your first month is free.',
  label: 'Start building your AI →',
  href: '/invite',
}

/** 卡片头像与视觉样式映射。 */
const CARD_STYLE_BY_TONE: Record<
  OfficialUseCasesCardTone,
  {
    avatarClassName: string
    cardClassName: string
  }
> = {
  pm: {
    avatarClassName: styles.ucAvatarPm,
    cardClassName: styles.ucCardPm,
  },
  journalist: {
    avatarClassName: styles.ucAvatarJournalist,
    cardClassName: styles.ucCardJournalist,
  },
  solutions: {
    avatarClassName: styles.ucAvatarSolutions,
    cardClassName: styles.ucCardSolutions,
  },
}

/**
 * Use Cases 聚合页 metadata
 */
export async function generateMetadata() {
  const page = await getOfficialUseCasesPage()

  return createOfficialMetadata({
    title: page.metaTitle ?? '',
    description: page.metaDescription ?? '',
    image: page.ogImage?.url,
    pathname: '/use-cases',
  })
}

/**
 * Use Cases 聚合页
 * @returns 聚合页内容
 */
export default async function UseCasesIndexPage() {
  const useCases = await getOfficialUseCaseNavItems()
  const page = await getOfficialUseCasesPage()
  const hasCards = page.cards.length > 0
  const hasMoreCard =
    Boolean(page.moreTitle) ||
    Boolean(page.moreDescription) ||
    useCases.length > 0 ||
    page.comingSoonRoles.length > 0
  const hasFaqHead =
    Boolean(page.faqEyebrow) || Boolean(page.faqTitle) || Boolean(page.faqDescription)
  const hasFaq = hasFaqHead || page.faqItems.length > 0
  const hasMainContent = hasCards || hasMoreCard || hasFaq

  return (
    <div className="page-body">
      <OfficialHomeHeader useCases={useCases} />

      <header className={styles.pageHero}>
        <div className={`${styles.heroCat} reveal`}>
          <img alt="" aria-hidden="true" src="/assets/use-cases/title.webp" />
        </div>
        <span className="sec-label reveal d1">{HERO.eyebrow}</span>
        <h1 className="reveal d2">
          {HERO.titlePrefix} <em>{HERO.titleAccent}</em>
        </h1>
        <p className="reveal d3">{HERO.description}</p>
      </header>

      {hasMainContent ? (
        <main className={styles.ucWrap}>
          {hasCards ? (
            <div className={styles.ucGrid}>
              {page.cards.map((card, index) => {
                const cardStyle = CARD_STYLE_BY_TONE[card.tone]

                return (
                  <Link
                    className={`${styles.ucCard} ${cardStyle.cardClassName} reveal d${Math.min(index + 1, 4)}`}
                    href={`/use-cases/${card.slug}`}
                    key={`${card.slug}-${index}`}
                  >
                    <div className={styles.ucCardBody}>
                      <div
                        aria-hidden="true"
                        className={`${styles.ucAvatar} ${cardStyle.avatarClassName}`}
                      >
                        <img alt="" src={card.avatarSrc} />
                      </div>
                      <div className={styles.ucCardText}>
                        <h2 className={styles.ucCardTitle}>{card.title}</h2>
                        <p className={styles.ucCardDesc}>{card.description}</p>
                        <div className={styles.ucCardCta}>{card.ctaLabel}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : null}

          {hasMoreCard ? (
            <div className={`${styles.ucMore} reveal`}>
              <div aria-hidden="true" className={styles.ucMoreCat}>
                <img alt="" src="/assets/use-cases/not-your-role.webp" />
              </div>
              <div className={styles.ucMoreText}>
                {page.moreTitle ? <h2>{page.moreTitle}</h2> : null}
                {page.moreDescription ? <p>{page.moreDescription}</p> : null}
                <div className={styles.ucRolesPills}>
                  {useCases.map((useCase) => (
                    <Link
                      className={styles.ucPill}
                      href={`/use-cases/${useCase.slug}`}
                      key={useCase.slug}
                    >
                      {useCase.label.replace(/^For\s+/i, '')}
                    </Link>
                  ))}
                  {page.comingSoonRoles.map((role) => (
                    <span className={`${styles.ucPill} ${styles.ucPillSoon}`} key={role}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {hasFaq ? (
            <div className={styles.ucFaqWrap}>
              {hasFaqHead ? (
                <div className={`${styles.ucFaqHead} reveal`}>
                  {page.faqEyebrow ? <span className="sec-label">{page.faqEyebrow}</span> : null}
                  {page.faqTitle ? <h2>{page.faqTitle}</h2> : null}
                  {page.faqDescription ? <p>{page.faqDescription}</p> : null}
                </div>
              ) : null}
              <UseCasesFaq items={page.faqItems} />
            </div>
          ) : null}
        </main>
      ) : null}

      <section aria-label="Call to action" className={styles.ctaBand}>
        <img
          alt=""
          aria-hidden="true"
          className={styles.ctaBandImg}
          src="/assets/use-cases/use-cases.webp"
        />
        <h2>
          {CTA.title}
          <br />
          <em>{CTA.accent}</em>
        </h2>
        <p>{CTA.description}</p>
        <Link className={`${styles.btnCream} ${styles.ctaBandBtn}`} href={CTA.href}>
          {CTA.label}
        </Link>
      </section>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
