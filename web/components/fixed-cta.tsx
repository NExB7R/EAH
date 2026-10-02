'use client'

import { useState } from 'react'
import { WhatsAppIcon, PhoneIcon, LockIcon } from './icons'
import SmartLockModal, { useSmartLock } from './smart-lock-modal'
import OrderModal from './order-modal'
import styles from './fixed-cta.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Fixed CTA (Mobile only)
// يفتح OrderModal للواتساب، أو اتصال مباشر
// ═══════════════════════════════════════════════════════════

type Props = {
  businessId: string
  businessSlug: string
  businessName: string
  whatsapp: string | null
  phone: string | null
  isLoggedIn: boolean
  isOpen: boolean
  defaultName?: string
  defaultPhone?: string
}

export default function FixedCta({
  businessId,
  businessSlug,
  businessName,
  whatsapp,
  phone,
  isLoggedIn,
  isOpen,
  defaultName = '',
  defaultPhone = '',
}: Props) {
  const lock = useSmartLock()
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderKey, setOrderKey] = useState(0)

  if (!whatsapp && !phone) return null

  const handleClick = () => {
    if (!isLoggedIn) {
      lock.trigger('تتواصل مع ' + businessName, 'سجّل بسرعة وهيوصلك كل جديد')
      return
    }

    if (whatsapp) {
      setOrderKey((k) => k + 1)
      setOrderOpen(true)
    } else if (phone) {
      window.location.href = `tel:${phone}`
    }
  }

  const label = whatsapp ? (isOpen ? 'اطلب على واتساب' : 'واتساب — مغلق حالياً') : 'اتصل بالنشاط'

  return (
    <>
      <div className={styles.bar}>
        <button
          type="button"
          onClick={handleClick}
          className={`${styles.btn} ${whatsapp ? styles.whatsapp : styles.phone}`}
        >
          {isLoggedIn ? (
            whatsapp ? (
              <WhatsAppIcon size={20} />
            ) : (
              <PhoneIcon size={20} />
            )
          ) : (
            <LockIcon size={18} />
          )}
          <span>{label}</span>
        </button>
      </div>

      <SmartLockModal open={lock.open} onClose={lock.close} action={lock.action} hint={lock.hint} />

      <OrderModal
        key={orderKey}
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        businessId={businessId}
        businessSlug={businessSlug}
        businessName={businessName}
        defaultName={defaultName}
        defaultPhone={defaultPhone}
      />
    </>
  )
}
