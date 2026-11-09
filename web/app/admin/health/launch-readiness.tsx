'use client'

import { useState, useTransition } from 'react'
import styles from './launch-readiness.module.css'
import type { ReadinessResult } from '@/lib/data/launch-readiness'

const STATUS_ICON: Record<string, string> = {
  ready: '✅',
  warning: '⚠️',
  blocker: '❌',
}

export default function LaunchReadiness({ initialResult }: { initialResult: ReadinessResult | null }) {
  const [result, setResult] = useState<ReadinessResult | null>(initialResult)
  const [isPending, startTransition] = useTransition()

  const compute = () => {
    startTransition(async () => {
      const res = await fetch('/api/admin/launch-readiness', { cache: 'no-store' })
      if (res.ok) {
        setResult((await res.json()) as ReadinessResult)
      }
    })
  }

  const getGrade = (pct: number): { label: string; color: string } => {
    if (pct >= 90) return { label: 'جاهز للإطلاق 🚀', color: '#55e7d1' }
    if (pct >= 75) return { label: 'قريب جدًا', color: '#a3f5dc' }
    if (pct >= 50) return { label: 'شغل كتير متبقي', color: '#facc15' }
    return { label: 'محتاج شغل كبير', color: '#ef4444' }
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>🚀 جاهزية الإطلاق</h2>
          <p className={styles.subtitle}>
            نسبة جاهزية المنصة للإطلاق (مرجحة حسب أهمية كل فحص)
          </p>
        </div>
        <button
          type="button"
          onClick={compute}
          disabled={isPending}
          className={styles.runBtn}
        >
          {isPending ? 'جاري الحساب...' : result ? '🔄 إعادة الحساب' : '▶ احسب الجاهزية'}
        </button>
      </div>

      {result && (
        <>
          {/* Overall gauge */}
          <div className={styles.gaugeWrap}>
            <div className={styles.gauge}>
              <svg viewBox="0 0 200 200" className={styles.gaugeSvg}>
                <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
                <circle
                  cx="100" cy="100" r="88" fill="none"
                  stroke={getGrade(result.overallPercent).color}
                  strokeWidth="16"
                  strokeDasharray={`${(result.overallPercent / 100) * 552.92} 552.92`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className={styles.gaugeText}>
                <div className={styles.gaugePercent} style={{ color: getGrade(result.overallPercent).color }}>
                  {result.overallPercent}%
                </div>
                <div className={styles.gaugeLabel}>{getGrade(result.overallPercent).label}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={`${styles.stat} ${styles.statReady}`}>
              <span className={styles.statValue}>{result.readyCount}</span>
              <span className={styles.statLabel}>جاهز</span>
            </div>
            <div className={`${styles.stat} ${styles.statWarn}`}>
              <span className={styles.statValue}>{result.warnCount}</span>
              <span className={styles.statLabel}>تحذير</span>
            </div>
            <div className={`${styles.stat} ${styles.statBlocker}`}>
              <span className={styles.statValue}>{result.blockerCount}</span>
              <span className={styles.statLabel}>مانع</span>
            </div>
          </div>

          {/* Items by category */}
          {result.categories.map((cat) => {
            const catItems = result.items.filter((i) => i.category === cat)
            return (
              <div key={cat} className={styles.categoryBlock}>
                <h3 className={styles.categoryTitle}>{cat}</h3>
                <ul className={styles.list}>
                  {catItems.map((item) => (
                    <li key={item.id} className={`${styles.item} ${styles[`item-${item.status}`]}`}>
                      <span className={styles.icon}>{STATUS_ICON[item.status]}</span>
                      <div className={styles.itemBody}>
                        <div className={styles.itemLabel}>{item.label}</div>
                        <div className={styles.itemDetail}>{item.detail}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          <p className={styles.timestamp}>
            آخر حساب: {new Date(result.timestamp).toLocaleString('ar-EG')}
          </p>
        </>
      )}
    </section>
  )
}
