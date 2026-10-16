export {}
const action = process.argv[2] || 'status'
const origin = 'https://preview.staging.noumi.ai'
async function main() {
  if (!['status', 'health'].includes(action))
    throw new Error(
      '独立 staging Worker 已停用。发布请通过 GitHub Worker Previews；维护者可使用 build:worker-preview / deploy:worker-preview。日志在原官网 Worker 的 preview 环境查看。',
    )
  const response = await fetch(`${origin}/api/site/health`, { signal: AbortSignal.timeout(30000) })
  const data = (await response.json()) as {
    healthy?: boolean
    environment?: string
    revision?: string
  }
  if (!response.ok || !data.healthy || data.environment !== 'staging')
    throw new Error('Preview 健康检查失败')
  console.log(`Noumi · staging Preview\n地址: ${origin}\n版本: ${data.revision}\nD1/R2: 健康`)
}
main().catch((error: Error) => {
  console.error(error.message)
  process.exitCode = 1
})
