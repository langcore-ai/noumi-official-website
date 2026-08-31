import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/** OpenNext 在 preview/deploy 前读取 Wrangler 环境变量的辅助模块。 */
const OPENNEXT_HELPERS_PATH = path.resolve(
  process.cwd(),
  'node_modules/@opennextjs/cloudflare/dist/cli/commands/utils/helpers.js',
)

const PLATFORM_PROXY_ANCHOR = `    const proxy = await getPlatformProxy({
        ...options,
`

const PATCHED_PLATFORM_PROXY_SOURCE = `    const proxy = await getPlatformProxy({
        ...options,
        // OpenNext preview 的 --local 只会传给后续 Wrangler 命令；这里还需阻止
        // 启动前的环境读取根据 wrangler.jsonc 建立远程 binding proxy。
        remoteBindings:
            process.env.OPEN_NEXT_LOCAL_BINDINGS === "true" ? false : options.remoteBindings,
`

/**
 * 让本地 OpenNext preview 的预取阶段也尊重本地 binding 隔离开关。
 * @returns {Promise<void>}
 */
async function patchOpenNextLocalBindings() {
  const currentSource = await readFile(OPENNEXT_HELPERS_PATH, 'utf8')

  if (currentSource.includes('process.env.OPEN_NEXT_LOCAL_BINDINGS')) {
    console.log('[patch-opennext-local-bindings] helper 已支持本地 binding 隔离，跳过')
    return
  }

  if (!currentSource.includes(PLATFORM_PROXY_ANCHOR)) {
    throw new Error(
      `[patch-opennext-local-bindings] 未识别的 helper 内容，请检查 ${OPENNEXT_HELPERS_PATH} 是否发生上游变更。`,
    )
  }

  await writeFile(
    OPENNEXT_HELPERS_PATH,
    currentSource.replace(PLATFORM_PROXY_ANCHOR, PATCHED_PLATFORM_PROXY_SOURCE),
    'utf8',
  )
  console.log(`[patch-opennext-local-bindings] 已修补 ${OPENNEXT_HELPERS_PATH}`)
}

await patchOpenNextLocalBindings()
