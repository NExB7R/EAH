import { describe, expect, it } from 'vitest'
import { isBusinessOpen, isOpenAt } from './working-hours'

describe('working hours use Africa/Cairo local time', () => {
  it('checks schedules using Egypt local time, not the server timezone', () => {
    const schedule = { mon: { open: '18:00', close: '22:00' } }
    expect(isOpenAt(schedule, new Date('2026-10-26T17:00:00.000Z'))).toBe(true)
    expect(isOpenAt(schedule, new Date('2026-10-26T21:30:00.000Z'))).toBe(false)
  })

  it('keeps an overnight schedule open after midnight from the previous day', () => {
    const schedule = { mon: { open: '22:00', close: '02:00' } }
    expect(isOpenAt(schedule, new Date('2026-10-26T19:30:00.000Z'))).toBe(true)
    expect(isOpenAt(schedule, new Date('2026-10-26T22:00:00.000Z'))).toBe(true)
    expect(isOpenAt(schedule, new Date('2026-10-27T00:30:00.000Z'))).toBe(false)
  })

  it('honors manual open/closed overrides and falls back to the schedule', () => {
    const openSchedule = { mon: { open: '18:00', close: '22:00' } }
    const closedSchedule = { mon: { open: '10:00', close: '12:00' } }
    const now = new Date('2026-10-26T17:00:00.000Z')

    expect(isBusinessOpen({ working_hours: closedSchedule, open_now_override: true })).toBe(true)
    expect(isBusinessOpen({ working_hours: openSchedule, open_now_override: false })).toBe(false)
    expect(isBusinessOpen({ working_hours: openSchedule, open_now_override: null })).toBe(true)
    expect(isBusinessOpen({ working_hours: closedSchedule })).toBe(false)
  })

  it('uses the saved manual state when no weekly schedule is configured', () => {
    expect(isBusinessOpen({ working_hours: null, is_open: true })).toBe(true)
    expect(isBusinessOpen({ working_hours: null, is_open: false })).toBe(false)
    expect(isBusinessOpen({ working_hours: {}, is_open: true })).toBe(true)
    expect(isBusinessOpen({ working_hours: {}, is_open: false })).toBe(false)
  })

  it('fails closed for malformed hours and invalid dates', () => {
    expect(
      isOpenAt({ mon: { open: '25:90', close: '02:00' } }, new Date('2026-10-26T19:00:00Z')),
    ).toBe(false)
    expect(isOpenAt({ mon: { open: '10:00', close: '18:00' } }, new Date('invalid'))).toBe(false)
    expect(isOpenAt(null, new Date('2026-10-26T19:00:00Z'))).toBe(false)
  })
})
