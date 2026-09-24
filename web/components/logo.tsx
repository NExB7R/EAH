import { CrownIcon } from './icons'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ size = 'md' }: LogoProps) {
  const sizes = {
    sm: { crown: 20, text: '1.5rem', tag: '0.7rem', gap: '4px' },
    md: { crown: 28, text: '2.2rem', tag: '0.8rem', gap: '6px' },
    lg: { crown: 40, text: '3.2rem', tag: '1rem', gap: '8px' },
  }
  const s = sizes[size]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: s.gap,
      }}
    >
      <div
        style={{
          color: 'var(--gold-primary)',
          filter: 'drop-shadow(0 0 8px rgba(232, 199, 154, 0.4))',
          lineHeight: 0,
        }}
      >
        <CrownIcon size={s.crown} />
      </div>

      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: s.text,
          fontWeight: 900,
          letterSpacing: '0.15em',
          lineHeight: 1,
          background:
            'linear-gradient(135deg, var(--purple-light) 0%, var(--gold-light) 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        EAH
      </div>

      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: s.tag,
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.05em',
        }}
      >
        اللي نفسك فيه ؟
      </div>
    </div>
  )
}
