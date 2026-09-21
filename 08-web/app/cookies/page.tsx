import Link from 'next/link'
import LegalPage from '@/components/legal-page'

export const metadata = {
  title: 'ملفات تعريف الارتباط',
  description: 'إزاي بنستخدم ملفات الارتباط (كوكيز) في EAH.',
}

const LAST_UPDATE = '2026-09-15'

const TYPES = [
  {
    title: 'ضرورية',
    body: 'لازمة لتشغيل المنصة: تسجيل الدخول، الأمان، الجلسة. مش ممكن تتعطل.',
    required: true,
  },
  {
    title: 'وظيفية',
    body: 'بتحفظ تفضيلاتك: الوضع الليلي، الفلاتر، آخر بحث. تتحسن التجربة.',
    required: false,
  },
  {
    title: 'تحليلية',
    body: 'بتساعدنا نفهم إزاي المنصة بتُستخدم. بدون أي بيانات شخصية.',
    required: false,
  },
]

export default function CookiesPage() {
  const TOC = [
    { id: 'what', label: 'إيه هي ملفات الارتباط؟' },
    { id: 'types', label: 'أنواع الكوكيز' },
    { id: 'control', label: 'إزاي تتحكم؟' },
  ]

  return (
    <LegalPage
      title="ملفات تعريف الارتباط"
      kicker="الكوكيز"
      sub="إزاي بنستخدم الـ كوكيز وإيه حقك في التحكم."
      lastUpdate={LAST_UPDATE}
      readTime="3 دقائق"
      toc={TOC}
    >
          <section className="lg__section">
            <h2 className="lg__section-title">إيه هي ملفات الارتباط؟</h2>
            <div className="lg__section-body">
              <p>
                ملفات ارتباط (كوكيز) هي ملفات صغيرة بتتحفظ على جهازك لما تزور موقع.
                بتساعد الموقع يفتكرك ويحسّن تجربتك.
              </p>
            </div>
          </section>

          <section className="lg__section">
            <h2 className="lg__section-title">الأنواع اللي بنستخدمها</h2>
            <div className="lg__section-body">
              {TYPES.map((t) => (
                <div key={t.title} className="lp__type-card">
                  <div className="lp__type-head">
                    <h3 className="lp__type-title">{t.title}</h3>
                    <span className={`lp__type-badge lp__type-badge--${t.required ? 'required' : 'optional'}`}>
                      {t.required ? 'إلزامي' : 'اختياري'}
                    </span>
                  </div>
                  <p className="lp__type-body">{t.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="lg__section">
            <h2 className="lg__section-title">إزاي تتحكم فيهم</h2>
            <div className="lg__section-body">
              <p>تقدر تتحكم في ملفات الارتباط بطرق مختلفة:</p>
              <ul>
                <li><strong>من المتصفح:</strong> كل متصفح عنده إعدادات لـ كوكيز.</li>
                <li><strong>وضع التصفح الخاص:</strong> بيمسح كل الـ كوكيز بعد الجلسة.</li>
                <li><strong>إضافات:</strong> في إضافات بتديك تحكم دقيق.</li>
              </ul>
              <p>
                لو عطلت الـ كوكيز الضرورية، ممكن متقدرش تسجّل دخول أو تستخدم بعض
                الميزات.
              </p>
            </div>
          </section>

          <section className="lg__section">
            <h2 className="lg__section-title">مدة الحفظ</h2>
            <div className="lg__section-body">
              <ul>
                <li><strong>كوكيز الجلسة:</strong> بتُمسح لما تقفل المتصفح.</li>
                <li><strong>كوكيز دائمة:</strong> بتفضل من أيام لشهور (حسب الاستخدام).</li>
                <li><strong>جلسة الدخول:</strong> بتبقى فعّالة لمدة 30 يوم.</li>
              </ul>
            </div>
          </section>

          <section className="lg__section">
            <h2 className="lg__section-title">تواصل معنا</h2>
            <div className="lg__section-body">
              <div className="lg__note">
                <strong>لأي سؤال عن كوكيز:</strong>
                <br />
                <Link href="/contact">صفحة التواصل</Link> — بنرد خلال 24 ساعة.
              </div>
            </div>
          </section>
    </LegalPage>
  )
}
