import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/** About 页面主记录 ID。 */
const ABOUT_PAGE_ID = 1

/** About 页面支持的本地化语言。 */
const SITE_LOCALES = ['en', 'zh'] as const

/** 上传 HTML 中的人物卡片初始内容。 */
const TEAM_MEMBERS = [
  {
    description:
      "Scaled enterprise lines from zero to millions in ARR. Leads Noumi's strategy and digital employee vision.",
    id: 'abel',
    name: 'Abel',
    role: 'Founder & CEO',
  },
  {
    description:
      "Scaled a business from zero to $11M USD in revenue. Leads the design of Noumi's pre-sales digital employee.",
    id: 'arnold',
    name: 'Arnold',
    role: 'Co-founder & SE expert',
  },
  {
    description:
      "10+ years in enterprise AI and SaaS GTM, $100M+ in personal commercialization. Leads Noumi's global strategy.",
    id: 'chuck',
    name: 'Chuck',
    role: 'Head of Commercialization',
  },
  {
    description:
      "Scaled AI products to $1M ARR in record time. Spearheads Noumi's global expansion and international market growth.",
    id: 'mulan',
    name: 'Mulan',
    role: 'Head of Global Growth',
  },
  {
    description:
      'Cambridge MPhil researcher in platform economies. Bridges academic research and real-world growth across global markets.',
    id: 'ashley',
    name: 'Ashley',
    role: 'Growth & Insights Lead',
  },
  {
    description:
      "From eBay analytics to founding his own data-driven company. Leads Noumi's data analyst digital employee module.",
    id: 'tao',
    name: 'Tao',
    role: 'Data Analysis Expert',
  },
  {
    description:
      "Product lead across all role modules. Leads Noumi's overall product strategy and the PM digital employee design.",
    id: 'haoting',
    name: 'Haoting',
    role: 'VP of Product',
  },
  {
    description:
      "AI architect with deep ML and agentic expertise. Designed Noumi's core memory engine and execution framework.",
    id: 'billy',
    name: 'Billy',
    role: 'Co-founder & CTO',
  },
] as const

/** 上传 HTML 中的 FAQ 初始内容。 */
const FAQ_ITEMS = [
  {
    answer:
      '<p>Noumi is an AI personal assistant that works like a real colleague — understanding your context, managing your tasks, and delivering results without constant prompting. Unlike standard chatbots, Noumi builds <a href="/features/persistent-memory">persistent memory</a> across every interaction: your preferences, work style, and standards carry forward. The longer you use it, the less you have to explain.</p>',
    id: 'what-is-noumi',
    question: 'What is Noumi, and what does it actually do?',
  },
  {
    answer:
      '<p>Noumi handles the work that eats your time — drafting documents, researching topics, synthesising notes, managing follow-ups, and executing multi-step tasks autonomously. It can also develop new <a href="/features/self-evolving-skills">skills over time</a> tailored to your specific workflows. Think of it as a capable teammate that gets faster and sharper the more context it has. See the full picture on our <a href="/features">Features page</a>.</p>',
    id: 'day-to-day',
    question: 'What can Noumi actually do for me day-to-day?',
  },
  {
    answer:
      '<p>Noumi is built for knowledge workers who rely on AI daily and are frustrated by re-explaining themselves every session — <a href="/use-cases/product-manager">product managers</a>, <a href="/use-cases/solutions-engineer">solutions engineers</a>, <a href="/use-cases/journalist">journalists</a>, consultants, and anyone whose work requires depth, context, and judgment. If you find yourself pasting the same background into AI tools repeatedly, Noumi is designed to solve exactly that.</p>',
    id: 'who-for',
    question: 'Who is Noumi built for?',
  },
  {
    answer:
      "<p>Yes. Your data belongs to you. We don't use your interactions to train shared models, and memory is stored in isolated, encrypted environments per user. You can export or delete your memory at any time. See our <a href=\"/privacy\">Privacy Policy</a> and <a href=\"/terms\">Terms of Service</a> for full details.</p>",
    id: 'privacy-security',
    question: 'Is my data private and secure?',
  },
  {
    answer:
      '<p>You can get started for free — no credit card required. Free access gives you a real sense of how Noumi\'s memory and execution engine work. Paid plans unlock advanced features and higher usage limits. See our <a href="/pricing">Pricing page</a> for the full breakdown.</p>',
    id: 'cost',
    question: 'How much does Noumi cost?',
  },
  {
    answer:
      '<p>We\'re a small, senior team — and deliberately so. Every core member has spent years building and shipping real products: some have scaled businesses from zero to millions in revenue, others come from deep AI research and enterprise SaaS. We believe a tight group of experienced builders moves faster and makes better decisions than a large one. We\'re actively onboarding early users and iterating fast. Follow our thinking on the <a href="/blog">Noumi blog</a>.</p>',
    id: 'team',
    question: "Who's behind Noumi?",
  },
  {
    answer:
      '<p>We\'re always looking for people who want to define what AI actually working looks like. What matters to us isn\'t a specific background — it\'s conviction, craft, and judgment. Drop us a note at <a href="mailto:hr@noumi.ai">hr@noumi.ai</a> with a short intro and what you\'d bring. We read everything.</p>',
    id: 'join',
    question: 'How can I join the Noumi team?',
  },
] as const

/** 上传 HTML 中的 FAQ 标题区初始内容。 */
const FAQ_HEADER = {
  description: "Everything you want to know about Noumi, the team, and what we're building.",
  eyebrow: 'Questions',
  title: 'Frequently asked.',
} as const

