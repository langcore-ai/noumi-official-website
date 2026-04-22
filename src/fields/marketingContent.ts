import type { Block, Field } from 'payload'

/**
 * 复用的纯文本列表字段
 * @param name 字段名
 * @param label 后台标签
 * @returns Payload 数组字段
 */
function createTextListField(name: string, label: string): Field {
  return {
    name,
    type: 'array',
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
 * 共享图片 section
 * 用于文章封面之后的插图、法律页配图或营销页中的静态视觉节点。
 */
const IMAGE_SECTION_BLOCK: Block = {
  slug: 'image-section',
  labels: {
    singular: 'Image Section',
    plural: 'Image Sections',
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
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: '图片',
      required: true,
    },
    {
      name: 'alt',
      type: 'text',
      label: '替代文本',
    },
    {
      name: 'caption',
      type: 'textarea',
      label: '说明文字',
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
  CTA_SECTION_BLOCK,
  MARKDOWN_DOCUMENT_BLOCK,
  IMAGE_SECTION_BLOCK,
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
