import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'

export const metadata = { title: 'سياسة الخصوصية | EAH' }

export default function PrivacyPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="static-page">
        <Link href="/" className="static-page__back">← الرئيسية</Link>
        <span className="static-page__kicker">PRIVACY</span>
        <h1 className="static-page__title">سياسة الخصوصية</h1>

        <div className="static-page__content">
          <h2>1. البيانات اللي بنجمعها</h2>
          <ul>
            <li>الاسم ورقم الفون عند التسجيل</li>
            <li>بيانات النشاط (لو إنت صاحب متجر)</li>
            <li>التفاعلات (تقييمات، مفضلة، زيارات)</li>
            <li>بيانات تقنية (نوع الجهاز، IP، المتصفح)</li>
          </ul>

          <h2>2. إزاي بنستخدم البيانات</h2>
          <ul>
            <li>تشغيل المنصة وتحسينها</li>
            <li>ترشيح أماكن مناسبة ليك</li>
            <li>حماية من التلاعب</li>
            <li>إرسال إشعارات مفيدة</li>
          </ul>

          <h2>3. مشاركة البيانات</h2>
          <p>
            <strong>مش بنبيع بياناتك.</strong> بنشاركها بس مع مزوّدي الخدمة الضروريين (Supabase للاستضافة)،
            وأصحاب المتاجر بيشوفوا تقييماتهم بس بدون بياناتك الشخصية.
          </p>

          <h2>4. الرقم والفون</h2>
          <p>
            رقم فونك بيتحفظ بشكل مشفّر. أصحاب المتاجر ميقدرش يشوفوه إلا لو أنت اخترت تتواصل معاهم.
          </p>

          <h2>5. حقوقك</h2>
          <ul>
            <li>تعديل بياناتك من صفحة الحساب</li>
            <li>حذف حسابك في أي وقت</li>
            <li>طلب نسخة من بياناتك</li>
          </ul>

          <h2>6. التواصل</h2>
          <p>
            لو عندك سؤال عن الخصوصية، كلمنا من <Link href="/contact">صفحة التواصل</Link>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
