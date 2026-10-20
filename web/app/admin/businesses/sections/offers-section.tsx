'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertIcon, CloseIcon, PlusIcon } from '@/components/icons'
import { useBusinessForm } from '../business-form-context'
import { saveOffer, deleteOffer, toggleOfferPublished } from '../edit-actions'
import styles from '../business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Offers section (admin)
// Full CRUD. Self-contained — no FormState dependency.
// ═══════════════════════════════════════════════════════════

type OfferForm = {
  id?: string
  title: string
  description: string
  price: string
  image_url: string
  starts_at: string
  ends_at: string
  is_published: boolean
}

const EMPTY: OfferForm = {
  title: '',
  description: '',
  price: '',
  image_url: '',
  starts_at: '',
  ends_at: '',
  is_published: true,
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function OffersSection() {
  const ctx = useBusinessForm()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<OfferForm>(EMPTY)
  const [editing, setEditing] = useState(false)
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())

  const offers = ctx.business.offers.filter((o) => !removedIds.has(o.id))

  const startNew = () => {
    setForm(EMPTY)
    setEditing(true)
    setError(null)
  }

  const startEdit = (id: string) => {
    const o = offers.find((x) => x.id === id)
    if (!o) return
    setForm({
      id: o.id,
      title: o.title,
      description: o.description ?? '',
      price: o.price !== null ? String(o.price) : '',
      image_url: o.image_url ?? '',
      starts_at: o.starts_at ? o.starts_at.slice(0, 16) : '',
      ends_at: o.ends_at ? o.ends_at.slice(0, 16) : '',
      is_published: o.is_published,
    })
    setEditing(true)
    setError(null)
  }

  const cancel = () => {
    setEditing(false)
    setForm(EMPTY)
    setError(null)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set('title', form.title)
    fd.set('description', form.description)
    fd.set('price', form.price)
    fd.set('image_url', form.image_url)
    if (form.starts_at) fd.set('starts_at', form.starts_at)
    if (form.ends_at) fd.set('ends_at', form.ends_at)
    if (form.is_published) fd.set('is_published', 'on')

    startTransition(async () => {
      const res = await saveOffer(ctx.business.id, fd, form.id)
      if (res.ok) {
        setEditing(false)
        setForm(EMPTY)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const remove = (id: string) => {
    if (!confirm('حذف العرض نهائياً؟')) return
    setRemovedIds((prev) => new Set([...prev, id]))
    startTransition(async () => {
      const res = await deleteOffer(id, ctx.business.id)
      if (res.ok) {
        router.refresh()
      } else {
        setRemovedIds((prev) => {
          const n = new Set(prev)
          n.delete(id)
          return n
        })
        setError(res.error)
      }
    })
  }

  const toggle = (id: string, next: boolean) => {
    startTransition(async () => {
      const res = await toggleOfferPublished(id, ctx.business.id, next)
      if (res.ok) {
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  if (editing) {
    return (
      <form onSubmit={submit} className={styles.sections}>
        <div className={styles.field}>
          <label className={styles.label}>عنوان العرض *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            minLength={2}
            maxLength={120}
            className={styles.input}
            dir="rtl"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>الوصف</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            maxLength={500}
            className={styles.textarea}
            dir="rtl"
          />
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>السعر</label>
            <input
              type="text"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="25"
              className={styles.input}
              dir="ltr"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>رابط الصورة</label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
              className={styles.input}
              dir="ltr"
            />
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>يبدأ</label>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>ينتهي</label>
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.checkRow}>
          <input
            id="offer-published"
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          <label htmlFor="offer-published">منشور على المنصة</label>
        </div>

        {error && (
          <div className={styles.errMsg}>
            <AlertIcon size={12} /> {error}
          </div>
        )}

        <div className={styles.saveBar}>
          <button type="submit" disabled={pending} className={styles.saveBtn}>
            {pending ? 'جاري الحفظ…' : form.id ? 'حفظ التعديلات' : 'إضافة العرض'}
          </button>
          <button type="button" onClick={cancel} disabled={pending} className={styles.cancelBtn}>
            إلغاء
          </button>
        </div>
      </form>
    )
  }

  return (
    <>
      <p className={styles.hint}>العروض تظهر في الصفحة العامة — العروض المنتهية تختفي تلقائياً</p>

      {offers.length === 0 ? (
        <p className={styles.hint}>مفيش عروض — ضيف أول عرض</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {offers.map((o) => (
            <div
              key={o.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.04)',
                border: '1px solid rgba(168, 85, 247, 0.15)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {o.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {o.price !== null && <span>{o.price} ج · </span>}
                  {o.starts_at || o.ends_at ? (
                    <span>
                      {fmtDate(o.starts_at)} → {fmtDate(o.ends_at)}
                    </span>
                  ) : (
                    <span>بدون تاريخ</span>
                  )}
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: o.is_published
                    ? 'rgba(85, 231, 209, 0.15)'
                    : 'rgba(168, 85, 247, 0.15)',
                  color: o.is_published ? 'var(--teal)' : 'var(--purple-light)',
                }}
              >
                {o.is_published ? 'منشور' : 'مخفي'}
              </span>

              <button
                type="button"
                onClick={() => toggle(o.id, !o.is_published)}
                disabled={pending}
                className={styles.presetBtn}
              >
                {o.is_published ? 'إخفاء' : 'نشر'}
              </button>

              <button
                type="button"
                onClick={() => startEdit(o.id)}
                disabled={pending}
                className={styles.presetBtn}
              >
                تعديل
              </button>

              <button
                type="button"
                onClick={() => remove(o.id)}
                disabled={pending}
                className={styles.branchIconBtn}
                style={{ color: '#fca5a5', borderColor: 'rgba(252,165,165,0.3)' }}
                aria-label="حذف"
              >
                <CloseIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={startNew} className={styles.addBtn}>
        <PlusIcon size={14} /> إضافة عرض جديد
      </button>

      {error && (
        <div className={styles.errMsg}>
          <AlertIcon size={12} /> {error}
        </div>
      )}
    </>
  )
}
