'use client'
import { useState } from 'react'
import type { Section, SectionType } from './types'
import './inspector.css'

type Props = {
  section: Section
  onChange: (key: string, value: unknown) => void
  onClose: () => void
}

type Tab = 'content' | 'style' | 'advanced'

const LABEL: Record<SectionType, string> = {
  hero: 'Hero',
  featured: 'المميز',
  trending: 'الترند',
  offers: 'العروض',
  categories: 'التصنيفات',
  cta: 'CTA',
  banner: 'بانر',
  footer: 'الفوتر',
  spacer: 'مساحة فارغة',
  ad: 'مساحة إعلان',
}

const FONTS = ['Cairo', 'Cairo Play', 'Tajawal', 'IBM Plex Sans Arabic', 'Almarai']
const ALIGN = ['right', 'center', 'left'] as const

export default function Inspector({ section, onChange, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('content')
  const p = section.props as Record<string, unknown>
  const get = (k: string) => (p[k] as string | number | undefined) ?? ''

  return (
    <aside className="ins">
      <header className="ins__head">
        <div>
          <span className="ins__kicker">تعديل</span>
          <h3 className="ins__title">{LABEL[section.type]}</h3>
        </div>
        <button className="ins__close" onClick={onClose} aria-label="close">x</button>
      </header>

      <div className="ins__tabs">
        {(['content', 'style', 'advanced'] as Tab[]).map((t) => (
          <button
            key={t}
            className={'ins__tab' + (tab === t ? ' is-active' : '')}
            onClick={() => setTab(t)}
          >
            {t === 'content' ? 'المحتوى' : t === 'style' ? 'المظهر' : 'متقدم'}
          </button>
        ))}
      </div>

      <div className="ins__body">
        {tab === 'content' && (
          <>
            <Field label="العنوان">
              <input
                className="ins__input"
                value={String(get('title'))}
                onChange={(e) => onChange('title', e.target.value)}
              />
            </Field>
            {'subtitle' in p && (
              <Field label="الوصف">
                <textarea
                  className="ins__input ins__input--area"
                  rows={2}
                  value={String(get('subtitle'))}
                  onChange={(e) => onChange('subtitle', e.target.value)}
                />
              </Field>
            )}
            {'ctaText' in p && (
              <Field label="نص الزر">
                <input
                  className="ins__input"
                  value={String(get('ctaText'))}
                  onChange={(e) => onChange('ctaText', e.target.value)}
                />
              </Field>
            )}
            {'ctaHref' in p && (
              <Field label="رابط الزر">
                <input
                  className="ins__input"
                  dir="ltr"
                  value={String(get('ctaHref'))}
                  onChange={(e) => onChange('ctaHref', e.target.value)}
                />
              </Field>
            )}
            {'count' in p && (
              <Field label={'عدد العناصر: ' + get('count')}>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={Number(get('count') || 6)}
                  onChange={(e) => onChange('count', Number(e.target.value))}
                  className="ins__range"
                />
              </Field>
            )}
            {'text' in p && (
              <Field label="النص">
                <input
                  className="ins__input"
                  value={String(get('text'))}
                  onChange={(e) => onChange('text', e.target.value)}
                />
              </Field>
            )}
          </>
        )}

        {tab === 'style' && (
          <>
            <Field label="محاذاة">
              <div className="ins__align">
                {ALIGN.map((a) => (
                  <button
                    key={a}
                    className={'ins__align-btn' + (get('align') === a ? ' is-active' : '')}
                    onClick={() => onChange('align', a)}
                    type="button"
                  >
                    {a === 'right' ? '⬅' : a === 'center' ? '⬌' : '➡'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="اللون الأساسي">
              <div className="ins__color-row">
                <input
                  type="color"
                  className="ins__color"
                  value={String(get('accent') || '#A855F7')}
                  onChange={(e) => onChange('accent', e.target.value)}
                />
                <input
                  className="ins__input"
                  dir="ltr"
                  value={String(get('accent') || '#A855F7')}
                  onChange={(e) => onChange('accent', e.target.value)}
                />
              </div>
            </Field>
            <Field label="الخط">
              <select
                className="ins__select"
                value={String(get('font') || 'Cairo')}
                onChange={(e) => onChange('font', e.target.value)}
              >
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label={'المسافة الداخلية (' + (get('padding') || 32) + 'px)'}>
              <input
                type="range"
                min={0}
                max={120}
                value={Number(get('padding') || 32)}
                onChange={(e) => onChange('padding', Number(e.target.value))}
                className="ins__range"
              />
            </Field>
            <Field label={'المسافة الخارجية (' + (get('margin') || 0) + 'px)'}>
              <input
                type="range"
                min={0}
                max={80}
                value={Number(get('margin') || 0)}
                onChange={(e) => onChange('margin', Number(e.target.value))}
                className="ins__range"
              />
            </Field>
          </>
        )}

        {tab === 'advanced' && (
          <>
            <Field label="ID">
              <input className="ins__input" dir="ltr" value={section.id} readOnly />
            </Field>
            <Field label="النوع">
              <input className="ins__input" value={section.type} readOnly />
            </Field>
            <div className="ins__note">
              التغييرات بتتحفظ تلقائياً كل 2 ثانية.
              اضغط Cmd+Z للتراجع.
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ins__field">
      <label className="ins__label">{label}</label>
      {children}
    </div>
  )
}
