'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AlertIcon, CheckCircleIcon, SettingsIcon } from '@/components/icons'
import { reorderFeatured } from './actions'
import FeaturedRow from './featured-row'
import type { FeaturedBusiness } from '@/lib/data/admin'
import styles from './featured.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured List (Drag & Drop Reorder)
// HTML5 native — بدون مكتبات
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: FeaturedBusiness[]
}

export default function FeaturedList({ businesses: initial }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<FeaturedBusiness[]>(initial)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [dirty, setDirty] = useState(false)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const onDragStart = useCallback((index: number) => {
    setDragIndex(index)
  }, [])

  const onDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault()
      if (dragIndex === null || dragIndex === index) return
      setOverIndex(index)

      // reorder فوري
      setItems((prev) => {
        const next = [...prev]
        const [moved] = next.splice(dragIndex, 1)
        if (!moved) return prev
        next.splice(index, 0, moved)
        return next
      })
      setDragIndex(index)
      setDirty(true)
    },
    [dragIndex],
  )

  const onDragEnd = useCallback(() => {
    setDragIndex(null)
    setOverIndex(null)
  }, [])

  const handleSave = () => {
    setMsg(null)
    startTransition(async () => {
      const res = await reorderFeatured(items.map((b) => b.id))
      if (res.ok) {
        setMsg({ type: 'ok', text: 'الترتيب اتحفظ ✓' })
        setDirty(false)
        router.refresh()
        setTimeout(() => setMsg(null), 2500)
      } else {
        setMsg({ type: 'err', text: res.error })
      }
    })
  }

  const handleCancel = () => {
    setItems(initial)
    setDirty(false)
    setMsg(null)
  }

  return (
    <div className={styles.dragWrap}>
      {/* Sticky toolbar */}
      {dirty && (
        <div className={styles.dragToolbar}>
          <div className={styles.dragToolbarLeft}>
            <span className={styles.dragDirty}>الترتيب اتغيّر — احفظ عشان يتطبق</span>
          </div>
          <div className={styles.dragToolbarRight}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={pending}
              className={styles.secondaryBtn}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className={styles.approveBtn}
            >
              <CheckCircleIcon size={14} />
              <span>{pending ? 'بيحفظ…' : 'حفظ الترتيب'}</span>
            </button>
          </div>
        </div>
      )}

      {msg && (
        <div className={`${styles.dragMsg} ${msg.type === 'ok' ? styles.msgOk : styles.msgErr}`}>
          {msg.type === 'ok' ? <CheckCircleIcon size={14} /> : <AlertIcon size={14} />}
          <span>{msg.text}</span>
        </div>
      )}

      <p className={styles.dragHint}>
        <SettingsIcon size={12} />
        <span>اسحب الصفوف لإعادة الترتيب — من الأعلى (1) للأقل</span>
      </p>

      <div className={styles.list}>
        {items.map((b, index) => (
          <div
            key={b.id}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragEnd={onDragEnd}
            onDrop={(e) => e.preventDefault()}
            className={`${styles.dragItem} ${
              dragIndex === index ? styles.dragItemActive : ''
            } ${overIndex === index && dragIndex !== index ? styles.dragItemOver : ''}`}
          >
            <div className={styles.dragHandle} aria-hidden>
              <span className={styles.dragDots} />
            </div>
            <div className={styles.dragPosition}>{index + 1}</div>
            <div className={styles.dragBody}>
              <FeaturedRow
                business={{
                  id: b.id,
                  name: b.name,
                  slug: b.slug,
                  business_type: b.business_type,
                  area: b.area,
                  cover_image_url: b.cover_image_url,
                  featured_pin: b.featured_pin,
                  featured_order: b.featured_order,
                  featured_until: b.featured_until,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
