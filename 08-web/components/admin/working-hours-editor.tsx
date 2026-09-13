'use client'
import { useState, useEffect } from 'react'

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

export default function WorkingHoursEditor({ initial = {} }: { initial?: WorkingHours }) {
  const [hours, setHours] = useState<WorkingHours>(() => {
    const out: WorkingHours = {}
    for (const d of DAYS) {
      out[d.key] = initial[d.key] ?? { ...DEFAULT_DAY }
    }
    return out
  })

  useEffect(() => {
    const hidden = document.getElementById('working-hours-json') as HTMLInputElement | null
    if (hidden) hidden.value = JSON.stringify(hours)
  }, [hours])

  const update = (day: string, patch: Partial<DayHours>) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  const copyToAll = (sourceDay: string) => {
    const src = hours[sourceDay]
    setHours((prev) => {
      const next = { ...prev }
      for (const d of DAYS) next[d.key] = { ...src }
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
      <input type="hidden" id="working-hours-json" name="working_hours_json" defaultValue={JSON.stringify(initial)} />

      <div className="wh-editor__toolbar">
        <button type="button" className="admin-btn admin-btn--sm" onClick={setAllOpen}>
          ✅ فتح الكل
        </button>
        <button type="button" className="admin-btn admin-btn--sm admin-btn--ghost" onClick={setAllClosed}>
          🚪 إغلاق الكل
        </button>
      </div>

      <div className="wh-editor__list">
        {DAYS.map((d) => {
          const day = hours[d.key]
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
                  <input
                    type="time"
                    className="wh-day__time"
                    value={day.open}
                    onChange={(e) => update(d.key, { open: e.target.value })}
                  />
                  <span className="wh-day__sep">—</span>
                  <input
                    type="time"
                    className="wh-day__time"
                    value={day.close}
                    onChange={(e) => update(d.key, { close: e.target.value })}
                  />
                  <button
                    type="button"
                    className="wh-day__copy"
                    onClick={() => copyToAll(d.key)}
                    title="نسخ لكل الأيام"
                  >
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
