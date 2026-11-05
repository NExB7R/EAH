import { describe, expect, it } from 'vitest'
import { filterPublicContactMethods } from './public-contacts'

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
      { method_type: 'website', value: 'https://eah.example', is_primary: false },
    ])

    expect(result).toEqual([
      { method_type: 'facebook', value: 'https://facebook.com/eah', is_primary: true },
      { method_type: 'instagram', value: 'https://instagram.com/eah', is_primary: false },
      { method_type: 'website', value: 'https://eah.example', is_primary: false },
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
