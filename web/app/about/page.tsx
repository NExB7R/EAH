import type { Metadata } from 'next'
import Link from 'next/link'
import Logo from '@/components/logo'
import {
  SearchIcon,
  MicIcon,
  CrownGoldIcon,
  ShieldCheckIcon,
  TagIcon,
  GiftIcon,
  StoreIcon,
  WhatsAppIcon,
  StarIcon,
  TrendingUpIcon,
  BellIcon,
  InstallIcon,
  LayoutDashboardIcon,
  NavigationIcon,
  SparkleStarIcon,
  ArrowLeftIcon,
  MapPinIcon,
} from '@/components/icons'
import AboutFreeApp from '@/components/about-free-app'
import { getPublishedBusinessCount } from '@/lib/data/businesses'
import styles from './about.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — About / Pitch
//   • بيتش كامل للمنصة (للمشتري + للبايع)
//   • صفر JS — Server Component
// ═══════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: 'من نحن',
  description: 'EAH — منصة اكتشاف محلية مصرية. مجانية للمشتري، بدون عمولة على البايع.',
}

export default async function AboutPage() {
  const publishedCount = await getPublishedBusinessCount()

  return (
    <main className={styles.page}>
      {/* ═══ 1. Hero ═══ */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroGrid} aria-hidden />

        <div className={styles.heroContent}>
          <div className={styles.heroLogo}>
            <Logo size="lg" />
          </div>

          <span className={styles.heroBadge}>
            <MapPinIcon size={12} />
            من قلب شبين القناطر
          </span>

          <h1 className={styles.heroTitle}>
            شبيك لبيك .. <span className={styles.accent}>كل حاجة حواليك</span>
          </h1>

          <p className={styles.heroText}>
            منصة اكتشاف محلية مصرية، بتوصّل أهل شبين القناطر والقرى حواليها بأماكنهم المفضلة. مجانية
            للمشتري، بدون عمولة على البايع.
          </p>

          <div className={styles.heroActions}>
            <Link href="/explore" className={styles.btnPrimary}>
              <SearchIcon size={18} />
              اكتشف الأنشطة
            </Link>
            <Link href="/about/presentation" className={styles.btnSecondary}>
              اعرض المنصة
              <ArrowLeftIcon size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 2. المشكلة ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>المشكلة</span>
            <h2 className={styles.sectionTitle}>ليه EAH موجودة؟</h2>
            <p className={styles.sectionText}>
              في شبين القناطر، أصحاب الأنشطة مش دايماً معروفين. والمستخدم بيدور كتير عشان يلاقي مكان
              كويس.
            </p>
          </header>

          <div className={styles.problemGrid}>
            <div className={styles.problemCard}>
              <span className={styles.problemNum}>01</span>
              <h3 className={styles.problemTitle}>مفيش دليل موحد</h3>
              <p className={styles.problemText}>
                كل نشاط ليه صفحة فيسبوك أو رقم واتساب، بس مفيش مكان يجمعهم كلهم في حتة واحدة.
              </p>
            </div>
            <div className={styles.problemCard}>
              <span className={styles.problemNum}>02</span>
              <h3 className={styles.problemTitle}>التقييمات مبعترة</h3>
              <p className={styles.problemText}>
                مفيش طريقة موثوقة تعرف منها النشاط ده كويس ولا لأ، وبناءً على إيه.
              </p>
            </div>
            <div className={styles.problemCard}>
              <span className={styles.problemNum}>03</span>
              <h3 className={styles.problemTitle}>البايعين محتاجين ظهور</h3>
              <p className={styles.problemText}>
                البايع محتاج يوصل للناس، بس مش عايز يدفع عمولات كل طلب.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. الحل ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>الحل</span>
            <h2 className={styles.sectionTitle}>EAH بتحل ده إزاي؟</h2>
          </header>

          <div className={styles.solutionGrid}>
            <div className={styles.solutionCard}>
              <span className={styles.solutionIcon}>
                <SearchIcon size={26} />
              </span>
              <h3 className={styles.solutionTitle}>اكتشاف سهل</h3>
              <p className={styles.solutionText}>
                بحث ذكي باللهجة المصرية، فلاتر دقيقة، ترشيحات شخصية.
              </p>
            </div>
            <div className={styles.solutionCard}>
              <span className={styles.solutionIcon}>
                <WhatsAppIcon size={26} />
              </span>
              <h3 className={styles.solutionTitle}>طلب مباشر</h3>
              <p className={styles.solutionText}>
                بدون وسيط. المشتري يطلب واتساب مباشرة، والبايع يرد في دقائق.
              </p>
            </div>
            <div className={styles.solutionCard}>
              <span className={styles.solutionIcon}>
                <ShieldCheckIcon size={26} />
              </span>
              <h3 className={styles.solutionTitle}>تقييم موثوق</h3>
              <p className={styles.solutionText}>
                تقييمات بعد التجربة، معلومات واضحة عن كل نشاط بشفافية كاملة.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AboutFreeApp />

      {/* ═══ 4. للمشتري ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <span className={`${styles.sectionBadge} ${styles.badgePurple}`}>للمشتري</span>
            <h2 className={styles.sectionTitle}>مجاناً 100%</h2>
            <p className={styles.sectionText}>
              كل حاجة تحتاجها عشان تكتشف وتطلب، بدون رسوم ولا اشتراكات.
            </p>
          </header>

          <div className={styles.featureGrid}>
            <FeatureCard
              Icon={SearchIcon}
              title="بحث ذكي"
              text="باللهجة المصرية — يفهمك من أول كلمة."
            />
            <FeatureCard Icon={MicIcon} title="بحث صوتي" text="اتكلم، والنظام يدور لك." />
            <FeatureCard
              Icon={SparkleStarIcon}
              title="ترشيحات شخصية"
              text="حسب تاريخك وموقعك واهتماماتك."
            />
            <FeatureCard Icon={TagIcon} title="عروض حقيقية" text="خصومات من أنشطة قريبة منك." />
            <FeatureCard Icon={GiftIcon} title="نقاط ومكافآت" text="اجمع نقاط واستبدلها بعروض." />
            <FeatureCard
              Icon={BellIcon}
              title="إشعارات فورية"
              text="أول ما يطلع عرض من نشاط متابع."
            />
            <FeatureCard
              Icon={NavigationIcon}
              title="قريب منك"
              text="اكتشف اللي حواليك في ثواني."
            />
            <FeatureCard
              Icon={InstallIcon}
              title="ثبّت التطبيق"
              text="اشتغل بدون إنترنت بعد أول زيارة."
            />
          </div>
        </div>
      </section>

      {/* ═══ 5. للبايع ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <span className={`${styles.sectionBadge} ${styles.badgeGold}`}>للبايع</span>
            <h2 className={styles.sectionTitle}>ظهور مجاني. بدون عمولة.</h2>
            <p className={styles.sectionText}>سجّل نشاطك في 5 دقايق. مش بناخد أي نسبة من طلباتك.</p>
          </header>

          <div className={styles.featureGrid}>
            <FeatureCard
              Icon={StoreIcon}
              title="صفحة نشاط كاملة"
              text="صور، منيو، فروع، أوقات، تواصل."
            />
            <FeatureCard
              Icon={WhatsAppIcon}
              title="طلبات واتساب"
              text="المشتري يكلمك مباشرة — بدون وسيط."
            />
            <FeatureCard
              Icon={LayoutDashboardIcon}
              title="لوحة تحكم"
              text="إحصائيات، تقارير، تحكم كامل."
            />
            <FeatureCard
              Icon={TrendingUpIcon}
              title="تحليلات"
              text="شوف زوارك، ومصادرهم، وسلوكهم."
            />
            <FeatureCard
              Icon={StarIcon}
              title="تقييمات موثوقة"
              text="رد على المشترين، وحسّن سمعتك."
            />
            <FeatureCard
              Icon={ShieldCheckIcon}
              title="شارة الثقة"
              text="كل ما تتفاعل، تترقّى في التصنيف."
            />
            <FeatureCard Icon={GiftIcon} title="عروض وقسائم" text="اعمل عروض لجذب مشترين جدد." />
            <FeatureCard
              Icon={CrownGoldIcon}
              title="ترقيات اختيارية"
              text="ظهور أعلى، شارات، إدارة متقدمة لعلاقات المشترين."
            />
          </div>

          <div className={styles.ctaRow}>
            <Link href="/merchant/apply" className={styles.btnPrimary}>
              سجّل نشاطك مجاناً
              <ArrowLeftIcon size={16} />
            </Link>
            <Link href="/pricing" className={styles.btnGhost}>
              شوف الباقات
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 6. أرقام ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <StatCard
              num={publishedCount === null ? '—' : String(publishedCount)}
              label={publishedCount === null ? 'عدد الأنشطة غير متاح' : 'نشاط منشور'}
            />
            <StatCard num="100%" label="مجاني للمشتري" />
            <StatCard num="0%" label="عمولة على البايع" />
            <StatCard num="24/7" label="متاح دايماً" />
          </div>
        </div>
      </section>

      {/* ═══ 7. إزاي بيشتغل ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>إزاي</span>
            <h2 className={styles.sectionTitle}>3 خطوات بس</h2>
          </header>

          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <h3 className={styles.stepTitle}>اكتشف</h3>
              <p className={styles.stepText}>
                ابحث أو اتفرج على الأقسام (مميزون، ترند، عروض، جديد).
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <h3 className={styles.stepTitle}>اتواصل</h3>
              <p className={styles.stepText}>دوس زر الواتساب — رسالة جاهزة لنشاطك المفضل.</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <h3 className={styles.stepTitle}>قيّم</h3>
              <p className={styles.stepText}>ساعد غيرك — تقييمك بيعلي تقييم النشاط.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. القضية ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.palestine}>
            <div className={styles.palestineGlow} aria-hidden />
            <div className={styles.palestineContent}>
              <span className={styles.palestineFlag}>🇵🇸</span>
              <h2 className={styles.palestineTitle}>فلسطين في القلب</h2>
              <p className={styles.palestineText}>
                EAH منصة فلسطينية الهوى، مصرية الجذور. بنخصص 2% من دخل الباقات لصندوق دعم فلسطين.
              </p>
              <Link href="/support-palestine" className={styles.btnGhost}>
                اعرف أكتر
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 9. CTA ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.cta}>
            <div className={styles.ctaGlow} aria-hidden />
            <h2 className={styles.ctaTitle}>
              جاهز تبدأ مع <span className={styles.accent}>EAH</span>؟
            </h2>
            <p className={styles.ctaText}>اكتشف، اطلب، قيّم. أو سجّل نشاطك وخلّي الناس تعرفك.</p>
            <div className={styles.ctaRow}>
              <Link href="/explore" className={styles.btnPrimary}>
                اكتشف الأنشطة
              </Link>
              <Link href="/merchant/apply" className={styles.btnSecondary}>
                سجّل نشاطك
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── Sub-components ───
function FeatureCard({
  Icon,
  title,
  text,
}: {
  Icon: React.ComponentType<{ size?: number }>
  title: string
  text: string
}) {
  return (
    <div className={styles.featureCard}>
      <span className={styles.featureIcon}>
        <Icon size={20} />
      </span>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureText}>{text}</p>
    </div>
  )
}

function StatCard({ num, label }: { num: string; label: string }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statNum}>{num}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}
