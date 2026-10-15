/** Payload passes Buffer in next start; Miniflare's RPC transport requires Blob. */
export function localR2Bucket(bucket: R2Bucket): R2Bucket {
  return new Proxy(bucket, {
    get(target, property) {
      if (property === 'get') {
        return async (key: string, options?: R2GetOptions) => {
          const object = await target.get(key, options)
          if (!object) return object
          return new Proxy(object, {
            get(result, field) {
              // Headers cannot cross Miniflare RPC; apply the serialized metadata locally.
              if (field === 'writeHttpMetadata')
                return (headers: Headers) => {
                  const metadata = result.httpMetadata || {}
                  for (const [key, header] of Object.entries({
                    contentType: 'Content-Type',
                    contentLanguage: 'Content-Language',
                    contentDisposition: 'Content-Disposition',
                    contentEncoding: 'Content-Encoding',
                    cacheControl: 'Cache-Control',
                  })) {
                    const value = metadata[key as keyof R2HTTPMetadata]
                    if (typeof value === 'string') headers.set(header, value)
                  }
                  if (metadata.cacheExpiry)
                    headers.set('Expires', metadata.cacheExpiry.toUTCString())
                }
              const value = Reflect.get(result, field, result)
              return typeof value === 'function' ? value.bind(result) : value
            },
          })
        }
      }
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
