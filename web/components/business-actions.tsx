'use client'

import { useState } from 'react'
import {
  StoreIcon,
  PhoneIcon,
  WhatsAppIcon,
  HeartIcon,
  EyeIcon,
  ShareIcon,
  MessageCircleIcon,
} from './icons'
import SmartLockModal, { useSmartLock } from './smart-lock-modal'
import OrderModal from './order-modal'
import BusinessShareModal from './business-share-modal'
import { toggleFollow, toggleFavorite } from '@/app/activities/actions'
import { enqueue } from '@/lib/offline/queue'
import type { ContactOption } from '@/lib/data/business-detail'
import { normalizePhoneDestination, normalizeWhatsAppDestination } from '@/lib/data/contact-availability-utils'
import styles from './business-actions.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Quick Actions (مع القفل الذكي)
// ═══════════════════════════════════════════════════════════

type Props = {
  businessId: string
  businessSlug: string
  businessName: string
  isLoggedIn: boolean
  isOpen: boolean
  contactOptions: ContactOption[]
  ordersEnabled: boolean
  isFavorite?: boolean
  isFollowing?: boolean
  defaultName?: string
  defaultPhone?: string
  menuImages?: string[]
  offers?: { title: string; image: string | null }[]
}

export default function BusinessActions({
  businessId,
  businessSlug,
  businessName,
  isLoggedIn,
  isOpen,
  contactOptions,
  ordersEnabled,
  isFavorite = false,
  isFollowing = false,
  defaultName = '',
  defaultPhone = '',
  menuImages = [],
  offers = [],
}: Props) {
  const lock = useSmartLock()
  const [fav, setFav] = useState(isFavorite)
  const [follow, setFollow] = useState(isFollowing)
  const [pending, setPending] = useState(false)
  const [contactPending, setContactPending] = useState<'phone' | 'whatsapp' | null>(null)
  const [contactMessage, setContactMessage] = useState<string | null>(null)
  const [contactMenuType, setContactMenuType] = useState<'phone' | 'whatsapp' | null>(null)
  const phoneOptions = contactOptions.filter((option) => option.method === 'phone')
  const whatsappOptions = contactOptions.filter((option) => option.method === 'whatsapp')
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderKey, setOrderKey] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  const requireAuth = (action: string, hint?: string) => {
    if (isLoggedIn) return false
    lock.trigger(action, hint)
    return true
  }

  const handleContact = async (method: 'phone' | 'whatsapp', option?: ContactOption) => {
    if (requireAuth(method === 'phone' ? 'تتصل بالنشاط مباشرة' : 'تتواصل على واتساب')) return
    if (contactPending) return
    setContactMessage(null)
    setContactPending(method)
    try {
      const response = await fetch('/api/track-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          method,
          ...(option?.contactId ? { contactId: option.contactId } : {}),
          ...(option?.branchId ? { branchId: option.branchId } : {}),
        }),
      })
      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; value?: string; error?: string }
        | null
      if (!response.ok || typeof result?.value !== 'string' || !result.value.trim()) {
        setContactMessage('بيانات التواصل مش متاحة حالياً.')
        return
      }
      if (method === 'phone') {
        const safePhone = normalizePhoneDestination(result.value)
        if (!safePhone) {
          setContactMessage('رقم التواصل غير صحيح.')
          return
        }
        window.location.href = `tel:${safePhone}`
        return
      }
      const normalized = normalizeWhatsAppDestination(result.value)
      if (!normalized) {
        setContactMessage('رقم واتساب غير صحيح.')
        return
      }
      window.location.href = `https://wa.me/${normalized}`
    } catch {
      setContactMessage('تعذر جلب بيانات التواصل. جرّب تاني.')
    } finally {
      setContactPending(null)
    }
  }

  const handleContactButton = (method: 'phone' | 'whatsapp') => {
    if (requireAuth(method === 'phone' ? 'تتصل بالنشاط مباشرة' : 'تتواصل على واتساب')) return
    const options = method === 'phone' ? phoneOptions : whatsappOptions
    if (options.length === 0) {
      setContactMessage('مفيش رقم صالح متاح بالطريقة دي حالياً.')
      return
    }
    if (options.length > 1) {
      setContactMessage(null)
      setContactMenuType((current) => (current === method ? null : method))
      return
    }
    setContactMenuType(null)
    void handleContact(method, options[0])
  }

  // ─── Order Modal (in-app, مرتبط بـ merchant_order_settings) ───
  const handleOrder = () => {
    if (requireAuth('تطلب من النشاط')) return
    if (!ordersEnabled || !isOpen) return
    setOrderKey((k) => k + 1)
    setOrderOpen(true)
  }

  // بيانات الاتصال بتتجاب من الخادم بعد ضغطة المستخدم وتحقق الصلاحيات.

  // ─── Favorite ───
  const handleFavorite = async () => {
    if (requireAuth('تحفظ النشاط في مفضلاتك', 'هتلاقيه في /account/favorites دايمًا')) return
    if (pending) return
    setPending(true)

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const next = !fav
      setFav(next)
      await enqueue({
        type: 'favorite',
        payload: { businessId, action: next ? 'add' : 'remove' },
      })
      setPending(false)
      return
    }

    const res = await toggleFavorite(businessId, businessSlug)
    setPending(false)
    if (res.ok) setFav(res.active)
  }

  // ─── Follow ───
  const handleFollow = async () => {
    if (requireAuth('تتابع النشاط', 'أول ما ينزل عرض جديد هيوصلك إشعار فوري')) return
    if (pending) return
    setPending(true)

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const next = !follow
      setFollow(next)
      await enqueue({
        type: 'follow',
        payload: { businessId, action: next ? 'add' : 'remove' },
      })
      setPending(false)
      return
    }

    const res = await toggleFollow(businessId, businessSlug)
    setPending(false)
    if (res.ok) setFollow(res.active)
  }

  // ─── Comment ───
  const handleComment = () => {
    if (requireAuth('تكتب تقييم أو تعليق', 'رأيك بيساعد الناس تختار بشكل أفضل')) return

    // Activate the available tab before scrolling to it. Reviews may be disabled,
    // so fall back to comments instead of leaving the user on the information tab.
    const target =
      document.getElementById('reviews-section') ??
      document.getElementById('comments-section')

    if (!target) return
    target.click()
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // ─── Share (opens modal — all platforms + QR) ───
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
      setShareOpen(true)
    }
  }

  return (
    <>
      <div className={styles.actions}>
        {/* Order (in-app) — only if available */}
        {ordersEnabled && isOpen && (
          <button
            type="button"
            onClick={handleOrder}
            className={`${styles.action} ${styles.order} ${styles.primary}`}
          >
            <span className={styles.actionIcon}>
              <StoreIcon size={22} />
            </span>
            <span className={styles.actionLabel}>اطلب دلوقتي</span>
          </button>
        )}

        {phoneOptions.length > 0 && (
          <button type="button" onClick={() => handleContactButton('phone')} disabled={contactPending !== null} aria-expanded={contactMenuType === 'phone'} className={`${styles.action} ${styles.phone}`}>
            <span className={styles.actionIcon}><PhoneIcon size={20} /></span>
            <span className={styles.actionLabel}>{contactPending === 'phone' ? 'بيفتح…' : phoneOptions.length > 1 ? `أرقام اتصال (${phoneOptions.length})` : 'اتصال'}</span>
          </button>
        )}

        {whatsappOptions.length > 0 && (
          <button type="button" onClick={() => handleContactButton('whatsapp')} disabled={contactPending !== null} aria-expanded={contactMenuType === 'whatsapp'} className={`${styles.action} ${styles.whatsapp} ${!ordersEnabled || !isOpen ? styles.primary : ''}`}>
            <span className={styles.actionIcon}><WhatsAppIcon size={20} /></span>
            <span className={styles.actionLabel}>{contactPending === 'whatsapp' ? 'بيفتح…' : whatsappOptions.length > 1 ? `أرقام واتساب (${whatsappOptions.length})` : 'واتساب'}</span>
          </button>
        )}

        {/* Favorite */}
        <button
          type="button"
          onClick={handleFavorite}
          className={`${styles.action} ${styles.fav} ${fav ? styles.active : ''}`}
        >
          <span className={styles.actionIcon}>
            <HeartIcon size={20} />
          </span>
          <span className={styles.actionLabel}>{fav ? 'محفوظ' : 'احفظ'}</span>
        </button>

        {/* Follow */}
        <button
          type="button"
          onClick={handleFollow}
          className={`${styles.action} ${styles.follow} ${follow ? styles.active : ''}`}
        >
          <span className={styles.actionIcon}>
            <EyeIcon size={20} />
          </span>
          <span className={styles.actionLabel}>{follow ? 'بتتابعه' : 'تابع'}</span>
        </button>

        {/* Comment */}
        <button
          type="button"
          onClick={handleComment}
          className={`${styles.action} ${styles.comment}`}
        >
          <span className={styles.actionIcon}>
            <MessageCircleIcon size={20} />
          </span>
          <span className={styles.actionLabel}>رأيك</span>
        </button>

        {/* Share — opens modal */}
        <button type="button" onClick={handleShare} className={`${styles.action} ${styles.share}`}>
          <span className={styles.actionIcon}>
            <ShareIcon size={20} />
          </span>
          <span className={styles.actionLabel}>شارك</span>
        </button>
      </div>
      {contactMenuType && (
        <div className={styles.contactChoices} role="group" aria-label={contactMenuType === 'phone' ? 'اختيار رقم الاتصال' : 'اختيار رقم واتساب'}>
          {(contactMenuType === 'phone' ? phoneOptions : whatsappOptions).map((option) => (
            <button key={option.contactId ?? option.branchId ?? option.label} type="button" className={styles.contactChoice} onClick={() => {
              setContactMenuType(null)
              void handleContact(contactMenuType, option)
            }}>
              {option.isPrimary ? 'الرئيسي — ' : ''}{option.label}
            </button>
          ))}
          <button type="button" className={styles.contactChoiceClose} onClick={() => setContactMenuType(null)}>إغلاق الاختيار</button>
        </div>
      )}
      {contactMessage && (
        <p role="status" className={styles.contactMessage}>
          {contactMessage}
        </p>
      )}

      <SmartLockModal open={lock.open} onClose={lock.close} action={lock.action} hint={lock.hint} />

      <BusinessShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={businessName}
      />

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
    </>
  )
}
