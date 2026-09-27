import { redirect } from 'next/navigation'
import {
  ShieldCheckIcon,
  PhoneIcon,
  FileTextIcon,
  CheckCircleIcon,
} from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getFullProfile } from '@/lib/data/account'
import AccountPageHeader from '@/components/account-page-header'
import styles from './verify.module.css'

export default async function VerifyPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/verify')

  const profile = await getFullProfile(session.userId)
  if (!profile) redirect('/auth?next=/account/verify')

  const phoneVerified = !!profile.phone_verified_at
  const emailVerified = session.emailVerified
  const bothVerified = phoneVerified && emailVerified

  return (
    <div>
      <AccountPageHeader
        title="التوثيق"
        description="وثّق حسابك لزيادة الثقة وكسب مزايا"
      />

      <div className={`${styles.banner} ${bothVerified ? styles.bannerOk : ''}`}>
        <span className={styles.bannerIcon}>
          <ShieldCheckIcon size={32} />
        </span>
        <div className={styles.bannerText}>
          <h3 className={styles.bannerTitle}>
            {bothVerified ? 'حسابك موثّق بالكامل ✓' : 'وثّق حسابك'}
          </h3>
          <p className={styles.bannerDesc}>
            {bothVerified
              ? 'كل حاجة تمام — استمتع بكل مزايا المنصة'
              : 'التوثيق بيرفع درجة الثقة ويفتحلك مزايا إضافية'}
          </p>
        </div>
      </div>

      <div className={styles.list}>
        <div className={`${styles.row} ${phoneVerified ? styles.rowOk : ''}`}>
          <span className={styles.rowIcon}>
            <PhoneIcon size={22} />
          </span>
          <div className={styles.rowBody}>
            <span className={styles.rowTitle}>توثيق رقم الجوال</span>
            <span className={styles.rowDesc}>
              {phoneVerified ? 'موثّق بالفعل' : 'هنبعتلك كود تحقق'}
            </span>
          </div>
          <span className={styles.rowStatus}>
            {phoneVerified ? <CheckCircleIcon size={20} /> : 'لاحقاً'}
          </span>
        </div>

        <div className={`${styles.row} ${emailVerified ? styles.rowOk : ''}`}>
          <span className={styles.rowIcon}>
            <FileTextIcon size={22} />
          </span>
          <div className={styles.rowBody}>
            <span className={styles.rowTitle}>توثيق البريد الإلكتروني</span>
            <span className={styles.rowDesc}>
              {emailVerified ? 'موثّق بالفعل' : 'هنبعتلك رابط تحقق'}
            </span>
          </div>
          <span className={styles.rowStatus}>
            {emailVerified ? <CheckCircleIcon size={20} /> : 'لاحقاً'}
          </span>
        </div>
      </div>

      <p className={styles.note}>
        نظام التوثيق الكامل هيتم إطلاقه قريب — للاستفسار تواصل معانا.
      </p>
    </div>
  )
}
