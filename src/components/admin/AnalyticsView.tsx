import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, SetStepNav } from '@payloadcms/ui'
import { notFound, redirect } from 'next/navigation'
import { hasAnyCmsRole } from '@/access/cms'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import './AnalyticsView.css'

export async function AnalyticsView(props: AdminViewServerProps) {
  const { req, visibleEntities, permissions, locale } = props.initPageResult
  if (!req.user) redirect(`${req.payload.config.routes.admin}/login`)
  if (!hasAnyCmsRole(req.user, ['content-editor', 'viewer'])) notFound()
  return (
    <DefaultTemplate
      {...props}
      req={req}
      payload={req.payload}
      permissions={permissions}
      i18n={req.i18n}
      locale={locale}
      user={req.user}
      visibleEntities={visibleEntities}
    >
      <SetStepNav nav={[{ label: '数据分析' }]} />
      <Gutter className="official-analytics">
        <header className="official-analytics__header">
          <div>
            <h1>数据分析</h1>
            <p>查看免费试用点击趋势、来源页面与按钮表现。</p>
          </div>
          <div className="official-analytics__actions">
            <a href="https://tagmanager.google.com/" target="_blank" rel="noopener noreferrer">
              管理埋点 ↗
            </a>
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
              打开 GA4 ↗
            </a>
          </div>
        </header>
        <AnalyticsDashboard canManage={hasAnyCmsRole(req.user, ['admin'])} />
        <section className="official-analytics__help">
          <h2>数据说明</h2>
          <p>
            统计事件为
            try_free_click，代表免费试用按钮点击，不代表注册成功。数据有处理延迟，最新点击请在 GA4
            实时报告中验证。报表缓存最多 5 分钟。
          </p>
          <p>
            新点击规则在 GTM 配置；当前看板聚焦免费试用。CMS 查看权限与 GTM 编辑、发布权限分别管理。
          </p>
        </section>
      </Gutter>
    </DefaultTemplate>
  )
}
