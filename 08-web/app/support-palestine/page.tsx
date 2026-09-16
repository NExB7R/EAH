import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './palestine.css'

export const metadata = {
  title: 'دعم فلسطين',
  description: 'فلسطين في القلب — تعرّف على طرق دعم حقيقية وآمنة.',
}

const WAYS = [
  {
    emoji: '🕌',
    title: 'تبرع للمساجد والأوقاف',
    body: 'المساجد المحلية بتجمّع تبرعات مخصصة لفلسطين. اسأل إمام مسجدك عن الحملة الحالية.',
  },
  {
    emoji: '🏥',
    title: 'منظمات الإغاثة الطبية',
    body: 'الهلال الأحمر المصري، ومؤسسة "أطباء بلا حدود" عندهم قنوات رسمية موثوقة للتبرع.',
  },
  {
    emoji: '📢',
    title: 'انشر الوعي',
    body: 'المشاركة على السوشيال ميديا (بحقائق موثقة، من غير محتوى عنيف) أداة فعالة.',
  },
  {
    emoji: '🛒',
    title: 'ادعم المنتجات المقاطعة',
    body: 'تحقق من الشركات اللي بتدعم الاحتلال واستبدلها ببدائل محلية.',
  },
  {
    emoji: '🤲',
    title: 'الدعاء',
    body: 'الدعاء سلاح المؤمن — اجعله عادة يومية.',
  },
  {
    emoji: '📚',
    title: 'تعلّم وافهم',
    body: 'افهم القضية تاريخيًا وسياسيًا. المعرفة أساس أي دعم حقيقي.',
  },
]

const WA_LINK = 'https://wa.me/201012892806?text=' + encodeURIComponent('السلام عليكم، مهتم أعرف طرق دعم فلسطين من خلال EAH.')

export default function PalestinePage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="pal">
        <section className="pal-hero">
          <div className="pal-hero__heart" aria-hidden>
            <svg viewBox="0 0 32 28" width="72" height="63">
              <defs>
                <clipPath id="ph-clip">
                  <path d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#ph-clip)">
                <rect x="0" y="0" width="32" height="9" fill="#000" />
                <rect x="0" y="9" width="32" height="9" fill="#FFF" />
                <rect x="0" y="18" width="32" height="10" fill="#149954" />
                <polygon points="0,0 10,14 0,28" fill="#E4312B" />
              </g>
              <path
                d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z"
                fill="none"
                stroke="#A855F7"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="pal-kicker">فلسطين في القلب</span>
          <h1 className="pal-title">فلسطين في القلب</h1>
          <p className="pal-lead">
            مش شعار عابر — التزام حقيقي. EAH مش منصة سياسية، لكن إحنا مؤمنين إن كل حد يقدر يدعم القضية بطريقته.
            في الصفحة دي جمعنا طرق دعم <strong>واقعية وآمنة وموثوقة</strong>.
          </p>
        </section>

        <section className="pal-ways">
          {WAYS.map((w) => (
            <article key={w.title} className="pal-way">
              <span className="pal-way__emoji">{w.emoji}</span>
              <h3 className="pal-way__title">{w.title}</h3>
              <p className="pal-way__body">{w.body}</p>
            </article>
          ))}
        </section>

        <section className="pal-cta">
          <h2 className="pal-cta__title">عايز تعرف أكتر؟</h2>
          <p className="pal-cta__body">
            كلّمنا على واتساب وهنرشدك لأقرب حملة موثوقة في منطقتك.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="pal-cta__btn"
          >
            💬 تواصل معنا على واتساب
          </a>
        </section>

        <section className="pal-note">
          <strong className="pal-note__title">ملاحظة أمان</strong>
          <p className="pal-note__text">
            EAH مش بتجمّع أي تبرعات. كل القنوات اللي بنرشحها رسمية وموثوقة،
            وأي دعم مالي مباشر لازم يكون عبر الجهات الرسمية المعروفة فقط.
          </p>
        </section>

        <Link href="/" className="pal-back">← الرئيسية</Link>
      </main>
      <SiteFooter />
    </>
  )
}
