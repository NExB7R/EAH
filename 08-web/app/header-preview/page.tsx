import FloatingCapsuleHeader from '@/components/floating-capsule'

export default function HeaderPreview() {
  return (
    <div style={{ minHeight: '220vh', paddingTop: '160px', paddingBottom: '120px' }}>
      <FloatingCapsuleHeader />

      <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{
          color: '#F4F2FA',
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 900,
          marginBottom: '20px',
          textShadow: '0 0 24px rgba(168, 85, 247, 0.4)',
        }}>
          الهيدر النهائي ✨
        </h1>
        <p style={{ color: '#A29DB5', fontSize: '1rem', lineHeight: 1.9, marginBottom: '60px' }}>
          <strong style={{ color: '#E8C79A' }}>يمين:</strong> القائمة، ثبّت، سجل، دخول<br />
          <strong style={{ color: '#E8C79A' }}>المنتصف:</strong> اللوجو + السلوجان<br />
          <strong style={{ color: '#E8C79A' }}>شمال:</strong> بحث، فيسبوك، واتساب<br />
          <br />
          <em>جرّب: هوفر أو دوس على اللوجو — التاج يتحرك للنص، والسلوجان يظهر</em>
        </p>

        <div style={{ height: '60vh' }}>
          <p style={{ color: '#4B4458', fontSize: '0.9rem' }}>↓ اسكرول لتحت — التاج يتحرك برضه ↓</p>
        </div>
        <div style={{ height: '60vh' }}>
          <p style={{ color: '#4B4458', fontSize: '0.9rem' }}>التاج يفضل في مكانه (مش يخرج برا)</p>
        </div>
      </div>
    </div>
  )
}
