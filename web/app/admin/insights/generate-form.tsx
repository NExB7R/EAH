'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertIcon, CheckCircleIcon, CloseIcon, SparklesIcon } from '@/components/icons'
import { generateAdminInsight } from './actions'
import styles from './generate-form.module.css'

type Business = { id: string; name: string }

type Props = {
  businesses: Business[]
}

const DAY_OPTIONS = [
  { value: 7, label: '7 أيام' },
  { value: 30, label: '30 يوم' },
  { value: 90, label: '90 يوم' },
]

export default function GenerateForm({ businesses }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? '')
  const [days, setDays] = useState(30)
  const [notify, setNotify] = useState(true)
  const [sections, setSections] = useState({
    top_points: true,
    recommendations: true,
    ai_narrative: true,
  })

  const submit = () => {
    if (!businessId) {
      setError('اختار نشاط')
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await generateAdminInsight(businessId, days, notify, sections)
      if (res.ok) {
        setSuccess('تم توليد التقرير')
        setTimeout(() => {
          setOpen(false)
          setSuccess(null)
          router.refresh()
        }, 900)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={styles.trigger}>
        <SparklesIcon size={16} />
        <span>توليد تقرير جديد</span>
      </button>

      {open && (
        <div
          className={styles.backdrop}
          onClick={() => !pending && setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.header}>
              <h2 className={styles.title}>توليد تقرير أداء</h2>
              <button
                type="button"
                onClick={() => !pending && setOpen(false)}
                className={styles.close}
                aria-label="إغلاق"
              >
                <CloseIcon size={16} />
              </button>
            </header>

            <div className={styles.body}>
              <label className={styles.field}>
                <span className={styles.label}>النشاط</span>
                <select
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className={styles.input}
                  disabled={pending}
                >
                  {businesses.length === 0 && <option value="">— مفيش أنشطة —</option>}
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.field}>
                <span className={styles.label}>الفترة</span>
                <div className={styles.daysRow}>
                  {DAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDays(opt.value)}
                      disabled={pending}
                      className={`${styles.dayBtn} ${days === opt.value ? styles.dayBtnActive : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>محتوى التقرير</span>
                <div className={styles.toggles}>
                  <label className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      checked={sections.top_points}
                      onChange={(e) => setSections((p) => ({ ...p, top_points: e.target.checked }))}
                      disabled={pending}
                    />
                    <span>أهم الملاحظات</span>
                  </label>
                  <label className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      checked={sections.recommendations}
                      onChange={(e) =>
                        setSections((p) => ({ ...p, recommendations: e.target.checked }))
                      }
                      disabled={pending}
                    />
                    <span>التوصيات</span>
                  </label>
                  <label className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      checked={sections.ai_narrative}
                      onChange={(e) =>
                        setSections((p) => ({ ...p, ai_narrative: e.target.checked }))
                      }
                      disabled={pending}
                    />
                    <span>تحليل مفصل بالذكاء الاصطناعي</span>
                  </label>
                </div>
              </div>

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  disabled={pending}
                />
                <span>أبلغ التاجر المرتبط بالنشاط بإشعار</span>
              </label>

              {error && (
                <div className={styles.error}>
                  <AlertIcon size={12} />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className={styles.success}>
                  <CheckCircleIcon size={12} />
                  <span>{success}</span>
                </div>
              )}

              <div className={styles.footer}>
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending || !businessId}
                  className={styles.submit}
                >
                  {pending ? 'بيولّد…' : 'توليد التقرير'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className={styles.cancel}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
