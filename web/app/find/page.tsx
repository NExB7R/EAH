import type { Metadata } from 'next'
import SecondaryHero from '@/components/secondary-hero'
import FindByPhone from '@/components/find-by-phone'
import styles from './find.module.css'

export const metadata: Metadata = {
  title: 'ابحث برقم · EAH',
  description: 'تحقق من تسجيل رقم في EAH',
}

export default function FindPage() {
  return (
    <>
      <SecondaryHero title="ابحث برقم" tone="gold" showNav={false} />
      <main className={styles.wrap}>
        <FindByPhone />
      </main>
    </>
  )
}
