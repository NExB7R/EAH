'use client'

import { useState, useTransition } from 'react'
import {
  CheckCircleIcon,
  AlertIcon,
  SparklesIcon,
  HomeIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from '@/components/icons'
import { FEATURE_META, type FeatureFlags } from '@/lib/features'
import { saveFeatureFlags } from './actions'
import styles from './studio.module.css'

type Props = {
  initial: FeatureFlags
}

const GROUPS: { key: 'home' | 'features' | 'system'; label: string; Icon: typeof HomeIcon }[] = [
  { key: 'home', label: 'أقسام الرئيسية', Icon: HomeIcon },
  { key: 'features', label: 'ميزات المنصة', Icon: SparklesIcon },
  { key: 'system', label: 'النظام', Icon: ShieldCheckIcon },
]

export default function FlagsPanel({ initial }: Props) {
  const [flags, setFlags] = useState<FeatureFlags>(initial)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const toggle = (key: keyof FeatureFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveFeatureFlags(flags)
      setMsg(res.ok ? { type: 'ok', text: 'اتحفظ ✓' } : { type: 'err', text: res.error })
      setTimeout(() => setMsg(null), 3000)
    })
  }

  const hasChanges = JSON.stringify(flags) !== JSON.stringify(initial)

  return (
    <div className={styles.flagsWrap}>
      {GROUPS.map((g) => {
        const keys = (Object.keys(FEATURE_META) as (keyof FeatureFlags)[]).filter(
          (k) => FEATURE_META[k].group === g.key,
        )
        return (
          <section key={g.key} className={styles.flagsSection}>
            <header className={styles.flagsHead}>
              <span className={styles.flagsHeadIcon}>
                <g.Icon size={18} />
              </span>
              <h3 className={styles.flagsTitle}>{g.label}</h3>
              <span className={styles.flagsCount}>{keys.length}</span>
            </header>

            <div className={styles.flagsList}>
              {keys.map((key) => {
                const meta = FEATURE_META[key]
                const enabled = flags[key]
                return (
                  <label key={key} className={styles.flagRow}>
                    <span className={styles.flagBody}>
                      <span className={styles.flagLabel}>{meta.label}</span>
                      <span className={styles.flagDesc}>{meta.desc}</span>
                    </span>
                    <span className={styles.switchWrap}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggle(key)}
                        className={styles.checkbox}
                      />
                      <span
                        className={`${styles.switchTrack} ${enabled ? styles.trackOn : ''}`}
                        aria-hidden
                      />
                    </span>
                  </label>
                )
              })}
            </div>
          </section>
        )
      })}

      {msg && (
        <div className={`${styles.msg} ${msg.type === 'ok' ? styles.msgOk : styles.msgErr}`}>
          {msg.type === 'ok' ? <CheckCircleIcon size={14} /> : <AlertIcon size={14} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className={styles.actionsBar}>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || !hasChanges}
          className={styles.saveBtn}
        >
          <SettingsIcon size={14} />
          <span>{pending ? 'بيحفظ…' : hasChanges ? 'حفظ التغييرات' : 'محفوظ'}</span>
        </button>
        {hasChanges && <span className={styles.hint}>فيه تغييرات غير محفوظة</span>}
      </div>
    </div>
  )
}
