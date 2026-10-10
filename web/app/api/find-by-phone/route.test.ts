import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/rate-limit', () => ({
  apiLimiter: { name: 'api' },
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

function makeRequest(phone = '01012345678'): NextRequest {
  return new Request('http://localhost/api/find-by-phone', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phone }),
  }) as NextRequest
}

function mockAuth(user: { id: string } | null) {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  } as unknown as Awaited<ReturnType<typeof createClient>>)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetClientIp.mockResolvedValue('203.0.113.10')
  mockCheckRateLimit.mockResolvedValue({ ok: true, remaining: 10 })
  mockAuth(null)
  mockRpc.mockReset()
  mockCreateServiceClient.mockReturnValue({
    rpc: mockRpc,
  } as unknown as ReturnType<typeof createServiceClient>)
})

describe('POST /api/find-by-phone', () => {
  it('rejects unauthenticated callers before creating the service client', async () => {
    const response = await POST(makeRequest())

    expect(response.status).toBe(401)
    expect(mockCreateServiceClient).not.toHaveBeenCalled()
    expect(mockCheckRateLimit).toHaveBeenCalledTimes(1)
  })

  it('fails closed when the IP limiter is unavailable', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      ok: false,
      error: 'protection unavailable',
      retryAfter: 30,
      unavailable: true,
    })

    const response = await POST(makeRequest())

    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('retry-after')).toBe('30')
    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockCreateServiceClient).not.toHaveBeenCalled()
  })

  it('applies a per-account limit before any privileged RPC call', async () => {
    mockAuth({ id: 'user-1' })
    mockCheckRateLimit.mockResolvedValueOnce({ ok: true, remaining: 10 }).mockResolvedValueOnce({
      ok: false,
      error: 'too many lookups',
      retryAfter: 60,
    })

    const response = await POST(makeRequest())

    expect(response.status).toBe(429)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('retry-after')).toBe('60')
    expect(mockCheckRateLimit).toHaveBeenNthCalledWith(1, strictLimiter, 'find:203.0.113.10', true)
    expect(mockCheckRateLimit).toHaveBeenNthCalledWith(2, strictLimiter, 'find-user:user-1', true)
    expect(mockCreateServiceClient).not.toHaveBeenCalled()
  })

  it('returns only the profile fields supported by the UI', async () => {
    mockAuth({ id: 'user-1' })
    mockRpc.mockResolvedValue({
      data: [
        {
          user_id: 'profile-1',
          display_name: 'Test User',
          alias: null,
          avatar_url: null,
          trust_score: 50,
          trust_tier: 'fel',
          legend_points: 0,
          is_premium: false,
          is_business: false,
          business_slug: null,
          business_name: null,
          member_since: '2026-01-01T00:00:00.000Z',
          private_internal_field: 'must not escape',
        },
      ],
      error: null,
    })

    const response = await POST(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(body.user).toEqual({
      user_id: 'profile-1',
      display_name: 'Test User',
      alias: null,
      avatar_url: null,
      trust_score: 50,
      trust_tier: 'fel',
      legend_points: 0,
      is_premium: false,
      is_business: false,
      business_slug: null,
      business_name: null,
      member_since: '2026-01-01T00:00:00.000Z',
    })
    expect(body.user.private_internal_field).toBeUndefined()
    expect(mockRpc).toHaveBeenCalledWith('find_by_phone', { p_phone: '01012345678' })
  })
})
