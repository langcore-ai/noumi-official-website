'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { SITE_LOCALE_COOKIE, type SiteLocale } from '@/lib/site/i18n'

/**
 * 站点语言切换器 props
 */
type SiteLanguageSwitcherProps = {
  /** 当前语言 */
  locale: SiteLocale
  /** 可访问性标签 */
  ariaLabel: string
  /** 语言显示名 */
  labels: Record<SiteLocale, string>
}

/**
 * 前台语言切换器
 * 通过 cookie 持久化选择，并刷新当前页面以重新拉取本地化内容。
 * @param props 组件参数
 * @returns 语言切换按钮组
 */
export function SiteLanguageSwitcher(props: SiteLanguageSwitcherProps) {
  const { locale, ariaLabel, labels } = props
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  /**
   * 切换当前站点语言
   * @param nextLocale 目标语言
   */
  function handleLocaleChange(nextLocale: SiteLocale) {
    if (nextLocale === locale) {
      return
    }

    document.cookie = `${SITE_LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`

    // 仅刷新当前路由，保持现有 URL 与用户位置不变
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div aria-label={ariaLabel} className="site-locale-switcher" role="group">
      {(['en', 'zh'] as const).map((option) => (
        <button
          key={option}
          aria-pressed={locale === option}
          className={`site-locale-switcher__button${
            locale === option ? ' site-locale-switcher__button--active' : ''
          }`}
          disabled={isPending}
          onClick={() => handleLocaleChange(option)}
          type="button"
        >
          {labels[option]}
        </button>
      ))}
    </div>
  )
}
