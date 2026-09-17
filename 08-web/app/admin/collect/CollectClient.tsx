'use client'
import { useState } from 'react'
import Link from 'next/link'
import './collect.css'
import { IcGlobe, IcLink, IcScroll } from '@/components/eah-icons'

type Recent = {
  id: string
  name: string
  slug: string
  business_type: string
  area: string
  created_at: string
}

type ExtractedData = {
  name: string
  description: string
  image: string
  sourceUrl: string
  phones: string[]
  whatsapp: string | null
  address: string | null
  hours: string | null
  type: 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office' | null
  hasDelivery: boolean
  cuisine: string | null
  score: number
  facebook?: string | null
  instagram?: string | null
  website?: string | null
  tiktok?: string | null
  email?: string | null
}

const AREAS = [
  'شبين القناطر', 'القلج', 'أبو زعبل', 'الجبل الأصفر',
  'الحصافة', 'الزهويين', 'الشوبك', 'كفر الشوبك',
  'الأحراز', 'تل بني تميم', 'طحا', 'كفر طحا',
  'نوى', 'منشأة الكرام', 'كفر بطا', 'الجعافرة',
  'الدير', 'أم زين', 'المنشية', 'أخرى'
]

const TYPES = [
  { key: 'restaurant', label: 'مطعم' },
  { key: 'pharmacy', label: 'صيدلية' },
  { key: 'supermarket', label: 'ماركت' },
  { key: 'delivery_office', label: 'توصيل' },
]

