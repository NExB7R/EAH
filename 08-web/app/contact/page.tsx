import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import { IconWhatsapp, IconFacebook } from '@/components/neon-icons'
import './contact.css'

export const metadata = {
  title: 'تواصل معنا',
  description: 'تواصل مع فريق EAH — للاستفسارات، الإعلانات، أو الإبلاغ عن مشكلة',
}

const CHANNELS = [
  {
    key: 'whatsapp',
    icon: 'whatsapp',
    title: 'واتساب',
    value: 'للرد السريع',
    href: 'https://wa.me/201012892806',
    desc: 'أسرع طريقة للوصول — رد خلال دقائق',
    accent: 'green',
  },
  {
    key: 'facebook',
    icon: 'facebook',
    title: 'فيسبوك',
    value: 'EAH Official',
    href: 'https://facebook.com/eah.eg',
    desc: 'تابع آخر الأخبار والعروض',
    accent: 'blue',
  },
]

const TOPICS = [
  { emoji: '🏪', title: 'أنا صاحب نشاط',      desc: 'مطعم، صيدلية، ماركت، توصيل — سجّل نشاطك', href: '/merchant/apply' },
  { emoji: '📢', title: 'إعلانات',            desc: 'عايز أعلن على المنصة',         href: '/advertise' },
  { emoji: '🐛', title: 'مشكلة تقنية',       desc: 'لقيت حاجة مش شغالة',           href: 'https://wa.me/201012892806' },
  { emoji: '💡', title: 'اقتراح أو فكرة',    desc: 'عندك فكرة تحسّن EAH',          href: 'https://wa.me/201012892806' },
]

export default function ContactPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="ct">
        <section className="ct-hero">
          <div className="ct-hero__glow" aria-hidden />
          <span className="ct-hero__kicker">EAH CONTACT</span>
          <h1 className="ct-hero__title">
            إحنا <span className="ct-hero__accent">في خدمتك</span>
          </h1>
          <p className="ct-hero__lead">
            عندك سؤال، اقتراح، أو عايز تعلن معانا؟ اختار الطريقة اللي تريحك.
          </p>
        </section>

        <section className="ct-channels">
          {CHANNELS.map((c) => (
            <a
              key={c.key}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className={`ct-channel ct-channel--${c.accent}`}
            >
              <span className="ct-channel__emoji">{c.icon === "whatsapp" ? <IconWhatsapp /> : c.icon === "facebook" ? <IconFacebook /> : c.icon}</span>
              <div className="ct-channel__body">
                <span className="ct-channel__title">{c.title}</span>
                <span className="ct-channel__value">{c.value}</span>
                <span className="ct-channel__desc">{c.desc}</span>
              </div>
              <span className="ct-channel__arrow">←</span>
            </a>
          ))}
        </section>

        <section className="ct-topics">
          <h2 className="ct-topics__title">عايز تتواصل بخصوص إيه؟</h2>
          <div className="ct-topics__grid">
            {TOPICS.map((t) => (
              <Link key={t.title} href={t.href} className="ct-topic">
                <span className="ct-topic__emoji">{t.emoji}</span>
                <span className="ct-topic__title">{t.title}</span>
                <span className="ct-topic__desc">{t.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="ct-note">
          <span className="ct-note__emoji">⚡</span>
          <div>
            <strong className="ct-note__title">وقت الرد</strong>
            <p className="ct-note__text">
              عادةً بنرد خلال ساعات. الواتساب هو الأسرع. كل الرسائل بتوصل مباشر لفريق EAH.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
