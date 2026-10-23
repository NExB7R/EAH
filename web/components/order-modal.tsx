'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import {
  CloseIcon,
  GiftIcon,
  CheckCircleIcon,
  AlertIcon,
  ImageIcon,
  FileTextIcon,
  MicIcon,
  PhoneIcon,
} from './icons'
import { submitOrder } from '@/app/businesses/[slug]/order-actions'
import { addPendingReview } from '@/lib/engagement'
import styles from './order-modal.module.css'

const MenuSlider = dynamic(() => import('./menu-slider'), { ssr: false })

type Attachment = {
  type: 'image' | 'voice'
  url: string
  size: number
  duration_sec?: number
  mime?: string
}

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

type Step = 'form' | 'review' | 'success'

const PAYMENT_OPTIONS = [
  {
    key: 'cash' as const,
    label: 'الدفع عند الاستلام',
    desc: 'تدفع للمندوب وقت التسليم',
    warning: null,
  },
  {
    key: 'instapay' as const,
    label: 'InstaPay',
    desc: 'تحويل مسبق عبر InstaPay',
    warning:
      '⚠️ ممنوع الدفع لأي شخص آخر. الدفع فقط عبر InstaPay الرسمي للنشاط. EAH غير مسؤولة عن أي دفع خارج الإطار.',
  },
  {
    key: 'wallet' as const,
    label: 'محفظة إلكترونية',
    desc: 'فودافون كاش / اتصالات كاش',
    warning:
      '⚠️ ممنوع الدفع لأي شخص آخر. الدفع فقط عبر المحفظة الرسمية للنشاط. EAH غير مسؤولة عن أي دفع خارج الإطار.',
  },
] as const

