'use client'

import { useMemo, useState, useTransition } from 'react'
import { CloseIcon, GiftIcon, SearchIcon } from '@/components/icons'
import { deleteOffer, toggleOfferPublish } from './actions'
import type { MerchantOffer } from '@/lib/data/merchant'
import styles from './offers.module.css'

type Props = {
  offers: MerchantOffer[]
}

type FilterKey = 'all' | 'published' | 'draft' | 'expired'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'published', label: 'منشور' },
  { key: 'draft', label: 'مسودة' },
  { key: 'expired', label: 'منتهي' },
]

export default function OfferList({ offers }: Props) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [q, setQ] = useState('')
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [now] = useState(() => Date.now())

  const visible = offers.filter((o) => !removedIds.has(o.id))

  const stats = useMemo(() => {
    let published = 0
    let draft = 0
    let expired = 0
    for (const o of visible) {
      const exp = o.ends_at ? new Date(o.ends_at).getTime() < now : false
      if (exp) expired++
      else if (o.is_published) published++
      else draft++
    }
    return { total: visible.length, published, draft, expired }
  }, [visible, now])

  const filtered = useMemo(() => {
    let result = visible
    if (filter === 'published')
      result = result.filter(
        (o) => o.is_published && !(o.ends_at && new Date(o.ends_at).getTime() < now),
      )
    else if (filter === 'draft')
      result = result.filter(
        (o) => !o.is_published && !(o.ends_at && new Date(o.ends_at).getTime() < now),
      )
    else if (filter === 'expired')
      result = result.filter((o) => o.ends_at && new Date(o.ends_at).getTime() < now)

    const query = q.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(query) ||
          (o.description ?? '').toLowerCase().includes(query),
      )
    }
    return result
  }, [visible, filter, q, now])

  const handleToggle = (id: string, isPublished: boolean) => {
    startTransition(async () => {
      const res = await toggleOfferPublish(id, isPublished)
      setMsg(res.ok ? (isPublished ? 'تم الإيقاف' : 'تم النشر') : res.error)
      if (res.ok) setTimeout(() => setMsg(null), 2500)
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('متأكد من الحذف؟')) return
    setRemovedIds((prev) => new Set([...prev, id]))
    startTransition(async () => {
      const res = await deleteOffer(id)
      if (res.ok) {
        setMsg('تم الحذف')
        setTimeout(() => setMsg(null), 2500)
      } else {
        setRemovedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        setMsg(res.error)
      }
    })
  }

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>إجمالي</span>
        </div>
        <div className={`${styles.statCard} ${styles.statOk}`}>
          <span className={styles.statValue}>{stats.published}</span>
          <span className={styles.statLabel}>منشور</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.draft}</span>
          <span className={styles.statLabel}>مسودة</span>
        </div>
        <div className={`${styles.statCard} ${stats.expired > 0 ? styles.statWarn : ''}`}>
          <span className={styles.statValue}>{stats.expired}</span>
          <span className={styles.statLabel}>منتهي</span>
        </div>
      </div>

      <div className={styles.searchWrap}>
        <SearchIcon size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث في العروض..."
          className={styles.searchInput}
          dir="rtl"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className={styles.searchClear}
            aria-label="مسح البحث"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      <div className={styles.filterTabs}>
        {FILTERS.map((f) => {
          const count =
            f.key === 'all'
              ? stats.total
              : f.key === 'published'
                ? stats.published
                : f.key === 'draft'
                  ? stats.draft
                  : stats.expired
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`${styles.filterTab} ${filter === f.key ? styles.filterTabActive : ''}`}
            >
              {f.label} <span className={styles.filterCount}>{count}</span>
            </button>
          )
        })}
      </div>

      {msg && <p className={styles.msg}>{msg}</p>}

      {filtered.length === 0 ? (
        <div className={styles.emptyFiltered}>
          <p>{visible.length === 0 ? 'مفيش عروض لسه' : 'مفيش عروض في الفئة دي'}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((o) => {
            const ends = o.ends_at
              ? new Date(o.ends_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '—'
            const expired = o.ends_at ? new Date(o.ends_at).getTime() < now : false
            return (
              <article
                key={o.id}
                className={`${styles.card} ${o.is_published ? '' : styles.cardDraft} ${expired ? styles.cardExpired : ''}`}
              >
                <div className={styles.cardBody}>
                  <div className={styles.cardHead}>
                    <span
                      className={`${styles.statusDot} ${o.is_published && !expired ? styles.dotOn : styles.dotOff}`}
                    />
                    <h4 className={styles.cardTitle}>{o.title}</h4>
                  </div>
                  {o.description && <p className={styles.cardDesc}>{o.description}</p>}
                  <div className={styles.cardMeta}>
                    <span>
                      <GiftIcon size={11} /> ينتهي: {ends}
                    </span>
                    {o.price != null && <span>· {o.price} ج.م</span>}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => handleToggle(o.id, o.is_published)}
                    disabled={pending}
                    className={o.is_published ? styles.btnWarn : styles.btnOk}
                  >
                    {o.is_published ? 'إيقاف' : 'نشر'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(o.id)}
                    disabled={pending}
                    className={styles.btnDanger}
                  >
                    حذف
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
