import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './legal.css'

export const metadata = {
  title: 'ملفات تعريف الارتباط',
  description: 'إزاي بنستخدم ملفات الارتباط (cookies) في EAH.',
}

const LAST_UPDATE = '2026-09-15'

const TYPES = [
  {
    emoji: '🔒',
    title: 'ضرورية',
    body: 'لازمة لتشغيل المنصة: تسجيل الدخول، الأمان، الجلسة. مش ممكن تتعطل.',
    required: true,
  },
  {
    emoji: '🎨',
    title: 'وظيفية',
    body: 'بتحفظ تفضيلاتك: الوضع الليلي، الفلاتر، آخر بحث. تتحسن التجربة.',
    required: false,
  },
  {
    emoji: '📊',
    title: 'تحليلية',
    body: 'بتساعدنا نفهم إزاي المنصة بتُستخدم. بدون أي بيانات شخصية.',
    required: false,
  },
]

export default function CookiesPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="lg">
        <section className="lg__hero">
          <span className="lg__kicker">COOKIES POLICY</span>
          <h1 className="lg__title">ملفات تعريف الارتباط</h1>
          <p style={{ margin: 0, fontSize: '.9rem', color: '#A29DB5', lineHeight: 1.7 }}>
            إزاي بنستخدم الـ cookies وإيه حقك في التحكم.
          </p>
          <div className="lg__meta">
            <span className="lg__meta-item">📅 آخر تحديث: {LAST_UPDATE}</span>
          </div>
        </section>

        <div className="lg__body">
          <section className="lg__section">
            <h2 className="lg__section-title">إيه هي ملفات الارتباط؟</h2>
            <div className="lg__section-body">
              <p>
                ملفات ارتباط (cookies) هي ملفات صغيرة بتتحفظ على جهازك لما تزور موقع.
                بتساعد الموقع يفتكرك ويحسّن تجربتك.
              </p>
            </div>
          </section>

          <section className="lg__section">
            <h2 className="lg__section-title">الأنواع اللي بنستخدمها</h2>
            <div className="lg__section-body">
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                {TYPES.map((t) => (
                  <div
                    key={t.title}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 14,
                      background: 'rgba(168, 85, 247, 0.04)',
                      border: '1px solid rgba(168, 85, 247, 0.14)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
                      <strong style={{ fontSize: '.95rem', color: '#F4F2FA' }}>
                        {t.title}
                      </strong>
                      <span
                        style={{
                          fontSize: '.68rem',
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: t.required
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(74, 222, 128, 0.15)',
                          color: t.required ? '#FCA5A5' : '#6EE7B7',
                          fontWeight: 800,
                          marginInlineStart: 'auto',
                        }}
                      >
                        {t.required ? 'إلزامي' : 'اختياري'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '.85rem', lineHeight: 1.7, color: '#C9C2DB' }}>
                      {t.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lg__section">
            <h2 className="lg__section-title">إزاي تتحكم فيهم</h2>
            <div className="lg__section-body">
              <p>تقدر تتحكم في ملفات الارتباط بطرق مختلفة:</p>
              <ul>
                <li><strong>من المتصفح:</strong> كل متصفح عنده إعدادات لـ cookies.</li>
                <li><strong>وضع التصفح الخاص:</strong> بيمسح كل الـ cookies بعد الجلسة.</li>
                <li><strong>إضافات:</strong> في إضافات بتديك تحكم دقيق.</li>
              </ul>
              <p>
                لو عطلت الـ cookies الضرورية، ممكن متقدرش تسجّل دخول أو تستخدم بعض
                الميزات.
              </p>
            </div>
          </section>

          <section className="lg__section">
            <h2 className="lg__section-title">مدة الحفظ</h2>
            <div className="lg__section-body">
              <ul>
                <li><strong>Session cookies:</strong> بتُمسح لما تقفل المتصفح.</li>
                <li><strong>Persistent cookies:</strong> بتفضل من أيام لشهور (حسب الاستخدام).</li>
                <li><strong>جلسة الدخول:</strong> بتبقى فعّالة لمدة 30 يوم.</li>
              </ul>
            </div>
          </section>

          <section className="lg__section">
            <h2 className="lg__section-title">تواصل معنا</h2>
            <div className="lg__section-body">
              <div className="lg__note">
                <strong>لأي سؤال عن cookies:</strong>
                <br />
                <Link href="/contact">صفحة التواصل</Link> — بنرد خلال 24 ساعة.
              </div>
            </div>
          </section>
        </div>

        <Link href="/" className="lg__back">← الرئيسية</Link>
      </main>
      <SiteFooter />
    </>
  )
}
