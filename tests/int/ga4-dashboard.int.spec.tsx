import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
describe('native analytics dashboard', () => {
  it('renders real API totals and grouping results only after querying', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ configured: true, connected: true, propertyId: '535315366' }),
      )
      .mockResolvedValueOnce(
        Response.json({
          range: { startDate: '2026-11-01', endDate: '2026-11-06' },
          generatedAt: '2026-11-06T00:00:00Z',
          timeZone: 'Asia/Shanghai',
          clicks: 12,
          users: 5,
          daily: [{ label: '20261106', clicks: 12, users: 5 }],
          pages: [{ label: 'https://noumi.ai/features', clicks: 12, users: 5 }],
          positions: [],
          texts: [],
          warnings: ['按钮位置尚不可用'],
        }),
      )
    vi.stubGlobal('fetch', fetcher)
    render(<AnalyticsDashboard canManage={false} />)
    fireEvent.click(await screen.findByRole('button', { name: '查询数据' }))
    await screen.findByText('https://noumi.ai/features')
    expect(screen.getByText('2026-11-06')).toBeTruthy()
    expect(screen.getByText('按钮位置尚不可用')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '重新连接 Google' })).toBeNull()
    expect(fetcher.mock.calls[1][0]).toContain('/api/site/ga4/report?startDate=')
  })
  it('does not turn authorization errors into zero-value metrics', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ configured: true, connected: true, propertyId: '535315366' }),
        )
        .mockResolvedValueOnce(Response.json({ message: 'Google 授权已失效' }, { status: 409 })),
    )
    render(<AnalyticsDashboard canManage />)
    fireEvent.click(await screen.findByRole('button', { name: '查询数据' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Google 授权已失效'))
    expect(screen.queryByRole('heading', { name: '免费试用点击' })).toBeNull()
  })
})
