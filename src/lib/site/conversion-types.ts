/** 两个后台共用产品后端提供的 v1 只读统计契约；所有时间为 UTC。 */
export type ConversionAccount = {
  id: string
  email: string
  username: string | null
  createdAt: string
  emailVerified: boolean
  onboardingCompletedAt: string | null
  legacyOnboarding: boolean
}

export type ConversionVisitor = {
  visitorId: string
  firstSeenAt: string
  lastSeenAt: string
  pageViews: number
  enteredProductAt: string | null
  landingPage: string | null
  accounts: ConversionAccount[]
  association: 'unobserved' | 'linked' | 'ambiguous'
  registeredInWindow: boolean
  onboardedInWindow: boolean
}

export type ConversionDashboard = {
  version: 1
  configured: boolean
  generatedAt: string
  from: string
  to: string
  summary: {
    visitors: number
    enteredProduct: number
    registered: number
    onboarded: number
    ambiguous: number
  }
  visitors: ConversionVisitor[]
  total: number
  nextOffset: number | null
}

export type ConversionTimeline = {
  version: 1
  events: Array<{
    id: string
    event: string
    at: string
    surface: 'website' | 'product'
    path: string | null
  }>
  truncated: boolean
}
