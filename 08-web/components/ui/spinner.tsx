export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`e-spinner ${size === 'lg' ? 'e-spinner--lg' : ''}`} aria-label="جاري التحميل" />
}
