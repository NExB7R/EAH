'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import {
  UserIcon,
  StoreIcon,
  MessageCircleIcon,
  GiftIcon,
  TrendingUpIcon,
  MapPinIcon,
  SparkleStarIcon,
} from './icons'
import type { LiveStats } from '@/lib/data/live-stats'
import styles from './live-stats-bar.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Live Stats Bar (Footer Counters)
//   • 8 عدادات — Desktop: 8 (row) | Mobile: 1 (slider)
//   • Auto-rotate على الموبايل (3.5s)
//   • Count-up animation
//   • Swiss 2026 style
// ═══════════════════════════════════════════════════════════

type Props = {
  stats: LiveStats
}

type Counter = {
  id: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  value: number | string
  label: string
  sublabel?: string
  accent: 'purple' | 'gold' | 'teal' | 'orange'
}

function subscribe() {
  return () => {}
}

function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toLocaleString('en-US')
}

// ─── Count-up hook ───

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target <= 0) return

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

// ─── Single Counter ───

function CounterItem({ counter, animate }: { counter: Counter; animate: boolean }) {
  const numeric = typeof counter.value === 'number' ? counter.value : 0
  const counted = useCountUp(animate ? numeric : 0, 1100)

  return (
    <div className={`${styles.counter} ${styles[counter.accent]}`}>
      <span className={styles.iconWrap}>
        <counter.Icon size={20} />
      </span>
      <div className={styles.textWrap}>
        <span className={styles.value}>
          {typeof counter.value === 'number'
            ? formatNumber(animate ? counted : numeric)
            : counter.value}
        </span>
        <span className={styles.label}>{counter.label}</span>
        {counter.sublabel && <span className={styles.sublabel}>{counter.sublabel}</span>}
      </div>
    </div>
  )
}

// ─── Component ───

export default function LiveStatsBar({ stats }: Props) {
  const mounted = useMounted()

  const counters: Counter[] = useMemo(() => {
    const list: Counter[] = [
      {
        id: 'businesses',
        Icon: StoreIcon,
        value: stats.activeBusinesses,
        label: 'نشاط نشط',
        accent: 'purple',
      },
      {
        id: 'users',
        Icon: UserIcon,
        value: stats.totalUsers,
        label: 'إجمالي المستخدمين',
        accent: 'gold',
      },
      {
        id: 'reviews',
        Icon: MessageCircleIcon,
        value: stats.totalReviews,
        label: 'تقييم',
        sublabel: stats.avgRating > 0 ? `متوسط ${stats.avgRating} ⭐` : undefined,
        accent: 'teal',
      },
      {
        id: 'orders',
        Icon: GiftIcon,
        value: stats.totalOrders,
        label: 'طلب',
        accent: 'orange',
      },
      {
        id: 'today',
        Icon: TrendingUpIcon,
        value: stats.todayVisits,
        label: 'زيارة اليوم',
        accent: 'purple',
      },
      {
        id: 'monthly',
        Icon: SparkleStarIcon,
        value: stats.monthlyUsers,
        label: 'مستخدم الشهر',
        accent: 'gold',
      },
    ]

    list.push({
      id: 'areas',
      Icon: MapPinIcon,
      value: stats.areasServed,
      label: 'منطقة مخدومة',
      accent: 'orange',
    })

    return list
  }, [stats])

  if (counters.length === 0) return null

  return (
    <section className={styles.wrap} aria-label="إحصائيات مباشرة">
      {/* Desktop — كل العدادات في صف */}
      <div className={styles.desktopGrid}>
        {counters.map((c) => (
          <CounterItem key={c.id} counter={c} animate={mounted} />
        ))}
      </div>

      {/* Mobile — scroll أفقي بكل العدادات */}
      <div className={styles.mobileSlider}>
        <div className={styles.mobileScroll}>
          {counters.map((c) => (
            <div key={c.id} className={styles.mobileItem}>
              <CounterItem counter={c} animate={mounted} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
