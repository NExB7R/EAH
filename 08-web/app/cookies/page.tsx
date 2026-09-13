import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './legal.css'

export const metadata = {
  title: 'ملفات تعريف الارتباط',
  description: 'كيف بنستخدم الكوكيز في EAH — بشكل بسيط وآمن.',
}

const TYPES = [
  {
    id: 'essential',
    emoji: '🔒',
    title: 'كوكيز أساسية',
    required: true,
    body: 'ضرورية لتشغيل المنصة. مسؤولة عن الحفاظ على جلسة الدخول وحماية حسابك. مفيش طريقة لتعطيلها من غير ما تتعطل المنصة.',
  },
  {
    id: 'preferences',
    emoji: '⚙️',
    title: 'كوكيز التفضيلات',
    required: false,
    body: 'بتفتكر اختياراتك (الوضع الليلي، المنطقة المفضلة، الفلاتر). لو عطّلتها، هتحتاج تختار من جديد كل زيارة.',
  },
  {
    id: 'analytics',
    emoji: '📊',
    title: 'كوكيز تحليلية',
    required: false,
    body: 'بتساعدنا نفهم أي صفحات بيزورها الناس أكتر، وأي أماكن بتلاقي إقبال. البيانات مجمّعة ومجهولة الهوية.',
  },
]

export default function CookiesPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="legal">
        <header className="legal__head">
          <span className="legal__kicker">COOKIES</span>
          <h1 className="legal__title">ملفات تعريف الارتباط</h1>
          <p className="legal__lead">
            ملفات صغيرة بتساعدنا نقدّم تجربة أسرع وأأمن. إحنا بنحترم خصوصيتك — مفيش تتبّع إعلاني.
          </p>
          <div className="legal__meta">
            <span>آخر تحديث: 14 سبتمبر 2026</span>
            <span>•</span>
            <span>وقت القراءة: 2 دقيقة</span>
          </div>
        </header>

        <div className="legal__body">
          <section className="legal__section">
            <h2 className="legal__section-title">إيه هي الكوكيز؟</h2>
            <p style={{ lineHeight: 1.85, fontSize: 15, opacity: 0.85 }}>
              الكوكيز هي ملفات نصية صغيرة بتتخزن على جهازك لما تزور موقع. بتساعد الموقع يفتكر
              اختياراتك، ويفضل على علم بحالتك (زي إنك مسجل دخول).
            </p>
          </section>

          <section className="legal__section">
            <h2 className="legal__section-title">الأنواع اللي بنستخدمها</h2>
            <div className="legal__cards">
              {TYPES.map((t) => (
                <article key={t.id} className="legal__card">
                  <div className="legal__card-head">
                    <span className="legal__card-emoji">{t.emoji}</span>
                    <h3 className="legal__card-title">{t.title}</h3>
                    {t.required && <span className="legal__card-req">إلزامية</span>}
                  </div>
                  <p className="legal__card-body">{t.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="legal__section">
            <h2 className="legal__section-title">التحكم في الكوكيز</h2>
            <ul className="legal__list">
              <li>تقدر تمسح الكوكيز من إعدادات المتصفح في أي وقت.</li>
              <li>تقدر تحظر الكوكيز كليًا — بس ساعتها تجربة المنصة هتتأثر.</li>
              <li>بنحترم إعداد <strong>Do Not Track</strong> لو مفعّل.</li>
            </ul>
          </section>

          <section className="legal__section">
            <h2 className="legal__section-title">طرف ثالث</h2>
            <ul className="legal__list">
              <li>مفيش كوكيز إعلانية من طرف تالت.</li>
              <li>بنستخدم خدمات أساسية فقط (Supabase للجلسات، Vercel للاستضافة).</li>
            </ul>
          </section>
        </div>

        <footer className="legal__foot">
          <p>
            لأي سؤال، كلّمنا على{' '}
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
