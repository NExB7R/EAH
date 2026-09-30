import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  SettingsIcon,
  BellIcon,
  LockIcon,
  LogoutIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import AccountPageHeader from '@/components/account-page-header'
import styles from './settings.module.css'

export const dynamic = 'force-dynamic'

export default async function MerchantSettingsPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/settings')

  return (
    <div>
      <AccountPageHeader title="الإعدادات" description="إعدادات حسابك ونشاطك" />

      <div className={styles.list}>
        <Link href="/account/notifications" className={styles.item}>
          <span className={styles.itemIcon}>
            <BellIcon size={20} />
          </span>
          <div className={styles.itemBody}>
            <strong>الإشعارات</strong>
            <small>تحكم في أنواع الإشعارات</small>
          </div>
          <ArrowLeftIcon size={16} className={styles.chev} />
        </Link>

        <Link href="/account/security" className={styles.item}>
          <span className={styles.itemIcon}>
            <LockIcon size={20} />
          </span>
          <div className={styles.itemBody}>
            <strong>الأمان</strong>
            <small>تغيير كلمة السر</small>
          </div>
          <ArrowLeftIcon size={16} className={styles.chev} />
        </Link>

        <Link href="/account/verify" className={styles.item}>
          <span className={styles.itemIcon}>
            <ShieldCheckIcon size={20} />
          </span>
          <div className={styles.itemBody}>
            <strong>التوثيق</strong>
            <small>رقم الجوال + البريد</small>
          </div>
          <ArrowLeftIcon size={16} className={styles.chev} />
        </Link>

        <Link href="/account/edit" className={styles.item}>
          <span className={styles.itemIcon}>
            <SettingsIcon size={20} />
          </span>
          <div className={styles.itemBody}>
            <strong>بيانات الحساب</strong>
            <small>الاسم + النبذة + الصورة</small>
          </div>
          <ArrowLeftIcon size={16} className={styles.chev} />
        </Link>

        <button
          type="button"
          className={`${styles.item} ${styles.danger}`}
          // Server-side logout
          onClick={undefined}
        >
          <span className={styles.itemIcon}>
            <LogoutIcon size={20} />
          </span>
          <div className={styles.itemBody}>
            <strong>تسجيل الخروج</strong>
            <small>اطلع من حسابك</small>
          </div>
        </button>
      </div>
    </div>
  )
}
