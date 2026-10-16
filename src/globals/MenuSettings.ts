import type { Field, GlobalConfig } from 'payload'
import { contentUpdateAccess } from '@/access/cms'
import { marketingGlobalReadAccess, PUBLIC_GLOBAL_VERSIONS } from '@/lib/site/publishing'
import { safeHref } from '@/lib/site/managed-routing'

const linkFields: Field[] = [
  { name: 'label', label: '标题', type: 'text', required: true },
  {
    name: 'href',
    label: '链接',
    type: 'text',
    required: true,
    validate: (value: string) =>
      !value || safeHref(value) || '请输入站内路径或 http(s)、mailto、tel 链接',
  },
  { name: 'hidden', label: '隐藏', type: 'checkbox', defaultValue: false },
]
export const MenuSettings: GlobalConfig = {
  slug: 'menu-settings',
  label: '菜单配置',
  versions: PUBLIC_GLOBAL_VERSIONS,
  access: { read: marketingGlobalReadAccess, update: contentUpdateAccess },
  admin: {
    group: '网站管理',
    description:
      '启用并发布后替换当前官网菜单。拖动条目调整顺序；支持桌面端和移动端。关闭开关保留官网默认内容。',
  },
  fields: [
    { name: 'enabled', label: '启用菜单配置', type: 'checkbox', defaultValue: false },
    {
      name: 'header',
      label: 'Header 菜单',
      type: 'array',
      fields: [
        ...linkFields,
        { name: 'children', label: '子菜单', type: 'array', fields: linkFields },
      ],
      defaultValue: [
        { label: 'Features', href: '/features' },
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'Blog', href: '/blog' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'About Us', href: '/about' },
      ],
    },
    {
      name: 'footer',
      label: 'Footer 栏目',
      type: 'array',
      fields: [
        { name: 'title', label: '栏目标题', type: 'text', required: true },
        { name: 'hidden', label: '隐藏', type: 'checkbox', defaultValue: false },
        { name: 'links', label: '链接', type: 'array', fields: linkFields },
      ],
      defaultValue: [
        {
          title: 'Product',
          links: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: 'Features', href: '/features' },
            { label: 'Use Cases', href: '/use-cases' },
            { label: 'Blog', href: '/blog' },
            { label: 'Pricing', href: '/pricing' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { label: 'FAQ', href: '/faqs' },
            { label: 'Terms & Conditions', href: '/terms' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Links', href: '/links' },
          ],
        },
      ],
    },
    { name: 'ctaLabel', label: '按钮文案', type: 'text', defaultValue: 'Try Noumi Free' },
    {
      name: 'ctaHref',
      label: '按钮链接（留空沿用产品入口）',
      type: 'text',
      validate: (value: string) => !value || safeHref(value) || '无效链接',
    },
    {
      name: 'description',
      label: '页脚说明',
      type: 'textarea',
      defaultValue: 'A personal AI workspace built for Business & Solutions professionals',
    },
    {
      name: 'copyright',
      label: '版权',
      type: 'text',
      defaultValue: '© 2026 Noumi. All rights reserved.',
    },
    { name: 'email', label: '联系邮箱', type: 'email', defaultValue: 'official@noumi.ai' },
    { name: 'phone', label: '电话', type: 'text' },
    { name: 'address', label: '地址', type: 'text' },
    { name: 'icp', label: 'ICP备案号', type: 'text' },
    { name: 'publicSecurity', label: '公安备案号', type: 'text' },
  ],
}
