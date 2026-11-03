import type { Metadata } from 'next'
import Link from 'next/link'
import SecondaryHero from '@/components/secondary-hero'
import {
  TargetIcon,
  StoreIcon,
  CrownGoldIcon,
  WhatsAppIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
  GiftIcon,
  ShareIcon,
  QrCodeIcon,
  LampIcon,
  AlertIcon,
  SparkleStarIcon,
} from '@/components/icons'
import SupportWidget from '@/components/support-widget'
import { isFeatureEnabled } from '@/lib/features'
import styles from './help.module.css'

export const metadata: Metadata = {
  title: 'المساعدة',
  description: 'دليل استخدام EAH — للمشتري والبايع',
}

export const revalidate = 3600

type Topic = {
  Icon: React.ComponentType<{ size?: number }>
  title: string
  body: string
  link?: { href: string; label: string }
}

const CUSTOMER_TOPICS: Topic[] = [
  {
    Icon: TargetIcon,
    title: 'اكتشف أنشطة حواليك',
    body: 'استخدم البحث، الفلاتر، أو الأقسام (مميزون، ترند، عروض، جديد، قريب منك).',
    link: { href: '/explore', label: 'روح للاكتشاف' },
  },
  {
    Icon: WhatsAppIcon,
    title: 'اطلب على واتساب',
    body: 'افتح صفحة النشاط واضغط "اطلب على واتساب" — رسالة جاهزة بتوصل للبايع مباشرة، بدون وسيط.',
  },
  {
    Icon: GiftIcon,
    title: 'اكسب نقاط',
    body: 'من التقييمات، المتابعات، والدعوات. النقاط بتتحول لمستويات (برونزي → ماسي) وكوبونات.',
    link: { href: '/account/points', label: 'شوف نقاطك' },
  },
  {
    Icon: BellIcon,
    title: 'فعّل الإشعارات',
    body: 'من حسابك، فعّل الإشعارات عشان توصلك العروض من الأنشطة اللي بتتابعها.',
    link: { href: '/account/notifications', label: 'إعدادات الإشعارات' },
  },
  {
    Icon: ShareIcon,
    title: 'ادعُ أصدقاءك',
    body: 'كل صديق يسجّل = +30 نقطة، أول طلب = +100 نقطة.',
    link: { href: '/account/referral', label: 'اعرف أكتر' },
  },
  {
    Icon: ShieldCheckIcon,
    title: 'الأمان والخصوصية',
    body: 'بياناتك محمية. الرقم مش بيتعرض للعلن. بيتحفظ مع EAH بس.',
    link: { href: '/privacy', label: 'سياسة الخصوصية' },
  },
]

const MERCHANT_TOPICS: Topic[] = [
  {
    Icon: StoreIcon,
    title: 'سجّل نشاطك',
    body: 'سجّل في 5 دقايق. ظهور مجاني — بدون عمولة على الطلبات.',
    link: { href: '/merchant/apply', label: 'ابدأ التسجيل' },
  },
  {
    Icon: BellIcon,
    title: 'استقبل الطلبات',
    body: 'المشتري يكلمك واتساب مباشرة. أكّد الطلب خلال 10 دقايق (الافتراضي).',
    link: { href: '/merchant/orders', label: 'شوف الطلبات' },
  },
  {
    Icon: QrCodeIcon,
    title: 'رمز الاستجابة السريعة للنشاط',
    body: 'حمّل الكود واطبعه — المشترين يمسحوه ويوصلوا لصفحتك في ثانية.',
    link: { href: '/merchant/qr', label: 'رمز الاستجابة السريعة' },
  },
  {
    Icon: LampIcon,
    title: 'المساعد الذكي',
    body: 'تحليل نشاطك، توصيات، تقارير — كلها في مكان واحد.',
    link: { href: '/merchant/insights', label: 'جربه' },
  },
  {
    Icon: CrownGoldIcon,
    title: 'الباقات المدفوعة',
    body: 'مميز / نمو / شراكة — كل واحدة بميزات أقوى. أول 30 يوم مجاناً.',
    link: { href: '/pricing', label: 'شوف الباقات' },
  },
  {
    Icon: UserIcon,
    title: 'التحكم الكامل',
    body: 'عدّل بياناتك، منيو، صور، فروع، أوقات من لوحة التحكم.',
    link: { href: '/merchant', label: 'لوحة التحكم' },
  },
]

export default async function HelpPage() {
  const supportOn = await isFeatureEnabled('support_bot_enabled')
  return (
    <main className={styles.page}>
      <SecondaryHero title="المساعدة" activeKey="help" />

      <div className={styles.container}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionBadge}>
              <UserIcon size={12} />
              للمشترين
            </span>
            <h2 className={styles.sectionTitle}>إزاي تستخدم EAH</h2>
          </div>
          <div className={styles.grid}>
            {CUSTOMER_TOPICS.map((t) => (
              <article key={t.title} className={styles.card}>
                <span className={styles.cardIcon}>
                  <t.Icon size={22} />
                </span>
                <h3 className={styles.cardTitle}>{t.title}</h3>
                <p className={styles.cardBody}>{t.body}</p>
                {t.link && (
                  <Link href={t.link.href} className={styles.cardLink}>
                    {t.link.label} ←
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={`${styles.sectionBadge} ${styles.badgeGold}`}>
              <StoreIcon size={12} />
              للبايع
            </span>
            <h2 className={styles.sectionTitle}>إزاي تنمّي نشاطك</h2>
          </div>
          <div className={styles.grid}>
            {MERCHANT_TOPICS.map((t) => (
              <article key={t.title} className={styles.card}>
                <span className={`${styles.cardIcon} ${styles.iconGold}`}>
                  <t.Icon size={22} />
                </span>
                <h3 className={styles.cardTitle}>{t.title}</h3>
                <p className={styles.cardBody}>{t.body}</p>
                {t.link && (
                  <Link href={t.link.href} className={styles.cardLink}>
                    {t.link.label} ←
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        {supportOn && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionBadge}>
                <SparkleStarIcon size={12} />
                مساعد فوري
              </span>
              <h2 className={styles.sectionTitle}>محتاج مساعدة فورية؟</h2>
            </div>
            <SupportWidget />
          </section>
        )}

        <section className={styles.faq}>
          <h2 className={styles.faqTitle}>أسئلة سريعة</h2>
          <details className={styles.faqItem}>
            <summary>هل EAH مجانية؟</summary>
            <p>
              أيوه — 100% مجانية للمشتري. وبدون عمولة على البايع. الربح من باقات اختيارية + إعلانات.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>إزاي أحذف حسابي؟</summary>
            <p>
              كلمنا من <Link href="/contact">صفحة التواصل</Link> وهيتم الحذف خلال 7 أيام.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>الرقم بيبان لأي حد؟</summary>
            <p>
              لا. الرقم محمي — أي حد يشوف نشاطك لازم يكون مسجل. البايع المرتبط بالنشاط يشوف إحصائيات الاتصال
              بس.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>مين اللي بيقيّم الأنشطة؟</summary>
            <p>كل مستخدم مسجل. التقييمات بتمر على مراجعة تلقائية أولاً، وبعدها بتظهر.</p>
          </details>

          <div className={styles.contactBox}>
            <AlertIcon size={16} />
            <p>
              لسه محتاج مساعدة؟ <Link href="/contact">كلمنا</Link> — رد سريع من الإدارة.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
