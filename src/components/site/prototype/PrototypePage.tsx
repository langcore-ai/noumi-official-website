import { getPageMotion, getPrototypePage } from '@/lib/site/prototype/pages'
import { PrototypeEffects } from './PrototypeEffects'
import { OfficialUseCasesGallery } from '../official/OfficialUseCasesGallery'

/** Only build-time reviewed local HTML is accepted, never CMS or request-supplied markup. */
export function PrototypePage({ route }: { route: string }) {
  const page = getPrototypePage(route)
  if (!page) return null
  const nativeUseCases = route === '/use-cases'
  const html =
    route === '/use-cases'
      ? page.html.slice(page.html.indexOf('<section class="regular-section bottom-space">'))
      : page.html
  return (
    <div className="page-body">
      <noscript>
        <style>{`
          body:has(> div[hidden] > .page-body > :is(.prototype-page, .native-use-cases-page)) { display: flex; flex-direction: column; }
          body:has(> div[hidden] > .page-body > :is(.prototype-page, .native-use-cases-page)) .page-shell { display: contents; }
          body:has(> div[hidden] > .page-body > :is(.prototype-page, .native-use-cases-page)) .site-header { order: 1; }
          body > div[hidden]:has(> .page-body > :is(.prototype-page, .native-use-cases-page)) { display: block !important; order: 2; }
          body:has(> div[hidden] > .page-body > :is(.prototype-page, .native-use-cases-page)) .site-footer { order: 3; }
          body:has(.prototype-page, .native-use-cases-page) .route-loading { display: none !important; }
        `}</style>
      </noscript>
      <main
        className={nativeUseCases ? 'native-use-cases-page' : `prototype-page ${page.bodyClass}`}
        data-prototype-source={page.file}
      >
        {route === '/use-cases' && <OfficialUseCasesGallery />}
        <div
          className={nativeUseCases ? `prototype-page ${page.bodyClass}` : undefined}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <PrototypeEffects key={route} motion={getPageMotion(page)} />
      </main>
    </div>
  )
}
