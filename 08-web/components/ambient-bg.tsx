/* EAH — Starfield Background (same as Welcome Gate) */

type Star = {
  top: string
  left: string
  gold: boolean
  size: 'sm' | 'md' | 'lg'
  delay: string
  duration: string
}

const STARS: Star[] = [
  // ─── Golden stars (few, accents) ───
  { top: '6%',  left: '14%', gold: true,  size: 'md', delay: '0.3s', duration: '3.5s' },
  { top: '22%', left: '82%', gold: true,  size: 'md', delay: '1.7s', duration: '4s' },
  { top: '48%', left: '6%',  gold: true,  size: 'lg', delay: '2.1s', duration: '3s' },
  { top: '72%', left: '92%', gold: true,  size: 'md', delay: '0.9s', duration: '3.8s' },
  { top: '90%', left: '38%', gold: true,  size: 'md', delay: '1.4s', duration: '4.2s' },

  // ─── Purple stars (main) ───
  { top: '4%',  left: '44%', gold: false, size: 'md', delay: '0.5s', duration: '3s' },
  { top: '10%', left: '70%', gold: false, size: 'sm', delay: '1.1s', duration: '3.6s' },
  { top: '14%', left: '28%', gold: false, size: 'lg', delay: '2.3s', duration: '4s' },
  { top: '18%', left: '56%', gold: false, size: 'sm', delay: '0.7s', duration: '3.2s' },
  { top: '26%', left: '8%',  gold: false, size: 'md', delay: '1.9s', duration: '4.4s' },
  { top: '30%', left: '88%', gold: false, size: 'sm', delay: '0.2s', duration: '3.4s' },
  { top: '34%', left: '48%', gold: false, size: 'md', delay: '2.7s', duration: '3.9s' },
  { top: '42%', left: '22%', gold: false, size: 'lg', delay: '1.3s', duration: '4.1s' },
  { top: '52%', left: '64%', gold: false, size: 'sm', delay: '0.8s', duration: '3.3s' },
  { top: '58%', left: '18%', gold: false, size: 'md', delay: '2.5s', duration: '4.3s' },
  { top: '64%', left: '36%', gold: false, size: 'sm', delay: '1.6s', duration: '3.7s' },
  { top: '68%', left: '78%', gold: false, size: 'lg', delay: '0.4s', duration: '4.5s' },
  { top: '76%', left: '12%', gold: false, size: 'sm', delay: '2.9s', duration: '3.1s' },
  { top: '82%', left: '52%', gold: false, size: 'md', delay: '1.8s', duration: '4s' },
  { top: '86%', left: '86%', gold: false, size: 'sm', delay: '0.6s', duration: '3.5s' },
  { top: '94%', left: '26%', gold: false, size: 'md', delay: '2.2s', duration: '4.2s' },
  { top: '96%', left: '68%', gold: false, size: 'sm', delay: '1.2s', duration: '3.4s' },
  { top: '40%', left: '96%', gold: false, size: 'sm', delay: '2.6s', duration: '3.8s' },
  { top: '54%', left: '32%', gold: false, size: 'sm', delay: '0.1s', duration: '4.6s' },
  { top: '78%', left: '42%', gold: false, size: 'sm', delay: '2.8s', duration: '3.2s' },
]

export default function AmbientBg() {
  return (
    <div className="ambient-aurora" aria-hidden="true">
      {STARS.map((s, i) => (
        <span
          key={i}
          className={[
            'ambient-aurora__star',
            s.gold ? 'ambient-aurora__star--gold' : '',
            s.size === 'lg' ? 'ambient-aurora__star--lg' : '',
            s.size === 'sm' ? 'ambient-aurora__star--sm' : '',
          ].filter(Boolean).join(' ')}
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  )
}
