'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import ImageUploader from './image-uploader'

type ActionState = { ok: boolean; message?: string; errors?: Record<string, string[]> }

type Props = {
  mode: 'create' | 'edit'
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  businessSlug: string
  businessId: string
  initial?: {
    title?: string
    description?: string | null
    price?: number | null
    image_url?: string | null
    starts_at?: string | null
    ends_at?: string | null
    is_published?: boolean
  }
}

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

export default function OfferForm({ mode, action, businessSlug, businessId, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, { ok: false })
  const err = (f: string) => state.errors?.[f]?.[0]

  return (
    <form action={formAction} className="admin-form">
      <section className="admin-form__section">
        <h2 className="admin-form__section-title">تفاصيل العرض</h2>
        <div className="admin-form__grid">
          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="title">عنوان العرض *</label>
            <input id="title" name="title" className="admin-input" defaultValue={initial?.title ?? ''} placeholder="خصم 20% على الوجبات" required />
            {err('title') && <span className="admin-field__hint" style={{ color: 'var(--eah-red)' }}>{err('title')}</span>}
          </div>

          <div className="admin-field admin-field--full">
            <label className="admin-field__label" htmlFor="description">وصف العرض</label>
            <textarea id="description" name="description" className="admin-textarea" defaultValue={initial?.description ?? ''} placeholder="تفاصيل العرض..." maxLength={500} />
          </div>

          <div className="admin-field">
            <label className="admin-field__label" htmlFor="price">السعر الحالي</label>
            <input id="price" name="price" type="number" step="0.01" className="admin-input" dir="ltr" defaultValue={initial?.price ?? ''} placeholder="50" />
          </div>

          <div className="admin-field">
            <label className="admin-field__label" htmlFor="starts_at">يبدأ من</label>
            <input id="starts_at" name="starts_at" type="datetime-local" className="admin-input" dir="ltr" defaultValue={toLocalInput(initial?.starts_at)} />
          </div>

          <div className="admin-field">
            <label className="admin-field__label" htmlFor="ends_at">ينتهي في</label>
            <input id="ends_at" name="ends_at" type="datetime-local" className="admin-input" dir="ltr" defaultValue={toLocalInput(initial?.ends_at)} />
          </div>
        </div>
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">صورة العرض</h2>
        <ImageUploader
          bucket="business-offers"
          folder={`biz-${businessId}/offers`}
          multiple={false}
          initial={initial?.image_url ? [initial.image_url] : []}
          name="image_url"
          label="صورة العرض (اختياري لكن مُوصى بها)"
          hint="صورة واضحة للعرض — JPG/PNG/WebP · حتى 5MB"
        />
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">الحالة</h2>
        <label className="admin-toggle">
          <input type="checkbox" name="is_published" defaultChecked={initial?.is_published ?? true} />
          <span className="admin-toggle__track"><span className="admin-toggle__thumb" /></span>
          <span className="admin-toggle__label">منشور للعملاء</span>
        </label>
      </section>

      <div className="admin-form__foot">
        <Link href={`/admin/businesses/${businessSlug}/offers`} className="admin-btn admin-btn--ghost">إلغاء</Link>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
          {pending ? 'جاري الحفظ...' : mode === 'create' ? '➕ إضافة العرض' : '💾 حفظ'}
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
