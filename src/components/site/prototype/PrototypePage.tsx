import { getPageMotion, getPrototypePage } from '@/lib/site/prototype/pages'
import { PrototypeEffects } from './PrototypeEffects'

/** Only build-time reviewed local HTML is accepted, never CMS or request-supplied markup. */
export function PrototypePage({ route }: { route: string }) {
  const page = getPrototypePage(route)
  if (!page) return null
  return (
    <div className="page-body">
      <noscript>
        <style>{`
          body:has(> div[hidden] > .page-body > .prototype-page) { display: flex; flex-direction: column; }
          body:has(> div[hidden] > .page-body > .prototype-page) .page-shell { display: contents; }
          body:has(> div[hidden] > .page-body > .prototype-page) .site-header { order: 1; }
          body > div[hidden]:has(> .page-body > .prototype-page) { display: block !important; order: 2; }
          body:has(> div[hidden] > .page-body > .prototype-page) .site-footer { order: 3; }
          body:has(.prototype-page) .route-loading { display: none !important; }
        `}</style>
      </noscript>
      <main className={`prototype-page ${page.bodyClass}`} data-prototype-source={page.file}>
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
        <PrototypeEffects key={route} motion={getPageMotion(page)} />
      </main>
    </div>
  )
}
