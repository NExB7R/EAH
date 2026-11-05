import { describe, expect, it } from 'vitest'
import { isBusinessOwnerUniqueConflict } from './business-owner-constraint'

describe('isBusinessOwnerUniqueConflict', () => {
  it('recognizes the named partial unique index', () => {
    expect(
      isBusinessOwnerUniqueConflict({
        code: '23505',
        message: 'duplicate key value violates unique constraint "businesses_one_owner_per_account_idx"',
      }),
    ).toBe(true)
  })

  it('recognizes a Postgres owner_profile_id duplicate detail', () => {
    expect(
      isBusinessOwnerUniqueConflict({
        code: '23505',
        details: 'Key (owner_profile_id)=(...) already exists.',
      }),
    ).toBe(true)
  })

  it('does not confuse duplicate business names or slugs with owner conflicts', () => {
    expect(
      isBusinessOwnerUniqueConflict({
        code: '23505',
        message: 'duplicate key value violates unique constraint "businesses_slug_key"',
        details: 'Key (slug)=(...) already exists.',
      }),
    ).toBe(false)
  })

  it('ignores non-unique database errors', () => {
    expect(
      isBusinessOwnerUniqueConflict({
        code: '23503',
        message: 'foreign key violation on owner_profile_id',
      }),
    ).toBe(false)
  })

  it('fails safely when the error is missing', () => {
    expect(isBusinessOwnerUniqueConflict(null)).toBe(false)
    expect(isBusinessOwnerUniqueConflict(undefined)).toBe(false)
  })
})
