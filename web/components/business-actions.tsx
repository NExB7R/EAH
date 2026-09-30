'use client'

import { useState } from 'react'
import {
  WhatsAppIcon,
  PhoneIcon,
  HeartIcon,
  EyeIcon,
  ShareIcon,
  MessageCircleIcon,
  CheckCircleIcon,
} from './icons'
import SmartLockModal, { useSmartLock } from './smart-lock-modal'
import styles from './business-actions.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Quick Actions (مع القفل الذكي)
// ═══════════════════════════════════════════════════════════

type Props = {
  businessName: string
  isLoggedIn: boolean
  whatsapp: string | null
  phone: string | null
  isOpen: boolean
  acceptsWhatsapp: boolean
  isFavorite?: boolean
  isFollowing?: boolean
}

export default function BusinessActions({
  businessName,
  isLoggedIn,
  whatsapp,
  phone,
  isOpen,
  acceptsWhatsapp,
  isFavorite = false,
  isFollowing = false,
}: Props) {
  const lock = useSmartLock()
  const [fav, setFav] = useState(isFavorite)
  const [follow, setFollow] = useState(isFollowing)
  const [copied, setCopied] = useState(false)

  const requireAuth = (action: string, hint?: string) => {
    if (isLoggedIn) return false
    lock.trigger(action, hint)
    return true
  }

  // ─── WhatsApp ───
  const handleWhatsapp = () => {
    if (requireAuth('تطلب من واتساب مباشرة')) return
    if (!whatsapp || !acceptsWhatsapp) return
    const url = `https://wa.me/2${whatsapp.replace(/^0/, '').replace(/^20/, '')}?text=${encodeURIComponent(`السلام عليكم، شفت ${businessName} على EAH وعايز أطلب`)}`
    window.open(url, '_blank')
  }

  // ─── Phone ───
  const handlePhone = () => {
    if (requireAuth('تتصل بالنشاط مباشرة')) return
    if (!phone) return
    window.location.href = `tel:${phone}`
  }

  // ─── Favorite ───
  const handleFavorite = () => {
    if (requireAuth('تحفظ النشاط في مفضلاتك', 'هتلاقيه في /account/favorites دايمًا')) return
    setFav((v) => !v)
  }

  // ─── Follow ───
  const handleFollow = () => {
    if (requireAuth('تتابع النشاط', 'أول ما ينزل عرض جديد هيوصلك إشعار فوري')) return
    setFollow((v) => !v)
  }

  // ─── Comment ───
  const handleComment = () => {
    if (requireAuth('تكتب تقييم أو تعليق', 'رأيك بيساعد 1000 شخص تاني')) return
    // يوديه على التقييمات
    const el = document.getElementById('reviews-section')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  // ─── Share (مفتوح للكل) ───
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: businessName, url })
        return
      } catch {
        // close
      }
    }
    // fallback: copy
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <>
      <div className={styles.actions}>
        {/* WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsapp}
          disabled={!whatsapp || !acceptsWhatsapp}
          className={`${styles.action} ${styles.whatsapp}`}
        >
          <span className={styles.actionIcon}>
            <WhatsAppIcon size={20} />
          </span>
          <span className={styles.actionLabel}>
            {whatsapp && acceptsWhatsapp
              ? isOpen
                ? 'اطلب على واتساب'
                : 'واتساب — مغلق حالياً'
              : 'واتساب — غير متاح'}
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

        {/* Share — مفتوح للكل */}
        <button
          type="button"
          onClick={handleShare}
          className={`${styles.action} ${styles.share}`}
        >
          <span className={styles.actionIcon}>
            {copied ? <CheckCircleIcon size={20} /> : <ShareIcon size={20} />}
          </span>
          <span className={styles.actionLabel}>{copied ? 'اتنسخ' : 'شارك'}</span>
        </button>
      </div>

      <SmartLockModal
        open={lock.open}
        onClose={lock.close}
        action={lock.action}
        hint={lock.hint}
      />
    </>
  )
}
