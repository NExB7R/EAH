import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  SettingsIcon,
  BellIcon,
  LockIcon,
  LogoutIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ClockIcon,
  StoreIcon,
} from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import { getMerchantOrderSettings } from '@/lib/data/orders-settings'
import AccountPageHeader from '@/components/account-page-header'
import styles from './settings.module.css'

export const dynamic = 'force-dynamic'

export default async function MerchantSettingsPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/settings')

  const business = await getMyBusiness(session.userId)
  const orderSettings = business ? await getMerchantOrderSettings(business.id) : null

  return (
    <div>
      <AccountPageHeader title="الإعدادات" description="إعدادات نشاطك وحسابك" />

      {/* Business settings */}
      {business && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>النشاط</h2>
          <div className={styles.list}>
            <Link href="/merchant/business" className={styles.item}>
              <span className={styles.itemIcon}>
                <StoreIcon size={20} />
              </span>
              <div className={styles.itemBody}>
                <strong>بيانات النشاط</strong>
                <small>الاسم · الوصف · العنوان · اللوجو</small>
              </div>
              <ArrowLeftIcon size={16} className={styles.chev} />
            </Link>

            <Link href="/merchant/orders/settings" className={styles.item}>
              <span className={styles.itemIcon}>
                <ClockIcon size={20} />
              </span>
              <div className={styles.itemBody}>
                <strong>إعدادات استلام الطلبات</strong>
                <small>
                  {orderSettings?.orders_enabled
                    ? `مفعّل — تسليم ${orderSettings.delivery_eta_minutes ?? '—'} دقيقة`
                    : 'مش مفعّل حالياً'}
                </small>
              </div>
              <ArrowLeftIcon size={16} className={styles.chev} />
            </Link>
          </div>
        </section>
      )}

      {/* Account settings */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>الحساب</h2>
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
        </div>
      </section>

      {/* Logout */}
      <section className={styles.section}>
        <form action="/auth/logout" method="POST">
          <button type="submit" className={`${styles.item} ${styles.danger}`}>
            <span className={styles.itemIcon}>
              <LogoutIcon size={20} />
            </span>
            <div className={styles.itemBody}>
              <strong>تسجيل الخروج</strong>
              <small>اطلع من حسابك</small>
            </div>
          </button>
        </form>
      </section>
    </div>
  )
}
