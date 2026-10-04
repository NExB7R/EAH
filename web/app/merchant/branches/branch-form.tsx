'use client'

import { useState, useTransition, useRef } from 'react'
import { PlusIcon, CloseIcon } from '@/components/icons'
import { createBranch, updateBranch } from './actions'
import type { BranchRow } from './types'
import styles from './branches.module.css'

type Props = {
  branch?: BranchRow
  onDone?: () => void
}

const AREA_DEFAULT = 'شبين القناطر'

export default function BranchForm({ branch, onDone }: Props) {
  const [open, setOpen] = useState(!!branch)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const isEdit = !!branch

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = branch ? await updateBranch(branch.id, formData) : await createBranch(formData)
      if (res.ok) {
        formRef.current?.reset()
        if (onDone) onDone()
        else setOpen(false)
      } else {
        setError(res.error)
      }
    })
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={styles.newBtn}>
        <PlusIcon size={16} />
        <span>إضافة فرع</span>
      </button>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHead}>
        <h3 className={styles.formTitle}>{isEdit ? 'تعديل الفرع' : 'فرع جديد'}</h3>
        <button
          type="button"
          onClick={() => (onDone ? onDone() : setOpen(false))}
          className={styles.formClose}
          aria-label="إغلاق"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`br-name-${branch?.id ?? 'new'}`}>اسم الفرع *</label>
          <input
            id={`br-name-${branch?.id ?? 'new'}`}
            name="name"
            type="text"
            required
            maxLength={80}
            defaultValue={branch?.name ?? ''}
            placeholder="مثال: فرع الميدان"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`br-area-${branch?.id ?? 'new'}`}>المنطقة *</label>
          <input
            id={`br-area-${branch?.id ?? 'new'}`}
            name="area"
            type="text"
            required
            maxLength={50}
            defaultValue={branch?.area ?? AREA_DEFAULT}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={`br-addr-${branch?.id ?? 'new'}`}>العنوان التفصيلي</label>
        <input
          id={`br-addr-${branch?.id ?? 'new'}`}
          name="address_text"
          type="text"
          maxLength={200}
          defaultValue={branch?.address_text ?? ''}
          placeholder="شارع، علامة مميزة"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`br-phone-${branch?.id ?? 'new'}`}>تليفون</label>
          <input
            id={`br-phone-${branch?.id ?? 'new'}`}
            name="phone"
            type="tel"
            maxLength={20}
            defaultValue={branch?.phone ?? ''}
            placeholder="01xxxxxxxxx"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`br-wa-${branch?.id ?? 'new'}`}>واتساب</label>
          <input
            id={`br-wa-${branch?.id ?? 'new'}`}
            name="whatsapp"
            type="tel"
            maxLength={20}
            defaultValue={branch?.whatsapp ?? ''}
            placeholder="01xxxxxxxxx"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`br-lat-${branch?.id ?? 'new'}`}>خط العرض (اختياري)</label>
          <input
            id={`br-lat-${branch?.id ?? 'new'}`}
            name="latitude"
            type="text"
            inputMode="decimal"
            defaultValue={branch?.latitude ?? ''}
            placeholder="30.1234"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`br-lng-${branch?.id ?? 'new'}`}>خط الطول (اختياري)</label>
          <input
            id={`br-lng-${branch?.id ?? 'new'}`}
            name="longitude"
            type="text"
            inputMode="decimal"
            defaultValue={branch?.longitude ?? ''}
            placeholder="31.2345"
          />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" disabled={pending} className={styles.primaryBtn}>
          {pending ? 'جاري الحفظ...' : isEdit ? 'احفظ' : 'أضف الفرع'}
        </button>
        <button
          type="button"
          onClick={() => (onDone ? onDone() : setOpen(false))}
          disabled={pending}
          className={styles.secondaryBtn}
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}
