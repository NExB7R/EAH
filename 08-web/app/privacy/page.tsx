import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import PageLogo from '@/components/page-logo'
import SiteFooter from '@/components/site-footer'
import './legal.css'
import { IcCalendar } from '@/components/eah-icons'

export const metadata = {
  title: 'سياسة الخصوصية',
  description:
    'سياسة الخصوصية في EAH — التزامنا بحماية بياناتك وشفافية كاملة.',
}

const LAST_UPDATE = '2026-09-15'
const READ_TIME = '4 دقائق'

const TOC = [
  { id: 'intro', label: 'مقدمة' },
  { id: 'collect', label: 'البيانات اللي بنجمعها' },
  { id: 'use', label: 'ليه بنستخدم بياناتك' },
  { id: 'share', label: 'مشاركة البيانات' },
  { id: 'security', label: 'الأمان' },
  { id: 'rights', label: 'حقوقك' },
  { id: 'كوكيز', label: 'ملفات الارتباط' },
  { id: 'kids', label: 'القُصّر' },
  { id: 'changes', label: 'تحديثات السياسة' },
  { id: 'contact', label: 'تواصل معنا' },
]

export default function PrivacyPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <PageLogo />
      <main className="lg">
        <section className="lg__hero">
          <span className="lg__kicker e-badge e-badge--accent">سياسة الخصوصية</span>
          <h1 className="lg__title e-gradient">سياسة الخصوصية</h1>
          <p style={{ margin: 0, fontSize: '.9rem', color: '#A29DB5', lineHeight: 1.7 }}>
            التزامنا بحماية بياناتك — بشكل واضح ومباشر.
          </p>
          <div className="lg__meta">
            <span className="lg__meta-item"><IcCalendar /> آخر تحديث: {LAST_UPDATE}</span>
            <span className="lg__meta-item">⏱ قراءة: {READ_TIME}</span>
          </div>
        </section>

        <nav className="lg__toc">
          <h2 className="lg__toc-title">محتويات الصفحة</h2>
          <ul className="lg__toc-list">
            {TOC.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`}>· {t.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg__body">
          <section className="lg__section" id="intro">
            <h2 className="lg__section-title">مقدمة</h2>
            <div className="lg__section-body">
              <p>
                EAH منصة اكتشاف محلية. بناخد خصوصيتك بجدية، والصفحة دي بتشرحلك
                <strong> بالتفصيل </strong>
                إيه البيانات اللي بنجمعها، ليه، وإزاي بنحميها.
              </p>
              <p>
                استخدامك للمنصة معناه إنك وافقت على السياسة دي. لو مش موافق، من فضلك
                متستخدمش المنصة.
              </p>
            </div>
          </section>

          <section className="lg__section" id="collect">
            <h2 className="lg__section-title">البيانات اللي بنجمعها</h2>
            <div className="lg__section-body">
              <p><strong>بيانات الحساب:</strong></p>
              <ul>
                <li>رقم الموبايل (للتسجيل والدخول)</li>
                <li>كلمة السر (مشفرة بالكامل — مش بنشوفها)</li>
                <li>الاسم الظاهر (اختياري)</li>
                <li>الصورة الشخصية (اختياري)</li>
                <li>نبذة قصيرة (اختياري)</li>
              </ul>
              <p><strong>بيانات الاستخدام:</strong></p>
              <ul>
                <li>الصفحات اللي بزورها (لتحسين الترشيحات)</li>
                <li>الأماكن اللي بتحفظها في المفضلة</li>
                <li>التقييمات والردود</li>
                <li>نوع الجهاز (موبايل/كمبيوتر) للأداء</li>
              </ul>
              <p><strong>بيانات تقنية:</strong></p>
              <ul>
                <li>عنوان IP (مشفر — للـ مكافحة التلاعب)</li>
                <li>نوع المتصفح والنظام</li>
                <li>الموقع الجغرافي التقريبي (لو وافقت)</li>
              </ul>
            </div>
          </section>

          <section className="lg__section" id="use">
            <h2 className="lg__section-title">ليه بنستخدم بياناتك</h2>
            <div className="lg__section-body">
              <ul>
                <li><strong>تشغيل الخدمة:</strong> تسجيل الدخول، حفظ المفضلة، إدارة حسابك.</li>
                <li><strong>تحسين الترشيحات:</strong> ترشيح أماكن على حسب مزاجك ومنطقتك.</li>
                <li><strong>الأمان:</strong> منع الاحتيال والتلاعب بالنقاط والتقييمات.</li>
                <li><strong>التواصل:</strong> إشعارات عن عروض وتقييمات (لو وافقت).</li>
                <li><strong>التحليلات:</strong> نفهم استخدام المنصة ونحسنها.</li>
              </ul>
              <p>مش بنستخدم بياناتك للبيع لأي جهة خارجية.</p>
            </div>
          </section>

          <section className="lg__section" id="share">
            <h2 className="lg__section-title">مشاركة البيانات</h2>
            <div className="lg__section-body">
              <p><strong>مين يشوف بياناتك:</strong></p>
              <ul>
                <li><strong>أنت فقط:</strong> بيانات الحساب، المفضلة، الإعدادات.</li>
                <li><strong>أصحاب الأنشطة:</strong> تقييماتك واسمك الظاهر (لو كتبت تقييم).</li>
                <li><strong>الجمهور:</strong> تقييماتك، صورك، الاسم الظاهر.</li>
              </ul>
              <p><strong>مين ميشوفهاش أبداً:</strong></p>
              <ul>
                <li>رقم موبايلك (إلا لو أنت نشرته)</li>
                <li>كلمة السر (مشفرة بالكامل)</li>
                <li>عنوان IP (مشفر ومستخدم للأمان فقط)</li>
              </ul>
              <p>
                ممكن نشارك بيانات مع جهات قانونية لو اتطلب مننا قانونياً.
              </p>
            </div>
          </section>

          <section className="lg__section" id="security">
            <h2 className="lg__section-title">الأمان</h2>
            <div className="lg__section-body">
              <ul>
                <li>كل الاتصالات مشفرة عبر بروتوكولات التشفير.</li>
                <li>كلمات السر متشفرة bcrypt من طرف Supabase.</li>
                <li>تأمين صفوف البيانات على كل جدول في قاعدة البيانات.</li>
                <li>تحديد معدل الطلبات على كل endpoint حساس.</li>
                <li>تشفير بيانات الزوار — IP مشفر قبل التخزين.</li>
                <li>مراجعة أمنية دورية للكود والصلاحيات.</li>
              </ul>
              <p>
                رغم كل ده، مفيش نظام آمن 100%. بننصحك تستخدم كلمة سر قوية
                ومتشاركهاش مع حد.
              </p>
            </div>
          </section>

          <section className="lg__section" id="rights">
            <h2 className="lg__section-title">حقوقك</h2>
            <div className="lg__section-body">
              <ul>
                <li><strong>الوصول:</strong> تقدر تطلب نسخة من بياناتك.</li>
                <li><strong>التصحيح:</strong> تقدر تعدّل بياناتك في أي وقت.</li>
                <li><strong>الحذف:</strong> تقدر تطلب حذف حسابك وبياناتك.</li>
                <li><strong>الاعتراض:</strong> تقدر تعترض على معالجة معينة لبياناتك.</li>
                <li><strong>النقل:</strong> تقدر تاخد بياناتك في صيغة قابلة للنقل.</li>
              </ul>
              <p>
                لتطبيق أي حق، <Link href="/contact">كلّمنا</Link> وهنرد عليك خلال 30 يوم.
              </p>
            </div>
          </section>

          <section className="lg__section" id="كوكيز">
            <h2 className="lg__section-title">ملفات الارتباط (كوكيز)</h2>
            <div className="lg__section-body">
              <p>بنستخدم 3 أنواع:</p>
              <ul>
                <li><strong>ضرورية:</strong> للحفاظ على جلستك وللتفويض.</li>
                <li><strong>وظيفية:</strong> لحفظ تفضيلاتك (الوضع الليلي، الفلاتر).</li>
                <li><strong>تحليلية:</strong> لفهم الاستخدام وتحسين المنصة.</li>
              </ul>
              <p>
                تقدر توقف الـ كوكيز غير الضرورية من إعدادات المتصفح. لكن ده ممكن
                يمنع بعض الميزات.
              </p>
            </div>
          </section>

          <section className="lg__section" id="kids">
            <h2 className="lg__section-title">القُصّر</h2>
            <div className="lg__section-body">
              <p>
                EAH مش مخصصة للأطفال تحت 13 سنة. لو عندنا شك إن فيه حساب لطفل، هنمسحه.
                لو والدك/والدتك وعايز تحذف حساب ابنك، <Link href="/contact">كلّمنا</Link>.
              </p>
            </div>
          </section>

          <section className="lg__section" id="changes">
            <h2 className="lg__section-title">تحديثات السياسة</h2>
            <div className="lg__section-body">
              <p>
                ممكن نحدّث السياسة دي من وقت للتاني. التغييرات الجوهرية هتتوصل عبر
                إشعار أو إيميل.
              </p>
              <p>آخر تحديث: {LAST_UPDATE}</p>
            </div>
          </section>

          <section className="lg__section" id="contact">
            <h2 className="lg__section-title">تواصل معنا</h2>
            <div className="lg__section-body">
              <div className="lg__note">
                <strong>لأي سؤال عن خصوصيتك:</strong>
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
