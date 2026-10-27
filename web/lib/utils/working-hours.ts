type DayHours = { open: string; close: string }
type HoursMap = Record<string, DayHours | null | undefined>

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
const DAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

function cairoClock(now: Date): { dayIndex: number; minuteOfDay: number } | null {
  if (!Number.isFinite(now.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const values = new Map(parts.map((part) => [part.type, part.value]))
  const dayIndex = DAY_INDEX[values.get('weekday') ?? '']
  const hour = Number(values.get('hour'))
  const minute = Number(values.get('minute'))

  if (
    dayIndex === undefined ||
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    return null
  }

  return { dayIndex, minuteOfDay: hour * 60 + minute }
}

function toMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):[0-5]\d$/.exec(value)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function isWithinDayWindow(hours: DayHours | null | undefined, minuteOfDay: number): boolean {
  if (!hours) return false
  const open = toMinutes(hours.open)
  const close = toMinutes(hours.close)
  if (open === null || close === null) return false
  if (open === close) return true
  if (close > open) return minuteOfDay >= open && minuteOfDay < close
  return minuteOfDay >= open
}

export function isOpenAt(hours: HoursMap | null, now: Date): boolean {
  if (!hours) return false
  const clock = cairoClock(now)
  if (!clock) return false

  const todayKey = DAY_KEYS[clock.dayIndex]
  // Array lookups can be undefined under noUncheckedIndexedAccess; fail closed.
  if (!todayKey) return false
  if (isWithinDayWindow(hours[todayKey], clock.minuteOfDay)) return true

  const previousKey = DAY_KEYS[(clock.dayIndex + DAY_KEYS.length - 1) % DAY_KEYS.length]
  if (!previousKey) return false
  const previous = hours[previousKey]
  if (!previous) return false

  const previousOpen = toMinutes(previous.open)
  const previousClose = toMinutes(previous.close)
  return (
    previousOpen !== null &&
    previousClose !== null &&
    previousClose < previousOpen &&
    clock.minuteOfDay < previousClose
  )
}

export function isOpenNow(hours: HoursMap | null): boolean {
  return isOpenAt(hours, new Date())
}

type BusinessHoursSource = {
  working_hours: HoursMap | null
  open_now_override?: boolean | null
  is_open?: boolean | null
}

export function isBusinessOpen(business: BusinessHoursSource): boolean {
  if (typeof business.open_now_override === 'boolean') return business.open_now_override

  // Admin-created activities may not have a weekly schedule yet. In that case,
  // respect the saved manual state rather than marking every unscheduled activity closed.
  if (!business.working_hours || Object.keys(business.working_hours).length === 0) {
    return business.is_open === true
  }

  return isOpenNow(business.working_hours)
}
