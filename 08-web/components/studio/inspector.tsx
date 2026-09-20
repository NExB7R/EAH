'use client'
import type { Section, SectionType } from './types'
import './inspector.css'

type Props = {
  section: Section
  onChange: (key: string, value: unknown) => void
  onClose: () => void
}

type FieldDef =
  | { key: string; label: string; type: 'text' | 'textarea' | 'color' | 'range'; min?: number; max?: number; placeholder?: string }

const F: Record<SectionType, FieldDef[]> = {
  hero: [
    { key: 'title', label: 'العنوان الرئيسي', type: 'text' },
    { key: 'subtitle', label: 'الوصف', type: 'textarea' },
    { key: 'ctaText', label: 'نص الزر', type: 'text' },
    { key: 'ctaHref', label: 'رابط الزر', type: 'text', placeholder: '/explore' },
    { key: 'padding', label: 'المسافة الداخلية', type: 'range', min: 0, max: 120 },
  ],
  featured: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'الوصف', type: 'textarea' },
    { key: 'count', label: 'عدد العناصر', type: 'range', min: 2, max: 12 },
  ],
  trending: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'الوصف', type: 'textarea' },
    { key: 'count', label: 'عدد العناصر', type: 'range', min: 2, max: 12 },
  ],
  new: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'الوصف', type: 'textarea' },
    { key: 'count', label: 'عدد العناصر', type: 'range', min: 2, max: 12 },
  ],
  offers: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'الوصف', type: 'textarea' },
    { key: 'count', label: 'عدد العناصر', type: 'range', min: 2, max: 12 },
  ],
  categories: [
    { key: 'title', label: 'العنوان', type: 'text' },
  ],
  cta: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'الوصف', type: 'textarea' },
    { key: 'ctaText', label: 'نص الزر', type: 'text' },
    { key: 'ctaHref', label: 'رابط الزر', type: 'text' },
  ],
  banner: [
    { key: 'text', label: 'النص', type: 'text' },
    { key: 'color', label: 'اللون', type: 'color' },
  ],
  footer: [
    { key: 'tagline', label: 'الشعار', type: 'text' },
    { key: 'copyright', label: 'حقوق النشر', type: 'text' },
  ],
  spacer: [
    { key: 'height', label: 'الارتفاع', type: 'range', min: 8, max: 200 },
  ],
  ad: [
    { key: 'slotId', label: 'Slot ID', type: 'text', placeholder: 'home_banner' },
    { key: 'label', label: 'اسم المساحة', type: 'text' },
    { key: 'height', label: 'الارتفاع', type: 'range', min: 60, max: 400 },
  ],
}

const LABEL: Record<SectionType, string> = {
  hero: 'Hero — القسم الرئيسي',
  featured: 'المميزين',
  trending: 'الترند',
  new: 'الجديد',
  offers: 'العروض',
  categories: 'التصنيفات',
  cta: 'دعوة للتسجيل',
  banner: 'بانر',
  footer: 'الفوتر',
  spacer: 'مساحة فارغة',
  ad: 'مساحة إعلان',
}

export default function Inspector({ section, onChange, onClose }: Props) {
  const p = section.props as Record<string, unknown>
  const fields = F[section.type]

  return (
    <aside className="ins">
      <header className="ins__head">
        <div>
          <span className="ins__kicker">تعديل قسم</span>
          <h3 className="ins__title">{LABEL[section.type]}</h3>
        </div>
        <button className="ins__close" onClick={onClose} aria-label="إغلاق">×</button>
      </header>

      <div className="ins__hint">
        💡 اضغط على أي نص في المعاينة واكتب — بيتحفظ تلقائياً
      </div>

      <div className="ins__body">
        {fields.map((f) => {
          const value = p[f.key]
          return (
            <div className="ins__field" key={f.key}>
              <label className="ins__label">{f.label}</label>
              {f.type === 'text' && (
                <input
                  className="ins__input"
                  dir={f.key === 'ctaHref' || f.key === 'slotId' ? 'ltr' : 'auto'}
                  value={String(value ?? '')}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(f.key, e.target.value)}
                />
              )}
              {f.type === 'textarea' && (
                <textarea
                  className="ins__input ins__input--area"
                  rows={3}
                  value={String(value ?? '')}
                  onChange={(e) => onChange(f.key, e.target.value)}
                />
              )}
              {f.type === 'color' && (
                <div className="ins__color-row">
                  <input
                    type="color"
                    className="ins__color"
                    value={String(value ?? '#A855F7')}
                    onChange={(e) => onChange(f.key, e.target.value)}
                  />
                  <input
                    className="ins__input"
                    dir="ltr"
                    value={String(value ?? '#A855F7')}
                    onChange={(e) => onChange(f.key, e.target.value)}
                  />
                </div>
              )}
              {f.type === 'range' && (
                <div className="ins__range-wrap">
                  <input
                    type="range"
                    className="ins__range"
                    min={f.min ?? 0}
                    max={f.max ?? 100}
                    value={Number(value ?? f.min ?? 0)}
                    onChange={(e) => onChange(f.key, Number(e.target.value))}
                  />
                  <span className="ins__range-val">{Number(value ?? f.min ?? 0)}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
