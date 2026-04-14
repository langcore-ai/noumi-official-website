import type { Block, Field } from 'payload'

/**
 * 复用的纯文本列表字段
 * @param name 字段名
 * @param label 后台标签
 * @param dbName 可选数据库字段名
 * @returns Payload 数组字段
 */
function createTextListField(name: string, label: string, dbName?: string): Field {
  return {
    name,
    type: 'array',
    dbName,
    label,
    fields: [
      {
        name: 'text',
        type: 'textarea',
        label: '内容',
        required: true,
      },
    ],
  }
}

/**
 * 复用的 CTA 字段组
 */
const CTA_FIELDS: Field[] = [
  {
    name: 'primaryCtaLabel',
    type: 'text',
    label: '主按钮文案',
  },
  {
    name: 'primaryCtaHref',
    type: 'text',
    label: '主按钮链接',
  },
  {
    name: 'secondaryCtaLabel',
    type: 'text',
    label: '次按钮文案',
  },
  {
    name: 'secondaryCtaHref',
    type: 'text',
    label: '次按钮链接',
  },
]

/**
 * 复用的 section 头部对齐字段
 * @returns Payload 选择字段
 */
function createSectionHeaderAlignmentField(): Field {
  return {
    name: 'headerAlignment',
    type: 'select',
    // 缩短数据库字段名，避免 block 表上的枚举标识超过 D1 / Drizzle 长度限制。
    dbName: 'hdr_align',
    label: '标题对齐',
    admin: {
      description: '控制角标、标题与描述的对齐方式；留空时沿用当前版式默认对齐。',
    },
    options: [
      {
        label: '左对齐',
        value: 'left',
      },
      {
        label: '居中',
        value: 'center',
      },
      {
        label: '右对齐',
        value: 'right',
      },
    ],
  }
}

/**
 * 共享 SEO 字段
 * 页面级 global 使用这组字段承接自定义 metadata。
 */
export const MARKETING_PAGE_SEO_FIELDS: Field[] = [
  {
    name: 'metaTitle',
    type: 'text',
    localized: true,
    label: 'SEO 标题',
  },
  {
    name: 'metaDescription',
    type: 'textarea',
    localized: true,
    label: 'SEO 描述',
  },
  {
    name: 'ogImage',
    type: 'upload',
    relationTo: 'media',
    localized: true,
    label: '分享图',
  },
]

/**
 * 共享 Hero 配置
 * 各营销页统一用该结构承接头部内容，降低字段命名对页面实现的耦合。
 */
export const MARKETING_HERO_FIELD: Field = {
  name: 'hero',
  type: 'group',
  localized: true,
  label: 'Hero',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'highlight',
      type: 'text',
      label: '高亮文案',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '主描述',
    },
    {
      name: 'supportingText',
      type: 'textarea',
      label: '补充描述',
    },
    {
      name: 'footnote',
      type: 'textarea',
      label: '尾注文案',
    },
    ...CTA_FIELDS,
  ],
}

/**
 * 共享段落 section
 * 适合文章正文、说明分节、列表摘要等纯文本块。
 */
