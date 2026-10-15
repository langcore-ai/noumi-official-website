/** Payload passes Buffer in next start; Miniflare's RPC transport requires Blob. */
export function localR2Bucket(bucket: R2Bucket): R2Bucket {
  return new Proxy(bucket, {
    get(target, property) {
      if (property === 'put') {
        return (key: string, value: Parameters<R2Bucket['put']>[1], options?: R2PutOptions) => {
          const body = ArrayBuffer.isView(value)
            ? new Blob([
                Uint8Array.from(new Uint8Array(value.buffer, value.byteOffset, value.byteLength))
                  .buffer,
              ])
            : value
          return target.put(key, body, options)
        }
      }
      const value = Reflect.get(target, property, target)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}
