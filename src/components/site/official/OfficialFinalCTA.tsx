import Link from 'next/link'
import {
  OFFICIAL_PRODUCT_AUTH_TARGET_PATH,
  OFFICIAL_PRODUCT_AUTH_URL,
} from '@/lib/site/official-site'
import styles from './OfficialFinalCTA.module.css'

/** Shared closing invitation, rendered once before the global footer. */
export function OfficialFinalCTA() {
  return (
    <section className={styles.section} id="final-cta" aria-labelledby="final-cta-title">
      <div className={styles.card}>
        <div>
          <h2 id="final-cta-title">Complex requirements? Deliver with Noumi.</h2>
          <p>Turn complex project work into deliverables you can confidently share.</p>
        </div>
        <Link
          className="noumi-modern-cta"
          href={OFFICIAL_PRODUCT_AUTH_URL}
          data-analytics-cta-id="global_band_try_free"
          data-analytics-event="official_cta_clicked"
          data-analytics-placement="cta_band"
          data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
        >
          Try Noumi Free
        </Link>
      </div>
    </section>
  )
}
