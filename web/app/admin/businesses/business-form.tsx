'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBusiness, updateBusiness } from './actions'
import type { AdminBusiness, BusinessOwnerOption } from '@/lib/data/admin-business'
import styles from './businesses.module.css'

const TYPES: { value: string; label: string }[] = [
  { value: 'restaurant', label: 'مطعم' },
  { value: 'pharmacy', label: 'صيدلية' },
  { value: 'supermarket', label: 'ماركت' },
  { value: 'delivery_office', label: 'توصيل' },
  { value: 'misc', label: 'أخرى' },
]

type Props =
  { business: AdminBusiness; owners?: never } | { owners: BusinessOwnerOption[]; business?: never }

export default function BusinessForm(props: Props) {
  const isEdit = 'business' in props && !!props.business
  const b = isEdit ? props.business : null

  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setOk(false)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      if (isEdit && b) {
        const res = await updateBusiness(b.id, formData)
        if (res.ok) {
          setOk(true)
          router.refresh()
        } else {
          setError(res.error)
        }
      } else {
        const res = await createBusiness(formData)
        if (!res.ok) {
          setError(res.error)
        } else if (res.id) {
          router.push(`/admin/businesses/${res.id}`)
        } else {
          router.push('/admin/businesses')
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="name">الاسم</label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={b?.name ?? ''}
          dir="rtl"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="slug">Slug (بالإنجليزي)</label>
        <input
          id="slug"
          name="slug"
          required
          minLength={2}
          maxLength={80}
          pattern="[a-z0-9-]+"
          defaultValue={b?.slug ?? ''}
          dir="ltr"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="business_type">النوع</label>
        <select
          id="business_type"
          name="business_type"
          defaultValue={b?.business_type ?? 'restaurant'}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {!isEdit && props.owners && (
        <div className={styles.field}>
          <label htmlFor="owner_profile_id">صاحب النشاط</label>
          <select id="owner_profile_id" name="owner_profile_id" required defaultValue="">
            <option value="" disabled>
              اختر...
            </option>
            {props.owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.display_name} {o.phone ? `— ${o.phone}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="area">المنطقة</label>
        <input id="area" name="area" maxLength={60} defaultValue={b?.area ?? ''} dir="rtl" />
      </div>

      <div className={styles.field}>
        <label htmlFor="city">المدينة</label>
        <input id="city" name="city" maxLength={60} defaultValue={b?.city ?? ''} dir="rtl" />
      </div>

      <div className={styles.field}>
        <label htmlFor="address_text">العنوان</label>
        <input
          id="address_text"
          name="address_text"
          maxLength={200}
          defaultValue={b?.address_text ?? ''}
          dir="rtl"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="hook">Hook (سطر قصير)</label>
        <input id="hook" name="hook" maxLength={120} defaultValue={b?.hook ?? ''} dir="rtl" />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">الوصف</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={1000}
          defaultValue={b?.description ?? ''}
          dir="rtl"
        />
      </div>

      <div className={styles.checkField}>
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          defaultChecked={b?.is_published ?? false}
        />
        <label htmlFor="is_published">منشور</label>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {ok && <div className={styles.success}>تم الحفظ ✓</div>}

      <button type="submit" disabled={pending} className={styles.approveBtn}>
        {pending ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إنشاء النشاط'}
      </button>
    </form>
  )
}
