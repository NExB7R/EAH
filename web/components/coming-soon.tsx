import Link from 'next/link'
import type { ReactNode } from 'react'
import SecondaryHero from './secondary-hero'
import { ArrowLeftIcon } from './icons'
import styles from './coming-soon.module.css'

type Props = {
  activeKey?: string
  title: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  tone?: 'gold' | 'orange' | 'purple' | 'teal' | 'pink' | 'blue'
  message?: string
  details?: ReactNode
}

export default function ComingSoon({
  activeKey = 'discover',
  title,
  Icon,
  tone = 'purple',
  message = 'هنضيفه قريب إن شاء الله',
  details,
}: Props) {
  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey={activeKey}
        title={title}
        Icon={Icon}
        tone={tone}
      />

      <section className={styles.section}>
        <div className={styles.frame}>
          <span className={styles.icon} aria-hidden>
            <Icon size={48} />
          </span>

          <h2 className={styles.title}>قريباً</h2>
          <p className={styles.message}>{message}</p>

          {details && <div className={styles.details}>{details}</div>}

          <Link href="/" className={styles.cta}>
            <ArrowLeftIcon size={16} />
            <span>رجوع للرئيسية</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
