'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import './collect.css'

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

type Confidence = Record<string, number>

const AREAS = [
  'شبين القناطر', 'القلج', 'أبو زعبل', 'الجبل الأصفر',
  'الحصافة', 'الزهويين', 'الشوبك', 'كفر الشوبك',
  'الأحراز', 'تل بني تميم', 'طحا', 'كفر طحا',
  'نوى', 'منشأة الكرام', 'كفر بطا', 'الجعافرة',
  'الدير', 'أم زين', 'المنشية', 'أخرى'
]

const TYPES = [
  { key: 'restaurant', label: 'مطعم', icon: '🍽️' },
  { key: 'pharmacy', label: 'صيدلية', icon: '💊' },
  { key: 'supermarket', label: 'ماركت', icon: '🛒' },
  { key: 'delivery_office', label: 'توصيل', icon: '📦' },
] as const

const FOOD_OPTIONS = [
  { key: 'pizza', label: 'بيتزا', emoji: '🍕' },
  { key: 'crepe', label: 'كريب', emoji: '🥞' },
  { key: 'grill', label: 'مشويات', emoji: '🍖' },
  { key: 'liver', label: 'كبدة', emoji: '🍗' },
  { key: 'koshary', label: 'كشري', emoji: '🍲' },
  { key: 'syrian', label: 'سوري', emoji: '🌯' },
  { key: 'shawarma', label: 'شاورما', emoji: '🌯' },
  { key: 'sandwiches', label: 'سندوتشات', emoji: '🥪' },
  { key: 'taameya', label: 'طعمية', emoji: '🧆' },
  { key: 'foul', label: 'فول', emoji: '🫘' },
  { key: 'fish', label: 'أسماك', emoji: '🐟' },
  { key: 'seafood', label: 'بحري', emoji: '🦐' },
  { key: 'burger', label: 'برجر', emoji: '🍔' },
  { key: 'hawawshi', label: 'حواوشي', emoji: '🥩' },
  { key: 'feteer', label: 'فطير', emoji: '🥧' },
  { key: 'pasta', label: 'مكرونة', emoji: '🍝' },
  { key: 'chicken', label: 'دجاج', emoji: '🍗' },
  { key: 'rice', label: 'رز', emoji: '🍚' },
  { key: 'molokhia', label: 'ملوخية', emoji: '🌿' },
  { key: 'juices', label: 'عصائر', emoji: '🧃' },
  { key: 'desserts', label: 'حلويات', emoji: '🍰' },
  { key: 'coffee', label: 'قهوة', emoji: '☕' },
]

// دالة اكتشاف المنصة
function detectPlatform(url: string): { key: string; label: string; color: string } | null {
  if (!url) return null
  if (/facebook\.com|fb\.com/i.test(url)) return { key: 'fb', label: 'فيسبوك', color: '#1877f2' }
  if (/instagram\.com/i.test(url)) return { key: 'ig', label: 'إنستجرام', color: '#e1306c' }
  if (/google\./i.test(url)) return { key: 'google', label: 'جوجل', color: '#4285f4' }
  if (/tiktok\.com/i.test(url)) return { key: 'tt', label: 'تيك توك', color: '#000' }
  return { key: 'web', label: 'ويب', color: '#a855f7' }
}

