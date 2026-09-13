'use client'
export default function AdminIconLink() {
  return (
    <a href="/admin" className="admin-icon-link" aria-label="لوحة التحكم">
      <span className="admin-icon-link__crown" aria-hidden>
        <svg viewBox="0 0 40 32" fill="none">
          <defs>
            <linearGradient id="ailCrown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="30%" stopColor="#FBBF24" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <path d="M4 26 L2 10 L11 16 L20 4 L29 16 L38 10 L36 26 Z" fill="url(#ailCrown)" stroke="#F5F3FF" strokeWidth="0.8" strokeLinejoin="round" />
          <circle cx="2" cy="10" r="2" fill="#FBBF24" />
          <circle cx="20" cy="4" r="2.5" fill="#FBBF24" />
          <circle cx="38" cy="10" r="2" fill="#FBBF24" />
        </svg>
      </span>
    </a>
  )
}
