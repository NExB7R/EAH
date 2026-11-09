'use client'

import { useState, useTransition } from 'react'
import styles from './health-checks.module.css'
import type { HealthChecksResult, CheckStatus } from '@/lib/data/health-checks'

const STATUS_ICON: Record<CheckStatus, string> = {
  ok: '✅',
  warning: '⚠️',
  error: '❌',
}

const STATUS_LABEL: Record<CheckStatus, string> = {
  ok: 'سليم',
  warning: 'تحذير',
  error: 'خطأ',
}

export default function HealthChecks({ initialResult }: { initialResult: HealthChecksResult | null }) {
  const [result, setResult] = useState<HealthChecksResult | null>(initialResult)
  const [isPending, startTransition] = useTransition()

  const runChecks = () => {
    startTransition(async () => {
      const res = await fetch('/api/admin/health-checks', { cache: 'no-store' })
      if (res.ok) {
        const data = (await res.json()) as HealthChecksResult
        setResult(data)
      }
    })
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>🩺 فحوصات النظام</h2>
          <p className={styles.subtitle}>
            تشغيل سريع للتأكد من سلامة قاعدة البيانات والـ triggers والبيانات
          </p>
        </div>
        <button
          type="button"
          onClick={runChecks}
          disabled={isPending}
          className={styles.runBtn}
        >
          {isPending ? 'جاري الفحص...' : result ? '🔄 إعادة الفحص' : '▶ تشغيل الفحوصات'}
        </button>
      </div>

      {result && (
        <>
          {/* Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{result.totalChecks}</span>
              <span className={styles.summaryLabel}>إجمالي</span>
            </div>
            <div className={`${styles.summaryItem} ${styles.summaryOk}`}>
              <span className={styles.summaryValue}>{result.okCount}</span>
              <span className={styles.summaryLabel}>سليم</span>
            </div>
            <div className={`${styles.summaryItem} ${styles.summaryWarn}`}>
              <span className={styles.summaryValue}>{result.warnCount}</span>
              <span className={styles.summaryLabel}>تحذير</span>
            </div>
            <div className={`${styles.summaryItem} ${styles.summaryErr}`}>
              <span className={styles.summaryValue}>{result.errCount}</span>
              <span className={styles.summaryLabel}>خطأ</span>
            </div>
          </div>

          {/* Checks list */}
          <ul className={styles.list}>
            {result.checks.map((check) => (
              <li
                key={check.id}
                className={`${styles.item} ${styles[`item-${check.status}`]}`}
              >
                <span className={styles.icon}>{STATUS_ICON[check.status]}</span>
                <div className={styles.body}>
                  <div className={styles.row}>
                    <span className={styles.label}>{check.label}</span>
                    <span className={`${styles.badge} ${styles[`badge-${check.status}`]}`}>
                      {STATUS_LABEL[check.status]}
                    </span>
                  </div>
                  <p className={styles.message}>{check.message}</p>
                  {check.details && <p className={styles.details}>{check.details}</p>}
                </div>
              </li>
            ))}
          </ul>

          <p className={styles.timestamp}>
            آخر فحص: {new Date(result.timestamp).toLocaleString('ar-EG')}
          </p>
        </>
      )}
    </section>
  )
}
