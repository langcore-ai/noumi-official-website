import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/** OpenNext 提供的 `@next/env` shim 文件路径 */
const OPENNEXT_ENV_SHIM_PATH = path.resolve(
  process.cwd(),
  'node_modules/@opennextjs/cloudflare/dist/cli/templates/shims/env.js',
)

/** 兼容 Payload 默认导入 `@next/env` 的 shim 内容 */
const PATCHED_ENV_SHIM_SOURCE = `/**
 * OpenNext 在 Cloudflare 侧会把环境变量直接内联到产物里，
 * 这里保留一个与 \`@next/env\` 兼容的空实现，供依赖默认导出的包使用。
 */
export function loadEnvConfig() {
  return {
    combinedEnv: {},
    loadedEnvFiles: [],
  }
}

const nextEnvShim = {
  loadEnvConfig,
}

export default nextEnvShim
`

/**
 * 修补 OpenNext 的 `@next/env` shim，补齐 default export 与返回值结构。
 * @returns {Promise<void>}
 */
async function patchOpenNextEnvShim() {
  const currentSource = await readFile(OPENNEXT_ENV_SHIM_PATH, 'utf8')

  if (currentSource.includes('export default nextEnvShim')) {
    console.log('[patch-opennext-env-shim] shim 已经是兼容版本，跳过')
    return
  }

  if (!currentSource.includes('export function loadEnvConfig')) {
    throw new Error(
      `[patch-opennext-env-shim] 未识别的 shim 内容，请检查 ${OPENNEXT_ENV_SHIM_PATH} 是否发生上游变更。`,
    )
  }

  await writeFile(OPENNEXT_ENV_SHIM_PATH, PATCHED_ENV_SHIM_SOURCE, 'utf8')
  console.log(`[patch-opennext-env-shim] 已修补 ${OPENNEXT_ENV_SHIM_PATH}`)
}

await patchOpenNextEnvShim()
