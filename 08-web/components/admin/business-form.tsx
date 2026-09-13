'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'

type ActionState = { ok: boolean; message?: string; errors?: Record<string, string[]> }

type Props = {
  mode: 'create' | 'edit'
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  initial?: {
    name?: string
    slug?: string
    business_type?: string
    area?: string
    city?: string
    description?: string | null
    hook?: string | null
    address_text?: string | null
    is_open?: boolean
    is_featured?: boolean
    is_published?: boolean
    phone?: string
    whatsapp?: string
  }
}

const TYPES = [
  { value: 'restaurant', label: '🍽️ مطعم' },
  { value: 'pharmacy', label: '💊 صيدلية' },
  { value: 'supermarket', label: '🛒 سوبر ماركت' },
  { value: 'delivery_office', label: '🛵 توصيل' },
]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export default function BusinessForm({ mode, action, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, { ok: false })

  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slugTouched && mode === 'create') setSlug(slugify(v))
  }

  const err = (f: string) => state.errors?.[f]?.[0]

  return (
    <form action={formAction} className="admin-form">
      <section className="admin-form__section">
        <h2 className="admin-form__section-title">المعلومات الأساسية</h2>
        <div className="admin-form__grid">
          <div className="admin-field">
            <label className="admin-field__label" htmlFor="name">اسم المكان *</label>
            <input id="name" name="name" className="admin-input" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="مثلاً: مطبخ البلد" required />
            {err('name') && <span className="admin-field__hint" style={{ color: 'var(--eah-red)' }}>{err('name')}</span>}
          </div>

          <div className="admin-field">
            <label className="admin-field__label" htmlFor="slug">الـ slug (الرابط) *</label>
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
            {err('area') && <span className="admin-field__hint" style={{ color: 'var(--eah-red)' }}>{err('area')}</span>}
          </div>

          <div className="admin-field">
            <label className="admin-field__label" htmlFor="city">المدينة</label>
            <input id="city" name="city" className="admin-input" defaultValue={initial?.city ?? 'شبين القناطر'} />
          </div>

          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="address_text">العنوان التفصيلي</label>
            <input id="address_text" name="address_text" className="admin-input" defaultValue={initial?.address_text ?? ''} placeholder="شارع الجمهورية، أمام البنك" />
          </div>
        </div>
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">الوصف والهوك</h2>
        <div className="admin-form__grid">
          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="hook">الهوك (جملة قصيرة للسلايدر) ⭐</label>
            <input id="hook" name="hook" className="admin-input" defaultValue={initial?.hook ?? ''} placeholder="أكل بيتي زي ما ماما بتعملو" maxLength={80} />
            <span className="admin-field__hint">جملة واحدة قوية تظهر عند hover على الكارد. حتى 80 حرف.</span>
          </div>

          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="description">الوصف</label>
            <textarea id="description" name="description" className="admin-textarea" defaultValue={initial?.description ?? ''} placeholder="وصف تفصيلي — يظهر في صفحة المكان" maxLength={500} />
          </div>
        </div>
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">التواصل</h2>
        <div className="admin-form__grid">
          <div className="admin-field">
            <label className="admin-field__label" htmlFor="phone">رقم الفون</label>
            <input id="phone" name="phone" className="admin-input" dir="ltr" defaultValue={initial?.phone ?? ''} placeholder="01012345678" />
          </div>
          <div className="admin-field">
            <label className="admin-field__label" htmlFor="whatsapp">رقم واتساب</label>
            <input id="whatsapp" name="whatsapp" className="admin-input" dir="ltr" defaultValue={initial?.whatsapp ?? ''} placeholder="201012345678" />
          </div>
        </div>
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
