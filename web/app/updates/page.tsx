import type { Metadata } from 'next'
import { getReleases } from '@/lib/updates'
import { APP_VERSION } from '@/lib/version'
import SecondaryHero from '@/components/secondary-hero'
import {
  SparkleStarIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  LampIcon,
  FileTextIcon,
  GiftIcon,
  CrownGoldIcon,
} from '@/components/icons'
import styles from './updates.module.css'

export const metadata: Metadata = {
  title: 'التحديثات · EAH',
  description: 'كل جديد في منصة EAH — ميزات، تحسينات، وإصلاحات',
}

export const revalidate = 3600

const TYPE_META = {
  added: { label: 'جديد', Icon: SparkleStarIcon },
  changed: { label: 'تحسين', Icon: TrendingUpIcon },
  fixed: { label: 'إصلاح', Icon: ShieldCheckIcon },
  removed: { label: 'إزالة', Icon: FileTextIcon },
  security: { label: 'أمان', Icon: ShieldCheckIcon },
  perf: { label: 'أداء', Icon: TrendingUpIcon },
  docs: { label: 'وثائق', Icon: FileTextIcon },
  planned: { label: 'قادم', Icon: LampIcon },
} as const

export default function UpdatesPage() {
  const releases = getReleases()

  return (
    <main className={styles.page}>
      <SecondaryHero title="التحديثات" activeKey="updates" />

      <div className={styles.container}>
        <div className={styles.badge}>
          <CrownGoldIcon size={14} />
          <span>الإصدار الحالي</span>
          <strong>{APP_VERSION}</strong>
        </div>

        {releases.map((r) => {
          const grouped = new Map<string, typeof r.entries>()
          for (const e of r.entries) {
            const arr = grouped.get(e.type) ?? []
            arr.push(e)
            grouped.set(e.type, arr)
          }

          return (
            <section key={r.version} className={styles.release}>
              <header className={styles.releaseHead}>
                <h2 className={styles.version}>{r.version}</h2>
                {r.date && <time className={styles.date}>{r.date}</time>}
                {r.isPlanned && <span className={styles.tag}>قادم</span>}
                {r.isCurrent && <span className={`${styles.tag} ${styles.tagGold}`}>الحالي</span>}
                {r.isPreRelease && (
                  <span className={`${styles.tag} ${styles.tagSoft}`}>pre-release</span>
                )}
              </header>

              <div className={styles.entries}>
                {[...grouped.entries()].map(([type, items]) => {
                  const meta = TYPE_META[type as keyof typeof TYPE_META] ?? TYPE_META.changed
                  const Icon = meta.Icon
                  return (
                    <div key={type} className={styles.group}>
                      <h3 className={`${styles.groupTitle} ${styles[`t_${type}`]}`}>
                        <Icon size={14} />
                        <span>{meta.label}</span>
                      </h3>
                      <ul className={styles.list}>
                        {items.map((it, i) => (
                          <li key={i} className={styles.item}>
                            <GiftIcon size={10} className={styles.bullet} />
                            <span>{it.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
