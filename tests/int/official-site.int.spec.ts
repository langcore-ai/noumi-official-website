import { describe, expect, it } from 'vitest'

import {
  createOfficialMetadata,
  OFFICIAL_APPLE_TOUCH_ICON,
  OFFICIAL_FAVICON,
  OFFICIAL_FAVICON_LARGE,
  OFFICIAL_FAVICON_SMALL,
  OFFICIAL_SHORTCUT_ICON,
  OFFICIAL_SITE_URL,
} from '@/lib/site/official-site'

describe('official site metadata', () => {
  it('declares stable favicons for Google Search and browser fallbacks', () => {
    const metadata = createOfficialMetadata({
      title: 'Noumi',
      description: 'Noumi official site',
      pathname: '/',
    })

    const icons = metadata.icons as {
      apple: Array<{ sizes: string; type: string; url: string }>
      icon: Array<{ sizes: string; type: string; url: string }>
      shortcut: string
    }

    expect(metadata.metadataBase?.toString()).toBe(`${OFFICIAL_SITE_URL}/`)
    expect(icons.shortcut).toBe(OFFICIAL_SHORTCUT_ICON)
    expect(icons.icon).toEqual([
      {
        url: OFFICIAL_FAVICON,
        sizes: '96x96',
        type: 'image/png',
      },
      {
        url: OFFICIAL_FAVICON_SMALL,
        sizes: '48x48',
        type: 'image/png',
      },
      {
        url: OFFICIAL_FAVICON_LARGE,
        sizes: '192x192',
        type: 'image/png',
      },
    ])
    expect(icons.apple).toEqual([
      {
        url: OFFICIAL_APPLE_TOUCH_ICON,
        sizes: '180x180',
        type: 'image/png',
      },
    ])
  })
})
