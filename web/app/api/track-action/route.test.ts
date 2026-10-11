import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/rate-limit', () => ({
  apiLimiter: { name: 'api' },
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
}))

vi.mock('@/lib/auth/ip', () => ({
  getHashedIp: vi.fn(),
}))

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(),
}))

import { POST } from './route'
import { apiLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getHashedIp } from '@/lib/auth/ip'
import { createServiceClient } from '@/lib/supabase/service'

const mockCheckRateLimit = vi.mocked(checkRateLimit)
const mockGetClientIp = vi.mocked(getClientIp)
const mockGetHashedIp = vi.mocked(getHashedIp)
const mockCreateServiceClient = vi.mocked(createServiceClient)
const mockInsert = vi.fn()

function makeRequest(body: unknown): NextRequest {
  return new Request('http://localhost/api/track-action', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetClientIp.mockResolvedValue('203.0.113.10')
  mockGetHashedIp.mockResolvedValue('hashed-ip-not-raw')
  mockCheckRateLimit.mockResolvedValue({ ok: true, remaining: 50 })
  mockInsert.mockResolvedValue({ error: null })
  mockCreateServiceClient.mockReturnValue({
    from: vi.fn(() => ({ insert: mockInsert })),
  } as unknown as ReturnType<typeof createServiceClient>)
})

describe('POST /api/track-action', () => {
  it('fails closed when the shared rate limiter is unavailable', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      ok: false,
      error: 'protection unavailable',
      retryAfter: 30,
      unavailable: true,
    })

    const response = await POST(
      makeRequest({ action: 'whatsapp', businessId: '6f4a1f8a-7e61-4b1f-a1c7-3a824f41bd9b' }),
    )

    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('retry-after')).toBe('30')
    expect(mockCheckRateLimit).toHaveBeenCalledWith(apiLimiter, 'track-action:203.0.113.10', true)
    expect(mockCreateServiceClient).not.toHaveBeenCalled()
  })

  it('rejects malformed input before using the service client', async () => {
    const response = await POST(makeRequest({ action: 'admin', businessId: 'not-a-uuid' }))

    expect(response.status).toBe(400)
    expect(mockCreateServiceClient).not.toHaveBeenCalled()
  })

  it('stores a privacy-preserving IP hash rather than the raw IP', async () => {
    const response = await POST(
      makeRequest({
        action: 'whatsapp',
        businessId: '6f4a1f8a-7e61-4b1f-a1c7-3a824f41bd9b',
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(mockGetHashedIp).toHaveBeenCalledOnce()
    expect(mockInsert).toHaveBeenCalledWith({
      business_id: '6f4a1f8a-7e61-4b1f-a1c7-3a824f41bd9b',
      action: 'whatsapp',
      ip_hash: 'hashed-ip-not-raw',
      user_agent: null,
    })
    expect(JSON.stringify(mockInsert.mock.calls)).not.toContain('203.0.113.10')
  })

  it('does not claim success when the database insert fails', async () => {
    mockInsert.mockResolvedValueOnce({ error: new Error('insert failed') })

    const response = await POST(
      makeRequest({
        action: 'phone_reveal',
        businessId: '6f4a1f8a-7e61-4b1f-a1c7-3a824f41bd9b',
      }),
    )

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ ok: false, error: 'tracking_unavailable' })
  })
})
