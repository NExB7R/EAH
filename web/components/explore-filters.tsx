'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useGeo } from '@/lib/contexts/geo-context'
import type { ActiveArea } from '@/lib/data/areas'
import type { SortOption } from '@/lib/search/filters'
import {
  TargetIcon,
  LocationIcon,
  ClockIcon,
  SparklesIcon,
  StarIcon,
  CloseIcon,
  TrendingUpIcon,
} from './icons'
import styles from './explore-filters.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Explore Filters
// فلترة قابلة للمشاركة (URL-driven) + Stackable
// ═══════════════════════════════════════════════════════════

const TYPES = [
  { value: 'restaurant', label: 'مطاعم' },
  { value: 'pharmacy', label: 'صيدليات' },
  { value: 'delivery_office', label: 'توصيل' },
  { value: 'misc', label: 'أنشطة أخرى' },
] as const

const RATINGS = [
  { value: '4', label: '4+' },
  { value: '4.5', label: '4.5+' },
  { value: '5', label: '5 نجوم' },
] as const

const DISTANCES = [
  { value: '100', label: 'أقل من 100 م' },
  { value: '500', label: '500 م' },
  { value: '1000', label: '1 كم' },
  { value: '5000', label: '5 كم' },
  { value: '10000', label: '10 كم' },
  { value: '20000', label: '20 كم' },
] as const

const SORTS: {
  value: SortOption
  label: string
  needsGeo?: boolean
  searchOnly?: boolean
}[] = [
  { value: 'distance', label: 'الأقرب', needsGeo: true },
  { value: 'quality', label: 'الأفضل حسب التقييم والسجل' },
  { value: 'rating', label: 'الأعلى تقييماً' },
  { value: 'newest', label: 'الأحدث' },
  { value: 'relevance', label: 'الأكثر صلة بالبحث', searchOnly: true },
]

type Counts = {
  types: Record<string, number>
  verified: number
}

type Props = {
  area: string | null
  counts?: Counts
  activeAreas: ActiveArea[]
  sort: SortOption
  hasQuery: boolean
}

