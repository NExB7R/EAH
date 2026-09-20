'use client'
import { useActionState, useState, useMemo, useEffect } from 'react'
import FoodCategoriesPicker from '@/components/food-categories-picker'
import { createClient } from '@/lib/supabase-browser'
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
    logo?: string[]
    is_open?: boolean
    is_featured?: boolean
    is_published?: boolean
  }
}

const TYPES = [
  { value: 'restaurant', label: 'مطعم' },
  { value: 'pharmacy', label: 'صيدلية' },
  { value: 'supermarket', label: 'سوبرماركت' },
  { value: 'delivery_office', label: 'توصيل' },
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
  const [foodCats, setFoodCats] = useState<string[]>([])

  useEffect(() => {
    if (!businessId) return
    const supabase = createClient()
    void (async () => {
      const { data } = await supabase
        .from('business_food_categories')
        .select('category_key')
        .eq('business_id', businessId)
      if (data) setFoodCats(data.map((r: any) => r.category_key))
    })()
  }, [businessId])

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slugTouched && mode === 'create') setSlug(slugify(v))
  }

  const err = (f: string) => state.errors?.[f]?.[0]
  const folder = useMemo(
    () => (businessId ? `biz-${businessId}` : `new-${Date.now()}`),
    [businessId]
  )

  const coverArr = initial?.cover_image_url ? [initial.cover_image_url] : []

  return (
    <form action={formAction} className="admin-form">
      {/* ═══ 1. الأساسيات ═══ */}
      <section className="admin-form__section">
        <h2 className="admin-form__section-title"><span className="admin-form__step">1</span> المعلومات الأساسية</h2>
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
        </div>

        <div className="admin-field" style={{ marginTop: 16 }}>
          <FoodCategoriesPicker value={foodCats} onChange={setFoodCats} max={5} />
        </div>
        <input type="hidden" name="food_categories_json" value={JSON.stringify(foodCats)} />
      </section>

      {/* ═══ 2. الوصف ═══ */}
      <section className="admin-form__section">
        <h2 className="admin-form__section-title"><span className="admin-form__step">2</span> الوصف والهوك</h2>
        <div className="admin-form__grid">
          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="hook">الهوك</label>
            <input id="hook" name="hook" className="admin-input" defaultValue={initial?.hook ?? ''} placeholder="أكل بيتي زي ما ماما بتعملو" maxLength={80} />
            <span className="admin-field__hint">جملة قصيرة تظهر عند hover. حتى 80 حرف.</span>
          </div>

          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="description">الوصف</label>
            <textarea id="description" name="description" className="admin-textarea" defaultValue={initial?.description ?? ''} placeholder="وصف تفصيلي" maxLength={500} />
          </div>
        </div>
      </section>

      {/* ═══ 3. الصور ═══ */}
      <section className="admin-form__section">
        <h2 className="admin-form__section-title"><span className="admin-form__step">3</span> صور النشاط</h2>

        <div className="admin-form__uploads">
          <div className="admin-upload-block">
            <ImageUploader
              bucket="business-media"
              folder={`${folder}/logo`}
              multiple={false}
              initial={initial?.logo ?? []}
              name="logo_json"
              label="◆ اللوجو"
              hint="مربع (1:1) — يظهر على الكارت + الهيرو"
              aspect="square"
            />
          </div>

          <div className="admin-upload-block">
            <ImageUploader
              bucket="business-media"
              folder={`${folder}/cover`}
              multiple={false}
              initial={coverArr}
              name="cover_json"
              label="▣ الغلاف"
              hint="عريض — يظهر في الهيرو فوق"
              aspect="wide"
            />
          </div>
        </div>

        <div className="admin-upload-block" style={{ marginTop: 20 }}>
          <ImageUploader
            bucket="business-media"
            folder={`${folder}/gallery`}
            multiple
            initial={initial?.gallery ?? []}
            name="gallery_json"
            label="❖ معرض الصور"
            hint="حتى 10 صور — تظهر في الكارد والهيرو"
            aspect="square"
          />
        </div>

        <div className="admin-upload-block" style={{ marginTop: 20 }}>
          <ImageUploader
            bucket="business-menu"
            folder={`${folder}/menu`}
            multiple
            initial={initial?.menu ?? []}
            name="menu_json"
            label="▤ المنيو"
            hint="صور صفحات المنيو — تظهر في قسم المنيو"
            aspect="wide"
          />
        </div>
      </section>

      {/* ═══ 4. التواصل ═══ */}
      <section className="admin-form__section">
        <h2 className="admin-form__section-title"><span className="admin-form__step">4</span> التواصل</h2>
        <ContactsEditor initial={initial?.contacts ?? []} />
      </section>

      {/* ═══ 5. أوقات العمل ═══ */}
      <section className="admin-form__section">
        <h2 className="admin-form__section-title"><span className="admin-form__step">5</span> أوقات العمل</h2>
        <WorkingHoursEditor initial={initial?.working_hours ?? {}} />
      </section>

      {/* ═══ 6. الموقع ═══ */}
      <section className="admin-form__section">
        <h2 className="admin-form__section-title"><span className="admin-form__step">6</span> الموقع</h2>
        <div className="admin-form__grid">
          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="address_text">العنوان التفصيلي</label>
            <input id="address_text" name="address_text" className="admin-input" defaultValue={initial?.address_text ?? ''} placeholder="شارع الجمهورية، أمام البنك" />
          </div>

          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="map_url">رابط الموقع على الخريطة</label>
            <input id="map_url" name="map_url" type="url" className="admin-input" dir="ltr" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://maps.app.goo.gl/xxxxx" />
            <span className="admin-field__hint">افتح Google Maps → اختار المكان → Share → Copy link → الصق الرابط هنا</span>
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="admin-map-preview">
                فتح الموقع على الخريطة ↗
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ═══ 7. الحالة ═══ */}
      <section className="admin-form__section">
        <h2 className="admin-form__section-title"><span className="admin-form__step">7</span> الحالة والظهور</h2>
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
          {pending ? 'جاري الحفظ...' : mode === 'create' ? 'إضافة المكان' : 'حفظ التعديلات'}
        </button>
      </div>

      {state.message && (
        <div className="admin-card" style={{ borderColor: state.ok ? 'rgba(192,132,252,0.4)' : 'rgba(248,113,113,0.4)', color: state.ok ? 'var(--eah-purple-soft)' : 'var(--eah-red)' }}>
          {state.message}
        </div>
      )}
    </form>
  )
}
