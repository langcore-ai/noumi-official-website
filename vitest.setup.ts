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
