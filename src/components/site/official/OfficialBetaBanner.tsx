'use client'

import Link from 'next/link'

/** 官网顶部公告横幅。 */
export function OfficialBetaBanner() {
  return (
    <aside aria-label="Latest Noumi article" className="official-beta-banner">
      <div className="official-beta-banner__inner">
        <p className="official-beta-banner__title">
          What Is AI in HR? The Definition Most Teams Get Wrong -{' '}
          <Link className="official-beta-banner__link" href="/blog/what-is-ai-in-hr">
            Read the blog
          </Link>
        </p>
        <span aria-hidden="true" className="official-beta-banner__arrow">
          →
        </span>
      </div>
    </aside>
  )
}
