declare module '@thumbmarkjs/thumbmarkjs' {
  export type ThumbmarkResult = {
    thumbmark?: string
  }

  export function getThumbmark(options?: Record<string, unknown>): Promise<ThumbmarkResult>
}
