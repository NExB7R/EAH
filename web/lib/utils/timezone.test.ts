import { describe, expect, it } from 'vitest'
import { getCairoDateParts } from './timezone'

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

  it('fails closed for invalid timestamps', () => {
    expect(getCairoDateParts('not-a-date')).toBeNull()
    expect(getCairoDateParts(new Date(Number.NaN))).toBeNull()
  })
})
