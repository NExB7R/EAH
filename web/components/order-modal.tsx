'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { CloseIcon, GiftIcon, CheckCircleIcon, AlertIcon, ImageIcon } from './icons'
import MenuSlider from './menu-slider'
import { submitOrder } from '@/app/businesses/[slug]/order-actions'
import { addPendingReview } from '@/lib/engagement'
import styles from './order-modal.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Order Modal (Customer)
// يفتح لما العميل يدوس "اطلب" — ينشئ order + يفتح واتساب
// ═══════════════════════════════════════════════════════════

type Props = {
  open: boolean
  onClose: () => void
  businessId: string
  businessSlug: string
  businessName: string
  defaultName?: string
  defaultPhone?: string
  menuImages?: string[]
  offers?: { title: string; image: string | null }[]
}

export default function OrderModal({
  open,
  onClose,
  businessId,
  businessSlug,
  businessName,
  defaultName = '',
  defaultPhone = '',
  menuImages = [],
  offers = [],
}: Props) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await submitOrder(businessId, businessSlug, formData)
      if (res.ok) {
        setSuccess(true)
        setMsg(`طلبك #${res.orderCode} اتحفظ ✓`)
        // افتح واتساب بعد ثانيتين
        // تذكير تقييم بعد ساعتين
        addPendingReview({
          businessId,
          businessSlug,
          businessName,
        })

        setTimeout(() => {
          window.open(res.whatsappUrl, '_blank')
          setTimeout(() => {
            onClose()
            formRef.current?.reset()
          }, 500)
        }, 800)
      } else {
        setMsg(res.error)
      }
    })
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button type="button" onClick={onClose} className={styles.close} aria-label="إغلاق">
          <CloseIcon size={18} />
        </button>

        <div className={styles.glow} aria-hidden />

        {success ? (
          <div className={styles.successBox}>
            <span className={styles.successIcon}>
              <CheckCircleIcon size={36} />
            </span>
            <h2 className={styles.successTitle}>تم!</h2>
            <p className={styles.successText}>{msg}</p>
            <p className={styles.successHint}>
              هيتم فتح واتساب الآن… لو ما فتحش، كلم النشاط من صفحته.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <span className={styles.headerIcon}>
                <GiftIcon size={22} />
              </span>
              <div>
                <h2 className={styles.title}>اطلب من {businessName}</h2>
                <p className={styles.subtitle}>املأ البيانات — هنفتحلك واتساب جاهز</p>
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>اسمك *</label>
                  <input
                    name="customer_name"
                    type="text"
                    required
                    maxLength={60}
                    defaultValue={defaultName}
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>رقمك *</label>
                  <input
                    name="customer_phone"
                    type="tel"
                    required
                    defaultValue={defaultPhone}
                    placeholder="01xxxxxxxxx"
                    className={styles.input}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>منطقتك</label>
                  <input
                    name="customer_area"
                    type="text"
                    maxLength={80}
                    placeholder="مثلاً: شبين القناطر"
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>عنوانك</label>
                  <input
                    name="customer_address"
                    type="text"
                    maxLength={200}
                    placeholder="شارع + رقم عمارة"
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>طلبك *</label>
                <textarea
                  name="items_summary"
                  required
                  maxLength={500}
                  rows={3}
                  placeholder="مثلاً: 2 بيتزا مارجريتا كبير + 1 كولا"
                  className={styles.textarea}
                  dir="rtl"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>ملاحظات</label>
                <textarea
                  name="notes"
                  maxLength={300}
                  rows={2}
                  placeholder="أي تفاصيل إضافية…"
                  className={styles.textarea}
                  dir="rtl"
                />
              </div>

              {msg && !success && (
                <div className={styles.error}>
                  <AlertIcon size={14} />
                  <span>{msg}</span>
                </div>
              )}

              {(menuImages.length > 0 || offers.length > 0) && (
                <button type="button" onClick={() => setMenuOpen(true)} className={styles.menuBtn}>
                  <ImageIcon size={16} />
                  <span>شوف المنيو</span>
                </button>
              )}

              <button type="submit" disabled={pending} className={styles.submitBtn}>
                {pending ? 'جاري الإرسال…' : 'أكمل الطلب'}
              </button>
            </form>
          </>
        )}
      </div>

      <MenuSlider
        open={menuOpen}
        onClose={closeMenu}
        images={menuImages}
        offers={offers}
        businessName={businessName}
      />
    </>
  )
}
