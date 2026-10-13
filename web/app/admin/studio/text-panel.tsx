'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertIcon, CheckCircleIcon, FileTextIcon, SettingsIcon } from '@/components/icons'
import { DEFAULT_TEXTS, TEXT_META, type AppTexts } from '@/lib/app-texts'
import { saveAppTexts } from './actions'
import styles from './studio.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Text Panel (Studio)
// تعديل النصوص الحيوية في المنصة
// ═══════════════════════════════════════════════════════════

type Props = {
  initial: AppTexts
}

const GROUPS: { key: 'hero' | 'footer'; label: string }[] = [
  { key: 'hero', label: 'الـ Hero (الرئيسية)' },
  { key: 'footer', label: 'الفوتر' },
]

export default function TextPanel({ initial }: Props) {
  const router = useRouter()
  const [texts, setTexts] = useState<AppTexts>(initial)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const update = (key: keyof AppTexts, value: string) => {
    setTexts((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveAppTexts(texts)
      if (res.ok) {
        setMsg({ type: 'ok', text: 'اتحفظ ✓' })
        router.refresh()
      } else {
        setMsg({ type: 'err', text: res.error })
      }
      setTimeout(() => setMsg(null), 3000)
    })
  }

  const handleReset = () => {
    setTexts(DEFAULT_TEXTS)
  }

  const hasChanges = JSON.stringify(texts) !== JSON.stringify(initial)

  return (
    <div className={styles.flagsWrap}>
      {GROUPS.map((g) => {
        const keys = (Object.keys(TEXT_META) as (keyof AppTexts)[]).filter(
          (k) => TEXT_META[k].group === g.key,
        )
        return (
          <section key={g.key} className={styles.flagsSection}>
            <header className={styles.flagsHead}>
              <span className={styles.flagsHeadIcon}>
                <FileTextIcon size={18} />
              </span>
              <h3 className={styles.flagsTitle}>{g.label}</h3>
              <span className={styles.flagsCount}>{keys.length}</span>
            </header>

            <div className={styles.textList}>
              {keys.map((key) => {
                const meta = TEXT_META[key]
                const value = texts[key]
                const isDirty = value !== DEFAULT_TEXTS[key]
                return (
                  <div key={key} className={styles.textField}>
                    <div className={styles.textFieldHead}>
                      <label className={styles.textLabel} htmlFor={`text-${key}`}>
                        {meta.label}
                        {isDirty && <span className={styles.textDirty}>•</span>}
                      </label>
                      <span className={styles.textCounter}>
                        {value.length} / {meta.maxLength}
                      </span>
                    </div>
                    <input
                      id={`text-${key}`}
                      type="text"
                      value={value}
                      maxLength={meta.maxLength}
                      onChange={(e) => update(key, e.target.value)}
                      className={styles.textInput}
                      dir="rtl"
                    />
                    <span className={styles.textDesc}>{meta.desc}</span>
                  </div>
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
        {hasChanges && (
          <>
            <button type="button" className={styles.resetBtn} onClick={handleReset}>
              استرجاع الافتراضي
            </button>
            <span className={styles.hint}>فيه تغييرات غير محفوظة</span>
          </>
        )}
      </div>
    </div>
  )
}
