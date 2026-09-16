'use client'
import Link from 'next/link'
import './hero-logo.css'

export default function HeroLogo({ href = '/' }: { href?: string }) {
  const content = (
    <span className="hl" dir="ltr">
      {/* Crown with animation */}
      <span className="hl__crown" aria-hidden>
        <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hl-crown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="30%" stopColor="#FDE68A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <radialGradient id="hl-jewel" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FDF4FF" />
              <stop offset="40%" stopColor="#F0ABFC" />
              <stop offset="100%" stopColor="#A855F7" />
            </radialGradient>
            <filter id="hl-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g filter="url(#hl-glow)">
            <path
              d="M12 58 L4 22 L30 38 L60 8 L90 38 L116 22 L108 58 Z"
              fill="url(#hl-crown)"
              stroke="#FFFBEB"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <rect x="18" y="52" width="84" height="11" rx="3" fill="url(#hl-crown)" stroke="#FFFBEB" strokeWidth="0.8" />
            <circle cx="60" cy="8" r="5.5" fill="url(#hl-jewel)" stroke="#FFFBEB" strokeWidth="1" />
            <circle cx="4" cy="22" r="4.2" fill="url(#hl-jewel)" stroke="#FFFBEB" strokeWidth="0.8" />
            <circle cx="116" cy="22" r="4.2" fill="url(#hl-jewel)" stroke="#FFFBEB" strokeWidth="0.8" />
            <circle cx="38" cy="57.5" r="2.4" fill="#E879F9" />
            <circle cx="60" cy="57.5" r="2.8" fill="#E879F9" />
            <circle cx="82" cy="57.5" r="2.4" fill="#E879F9" />
          </g>
        </svg>
      </span>

      {/* EAH Wordmark */}
      <span className="hl__word" aria-label="EAH">
        <span className="hl__letter">E</span>
        <span className="hl__letter">A</span>
        <span className="hl__letter">H</span>
      </span>

      {/* Tagline */}
      <span className="hl__tagline" dir="rtl">اللي نفسك فيه ؟</span>
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="hl__link" aria-label="EAH">
        {content}
      </Link>
    )
  }
  return content
}
