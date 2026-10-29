import type { Metadata } from 'next'
import Link from 'next/link'
import { WifiOffIcon, HomeIcon, CompassIcon, GiftIcon, LocationIcon } from '@/components/icons'
import styles from './offline.module.css'

export const metadata: Metadata = {
  title: 'مفيش نت',
  description: 'الصفحة دي بتظهرلك لما النت يقطع',
}

export default function OfflinePage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <WifiOffIcon size={44} />
        </div>

        <h1 className={styles.title}>مفيش نت دلوقتي</h1>
        <p className={styles.text}>
          الصفحة اللي بتدور عليها محتاجة اتصال. بس تقدر تفضل تتصفح الأنشطة اللي شفتها قبل كده
          والأماكن المخزنة عندك.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            <HomeIcon size={16} />
            <span>الرئيسية</span>
          </Link>
          <Link href="/explore" className={styles.secondary}>
            <CompassIcon size={16} />
            <span>اكتشف</span>
          </Link>
          <Link href="/offers" className={styles.secondary}>
            <GiftIcon size={16} />
            <span>العروض</span>
          </Link>
          <Link href="/nearby" className={styles.secondary}>
            <LocationIcon size={16} />
            <span>قريب منك</span>
          </Link>
        </div>

        <p className={styles.tip}>
          💡 نصيحة: الصفحات اللي زرتها وأنت متصل بتفضل متاحة دلوقتي حتى لو النت قطع.
        </p>
      </div>
    </main>
  )
}
