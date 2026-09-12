import SmartHeader from '@/components/smart-header'

export default function HeaderPreview() {
  return (
    <div style={{ minHeight: '200vh', paddingTop: '120px' }}>
      <SmartHeader />
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#F4F2FA', fontFamily: 'sans-serif' }}>
          جرب السكرول عشان تشوف الهيدر والخلفية
        </h1>
        <p style={{ color: '#A29DB5', marginTop: '24px' }}>
          الهيدر بيختفي ويظهر، والخلفية بتتحرك معاك.
        </p>
      </div>
    </div>
  )
}
