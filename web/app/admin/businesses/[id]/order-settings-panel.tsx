'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, AlertIcon, SettingsIcon, ClockIcon, CloseIcon } from '@/components/icons'
import { enableOrders, disableOrders } from './order-settings-actions'
import styles from './order-settings-panel.module.css'

type Settings = {
  orders_enabled: boolean
  deadline_minutes: number
  orders_enabled_at: string | null
  suspended_until: string | null
} | null

export default function OrderSettingsPanel({
  businessId,
  settings,
}: {
  businessId: string
  settings: Settings
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showEnable, setShowEnable] = useState(false)
  const [showDisable, setShowDisable] = useState(false)
  const [deadline, setDeadline] = useState(settings?.deadline_minutes ?? 10)

  const isEnabled = !!settings?.orders_enabled

  const doEnable = () => {
    setError(null)
    startTransition(async () => {
      const res = await enableOrders(businessId, deadline)
      if (res.ok) {
        setShowEnable(false)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const doDisable = () => {
    setError(null)
    startTransition(async () => {
      const res = await disableOrders(businessId)
      if (res.ok) {
        setShowDisable(false)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelIcon}>
            <SettingsIcon size={16} />
          </span>
          <div className={styles.panelInfo}>
            <h3 className={styles.panelTitle}>استلام الطلبات</h3>
            <p className={styles.panelSub}>
              {isEnabled ? `مفعّل — الرد خلال ${settings?.deadline_minutes} دقايق` : 'مش مفعّل'}
            </p>
          </div>
          <span className={`${styles.badge} ${isEnabled ? styles.badgeOn : styles.badgeOff}`}>
            {isEnabled ? 'مفعّل' : 'موقوف'}
          </span>
        </div>

        {error && (
          <div className={styles.error}>
            <AlertIcon size={12} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.actions}>
          {isEnabled ? (
            <button
              type="button"
              onClick={() => setShowDisable(true)}
              disabled={pending}
              className={styles.dangerBtn}
            >
              <CloseIcon size={14} />
              <span>إيقاف الاستلام</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowEnable(true)}
              disabled={pending}
              className={styles.primaryBtn}
            >
              <CheckCircleIcon size={14} />
              <span>تفعيل الاستلام</span>
            </button>
          )}
        </div>
      </section>

      {showEnable && (
        <Modal onClose={() => !pending && setShowEnable(false)}>
          <h3 className={styles.modalTitle}>تفعيل استلام الطلبات</h3>
          <p className={styles.modalText}>التاجر هيستقبل إشعار بالالتزامات دي:</p>
          <ul className={styles.modalList}>
            <li>
              <ClockIcon size={13} />
              رد على كل طلب خلال <strong>{deadline} دقايق</strong>
            </li>
            <li>
              <AlertIcon size={13} />
              المتأخر ينقص التقييم (3/يوم = تنبيه، 10/أسبوع = إيقاف 24 ساعة)
            </li>
            <li>
              <CheckCircleIcon size={13} />
              مش متاح → يقفل مؤقتاً (بدون عقوبة)
            </li>
          </ul>
          <label className={styles.deadlineLabel}>
            مدة الرد (دقايق)
            <input
              type="number"
              min={5}
              max={60}
              value={deadline}
              onChange={(e) => setDeadline(Math.max(5, Math.min(60, +e.target.value || 10)))}
              className={styles.deadlineInput}
            />
          </label>
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={doEnable}
              disabled={pending}
              className={styles.primaryBtn}
            >
              {pending ? 'بيتم…' : 'تفعيل'}
            </button>
            <button
              type="button"
              onClick={() => setShowEnable(false)}
              disabled={pending}
              className={styles.cancelBtn}
            >
              إلغاء
            </button>
          </div>
        </Modal>
      )}

      {showDisable && (
        <Modal onClose={() => !pending && setShowDisable(false)}>
          <h3 className={styles.modalTitle}>إيقاف استلام الطلبات</h3>
          <p className={styles.modalText}>
            هيتولّد <strong>تقرير ملخص</strong> لفترة الاستلام + إشعار للتاجر بالنتائج. الاستمرار؟
          </p>
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={doDisable}
              disabled={pending}
              className={styles.dangerBtn}
            >
              {pending ? 'بيتم…' : 'إيقاف + توليد تقرير'}
            </button>
            <button
              type="button"
              onClick={() => setShowDisable(false)}
              disabled={pending}
              className={styles.cancelBtn}
            >
              إلغاء
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
