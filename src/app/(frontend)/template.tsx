import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { getManagedJsonLd } from '@/lib/site/managed-settings'
import { StructuredData } from '@/components/site/StructuredData'

/** Route templates remount during client navigation; do not put per-page JSON-LD in the persistent layout. */
export default async function FrontendTemplate({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get('x-noumi-pathname') || '/'
  const hasDefaultJsonLd =
    ['/', '/about', '/contact', '/blog', '/links'].includes(pathname) ||
    pathname.startsWith('/blog/')
  const jsonLd = hasDefaultJsonLd ? null : await getManagedJsonLd(pathname)
  return (
    <>
      {jsonLd && <StructuredData data={jsonLd} />}
      {children}
    </>
  )
}
