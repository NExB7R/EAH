import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/rate-limit', () => ({
  authLimiter: { name: 'auth' },
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
}))

vi.mock('@/lib/auth/ip', () => ({
  getHashedIp: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(),
}))

import { signupAction } from './actions'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getHashedIp } from '@/lib/auth/ip'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const mockCheckRateLimit = vi.mocked(checkRateLimit)
const mockGetClientIp = vi.mocked(getClientIp)
const mockGetHashedIp = vi.mocked(getHashedIp)
const mockCreateClient = vi.mocked(createClient)
const mockCreateServiceClient = vi.mocked(createServiceClient)
const mockPhoneLookup = vi.fn()
const mockSignUp = vi.fn()

function makeSignupForm(): FormData {
  const form = new FormData()
  form.set('display_name', 'محمد')
  form.set('phone', '01012345678')
  form.set('password', 'Test1234')
  form.set('confirm_password', 'Test1234')
  form.set('cf-turnstile-response', 'test-turnstile-token')
  return form
}

afterEach(() => {
  vi.unstubAllEnvs()
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('TURNSTILE_SECRET_KEY', '1x000-test-key')
  mockGetClientIp.mockResolvedValue('203.0.113.10')
  mockCheckRateLimit.mockResolvedValue({ ok: true, remaining: 4 })
  mockGetHashedIp.mockResolvedValue('hashed-test-ip')
  mockPhoneLookup.mockReset()
  mockSignUp.mockResolvedValue({ error: null })
  mockCreateServiceClient.mockReturnValue({
    rpc: mockPhoneLookup,
  } as unknown as ReturnType<typeof createServiceClient>)
  mockCreateClient.mockResolvedValue({
    auth: { signUp: mockSignUp },
  } as unknown as Awaited<ReturnType<typeof createClient>>)
})

describe('signupAction phone registration check', () => {
  it('uses the server service client for the duplicate-phone lookup', async () => {
    mockPhoneLookup.mockResolvedValue({ data: false, error: null })

    const result = await signupAction(makeSignupForm())

    expect(result).toEqual({ ok: true, redirect: '/' })
    expect(mockCreateServiceClient).toHaveBeenCalledOnce()
    expect(mockPhoneLookup).toHaveBeenCalledWith('is_phone_registered', {
      p_phone_e164: '+201012345678',
    })
    expect(mockSignUp).toHaveBeenCalledOnce()
  })

  it('stops signup when the server-side phone lookup fails', async () => {
    mockPhoneLookup.mockResolvedValue({
      data: null,
      error: new Error('permission denied'),
    })

    const result = await signupAction(makeSignupForm())

    expect(result).toEqual({
      ok: false,
      error: 'خدمة التسجيل غير متاحة مؤقتًا — حاول لاحقًا',
    })
    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('returns the existing phone error without creating another auth user', async () => {
    mockPhoneLookup.mockResolvedValue({ data: true, error: null })

    const result = await signupAction(makeSignupForm())

    expect(result).toEqual({
      ok: false,
      error: 'الرقم ده مسجل قبل كده — جرب تدخل',
      field: 'phone',
    })
    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockSignUp).not.toHaveBeenCalled()
  })
})
