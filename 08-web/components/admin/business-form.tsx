'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import ImageUploader from './image-uploader'
import ContactsEditor, { type Contact } from './contacts-editor'
import WorkingHoursEditor, { type WorkingHours } from './working-hours-editor'

type ActionState = { ok: boolean; message?: string; errors?: Record<string, string[]> }

type Props = {
  mode: 'create' | 'edit'
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  businessId?: string
  initial?: {
    name?: string
    slug?: string
    business_type?: string
    area?: string
    city?: string
    description?: string | null
    hook?: string | null
    address_text?: string | null
    map_url?: string | null
    cover_image_url?: string | null
    working_hours?: WorkingHours
    contacts?: Contact[]
    gallery?: string[]
    menu?: string[]
    is_open?: boolean
    is_featured?: boolean
    is_published?: boolean
  }
}

const TYPES = [
  { value: 'restaurant', label: '🍽️ مطعم' },
  { value: 'pharmacy', label: '💊 صيدلية' },
  { value: 'supermarket', label: '🛒 سوبر ماركت' },
  { value: 'delivery_office', label: '🛵 توصيل' },
]

function slugify(name: string): string {
  return name.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export default function BusinessForm({ mode, action, initial, businessId }: Props) {
  const [state, formAction, pending] = useActionState(action, { ok: false })
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [mapUrl, setMapUrl] = useState(initial?.map_url ?? '')

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slugTouched && mode === 'create') setSlug(slugify(v))
  }

  const err = (f: string) => state.errors?.[f]?.[0]
  const folder = businessId ? `biz-${businessId}` : `new-${Date.now()}`

  return (
    <form action={formAction} className="admin-form">
      <section className="admin-form__section">
        <h2 className="admin-form__section-title">المعلومات الأساسية</h2>
        <div className="admin-form__grid">
          <div className="admin-field">
            <label className="admin-field__label" htmlFor="name">اسم المكان *</label>
            <input id="name" name="name" className="admin-input" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="مطبخ البلد" required />
            {err('name') && <span className="admin-field__hint" style={{ color: 'var(--eah-red)' }}>{err('name')}</span>}
          </div>

          <div className="admin-field">
            <label className="admin-field__label" htmlFor="slug">الـ slug *</label>
            <input id="slug" name="slug" className="admin-input" dir="ltr" value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }} placeholder="matbakh-elbalad" required />
            <span className="admin-field__hint">/businesses/{slug || '...'}</span>
            {err('slug') && <span className="admin-field__hint" style={{ color: 'var(--eah-red)' }}>{err('slug')}</span>}
          </div>

          <div className="admin-field">
            <label className="admin-field__label" htmlFor="business_type">النوع *</label>
            <select id="business_type" name="business_type" className="admin-select" defaultValue={initial?.business_type ?? 'restaurant'} required>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-field__label" htmlFor="area">المنطقة *</label>
            <input id="area" name="area" className="admin-input" defaultValue={initial?.area ?? ''} placeholder="شبين القناطر" required />
          </div>

          <div className="admin-field">
            <label className="admin-field__label" htmlFor="city">المدينة</label>
            <input id="city" name="city" className="admin-input" defaultValue={initial?.city ?? 'شبين القناطر'} />
          </div>

          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="address_text">العنوان التفصيلي</label>
            <input id="address_text" name="address_text" className="admin-input" defaultValue={initial?.address_text ?? ''} placeholder="شارع الجمهورية، أمام البنك" />
          </div>

          {/* Map URL */}
          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="map_url">
              📍 رابط الموقع على الخريطة
            </label>
            <input
              id="map_url"
              name="map_url"
              type="url"
              className="admin-input"
              dir="ltr"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/xxxxx"
            />
            <span className="admin-field__hint">
              افتح Google Maps → اختار المكان → Share → Copy link → الصق الرابط هنا
            </span>
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-map-preview"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                فتح الموقع على الخريطة ↗
              </a>
            )}
            {err('map_url') && <span className="admin-field__hint" style={{ color: 'var(--eah-red)' }}>{err('map_url')}</span>}
          </div>
        </div>
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">الوصف والهوك</h2>
        <div className="admin-form__grid">
          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="hook">الهوك ⭐</label>
            <input id="hook" name="hook" className="admin-input" defaultValue={initial?.hook ?? ''} placeholder="أكل بيتي زي ما ماما بتعملو" maxLength={80} />
            <span className="admin-field__hint">جملة قصيرة تظهر عند hover. حتى 80 حرف.</span>
          </div>

          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="description">الوصف</label>
            <textarea id="description" name="description" className="admin-textarea" defaultValue={initial?.description ?? ''} placeholder="وصف تفصيلي" maxLength={500} />
          </div>
        </div>
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">صور المكان</h2>
        <ImageUploader
          bucket="business-media"
          folder={`${folder}/gallery`}
          multiple
          initial={initial?.gallery ?? []}
          name="gallery_json"
          label="معرض الصور (الغلاف أول صورة)"
          hint="JPG/PNG/WebP · حتى 5MB"
        />
        <ImageUploader
          bucket="business-menu"
          folder={`${folder}/menu`}
          multiple
          initial={initial?.menu ?? []}
          name="menu_json"
          label="صور المنيو"
          hint="صفحات المنيو"
        />
        <input type="hidden" name="cover_image_url" value={initial?.cover_image_url ?? ''} />
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">التواصل</h2>
        <ContactsEditor initial={initial?.contacts ?? []} />
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">أوقات العمل</h2>
        <WorkingHoursEditor initial={initial?.working_hours ?? {}} />
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">الحالة والظهور</h2>
        <div className="admin-form__grid">
          <label className="admin-toggle">
            <input type="checkbox" name="is_published" defaultChecked={initial?.is_published ?? true} />
            <span className="admin-toggle__track"><span className="admin-toggle__thumb" /></span>
            <span className="admin-toggle__label">منشور على الموقع</span>
          </label>

          <label className="admin-toggle">
            <input type="checkbox" name="is_open" defaultChecked={initial?.is_open ?? true} />
            <span className="admin-toggle__track"><span className="admin-toggle__thumb" /></span>
            <span className="admin-toggle__label">مفتوح دلوقتي</span>
          </label>

          <label className="admin-toggle">
            <input type="checkbox" name="is_featured" defaultChecked={initial?.is_featured ?? false} />
            <span className="admin-toggle__track"><span className="admin-toggle__thumb" /></span>
            <span className="admin-toggle__label">مميز (Featured)</span>
          </label>
        </div>
      </section>

      <div className="admin-form__foot">
        <Link href="/admin/businesses" className="admin-btn admin-btn--ghost">إلغاء</Link>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
          {pending ? 'جاري الحفظ...' : mode === 'create' ? '➕ إضافة المكان' : '💾 حفظ التعديلات'}
        </button>
      </div>

      {state.message && (
        <div className="admin-card" style={{ borderColor: state.ok ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)', color: state.ok ? 'var(--eah-green)' : 'var(--eah-red)' }}>
          {state.message}
        </div>
      )}
    </form>
  )
}
