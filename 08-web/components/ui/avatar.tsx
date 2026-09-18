export default function Avatar({ src, name, size = 'md' }: { src?: string | null; name?: string; size?: 'sm' | 'md' | 'lg' }) {
  const initial = (name ?? '?').trim().charAt(0)
  return (
    <span className={`e-avatar e-avatar--${size}`}>
      {src ? <img src={src} alt={name ?? ''} /> : initial}
    </span>
  )
}
