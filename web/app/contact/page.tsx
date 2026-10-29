import type { Metadata } from 'next'
import Link from 'next/link'
import SecondaryHero from '@/components/secondary-hero'
import { WhatsAppIcon, FacebookIcon, BroadcastIcon, PhoneIcon, FileTextIcon } from '@/components/icons'
import { getPublicContactSettings } from '@/lib/data/site-settings'
import styles from './contact.module.css'

export const metadata: Metadata = {
  title: 'تواصل معانا',
  description: 'قنوات التواصل الرسمية ومركز المساعدة لمنصة EAH',
}

export const revalidate = 3600

export default async function ContactPage() {
  const contacts = await getPublicContactSettings()

  return (
    <main className={styles.page}>
      <SecondaryHero title="تواصل معانا" activeKey="contact" />
      <div className={styles.container}>
        <section className={styles.intro}>
          <span className={styles.introIcon}><PhoneIcon size={26} /></span>
          <h1 className={styles.introTitle}>إحنا هنا عشان نساعدك</h1>
          <p className={styles.introText}>
            {contacts.enabled
              ? 'اختار قناة التواصل الرسمية المناسبة ليك، أو استخدم مركز المساعدة.'
              : 'قنوات التواصل الرسمية هتظهر هنا بعد اعتماد بياناتها. مش هنحط رقم أو رابط غير مؤكد.'}
          </p>
        </section>

        {contacts.enabled && (
          <div className={styles.grid}>
            {contacts.supportWhatsappUrl && (
              <a href={contacts.supportWhatsappUrl} target="_blank" rel="noopener noreferrer" className={`${styles.card} ${styles.wa}`}>
                <span className={styles.cardIcon}><WhatsAppIcon size={22} /></span>
                <h3 className={styles.cardTitle}>تواصل مع الدعم على واتساب</h3>
                <p className={styles.cardBody}>استفساراتك وملاحظاتك لفريق EAH.</p>
                <span className={styles.cardCta}>افتح واتساب ←</span>
              </a>
            )}
            {contacts.whatsappChannelUrl && (
              <a href={contacts.whatsappChannelUrl} target="_blank" rel="noopener noreferrer" className={`${styles.card} ${styles.channel}`}>
                <span className={styles.cardIcon}><BroadcastIcon size={22} /></span>
                <h3 className={styles.cardTitle}>قناة واتساب</h3>
                <p className={styles.cardBody}>تحديثات وإعلانات المنصة في القناة الرسمية.</p>
                <span className={styles.cardCta}>افتح القناة ←</span>
              </a>
            )}
            {contacts.facebookUrl && (
              <a href={contacts.facebookUrl} target="_blank" rel="noopener noreferrer" className={`${styles.card} ${styles.fb}`}>
                <span className={styles.cardIcon}><FacebookIcon size={22} /></span>
                <h3 className={styles.cardTitle}>صفحة فيسبوك</h3>
                <p className={styles.cardBody}>المحتوى والتحديثات المنشورة رسميًا من EAH.</p>
                <span className={styles.cardCta}>تابع الصفحة ←</span>
              </a>
            )}
            {contacts.email && (
              <a href={`mailto:${contacts.email}`} className={`${styles.card} ${styles.email}`}>
                <span className={styles.cardIcon}><FileTextIcon size={22} /></span>
                <h3 className={styles.cardTitle}>إيميل الدعم</h3>
                <p className={styles.cardBody}>للاستفسارات الرسمية والتعاون.</p>
                <span className={styles.cardCta}>{contacts.email}</span>
              </a>
            )}
          </div>
        )}

        <section className={styles.helpSection}>
          <div className={styles.helpCopy}>
            <h2 className={styles.helpTitle}>محتاج مساعدة دلوقتي؟</h2>
            <p className={styles.helpText}>تقدر تراجع مركز المساعدة أو الأسئلة الشائعة لحد تفعيل قنوات التواصل الرسمية.</p>
          </div>
          <div className={styles.helpActions}>
            <Link href="/help" className={styles.helpLink}>مركز المساعدة</Link>
            <Link href="/faq" className={styles.helpLinkSecondary}>الأسئلة الشائعة</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
