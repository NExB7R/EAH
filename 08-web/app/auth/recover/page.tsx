import Link from 'next/link'

export default function RecoverPage() {
  return (
    <main className="container" style={{ maxWidth: 620, paddingTop: 64 }}>
      <div className="eyebrow">EAH • ACCOUNT RECOVERY</div>
      <h1 style={{ marginTop: 10 }}>نسيت كلمة المرور؟</h1>
      <p className="lead" style={{ marginTop: 10 }}>
        EAH لا يرسل كلمة المرور ولا يخزنها بشكل قابل للعرض. وبما إن تسجيلنا الحالي يعتمد على رقم الموبايل بدون OTP أو بريد حقيقي، مش هنطلب منك معلومة سهلة التخمين ونعتبرها إثبات ملكية.
      </p>

      <section className="card" style={{ marginTop: 20, padding: 22 }}>
        <h2 style={{ marginTop: 0 }}>الاسترجاع الآمن</h2>
        <p style={{ lineHeight: 1.8, opacity: .78 }}>
          الاسترجاع الذاتي هيحتاج قناة موثوقة لإثبات ملكيتك للحساب. هنضيفها في EAH كخيار رسمي (بريد حقيقي أو WhatsApp موثّق) بدل أي حل ضعيف.
        </p>
        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          <div className="card" style={{ padding: 14 }}><strong>دلوقتي:</strong> تواصل مع إدارة EAH لاستعادة الحساب والتحقق من ملكيته.</div>
          <div className="card" style={{ padding: 14 }}><strong>لاحقًا:</strong> استرجاع ذاتي بكود/رابط لمرة واحدة عبر قناة موثوقة.</div>
        </div>
        <Link className="eah-admin-btn primary" href="/auth" style={{ display: 'inline-flex', marginTop: 18 }}>العودة لتسجيل الدخول</Link>
      </section>

      <div className="card" style={{ marginTop: 14, padding: 16 }}>
        <strong>مهم:</strong> لو أنت داخل الحساب بالفعل، تقدر تغيّر كلمة المرور مباشرة من صفحة الأمان.
        <div style={{ marginTop: 10 }}><Link className="eah-admin-btn" href="/auth/change-password">تغيير كلمة المرور 🔒</Link></div>
      </div>
    </main>
  )
}
