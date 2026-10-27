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
  acceptsWhatsapp: boolean
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
  acceptsWhatsapp,
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
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderKey, setOrderKey] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  const requireAuth = (action: string, hint?: string) => {
    if (isLoggedIn) return false
    lock.trigger(action, hint)
    return true
  }

  const handleContact = async (method: 'phone' | 'whatsapp') => {
    if (requireAuth(method === 'phone' ? 'تتصل بالنشاط مباشرة' : 'تتواصل على واتساب')) return
    if (contactPending) return

    setContactMessage(null)
    setContactPending(method)
    try {
      const response = await fetch('/api/track-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, method }),
      })
      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; value?: string; error?: string }
        | null

      if (!response.ok || typeof result?.value !== 'string' || !result.value.trim()) {
        setContactMessage('بيانات التواصل مش متاحة حالياً.')
        return
      }

      if (method === 'phone') {
        const safePhone = result.value.replace(/[^0-9+]/g, '')
        if (!/^\+?\d{8,15}$/.test(safePhone)) {
          setContactMessage('رقم التواصل غير صحيح.')
          return
        }
        window.location.href = `tel:${safePhone}`
        return
      }

      const digits = result.value.replace(/\D/g, '')
      const normalized = digits.startsWith('20')
        ? digits
        : digits.startsWith('0')
          ? `20${digits.slice(1)}`
          : `20${digits}`
      if (normalized.length < 11 || normalized.length > 15) {
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
      <div className={`${styles.actions} ${!acceptsWhatsapp ? styles.actionsWithoutWhatsapp : ''}`}>
        {/* Order (in-app) */}
        <button
          type="button"
          onClick={handleOrder}
          disabled={!ordersEnabled || !isOpen}
          className={`${styles.action} ${styles.order}`}
        >
          <span className={styles.actionIcon}>
            <StoreIcon size={20} />
          </span>
          <span className={styles.actionLabel}>
            {!ordersEnabled ? 'الطلب غير متاح' : isOpen ? 'اطلب دلوقتي' : 'اطلب — مغلق حالياً'}
          </span>
        </button>

        {/* Phone */}
        <button
          type="button"
          onClick={() => void handleContact('phone')}
          disabled={contactPending !== null}
          className={`${styles.action} ${styles.phone}`}
        >
          <span className={styles.actionIcon}>
            <PhoneIcon size={20} />
          </span>
          <span className={styles.actionLabel}>
            {contactPending === 'phone' ? 'بيفتح…' : 'اتصال'}
          </span>
        </button>

        {acceptsWhatsapp && (
          <button
            type="button"
            onClick={() => void handleContact('whatsapp')}
            disabled={contactPending !== null}
            className={`${styles.action} ${styles.whatsapp}`}
          >
            <span className={styles.actionIcon}><WhatsAppIcon size={20} /></span>
            <span className={styles.actionLabel}>
              {contactPending === 'whatsapp' ? 'بيفتح…' : 'واتساب'}
            </span>
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
