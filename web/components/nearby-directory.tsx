'use client'

import { useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import type { Business } from '@/lib/data'
import { useGeo } from '@/lib/contexts/geo-context'
import { filterAndRankNearbyBusinesses } from '@/lib/utils/nearby'
import LoadMoreGrid from '@/components/load-more'
import { LocationIcon, NavigationIcon, TargetIcon } from '@/components/icons'
import pageStyles from '@/components/section-layout.module.css'
import styles from './nearby-directory.module.css'

type Props = {
  businesses: Business[]
  children: ReactNode
}

export default function NearbyDirectory({ businesses, children }: Props) {
  const geo = useGeo()
  const userLocation = geo.status === 'granted' ? geo.location : null
  const nearby = useMemo(
    () => filterAndRankNearbyBusinesses(businesses, userLocation),
    [businesses, userLocation],
  )

  const statusText =
    geo.status === 'granted'
      ? `${nearby.length} نشاط داخل نطاق 5 كم`
      : geo.status === 'denied'
        ? 'الموقع غير متاح — بنعرض أنشطة شبين القناطر'
        : geo.status === 'loading'
          ? 'بنحدد موقعك...'
          : 'حدّد موقعك عشان نرتب الأنشطة الأقرب ليك'

  return (
    <main className={pageStyles.page}>
      {children}
      <div className={pageStyles.content}>
        <div className={styles.toolbar} aria-live="polite">
          <p className={styles.status}>{statusText}</p>
          {geo.status === 'idle' && (
            <button type="button" className={styles.locationAction} onClick={geo.request}>
              <LocationIcon size={15} />
              استخدم موقعي
            </button>
          )}
        </div>

        {nearby.length > 0 ? (
          <LoadMoreGrid businesses={nearby} tone="teal" pageSize={10} />
        ) : (
          <div className={pageStyles.empty}>
            <div className={pageStyles.emptyIcon}>
              <NavigationIcon size={42} />
            </div>
            <h2 className={pageStyles.emptyTitle}>
              {geo.status === 'granted' ? 'مفيش أنشطة قريبة منك حاليًا' : 'لسه مفيش أنشطة هنا'}
            </h2>
            <p className={pageStyles.emptyText}>
              {geo.status === 'granted'
                ? 'مش لقينا نشاط عنده موقع مسجل داخل 5 كم منك. تقدر تشوف كل الأنشطة.'
                : 'هنعرض أنشطة شبين القناطر أول ما تكون متاحة.'}
            </p>
            <Link href="/explore" className={pageStyles.emptyBtn}>
              اكتشف كل الأنشطة
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
