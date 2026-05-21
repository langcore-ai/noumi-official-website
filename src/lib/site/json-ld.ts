import { OFFICIAL_LOGO, OFFICIAL_SITE_URL } from '@/lib/site/official-site'

/** 结构化数据可序列化对象。 */
export type JsonLdObject = Record<string, unknown>

/** Noumi 产品介绍，供首页和定价页复用。 */
const NOUMI_PRODUCT_DESCRIPTION =
  'Noumi is your AI personal assistant that autonomously manages tasks, learns from you, and delivers results like a colleague. Boost productivity effortlessly!'

/** 官网根地址，JSON-LD 文档要求首页保留结尾斜杠。 */
const OFFICIAL_HOME_URL = `${OFFICIAL_SITE_URL}/`

/** 官网品牌 Logo 绝对地址。 */
const OFFICIAL_LOGO_URL = `${OFFICIAL_SITE_URL}${OFFICIAL_LOGO}`

/** Noumi 官方社媒账号。 */
const OFFICIAL_SOCIAL_PROFILES = [
  'https://x.com/Noumi_ai',
  'https://www.linkedin.com/company/noumi-ai/',
  'https://www.youtube.com/@Noumi-AI',
] as const

/** Noumi 对外售卖方案，用于 SoftwareApplication offers。 */
const NOUMI_OFFERS = [
  {
    '@type': 'Offer',
    name: 'Starter',
    price: '20',
    priceCurrency: 'USD',
    description:
      '1,200 points per month, Claude Sonnet model, 1 Light System, Persistent Memory, Community support. Free for 1 month.',
  },
  {
    '@type': 'Offer',
    name: 'Pro',
    price: '100',
    priceCurrency: 'USD',
    description:
      '6,000 points per month, Claude Sonnet + Opus models, 5 Light Systems, Self-Evolving Skills, Agentic task execution, Unlimited Persistent Memory.',
  },
] as const

/** SoftwareApplication 节点，首页 graph 与定价页独立脚本共用同一份产品语义。 */
const NOUMI_SOFTWARE_APPLICATION_NODE = {
  '@type': 'SoftwareApplication',
  name: 'Noumi',
  url: OFFICIAL_HOME_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: NOUMI_PRODUCT_DESCRIPTION,
  offers: NOUMI_OFFERS,
} as const

/** 文档指定的页面级 SEO 文案。 */
export const OFFICIAL_JSON_LD_PAGE_META = {
  features: {
    title: 'AI That Remembers, Evolves, and Executes for You | Noumi',
    description:
      "Stop re-explaining yourself. Noumi's persistent memory, self-evolving skills, and autonomous execution get more capable every single session.",
    pathname: '/features',
  },
  useCases: {
    title: 'Discover How Noumi Fits Any Professional Workflow | Noumi',
    description:
      'Noumi works like a real colleague across roles — from PMs and journalists to engineers — remembering context and getting the work done faster.',
    pathname: '/use-cases',
  },
  blog: {
    title: 'AI Tips, Guides & Strategies for Working Smarter | Noumi',
    description:
      'Deep dives, quick wins, and product updates from Noumi — on AI productivity, autonomous execution, and building a workflow that works for you.',
    pathname: '/blog',
  },
  pricing: {
    title: 'Start Free for a Month, Upgrade When It Earns It | Noumi',
    description:
      'Simple, transparent pricing for Noumi. Try Starter free for your first month, then upgrade to Pro when Noumi genuinely earns it. No surprises ever.',
    pathname: '/pricing',
  },
  about: {
    title: 'The Company Making AI Work Like a Real Colleague | Noumi',
    description:
      'We believe AI should know you — not just answer you. Noumi is built by a team obsessed with making AI work like a real colleague in your workflow.',
    pathname: '/about',
  },
  contact: {
    title: 'Have a Question? Reach the Noumi Team Directly | Noumi',
    description:
      'Have a question or feedback? Reach the Noumi team at official@noumi.ai — we respond personally to every message and love hearing from users.',
    pathname: '/contact',
  },
} as const

/** 文档指定的共用 FAQ 结构化数据条目。 */
const NOUMI_SHARED_FAQ_ENTITIES = [
  {
    '@type': 'Question',
    name: 'How is Noumi different from ChatGPT or other AI assistants?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Most AI assistants start fresh with every new conversation. Noumi maintains persistent memory across sessions — it knows your projects, preferences, and working rules without you re-explaining them. It also executes multi-step tasks autonomously and accumulates your work patterns into reusable skills over time, so it gets meaningfully better the more you use it.',
    },
  },
  {
    '@type': 'Question',
    name: 'What file types can Noumi work with?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Noumi handles documents (Word, PDF), spreadsheets (Excel, CSV), images (PNG, JPG), and audio files (MP3, WAV, M4A). Files can be uploaded directly to a project workspace, and Noumi processes them as part of any task — no separate import step required.',
    },
  },
  {
    '@type': 'Question',
    name: 'How does persistent memory actually work?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'When you correct an output, set a rule, or describe a preference, Noumi saves it as a memory entry tied to your project or your global profile. On future tasks, those entries are loaded automatically and shape how Noumi works. You can review, edit, or delete any entry at any time through the Evolution Report.',
    },
  },
  {
    '@type': 'Question',
    name: 'Can my team use the same workspace?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: "Yes. Workspace owners can invite collaborators on a per-project basis. Collaborators can access files, open new work threads, and contribute to the project — but cannot see each other's private conversations. File changes sync in real time across everyone in the project.",
    },
  },
  {
    '@type': 'Question',
    name: 'What is the Agent Training Ground?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'The Agent Training Ground is where you proactively build project-level skills. Upload style guides, report templates, evaluation criteria, or any reference material — Noumi reads them and converts them into structured skill entries it applies automatically to every relevant task in that project.',
    },
  },
  {
    '@type': 'Question',
    name: 'Do I need to set anything up before using Noumi?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'No manual configuration required. After registration, Noumi guides you through a short onboarding: upload your résumé or LinkedIn profile, and it recommends a matched set of professional skills to install. You can be up and running in under five minutes.',
    },
  },
] as const

