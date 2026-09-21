'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import ExploreCard from './explore-card'
import FilterSelect from './ui/filter-select'
import './projects-client.css'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'

type Business = {
  slug: string
  name: string
  type?: BusinessType
  business_type?: BusinessType
  area: string
  ageInDays?: number
  [key: string]: any
}

const VALID_TYPES = ['restaurant', 'pharmacy', 'supermarket', 'delivery_office']
const getType = (b: Business): string => (b.type ?? b.business_type ?? '') as string

export default function ProjectsClient({ businesses }: { businesses: Business[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const type = searchParams.get('type') ?? ''
  const area = searchParams.get('area') ?? ''
  const sort = searchParams.get('sort') ?? 'newest'

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') params.delete(k)
      else params.set(k, v)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const areas = useMemo(() => {
    const set = new Set<string>()
    businesses.forEach((b) => b.area && set.add(b.area))
    return Array.from(set).sort()
  }, [businesses])

  const filtered = useMemo(() => {
    let list = businesses
    if (type && VALID_TYPES.includes(type)) list = list.filter((b) => getType(b) === type)
    if (area) list = list.filter((b) => b.area === area)

    const arr = [...list]
    switch (sort) {
      case 'newest': arr.sort((a, b) => (a.ageInDays ?? 999) - (b.ageInDays ?? 999)); break
      case 'oldest': arr.sort((a, b) => (b.ageInDays ?? 0) - (a.ageInDays ?? 0)); break
      case 'rating': arr.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0)); break
      case 'views': arr.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)); break
    }
    return arr
  }, [businesses, type, area, sort])

  const TYPE_OPTS = [
    { value: 'restaurant',      label: 'مطاعم' },
    { value: 'pharmacy',        label: 'صيدليات' },
    { value: 'delivery_office', label: 'توصيل' },
  ]

  const AREA_OPTS = areas.map((a) => ({ value: a, label: a }))

  const SORT_OPTS = [
    { value: 'newest', label: 'الأجدد' },
    { value: 'oldest', label: 'الأقدم' },
    { value: 'rating', label: 'الأعلى تقييم' },
    { value: 'views',  label: 'الأكثر نشاط' },
  ]

  if (businesses.length === 0) {
    return (
      <div className="pc-empty">
        <div className="pc-empty__icon">🌱</div>
        <h2 className="pc-empty__title">لسه مفيش مشاريع جديدة</h2>
        <p className="pc-empty__msg">
          عايز مشروعك يبقى أول واحد هنا؟ سجّله مجاناً في دقيقتين.
        </p>
        <Link href="/merchant/apply" className="pc-empty__btn">
          سجّل مشروعك ←
        </Link>
      </div>
    )
  }

  return (
    <section className="pc">
      <div className="pc__bar">
        <FilterSelect
          label="النوع"
          value={type || null}
          options={TYPE_OPTS}
          onChange={(v) => updateParams({ type: v })}
          placeholder="كل الأنواع"
        />
        {areas.length > 1 && (
          <FilterSelect
            label="المنطقة"
            value={area || null}
            options={AREA_OPTS}
            onChange={(v) => updateParams({ area: v })}
            placeholder="كل المناطق"
          />
        )}
        <FilterSelect
          label="ترتيب"
          value={sort}
          options={SORT_OPTS}
          onChange={(v) => updateParams({ sort: v })}
        />
      </div>

      <p className="pc__count">
        <strong>{filtered.length}</strong> مشروع جديد
      </p>

      <div className="pc__grid">
        {filtered.map((b) => (
          <ExploreCard key={b.slug} business={b as any} />
        ))}
      </div>
    </section>
  )
}

