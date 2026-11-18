export const INTRO_VIDEO_PATH = '/assets/intro-video/noumi-se-film-1080p.mp4'

/** Cloudflare static assets currently return the full file for byte-range requests. */
export async function serveIntroVideo(request: Request, asset: Response): Promise<Response> {
  if (asset.status !== 200) return asset

  const headers = new Headers(asset.headers)
  headers.set('Accept-Ranges', 'bytes')

  const range = /^bytes=(\d*)-(\d*)$/i.exec(request.headers.get('Range') ?? '')
  const ifRange = request.headers.get('If-Range')
  const matchesValidator =
    !ifRange ||
    (!ifRange.startsWith('W/') && ifRange === headers.get('ETag')) ||
    ifRange === headers.get('Last-Modified')
  if (request.method !== 'GET' || !range || (!range[1] && !range[2]) || !matchesValidator) {
    return new Response(asset.body, { status: 200, headers })
  }

  const video = new Uint8Array(await asset.arrayBuffer())
  const total = video.byteLength
  const start = range[1] ? Number(range[1]) : Math.max(0, total - Number(range[2]))
  const end = range[1] && range[2] ? Math.min(Number(range[2]), total - 1) : total - 1

  if (start >= total || end < start) {
    headers.set('Content-Range', `bytes */${total}`)
    headers.set('Content-Length', '0')
    return new Response(null, { status: 416, headers })
  }

  headers.set('Content-Range', `bytes ${start}-${end}/${total}`)
  headers.set('Content-Length', String(end - start + 1))
  return new Response(video.subarray(start, end + 1), { status: 206, headers })
}
