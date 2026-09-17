'use client'
import { useState, useTransition } from 'react'
import { toggleBusinessFlag, deleteBusiness } from '@/app/admin/businesses/actions'
import Link from 'next/link'

type Props = {
  id: string
  slug: string
  is_featured: boolean
  is_published: boolean
  is_open: boolean
}

export default function BusinessActions({ id, slug, is_featured, is_published, is_open }: Props) {
  const [pending, startTransition] = useTransition()
  const [showDelete, setShowDelete] = useState(false)

  const toggle = (flag: 'is_featured' | 'is_published' | 'is_open') => {
    startTransition(async () => { await toggleBusinessFlag(id, flag) })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteBusiness(id)
      if (!res.ok) alert(res.message ?? 'فشل الحذف')
      setShowDelete(false)
    })
  }

  return (
    <>
      <div className="admin-biz__actions">
        <Link href={`/admin/businesses/${slug}/edit`} className="admin-btn admin-btn--sm admin-btn--primary"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> تعديل</Link>
        <Link href={`/businesses/${slug}`} target="_blank" className="admin-btn admin-btn--sm">مشاهدة</Link>
        <Link href={`/admin/businesses/${slug}/access`} className="admin-btn admin-btn--sm">🔐 صلاحيات</Link>

        <button type="button" className={`admin-btn admin-btn--sm ${is_featured ? 'admin-btn--gold' : ''}`} onClick={() => toggle('is_featured')} disabled={pending}>
          {is_featured ? 'مميز ✓' : 'ميّز'}
        </button>

        <button type="button" className={`admin-btn admin-btn--sm ${is_published ? '' : 'admin-btn--ghost'}`} onClick={() => toggle('is_published')} disabled={pending}>
          {is_published ? 'منشور' : 'انشر'}
        </button>

        <button type="button" className={`admin-btn admin-btn--sm ${is_open ? '' : 'admin-btn--ghost'}`} onClick={() => toggle('is_open')} disabled={pending}>
          {is_open ? 'مفتوح' : '🚪 افتح'}
        </button>

        <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => setShowDelete(true)} disabled={pending}>
          🗑 حذف
        </button>
      </div>

      {showDelete && (
        <div className="admin-overlay" style={{ display: 'block', zIndex: 100 }} onClick={() => setShowDelete(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--eah-black-2)', border: '1px solid var(--eah-red)', borderRadius: 'var(--eah-radius-lg)', padding: 24, maxWidth: 420, width: 'calc(100% - 32px)', zIndex: 101, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <h3 style={{ margin: '0 0 8px', color: 'var(--eah-text)' }}>تأكيد الحذف</h3>
            <p style={{ margin: '0 0 16px', color: 'var(--eah-text-3)', fontSize: '0.85rem' }}>
              أنت على وشك حذف <strong>{slug}</strong>. العملية دي مش هترجع.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowDelete(false)}>إلغاء</button>
              <button type="button" className="admin-btn admin-btn--danger" onClick={handleDelete} disabled={pending}>
                {pending ? 'جاري الحذف...' : '🗑 احذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
