import { describe, expect, it } from 'vitest'
import {
  getCairoDateParts,
  parseCairoLocalDateTime,
  parseCairoLocalDateEndOfDay,
} from './timezone'

describe('Cairo business timezone helpers', () => {
  it('uses Egypt daylight-saving time when it is active', () => {
    // 22:30 UTC is already 01:30 Thursday in Cairo during summer time.
    expect(getCairoDateParts('2026-07-01T22:30:00.000Z')).toEqual({
      dateKey: '2026-07-02',
      dayKey: 'thu',
      hour: 1,
      minute: 30,
    })
  })

  it('uses Egypt standard time outside daylight-saving time', () => {
    expect(getCairoDateParts('2026-11-01T22:30:00.000Z')).toEqual({
      dateKey: '2026-11-02',
      dayKey: 'mon',
      hour: 0,
      minute: 30,
    })
  })

  it('handles timestamps that do not cross local midnight', () => {
    expect(getCairoDateParts('2026-10-26T17:45:00.000Z')).toEqual({
      dateKey: '2026-10-26',
      dayKey: 'mon',
      hour: 20,
      minute: 45,
    })
  })

  it('converts Cairo local time to UTC during daylight-saving time', () => {
    expect(parseCairoLocalDateTime('2026-07-02T01:30')?.toISOString()).toBe(
      '2026-07-01T22:30:00.000Z',
    )
  })

  it('converts Cairo local time to UTC during standard time', () => {
    expect(parseCairoLocalDateTime('2026-11-02T00:30')?.toISOString()).toBe(
      '2026-11-01T22:30:00.000Z',
    )
  })

  it('rejects impossible local datetimes', () => {
    expect(parseCairoLocalDateTime('2026-02-30T12:00')).toBeNull()
    expect(parseCairoLocalDateTime('2026-13-01T12:00')).toBeNull()
    expect(parseCairoLocalDateTime('invalid')).toBeNull()
  })

  it('fails closed for invalid timestamps', () => {
    expect(getCairoDateParts('not-a-date')).toBeNull()
    expect(getCairoDateParts(new Date(Number.NaN))).toBeNull()
  })
})


describe('Cairo local expiry dates', () => {
  it('expires at the end of the selected Cairo calendar day in standard time', () => {
    expect(parseCairoLocalDateEndOfDay('2026-11-03')?.toISOString()).toBe(
      '2026-11-03T21:59:59.999Z',
    )
  })

  it('uses the daylight-saving offset for a selected summer date', () => {
    expect(parseCairoLocalDateEndOfDay('2026-07-03')?.toISOString()).toBe(
      '2026-07-03T20:59:59.999Z',
    )
  })

  it('rejects malformed or impossible date-only values', () => {
    expect(parseCairoLocalDateEndOfDay('2026-02-31')).toBeNull()
    expect(parseCairoLocalDateEndOfDay('not-a-date')).toBeNull()
  })
})
