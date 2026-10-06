'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useGeo } from '@/lib/contexts/geo-context'
import { AREAS } from '@/lib/data/areas'
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
  { value: 'supermarket', label: 'ماركت' },
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

const SORTS = [
  { value: 'distance', label: 'الأقرب', needsGeo: true },
  { value: 'trust', label: 'الأعلى مصداقية' },
  { value: 'rating', label: 'الأعلى تقييماً' },
  { value: 'newest', label: 'الأحدث' },
] as const

type Props = {
  area: string | null
}

export default function ExploreFilters({ area }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const geo = useGeo()

  const [open, setOpen] = useState(false)

  const currentType = searchParams.get('type')
  const currentRating = searchParams.get('rating')
  const currentDistance = searchParams.get('distance')
  const currentSort = searchParams.get('sort') ?? 'trust'
  const currentArea = searchParams.get('area')
  const openNow = searchParams.get('open') === '1'
  const hasOffers = searchParams.get('offers') === '1'

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
    (currentRating ? 1 : 0) +
    (currentDistance ? 1 : 0) +
    (openNow ? 1 : 0) +
    (hasOffers ? 1 : 0) +
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
            >
              <option value="">كل المناطق</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Section>

          <Section title="النوع">
            <div className={styles.chips}>
              {TYPES.map((t) => (
                <Chip
                  key={t.value}
                  active={currentType === t.value}
                  onClick={() => updateParam('type', currentType === t.value ? null : t.value)}
                >
                  {t.label}
                </Chip>
              ))}
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
              {SORTS.map((s) => {
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
