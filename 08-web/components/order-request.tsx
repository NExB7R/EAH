'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './order-request.css'
import { buildOrderMessage } from '@/lib/whatsapp-order'
import { trackClientEvent } from '@/lib/analytics/client'
import { IcMarket, IcCheckCircle, IcLock, IcPin } from './eah-icons'
import LocationPicker from '@/components/locations/location-picker'
import '@/components/locations/location-picker.css'

type Props = {
  businessId: string
  businessName: string
  merchantPhone: string | null
}

type SavedLoc = {
  id: string
  label: string | null
  address: string | null
  address_text?: string | null
  latitude: number | null
  longitude: number | null
  accuracy?: number | null
  is_primary?: boolean
  last_used_at?: string | null
  [key: string]: unknown
}

type TrustData = {
  score: number
  tier: string
  verified: boolean
  successfulOrders: number
  reviewsCount: number
}

function tierLabel(tier: string): string {
  return tier === 'vip' ? 'VIP' : tier === 'pro' ? 'محترف' : tier === 'trusted' ? 'موثوق' : 'جديد'
}

function trustStars(score: number): string {
  if (score >= 90) return '⭐⭐⭐'
  if (score >= 75) return '⭐⭐'
  if (score >= 50) return '⭐'
  return ''
}

// ─── أيقونات SVG نظيفة ───
function IconMic({ recording }: { recording: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      {recording && <line x1="8" y1="22" x2="16" y2="22" />}
    </svg>
  )
}

