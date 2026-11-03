import type { Metadata } from 'next'
import Link from 'next/link'
import SecondaryHero from '@/components/secondary-hero'
import { ShieldCheckIcon, StoreIcon, StarIcon, CheckCircleIcon, AlertIcon, UserIcon } from '@/components/icons'
import styles from './trust.module.css'

export const metadata: Metadata = {
  title: 'السمعة والتوثيق',
  description: 'كيف نعرض توثيق الأنشطة وتقييماتها وسجل التعاملات بعدل وشفافية على EAH.',
}

const sellerSignals = [
  'توثيق إدارة EAH لبيانات النشاط، عندما يتم التحقق فعلًا.',
  'متوسط التقييم وعدد التقييمات المرتبطة بتعاملات مكتملة.',
  'عدد الطلبات المكتملة على المنصة، كحقيقة واضحة وليس ضمانًا لجودة كل طلب.',
]
const excludedSignals = [
  'المشاهدات والإعجابات والمتابعات والتعليقات وتسجيل الدخول اليومي لا ترفع سمعة النشاط.',
  'البلاغات المعلقة لا تخفض السمعة. أي إجراء سلبي يحتاج مراجعة إدارية ودليلًا واضحًا ومسار اعتراض.',
  'إلغاء الطلب وحده لا يثبت أن المشتري هو السبب؛ نحتاج تحديد الطرف المسؤول قبل استخدامه في أي تقييم.',
]

export default function TrustPage() {
  return (
    <main className={styles.page}>
      <SecondaryHero title="السمعة والتوثيق" Icon={ShieldCheckIcon} tone="purple" showNav={false} />
      <section className={styles.intro}>
        <h1 className={styles.introTitle}>
          سمعة مبنية على <span className={styles.accent}>أدلة حقيقية</span>
        </h1>
        <p className={styles.introText}>
          نفصل بين توثيق الحساب، وتجربة التعامل، ونقاط المشاركة. لا توجد درجة واحدة تضمن أن الشخص أو النشاط ممتاز؛
          نعرض كل معلومة ومعناها بوضوح، ولا نخمن عندما تكون البيانات قليلة.
        </p>
        <div className={styles.introPills}>
          <span className={styles.pill}><CheckCircleIcon size={14} /> التوثيق غير التقييم</span>
          <span className={styles.pill}><StarIcon size={14} /> التقييم يحتاج تعاملًا</span>
          <span className={styles.pill}><ShieldCheckIcon size={14} /> الخصوصية أولًا</span>
        </div>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><StoreIcon size={18} /> سمعة البايع والنشاط</h2>
        <div className={styles.tiersGrid}>
          <article className={styles.tierCard}>
            <span className={styles.tierEmoji}><ShieldCheckIcon size={24} /></span>
            <div className={styles.tierBody}>
              <h3 className={styles.tierLabel}>توثيق إدارة EAH</h3>
              <p className={styles.sectionText}>يعني أن بيانات محددة تم التحقق منها إداريًا؛ لا يعني أن كل طلب مضمون أو أن التقييم مرتفع.</p>
            </div>
          </article>
          <article className={styles.tierCard}>
            <span className={styles.tierEmoji}><StarIcon size={24} /></span>
            <div className={styles.tierBody}>
              <h3 className={styles.tierLabel}>التقييمات</h3>
              <p className={styles.sectionText}>نعرض متوسط التقييم وعدده معًا. التقييم دليل تجربة، وليس مجرد عدد تعليقات أو إعجابات.</p>
            </div>
          </article>
          <article className={styles.tierCard}>
            <span className={styles.tierEmoji}><CheckCircleIcon size={24} /></span>
            <div className={styles.tierBody}>
              <h3 className={styles.tierLabel}>الطلبات المكتملة</h3>
              <p className={styles.sectionText}>عدد الطلبات المكتملة على المنصة معلومة قابلة للفهم. النشاط الجديد لا يُعاقب لأنه لم يجمع سجلًا بعد.</p>
            </div>
          </article>
        </div>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><UserIcon size={18} /> موثوقية المشتري</h2>
        <p className={styles.sectionText}>
          لا نعرض درجة عامة للمشتري عبر البحث برقم هاتفه. عند وجود طلب مرتبط بحساب، يستطيع البايع رؤية حقائق محدودة تساعده على فهم سياق الطلب، مثل توثيق الهاتف وعدد الطلبات المكتملة المسجلة على EAH. هذه المعلومات ليست حكمًا نهائيًا على الشخص، ولا يُعتبر غياب السجل نقطة سلبية.
        </p>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><CheckCircleIcon size={18} /> ما الذي يدخل في السمعة؟</h2>
        <ul className={styles.eventsList}>
          {sellerSignals.map((text) => (
            <li key={text} className={styles.eventItem}>
              <span className={styles.eventIcon}>✓</span>
              <span className={styles.eventLabel}>{text}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><AlertIcon size={18} /> ما الذي لا يدخل فيها تلقائيًا؟</h2>
        <ul className={styles.eventsList}>
          {excludedSignals.map((text) => (
            <li key={text} className={styles.eventItem}>
              <span className={styles.eventIcon}>•</span>
              <span className={styles.eventLabel}>{text}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.cta}>
        <Link href="/explore" className={styles.ctaBtn}>اكتشف الأنشطة</Link>
        <Link href="/merchant/trust" className={styles.ctaSecondary}>عندك نشاط؟ راجع سمعة نشاطك من لوحة البايع</Link>
      </section>
    </main>
  )
}
