export default function VerifiedBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`vbadge vbadge--${size}`} title="موثق" aria-label="موثق">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2L14.4 4.5L17.7 4.3L18.7 7.5L21.6 9.1L20.7 12.2L21.6 15.3L18.7 16.9L17.7 20.1L14.4 19.9L12 22.4L9.6 19.9L6.3 20.1L5.3 16.9L2.4 15.3L3.3 12.2L2.4 9.1L5.3 7.5L6.3 4.3L9.6 4.5L12 2Z"
          fill="url(#vbg)" stroke="#F5F3FF" strokeWidth="1"
        />
        <path d="M8 12L11 15L16 9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <defs>
          <linearGradient id="vbg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  )
}
