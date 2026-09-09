export type MotionTarget = { id?: string; selector?: string; useEventTarget?: boolean | string }
export type MotionConfig = {
  globalSwatchId?: string
  target: MotionTarget
  delay?: number
  duration?: number
  easing?: string
  xValue?: number
  yValue?: number
  zValue?: number
  xUnit?: string
  yUnit?: string
  zUnit?: string
  widthValue?: number
  heightValue?: number
  widthUnit?: string
  heightUnit?: string
  rValue?: number
  gValue?: number
  bValue?: number
  aValue?: number
  value?: number
  filters?: { type: string; value: number; unit?: string }[]
}
export type MotionItem = { actionTypeId: string; config: MotionConfig }
export type MotionList = {
  useFirstGroupAsInitialState?: boolean
  actionItemGroups?: { actionItems: MotionItem[] }[]
}
export type MotionEvent = {
  id: string
  eventTypeId: string
  target: MotionTarget
  mediaQueries?: string[]
  action: { actionTypeId: string; config: { actionListId: string } }
  config: { delay?: number; direction?: string; scrollOffsetValue?: number } | unknown[]
}
export type PageMotion = { events: MotionEvent[]; lists: Record<string, MotionList> }
