import pc from 'picocolors'

export const title = (value: string): string => pc.bold(pc.cyan(value))
export const command = (value: string): string => pc.cyan(value)
export const success = (value: string): string => pc.green(value)
export const warning = (value: string): string => pc.yellow(value)
export const danger = (value: string): string => pc.red(value)
export const muted = (value: string): string => pc.dim(value)
export const label = (value: string): string => pc.bold(value)

export function statusMark(status: 'ok' | 'warn' | 'error' | 'idle'): string {
  if (status === 'ok') return success('●')
  if (status === 'warn') return warning('●')
  if (status === 'error') return danger('●')
  return muted('○')
}
