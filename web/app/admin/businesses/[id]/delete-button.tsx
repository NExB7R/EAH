'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CloseIcon } from '@/components/icons'
import { deleteBusiness } from '../actions'
import styles from '../businesses.module.css'

export default function DeleteBusinessButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = () => {
    if (!confirm(`حذف "${name}" نهائياً؟ مفيش رجوع!`)) return
    if (!confirm('تأكيد أخير — كل البيانات (تقييمات، طلبات، صور) هتتمسح.')) return
    startTransition(async () => {
      const res = await deleteBusiness(id)
      if (res.ok) {
        router.push('/admin/businesses')
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div>
      <button type="button" onClick={handleDelete} disabled={pending} className={styles.dangerBtn}>
        <CloseIcon size={14} />
        <span>{pending ? 'جاري الحذف...' : 'حذف نهائي'}</span>
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
