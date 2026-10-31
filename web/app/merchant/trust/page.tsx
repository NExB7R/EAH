import { redirect } from 'next/navigation'
import Link from 'next/link'
import AccountPageHeader from '@/components/account-page-header'
import { AlertIcon, CheckCircleIcon, ShieldCheckIcon, StarIcon, ArrowLeftIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import styles from './trust.module.css'

export const dynamic = 'force-dynamic'

export default async function MerchantTrustPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/trust')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  return (
    <div>
      <AccountPageHeader
        title="سمعة نشاطك"
        description="بيانات واضحة تساعد العملاء على فهم نشاطك وسجل التعاملات."
      />
      <section className={styles.summaryGrid} aria-label="مؤشرات سمعة النشاط">
        <article className={styles.summaryCard}>
          <span className={styles.summaryIcon}><ShieldCheckIcon size={20} /></span>
          <span className={styles.summaryLabel}>توثيق إدارة EAH</span>
          <strong className={business.is_verified ? styles.summaryVerified : styles.summaryValue}>
            {business.is_verified ? 'تم التحقق' : 'لم يتم التحقق بعد'}
          </strong>
          <p className={styles.summaryHint}>
            {business.is_verified ? 'تم التحقق من بيانات محددة للنشاط.' : 'أكمل بيانات نشاطك حتى تتمكن الإدارة من مراجعتها.'}
          </p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryIcon}><StarIcon size={20} /></span>
          <span className={styles.summaryLabel}>تقييم العملاء</span>
          <strong className={styles.summaryValue}>
            {business.rating_count > 0 ? `${business.rating_avg.toFixed(1)} / 5` : 'لا توجد تقييمات بعد'}
          </strong>
          <p className={styles.summaryHint}>
            {business.rating_count > 0 ? `${business.rating_count.toLocaleString('ar-EG')} تقييم` : 'يظهر التقييم بعد توفر تجارب تعامل حقيقية.'}
          </p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryIcon}><CheckCircleIcon size={20} /></span>
          <span className={styles.summaryLabel}>طلبات مكتملة على EAH</span>
          <strong className={styles.summaryValue}>{business.successful_orders.toLocaleString('ar-EG')}</strong>
          <p className={styles.summaryHint}>عدد فعلي للطلبات المسجلة كمكتملة على المنصة.</p>
        </article>
      </section>

      <section className={styles.explanationCard}>
        <h2 className={styles.helpTitle}>إزاي تحسن سمعة نشاطك؟</h2>
        <ul className={styles.helpList}>
          <li>✅ حافظ على معلومات النشاط وصوره ومواعيده محدثة.</li>
          <li>✅ وضّح حالة الطلب للمشتري وتابع الطلبات حتى اكتمالها.</li>
          <li>✅ اطلب تقييمًا بعد تجربة حقيقية، وتجنب التقييمات الوهمية أو المتبادلة.</li>
          <li>✅ تعامل مع الشكاوى بجدية؛ البلاغ وحده لا يثبت مخالفة، لكن الأدلة المثبتة قد تستدعي مراجعة الإدارة.</li>
        </ul>
      </section>

      <section className={styles.noticeCard}>
        <AlertIcon size={17} />
        <p>
          نقاط المشاركة والمشاهدات والإعجابات ليست دليلًا على جودة التعامل، ولا ترفع ترتيب سمعة نشاطك. لن يظهر للمشتري رقم مصداقية افتراضي؛ تظهر له التقييمات وسجل الطلبات والتوثيق كلٌّ بمعناه.
        </p>
      </section>
      <section className={styles.footer}>
        <Link href="/trust" className={styles.learnMore}>
          <span>اعرف قواعد السمعة والتوثيق</span>
          <ArrowLeftIcon size={14} />
        </Link>
      </section>
    </div>
  )
}
