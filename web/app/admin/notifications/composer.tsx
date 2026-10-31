'use client'

import { useState, useTransition } from 'react'
import { SendIcon, CheckCircleIcon, AlertIcon, SparklesIcon } from '@/components/icons'
import { sendBroadcast, type SendResult } from './actions'
import styles from './notifications.module.css'

type Audience = {
  type: 'all' | 'customers' | 'merchants' | 'verified' | 'premium'
  label: string
  count: number
}

type Props = {
  audiences: Audience[]
}

export default function Composer({ audiences }: Props) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<SendResult | null>(null)
  const [audience, setAudience] = useState('all')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const res = await sendBroadcast(formData)
      setResult(res)
      if (res.ok) form.reset()
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          العنوان <span className={styles.hint}>اللي هيبان أول حاجة</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={80}
          placeholder="مثلاً: عرض خاص للأسبوع الجاي"
          className={styles.input}
          dir="rtl"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="body" className={styles.label}>
          الرسالة <span className={styles.hint}>حتى 400 حرف</span>
        </label>
        <textarea
          id="body"
          name="body"
          required
          maxLength={400}
          rows={4}
          placeholder="اكتب تفاصيل الرسالة…"
          className={styles.textarea}
          dir="rtl"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="deepLink" className={styles.label}>
          رابط (اختياري) <span className={styles.hint}>هيفتح عند الضغط على الإشعار</span>
        </label>
        <input
          id="deepLink"
          name="deepLink"
          type="text"
          placeholder="/offers أو /businesses/xxx"
          className={styles.input}
          dir="ltr"
        />
      </div>

      <fieldset className={styles.field}>
        <legend className={styles.label}>المستهدفون</legend>
        <div className={styles.audienceGrid}>
          {audiences.map((a) => (
            <label
              key={a.type}
              className={`${styles.audienceCard} ${audience === a.type ? styles.audienceActive : ''}`}
            >
              <input
                type="radio"
                name="audience"
                value={a.type}
                checked={audience === a.type}
                onChange={() => setAudience(a.type)}
                className={styles.radio}
              />
              <span className={styles.audienceLabel}>{a.label}</span>
              <span className={styles.audienceCount}>{a.count.toLocaleString('ar-EG')}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={styles.switch}>
        <input type="checkbox" name="push" defaultChecked className={styles.checkbox} />
        <span className={styles.switchBody}>
          <SparklesIcon size={14} />
          <span>إرسال كإشعار فوري إلى المتصفح</span>
        </span>
      </label>

      <button type="submit" disabled={pending} className={styles.btn}>
        <SendIcon size={16} />
        <span>{pending ? 'جاري الإرسال…' : 'ابعت الإشعار'}</span>
      </button>

      {result && (
        <div className={`${styles.result} ${result.ok ? styles.resultOk : styles.resultErr}`}>
          {result.ok ? (
            <>
              <CheckCircleIcon size={16} />
              <span>
                تم الإرسال — {result.inserted} إشعار، {result.pushed} إشعار فوري
              </span>
            </>
          ) : (
            <>
              <AlertIcon size={16} />
              <span>{result.error}</span>
            </>
          )}
        </div>
      )}
    </form>
  )
}
