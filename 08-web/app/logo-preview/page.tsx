import EahLogo from '@/components/eah-logo'

export const metadata = {
  title: 'معاينة اللوجو',
  robots: { index: false, follow: false },
}

export default function LogoPreview() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#050308',
        color: '#F4F2FA',
        padding: '60px 20px',
        display: 'grid',
        gap: 80,
        justifyItems: 'center',
        alignContent: 'start',
      }}
    >
      <Section title="XL — Splash / Hero">
        <EahLogo size="xl" />
      </Section>

      <Section title="LG — Page Hero">
        <EahLogo size="lg" />
      </Section>

      <Section title="MD — Header (default)">
        <EahLogo size="md" />
      </Section>

      <Section title="SM — Header scrolled / Footer">
        <EahLogo size="sm" />
      </Section>

      <Section title="Mark — no slogan (any size)">
        <EahLogo size="md" variant="mark" />
      </Section>

      <Section title="Crown only">
        <EahLogo size="md" variant="crown" />
      </Section>

      <div style={{ opacity: 0.5, fontSize: 13, maxWidth: 500, textAlign: 'center' }}>
        💡 جرّب الهوفر على أي لوجو — التاج يطير للنص، والسلوجان يظهر. على الموبايل، السلوجان ثابت.
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'center' }}>
      <div
        style={{
          fontSize: 12,
          color: '#A29DB5',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}
