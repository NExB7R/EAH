export type CairoDateParts = {
  dateKey: string
  dayKey: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
  hour: number
  minute: number
}

const DAY_KEY_BY_WEEKDAY: Record<string, CairoDateParts['dayKey']> = {
  Sun: 'sun',
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
}

/**
 * Convert a timestamp into the platform's business timezone.
 * Use the IANA timezone instead of a fixed UTC offset so daylight-saving
 * changes and dates crossing midnight are handled consistently.
 */
export function getCairoDateParts(value: string | Date): CairoDateParts | null {
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const values = new Map(parts.map((part) => [part.type, part.value]))
  const dayKey = DAY_KEY_BY_WEEKDAY[values.get('weekday') ?? '']
  const year = values.get('year')
  const month = values.get('month')
  const day = values.get('day')
  const hour = Number(values.get('hour'))
  const minute = Number(values.get('minute'))

  if (
    !dayKey ||
    !year ||
    !month ||
    !day ||
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    return null
  }

  return { dateKey: `${year}-${month}-${day}`, dayKey, hour, minute }
}
