'use client'

import { useState, useTransition } from 'react'
import {
  BellIcon,
  CheckCircleIcon,
  GiftIcon,
  EyeIcon,
  MessageCircleIcon,
  CrownGoldIcon,
} from '@/components/icons'
import { savePreferences } from './actions'
import styles from './preferences.module.css'

type Pref = {
  key: string
  label: string
  desc: string
  Icon: React.ComponentType<{ size?: number }>
  defaultOn: boolean
}

const PREFS: Pref[] = [
  {
    key: 'offer_new',
    label: 'عروض جديدة',
    desc: 'لما نشاط بتتابعه ينشر عرض',
    Icon: GiftIcon,
    defaultOn: true,
  },
  {
    key: 'review_reply',
    label: 'ردود على تقييماتي',
    desc: 'لما البايع المرتبط بالنشاط يرد على تقييمك',
    Icon: MessageCircleIcon,
    defaultOn: true,
  },
  {
    key: 'follow_new',
    label: 'متابعين جدد',
    desc: 'لما حد يتابع نشاطك (للبايعين)',
    Icon: EyeIcon,
    defaultOn: true,
  },
  {
    key: 'order_status',
    label: 'تحديثات الطلبات',
    desc: 'لما حالة طلبك تتغير',
    Icon: CheckCircleIcon,
    defaultOn: true,
  },
  {
    key: 'announcement',
    label: 'رسائل من الإدارة',
    desc: 'إعلانات وميزات جديدة',
    Icon: CrownGoldIcon,
    defaultOn: true,
  },
  {
    key: 'system',
    label: 'تنبيهات النظام',
    desc: 'تحذيرات أمنية وتحديثات مهمة',
    Icon: BellIcon,
    defaultOn: true,
  },
]

export default function PrefsForm() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFS.map((p) => [p.key, p.defaultOn])),
  )
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const toggle = (key: string) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  const handleSave = () => {
    startTransition(async () => {
      const res = await savePreferences(
        Object.entries(prefs).map(([key, value]) => ({ key, value })),
      )
      setMsg(res.ok ? 'تم الحفظ ✓' : res.error)
      setTimeout(() => setMsg(null), 2500)
    })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        {PREFS.map((p) => (
          <label key={p.key} className={styles.row}>
            <span className={styles.icon}>
              <p.Icon size={20} />
            </span>
            <span className={styles.body}>
              <span className={styles.label}>{p.label}</span>
              <span className={styles.desc}>{p.desc}</span>
            </span>
            <span className={styles.switchWrap}>
              <input
                type="checkbox"
                checked={prefs[p.key] ?? false}
                onChange={() => toggle(p.key)}
                className={styles.checkbox}
              />
              <span
                className={`${styles.switchTrack} ${prefs[p.key] ? styles.trackOn : ''}`}
                aria-hidden
              />
            </span>
          </label>
        ))}
      </div>

      <div className={styles.footer}>
        <button type="button" onClick={handleSave} disabled={pending} className={styles.saveBtn}>
          {pending ? 'جاري…' : 'احفظ التفضيلات'}
        </button>
        {msg && <span className={styles.msg}>{msg}</span>}
      </div>
    </div>
  )
}
