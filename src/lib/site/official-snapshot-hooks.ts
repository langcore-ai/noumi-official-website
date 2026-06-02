import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  GlobalConfig,
} from 'payload'

import {
  markOfficialSnapshotDirty,
  requestOfficialSnapshotRefresh,
  runOfficialSnapshotTaskInBackground,
} from '@/lib/site/official-snapshot-store'

/** 可能带发布状态的 Payload 文档。 */
type PublishableDocument = {
  /** Payload drafts 注入的发布状态。 */
  _status?: null | string
}

/**
 * 判断文档是否可能影响公开快照。
 * 无 drafts 的集合没有 `_status`，默认认为会影响公开内容；带 drafts 的内容在发布或从发布态变更时才标脏。
 *
 * @param doc 当前文档
 * @param previousDoc 变更前文档
 * @returns 是否需要标记快照过期
 */
function shouldMarkOfficialSnapshotDirty(doc: unknown, previousDoc?: unknown): boolean {
  const currentStatus = (doc as PublishableDocument | undefined)?._status
  const previousStatus = (previousDoc as PublishableDocument | undefined)?._status

  if (currentStatus == null && previousStatus == null) {
    return true
  }

  return currentStatus === 'published' || previousStatus === 'published'
}

/**
 * 在后台写入官网快照脏标记并请求刷新。
 * @param source 触发来源
 * @param reason 标记原因
 */
function scheduleOfficialSnapshotDirtyMarker(source: string, reason: string): void {
  void runOfficialSnapshotTaskInBackground(
    (async () => {
      await markOfficialSnapshotDirty({
        reason,
        source,
      })
      await requestOfficialSnapshotRefresh(`${reason}:${source}`)
    })(),
  )
}

/**
 * 创建集合保存后的快照标脏 hook。
 * @param source 集合 slug
 * @returns Payload afterChange hook
 */
function createOfficialSnapshotCollectionChangeHook(source: string): CollectionAfterChangeHook {
  return ({ doc, operation, previousDoc }) => {
    if (shouldMarkOfficialSnapshotDirty(doc, previousDoc)) {
      scheduleOfficialSnapshotDirtyMarker(source, `collection-${operation}`)
    }

    return doc
  }
}

/**
 * 创建集合删除后的快照标脏 hook。
 * @param source 集合 slug
 * @returns Payload afterDelete hook
 */
function createOfficialSnapshotCollectionDeleteHook(source: string): CollectionAfterDeleteHook {
  return ({ doc }) => {
    scheduleOfficialSnapshotDirtyMarker(source, 'collection-delete')

    return doc
  }
}

/**
 * 创建 global 保存后的快照标脏 hook。
 * @param source global slug
 * @returns Payload global afterChange hook
 */
function createOfficialSnapshotGlobalChangeHook(source: string): GlobalAfterChangeHook {
  return ({ doc, previousDoc }) => {
    if (shouldMarkOfficialSnapshotDirty(doc, previousDoc)) {
      scheduleOfficialSnapshotDirtyMarker(source, 'global-change')
    }

    return doc
  }
}

/**
 * 为会影响官网前台输出的集合追加快照标脏 hook。
 * @param collection 原始集合配置
 * @returns 带快照 hook 的集合配置
 */
export function withOfficialSnapshotCollectionHooks(
  collection: CollectionConfig,
): CollectionConfig {
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [
        ...(collection.hooks?.afterChange ?? []),
        createOfficialSnapshotCollectionChangeHook(collection.slug),
      ],
      afterDelete: [
        ...(collection.hooks?.afterDelete ?? []),
        createOfficialSnapshotCollectionDeleteHook(collection.slug),
      ],
    },
  }
}

/**
 * 为会影响官网前台输出的 global 追加快照标脏 hook。
 * @param global 原始 global 配置
 * @returns 带快照 hook 的 global 配置
 */
export function withOfficialSnapshotGlobalHooks(global: GlobalConfig): GlobalConfig {
  return {
    ...global,
    hooks: {
      ...global.hooks,
      afterChange: [
        ...(global.hooks?.afterChange ?? []),
        createOfficialSnapshotGlobalChangeHook(global.slug),
      ],
    },
  }
}
