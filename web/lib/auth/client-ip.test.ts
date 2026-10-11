import { describe, expect, it } from 'vitest'
import { getTrustedClientIp } from './client-ip'

describe('getTrustedClientIp', () => {
  it('prefers the platform-resolved x-real-ip over caller-supplied forwarding values', () => {
    const headers = new Headers({
      'x-real-ip': '198.51.100.12',
      'x-forwarded-for': '203.0.113.99, 198.51.100.12',
    })

    expect(getTrustedClientIp(headers)).toBe('198.51.100.12')
  })

  it('uses the right-most forwarded address when x-real-ip is absent', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.99, 198.51.100.12, 192.0.2.7',
    })

    expect(getTrustedClientIp(headers)).toBe('192.0.2.7')
  })

  it('ignores empty forwarded entries and trims whitespace', () => {
    const headers = new Headers({
      'x-forwarded-for': ' 203.0.113.99, , 192.0.2.7  ',
    })

    expect(getTrustedClientIp(headers)).toBe('192.0.2.7')
  })

  it('returns unknown when no usable address exists', () => {
    expect(getTrustedClientIp(new Headers())).toBe('unknown')
    expect(getTrustedClientIp(new Headers({ 'x-forwarded-for': ' , ' }))).toBe('unknown')
  })
})
