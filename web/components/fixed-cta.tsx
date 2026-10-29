'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WhatsAppIcon, LockIcon, StoreIcon } from './icons'
import SmartLockModal, { useSmartLock } from './smart-lock-modal'
import OrderModal from './order-modal'
import styles from './fixed-cta.module.css'
import type { ContactOption } from '@/lib/data/business-detail'
import { normalizeWhatsAppDestination } from '@/lib/data/contact-availability-utils'

type Props = {
  businessId: string
  businessSlug: string
  businessName: string
  contactOptions: ContactOption[]
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
  contactOptions,
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
  const [showWhatsappChoices, setShowWhatsappChoices] = useState(false)
  const whatsappOptions = contactOptions.filter((option) => option.method === 'whatsapp')

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

  if (!ordersEnabled && whatsappOptions.length === 0) return null

  const handleClick = (option?: ContactOption) => {
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

    if (!option && whatsappOptions.length > 1) {
      setShowWhatsappChoices((current) => !current)
      return
    }
    if (contactPending) return
    setShowWhatsappChoices(false)
    setContactPending(true)
    void fetch('/api/track-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId,
        method: 'whatsapp',
        ...(option?.contactId ? { contactId: option.contactId } : {}),
        ...(option?.branchId ? { branchId: option.branchId } : {}),
      }),
    })
      .then(async (response) => {
        const result = (await response.json().catch(() => null)) as
          | { value?: string }
          | null
        if (!response.ok || typeof result?.value !== 'string' || !result.value.trim()) {
          setMessage('بيانات التواصل مش متاحة حالياً.')
          return
        }

        const normalized = normalizeWhatsAppDestination(result.value)
        if (!normalized) {
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
    : whatsappOptions.length > 1 ? 'اختار رقم واتساب' : 'تواصل واتساب'

  return (
    <>
      <div className={styles.bar}>
        <button
          type="button"
          onClick={() => void handleClick(whatsappOptions.length === 1 && !ordersEnabled ? whatsappOptions[0] : undefined)}
          disabled={contactPending}
          aria-expanded={!ordersEnabled && whatsappOptions.length > 1 ? showWhatsappChoices : undefined}
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
        {!ordersEnabled && showWhatsappChoices && (
          <div className={styles.contactChoices} role="group" aria-label="اختيار رقم واتساب">
            {whatsappOptions.map((option) => (
              <button
                key={option.contactId ?? option.branchId ?? option.label}
                type="button"
                className={styles.contactChoice}
                onClick={() => void handleClick(option)}
              >
                {option.isPrimary ? 'الرئيسي — ' : ''}{option.label}
              </button>
            ))}
          </div>
        )}
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
