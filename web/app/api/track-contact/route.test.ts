import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  strictLimiter: { name: 'strict' },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(),
}))

import { POST } from './route'
import { checkRateLimit, getClientIp, strictLimiter } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const mockCheckRateLimit = vi.mocked(checkRateLimit)
const mockGetClientIp = vi.mocked(getClientIp)
const mockCreateClient = vi.mocked(createClient)
const mockCreateServiceClient = vi.mocked(createServiceClient)
const mockRpc = vi.fn()

function makeRequest(body: unknown): NextRequest {
  return new Request('http://localhost/api/track-contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest
}

function mockAuth(user: { id: string } | null) {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  } as unknown as Awaited<ReturnType<typeof createClient>>)
}

const validBody = {
  businessId: '6f4a1f8a-7e61-4b1f-a1c7-3a824f41bd9b',
  method: 'phone',
} as const

beforeEach(() => {
  vi.clearAllMocks()
  mockGetClientIp.mockResolvedValue('203.0.113.10')
  mockCheckRateLimit.mockResolvedValue({ ok: true, remaining: 4 })
  mockAuth(null)
  mockRpc.mockReset()
  mockRpc.mockResolvedValue({ error: null })
  mockCreateServiceClient.mockReturnValue({
    rpc: mockRpc,
  } as unknown as ReturnType<typeof createServiceClient>)
})

describe('POST /api/track-contact', () => {
  it(
    'fails closed before auth or privileged access when the IP limiter is unavailable',
    async () => {
      mockCheckRateLimit.mockResolvedValueOnce({
        ok: false,
        error: 'protection unavailable',
        retryAfter: 30,
        unavailable: true,
      })

      const response = await POST(makeRequest(validBody))

      expect(response.status).toBe(503)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(response.headers.get('retry-after')).toBe('30')
      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        strictLimiter,
        'track-contact:203.0.113.10',
        true,
      )
      expect(mockCreateClient).not.toHaveBeenCalled()
      expect(mockCreateServiceClient).not.toHaveBeenCalled()
    },
  )

  it(
    'rejects unauthenticated callers before creating the service client',
    async () => {
      const response = await POST(makeRequest(validBody))

      expect(response.status).toBe(401)
      expect(mockCreateServiceClient).not.toHaveBeenCalled()
      expect(mockCheckRateLimit).toHaveBeenCalledTimes(1)
    },
  )

  it(
    'applies a per-account cap before calling the privileged RPC',
    async () => {
      mockAuth({ id: 'user-1' })
      mockCheckRateLimit
        .mockResolvedValueOnce({ ok: true, remaining: 4 })
        .mockResolvedValueOnce({
          ok: false,
          error: 'too many lookups',
          retryAfter: 60,
        })

      const response = await POST(makeRequest(validBody))

      expect(response.status).toBe(429)
      expect(response.headers.get('retry-after')).toBe('60')
      expect(mockCheckRateLimit).toHaveBeenNthCalledWith(
        2,
        strictLimiter,
        'track-contact-user:user-1',
        true,
      )
      expect(mockCreateServiceClient).not.toHaveBeenCalled()
    },
  )

  it(
    'derives the visitor hash server-side before calling the service-only RPC',
    async () => {
      mockAuth({ id: 'user-1' })

      const response = await POST(makeRequest(validBody))

      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(mockRpc).toHaveBeenCalledWith('reveal_contact', {
        p_business_id: validBody.businessId,
        p_method_type: 'phone',
        p_visitor_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    },
  )

  it('does not expose database errors to the client', async () => {
    mockAuth({ id: 'user-1' })
    mockRpc.mockResolvedValueOnce({
      error: new Error('internal database detail'),
    })

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      ok: false,
      error: 'tracking_unavailable',
    })
  })
})
