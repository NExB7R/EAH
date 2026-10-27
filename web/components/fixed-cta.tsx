'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WhatsAppIcon, LockIcon, StoreIcon } from './icons'
import SmartLockModal, { useSmartLock } from './smart-lock-modal'
import OrderModal from './order-modal'
import styles from './fixed-cta.module.css'

type Props = {
  businessId: string
  businessSlug: string
  businessName: string
  acceptsWhatsapp: boolean
  isLoggedIn: boolean
  isOpen: boolean
  ordersEnabled: boolean
  defaultName?: string
  defaultPhone?: string
  menuImages?: string[]
  offers?: { title: string; image: string | null }[]
  isOwner?: boolean
}

export default function FixedCta({
  businessId,
  businessSlug,
  businessName,
  acceptsWhatsapp,
  isLoggedIn,
  isOpen,
  ordersEnabled,
  defaultName = '',
  defaultPhone = '',
  menuImages = [],
  offers = [],
  isOwner = false,
}: Props) {
  const lock = useSmartLock()
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderKey, setOrderKey] = useState(0)
  const [contactPending, setContactPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (isOwner) {
    return (
      <div className={styles.bar}>
        <Link href="/merchant/business" className={styles.ownerCta}>
          <StoreIcon size={18} />
          <span>إدارة النشاط</span>
        </Link>
      </div>
    )
  }

  if (!ordersEnabled && !acceptsWhatsapp) return null

  const handleClick = () => {
    if (!isLoggedIn) {
      lock.trigger(
        ordersEnabled ? 'تطلب من النشاط' : 'تتواصل على واتساب',
        ordersEnabled ? 'سجّل دخولك عشان تتابع طلبك' : 'سجّل دخولك عشان تكشف بيانات التواصل',
      )
      return
    }

    setMessage(null)
    if (ordersEnabled) {
      if (!isOpen) {
        setMessage('النشاط مغلق حالياً.')
        return
      }
      setOrderKey((key) => key + 1)
      setOrderOpen(true)
      return
    }

    if (contactPending) return
    setContactPending(true)
    void fetch('/api/track-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, method: 'whatsapp' }),
    })
      .then(async (response) => {
        const result = (await response.json().catch(() => null)) as
          | { value?: string }
          | null
        if (!response.ok || typeof result?.value !== 'string' || !result.value.trim()) {
          setMessage('بيانات التواصل مش متاحة حالياً.')
          return
        }

        const digits = result.value.replace(/\D/g, '')
        const normalized = digits.startsWith('20')
          ? digits
          : digits.startsWith('0')
            ? `20${digits.slice(1)}`
            : `20${digits}`
        if (normalized.length < 11 || normalized.length > 15) {
          setMessage('رقم واتساب غير صحيح.')
          return
        }
        window.location.href = `https://wa.me/${normalized}`
      })
      .catch(() => setMessage('تعذر جلب بيانات التواصل. جرّب تاني.'))
      .finally(() => setContactPending(false))
  }

  const label = ordersEnabled
    ? isOpen
      ? 'اطلب دلوقتي'
      : 'الطلب غير متاح حالياً'
    : 'تواصل واتساب'

  return (
    <>
      <div className={styles.bar}>
        <button
          type="button"
          onClick={handleClick}
          disabled={contactPending}
          className={`${styles.btn} ${ordersEnabled ? styles.order : styles.whatsapp}`}
        >
          {!isLoggedIn ? (
            <LockIcon size={18} />
          ) : ordersEnabled ? (
            <StoreIcon size={20} />
          ) : (
            <WhatsAppIcon size={20} />
          )}
          <span>{contactPending ? 'جاري التحقق…' : label}</span>
        </button>
        {message && <p role="status" className={styles.message}>{message}</p>}
      </div>

      <SmartLockModal open={lock.open} onClose={lock.close} action={lock.action} hint={lock.hint} />

      {ordersEnabled && (
        <OrderModal
          key={orderKey}
          open={orderOpen}
          onClose={() => setOrderOpen(false)}
          businessId={businessId}
          businessSlug={businessSlug}
          businessName={businessName}
          defaultName={defaultName}
          defaultPhone={defaultPhone}
          menuImages={menuImages}
          offers={offers}
        />
      )}
    </>
  )
}
