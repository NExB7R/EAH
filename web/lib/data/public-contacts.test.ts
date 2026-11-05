import { describe, expect, it } from 'vitest'
import { filterPublicContactMethods, normalizePublicContactUrl } from './public-contacts'

describe('filterPublicContactMethods', () => {
  it('keeps only social and website links in public payloads', () => {
    const result = filterPublicContactMethods([
      { method_type: 'phone', value: '01012345678', is_primary: true },
      { method_type: 'whatsapp', value: '201012345678', is_primary: true },
      { method_type: 'complaints', value: '01098765432', is_primary: false },
      { method_type: 'manager', value: '01011112222', is_primary: false },
      { method_type: 'shift_morning', value: '01033334444', is_primary: false },
      { method_type: 'shift_evening', value: '01055556666', is_primary: false },
      { method_type: 'facebook', value: 'https://facebook.com/eah', is_primary: true },
      { method_type: 'instagram', value: 'https://instagram.com/eah', is_primary: false },
      { method_type: 'website', value: 'https://eah.example/', is_primary: false },
    ])

    expect(result).toEqual([
      { method_type: 'facebook', value: 'https://facebook.com/eah', is_primary: true },
      { method_type: 'instagram', value: 'https://instagram.com/eah', is_primary: false },
      { method_type: 'website', value: 'https://eah.example/', is_primary: false },
    ])
  })

  it('rejects unsafe or malformed public URLs', () => {
    expect(normalizePublicContactUrl('javascript:alert(1)')).toBeNull()
    expect(normalizePublicContactUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    expect(normalizePublicContactUrl('//example.com/profile')).toBeNull()
    expect(normalizePublicContactUrl('/relative/path')).toBeNull()
    expect(normalizePublicContactUrl('https://user:pass@example.com')).toBeNull()
    expect(normalizePublicContactUrl('not a url')).toBeNull()
    expect(normalizePublicContactUrl('https://example.com/profile')).toBe(
      'https://example.com/profile',
    )
  })

  it('drops unsafe social links from public payloads', () => {
    expect(
      filterPublicContactMethods([
        { method_type: 'facebook', value: 'javascript:alert(1)', is_primary: true },
        { method_type: 'website', value: 'https://eah.example', is_primary: false },
      ]),
    ).toEqual([
      { method_type: 'website', value: 'https://eah.example/', is_primary: false },
    ])
  })

  it('returns an empty list when all methods are private contact channels', () => {
    expect(
      filterPublicContactMethods([
        { method_type: 'phone', value: '01012345678', is_primary: true },
        { method_type: 'whatsapp', value: '201012345678', is_primary: false },
      ]),
    ).toEqual([])
  })
})
