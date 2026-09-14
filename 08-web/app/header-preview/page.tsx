import FloatingCapsuleHeader from '@/components/floating-capsule'

export const metadata = {
  title: 'معاينة الهيدر',
  robots: { index: false, follow: false },
}

export default function HeaderPreview() {
  return (
    <div style={{ minHeight: '220vh', paddingTop: '180px', paddingBottom: '120px' }}>
      <FloatingCapsuleHeader />

      <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{
          color: 'var(--text)',
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 900,
          marginBottom: '20px',
          textShadow: '0 0 24px rgba(168, 85, 247, 0.4)',
          transition: 'color 400ms ease',
        }}>
          الهيدر النهائي ✨
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1rem',
          lineHeight: 1.9,
          marginBottom: '60px',
          transition: 'color 400ms ease',
        }}>
          <strong style={{ color: 'var(--gold)' }}>يمين:</strong> القائمة، المظهر، ثبّت، سجل، دخول<br />
          <strong style={{ color: 'var(--gold)' }}>المنتصف:</strong> اللوجو + السلوجان<br />
          <strong style={{ color: 'var(--gold)' }}>شمال:</strong> بحث، شارك، فيسبوك، واتساب<br />
          <br />
          <em>جرّب: هوفر أو دوس على اللوجو — التاج يتحرك للنص</em>
        </p>

        <div style={{ height: '60vh' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>↓ اسكرول لتحت ↓</p>
        </div>
        <div style={{ height: '60vh' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>جرّب تبديل المظهر ☀️/🌙 فوق</p>
        </div>
      </div>
    </div>
  )
}
