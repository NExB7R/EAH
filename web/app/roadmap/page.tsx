import type { Metadata } from 'next'
import SecondaryHero from '@/components/secondary-hero'
import {
  CheckCircleIcon,
  SparklesIcon,
  LampIcon,
  TrendingUpIcon,
  StoreIcon,
  TargetIcon,
} from '@/components/icons'
import styles from './roadmap.module.css'

export const metadata: Metadata = {
  'خطتنا',
  description: 'اللي خلص، اللي جاي، والرؤية الطويلة',
}

export const revalidate = 3600

type Item = {
  title: string
  body: string
  status: 'done' | 'current' | 'next' | 'future'
}

const PHASES: {
  key: string
  title: string
  Icon: React.ComponentType<{ size?: number }>
  items: Item[]
}[] = [
  {
    key: 'v1',
    title: 'الإصدار الأول (حالياً)',
    Icon: CheckCircleIcon,
    items: [
      { title: 'الاكتشاف والبحث', body: 'بحث، فلاتر، أقسام', status: 'done' },
      { title: 'صفحة النشاط', body: 'صور، منيو، فروع، واتساب', status: 'done' },
      { title: 'الحساب الكامل', body: 'نقاط، ولاء، دعوات، إشعارات', status: 'done' },
      { title: 'لوحة البايع', body: 'إحصائيات، تقارير، QR', status: 'done' },
      { title: 'لوحة الأدمن', body: 'إدارة كاملة، مراجعة، إشعارات', status: 'done' },
      { title: 'نظام التقييمات', body: 'تقييمات مرتبطة بطلب مكتمل + رد البايع + سمعة مبنية على الأدلة', status: 'done' },
      { title: 'Push Notifications', body: 'إشعارات فورية للمتصفح', status: 'done' },
    ],
  },
  {
    key: 'v1.5',
    title: 'الإصدار 1.5 — القادم',
    Icon: SparklesIcon,
    items: [
      { title: 'الطلب الكامل', body: 'تتبع حالة الطلب + إشعارات لحظية', status: 'current' },
      {
        title: 'العروض والكوبونات',
        body: 'البايع يعمل عرض، المتابعين يتبلغوا فوراً',
        status: 'current',
      },
      { title: 'Reveal Contact', body: 'كشف رقم البايع بعد التحقق', status: 'current' },
      { title: 'المساعد الذكي', body: 'AI Advisor لكل بايع', status: 'next' },
    ],
  },
  {
    key: 'v2',
    title: 'الإصدار 2 — خطة متوسطة',
    Icon: LampIcon,
    items: [
      { title: 'تطبيق موبايل', body: 'iOS + Android (PWA-first)', status: 'next' },
      { title: 'الدفع الإلكتروني', body: 'طلبات مباشرة داخل المنصة', status: 'next' },
      { title: 'نظام سائقين', body: 'توصيل منظم', status: 'future' },
      { title: 'Live tracking', body: 'تتبع مباشر للطلبات', status: 'future' },
    ],
  },
  {
    key: 'v3',
    title: 'الإصدار 3 — الرؤية الطويلة',
    Icon: TrendingUpIcon,
    items: [
      { title: 'التوسع الجغرافي', body: 'القليوبية → الدلتا', status: 'future' },
      { title: 'AI كامل', body: 'توصيات ذكية + كشف احتيال', status: 'future' },
      { title: 'نظام شريك', body: 'نموذج franchise', status: 'future' },
      { title: '10K+ نشاط', body: '500K مستخدم', status: 'future' },
    ],
  },
]

const STATUS_META = {
  done: { label: 'خلص', cls: 'done' },
  current: { label: 'قيد التنفيذ', cls: 'current' },
  next: { label: 'قريب', cls: 'next' },
  future: { label: 'مستقبل', cls: 'future' },
}

export default function RoadmapPage() {
  return (
    <main className={styles.page}>
      <SecondaryHero title="خطتنا" activeKey="roadmap" />

      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <TargetIcon size={14} />
            <span>بنشتغل خطوة بخطوة</span>
          </div>
          <h1 className={styles.heroTitle}>الطريق لـ EAH الكامل</h1>
          <p className={styles.heroText}>
            من نسخة تجريبية لـ منصة اكتشاف محلية كاملة. كل إصدار يبنى على اللي قبله.
          </p>
        </section>

        <div className={styles.timeline}>
          {PHASES.map((phase, idx) => (
            <section key={phase.key} className={styles.phase}>
              <div className={styles.phaseHead}>
                <span className={styles.phaseNum}>{String(idx + 1).padStart(2, '0')}</span>
                <span className={styles.phaseIcon}>
                  <phase.Icon size={20} />
                </span>
                <h2 className={styles.phaseTitle}>{phase.title}</h2>
              </div>

              <div className={styles.items}>
                {phase.items.map((item) => {
                  const meta = STATUS_META[item.status]
                  return (
                    <article key={item.title} className={styles.item}>
                      <div className={styles.itemHead}>
                        <h3 className={styles.itemTitle}>{item.title}</h3>
                        <span className={`${styles.badge} ${styles[meta.cls]}`}>{meta.label}</span>
                      </div>
                      <p className={styles.itemBody}>{item.body}</p>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        <section className={styles.cta}>
          <StoreIcon size={26} />
          <h2 className={styles.ctaTitle}>عايز تكون جزء من الرحلة؟</h2>
          <p className={styles.ctaText}>سجّل نشاطك مجاناً، أو كلمنا لو عندك فكرة نضيفها للخطة.</p>
          <div className={styles.ctaRow}>
            <a href="/merchant/apply" className={styles.btnPrimary}>
              سجّل نشاطك
            </a>
            <a href="/contact" className={styles.btnGhost}>
              ابعتلنا فكرة
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
