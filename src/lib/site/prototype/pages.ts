import 'server-only'
import pages from './pages.json'
import rawMotion from './interactions.json'
import type { MotionEvent, MotionList, PageMotion } from './types'
import { createOfficialMetadata } from '../official-site'

export type PrototypePageData = (typeof pages)['/features']
export function getPrototypePage(route: string): PrototypePageData | undefined {
  return (pages as Record<string, PrototypePageData>)[route]
}
export function prototypeMetadata(route: string) {
  const page = getPrototypePage(route)
  return page
    ? {
        ...createOfficialMetadata({
          title: page.title,
          description: page.description,
          pathname: route,
        }),
        ...(page.template || route.startsWith('/template-info/')
          ? { robots: { index: false, follow: false } }
          : {}),
      }
    : {}
}
export function getPageMotion(page: PrototypePageData): PageMotion {
  const events = (Object.values(rawMotion.events) as unknown as MotionEvent[]).filter((event) => {
    const id = event.target.id
    if (id?.includes('|') && !id.startsWith(page.pageId + '|')) return false
    return id
      ? page.html.includes(`data-w-id="${id.split('|').at(-1)}"`)
      : Boolean(event.target.selector)
  })
  const lists: Record<string, MotionList> = {}
  for (const event of events) {
    const id = event.action.config.actionListId
    const list = (rawMotion.actionLists as unknown as Record<string, MotionList>)[id]
    if (list) lists[id] = list
  }
  return { events, lists }
}
