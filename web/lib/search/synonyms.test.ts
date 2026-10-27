import { describe, expect, it } from 'vitest'
import { extractTypes } from './synonyms'

describe('business type search synonyms', () => {
  it('detects supermarket queries in Arabic', () => {
    expect(extractTypes('ماركت')).toContain('supermarket')
    expect(extractTypes('سوبر ماركت')).toContain('supermarket')
    expect(extractTypes('بقالة')).toContain('supermarket')
  })

  it('continues recognizing existing built-in types', () => {
    expect(extractTypes('صيدلية')).toContain('pharmacy')
    expect(extractTypes('مطعم')).toContain('restaurant')
  })
})
