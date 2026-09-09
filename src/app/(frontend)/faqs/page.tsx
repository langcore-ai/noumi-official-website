import { PrototypePage } from '@/components/site/prototype/PrototypePage'
import { prototypeMetadata } from '@/lib/site/prototype/pages'

export function generateMetadata() {
  return prototypeMetadata('/faqs')
}
export default function Page() {
  return <PrototypePage route="/faqs" />
}
