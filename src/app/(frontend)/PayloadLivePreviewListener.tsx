'use client'

import { startTransition, useEffectEvent } from 'react'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/**
 * 前台 live preview 监听器 props
 */
type PayloadLivePreviewListenerProps = {
  /** Payload Admin 所在站点 origin */
  serverURL: string
}

/**
 * 通过 Payload 官方组件监听保存事件，并在保存后刷新当前路由
 * 仅在前台处于 preview 模式时渲染，供 admin live preview iframe / popup 使用。
 * @param props 组件参数
 * @returns 空节点
 */
export function PayloadLivePreviewListener(props: PayloadLivePreviewListenerProps): React.JSX.Element {
  const { serverURL } = props
  const router = useRouter()
  const refreshRoute = useEffectEvent(() => {
    // 使用 transition 避免编辑高频保存时阻塞当前交互
    startTransition(() => {
      router.refresh()
    })
  })

  return <RefreshRouteOnSave refresh={refreshRoute} serverURL={serverURL} />
}