const MAX_FILES = 3
const MAX_SIZE = 5 * 1024 * 1024

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
  const [step, setStep] = useState<Step>('form')
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [successCode, setSuccessCode] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)

  // Form fields
  const [customerName, setCustomerName] = useState(defaultName)
  const [customerPhone, setCustomerPhone] = useState(defaultPhone)
  const [secondaryPhone, setSecondaryPhone] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [itemsText, setItemsText] = useState('')
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState<'cash' | 'instapay' | 'wallet'>('cash')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const voiceInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const paymentMeta = PAYMENT_OPTIONS.find((p) => p.key === payment)!

  const resetState = useCallback(() => {
    setStep('form')
    setMsg(null)
    setSuccessCode('')
    setCustomerName(defaultName)
    setCustomerPhone(defaultPhone)
    setSecondaryPhone('')
    setArea('')
    setAddress('')
    setItemsText('')
    setNotes('')
    setPayment('cash')
    setAttachments([])
    setConfirmed(false)
    setMenuOpen(false)
  }, [defaultName, defaultPhone])

  const handleClose = () => {
    if (pending) return
    resetState()
    onClose()
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) {
        resetState()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, pending, onClose, resetState])

  if (!open) return null

  const hasContent = itemsText.trim().length >= 3 || attachments.length > 0

  const uploadFile = async (file: File, kind: 'image' | 'voice'): Promise<void> => {
    if (file.size > MAX_SIZE) {
      setMsg('الحجم كبير (5MB max)')
      return
    }
    setMsg(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('kind', kind)
      const res = await fetch('/api/orders/upload', { method: 'POST', body: fd })
      const data = (await res.json()) as {
        ok?: boolean
        url?: string
        size?: number
        mime?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.url) {
        setMsg(data.error ?? 'فشل الرفع')
        return
      }
      setAttachments((prev) => [
        ...prev,
        {
          type: kind,
          url: data.url!,
          size: data.size ?? file.size,
          mime: data.mime ?? file.type,
        },
      ])
    } catch {
      setMsg('فشل الاتصال')
    } finally {
      setUploading(false)
    }
  }

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_FILES - attachments.filter((a) => a.type === 'image').length
    const toUpload = files.slice(0, remaining)
    if (files.length > remaining) {
      setMsg(`الحد ${MAX_FILES} صور`)
    }
    for (const f of toUpload) void uploadFile(f, 'image')
    e.currentTarget.value = ''
  }

  const handleVoicePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (attachments.some((a) => a.type === 'voice')) {
      setMsg('صوت واحد فقط')
      e.currentTarget.value = ''
      return
    }
    void uploadFile(file, 'voice')
    e.currentTarget.value = ''
  }

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const goReview = () => {
    if (customerName.trim().length < 2) {
      setMsg('اكتب اسمك (2 حرف على الأقل)')
      return
    }
    const phoneClean = customerPhone.trim().replace(/[\s-]/g, '')
    if (phoneClean.length < 11) {
      setMsg('اكتب رقمك (11 رقم)')
      return
    }
    if (!hasContent) {
      setMsg('اكتب طلبك أو ارفع صورة/صوت')
      return
    }
    setMsg(null)
    setStep('review')
  }

  const submit = () => {
    if (!confirmed) {
      setMsg('لازم توافق على الشروط')
      return
    }
    if (customerName.trim().length < 2) {
      setMsg('اكتب اسمك (2 حرف على الأقل)')
      return
    }
    const phoneClean = customerPhone.trim().replace(/[\s-]/g, '')
    if (phoneClean.length < 11) {
      setMsg('اكتب رقمك (11 رقم)')
      return
    }
    const fd = new FormData()
    fd.set('customer_name', customerName.trim())
    fd.set('customer_phone', customerPhone.trim())
    fd.set('secondary_phone', secondaryPhone)
    fd.set('customer_area', area)
    fd.set('customer_address', address)
    fd.set('items_summary', itemsText)
    fd.set('notes', notes)
    fd.set('payment_method', payment)
    fd.set('attachments_json', JSON.stringify(attachments))

    setMsg(null)
    startTransition(async () => {
      const res = await submitOrder(businessId, businessSlug, fd)
      if (res.ok) {
        setSuccessCode(res.orderCode)
        setStep('success')
        addPendingReview({ businessId, businessSlug, businessName })
        setTimeout(() => {
          window.open(res.whatsappUrl, '_blank')
        }, 900)
      } else {
        setMsg(res.error)
      }
    })
  }

  return (
    <>
      <div className={styles.backdrop} onClick={handleClose} aria-hidden />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button type="button" onClick={handleClose} className={styles.close} aria-label="إغلاق">
          <CloseIcon size={18} />
        </button>

        <div className={styles.glow} aria-hidden />

        {step === 'success' && (
          <div className={styles.successBox}>
            <span className={styles.successIcon}>
              <CheckCircleIcon size={36} />
            </span>
            <h2 className={styles.successTitle}>تم!</h2>
            <p className={styles.successText}>طلبك #{successCode} وصل للتاجر ✓</p>
            <p className={styles.successHint}>
              هيتم فتح واتساب الآن لإشعار التاجر. لو ما فتحش، كلم النشاط من صفحته.
            </p>
            <div className={styles.timelinePreview}>
              <p className={styles.timelinePreviewTitle}>الخطوات القادمة:</p>
              <ol className={styles.timelineList}>
                <li className={styles.timelineDone}>✓ استلمنا طلبك</li>
                <li>⏳ بانتظار رد التاجر (≤10 دقايق)</li>
                <li>🍳 تجهيز الطلب</li>
                <li>🚗 في الطريق</li>
                <li>✅ التسليم</li>
              </ol>
            </div>
          </div>
        )}

        {step === 'form' && (
          <>
            <div className={styles.header}>
              <span className={styles.headerIcon}>
                <GiftIcon size={22} />
              </span>
              <div>
                <h2 className={styles.title}>اطلب من {businessName}</h2>
                <p className={styles.subtitle}>اكتب · صوت · صور — احنا نوصل طلبك</p>
              </div>
            </div>

            <div className={styles.form}>
              {/* Contact (read-only defaults) */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    اسمك <span style={{ color: '#fca5a5' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    readOnly={!!defaultName}
                    maxLength={60}
                    placeholder={defaultName ? undefined : 'اكتب اسمك'}
                    className={`${styles.input} ${defaultName ? styles.readOnly : ''}`}
                    dir="rtl"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <PhoneIcon size={11} /> رقمك <span style={{ color: '#fca5a5' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    readOnly={!!defaultPhone}
                    maxLength={15}
                    placeholder={defaultPhone ? undefined : '01xxxxxxxxx'}
                    className={`${styles.input} ${defaultPhone ? styles.readOnly : ''}`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>رقم إضافي (اختياري)</label>
                  <input
                    type="tel"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    maxLength={15}
                    placeholder="01xxxxxxxxx"
                    className={styles.input}
                    dir="ltr"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>المنطقة</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    maxLength={80}
                    placeholder="شبين القناطر"
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>العنوان</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={200}
                  placeholder="شارع + رقم عمارة"
                  className={styles.input}
                  dir="rtl"
                />
              </div>

              {/* Method tabs */}
              <div className={styles.methodTabs}>
                <button
                  type="button"
                  className={`${styles.methodTab} ${attachments.some((a) => a.type === 'image') ? styles.methodTabActive : ''}`}
                  onClick={() => imageInputRef.current?.click()}
                  disabled={
                    uploading || attachments.filter((a) => a.type === 'image').length >= MAX_FILES
                  }
                >
                  <ImageIcon size={16} />
                  <span>صور</span>
                </button>
                <button
                  type="button"
                  className={`${styles.methodTab} ${attachments.some((a) => a.type === 'voice') ? styles.methodTabActive : ''}`}
                  onClick={() => voiceInputRef.current?.click()}
                  disabled={uploading || attachments.some((a) => a.type === 'voice')}
                >
                  <MicIcon size={16} />
                  <span>صوت</span>
                </button>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                multiple
                onChange={handleImagePick}
                hidden
              />
              <input
                ref={voiceInputRef}
                type="file"
                accept="audio/*"
                onChange={handleVoicePick}
                hidden
              />

              {attachments.length > 0 && (
                <div className={styles.attachments}>
                  {attachments.map((a, i) => (
                    <div key={i} className={styles.attachment}>
                      {a.type === 'image' ? (
                        <div
                          className={styles.attachmentThumb}
                          style={{ backgroundImage: `url(${a.url})` }}
                          role="img"
                          aria-label="مرفق"
                        />
                      ) : (
                        <span className={styles.attachmentVoice}>
                          <MicIcon size={16} />
                          <span>{a.duration_sec ? `${a.duration_sec}s` : 'صوت'}</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className={styles.attachmentRemove}
                        aria-label="حذف"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploading && <p className={styles.uploading}>جاري الرفع…</p>}

              <div className={styles.field}>
                <label className={styles.label}>
                  <FileTextIcon size={11} /> تفاصيل الطلب (اختياري لو رفعت صور/صوت)
                </label>
                <textarea
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="مثلاً: 2 بيتزا مارجريتا كبير + 1 كولا"
                  className={styles.textarea}
                  dir="rtl"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>ملاحظات (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="أي تفاصيل إضافية…"
                  className={styles.textarea}
                  dir="rtl"
                />
              </div>

              {/* Payment */}
              <div className={styles.field}>
                <label className={styles.label}>طريقة الدفع</label>
                <div className={styles.paymentGrid}>
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setPayment(opt.key)}
                      className={`${styles.paymentCard} ${payment === opt.key ? styles.paymentCardActive : ''}`}
                    >
                      <span className={styles.paymentLabel}>{opt.label}</span>
                      <span className={styles.paymentDesc}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {msg && (
                <div className={styles.error}>
                  <AlertIcon size={14} />
                  <span>{msg}</span>
                </div>
              )}

              {menuImages.length > 0 && (
                <button type="button" onClick={() => setMenuOpen(true)} className={styles.menuBtn}>
                  <ImageIcon size={14} />
                  <span>شوف المنيو</span>
                </button>
              )}

              <button
                type="button"
                onClick={goReview}
                disabled={!hasContent || uploading}
                className={styles.submitBtn}
              >
                راجع الطلب ←
              </button>
            </div>
          </>
        )}

        {step === 'review' && (
          <>
            <div className={styles.header}>
              <span className={styles.headerIcon}>
                <FileTextIcon size={22} />
              </span>
              <div>
                <h2 className={styles.title}>مراجعة الطلب</h2>
                <p className={styles.subtitle}>تأكد من البيانات قبل الإرسال</p>
              </div>
            </div>

            <div className={styles.review}>
              <div className={styles.reviewSection}>
                <h3 className={styles.reviewTitle}>بياناتك</h3>
                <p className={styles.reviewLine}>
                  <span>الاسم:</span> <strong>{customerName || '—'}</strong>
                </p>
                <p className={styles.reviewLine}>
                  <span>الرقم:</span> <strong dir="ltr">{customerPhone || '—'}</strong>
                </p>
                {secondaryPhone && (
                  <p className={styles.reviewLine}>
                    <span>رقم إضافي:</span> <strong dir="ltr">{secondaryPhone}</strong>
                  </p>
                )}
                {(area || address) && (
                  <p className={styles.reviewLine}>
                    <span>العنوان:</span>{' '}
                    <strong>
                      {area}
                      {area && address && ' — '}
                      {address}
                    </strong>
                  </p>
                )}
              </div>

              {itemsText.trim() && (
                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewTitle}>الطلب</h3>
                  <p className={styles.reviewText}>{itemsText}</p>
                </div>
              )}

              {attachments.length > 0 && (
                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewTitle}>المرفقات ({attachments.length})</h3>
                  <div className={styles.attachments}>
                    {attachments.map((a, i) => (
                      <div key={i} className={styles.attachment}>
                        {a.type === 'image' ? (
                          <div
                            className={styles.attachmentThumb}
                            style={{ backgroundImage: `url(${a.url})` }}
                            role="img"
                            aria-label="مرفق"
                          />
                        ) : (
                          <span className={styles.attachmentVoice}>
                            <MicIcon size={16} />
                            <span>{a.duration_sec ? `${a.duration_sec}s` : 'صوت'}</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notes.trim() && (
                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewTitle}>ملاحظات</h3>
                  <p className={styles.reviewText}>{notes}</p>
                </div>
              )}

              <div className={styles.reviewSection}>
                <h3 className={styles.reviewTitle}>الدفع</h3>
                <p className={styles.reviewLine}>
                  <strong>{paymentMeta.label}</strong>
                </p>
                {paymentMeta.warning && (
                  <div className={styles.paymentWarning}>
                    <AlertIcon size={12} />
                    <span>{paymentMeta.warning}</span>
                  </div>
                )}
              </div>

              <label className={styles.confirmRow}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                <span>
                  أؤكد أن البيانات صحيحة، وأتفهم أنه{' '}
                  <strong>لا يمكن تعديل الطلب بعد الإرسال</strong>.
                </span>
              </label>

              {msg && (
                <div className={styles.error}>
                  <AlertIcon size={14} />
                  <span>{msg}</span>
                </div>
              )}

              <div className={styles.reviewActions}>
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending || !confirmed}
                  className={styles.submitBtn}
                >
                  {pending ? 'جاري الإرسال…' : 'تأكيد وإرسال ✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={pending}
                  className={styles.backBtn}
                >
                  ← تعديل
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {menuOpen && (
        <MenuSlider
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          images={menuImages}
          offers={offers}
          businessName={businessName}
        />
      )}

      <audio ref={audioRef} hidden />
    </>
  )
}

// Note: duration is unknown synchronously for picked files.
// We omit duration for picked audio (Cloudinary stores the file itself).
