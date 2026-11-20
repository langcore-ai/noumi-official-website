import { PrototypePage } from '@/components/site/prototype/PrototypePage'
import { prototypeMetadata } from '@/lib/site/prototype/pages'
import '../prototype-pages.css'
import styles from './faqs.module.css'

export function generateMetadata() {
  return prototypeMetadata('/faqs')
}
export default function Page() {
  return <PrototypePage route="/faqs" className={styles.page} />
}
