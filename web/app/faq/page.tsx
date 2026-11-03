import type { Metadata } from 'next'
import Link from 'next/link'
import SecondaryHero from '@/components/secondary-hero'
import { UserIcon, StoreIcon, ShieldCheckIcon, GiftIcon, WhatsAppIcon } from '@/components/icons'
import styles from './faq.module.css'

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة',
  description: 'أسئلة متكررة عن EAH — للعميل والتاجر',
}

export const revalidate = 3600

type QA = { q: string; a: string; link?: { href: string; label: string } }

const CUSTOMER_FAQ: QA[] = [
  {
    q: 'هل EAH مجانية؟',
    a: 'أيوه، 100% مجانية للعميل. مفيش رسوم، مفيش اشتراكات، مفيش عمولات على الطلبات.',
  },
  {
    q: 'إزاي أطلب من نشاط؟',
    a: 'افتح صفحة النشاط، اضغط "اطلب على واتساب"، املأ البيانات، ونفتحلك واتساب برسالة جاهزة للطلب.',
    link: { href: '/explore', label: 'اكتشف أنشطة' },
  },
  {
    q: 'إزاي أكسب نقاط؟',
    a: 'كل تفاعل بيديك نقاط: تسجيل دخول يومي (5)، تقييم (20)، متابعة (5)، دعوة صديق (30-100)، وغيرها. النقاط بتتحول لمستويات (برونزي → ماسي) وكوبونات.',
    link: { href: '/account/points', label: 'شوف نقاطك' },
  },
  {
    q: 'إيه فايدة المتابعة؟',
    a: 'أول ما النشاط ينزل عرض جديد، هيوصلك إشعار فوري. كمان تشوف كل تحديثاته في /account/following.',
  },
  {
    q: 'الرقم بيبان لأي حد؟',
    a: 'لا. رقمك محفوظ ومش بيظهر لأي حد — لا تجار ولا عملاء. التاجر المرتبط بالنشاط يشوف إحصائيات الاتصال بس (كم واحد اتصل).',
  },
  {
    q: 'إزاي أفعّل الإشعارات؟',
    a: 'من /account/notifications — اضغط "تفعيل". الإشعارات بتشتغل على أجهزة آيفون من الإصدار 16.4 فأحدث بعد تثبيت التطبيق، وأجهزة أندرويد، والكمبيوتر.',
    link: { href: '/account/notifications', label: 'إعدادات الإشعارات' },
  },
  {
    q: 'ممكن أثبّت التطبيق على الموبايل؟',
    a: 'أيوه — من قائمة المتصفح اختار "إضافة للشاشة الرئيسية". بعدها EAH بيشتغل كتطبيق كامل دون الحاجة إلى متجر التطبيقات.',
  },
  {
    q: 'إزاي أحذف حسابي؟',
    a: 'كلمنا من /contact، والبيانات بتتحذف خلال 7 أيام.',
    link: { href: '/contact', label: 'تواصل معانا' },
  },
]

const MERCHANT_FAQ: QA[] = [
  {
    q: 'التسجيل بفلوس؟',
    a: 'لا، مجاني 100%. الباقات المدفوعة (مميز/نمو/شراكة) اختيارية، وبتزود ظهورك وميزات إضافية.',
  },
  {
    q: 'بتاخدوا عمولة على الطلبات؟',
    a: 'لا، صفر عمولة. كل أرباح الطلبات ليك. EAH مش وسيط — بس بتوصلك بالعميل مباشرة.',
  },
  {
    q: 'إزاي أستقبل طلبات؟',
    a: 'العميل يدوس "اطلب على واتساب"، بيدخل بياناته، والنظام يبعتلك إشعار فوري. افتح /merchant/orders وأكّد الطلب.',
    link: { href: '/merchant/orders', label: 'شوف الطلبات' },
  },
  {
    q: 'إزاي أعمل عرض؟',
    a: 'من /merchant/offers — اضغط "عرض جديد"، املأ البيانات، ولو نشرته → كل متابعينك هيوصلهم إشعار فوري.',
    link: { href: '/merchant/offers', label: 'العروض' },
  },
  {
    q: 'كيف أنشئ رمز الاستجابة السريعة للنشاط؟',
    a: 'من /merchant/qr — ولّد الكود، نزّله كصورة، واطبعه على واجهة المحل أو المنيو. لما العميل يمسحه بيفتح صفحتك فوراً.',
    link: { href: '/merchant/qr', label: 'رمز الاستجابة السريعة' },
  },
  {
    q: 'إيه فايدة المساعد الذكي؟',
    a: 'بتحلل نشاطك، بتديك توصيات (إيه الأوقات اللي بيجي فيها عملاء أكتر، إيه اللي ينقصك)، وتقارير قابلة للطباعة.',
    link: { href: '/merchant/insights', label: 'جربه' },
  },
  {
    q: 'إزاي أشيل تقييم مسيء؟',
    a: 'من صفحة النشاط، اضغط "إبلاغ". المراجعة بتشوفه خلال 24-48 ساعة. لو مسيء فعلاً، بيتشال.',
  },
  {
    q: 'إيه الباقات المتاحة؟',
    a: 'أساسية (مجانية) + مميزة (200 ج) + نمو (500 ج) + شراكة (1,500 ج). أول 30 يوم مجاناً على أي باقة.',
    link: { href: '/pricing', label: 'شوف الباقات' },
  },
]

