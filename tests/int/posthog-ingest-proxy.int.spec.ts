import { describe, expect, it } from 'vitest'

import {
  buildPostHogProxyHeaders,
  isCacheablePostHogAsset,
  proxyPostHogIngest,
  resolvePostHogUpstream,
} from '@/lib/site/posthog-ingest-proxy'

describe('posthog ingest proxy', () => {
  it('maps same-origin paths to PostHog upstreams', () => {
    expect(resolvePostHogUpstream('/ingest/e/', '?ver=1')).toBe('https://us.i.posthog.com/e/?ver=1')
    expect(resolvePostHogUpstream('/ingest/static/array.js', '')).toBe(
      'https://us-assets.i.posthog.com/static/array.js',
    )
    expect(resolvePostHogUpstream('/ingest/array/token/config.js', '')).toBe(
      'https://us-assets.i.posthog.com/array/token/config.js',
    )
    expect(resolvePostHogUpstream('/ingest', '')).toBe('https://us.i.posthog.com/')
    expect(resolvePostHogUpstream('/other', '')).toBeNull()
    expect(isCacheablePostHogAsset('/ingest/static/x.js')).toBe(true)
    expect(isCacheablePostHogAsset('/ingest/e/')).toBe(false)
  })

  it('strips site cookies and non-PostHog authorization, forwards the real IP', () => {
    const headers = new Headers({
      authorization: 'Bearer secret',
      'cf-connecting-ip': '203.0.113.9',
      cookie: 'session=1',
      referer: 'https://noumi.ai/pricing?email=user@example.com',
      'user-agent': 'UA',
    })

    const proxyHeaders = buildPostHogProxyHeaders(headers, '203.0.113.9')
    expect(proxyHeaders.has('cookie')).toBe(false)
    expect(proxyHeaders.has('referer')).toBe(false)
    expect(proxyHeaders.get('authorization')).toBeNull()
    expect(proxyHeaders.get('x-forwarded-for')).toBe('203.0.113.9')
    expect(proxyHeaders.get('user-agent')).toBe('UA')

    const posthogHeaders = buildPostHogProxyHeaders(
      new Headers({ authorization: 'Bearer phc_x' }),
      '',
    )
    expect(posthogHeaders.get('authorization')).toBe('Bearer phc_x')
    expect(posthogHeaders.has('x-forwarded-for')).toBe(false)
  })

  it('forwards POST bodies and methods unchanged', async () => {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []
    const send: typeof fetch = async (input, init) => {
      calls.push({ input, init })
      return new Response('ok')
    }
    const request = new Request('https://noumi.test/ingest/e/', {
      body: '{"event":"x"}',
      headers: {
        'cf-connecting-ip': '203.0.113.9',
        'content-type': 'application/json',
      },
      method: 'POST',
    })

    const response = await proxyPostHogIngest(request, undefined, send)
    expect(await response.text()).toBe('ok')
    expect(String(calls[0]?.input)).toBe('https://us.i.posthog.com/e/')
    expect(calls[0]?.init?.method).toBe('POST')
    expect(new Headers(calls[0]?.init?.headers).get('x-forwarded-for')).toBe('203.0.113.9')

    const body = calls[0]?.init?.body
    expect(body).toBeInstanceOf(ArrayBuffer)
    if (body instanceof ArrayBuffer) {
      expect(new TextDecoder().decode(body)).toBe('{"event":"x"}')
    }
  })

  it('returns 404 outside the ingest path', async () => {
    const response = await proxyPostHogIngest(
      new Request('https://noumi.test/other'),
      undefined,
      async () => new Response('unexpected'),
    )

    expect(response.status).toBe(404)
  })
})
