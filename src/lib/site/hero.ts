import type { CmsHeroView } from '@/lib/site/cms'

/**
 * 判断页面 Hero 是否存在可展示的文本内容。
 * 仅当页面实际会渲染的文本字段存在时，前台才输出 Hero 容器。
 * @param hero Hero 视图数据
 * @returns 是否需要渲染 Hero
 */
export function hasRenderableHeroContent(hero: Pick<CmsHeroView, 'description' | 'eyebrow' | 'supportingText' | 'title'>): boolean {
  return Boolean(hero.eyebrow || hero.title || hero.description || hero.supportingText)
}
