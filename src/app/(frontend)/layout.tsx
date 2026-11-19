import { createOfficialMetadata } from '@/lib/site/official-site'
import type { ReactNode } from 'react'
import Script from 'next/script'

import { draftMode } from 'next/headers'
import { OfficialReplayController } from '@/components/site/OfficialReplayController'
import { OfficialAnalyticsProvider } from '@/components/site/OfficialAnalyticsProvider'
import { CookieConsentBanner } from '@/components/site/CookieConsentBanner'
import { OfficialGlobalEffects } from '@/components/site/official/OfficialGlobalEffects'
import { OfficialPersistentChrome } from '@/components/site/official/OfficialPersistentChrome'
import { buildOfficialGoogleTagBootstrapScript } from '@/lib/site/analytics'

import './official-base.css'
import './official-home.css'
import './prototype-parity.css'
import './official-chrome.css'

/**
 * 前台页面保留运行时渲染以支持 Payload 草稿预览；发布态 CMS 读取在读取层走 R2 增量缓存。
 */
export const dynamic = 'force-dynamic'

/** GTM 容器 ID；GTM 内部已配置 GA4 属性 G-TJBXDRBMVM。 */
const GTM_CONTAINER_ID = 'GTM-NFXRLW7R'

/**
 * 生成「`load` 之后再注入 GTM」的引导脚本。
 *
 * 浏览器把 `load` 之前插入的 async script 计入页面完成条件，因此 GTM 域名
 * 不可达时（国内网络常见）`load` 会永久挂起。把注入推迟到 `load` 之后，
 * 分析脚本就永远不会成为页面完成事件的依赖。
 * @returns 内联引导脚本
 */
function buildGtmLoaderScript(): string {
  const containerId = JSON.stringify(GTM_CONTAINER_ID)

  return `(function(){
  var loaded = false;
  function inject() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(${containerId});
    document.head.appendChild(s);
  }
  if (document.readyState === 'complete') inject();
  else window.addEventListener('load', inject, { once: true });
})();`.trim()
}

/**
 * 非阻塞加载 `/assets/fonts/fonts.css`（纯 @font-face 表）。
 * 用 `print` 优先级插入再切回 `all`，让样式表不进入首屏渲染的关键路径；
 * 字体本身仍是 `font-display: swap`，切换时不会出现不可见文本。
 */
const FONT_STYLESHEET_LOADER = `(function(){
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/assets/fonts/fonts.css';
  link.media = 'print';
  link.onload = function(){ link.media = 'all'; };
  document.head.appendChild(link);
})();`

/**
 * 生成前台默认 metadata
 * @returns metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'Personal AI workspace built for Business & Solutions professionals | Noumi.ai',
    description:
      'Noumi works like a real colleague — understanding context, managing tasks, and delivering results without constant prompting.',
    pathname: '/',
  })
}

/**
 * 官网页面布局
 * @param props 子节点
 * @returns 前台统一壳层
 */
export default async function FrontendLayout(props: { children: ReactNode }) {
  const { children } = props
  const isDraft = (await draftMode()).isEnabled
  const isTestEnvironment = ['local', 'staging'].includes(process.env.NEXT_PUBLIC_APP_ENV || '')
  const content = (
    <>
      <OfficialPersistentChrome>{children}</OfficialPersistentChrome>
      <OfficialGlobalEffects />
      <CookieConsentBanner />
    </>
  )

  return (
    <html lang="en">
      <body>
        {!isTestEnvironment && (
          <>
            <Script
              id="noumi-official-google-tag-init"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: buildOfficialGoogleTagBootstrapScript(),
              }}
            />
            {/*
              GTM 容器内已配置 GA4 属性 G-TJBXDRBMVM，因此不再单独加载 gtag.js。
              必须等 `load` 之后才插入：在 `load` 前插入的 async script 会成为
              `load` 的依赖，GTM 域名不可达时 `load` 永不触发（实测）。注入依赖
              不重要的分析脚本，不该让页面完成事件无限期等待。
            */}
            <Script
              id="noumi-official-gtm-loader"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: buildGtmLoaderScript() }}
            />
          </>
        )}
        {/* 字体表是纯 @font-face：以 print 优先级插入后切回 all，避免阻塞首屏绘制。 */}
        <Script
          id="noumi-official-font-loader"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: FONT_STYLESHEET_LOADER }}
        />
        <OfficialAnalyticsProvider statisticsEnabled={!isTestEnvironment}>
          {!isDraft && <OfficialReplayController />}
          {content}
        </OfficialAnalyticsProvider>
      </body>
    </html>
  )
}
