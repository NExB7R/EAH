import './business-hours.css'

type DayHours = { open: string; close: string; closed: boolean }
type WorkingHours = Record<string, DayHours>

const DAYS: { key: string; label: string }[] = [
  { key: 'sat', label: 'السبت' },
  { key: 'sun', label: 'الأحد' },
  { key: 'mon', label: 'الإثنين' },
  { key: 'tue', label: 'الثلاثاء' },
  { key: 'wed', label: 'الأربعاء' },
  { key: 'thu', label: 'الخميس' },
  { key: 'fri', label: 'الجمعة' },
]

function to12h(time: string): string {
  if (!time) return '—'
  const [hStr, mStr] = time.split(':')
  const h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  const ampm = h < 12 ? 'ص' : 'م'
  let h12 = h % 12
  if (h12 === 0) h12 = 12
  return `${h12}:${m} ${ampm}`
}

export default function BusinessHours({ hours }: { hours: WorkingHours | null | undefined }) {
  if (!hours || Object.keys(hours).length === 0) return null

  // "النهارده" بتوقيت القاهرة مش بتوقيت السيرفر
  const egyptNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
  const todayKey = ['sun','mon','tue','wed','thu','fri','sat'][egyptNow.getDay()]

  return (
    <section className="bhrs">
      <header className="bhrs__head">
        <h2 className="bhrs__title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
          </svg>
          أوقات العمل
        </h2>
      </header>
      <ul className="bhrs__list">
        {DAYS.map((d) => {
          const h = hours[d.key]
          if (!h) return null
          const isToday = d.key === todayKey
          return (
            <li key={d.key} className={`bhrs__row ${isToday ? 'is-today' : ''} ${h.closed ? 'is-closed' : ''}`}>
              <span className="bhrs__day">
                {isToday && <span className="bhrs__today-dot" />}
                {d.label}
              </span>
              <span className="bhrs__time">
                {h.closed ? 'مقفول' : h.open === h.close ? 'مفتوح 24 ساعة' : `${to12h(h.open)} — ${to12h(h.close)}`}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