export default function CollectClient({ recent }: { recent: Recent[] }) {
  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [parsed, setParsed] = useState<ExtractedData | null>(null)
  const [confidence, setConfidence] = useState<Confidence>({})

  // Editable fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [area, setArea] = useState('شبين القناطر')
  const [businessType, setBusinessType] = useState<string>('restaurant')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [foodCats, setFoodCats] = useState<string[]>([])

  const platform = useMemo(() => detectPlatform(url), [url])

  // جودة التحليل
  const quality = useMemo(() => {
    if (!confidence || Object.keys(confidence).length === 0) return 0
    const vals = Object.values(confidence)
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
  }, [confidence])

  function slugify(s: string): string {
    return s
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
      .slice(0, 60)
  }

  async function parse() {
    setError(null); setSuccess(null); setParsed(null); setConfidence({})
    if (!url.trim()) { setError('الصق رابط'); return }
    setParsing(true)
    try {
      const res = await fetch('/api/admin/collect/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!data.ok) {
        const errMap: Record<string, string> = {
          fetch_failed: 'مقدرناش نوصل للصفحة — تأكد إنها عامة',
          bad_url: 'الرابط مش صحيح',
          rate_limit: 'استنى شوية وحاول تاني',
          forbidden: 'مش مسموح',
        }
        setError(errMap[data.error] ?? 'حصلت مشكلة')
        return
      }
      const d = data.data as ExtractedData
      setParsed(d)
      setConfidence(data.confidence ?? {})
      setName(d.name ?? '')
      setSlug(slugify(d.name ?? ''))
      setPhone(d.phones?.[0] ?? '')
      setWhatsapp(d.whatsapp ?? d.phones?.[0] ?? '')
      setAddress(d.address ?? '')
      setDescription(d.description ?? '')
      setBusinessType(d.type ?? 'restaurant')
    } catch {
      setError('حصلت مشكلة في الاتصال')
    } finally {
      setParsing(false)
    }
  }

  async function save() {
    if (!name.trim()) { setError('الاسم مطلوب'); return }
    if (!slug.trim()) { setError('الـ slug مطلوب'); return }
    setSaving(true); setError(null); setSuccess(null)
    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          business_type: businessType,
          area,
          city: 'شبين القناطر',
          description: description.trim() || null,
          address_text: address.trim() || null,
          food_categories: foodCats,
          contacts: [
            phone ? { method_type: 'phone', value: phone.trim(), is_primary: true } : null,
            whatsapp ? { method_type: 'whatsapp', value: whatsapp.trim(), is_primary: !phone } : null,
          ].filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setSuccess(`تم حفظ "${name}" — جاري التحويل...`)
        setTimeout(() => { window.location.href = `/admin/businesses/${slug}/edit` }, 1200)
      } else {
        setError(data.error === 'duplicate' ? 'الـ slug مستخدم بالفعل' : 'فشل الحفظ')
      }
    } catch {
      setError('حصلت مشكلة')
    } finally {
      setSaving(false)
    }
  }

  function toggleFood(k: string) {
    setFoodCats((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : prev.length < 5 ? [...prev, k] : prev)
  }

  return (
    <div className="collect">
      {/* ═══ HEADER ═══ */}
      <header className="collect__hero">
        <div className="collect__hero-glow" aria-hidden />
        <span className="collect__kicker">EAH ADMIN · 2026</span>
        <h1 className="collect__title">جمع الأنشطة</h1>
        <p className="collect__sub">الصق رابط فيسبوك/إنستجرام/جوجل — وسحب بيانات النشاط تلقائياً</p>
      </header>

      {/* ═══ INPUT ═══ */}
      <section className="collect__input-wrap">
        <div className={`collect__input ${platform ? 'has-platform' : ''}`}>
          <span className="collect__input-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </span>
          <input
            type="url"
            className="collect__input-field"
            placeholder="https://facebook.com/... أو أي رابط"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            dir="ltr"
            onKeyDown={(e) => e.key === 'Enter' && parse()}
          />
          {platform && (
            <span className="collect__platform" style={{ '--pc': platform.color } as any}>
              {platform.label}
            </span>
          )}
          <button
            type="button"
            className="collect__parse-btn"
            onClick={parse}
            disabled={parsing || !url.trim()}
          >
            {parsing ? (
              <>
                <span className="collect__spinner" />
                <span>بتحليل...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>حلّل</span>
              </>
            )}
          </button>
        </div>

        {error && <div className="collect__msg collect__msg--error">⚠️ {error}</div>}
        {success && <div className="collect__msg collect__msg--ok">✓ {success}</div>}
      </section>

      {/* ═══ SKELETON ═══ */}
      {parsing && (
        <section className="collect__skeleton">
          <div className="collect__skeleton-head">
            <span className="collect__sk-circle" />
            <div>
              <span className="collect__sk-line" style={{ width: 200 }} />
              <span className="collect__sk-line" style={{ width: 120, height: 10 }} />
            </div>
          </div>
          <span className="collect__sk-block" />
          <span className="collect__sk-block" style={{ height: 100 }} />
        </section>
      )}

      {/* ═══ RESULTS ═══ */}
      {parsed && !parsing && (
        <>
          {/* Quality bar */}
          <section className="collect__quality">
            <div className="collect__quality-head">
              <span className="collect__quality-label">جودة البيانات</span>
              <span className={`collect__quality-num collect__quality-num--${quality >= 70 ? 'high' : quality >= 40 ? 'mid' : 'low'}`}>
                {quality}%
              </span>
            </div>
            <div className="collect__quality-bar">
              <div
                className={`collect__quality-fill collect__quality-fill--${quality >= 70 ? 'high' : quality >= 40 ? 'mid' : 'low'}`}
                style={{ width: `${quality}%` }}
              />
            </div>
          </section>

          <div className="collect__layout">
            {/* ═══ FORM ═══ */}
            <section className="collect__form">
              <div className="collect__section">
                <h3 className="collect__section-title">المعلومات الأساسية</h3>

                <label className="collect__field">
                  <span className="collect__label">
                    اسم النشاط *
                    {confidence.name != null && <ConfPill value={confidence.name} />}
                  </span>
                  <input className="collect__input" value={name} onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)) }} />
                </label>

                <label className="collect__field">
                  <span className="collect__label">الرابط (slug) *</span>
                  <input className="collect__input" dir="ltr" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
                  <span className="collect__hint">eah-sq.vercel.app/businesses/{slug || '...'}</span>
                </label>

                <div className="collect__row">
                  <label className="collect__field">
                    <span className="collect__label">
                      النوع *
                      {confidence.type != null && <ConfPill value={confidence.type} />}
                    </span>
                    <div className="collect__types">
                      {TYPES.map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          className={`collect__type ${businessType === t.key ? 'is-active' : ''}`}
                          onClick={() => setBusinessType(t.key)}
                        >
                          <span>{t.icon}</span>
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </label>
                </div>

                <div className="collect__row">
                  <label className="collect__field">
                    <span className="collect__label">المنطقة *</span>
                    <select className="collect__input" value={area} onChange={(e) => setArea(e.target.value)}>
                      {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="collect__section">
                <h3 className="collect__section-title">التواصل</h3>

                <div className="collect__row">
                  <label className="collect__field">
                    <span className="collect__label">
                      موبايل
                      {confidence.phone != null && <ConfPill value={confidence.phone} />}
                    </span>
                    <input className="collect__input" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" />
                  </label>

                  <label className="collect__field">
                    <span className="collect__label">
                      واتساب
                      {confidence.whatsapp != null && <ConfPill value={confidence.whatsapp} />}
                    </span>
                    <input className="collect__input" dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="201xxxxxxxxx" />
                  </label>
                </div>

                <label className="collect__field">
                  <span className="collect__label">
                    العنوان
                    {confidence.address != null && <ConfPill value={confidence.address} />}
                  </span>
                  <input className="collect__input" value={address} onChange={(e) => setAddress(e.target.value)} />
                </label>
              </div>

              <div className="collect__section">
                <h3 className="collect__section-title">الوصف</h3>
                <label className="collect__field">
                  <span className="collect__label">
                    وصف قصير
                    {confidence.description != null && <ConfPill value={confidence.description} />}
                  </span>
                  <textarea className="collect__input collect__input--area" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} />
                  <span className="collect__hint">{description.length}/500</span>
                </label>
              </div>

              {businessType === 'restaurant' && (
                <div className="collect__section">
                  <h3 className="collect__section-title">
                    تصنيفات الأكل <span className="collect__count">({foodCats.length}/5)</span>
                  </h3>
                  <div className="collect__food">
                    {FOOD_OPTIONS.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        className={`collect__food-chip ${foodCats.includes(f.key) ? 'is-active' : ''}`}
                        onClick={() => toggleFood(f.key)}
                        disabled={!foodCats.includes(f.key) && foodCats.length >= 5}
                      >
                        {f.emoji} {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ Actions ═══ */}
              <div className="collect__actions">
                <button type="button" className="collect__btn collect__btn--ghost" onClick={() => { setParsed(null); setUrl('') }}>
                  إلغاء
                </button>
                <button type="button" className="collect__btn collect__btn--primary" onClick={save} disabled={saving}>
                  {saving ? 'جاري الحفظ...' : 'احفظ النشاط'}
                </button>
              </div>
            </section>

            {/* ═══ PREVIEW ═══ */}
            <aside className="collect__preview">
              {parsed.image && (
                <div className="collect__preview-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={parsed.image} alt={name} />
                  <span className="collect__preview-source">
                    من {platform?.label ?? 'ويب'}
                  </span>
                </div>
              )}

              <div className="collect__preview-body">
                <span className="collect__preview-type">{TYPES.find((t) => t.key === businessType)?.icon} {TYPES.find((t) => t.key === businessType)?.label}</span>
                <h3 className="collect__preview-name">{name || '—'}</h3>
                <p className="collect__preview-area">📍 {area}</p>

                {parsed.hours && (
                  <p className="collect__preview-line">🕒 {parsed.hours}</p>
                )}

                {parsed.facebook && (
                  <a href={parsed.facebook} target="_blank" rel="noreferrer" className="collect__preview-link">
                    فيسبوك ↗
                  </a>
                )}
                {parsed.instagram && (
                  <a href={parsed.instagram} target="_blank" rel="noreferrer" className="collect__preview-link">
                    إنستجرام ↗
                  </a>
                )}

                <a href={url} target="_blank" rel="noreferrer" className="collect__preview-link collect__preview-link--src">
                  المصدر ↗
                </a>
              </div>
            </aside>
          </div>
        </>
      )}

      {/* ═══ RECENT ═══ */}
      {recent.length > 0 && !parsed && (
        <section className="collect__recent">
          <h2 className="collect__recent-title">آخر 15 نشاط مضافة</h2>
          <ul className="collect__recent-list">
            {recent.map((r) => (
              <li key={r.id} className="collect__recent-item">
                <Link href={`/admin/businesses/${r.slug}/edit`} className="collect__recent-link">
                  <span className="collect__recent-icon">
                    {TYPES.find((t) => t.key === r.business_type)?.icon ?? '📍'}
                  </span>
                  <div className="collect__recent-body">
                    <div className="collect__recent-name">{r.name}</div>
                    <div className="collect__recent-meta">
                      {TYPES.find((t) => t.key === r.business_type)?.label} · {r.area}
                    </div>
                  </div>
                  <span className="collect__recent-date">
                    {new Date(r.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function ConfPill({ value }: { value: number }) {
  const cls = value >= 80 ? 'high' : value >= 50 ? 'mid' : 'low'
  return <span className={`collect__conf collect__conf--${cls}`}>{value}%</span>
}