export default function CollectClient({ recent }: { recent: Recent[] }) {
  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [parsed, setParsed] = useState<ExtractedData | null>(null)
  const [rawReviews, setRawReviews] = useState('')

  const [name, setName] = useState('')
  const [type, setType] = useState('restaurant')
  const [area, setArea] = useState('شبين القناطر')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [facebook, setFacebook] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [hours, setHours] = useState('')

  async function parseUrl() {
    if (!url.trim()) return
    setError(null)
    setSuccess(null)
    setParsing(true)
    try {
      const res = await fetch('/api/admin/collect/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError('فشل: ' + (data.error || res.status))
        return
      }
      const d: ExtractedData = data.data
      setParsed(d)
      setName(d.name || '')
      setDescription(d.description || '')
      setAddress(d.address || '')
      setHours(d.hours || '')
      if (d.phones && d.phones.length > 0) setPhone(d.phones[0])
      if (d.whatsapp) setWhatsapp(d.whatsapp)
      if (d.sourceUrl && (d.sourceUrl.includes('facebook.com') || d.sourceUrl.includes('fb.com'))) setFacebook(d.sourceUrl)
      if (d.facebook && !d.sourceUrl.includes('facebook')) setFacebook(d.facebook)
      if (d.website) setWebsite(d.website)
      if (d.instagram) setInstagram(d.instagram)
      if (d.type) setType(d.type)
    } catch (e: any) {
      setError('خطأ: ' + e.message)
    } finally {
      setParsing(false)
    }
  }

  function parseReviewsInput(text: string) {
    // صيغ مدعومة:
    // اسم | 5 | تعليق
    // اسم — 5 — تعليق
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    const out: { author: string; rating: number; comment: string }[] = []
    for (const line of lines) {
      const parts = line.split(/[|—\-]/).map((p) => p.trim())
      if (parts.length >= 3) {
        const author = parts[0]
        const rating = Math.min(5, Math.max(1, parseInt(parts[1], 10) || 5))
        const comment = parts.slice(2).join(' - ').trim()
        if (author && comment.length >= 5) {
          out.push({ author, rating, comment })
        }
      }
    }
    return out
  }

  async function save() {
    if (!name.trim()) { setError('اكتب اسم النشاط'); return }
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const reviews = parseReviewsInput(rawReviews)
      const res = await fetch('/api/admin/collect/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          area,
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          facebook: facebook.trim(),
          website: website.trim(),
          instagram: instagram.trim(),
          sourceUrl: parsed?.sourceUrl || url.trim(),
          description: description.trim(),
          imageUrl: parsed?.image || '',
          address: address.trim(),
          hours: hours.trim(),
          hasDelivery: parsed?.hasDelivery || false,
          reviews,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError('فشل الحفظ: ' + (data.error || res.status))
        return
      }
      setSuccess('تم: /businesses/' + data.slug + ' — ' + (data.reviewsInserted || 0) + ' تقييم')
      setUrl('')
      setParsed(null)
      setName('')
      setPhone('')
      setWhatsapp('')
      setFacebook('')
      setDescription('')
      setAddress('')
      setHours('')
      setRawReviews('')
      setTimeout(() => window.location.reload(), 1800)
    } catch (e: any) {
      setError('خطأ: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const reviewsPreview = parseReviewsInput(rawReviews)

  return (
    <section className="col">
      <header className="col__head">
        <div>
          <span className="col__kicker">الجمع الذكي</span>
          <h1 className="col__title">جمع أماكن</h1>
          <p className="col__sub">
            الصق رابط Facebook / Instagram / Maps — هيستخرج البيانات تلقائياً
          </p>
        </div>
        <Link href="/admin/businesses" className="col__link">← الأنشطة</Link>
      </header>

      {/* URL Input */}
      <div className="col__url-box">
        <label className="col__label"><IcLink /> الرابط</label>
        <div className="col__url-row">
          <input
            type="url"
            className="col__input"
            dir="ltr"
            placeholder="https://www.facebook.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && parseUrl()}
          />
          <button
            type="button"
            className="col__btn col__btn--primary"
            onClick={parseUrl}
            disabled={parsing || !url.trim()}
          >
            {parsing ? '...' : 'تحليل'}
          </button>
        </div>
        <p className="col__hint">facebook.com · instagram.com · maps.google.com</p>
      </div>

      {/* Preview + Form */}
      {parsed && (
        <div className="col__form">
          {parsed.image && (
            <div className="col__preview-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={parsed.image} alt="preview" />
            </div>
          )}

          <div className="col__score">
            <span className="col__score-label">جودة الاستخراج</span>
            <div className="col__score-bar">
              <div className="col__score-fill" style={{ width: parsed.score + '%' }} />
            </div>
            <strong className="col__score-num">{parsed.score}%</strong>
          </div>

          {(parsed.cuisine || parsed.hasDelivery || parsed.type) && (
            <div className="col__chips">
              {parsed.type && <span className="col__chip">🏷️ {parsed.type}</span>}
              {parsed.cuisine && <span className="col__chip">{parsed.cuisine}</span>}
              {parsed.hasDelivery && <span className="col__chip col__chip--ok">بيوصل</span>}
            </div>
          )}

          <div className="col__grid">
            <label className="col__field col__field--full">
              <span>اسم النشاط *</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label className="col__field">
              <span>🏷️ النوع *</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </label>

            <label className="col__field">
              <span>المنطقة *</span>
              <select value={area} onChange={(e) => setArea(e.target.value)}>
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>

            <label className="col__field">
              <span>رقم الموبايل</span>
              <input type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" />
            </label>

            <label className="col__field">
              <span>رقم الواتساب</span>
              <input type="tel" dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="201xxxxxxxxx" />
            </label>

            <label className="col__field col__field--full">
              <span>صفحة فيسبوك</span>
              <input type="url" dir="ltr" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/pagename" />
            </label>

            <label className="col__field">
              <span><IcGlobe /> الموقع</span>
              <input type="url" dir="ltr" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
            </label>

            <label className="col__field">
              <span>إنستجرام</span>
              <input type="url" dir="ltr" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
            </label>

            <label className="col__field col__field--full">
              <span>العنوان</span>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="شارع..." />
            </label>

            <label className="col__field col__field--full">
              <span>🕐 ساعات العمل</span>
              <input type="text" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="يومياً من..." />
            </label>

            <label className="col__field col__field--full">
              <span><IcScroll /> وصف قصير</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </label>
          </div>

          {/* Reviews Input */}
          <div className="col__reviews-box">
            <div className="col__reviews-head">
              <label className="col__label">التقييمات (اختياري)</label>
              <span className="col__reviews-hint">
                كل سطر: <code>اسم | 5 | تعليق</code>
              </span>
            </div>
            <textarea
              className="col__reviews-input"
              rows={5}
              placeholder={'مثال:\nمحمد أحمد | 5 | أفضل مشويات في شبين\nسارة محمود | 5 | الطعم رائع والأسعار مناسبة'}
              value={rawReviews}
              onChange={(e) => setRawReviews(e.target.value)}
            />
            {reviewsPreview.length > 0 && (
              <div className="col__reviews-preview">
                <span>هيتم إضافة {reviewsPreview.length} تقييم:</span>
                <ul>
                  {reviewsPreview.slice(0, 5).map((r, i) => (
                    <li key={i}>
                      <strong>{r.author}</strong>
                      <span className="col__stars">{''.repeat(r.rating)}</span>
                      <span>{r.comment.slice(0, 60)}</span>
                    </li>
                  ))}
                </ul>
                {reviewsPreview.length > 5 && <span>+ {reviewsPreview.length - 5} تاني</span>}
              </div>
            )}
          </div>

          {error && <div className="col__error">{error}</div>}
          {success && <div className="col__success">{success}</div>}

          <div className="col__actions">
            <button
              type="button"
              className="col__btn col__btn--primary col__btn--lg"
              onClick={save}
              disabled={saving || !name.trim()}
            >
              {saving ? '...' : 'حفظ'}
            </button>
            <button
              type="button"
              className="col__btn"
              onClick={() => { setParsed(null); setUrl(''); setName(''); setPhone(''); setWhatsapp(''); setFacebook(''); setWebsite(''); setInstagram(''); setDescription(''); setAddress(''); setHours(''); setRawReviews('') }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Recent */}
      <div className="col__recent">
        <h2 className="col__recent-title">آخر 15 نشاط مضاف</h2>
        {recent.length === 0 ? (
          <p className="col__recent-empty">لسه مفيش أنشطة</p>
        ) : (
          <div className="col__recent-list">
            {recent.map((b) => (
              <Link key={b.id} href={'/businesses/' + b.slug} target="_blank" className="col__recent-item">
                <div>
                  <strong>{b.name}</strong>
                  <span>{b.area} • {b.business_type}</span>
                </div>
                <span className="col__recent-arrow">↗</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
