import { describe, expect, it } from 'vitest'
import { isEgyptianMobileNumber } from './phone-validation'

describe('isEgyptianMobileNumber', () => {
  it.each(['01012345678', '01112345678', '01212345678', '01512345678']) (
    'accepts valid local Egyptian mobile %s',
    (value) => expect(isEgyptianMobileNumber(value)).toBe(true),
  )

  it.each(['0101234567', '01912345678', '02012345678', '+201012345678', '012345678901']) (
    'rejects invalid local mobile %s',
    (value) => expect(isEgyptianMobileNumber(value)).toBe(false),
  )
})