const RICH_TEXT_SECTION_BLOCK: Block = {
  slug: 'rich-text-section',
  labels: {
    singular: 'Rich Text Section',
    plural: 'Rich Text Sections',
  },
  fields: [
    {
      name: 'slotKey',
      type: 'text',
      label: '槽位标识',
      admin: {
        description: '仅在前台存在固定插槽时填写；一般内容块可留空。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
    },
    createSectionHeaderAlignmentField(),
    createTextListField('paragraphs', '段落'),
    createTextListField('bullets', '列表'),
    {
      name: 'style',
      type: 'select',
      label: '样式',
      defaultValue: 'panel',
      options: [
        {
          label: 'Panel',
          value: 'panel',
        },
        {
          label: 'Plain',
          value: 'plain',
        },
        {
          label: 'Article',
          value: 'article',
        },
      ],
    },
  ],
}

/**
 * 共享卡片 section
 * 适合问题卡、步骤卡、定价卡、统计卡以及带左右分栏的内容块。
 */
const CARD_GRID_SECTION_BLOCK: Block = {
  slug: 'card-grid-section',
  labels: {
    singular: 'Card Grid Section',
    plural: 'Card Grid Sections',
  },
  fields: [
    {
      name: 'slotKey',
      type: 'text',
      label: '槽位标识',
      admin: {
        description: '仅在前台存在固定插槽时填写；一般内容块可留空。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
    },
    createSectionHeaderAlignmentField(),
    createTextListField('paragraphs', '左侧段落'),
    createTextListField('bullets', '左侧列表'),
    {
      name: 'columns',
      type: 'select',
      label: '列数',
      defaultValue: '2',
      options: [
        {
          label: '2 列',
          value: '2',
        },
        {
          label: '3 列',
          value: '3',
        },
        {
          label: '4 列',
          value: '4',
        },
      ],
    },
    {
      name: 'style',
      type: 'select',
      label: '样式',
      defaultValue: 'default',
      options: [
        {
          label: '默认卡片',
          value: 'default',
        },
        {
          label: '步骤',
          value: 'steps',
        },
        {
          label: '统计',
          value: 'stats',
        },
      ],
    },
    {
      name: 'layoutMode',
      type: 'select',
      label: '卡片布局',
      defaultValue: 'auto',
      admin: {
        description: '默认卡片样式下可选自动计算布局或固定等宽网格。',
        condition: (_, siblingData) => siblingData?.style === 'default' || !siblingData?.style,
      },
      options: [
        {
          label: '自动计算卡片布局',
          value: 'auto',
        },
        {
          label: '固定卡片布局',
          value: 'fixed',
        },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      label: '卡片列表',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          label: '卡片角标',
        },
        {
          name: 'title',
          type: 'text',
          label: '卡片标题',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          label: '卡片说明',
        },
        createTextListField('paragraphs', '卡片段落'),
        createTextListField('bullets', '卡片列表'),
      ],
    },
  ],
}

/**
 * 共享列表 section
 * 适合摘要、认可列表、注意事项等“标题 + 列表”场景。
 */
const BULLET_LIST_SECTION_BLOCK: Block = {
  slug: 'bullet-list-section',
  labels: {
    singular: 'Bullet List Section',
    plural: 'Bullet List Sections',
  },
  fields: [
    {
      name: 'slotKey',
      type: 'text',
      label: '槽位标识',
      admin: {
        description: '仅在前台存在固定插槽时填写；一般内容块可留空。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
    },
    createSectionHeaderAlignmentField(),
    createTextListField('items', '条目'),
    {
      name: 'style',
      type: 'select',
      label: '样式',
      defaultValue: 'panel',
      options: [
        {
          label: 'Panel',
          value: 'panel',
        },
        {
          label: 'Plain',
          value: 'plain',
        },
      ],
    },
  ],
}

/**
 * 共享 CTA section
 * 适合页尾行动区、联系区等“标题 + 按钮”内容块。
 */
const CTA_SECTION_BLOCK: Block = {
  slug: 'cta-section',
  labels: {
    singular: 'CTA Section',
    plural: 'CTA Sections',
  },
  fields: [
    {
      name: 'slotKey',
      type: 'text',
      label: '槽位标识',
      admin: {
        description: '仅在前台存在固定插槽时填写；一般内容块可留空。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
    },
    {
      name: 'footnote',
      type: 'textarea',
      label: '尾注',
    },
    createSectionHeaderAlignmentField(),
    ...CTA_FIELDS,
  ],
}

/**
 * 共享 Markdown 文档 block
 * 仅法律页使用，但继续复用同一套 section 容器与渲染入口。
 */
const MARKDOWN_DOCUMENT_BLOCK: Block = {
  slug: 'markdown-document',
  labels: {
    singular: 'Markdown Document',
    plural: 'Markdown Documents',
  },
  fields: [
    {
      name: 'slotKey',
      type: 'text',
      label: '槽位标识',
      admin: {
        description: '仅在前台存在固定插槽时填写；一般内容块可留空。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    createSectionHeaderAlignmentField(),
    {
      name: 'markdown',
      type: 'textarea',
      label: 'Markdown 原稿',
      required: true,
    },
  ],
}

/**
 * 首页功能展示 section
 * 适合承载“图示 + 文案 + 列表 + 跳转”的交错功能模块。
 */
const FEATURE_SHOWCASE_SECTION_BLOCK: Block = {
  slug: 'feature-showcase',
  labels: {
    singular: 'Feature Showcase Section',
    plural: 'Feature Showcase Sections',
  },
  fields: [
    {
      name: 'slotKey',
      type: 'text',
      label: '槽位标识',
      admin: {
        description: '仅在前台存在固定插槽时填写；一般内容块可留空。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
    },
    createSectionHeaderAlignmentField(),
    {
      name: 'items',
      type: 'array',
      label: '功能项',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          label: '功能角标',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: '功能标题',
          required: true,
        },
        {
          name: 'lead',
          type: 'textarea',
          label: '导语',
        },
        {
          name: 'body',
          type: 'textarea',
          label: '正文',
        },
        createTextListField('bullets', '亮点列表'),
        {
          name: 'linkLabel',
          type: 'text',
          label: '链接文案',
        },
        {
          name: 'linkHref',
          type: 'text',
          label: '链接地址',
        },
        {
          name: 'visualVariant',
          type: 'select',
          dbName: 'vis_var',
          label: '图示样式',
          required: true,
          options: [
            {
              label: 'Persistent Memory',
              value: 'persistentMemory',
            },
            {
              label: 'Autonomous Execution',
              value: 'autonomousExecution',
            },
            {
              label: 'Self-Evolving Skills',
              value: 'selfEvolvingSkills',
            },
            {
              label: 'Intelligent File Search',
              value: 'intelligentFileSearch',
            },
            {
              label: 'Intent Alignment',
              value: 'intentAlignment',
            },
          ],
        },
        {
          name: 'reversed',
          type: 'checkbox',
          label: '反向排版',
          defaultValue: false,
        },
      ],
    },
  ],
}

/**
 * 流程步骤 section
 * 适合“步骤编号 + 标题 + 说明”的纵向流程内容。
 */
const PROCESS_STEPS_SECTION_BLOCK: Block = {
  slug: 'process-steps',
  labels: {
    singular: 'Process Steps Section',
    plural: 'Process Steps Sections',
  },
  fields: [
    {
      name: 'slotKey',
      type: 'text',
      label: '槽位标识',
      admin: {
        description: '仅在前台存在固定插槽时填写；一般内容块可留空。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
    },
    createSectionHeaderAlignmentField(),
    {
      name: 'steps',
      type: 'array',
      label: '步骤列表',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: '编号',
          admin: {
            description: '可选；未填写时前台自动按顺序生成 01/02/03。',
          },
        },
        {
          name: 'title',
          type: 'text',
          label: '步骤标题',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          label: '步骤说明',
          required: true,
        },
      ],
    },
  ],
}

/**
 * 左右分栏信息 section
 * 可用于 Skills / Memory 等“左侧卡片堆叠 + 右侧摘要面板”结构。
 */
const SPLIT_PANEL_SECTION_BLOCK: Block = {
  slug: 'split-panel',
  labels: {
    singular: 'Split Panel Section',
    plural: 'Split Panel Sections',
  },
  fields: [
    {
      name: 'slotKey',
      type: 'text',
      label: '槽位标识',
      admin: {
        description: '仅在前台存在固定插槽时填写；一般内容块可留空。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
    },
    createSectionHeaderAlignmentField(),
    {
      name: 'style',
      type: 'select',
      label: '版式风格',
      defaultValue: 'tiers',
      options: [
        {
          label: 'Skills / Tier Cards',
          value: 'tiers',
        },
        {
          label: 'Memory / Layer Summary',
          value: 'memory',
        },
      ],
    },
    {
      name: 'entries',
      type: 'array',
      label: '左侧条目',
      fields: [
        {
          name: 'badge',
          type: 'text',
          label: '徽标',
        },
        {
          name: 'title',
          type: 'text',
          label: '标题',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          label: '说明',
          required: true,
        },
      ],
    },
    {
      name: 'panelTitle',
      type: 'text',
      label: '右侧面板标题',
    },
    createTextListField('panelItems', '右侧条目'),
  ],
}

/**
 * Use Case 网格 section
 * 适合“角色 + 卡片正文 + 结果总结”的多卡片业务场景。
 */
const USE_CASE_GRID_SECTION_BLOCK: Block = {
  slug: 'use-case-grid',
  labels: {
    singular: 'Use Case Grid Section',
    plural: 'Use Case Grid Sections',
  },
  fields: [
    {
      name: 'slotKey',
      type: 'text',
      label: '槽位标识',
      admin: {
        description: '仅在前台存在固定插槽时填写；一般内容块可留空。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
    },
    createSectionHeaderAlignmentField(),
    {
      name: 'items',
      type: 'array',
      label: '用例卡片',
      fields: [
        {
          name: 'role',
          type: 'text',
          label: '角色',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: '标题',
          required: true,
        },
        createTextListField('paragraphs', '正文段落'),
        {
          name: 'result',
          type: 'textarea',
          label: '结果总结',
        },
        {
          name: 'href',
          type: 'text',
          label: '跳转链接',
        },
      ],
    },
  ],
}

/**
 * 公司概览 section
 * 适合承载 About 页面中的使命、故事、统计、荣誉与联系信息。
 */
const COMPANY_OVERVIEW_SECTION_BLOCK: Block = {
  slug: 'company-overview',
  labels: {
    singular: 'Company Overview Section',
    plural: 'Company Overview Sections',
  },
  fields: [
    {
      name: 'slotKey',
      type: 'text',
      label: '槽位标识',
      admin: {
        description: '仅在前台存在固定插槽时填写；一般内容块可留空。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: '副标题',
    },
    createSectionHeaderAlignmentField(),
    {
      name: 'missionTitle',
      type: 'text',
      label: '使命标题',
    },
    {
      name: 'missionLead',
      type: 'textarea',
      label: '使命导语',
    },
    createTextListField('missionBody', '使命段落'),
    {
      name: 'storyTitle',
      type: 'text',
      label: '故事标题',
    },
    {
      name: 'storyLead',
      type: 'textarea',
      label: '故事导语',
    },
    createTextListField('storyBody', '故事段落'),
    {
      name: 'stats',
      type: 'array',
      label: '统计数据',
      fields: [
        {
          name: 'value',
          type: 'text',
          label: '数值',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: '标签',
          required: true,
        },
      ],
    },
    {
      name: 'recognitionTitle',
      type: 'text',
      label: '荣誉标题',
    },
    createTextListField('recognitions', '荣誉条目'),
    {
      name: 'contactTitle',
      type: 'text',
      label: '联系标题',
    },
    createTextListField('contactBody', '联系段落'),
    {
      name: 'contactLinkLabel',
      type: 'text',
      label: '联系链接文案',
    },
    {
      name: 'contactLinkHref',
      type: 'text',
      label: '联系链接地址',
    },
  ],
}

/**
 * 共享 section blocks 列表
 */
export const MARKETING_SECTION_BLOCKS: Block[] = [
  RICH_TEXT_SECTION_BLOCK,
  CARD_GRID_SECTION_BLOCK,
  BULLET_LIST_SECTION_BLOCK,
  FEATURE_SHOWCASE_SECTION_BLOCK,
  PROCESS_STEPS_SECTION_BLOCK,
  SPLIT_PANEL_SECTION_BLOCK,
  USE_CASE_GRID_SECTION_BLOCK,
  COMPANY_OVERVIEW_SECTION_BLOCK,
  CTA_SECTION_BLOCK,
  MARKDOWN_DOCUMENT_BLOCK,
]

/**
 * 共享页面 sections 字段
 */
export const MARKETING_SECTIONS_FIELD: Field = {
  name: 'sections',
  type: 'blocks',
  localized: true,
  label: '页面分节',
  blocks: MARKETING_SECTION_BLOCKS,
  admin: {
    description: '营销页统一使用的正文结构；前台会通过视图模型层做二次映射。',
  },
}
