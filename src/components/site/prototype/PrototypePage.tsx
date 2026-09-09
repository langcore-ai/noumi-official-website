import { getPageMotion, getPrototypePage } from '@/lib/site/prototype/pages'
import { PrototypeEffects } from './PrototypeEffects'

/** Only build-time reviewed local HTML is accepted, never CMS or request-supplied markup. */
export function PrototypePage({ route }: { route: string }) {
  const page = getPrototypePage(route)
  if (!page) return null
  return (
    <div className="page-body">
      <main className={`prototype-page ${page.bodyClass}`} data-prototype-source={page.file}>
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
        <PrototypeEffects key={route} motion={getPageMotion(page)} />
      </main>
    </div>
  )
}
