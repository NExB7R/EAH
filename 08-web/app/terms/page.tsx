import Link from 'next/link'
import LegalPage from '@/components/legal-page'

export const metadata = {
  title: 'الشروط والأحكام',
  description: 'شروط استخدام منصة EAH — واضحة ومباشرة.',
}

const LAST_UPDATE = '2026-09-15'
const READ_TIME = '5 دقائق'

const TOC = [
  { id: 'accept', label: 'الموافقة على الشروط' },
  { id: 'account', label: 'حسابك' },
  { id: 'use', label: 'الاستخدام المسموح' },
  { id: 'content', label: 'المحتوى' },
  { id: 'merchant', label: 'لأصحاب الأنشطة' },
  { id: 'points', label: 'النقاط والمكافآت' },
  { id: 'ban', label: 'الحظر' },
  { id: 'ip', label: 'الملكية الفكرية' },
  { id: 'disclaimer', label: 'إخلاء مسؤولية' },
  { id: 'changes', label: 'التعديلات' },
  { id: 'law', label: 'القانون المطبق' },
  { id: 'contact', label: 'تواصل معنا' },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="الشروط والأحكام"
      kicker="الاتفاقية"
      sub="باستخدامك EAH، أنت موافق على الشروط دي."
      lastUpdate={LAST_UPDATE}
      readTime={READ_TIME}
      toc={TOC}
    >
          <section className="lg__section" id="accept">
            <h2 className="lg__section-title">الموافقة على الشروط</h2>
            <div className="lg__section-body">
              <p>
                دخولك واستخدامك لـ EAH معناه إنك قرأت الشروط دي ووافقت عليها. لو مش
                موافق، من فضلك متستخدمش المنصة.
              </p>
            </div>
          </section>

          <section className="lg__section" id="account">
            <h2 className="lg__section-title">حسابك</h2>
            <div className="lg__section-body">
              <ul>
                <li>لازم تكون فوق 13 سنة لاستخدام المنصة.</li>
                <li>أنت مسؤول عن سرية كلمة السر الخاصة بك.</li>
                <li>لازم تبلغنا فوراً لو حسابك اتخترق.</li>
                <li>مسموح بحساب واحد لكل شخص — مفيش حسابات متعددة.</li>
                <li>مفيش انتحال شخصية أو بيانات كاذبة.</li>
              </ul>
            </div>
          </section>

          <section className="lg__section" id="use">
            <h2 className="lg__section-title">الاستخدام المسموح</h2>
            <div className="lg__section-body">
              <p><strong>مسموح:</strong></p>
              <ul>
                <li>استخدام المنصة للاكتشاف والتقييم الشخصي.</li>
                <li>مشاركة أماكن مع أصحابك.</li>
                <li>كتابة تقييمات صادقة وموضوعية.</li>
                <li>للأعمال: تسجيل نشاطك وإدارته.</li>
              </ul>
              <p><strong>ممنوع:</strong></p>
              <ul>
                <li>محتوى مسيء، عنصري، أو غير قانوني.</li>
                <li>تقييمات كاذبة أو مدفوعة.</li>
                <li>رسائل مزعجة أو إعلانات غير مصرحة.</li>
                <li>محاولة اختراق المنصة أو استغلال ثغرة.</li>
                <li>جمع بيانات المستخدمين بدون إذن.</li>
                <li>استخدام برامج آلية أو الأتمتة بدون تصريح.</li>
              </ul>
            </div>
          </section>

          <section className="lg__section" id="content">
            <h2 className="lg__section-title">المحتوى</h2>
            <div className="lg__section-body">
              <p>
                أي محتوى بتكتبه (تقييمات، صور، نبذة) يبقى ملكك، لكن أنت بتدينا
                ترخيص لعرضه على المنصة.
              </p>
              <p>
                بنحتفظ بحق حذف أي محتوى يخالف الشروط بدون إشعار مسبق.
              </p>
            </div>
          </section>

          <section className="lg__section" id="merchant">
            <h2 className="lg__section-title">لأصحاب الأنشطة</h2>
            <div className="lg__section-body">
              <ul>
                <li>أنت مسؤول عن صحة بيانات نشاطك.</li>
                <li>ممنوع تحريف المعلومات أو الخدمات.</li>
                <li>أي تعديل على الصفحة يمر بمراجعة الأدمن.</li>
                <li>مفيش ضمان لعدد زوار محدد أو ترتيب معين.</li>
                <li>الباقات المدفوعة — الشروط موضحة عند الاشتراك.</li>
              </ul>
            </div>
          </section>

          <section className="lg__section" id="points">
            <h2 className="lg__section-title">النقاط والمكافآت</h2>
            <div className="lg__section-body">
              <ul>
                <li>النقاط بتُمنح على الأنشطة الحقيقية فقط.</li>
                <li>أي تلاعب (برامج آلية، multiple accounts) = حظر.</li>
                <li>النقاط مش قابلة للتحويل لبعض المستخدمين.</li>
                <li>بنحتفظ بحق تعديل نظام النقاط مع إشعار.</li>
                <li>النقاط المستبدلة بمكافآت مش قابلة للاسترجاع.</li>
              </ul>
            </div>
          </section>

          <section className="lg__section" id="ban">
            <h2 className="lg__section-title">الحظر</h2>
            <div className="lg__section-body">
              <p>بنحتفظ بحق حظر أي حساب:</p>
              <ul>
                <li>يخالف الشروط أو السياسة.</li>
                <li>يحاول التلاعب بالمنصة.</li>
                <li>يسبب ضرر لمستخدمين آخرين.</li>
              </ul>
              <p>
                الحظر ممكن يكون مؤقت (24 ساعة → 7 أيام) أو دائم حسب الخطورة.
              </p>
            </div>
          </section>

          <section className="lg__section" id="ip">
            <h2 className="lg__section-title">الملكية الفكرية</h2>
            <div className="lg__section-body">
              <p>
                العلامة التجارية EAH، التصميم، الكود، والشعار — ملكنا الحصري.
                ممنوع استخدامها بدون إذن مكتوب.
              </p>
            </div>
          </section>

          <section className="lg__section" id="disclaimer">
            <h2 className="lg__section-title">إخلاء مسؤولية</h2>
            <div className="lg__section-body">
              <p>
                EAH منصة اكتشاف. مش بنselling منتجات، ولا بنشغل المطاعم. أي تعامل بينك
                وبين نشاط معين يبقى مسؤوليتك.
              </p>
              <p>
                المنصة بتُقدم "كما هي". مش بنضمن إنها هتشتغل بدون انقطاع أو إن كل
                البيانات دقيقة 100%.
              </p>
            </div>
          </section>

          <section className="lg__section" id="changes">
            <h2 className="lg__section-title">التعديلات</h2>
            <div className="lg__section-body">
              <p>
                ممكن نحدّث الشروط دي في أي وقت. التغييرات الجوهرية هنعلنها.
                استمرارك في استخدام المنصة = موافقة على التعديلات.
              </p>
            </div>
          </section>

          <section className="lg__section" id="law">
            <h2 className="lg__section-title">القانون المطبق</h2>
            <div className="lg__section-body">
              <p>
                الشروط دي محكومة بالقوانين المصرية. أي نزاع بيتم حله عبر المحاكم
                المصرية المختصة.
              </p>
            </div>
          </section>

          <section className="lg__section" id="contact">
            <h2 className="lg__section-title">تواصل معنا</h2>
            <div className="lg__section-body">
              <div className="lg__note">
                <strong>لأي سؤال عن الشروط:</strong>
                <br />
                <Link href="/contact">صفحة التواصل</Link> — بنرد خلال 24 ساعة.
              </div>
            </div>
          </section>
    </LegalPage>
  )
}