function IconImage() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <polygon points="6 4 20 12 6 20" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function OrderRequest({ businessId, businessName, merchantPhone }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [items, setItems] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label?: string } | null>(null)
  const [savedLocations, setSavedLocations] = useState<SavedLoc[]>([])
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Trust
  const [trust, setTrust] = useState<TrustData | null>(null)

  // Voice
  const [recording, setRecording] = useState(false)
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null)
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null)
  const [voiceDuration, setVoiceDuration] = useState(0)
  const [voiceUploading, setVoiceUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const voiceTimerRef = useRef<number | null>(null)

  // Images
  const [images, setImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Countdown after sent
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)

  // ─── Prefill + load saved data when opened ───
  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, locsRes, ordersRes, reviewsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name,phone,trust_score,trust_tier,verified_at,successful_orders')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('customer_locations')
          .select('id,label,address,address_text,latitude,longitude,accuracy,is_primary,last_used_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('order_requests')
          .select('*', { count: 'exact', head: true })
          .eq('customer_profile_id', user.id),
        supabase
          .from('business_reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ])

      const prof = profileRes.data
      if (prof?.display_name) setName(prof.display_name)
      if (prof?.phone) setPhone(prof.phone)

      setTrust({
        score: prof?.trust_score ?? 50,
        tier: prof?.trust_tier ?? 'trusted',
        verified: !!prof?.verified_at,
        successfulOrders: prof?.successful_orders ?? 0,
        reviewsCount: reviewsRes.count ?? 0,
      })

      setSavedLocations((locsRes.data ?? []) as SavedLoc[])
    })()
  }, [open])

  // ─── Countdown ticker ───
  useEffect(() => {
    if (!expiresAt) return
    const t = setInterval(() => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setRemaining(left)
    }, 1000)
    return () => clearInterval(t)
  }, [expiresAt])

  function openForm() {
    setOpen(true)
    trackClientEvent('order_start', { businessId })
  }

  function validate() {
    if (name.trim().length < 2) return 'اكتب اسمك'
    if (!/^[\d+\s-]{8,}$/.test(phone.trim())) return 'رقم موبايل غير صحيح'
    if (items.trim().length < 5 && !voiceBlob && images.length === 0) {
      return 'اكتب الأوردر، أو سجّل فويس نوت، أو ارفع صورة'
    }
    if (!userLocation && !selectedLocId && address.trim().length < 5) {
      return 'حدد موقعك، أو اختار عنوان محفوظ، أو اكتب العنوان'
    }
    if (!merchantPhone) return 'المطعم مش مسجل رقم واتساب'
    return null
  }

  // ─── Voice recording ───
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      chunksRef.current = []
      setVoiceDuration(0)

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setVoiceBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      mr.start()
      setRecording(true)
      voiceTimerRef.current = window.setInterval(() => {
        setVoiceDuration((d) => {
          if (d >= 60) {
            stopRecording()
            return d
          }
          return d + 1
        })
      }, 1000)
    } catch {
      setError('مش قادر أوصل للمايك — تأكد إن المتصفح سامح')
    }
  }

  function stopRecording() {
    const mr = mediaRecorderRef.current
    if (mr && mr.state !== 'inactive') {
      mr.stop()
    }
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current)
      voiceTimerRef.current = null
    }
    setRecording(false)
  }

  function removeVoice() {
    setVoiceBlob(null)
    setVoiceUrl(null)
    setVoiceDuration(0)
  }

  async function uploadVoice(): Promise<string | null> {
    if (!voiceBlob) return voiceUrl
    if (voiceUrl) return voiceUrl
    setVoiceUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', voiceBlob, 'voice.webm')
      const res = await fetch('/api/upload/voice', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'فشل رفع الصوت')
      setVoiceUrl(json.url)
      return json.url as string
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل رفع الصوت')
      return null
    } finally {
      setVoiceUploading(false)
    }
  }

  // ─── Images ───
  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploadingImages(true)
    setError(null)
    try {
      const uploaded: string[] = []
      for (const file of files.slice(0, 5 - images.length)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload/order-image', { method: 'POST', body: fd })
        const json = await res.json()
        if (res.ok && json.ok) uploaded.push(json.url)
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, 5))
    } catch {
      setError('فشل رفع بعض الصور')
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  // ─── Location chips ───
  function pickSavedLocation(loc: SavedLoc) {
    setSelectedLocId(loc.id)
    if (loc.latitude != null && loc.longitude != null) {
      setUserLocation({ lat: loc.latitude, lng: loc.longitude, label: loc.label ?? undefined })
    }
    if (loc.label) setArea(loc.label)
    if (loc.address) setAddress(loc.address)
  }

  // ─── Submit ───
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const err = validate()
    if (err || !merchantPhone) { setError(err ?? 'رقم المطعم غير متاح'); return }

    setStatus('sending')

    let customerProfileId: string | null = null
    let customerTrustScore: number | undefined
    let customerTrustTier: string | undefined
    let customerVerified: boolean | undefined
    let customerReviews: number | undefined
    let businessTrustScore: number | undefined

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        customerProfileId = user.id
        const [profRes, bizRes] = await Promise.all([
          supabase.from('profiles').select('trust_score,trust_tier,verified_at').eq('id', user.id).maybeSingle(),
          supabase.from('businesses').select('trust_score').eq('id', businessId).maybeSingle(),
        ])
        if (profRes.data) {
          customerTrustScore = profRes.data.trust_score ?? 50
          customerTrustTier = profRes.data.trust_tier ?? 'trusted'
          customerVerified = !!profRes.data.verified_at
        }
        businessTrustScore = bizRes.data?.trust_score ?? 50
        customerReviews = trust?.reviewsCount
      }
    } catch { /* silent */ }

    // upload voice (if any)
    const finalVoiceUrl = voiceBlob ? await uploadVoice() : null

    // build message (fallback to temp code - will be overwritten by trigger)
    const tempCode = `TMP-${Date.now().toString().slice(-6)}`

    const msg = buildOrderMessage({
      orderCode: tempCode,
      businessName,
      businessTrustScore,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerTrustScore,
      customerTrustTier,
      customerReviews,
      customerVerified,
      area: area.trim() || null,
      address: address.trim() || null,
      locationLabel: userLocation?.label ?? null,
      location: userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null,
      items: items.trim(),
      notes: notes.trim() || null,
      voiceUrl: finalVoiceUrl,
      images,
    })

    const waUrl = `https://wa.me/${merchantPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`

    try {
      const supabase = createClient()
      const { data: inserted } = await supabase.from('order_requests').insert({
        business_id: businessId,
        customer_profile_id: customerProfileId,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_area: area.trim() || null,
        customer_address: address.trim() || null,
        customer_location_label: userLocation?.label ?? null,
        customer_location_lat: userLocation?.lat ?? null,
        customer_location_lng: userLocation?.lng ?? null,
        delivery_lat: userLocation?.lat ?? null,
        delivery_lng: userLocation?.lng ?? null,
        items: items.trim(),
        notes: notes.trim() || null,
        merchant_phone: merchantPhone,
        whatsapp_url: waUrl,
        order_code: tempCode,
        voice_url: finalVoiceUrl,
        images,
        status: 'sent',
      }).select('id, expires_at').maybeSingle()

      if (inserted?.id) {
        // إشعار التاجر
        fetch('/api/orders/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: inserted.id }),
        }).catch(() => {})

        if (inserted.expires_at) {
          setExpiresAt(new Date(inserted.expires_at).getTime())
        } else {
          setExpiresAt(Date.now() + 10 * 60 * 1000)
        }
      }

      window.open(waUrl, '_blank', 'noreferrer')
      setStatus('sent')
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'حصل خطأ')
    }
  }

  if (!merchantPhone) return null

  // ─── Trigger ───
  if (!open) {
    return (
      <button type="button" className="orr__trigger" onClick={openForm}>
        <span className="orr__trigger-icon"><IcMarket /></span>
        <span className="orr__trigger-text">
          <strong>اطلب أوردر</strong>
          <small>يتبعت مباشر على واتساب المكان</small>
        </span>
        <span className="orr__trigger-arrow">←</span>
      </button>
    )
  }

  // ─── Success view ───
  if (status === 'sent') {
    const mm = Math.floor(remaining / 60)
    const ss = remaining % 60
    return (
      <div className="orr">
        <div className="orr__success">
          <span className="orr__success-icon"><IcCheckCircle /></span>
          <h4>تم إرسال طلبك</h4>
          <p>الأوردر اتبعت على واتساب المكان. لو مفتحش تلقائياً، دوس على الرابط تحت.</p>

          {remaining > 0 && (
            <div className="orr__countdown">
              <span className="orr__countdown-label">المهلة المتاحة للرد</span>
              <span className="orr__countdown-time">
                {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
              </span>
              <span className="orr__countdown-hint">لو مردّوش خلال المدة، هيتلغى الأوردر تلقائياً</span>
            </div>
          )}

          <a
            href={`https://wa.me/${merchantPhone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="orr__success-btn"
          >
            افتح واتساب المكان
          </a>
          <button
            type="button"
            className="orr__success-close"
            onClick={() => { setOpen(false); setStatus('idle'); setExpiresAt(null); setRemaining(0) }}
          >
            تمام
          </button>
        </div>
      </div>
    )
  }

  // ─── Form ───
  return (
    <div className="orr">
      <header className="orr__head">
        <div className="orr__head-text">
          <span className="orr__kicker">نموذج الطلب</span>
          <h3 className="orr__title">اطلب من {businessName}</h3>
          <p className="orr__sub">اتفضل، اكتب اللي عايزه ونبعته للمكان على واتساب</p>
        </div>
        <button type="button" className="orr__close" onClick={() => setOpen(false)} aria-label="إغلاق">×</button>
      </header>

      {/* ─── Trust strip ─── */}
      {trust && (
        <div className={`orr__trust orr__trust--${trust.tier}`}>
          <div className="orr__trust-badge">
            <span className="orr__trust-score">{trust.score}</span>
            <span className="orr__trust-max">/100</span>
          </div>
          <div className="orr__trust-info">
            <span className="orr__trust-tier">
              مصداقيتك: {tierLabel(trust.tier)} {trustStars(trust.score)}
            </span>
            <span className="orr__trust-hint">
              {trust.verified ? '✓ موثّق · ' : ''}
              {trust.successfulOrders > 0 ? `${trust.successfulOrders} أوردر ناجح` : 'عميل جديد'}
            </span>
          </div>
        </div>
      )}

      <form className="orr__form" onSubmit={submit}>
        {/* ─── بيانات العميل ─── */}
        <div className="orr__grid">
          <label className="orr__field">
            <span className="orr__field-label">الاسم *</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك الكامل"
              maxLength={80}
              required
            />
          </label>
          <label className="orr__field">
            <span className="orr__field-label">رقم الموبايل *</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01xxxxxxxxx"
              dir="ltr"
              maxLength={20}
              required
            />
          </label>
        </div>

        {/* ─── الموقع ─── */}
        <div className="orr__location">
          <span className="orr__field-label"><IcPin /> موقعك *</span>

          {/* Saved locations chips */}
          {savedLocations.length > 0 && (
            <div className="orr__loc-chips">
              {savedLocations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  className={`orr__loc-chip ${selectedLocId === loc.id ? 'is-active' : ''}`}
                  onClick={() => pickSavedLocation(loc)}
                >
                  {loc.label ?? 'عنوان محفوظ'}
                </button>
              ))}
            </div>
          )}

          {/* Manual location picker */}
          <LocationPicker
            locations={savedLocations as any}
            onPick={(loc: any) => {
              const lat = loc.latitude ?? loc.lat
              const lng = loc.longitude ?? loc.lng
              setUserLocation({ lat, lng, label: loc.label ?? 'موقعي' })
              setSelectedLocId(null)
              if (loc.label) setArea(loc.label)
            }}
            compact
          />
          {userLocation && (
            <p className="orr__loc-ok">✓ {userLocation.label ?? 'تم تحديد موقعك'}</p>
          )}
        </div>

        <div className="orr__grid">
          <label className="orr__field">
            <span className="orr__field-label">المنطقة</span>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="مثلاً: شبين القناطر"
              maxLength={60}
            />
          </label>
          <label className="orr__field">
            <span className="orr__field-label">العنوان بالتفصيل</span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="اسم الشارع + علامة مميزة"
              maxLength={200}
            />
          </label>
        </div>

        {/* ─── الأوردر ─── */}
        <div className="orr__field">
          <span className="orr__field-label">الأوردر *</span>
          <textarea
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="مثلاً: 2 شاورما فراخ + 1 بيبسي كبير"
            rows={4}
            maxLength={500}
          />
          <small className="orr__hint">{items.length}/500 حرف</small>
        </div>

        {/* ─── الصور + الصوت ─── */}
        <div className="orr__attach">
          <span className="orr__field-label">صوّر أو اتكلم (اختياري)</span>

          <div className="orr__attach-row">
            {/* Voice button */}
            {!voiceBlob && !recording && (
              <button type="button" className="orr__attach-btn" onClick={startRecording}>
                <IconMic recording={false} />
                <span>سجّل صوت</span>
              </button>
            )}

            {recording && (
              <button type="button" className="orr__attach-btn orr__attach-btn--recording" onClick={stopRecording}>
                <IconMic recording={true} />
                <span>جاري التسجيل {voiceDuration}s — اضغط للإيقاف</span>
              </button>
            )}

            {voiceBlob && !recording && (
              <div className="orr__voice-preview">
                <span className="orr__voice-icon"><IconPlay /></span>
                <span className="orr__voice-label">فويس نوت ({voiceDuration}s)</span>
                <button type="button" className="orr__voice-remove" onClick={removeVoice} aria-label="حذف">
                  <IconTrash />
                </button>
              </div>
            )}

            {/* Image button */}
            <button
              type="button"
              className="orr__attach-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImages || images.length >= 5}
            >
              <IconImage />
              <span>
                {uploadingImages ? 'جاري الرفع...' : `أضف صور (${images.length}/5)`}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImagePick}
            />
          </div>

          {/* Images preview */}
          {images.length > 0 && (
            <div className="orr__images">
              {images.map((url, i) => (
                <div key={i} className="orr__image-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`صورة ${i + 1}`} />
                  <button
                    type="button"
                    className="orr__image-remove"
                    onClick={() => removeImage(i)}
                    aria-label="حذف"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── ملاحظات ─── */}
        <label className="orr__field">
          <span className="orr__field-label">ملاحظات إضافية</span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثلاً: حار شوية، بدون بصل..."
            maxLength={200}
          />
        </label>

        {error && <div className="orr__error">{error}</div>}

        <div className="orr__actions">
          <button type="submit" className="orr__submit" disabled={status === 'sending' || voiceUploading}>
            {status === 'sending' || voiceUploading ? 'جاري الإرسال...' : 'إرسال على واتساب'}
          </button>
          <button type="button" className="orr__cancel" onClick={() => setOpen(false)}>
            إلغاء
          </button>
        </div>

        <p className="orr__note">
          <IcLock /> بياناتك بتُستخدم فقط لتحويل الأوردر للمكان. مفيش أي رسوم على العميل.
        </p>
      </form>
    </div>
  )
}
