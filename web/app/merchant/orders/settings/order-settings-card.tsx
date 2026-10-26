'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertIcon,
  CheckCircleIcon,
  ClockIcon,
  CrownGoldIcon,
  SettingsIcon,
} from '@/components/icons'
import { setOfflineMode, setDeliveryEta, setOrdersEnabled } from './actions'
import styles from './settings.module.css'

type Status = 'active' | 'suspended' | 'offline' | 'disabled'

type Props = {
  settings: {
    orders_enabled: boolean
    deadline_minutes: number
    delivery_eta_minutes: number | null
    offline_mode: boolean
    offline_until: string | null
    suspended_until: string | null
    suspension_reason: string | null
  }
  status: Status
}

const OFFLINE_OPTIONS = [
  { minutes: 60, label: 'ساعة' },
  { minutes: 60 * 4, label: '4 ساعات' },
  { minutes: 60 * 24, label: 'يوم' },
]

export default function OrderSettingsCard({ settings, status }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showOfflineModal, setShowOfflineModal] = useState(false)
  const [offlineMinutes, setOfflineMinutes] = useState(60)
  const [eta, setEta] = useState(settings.delivery_eta_minutes ?? 45)
  const [etaSaving, setEtaSaving] = useState(false)

  const meta = {
    active: { label: 'مفعّل', tone: 'ok' as const, Icon: CheckCircleIcon },
    suspended: { label: 'موقوف مؤقتاً', tone: 'warn' as const, Icon: AlertIcon },
    offline: { label: 'مش متاح', tone: 'muted' as const, Icon: ClockIcon },
    disabled: { label: 'مش مفعّل', tone: 'warn' as const, Icon: SettingsIcon },
  }[status]

  const StatusIcon = meta.Icon

  const handleOffline = (nextOffline: boolean) => {
    setError(null)
    startTransition(async () => {
      const until = nextOffline
        ? new Date(Date.now() + offlineMinutes * 60 * 1000).toISOString()
        : undefined
      const res = await setOfflineMode(nextOffline, until)
      if (res.ok) {
        setShowOfflineModal(false)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const handleEnable = () => {
    setError(null)
    startTransition(async () => {
      const res = await setOrdersEnabled(true, eta)
      if (res.ok) {
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <section className={styles.card}>
      <header className={styles.cardHead}>
        <h2 className={styles.cardTitle}>حالة استلام الطلبات</h2>
        <span className={`${styles.statusBadge} ${styles[`status_${meta.tone}`]}`}>
          <StatusIcon size={12} />
          {meta.label}
        </span>
      </header>

      {status === 'disabled' && (
        <>
          <div className={styles.notice}>
            <AlertIcon size={16} />
            <div>
              <strong>استلام الطلبات مش مفعّل</strong>
              <p>فعّله دلوقتي عشان تبدأ تستقبل طلبات من العملاء. حدد مدة التسليم وابدأ.</p>
            </div>
          </div>

          <div className={styles.etaEditor}>
            <label className={styles.etaLabel}>
              <ClockIcon size={14} />
              <span>مدة التسليم</span>
              <input
                type="number"
                min={15}
                max={240}
                step={5}
                value={eta}
                onChange={(e) => setEta(Math.max(15, Math.min(240, +e.target.value || 45)))}
                disabled={pending}
                className={styles.etaInput}
              />
              <span>دقيقة</span>
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleEnable}
              disabled={pending}
              className={styles.primaryBtn}
            >
              <CheckCircleIcon size={14} />
              <span>{pending ? 'بيتم…' : 'افتح الاستلام'}</span>
            </button>
          </div>

          <ul className={styles.obligationsList} style={{ marginTop: 12 }}>
            <li>
              <ClockIcon size={13} />
              <span>رد على كل طلب خلال {settings.deadline_minutes || 10} دقايق</span>
            </li>
            <li>
              <AlertIcon size={13} />
              <span>المتأخر ينقص تقييمك — اقفل مؤقتاً لو مش متاح (بدون عقوبة)</span>
            </li>
          </ul>
        </>
      )}

      {status === 'suspended' && (
        <div className={styles.noticeWarn}>
          <AlertIcon size={16} />
          <div>
            <strong>الاستلام موقوف مؤقتاً</strong>
            <p>{settings.suspension_reason ?? 'بسبب ردود متأخرة'}</p>
            {settings.suspended_until && (
              <p className={styles.noticeHint}>
                هيرجع تلقائياً: {new Date(settings.suspended_until).toLocaleString('ar-EG')}
              </p>
            )}
          </div>
        </div>
      )}

      {settings.orders_enabled && (
        <div className={styles.obligations}>
          <h3 className={styles.obligationsTitle}>التزاماتك</h3>
          <ul className={styles.obligationsList}>
            <li>
              <ClockIcon size={13} />
              <span>رد على كل طلب خلال {settings.deadline_minutes} دقايق</span>
            </li>
            <li>
              <ClockIcon size={13} />
              <span>
                التسليم خلال <strong>{settings.delivery_eta_minutes ?? '—'} دقيقة</strong> من وقت
                الطلب
              </span>
            </li>
            <li>
              <AlertIcon size={13} />
              <span>الرد المتأخر ينقص تقييمك (3/يوم = تنبيه، 10/أسبوع = إيقاف 24 ساعة)</span>
            </li>
            <li>
              <CrownGoldIcon size={13} />
              <span>مش متاح؟ اقفل الاستلام مؤقتاً — بدون عقوبة</span>
            </li>
          </ul>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <AlertIcon size={12} />
          <span>{error}</span>
        </div>
      )}

      {settings.orders_enabled && (
        <div className={styles.etaEditor}>
          <label className={styles.etaLabel}>
            <ClockIcon size={14} />
            <span>مدة التسليم</span>
            <input
              type="number"
              min={15}
              max={240}
              step={5}
              value={eta}
              onChange={(e) => setEta(Math.max(15, Math.min(240, +e.target.value || 45)))}
              disabled={pending || etaSaving}
              className={styles.etaInput}
            />
            <span>دقيقة</span>
            <button
              type="button"
              onClick={() => {
                setEtaSaving(true)
                startTransition(async () => {
                  const res = await setDeliveryEta(eta)
                  setEtaSaving(false)
                  if (!res.ok) setError(res.error)
                  else router.refresh()
                })
              }}
              disabled={pending || etaSaving || eta === settings.delivery_eta_minutes}
              className={styles.etaSaveBtn}
            >
              {etaSaving ? '…' : 'حفظ'}
            </button>
          </label>
        </div>
      )}

      {settings.orders_enabled && status !== 'suspended' && (
        <div className={styles.actions}>
          {status === 'active' ? (
            <button
              type="button"
              onClick={() => setShowOfflineModal(true)}
              disabled={pending}
              className={styles.secondaryBtn}
            >
              <ClockIcon size={14} />
              <span>اقفل مؤقتاً</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOffline(false)}
              disabled={pending}
              className={styles.primaryBtn}
            >
              <SettingsIcon size={14} />
              <span>{pending ? 'بيتم…' : 'افتح الاستلام'}</span>
            </button>
          )}
        </div>
      )}

      {status === 'offline' && settings.offline_until && (
        <p className={styles.offlineHint}>
          هيرجع تلقائياً: {new Date(settings.offline_until).toLocaleString('ar-EG')}
        </p>
      )}

      {showOfflineModal && (
        <div className={styles.backdrop} onClick={() => !pending && setShowOfflineModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>اقفل الاستلام لمدة…</h3>
            <p className={styles.modalText}>
              هيتوقف استلام الطلبات الجديدة. بيرجع تلقائياً بعد المدة. مفيش عقوبة.
            </p>
            <div className={styles.offlineOptions}>
              {OFFLINE_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => setOfflineMinutes(opt.minutes)}
                  disabled={pending}
                  className={`${styles.offlineOption} ${offlineMinutes === opt.minutes ? styles.offlineOptionActive : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => handleOffline(true)}
                disabled={pending}
                className={styles.secondaryBtn}
              >
                {pending ? 'بيتم…' : 'تأكيد القفل'}
              </button>
              <button
                type="button"
                onClick={() => setShowOfflineModal(false)}
                disabled={pending}
                className={styles.cancelBtn}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
