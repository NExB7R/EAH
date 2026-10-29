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

const CAIRO_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Cairo',
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/**
 * Convert a timestamp into the platform's business timezone.
 * Use the IANA timezone instead of a fixed UTC offset so daylight-saving
 * changes and dates crossing midnight are handled consistently.
 */
export function getCairoDateParts(value: string | Date): CairoDateParts | null {
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) return null

  const parts = CAIRO_DATE_FORMATTER.formatToParts(date)

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


/**
 * Interpret a datetime-local input as Cairo wall time and convert it to UTC.
 * Returns null for malformed calendar values and local times skipped by DST.
 */
export function parseCairoLocalDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim())
  if (!match) return null

  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw] = match
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)

  if (
    year < 1900 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59
  ) {
    return null
  }

  const desired = new Date(0)
  desired.setUTCFullYear(year, month - 1, day)
  desired.setUTCHours(hour, minute, 0, 0)
  const desiredTimestamp = desired.getTime()

  // setUTCFullYear normalizes impossible dates, so reject any rollover.
  if (
    desired.getUTCFullYear() !== year ||
    desired.getUTCMonth() + 1 !== month ||
    desired.getUTCDate() !== day
  ) {
    return null
  }

  let candidate = desiredTimestamp
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = getCairoDateParts(new Date(candidate))
    if (!parts) return null

    const [yearPart, monthPart, dayPart] = parts.dateKey.split('-')
    const cairoYear = Number(yearPart)
    const cairoMonth = Number(monthPart)
    const cairoDay = Number(dayPart)
    if (![cairoYear, cairoMonth, cairoDay].every(Number.isInteger)) return null

    const represented = Date.UTC(cairoYear, cairoMonth - 1, cairoDay, parts.hour, parts.minute)
    const difference = desiredTimestamp - represented
    if (difference === 0) break
    candidate += difference
  }

  const resolved = new Date(candidate)
  const finalParts = getCairoDateParts(resolved)
  if (!finalParts) return null

  const expectedDate = `${yearRaw}-${monthRaw}-${dayRaw}`
  if (
    finalParts.dateKey !== expectedDate ||
    finalParts.hour !== hour ||
    finalParts.minute !== minute
  ) {
    return null
  }

  return resolved
}
