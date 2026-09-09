import { PrototypePage } from '@/components/site/prototype/PrototypePage'
import { prototypeMetadata } from '@/lib/site/prototype/pages'

export function generateMetadata() {
  return prototypeMetadata('/terms')
}
export default function Page() {
  return <PrototypePage route="/terms" />
}