const GENERAL_FAQ: QA[] = [
  {
    q: 'EAH بتشتغل على أي أجهزة؟',
    a: 'كل حاجة — هاتف محمول بنظامي آيفون أو أندرويد، تابلت، لابتوب، كمبيوتر. من شاشة 320px لأكبر شاشة.',
  },
  {
    q: 'بتشتغل بدون إنترنت؟',
    a: 'جزئياً — الصفحات اللي زرتها قبل كده بتفضل متاحة offline. الفلترة والبحث بيحتاجوا اتصال.',
  },
  {
    q: 'إيه الفرق بين EAH وجروبات الفيسبوك؟',
    a: '1) بحث سريع بدل ما تدور على بوست. 2) تقييمات موثوقة مش كلام مرسل. 3) طلب مباشر بدون وسيط. 4) كل حاجة على موبايلك.',
  },
  {
    q: 'EAH بتشتغل في أي مناطق؟',
    a: 'بدأنا في شبين القناطر والقرى حواليها، والخطة نتوسّع في القليوبية وبعدها الدلتا.',
    link: { href: '/roadmap', label: 'شوف الخطة' },
  },
  {
    q: 'ممكن أشارك المنصة مع صحابي؟',
    a: 'أيوه! من /account/referral هتلاقي كود دعوة — كل صديق يسجّل = +30 نقطة، أول طلب = +100 نقطة.',
    link: { href: '/account/referral', label: 'دعوة أصدقاء' },
  },
]

const CATEGORIES = [
  { key: 'customer', title: 'للمشترين', Icon: UserIcon, items: CUSTOMER_FAQ, tone: 'purple' },
  { key: 'merchant', title: 'للبايع', Icon: StoreIcon, items: MERCHANT_FAQ, tone: 'gold' },
  { key: 'general', title: 'عام', Icon: ShieldCheckIcon, items: GENERAL_FAQ, tone: 'teal' },
] as const

export default function FaqPage() {
  return (
    <main className={styles.page}>
      <SecondaryHero title="الأسئلة الشائعة" activeKey="faq" />

      <div className={styles.container}>
        <section className={styles.intro}>
          <span className={styles.introBadge}>
            <GiftIcon size={14} />
            <span>إجابات سريعة</span>
          </span>
          <h1 className={styles.introTitle}>كل اللي محتاج تعرفه عن EAH</h1>
          <p className={styles.introText}>
            جمّعنا هنا الأسئلة الأكثر شيوعاً — للعميل، والتاجر، وأسئلة عامة.
          </p>
        </section>

        {CATEGORIES.map((cat) => (
          <section key={cat.key} className={styles.section}>
            <header className={styles.sectionHead}>
              <span className={`${styles.sectionIcon} ${styles[`icon_${cat.tone}`]}`}>
                <cat.Icon size={22} />
              </span>
              <h2 className={styles.sectionTitle}>{cat.title}</h2>
              <span className={styles.sectionCount}>{cat.items.length}</span>
            </header>

            <div className={styles.list}>
              {cat.items.map((item) => (
                <details key={item.q} className={styles.item}>
                  <summary className={styles.summary}>
                    <span>{item.q}</span>
                    <span className={styles.chevron} aria-hidden />
                  </summary>
                  <div className={styles.answer}>
                    <p>{item.a}</p>
                    {item.link && (
                      <Link href={item.link.href} className={styles.answerLink}>
                        {item.link.label} ←
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <section className={styles.cta}>
          <span className={styles.ctaIcon}>
            <WhatsAppIcon size={28} />
          </span>
          <h2 className={styles.ctaTitle}>لسه عندك سؤال؟</h2>
          <p className={styles.ctaText}>كلمنا مباشرة على واتساب — رد خلال دقايق.</p>
          <div className={styles.ctaRow}>
            <Link href="/contact" className={styles.ctaPrimary}>
              تواصل معانا
            </Link>
            <Link href="/help" className={styles.ctaGhost}>
              دليل الاستخدام
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
