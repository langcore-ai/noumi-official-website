import { notFound } from 'next/navigation'
import { PrototypePage } from '@/components/site/prototype/PrototypePage'
import { getPrototypePage, prototypeMetadata } from '@/lib/site/prototype/pages'

type Props = { params: Promise<{ prototype: string[] }> }
export async function generateMetadata({ params }: Props) {
  return prototypeMetadata('/' + (await params).prototype.join('/'))
}
export default async function Page({ params }: Props) {
  const route = '/' + (await params).prototype.join('/')
  if (!getPrototypePage(route)) notFound()
  return <PrototypePage route={route} />
}
