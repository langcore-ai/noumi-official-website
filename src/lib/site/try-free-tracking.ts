import { buildOfficialGoogleTagPageViewPayload } from './analytics'

/** Delegation also covers CMS-rendered links and clicks on icons inside buttons. */
export function getTryFreeClickPayload(target: EventTarget | null) {
  if (!(target instanceof Element)) return null
  const button = target.closest<HTMLElement>('a, button, [role="button"]')
  if (!button) return null
  const text = (button.textContent || '').replace(/\s+/g, ' ').trim()
  const explicitAction = button.dataset.trackAction
  const isTryFree = explicitAction
    ? explicitAction === 'try_free'
    : /(?:^|_)try_free$/.test(button.dataset.analyticsCtaId || '') ||
      /^try noumi free(?:\s*[→↗›»])?$/i.test(text)
  if (!isTryFree) return null
  return {
    ...buildOfficialGoogleTagPageViewPayload({
      baseUrl: window.location.origin,
      pathname: window.location.pathname,
      title: document.title,
    }),
    button_text: text.slice(0, 100),
    button_location: (
      button.dataset.trackLocation ||
      button.dataset.analyticsPlacement ||
      (button.closest('header, nav')
        ? 'header'
        : button.closest('footer')
          ? 'footer'
          : button.closest('.official-cta-band')
            ? 'cta_band'
            : 'content')
    ).slice(0, 100),
    cta_id: (button.dataset.analyticsCtaId || '').slice(0, 100),
  }
}
