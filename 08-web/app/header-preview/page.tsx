import FloatingCapsuleHeader from '@/components/floating-capsule'

export default function HeaderPreview() {
  return (
    <div style={{ minHeight: '250vh', paddingTop: '160px', paddingBottom: '120px' }}>
      <FloatingCapsuleHeader />

      <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{
          color: '#F4F2FA',
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 900,
          marginBottom: '20px',
          textShadow: '0 0 24px rgba(168, 85, 247, 0.4)',
        }}>
          جرب الهيدر الجديد 👆
        </h1>
        <p style={{ color: '#A29DB5', fontSize: '1rem', lineHeight: 1.9, marginBottom: '60px' }}>
          اللوجو في النص، وتاج يتحرك لما تسكرول لتحت أو تدوس على اللوجو. <br />
          التاج بيخرج برا حدود الكبسولة (زي ما طلبت).
        </p>

        <div style={{ height: '70vh' }}>
          <p style={{ color: '#4B4458', fontSize: '0.9rem' }}>↓ اسكرول لتحت — التاج هيطير فوق ↓</p>
        </div>
        <div style={{ height: '70vh' }}>
          <p style={{ color: '#4B4458', fontSize: '0.9rem' }}>التاج بيرجع لمكانه بعد ثانية</p>
        </div>
        <div style={{ height: '70vh' }}>
          <p style={{ color: '#4B4458', fontSize: '0.9rem' }}>جرّب تدوس على اللوجو نفسه</p>
        </div>
      </div>
    </div>
  )
}
