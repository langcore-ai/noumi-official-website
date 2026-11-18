import { readFileSync } from 'node:fs'

import type { CmsUserRole } from '../../src/access/cms'

/**
 * E2E 测试用户契约:通过本地 Admin REST API 播种/清理,
 * 不在 playwright 进程内实例化 payload(其 getPlatformProxy 与
 * dev/next server 的 Miniflare 状态目录互锁,会挂起)。
 */
export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
  roles: ['admin'] as CmsUserRole[],
}

const API = 'http://localhost:3000/api/users'
const ADMIN_EMAIL = 'local-admin@noumi.ai'

/** 管理员凭据(由 mode:setup 写入 local.admin.json)。 */
async function adminToken(): Promise<string> {
  const credentials = JSON.parse(
    readFileSync('.local/infra/local.admin.json', 'utf8'),
  ) as { email: string; password: string }
  const response = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!response.ok) throw new Error(`管理员登录失败: HTTP ${response.status}`)
  const data = (await response.json()) as { token?: string }
  if (!data.token) throw new Error('管理员登录未返回 token')
  return data.token
}

async function findUser(token: string, email: string): Promise<string | null> {
  const response = await fetch(`${API}?where[email][equals]=${encodeURIComponent(email)}&limit=1`, {
    headers: { authorization: `JWT ${token}` },
  })
  if (!response.ok) return null
  const data = (await response.json()) as { docs?: Array<{ id: string }> }
  return data.docs?.[0]?.id ?? null
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const token = await adminToken()
  const existing = await findUser(token, testUser.email)
  if (existing) return
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `JWT ${token}` },
    body: JSON.stringify(testUser),
  })
  if (!response.ok) throw new Error(`播种测试用户失败: HTTP ${response.status}`)
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const token = await adminToken()
  const id = await findUser(token, testUser.email)
  if (!id) return
  await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: { authorization: `JWT ${token}` },
  })
}
