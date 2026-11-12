import './pricing-layout.css'
import { PricingPlans } from './PricingPlans'
import { createManagedMetadata } from '@/lib/site/managed-settings'

export function generateMetadata() {
  return createManagedMetadata({
    title: 'Plans & Pricing | Noumi',
    description:
      'Compare Noumi Basic, Pro, Max and Enterprise plans with monthly or yearly billing.',
    pathname: '/pricing',
  })
}
export default function Page() {
  return <PricingPlans />
}
