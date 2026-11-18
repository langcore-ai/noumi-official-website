// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// wrangler / esbuild 在 Bun 环境里会检查 TextEncoder/TextDecoder 的 realm 行为。
// 使用本地 shim 保证 encode() 返回当前 realm 的 Uint8Array。
class VitestTextEncoder {
  encode(value = '') {
    return new Uint8Array(Buffer.from(value))
  }
}

class VitestTextDecoder {
  decode(value?: ArrayBufferView | ArrayBuffer | null) {
    if (!value) {
      return ''
    }

    const buffer =
      value instanceof ArrayBuffer
        ? Buffer.from(value)
        : Buffer.from(value.buffer, value.byteOffset, value.byteLength)

    return buffer.toString('utf8')
  }
}

globalThis.TextEncoder = VitestTextEncoder as unknown as typeof TextEncoder
globalThis.TextDecoder = VitestTextDecoder as unknown as typeof TextDecoder

// Node 26 给 globalThis 挂了 localStorage getter(internal/webstorage),但默认未启用,
// 返回 undefined;vitest 把 globalThis 自有属性拷到 jsdom window 上,覆盖了 jsdom 的
// localStorage 实现,导致依赖 window.localStorage 的测试挂掉。这里移除该覆盖。
const nodeLocalStorageDesc = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
if (
  nodeLocalStorageDesc &&
  nodeLocalStorageDesc.get?.toString().includes('internal/webstorage') &&
  typeof window !== 'undefined'
) {
  delete (globalThis as { localStorage?: unknown }).localStorage
  // vitest 在环境创建时已把 Node 的 getter 拷到 jsdom window 上,这里还原 jsdom 实现
  // Node 的实现需要 --experimental-webstorage 才有真值;jsdom 内部字段指向真实 Storage。
  const jsdomWindow = window as unknown as { _localStorage: Storage }
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    enumerable: true,
    get() {
      return jsdomWindow._localStorage
    },
  })
}
