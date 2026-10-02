import type { Metadata } from 'next'
import SecondaryHero from '@/components/secondary-hero'
import {
  WhatsAppIcon,
  FacebookIcon,
  BroadcastIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  FileTextIcon,
} from '@/components/icons'
import styles from './contact.module.css'

export const metadata: Metadata = {
  title: 'تواصل معانا · EAH',
  description: 'كلمنا على واتساب، أو تابع قناتنا — رد سريع من إدارة EAH',
}

export const revalidate = 3600

const CONTACTS = {
  whatsapp: 'https://wa.me/201012892806',
  channel: 'https://whatsapp.com/channel/eaH',
  facebook: 'https://facebook.com/eah.eg',
  email: 'nexb7r@gmail.com',
}

const REASONS = [
  {
    Icon: WhatsAppIcon,
    title: 'استفسار سريع',
    body: 'اطلب، اسأل، أو اقترح — رد خلال دقايق',
    cta: 'كلم المسؤول',
    href: CONTACTS.whatsapp,
    tone: 'wa' as const,
  },
  {
    Icon: BroadcastIcon,
    title: 'قناة الواتساب',
    body: 'أول ما ينزل عرض جديد، إنت أول واحد يعرف',
    cta: 'اشترك في القناة',
    href: CONTACTS.channel,
    tone: 'channel' as const,
  },
  {
    Icon: FacebookIcon,
    title: 'صفحة فيسبوك',
    body: 'أخبار EAH، فرص للشركاء، وتحديثات المنصة',
    cta: 'تابع الصفحة',
    href: CONTACTS.facebook,
    tone: 'fb' as const,
  },
  {
    Icon: FileTextIcon,
    title: 'إيميل رسمي',
    body: 'للاستفسارات الرسمية والشراكات',
    cta: CONTACTS.email,
    href: `mailto:${CONTACTS.email}`,
    tone: 'email' as const,
  },
]

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <SecondaryHero title="تواصل معانا" activeKey="contact" />

      <div className={styles.container}>
        <section className={styles.intro}>
          <span className={styles.introIcon}>
            <PhoneIcon size={26} />
          </span>
          <h1 className={styles.introTitle}>إحنا هنا عشان نساعدك</h1>
          <p className={styles.introText}>
            رد سريع من فريق EAH — بدون لف، بدون انتظار. اختار الطريقة اللي تريحك.
          </p>
        </section>

        <div className={styles.grid}>
          {REASONS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.card} ${styles[c.tone]}`}
            >
              <span className={styles.cardIcon}>
                <c.Icon size={22} />
              </span>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardBody}>{c.body}</p>
              <span className={styles.cardCta}>{c.cta} ←</span>
            </a>
          ))}
        </div>

        <section className={styles.info}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>
              <MapPinIcon size={18} />
            </span>
            <div>
              <h4 className={styles.infoTitle}>الموقع</h4>
              <p className={styles.infoBody}>شبين القناطر — القليوبية، مصر</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>
              <ClockIcon size={18} />
            </span>
            <div>
              <h4 className={styles.infoTitle}>وقت الرد</h4>
              <p className={styles.infoBody}>كل يوم، من 9 صباحاً لـ 11 مساءً</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