/** 首页 WebSite + Organization + SoftwareApplication 结构化数据。 */
export const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Noumi',
      url: OFFICIAL_HOME_URL,
    },
    {
      '@type': 'Organization',
      name: 'Noumi',
      url: OFFICIAL_HOME_URL,
      logo: {
        '@type': 'ImageObject',
        url: OFFICIAL_LOGO_URL,
      },
      description: NOUMI_PRODUCT_DESCRIPTION,
      sameAs: OFFICIAL_SOCIAL_PROFILES,
    },
    NOUMI_SOFTWARE_APPLICATION_NODE,
  ],
} satisfies JsonLdObject

/** Features 聚合页 WebPage + BreadcrumbList + ItemList 结构化数据。 */
export const FEATURES_PAGE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: OFFICIAL_JSON_LD_PAGE_META.features.title,
      description: OFFICIAL_JSON_LD_PAGE_META.features.description,
      url: `${OFFICIAL_SITE_URL}/features`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: OFFICIAL_HOME_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Features',
          item: `${OFFICIAL_SITE_URL}/features`,
        },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Noumi Features',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Persistent Memory',
          url: `${OFFICIAL_SITE_URL}/features/persistent-memory`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Self-Evolving Skills',
          url: `${OFFICIAL_SITE_URL}/features/self-evolving-skills`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Autonomous Execution',
          url: `${OFFICIAL_SITE_URL}/features/autonomous-execution`,
        },
      ],
    },
  ],
} satisfies JsonLdObject

/** Features 聚合页 FAQPage 结构化数据。 */
export const FEATURES_FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: NOUMI_SHARED_FAQ_ENTITIES,
} satisfies JsonLdObject

/** Use Cases 聚合页 WebPage + BreadcrumbList + ItemList 结构化数据。 */
export const USE_CASES_PAGE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: OFFICIAL_JSON_LD_PAGE_META.useCases.title,
      description: OFFICIAL_JSON_LD_PAGE_META.useCases.description,
      url: `${OFFICIAL_SITE_URL}/use-cases`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: OFFICIAL_HOME_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Use Cases',
          item: `${OFFICIAL_SITE_URL}/use-cases`,
        },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Noumi Use Cases',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Noumi for Journalists',
          url: `${OFFICIAL_SITE_URL}/use-cases/journalist`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Noumi for Product Managers',
          url: `${OFFICIAL_SITE_URL}/use-cases/product-manager`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Noumi for Solutions Engineers',
          url: `${OFFICIAL_SITE_URL}/use-cases/solutions-engineer`,
        },
      ],
    },
  ],
} satisfies JsonLdObject

/** Use Cases 聚合页 FAQPage 结构化数据。 */
export const USE_CASES_FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: NOUMI_SHARED_FAQ_ENTITIES,
} satisfies JsonLdObject

/** Blog 聚合页 WebPage + BreadcrumbList 结构化数据。 */
export const BLOG_PAGE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: OFFICIAL_JSON_LD_PAGE_META.blog.title,
      description: OFFICIAL_JSON_LD_PAGE_META.blog.description,
      url: `${OFFICIAL_SITE_URL}/blog`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: OFFICIAL_HOME_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${OFFICIAL_SITE_URL}/blog`,
        },
      ],
    },
  ],
} satisfies JsonLdObject

/** Pricing 聚合页 WebPage + BreadcrumbList 结构化数据。 */
export const PRICING_PAGE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: OFFICIAL_JSON_LD_PAGE_META.pricing.title,
      description: OFFICIAL_JSON_LD_PAGE_META.pricing.description,
      url: `${OFFICIAL_SITE_URL}/pricing`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: OFFICIAL_HOME_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Pricing',
          item: `${OFFICIAL_SITE_URL}/pricing`,
        },
      ],
    },
  ],
} satisfies JsonLdObject

/** Pricing 页单独声明的 SoftwareApplication 结构化数据。 */
export const PRICING_SOFTWARE_APPLICATION_JSON_LD = {
  '@context': 'https://schema.org',
  ...NOUMI_SOFTWARE_APPLICATION_NODE,
} satisfies JsonLdObject

/** About 页 AboutPage + BreadcrumbList 结构化数据。 */
export const ABOUT_PAGE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      name: OFFICIAL_JSON_LD_PAGE_META.about.title,
      description: OFFICIAL_JSON_LD_PAGE_META.about.description,
      url: `${OFFICIAL_SITE_URL}/about`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: OFFICIAL_HOME_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'About',
          item: `${OFFICIAL_SITE_URL}/about`,
        },
      ],
    },
  ],
} satisfies JsonLdObject

/** Contact 页 ContactPage + BreadcrumbList 结构化数据。 */
export const CONTACT_PAGE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      name: OFFICIAL_JSON_LD_PAGE_META.contact.title,
      description: OFFICIAL_JSON_LD_PAGE_META.contact.description,
      url: `${OFFICIAL_SITE_URL}/contact`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: OFFICIAL_HOME_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Contact',
          item: `${OFFICIAL_SITE_URL}/contact`,
        },
      ],
    },
  ],
} satisfies JsonLdObject
