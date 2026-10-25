'use client'

import { useState } from 'react'
import { StoreIcon, PhoneIcon, HeartIcon, EyeIcon, ShareIcon, MessageCircleIcon } from './icons'
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
  whatsapp: string | null
  phone: string | null
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
  whatsapp,
  phone,
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
  // Keep props stable for future use (contact display, etc.)
  void whatsapp
  void acceptsWhatsapp

  const lock = useSmartLock()
  const [fav, setFav] = useState(isFavorite)
  const [follow, setFollow] = useState(isFollowing)
  const [pending, setPending] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderKey, setOrderKey] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  const requireAuth = (action: string, hint?: string) => {
    if (isLoggedIn) return false
    lock.trigger(action, hint)
    return true
  }

  const trackContact = (method: 'phone' | 'whatsapp') => {
    void fetch('/api/track-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, method }),
    }).catch(() => {})
  }

  // ─── Order Modal (in-app, مرتبط بـ merchant_order_settings) ───
  const handleOrder = () => {
    if (requireAuth('تطلب من النشاط')) return
    if (!ordersEnabled || !isOpen) return
    setOrderKey((k) => k + 1)
    setOrderOpen(true)
  }

  // ─── Phone ───
  const handlePhone = () => {
    if (requireAuth('تتصل بالنشاط مباشرة')) return
    if (!phone) return
    trackContact('phone')
    window.location.href = `tel:${phone}`
  }

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
    if (requireAuth('تكتب تقييم أو تعليق', 'رأيك بيساعد 1000 شخص تاني')) return
    // يوديه على التقييمات
    const el = document.getElementById('reviews-section')
    el?.scrollIntoView({ behavior: 'smooth' })
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
          onClick={handlePhone}
          disabled={!phone}
          className={`${styles.action} ${styles.phone}`}
        >
          <span className={styles.actionIcon}>
            <PhoneIcon size={20} />
          </span>
          <span className={styles.actionLabel}>اتصال</span>
        </button>

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
          <span className={styles.actionLabel}>قيّم</span>
        </button>

        {/* Share — opens modal */}
        <button type="button" onClick={handleShare} className={`${styles.action} ${styles.share}`}>
          <span className={styles.actionIcon}>
            <ShareIcon size={20} />
          </span>
          <span className={styles.actionLabel}>شارك</span>
        </button>
      </div>

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
