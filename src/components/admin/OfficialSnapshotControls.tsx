'use client'

import { useCallback, useEffect, useState } from 'react'

import './OfficialSnapshotControls.css'

/** 快照刷新状态响应。 */
type SnapshotStatusResponse = {
  /** 快照 manifest。 */
  manifest?: null | {
    counts: {
      blogPosts: number
      featurePages: number
      useCasePages: number
    }
    durationMs: number
    generatedAt: string
    routes: string[]
  }
  /** 请求是否成功。 */
  ok: boolean
  /** R2 runtime 是否可用。 */
  runtimeAvailable?: boolean
  /** 刷新状态。 */
  refreshState?: {
    dirty: null | {
      markedAt: string
      reason: string
      source?: string
    }
    reason: null | string
    refreshSeconds: number
    shouldRefresh: boolean
  }
  /** 后台配置。 */
  settings?: null | {
    refreshSeconds: number
    updatedAt: string
  }
}

/** 组件内状态。 */
type SnapshotControlsState = {
  /** 错误提示。 */
  error: string
  /** 刷新间隔输入值。 */
  refreshSeconds: string
  /** 当前是否正在加载。 */
  loading: boolean
  /** 当前是否正在手动刷新。 */
  refreshing: boolean
  /** 当前是否正在保存设置。 */
  saving: boolean
  /** 最近状态响应。 */
  status: SnapshotStatusResponse | null
}

/** 手动刷新 API 路径。 */
const SNAPSHOT_REFRESH_API_PATH = '/api/site/snapshots/refresh'

/**
 * 格式化时间。
 * @param value ISO 时间
 * @returns 本地时间文本
 */
