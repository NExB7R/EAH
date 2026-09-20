'use client'
import { useState } from 'react'
import './working-hours-editor.css'

export type DayHours = { open: string; close: string; closed: boolean }
export type WorkingHours = Record<string, DayHours>

const DAYS = [
  { key: 'sat', label: 'السبت' },
  { key: 'sun', label: 'الأحد' },
  { key: 'mon', label: 'الإثنين' },
  { key: 'tue', label: 'الثلاثاء' },
  { key: 'wed', label: 'الأربعاء' },
  { key: 'thu', label: 'الخميس' },
  { key: 'fri', label: 'الجمعة' },
] as const

const DEFAULT_DAY: DayHours = { open: '09:00', close: '23:00', closed: false }

// تحويل 24h ↔ 12h
function to12h(time: string): { h: number; m: number; ampm: 'ص' | 'م' } {
  const [hh, mm] = time.split(':').map((x) => parseInt(x, 10) || 0)
  const ampm: 'ص' | 'م' = hh < 12 ? 'ص' : 'م'
  let h12 = hh % 12
  if (h12 === 0) h12 = 12
  return { h: h12, m: mm, ampm }
}

function from12h(h: number, m: number, ampm: 'ص' | 'م'): string {
  let hh = h % 12
  if (ampm === 'م') hh += 12
  return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = [0, 15, 30, 45]

export default function WorkingHoursEditor({ initial = {} }: { initial?: WorkingHours }) {
  const [hours, setHours] = useState<WorkingHours>(() => {
    const out: WorkingHours = {}
    for (const d of DAYS) out[d.key] = initial[d.key] ?? { ...DEFAULT_DAY }
    return out
  })

  const serialized = JSON.stringify(hours)

  const update = (day: string, patch: Partial<DayHours>) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  const copyToAll = (src: string) => {
    setHours((prev) => {
      const next = { ...prev }
      for (const d of DAYS) next[d.key] = { ...prev[src] }
      return next
    })
  }

  const setAllOpen = () => {
    setHours((prev) => {
      const next = { ...prev }
      for (const d of DAYS) next[d.key] = { ...next[d.key], closed: false }
      return next
    })
  }

  const setAllClosed = () => {
    setHours((prev) => {
      const next = { ...prev }
      for (const d of DAYS) next[d.key] = { ...next[d.key], closed: true }
      return next
    })
  }

  return (
    <div className="wh-editor">
      <input type="hidden" name="working_hours_json" value={serialized} readOnly />

      <div className="wh-editor__toolbar">
        <button type="button" className="wh-btn wh-btn--ok" onClick={setAllOpen}>فتح الكل</button>
        <button type="button" className="wh-btn wh-btn--ghost" onClick={setAllClosed}>إغلاق الكل</button>
      </div>

      <div className="wh-editor__list">
        {DAYS.map((d) => {
          const day = hours[d.key]
          const o = to12h(day.open)
          const c = to12h(day.close)
          return (
            <div key={d.key} className={`wh-day ${day.closed ? 'is-closed' : ''}`}>
              <span className="wh-day__label">{d.label}</span>

              <label className="wh-day__toggle">
                <input
                  type="checkbox"
                  checked={!day.closed}
                  onChange={(e) => update(d.key, { closed: !e.target.checked })}
                />
                <span className="wh-day__toggle-track">
                  <span className="wh-day__toggle-thumb" />
                </span>
              </label>

              {day.closed ? (
                <span className="wh-day__closed">مغلق</span>
              ) : (
                <div className="wh-day__times">
                  {/* من */}
                  <div className="wh-time">
                    <select
                      className="wh-time__select"
                      value={o.h}
                      onChange={(e) => update(d.key, { open: from12h(parseInt(e.target.value), o.m, o.ampm) })}
                    >
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="wh-time__sep">:</span>
                    <select
                      className="wh-time__select wh-time__select--min"
                      value={o.m}
                      onChange={(e) => update(d.key, { open: from12h(o.h, parseInt(e.target.value), o.ampm) })}
                    >
                      {MINUTES.map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                    </select>
                    <button
                      type="button"
                      className="wh-time__ampm"
                      onClick={() => update(d.key, { open: from12h(o.h, o.m, o.ampm === 'ص' ? 'م' : 'ص') })}
                    >
                      {o.ampm}
                    </button>
                  </div>

                  <span className="wh-day__dash">—</span>

                  {/* إلى */}
                  <div className="wh-time">
                    <select
                      className="wh-time__select"
                      value={c.h}
                      onChange={(e) => update(d.key, { close: from12h(parseInt(e.target.value), c.m, c.ampm) })}
                    >
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="wh-time__sep">:</span>
                    <select
                      className="wh-time__select wh-time__select--min"
                      value={c.m}
                      onChange={(e) => update(d.key, { close: from12h(c.h, parseInt(e.target.value), c.ampm) })}
                    >
                      {MINUTES.map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                    </select>
                    <button
                      type="button"
                      className="wh-time__ampm"
                      onClick={() => update(d.key, { close: from12h(c.h, c.m, c.ampm === 'ص' ? 'م' : 'ص') })}
                    >
                      {c.ampm}
                    </button>
                  </div>

                  <button type="button" className="wh-day__copy" onClick={() => copyToAll(d.key)} title="نسخ لكل الأيام">
                    نسخ للكل
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