/**
 * 创建 About 页面所需表结构。
 * @param db 数据库连接
 */
async function createAboutTables(db: MigrateUpArgs['db']): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_page_team_members\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`avatar_id\` integer,
    \`name\` text,
    \`role\` text,
    \`description\` text,
    FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`about_page_team_members_order_idx\` ON \`about_page_team_members\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`about_page_team_members_parent_id_idx\` ON \`about_page_team_members\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`about_page_team_members_locale_idx\` ON \`about_page_team_members\` (\`_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`about_page_team_members_avatar_idx\` ON \`about_page_team_members\` (\`avatar_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_page_faq_items\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`question\` text,
    \`answer\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`about_page_faq_items_order_idx\` ON \`about_page_faq_items\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`about_page_faq_items_parent_id_idx\` ON \`about_page_faq_items\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`about_page_faq_items_locale_idx\` ON \`about_page_faq_items\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_page\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_status\` text DEFAULT 'draft',
    \`updated_at\` text,
    \`created_at\` text
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`about_page__status_idx\` ON \`about_page\` (\`_status\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_page_locales\` (
    \`faq_eyebrow\` text,
    \`faq_title\` text,
    \`faq_description\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`about_page_locales_locale_parent_id_unique\` ON \`about_page_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_page_v_version_team_members\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`avatar_id\` integer,
    \`name\` text,
    \`role\` text,
    \`description\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_version_team_members_order_idx\` ON \`_about_page_v_version_team_members\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_version_team_members_parent_id_idx\` ON \`_about_page_v_version_team_members\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_version_team_members_locale_idx\` ON \`_about_page_v_version_team_members\` (\`_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_version_team_members_avatar_idx\` ON \`_about_page_v_version_team_members\` (\`avatar_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_page_v_version_faq_items\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`question\` text,
    \`answer\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_version_faq_items_order_idx\` ON \`_about_page_v_version_faq_items\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_version_faq_items_parent_id_idx\` ON \`_about_page_v_version_faq_items\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_version_faq_items_locale_idx\` ON \`_about_page_v_version_faq_items\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_page_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`version__status\` text DEFAULT 'draft',
    \`version_updated_at\` text,
    \`version_created_at\` text,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`snapshot\` integer,
    \`published_locale\` text,
    \`latest\` integer,
    \`autosave\` integer
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_version_version__status_idx\` ON \`_about_page_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_created_at_idx\` ON \`_about_page_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_updated_at_idx\` ON \`_about_page_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_snapshot_idx\` ON \`_about_page_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_published_locale_idx\` ON \`_about_page_v\` (\`published_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_about_page_v_latest_idx\` ON \`_about_page_v\` (\`latest\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_page_v_locales\` (
    \`version_faq_eyebrow\` text,
    \`version_faq_title\` text,
    \`version_faq_description\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_about_page_v_locales_locale_parent_id_unique\` ON \`_about_page_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
}

/**
 * 写入 About 页面初始内容。
 * @param db 数据库连接
 */
async function seedAboutContent(db: MigrateUpArgs['db']): Promise<void> {
  await db.run(sql`INSERT OR IGNORE INTO \`about_page\` (
    \`id\`,
    \`_status\`,
    \`updated_at\`,
    \`created_at\`
  ) VALUES (
    ${ABOUT_PAGE_ID},
    'published',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );`)

  for (const [localeIndex, locale] of SITE_LOCALES.entries()) {
    await db.run(sql`INSERT OR IGNORE INTO \`about_page_locales\` (
      \`faq_eyebrow\`,
      \`faq_title\`,
      \`faq_description\`,
      \`id\`,
      \`_locale\`,
      \`_parent_id\`
    ) VALUES (
      ${FAQ_HEADER.eyebrow},
      ${FAQ_HEADER.title},
      ${FAQ_HEADER.description},
      ${910100 + localeIndex},
      ${locale},
      ${ABOUT_PAGE_ID}
    );`)

    for (const [memberIndex, member] of TEAM_MEMBERS.entries()) {
      await db.run(sql`INSERT OR IGNORE INTO \`about_page_team_members\` (
        \`_order\`,
        \`_parent_id\`,
        \`_locale\`,
        \`id\`,
        \`avatar_id\`,
        \`name\`,
        \`role\`,
        \`description\`
      ) VALUES (
        ${memberIndex + 1},
        ${ABOUT_PAGE_ID},
        ${locale},
        ${`about-team-${member.id}-${locale}`},
        NULL,
        ${member.name},
        ${member.role},
        ${member.description}
      );`)
    }

    for (const [faqIndex, item] of FAQ_ITEMS.entries()) {
      await db.run(sql`INSERT OR IGNORE INTO \`about_page_faq_items\` (
        \`_order\`,
        \`_parent_id\`,
        \`_locale\`,
        \`id\`,
        \`question\`,
        \`answer\`
      ) VALUES (
        ${faqIndex + 1},
        ${ABOUT_PAGE_ID},
        ${locale},
        ${`about-faq-${item.id}-${locale}`},
        ${item.question},
        ${item.answer}
      );`)
    }
  }
}

/**
 * 新增 About 页面全局配置。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await createAboutTables(db)
  await seedAboutContent(db)
}

/**
 * 回滚 About 页面全局配置。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`_about_page_v_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_about_page_v_version_faq_items\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_about_page_v_version_team_members\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_about_page_v\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`about_page_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`about_page_faq_items\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`about_page_team_members\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`about_page\`;`)
}