function formatDateTime(value?: null | string): string {
  if (!value) {
    return 'Not generated'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

/**
 * 格式化刷新间隔。
 * @param seconds 秒数
 * @returns 可读文本
 */
function formatRefreshSeconds(seconds: number | undefined): string {
  if (seconds == null) {
    return 'Default'
  }

  if (seconds === 0) {
    return 'Manual / publish only'
  }

  if (seconds % 3600 === 0) {
    return `${seconds / 3600}h`
  }

  if (seconds % 60 === 0) {
    return `${seconds / 60}m`
  }

  return `${seconds}s`
}

/**
 * Payload 后台官网快照控制面板。
 * @returns 快照控制 UI
 */
export function OfficialSnapshotControls() {
  const [state, setState] = useState<SnapshotControlsState>({
    error: '',
    loading: true,
    refreshSeconds: '',
    refreshing: false,
    saving: false,
    status: null,
  })

  /**
   * 合并局部状态。
   * @param patch 局部状态
   */
  const updateState = useCallback((patch: Partial<SnapshotControlsState>) => {
    setState((current) => ({ ...current, ...patch }))
  }, [])

  /**
   * 读取当前快照状态。
   */
  const loadStatus = useCallback(async () => {
    updateState({ error: '', loading: true })

    try {
      const response = await fetch(SNAPSHOT_REFRESH_API_PATH, {
        credentials: 'same-origin',
      })
      const status = (await response.json()) as SnapshotStatusResponse

      if (!response.ok || !status.ok) {
        throw new Error('Failed to load snapshot status.')
      }

      updateState({
        loading: false,
        refreshSeconds: String(
          status.settings?.refreshSeconds ?? status.refreshState?.refreshSeconds ?? 3600,
        ),
        status,
      })
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to load snapshot status.',
        loading: false,
      })
    }
  }, [updateState])

  /**
   * 保存刷新间隔。
   */
  const saveRefreshSeconds = useCallback(async () => {
    updateState({ error: '', saving: true })

    try {
      const response = await fetch(SNAPSHOT_REFRESH_API_PATH, {
        body: JSON.stringify({
          refreshSeconds: Number.parseInt(state.refreshSeconds, 10),
        }),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      })
      const status = (await response.json()) as SnapshotStatusResponse & { message?: string }

      if (!response.ok || !status.ok) {
        throw new Error(status.message || 'Failed to save snapshot settings.')
      }

      updateState({
        refreshSeconds: String(status.settings?.refreshSeconds ?? state.refreshSeconds),
        saving: false,
        status,
      })
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to save snapshot settings.',
        saving: false,
      })
    }
  }, [state.refreshSeconds, updateState])

  /**
   * 手动刷新全站快照。
   */
  const refreshSnapshots = useCallback(async () => {
    updateState({ error: '', refreshing: true })

    try {
      const response = await fetch(`${SNAPSHOT_REFRESH_API_PATH}?reason=admin-ui`, {
        credentials: 'same-origin',
        method: 'POST',
      })
      const payload = (await response.json()) as SnapshotStatusResponse & { message?: string }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || 'Failed to refresh snapshots.')
      }

      updateState({ refreshing: false })
      await loadStatus()
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to refresh snapshots.',
        refreshing: false,
      })
    }
  }, [loadStatus, updateState])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  const status = state.status
  const manifest = status?.manifest
  const refreshState = status?.refreshState
  const isBusy = state.loading || state.saving || state.refreshing

  return (
    <div className="official-snapshot-controls">
      <div className="official-snapshot-controls__header">
        <div>
          <h3>官网快照</h3>
          <p>公开前台优先读取 R2 JSON / HTML 快照。</p>
        </div>
        <span
          className={
            status?.runtimeAvailable === false
              ? 'official-snapshot-controls__badge official-snapshot-controls__badge--error'
              : 'official-snapshot-controls__badge'
          }
        >
          {status?.runtimeAvailable === false ? 'R2 unavailable' : 'R2 snapshots'}
        </span>
      </div>

      <div className="official-snapshot-controls__grid">
        <div>
          <span>Generated</span>
          <strong>{formatDateTime(manifest?.generatedAt)}</strong>
        </div>
        <div>
          <span>Refresh every</span>
          <strong>{formatRefreshSeconds(refreshState?.refreshSeconds)}</strong>
        </div>
        <div>
          <span>Routes</span>
          <strong>{manifest?.routes.length ?? 0}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{refreshState?.shouldRefresh ? refreshState.reason || 'stale' : 'Fresh'}</strong>
        </div>
      </div>

      <div className="official-snapshot-controls__counts">
        <span>Blog: {manifest?.counts.blogPosts ?? 0}</span>
        <span>Feature: {manifest?.counts.featurePages ?? 0}</span>
        <span>Use Case: {manifest?.counts.useCasePages ?? 0}</span>
        <span>Duration: {manifest ? `${manifest.durationMs}ms` : '-'}</span>
      </div>

      {refreshState?.dirty ? (
        <p className="official-snapshot-controls__notice">
          Dirty since {formatDateTime(refreshState.dirty.markedAt)} (
          {refreshState.dirty.source || refreshState.dirty.reason})
        </p>
      ) : null}

      {state.error ? <p className="official-snapshot-controls__error">{state.error}</p> : null}

      <div className="official-snapshot-controls__actions">
        <label>
          <span>自动刷新间隔（秒，0 表示关闭）</span>
          <input
            min={0}
            step={300}
            type="number"
            value={state.refreshSeconds}
            onChange={(event) => updateState({ refreshSeconds: event.target.value })}
          />
        </label>
        <button disabled={isBusy} type="button" onClick={saveRefreshSeconds}>
          {state.saving ? '保存中...' : '保存间隔'}
        </button>
        <button disabled={isBusy} type="button" onClick={refreshSnapshots}>
          {state.refreshing ? '刷新中...' : '立即刷新'}
        </button>
        <button disabled={isBusy} type="button" onClick={loadStatus}>
          {state.loading ? '读取中...' : '刷新状态'}
        </button>
      </div>
    </div>
  )
}
