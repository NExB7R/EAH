import AccountPageHeader from '@/components/account-page-header'
import { SparklesIcon, PaletteIcon, ToggleIcon, FileTextIcon } from '@/components/icons'
import styles from './studio.module.css'

export const dynamic = 'force-dynamic'

const SECTIONS = [
  {
    Icon: ToggleIcon,
    title: 'Feature Flags',
    body: 'تفعيل/إيقاف ميزات للجمهور (قريب)',
    status: 'قريب' as const,
  },
  {
    Icon: PaletteIcon,
    title: 'الألوان والخطوط',
    body: 'معاينة مباشرة للهوية (قريب)',
    status: 'قريب' as const,
  },
  {
    Icon: FileTextIcon,
    title: 'النصوص الثابتة',
    body: 'تعديل نصوص /about /terms (قريب)',
    status: 'قريب' as const,
  },
]

export default function StudioPage() {
  return (
    <div>
      <AccountPageHeader
        title="استوديو التصميم"
        description="تحكم كامل بالهوية والميزات — قيد التطوير"
      />

      <div className={styles.intro}>
        <span className={styles.introIcon}>
          <SparklesIcon size={20} />
        </span>
        <div>
          <h3 className={styles.introTitle}>استوديو EAH</h3>
          <p className={styles.introText}>
            هيتيحلك تعدّل الهوية والميزات بدون كود. كل تغيير بيمر على معاينة قبل النشر.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {SECTIONS.map((s) => (
          <article key={s.title} className={styles.card}>
            <span className={styles.cardIcon}>
              <s.Icon size={22} />
            </span>
            <div className={styles.cardBody}>
              <div className={styles.cardHead}>
                <h4 className={styles.cardTitle}>{s.title}</h4>
                <span className={styles.badge}>{s.status}</span>
              </div>
              <p className={styles.cardText}>{s.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
