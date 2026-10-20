'use client'

import { CloseIcon } from '@/components/icons'
import { useBusinessForm } from '../business-form-context'
import { DAYS, HOURS_PRESETS, type DayHours, type DayKey } from '../business-form-config'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function HoursSection() {
  const ctx = useBusinessForm()

  const applyPreset = (open: string, close: string) => {
    const next: Record<DayKey, DayHours> = { ...ctx.hours }
    for (const d of DAYS) next[d.key] = { open, close }
    ctx.setHours(next)
  }

  return (
    <>
      <div className={styles.presets}>
        {HOURS_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={styles.presetBtn}
            onClick={() => applyPreset(p.open, p.close)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className={styles.hoursList}>
        {DAYS.map((d) => {
          const h = ctx.hours[d.key]
          return (
            <div key={d.key} className={styles.hoursRow}>
              <span className={styles.hoursDay}>{d.label}</span>
              {h ? (
                <>
                  <input
                    type="time"
                    value={h.open}
                    onChange={(e) =>
                      ctx.setHours((prev) => ({
                        ...prev,
                        [d.key]: { open: e.target.value, close: h.close },
                      }))
                    }
                    className={styles.hoursInput}
                  />
                  <input
                    type="time"
                    value={h.close}
                    onChange={(e) =>
                      ctx.setHours((prev) => ({
                        ...prev,
                        [d.key]: { open: h.open, close: e.target.value },
                      }))
                    }
                    className={styles.hoursInput}
                  />
                  <button
                    type="button"
                    className={styles.hoursToggle}
                    onClick={() => ctx.setHours((prev) => ({ ...prev, [d.key]: null }))}
                    aria-label="إغلاق اليوم"
                  >
                    <CloseIcon size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className={styles.hoursOff}>مغلق</span>
                  <button
                    type="button"
                    className={styles.presetBtn}
                    onClick={() =>
                      ctx.setHours((prev) => ({
                        ...prev,
                        [d.key]: { open: '09:00', close: '23:00' },
                      }))
                    }
                  >
                    تفعيل
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>
      <SaveBar onClick={ctx.saveHours} pending={ctx.pending} saved={ctx.savedSection === 'hours'} />
    </>
  )
}
