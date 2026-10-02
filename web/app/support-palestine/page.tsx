import type { Metadata } from 'next'
import Link from 'next/link'
import SecondaryHero from '@/components/secondary-hero'
import PalestineHeart from '@/components/palestine-heart'
import {
  HeartIcon,
  GlobeIcon,
  TargetIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CrownGoldIcon,
  CheckCircleIcon,
} from '@/components/icons'
import styles from './support-palestine.module.css'

export const metadata: Metadata = {
  title: 'فلسطين في القلب · EAH',
  description: 'التزام EAH بدعم فلسطين — 5% من أرباح الباقات والإعلانات',
}

export const revalidate = 86400

const COMMITMENTS = [
  {
    Icon: CrownGoldIcon,
    value: '5%',
    label: 'من أرباح الباقات',
    desc: 'كل باقة مدفوعة — نسبة ثابتة بتتحول لصندوق فلسطين',
  },
  {
    Icon: TargetIcon,
    value: '5%',
    label: 'من أرباح الإعلانات',
    desc: 'الإعلانات في المنصة كمان بتساهم بنفس النسبة',
  },
  {
    Icon: GlobeIcon,
    value: '100%',
    label: 'شفافية كاملة',
    desc: 'تقرير ربع سنوي بكل المبالغ المحوّلة والجهات المستفيدة',
  },
  {
    Icon: ShieldCheckIcon,
    value: '24/7',
    label: 'التزام دائم',
    desc: 'مش موسمي — بنساعد على مدار السنة بدون انقطاع',
  },
]

const PRINCIPLES = [
  {
    Icon: HeartIcon,
    title: 'منصة فلسطينية الهوى',
    body: 'EAH مش بس بشعار — القضية جزء من هوية المنصة. فلسطين في القلب، في كل صفحة، في كل تفصيلة.',
  },
  {
    Icon: SparklesIcon,
    title: 'مصرية الجذور',
    body: 'من قلب شبين القناطر — وبنفتخر إننا بنقدم حاجة لأهلنا في فلسطين من قلب مصر.',
  },
  {
    Icon: ShieldCheckIcon,
    title: 'صفر شعارات فاضية',
    body: 'مفيش كلام عن الدعم بدون فعل. النسب مكتوبة، التقارير منشورة، والالتزام قابل للتحقق.',
  },
]

const DESTINATIONS = [
  'الهلال الأحمر الفلسطيني',
  'الأونروا (UNRWA) — دعم اللاجئين',
  'مؤسسات إغاثة طبية موثوقة',
  'مبادرات تعليمية داخل فلسطين',
]

export default function SupportPalestinePage() {
  return (
    <main className={styles.page}>
      <SecondaryHero title="فلسطين في القلب" activeKey="support-palestine" tone="gold" />

      <div className={styles.container}>
        {/* Hero الوطني */}
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroFlag}>
            <PalestineHeart />
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine}>فلسطين</span>
            <span className={styles.titleAccent}>في القلب</span>
          </h1>
          <p className={styles.heroText}>
            EAH مش بس منصة اكتشاف — هي منصة ليها موقف. بنخصص جزء من أرباحنا لدعم أهلنا في فلسطين،
            ونعلن ده بشفافية كاملة.
          </p>
        </section>

        {/* الأرقام */}
        <section className={styles.commitSection}>
          <header className={styles.sectionHead}>
            <span className={styles.sectionBadge}>
              <TargetIcon size={12} />
              التزام بالأرقام
            </span>
            <h2 className={styles.sectionTitle}>كيف بنساعد؟</h2>
          </header>

          <div className={styles.commitGrid}>
            {COMMITMENTS.map((c) => (
              <article key={c.label} className={styles.commitCard}>
                <span className={styles.commitIcon}>
                  <c.Icon size={22} />
                </span>
                <span className={styles.commitValue}>{c.value}</span>
                <span className={styles.commitLabel}>{c.label}</span>
                <p className={styles.commitDesc}>{c.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* المبادئ */}
        <section className={styles.principlesSection}>
          <header className={styles.sectionHead}>
            <span className={`${styles.sectionBadge} ${styles.badgePurple}`}>
              <ShieldCheckIcon size={12} />
              موقفنا
            </span>
            <h2 className={styles.sectionTitle}>ليه EAH مش منصة عادية</h2>
          </header>

          <div className={styles.principlesGrid}>
            {PRINCIPLES.map((p) => (
              <article key={p.title} className={styles.principleCard}>
                <span className={styles.principleIcon}>
                  <p.Icon size={20} />
                </span>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p className={styles.principleBody}>{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* الوجهات */}
        <section className={styles.destSection}>
          <header className={styles.sectionHead}>
            <span className={styles.sectionBadge}>
              <GlobeIcon size={12} />
              الوجهات
            </span>
            <h2 className={styles.sectionTitle}>المبالغ بتروح فين؟</h2>
          </header>

          <ul className={styles.destList}>
            {DESTINATIONS.map((d) => (
              <li key={d} className={styles.destItem}>
                <CheckCircleIcon size={14} />
                <span>{d}</span>
              </li>
            ))}
          </ul>

          <p className={styles.destNote}>
            * يتم اختيار الجهات بالتنسيق مع مؤسسات فلسطينية موثوقة. التقارير الربع سنوية بتنشر على{' '}
            <Link href="/updates" className={styles.inlineLink}>
              صفحة التحديثات
            </Link>
            .
          </p>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <div className={styles.ctaGlow} aria-hidden />
          <span className={styles.ctaIcon}>
            <HeartIcon size={28} />
          </span>
          <h2 className={styles.ctaTitle}>عايز تساهم معانا؟</h2>
          <p className={styles.ctaText}>
            كل اشتراك مدفوع، كل إعلان، كل تفاعل — بيساهم في دعم أهلنا. لما تدعم EAH، إنت بتدعم
            فلسطين.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/pricing" className={styles.btnPrimary}>
              <CrownGoldIcon size={16} />
              <span>شوف الباقات</span>
            </Link>
            <Link href="/contact" className={styles.btnGhost}>
              تواصل معانا
            </Link>
          </div>
        </section>

        {/* الخاتمة */}
        <section className={styles.footer}>
          <p className={styles.footerLine}>
            من قلب شبين القناطر <span className={styles.heart}>·</span> لفلسطين الحرة
          </p>
        </section>
      </div>
    </main>
  )
}
