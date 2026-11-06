/** Only accept a Google Tag Manager web container ID, never script or HTML. */
export function normalizeGtmContainerId(value?: string | null): string | null {
  const id = value?.trim() || ''
  return /^GTM-[A-Z0-9]+$/.test(id) ? id : null
}