export default function ExploreFilters({ area, counts, activeAreas, sort, hasQuery }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const geo = useGeo()

  const [open, setOpen] = useState(searchParams.get('filters') === '1')

  const currentType = searchParams.get('type')
  const currentRating = searchParams.get('rating')
  const currentDistance = searchParams.get('distance')
  const currentSort = sort === 'trust' ? 'quality' : sort
  const currentArea = searchParams.get('area')
  const currentVerified = searchParams.get('verified') === '1'
  const openNow = searchParams.get('open') === '1'
  const online = searchParams.get('online') === '1'
  const hasOffers = searchParams.get('offers') === '1'
  const isNew = searchParams.get('new') === '1'

  // ─── Autosave user location into URL once geo granted ───
  useEffect(() => {
    if (geo.status !== 'granted') return
    if (searchParams.get('lat') && searchParams.get('lng')) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('lat', geo.location.lat.toFixed(6))
    params.set('lng', geo.location.lng.toFixed(6))
    if (!params.get('sort')) params.set('sort', 'distance')

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [geo, pathname, router, searchParams])

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) params.delete(key)
    else params.set(key, value)
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const toggleBool = (key: string) => {
    const cur = searchParams.get(key) === '1'
    updateParam(key, cur ? null : '1')
  }

  const clearAll = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }

  const activeCount =
    (currentType ? 1 : 0) +
    (currentVerified ? 1 : 0) +
    (currentRating ? 1 : 0) +
    (currentDistance ? 1 : 0) +
    (openNow ? 1 : 0) +
    (online ? 1 : 0) +
    (hasOffers ? 1 : 0) +
    (isNew ? 1 : 0) +
    (area ? 1 : 0)

  const hasActive = activeCount > 0

  return (
    <>
      {/* Trigger bar */}
      <div className={styles.bar}>
        <button
          type="button"
          className={`${styles.trigger} ${hasActive ? styles.triggerActive : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <TargetIcon size={16} />
          <span>فلترة</span>
          {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
        </button>

        <button
          type="button"
          className={`${styles.trigger} ${openNow ? styles.triggerActive : ''}`}
          onClick={() => toggleBool('open')}
        >
          <ClockIcon size={14} />
          <span>مفتوح دلوقتي</span>
        </button>

        <button
          type="button"
          className={`${styles.trigger} ${hasOffers ? styles.triggerActive : ''}`}
          onClick={() => toggleBool('offers')}
        >
          <SparklesIcon size={14} />
          <span>عروض</span>
        </button>

        <button
          type="button"
          className={`${styles.trigger} ${online ? styles.triggerActive : ''}`}
          onClick={() => toggleBool('online')}
        >
          <span>واتساب</span>
        </button>

        <button
          type="button"
          className={`${styles.trigger} ${isNew ? styles.triggerActive : ''}`}
          onClick={() => toggleBool('new')}
        >
          <span>جديد</span>
        </button>

        {geo.status === 'idle' && (
          <button type="button" className={styles.trigger} onClick={() => geo.request()}>
            <LocationIcon size={14} />
            <span>قريب مني</span>
          </button>
        )}

        {hasActive && (
          <button type="button" className={styles.clearBtn} onClick={clearAll}>
            <CloseIcon size={14} />
            <span>مسح</span>
          </button>
        )}
      </div>

      {/* Panel */}
      {open && (
        <div className={styles.panel}>
          <Section title="المنطقة">
            <select
              value={currentArea ?? ''}
              onChange={(e) => updateParam('area', e.target.value || null)}
              className={styles.select}
              disabled={activeAreas.length === 0}
            >
              <option value="">{activeAreas.length === 0 ? 'مفيش مناطق لسه' : 'كل المناطق'}</option>
              {activeAreas.map(({ area: a, count }) => (
                <option key={a} value={a}>
                  {a} ({count})
                </option>
              ))}
            </select>
          </Section>

          <Section title="النوع">
            <div className={styles.chips}>
              {TYPES.map((t) => {
                const c = counts?.types[t.value]
                return (
                  <Chip
                    key={t.value}
                    active={currentType === t.value}
                    onClick={() => updateParam('type', currentType === t.value ? null : t.value)}
                  >
                    {t.label}
                    {c !== undefined && <span className={styles.count}>({c})</span>}
                  </Chip>
                )
              })}
            </div>
          </Section>

          <Section title="توثيق النشاط">
            <div className={styles.chips}>
              <Chip
                active={currentVerified}
                onClick={() => updateParam('verified', currentVerified ? null : '1')}
              >
                <span>أنشطة موثّقة من إدارة EAH</span>
                {counts?.verified !== undefined && (
                  <span className={styles.count}>({counts.verified})</span>
                )}
              </Chip>
            </div>
          </Section>

          <Section title="التقييم">
            <div className={styles.chips}>
              {RATINGS.map((r) => (
                <Chip
                  key={r.value}
                  active={currentRating === r.value}
                  icon={<StarIcon size={12} />}
                  onClick={() => updateParam('rating', currentRating === r.value ? null : r.value)}
                >
                  {r.label}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="المسافة">
            {geo.status !== 'granted' ? (
              <p className={styles.hint}>فعّل الموقع عشان تفلتر بالمسافة</p>
            ) : (
              <div className={styles.chips}>
                {DISTANCES.map((d) => (
                  <Chip
                    key={d.value}
                    active={currentDistance === d.value}
                    onClick={() =>
                      updateParam('distance', currentDistance === d.value ? null : d.value)
                    }
                  >
                    {d.label}
                  </Chip>
                ))}
              </div>
            )}
          </Section>

          <Section title="الترتيب">
            <div className={styles.chips}>
              {SORTS.filter((s) => !s.searchOnly || hasQuery).map((s) => {
                const disabled = 'needsGeo' in s && s.needsGeo && geo.status !== 'granted'
                return (
                  <Chip
                    key={s.value}
                    active={currentSort === s.value}
                    disabled={disabled}
                    icon={<TrendingUpIcon size={12} />}
                    onClick={() => updateParam('sort', s.value)}
                  >
                    {s.label}
                  </Chip>
                )
              })}
            </div>
          </Section>
        </div>
      )}
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  )
}

function Chip({
  active,
  disabled,
  icon,
  children,
  onClick,
}: {
  active: boolean
  disabled?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${active ? styles.chipActive : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
    >
      {icon && <span className={styles.chipIcon}>{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
