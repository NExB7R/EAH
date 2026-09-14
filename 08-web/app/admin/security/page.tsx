import Link from 'next/link'

export const metadata = {
  title: 'الأمان',
}

const items = [
  ['✅', 'تعديل التاجر لا ينشر مباشرة', 'كل تعديل يمر بطلب مراجعة وموافقة صريحة من السوبر أدمين.'],
  ['✅', 'RLS وLeast Privilege', 'صلاحيات جداول المحتوى الحي ليست مفتوحة للتاجر، والقراءة مقيدة حسب الملكية والحالة.'],
  ['✅', 'الأدوار الحالية', 'Super Admin + Merchant + Customer فقط. أدوار المساعدين سيتم بناؤها لاحقًا بصلاحيات محددة.'],
  ['✅', 'الأسرار', 'لا يوجد Service Role key أو secret مطلوب داخل كود المتصفح.'],
  ['⏳', 'MFA للسوبر أدمين', 'مطلوب قبل الإطلاق الإنتاجي للحماية الإضافية للحساب الأعلى صلاحية.'],
  ['⏳', 'التشفير والتشغيل الإنتاجي', 'مراجعة التشفير عند التخزين، TLS، إدارة المفاتيح، النسخ الاحتياطية، والتدوير قبل الإطلاق.'],
  ['⏳', 'Web Hardening', 'CSP وHSTS وRate Limiting ومراجعة الرفع والاعتماديات قبل الإنتاج.'],
]

export default function AdminSecurityPage() {
  return (
    <section>
      <header className="eah-admin-page-header">
        <div>
          <span className="eah-admin-kicker">SECURITY CENTER</span>
          <h1>الأمان والتشفير</h1>
          <p>قائمة التحكم التي لازم تخلص بالكامل قبل اعتبار EAH جاهز للإنتاج.</p>
        </div>
        <Link href="/admin" className="eah-admin-btn">← لوحة التحكم</Link>
      </header>

      <div style={{ display: 'grid', gap: 12, maxWidth: 980 }}>
        {items.map(([icon, title, body]) => (
          <article key={title} className="eah-admin-command-card" style={{ display: 'grid', gap: 6 }}>
            <strong>{icon} {title}</strong>
            <span>{body}</span>
          </article>
        ))}
      </div>

      <div className="card" style={{ marginTop: 18, padding: 20, maxWidth: 980 }}>
        <strong>قاعدة ثابتة:</strong>
        <div style={{ opacity: .8, marginTop: 6 }}>مفيش اعتبار لـ EAH "آمن بالكامل" لمجرد إن الواجهة مقفولة. الأمان لازم يظل موجودًا في RLS، grants، الدوال المميزة، التخزين، الأسرار، والنشر.</div>
      </div>
    </section>
  )
}
