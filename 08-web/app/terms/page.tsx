import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './legal.css'

export const metadata = {
  title: 'الشروط والأحكام',
  description: 'قواعد استخدام منصة EAH — واضحة ومبسّطة.',
}

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. القبول',
    items: [
      'باستخدامك لـ EAH، إنت موافق على الشروط دي.',
      'لو مش موافق، من فضلك ما تستخدمش المنصة.',
    ],
  },
  {
    id: 'account',
    title: '2. حسابك',
    items: [
      '**إنت مسؤول** عن سرية كلمة المرور بتاعتك.',
      '**ممنوع** تعمل حسابات وهمية أو تستخدم بيانات حد تاني.',
      '**بنحق** نوقف أي حساب بيخالف القواعد بدون إشعار مسبق.',
    ],
  },
  {
    id: 'content',
    title: '3. المحتوى',
    items: [
      'المحتوى الموجود على EAH (نصوص، صور، تصميمات) **ملك للمنصة**.',
      'ممنوع نسخ أو إعادة نشر أي جزء بدون إذن مكتوب.',
      'التقييمات والتعليقات **مسؤوليتك**، ولازم تكون محترمة وواقعية.',
    ],
  },
  {
    id: 'merchants',
    title: '4. أصحاب الأنشطة',
    items: [
      'لازم تكون **مالك شرعي** للنشاط اللي بتسجّله.',
      'كل التعديلات بتخضع لـ **مراجعة الأدمن** قبل النشر.',
      'الاشتراك المميز **اختياري**، ومفيش استرداد بعد التفعيل.',
      'بنحق **نوقف أي نشاط** لو خالف الشروط أو وردت شكاوى متكررة.',
    ],
  },
  {
    id: 'prohibited',
    title: '5. المحظورات',
    items: [
      'التلاعب بالتقييمات أو الزيارات.',
      'نشر محتوى مسيء، مضلل، أو مخالف للقانون.',
      'محاولة اختراق المنصة أو جمع بيانات المستخدمين.',
      'استخدام bots أو scrapers بدون إذن.',
    ],
  },
  {
    id: 'liability',
    title: '6. المسؤولية',
    items: [
      'EAH **منصة تعريفية**. المسؤولية عن الخدمة الفعلية على النشاط نفسه.',
      'بنبذل كل جهد للتأكد من دقة المعلومات، لكن **مفيش ضمان 100%**.',
      'مش مسؤولين عن أي خسائر غير مباشرة ناتجة عن استخدام المنصة.',
    ],
  },
  {
    id: 'changes',
    title: '7. تعديل الشروط',
    items: [
      'بنحق نحدّث الشروط في أي وقت.',
      'التعديلات بتصبح سارية فورًا من تاريخ النشر.',
      'استمرارك في الاستخدام = موافقة على الشروط الجديدة.',
    ],
  },
  {
    id: 'law',
    title: '8. القانون الحاكم',
    items: [
      'الشروط دي بتخضع للقوانين المصرية.',
      'أي نزاع بيتحل ودّيًا، أو أمام الجهات القضائية المختصة.',
    ],
  },
]

export default function TermsPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="legal">
        <header className="legal__head">
          <span className="legal__kicker">TERMS</span>
          <h1 className="legal__title">الشروط والأحكام</h1>
          <p className="legal__lead">
            قواعد واضحة ومبسّطة. عشان تعرف حقوقك وواجباتك بالظبط.
          </p>
          <div className="legal__meta">
            <span>آخر تحديث: 14 سبتمبر 2026</span>
            <span>•</span>
            <span>وقت القراءة: 5 دقائق</span>
          </div>
        </header>

        <nav className="legal__toc">
          <span className="legal__toc-title">المحتوى</span>
          <ol>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="legal__body">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="legal__section">
              <h2 className="legal__section-title">{s.title}</h2>
              <ul className="legal__list">
                {s.items.map((it, i) => (
                  <li key={i}>
                    {it.split(/(\*\*[^*]+\*\*)/).map((p, j) =>
                      p.startsWith('**') ? (
                        <strong key={j}>{p.slice(2, -2)}</strong>
                      ) : (
                        p
                      )
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="legal__foot">
          <p>
            عندك سؤال؟ كلّمنا على{' '}
            <a href="https://wa.me/201012892806" target="_blank" rel="noreferrer">
              واتساب
            </a>
            .
          </p>
        </footer>
      </main>
      <SiteFooter />
    </>
  )
}
