import Link from 'next/link'
import {
  InstallIcon,
  StoreIcon,
  WhatsAppIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  SparklesIcon,
} from './icons'
import styles from './about-free-app.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — About: Free App Section
// ═══════════════════════════════════════════════════════════

export default function AboutFreeApp() {
  return (
    <section className={styles.section}>
      <div className={styles.glow} aria-hidden />

      <div className={styles.content}>
        <span className={styles.badge}>
          <SparklesIcon size={14} />
          ميزة حصرية
        </span>

        <h2 className={styles.title}>
          إنت مش بتسجّل نشاط —<br />
          <span className={styles.accent}>إنت بتاخد تطبيقك الخاص</span>
        </h2>

        <p className={styles.lead}>
          تخيّل: اسم نشاطك قدام العميل. يشوف منيو، يتواصل معاك، ويطلب في ثانية. كل حاجة عندك — بدون
          رغي، بدون وسطاء.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <span className={styles.cardIcon}>
              <StoreIcon size={24} />
            </span>
            <h3 className={styles.cardTitle}>صفحتك باسمك</h3>
            <p className={styles.cardText}>صورة، وصف، منيو، فروع، أوقات — كلها على تطبيقك الخاص.</p>
          </div>

          <div className={styles.card}>
            <span className={styles.cardIcon}>
              <WhatsAppIcon size={24} />
            </span>
            <h3 className={styles.cardTitle}>طلبات كاملة في ثانية</h3>
            <p className={styles.cardText}>
              اسم، رقم، عنوان، أصناف، ملاحظات — كله يوصلك جاهز على واتساب.
            </p>
          </div>

          <div className={styles.card}>
            <span className={styles.cardIcon}>
              <InstallIcon size={24} />
            </span>
            <h3 className={styles.cardTitle}>ثبّته على موبايلك</h3>
            <p className={styles.cardText}>تطبيق ويب — يشتغل دون الحاجة إلى متجر التطبيقات.</p>
          </div>
        </div>

        <ul className={styles.benefits}>
          <li>
            <CheckCircleIcon size={16} />
            <span>مجاناً للأبد — من غير بطاقة</span>
          </li>
          <li>
            <CheckCircleIcon size={16} />
            <span>بدون عمولة على الطلبات</span>
          </li>
          <li>
            <CheckCircleIcon size={16} />
            <span>ترقيات اختيارية — تفضل صاحب القرار</span>
          </li>
        </ul>

        <div className={styles.cta}>
          <Link href="/merchant/apply" className={styles.btnPrimary}>
            <StoreIcon size={18} />
            <span>سجّل نشاطك مجاناً</span>
          </Link>
          <Link href="/pricing" className={styles.btnGhost}>
            <span>شوف الباقات</span>
            <ArrowLeftIcon size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
