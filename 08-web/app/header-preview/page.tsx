import FloatingCapsuleHeader from '@/components/floating-capsule'

export default function HeaderPreview() {
  return (
    <div style={{ minHeight: '300vh', paddingTop: '140px' }}>
      <FloatingCapsuleHeader />
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{
          color: '#F4F2FA',
          fontSize: '2.5rem',
          fontWeight: 900,
          marginBottom: '24px',
          textShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
        }}>
          جرب السكرول 👇
        </h1>
        <p style={{ color: '#A29DB5', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '80px' }}>
          الكبسولة الزجاجية العائمة فوق في المنتصف. جرّب تمر على الأزرار وشوف بتتمدد إزاي.
        </p>
        <div style={{ height: '80vh', marginTop: '100px' }}>
          <p style={{ color: '#4B4458', fontSize: '0.9rem' }}>
            ↓ استمر في السكرول لترى تغيير الحجم والخلفية ↓
          </p>
        </div>
        <div style={{ height: '80vh' }}>
          <p style={{ color: '#4B4458', fontSize: '0.9rem' }}>
            الخلفية تتحرك معاك (Parallax)
          </p>
        </div>
        <div style={{ height: '80vh' }}>
          <p style={{ color: '#4B4458', fontSize: '0.9rem' }}>
            النهاية — ارجع لأعلى
          </p>
        </div>
      </div>
    </div>
  )
}
