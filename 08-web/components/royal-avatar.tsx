'use client'
import { getAvatar, getFrame } from '@/lib/profile-presets'
import VerifiedBadge from './verified-badge'
import './royal-avatar.css'

export default function RoyalAvatar({
  name = 'مستخدم',
  avatarKey,
  frameKey,
  avatarUrl,
  role,
  verified = false,
  size = 'md',
}: {
  name?: string
  avatarKey?: string | null
  frameKey?: string | null
  avatarUrl?: string | null
  role?: string
  verified?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const avatar = getAvatar(avatarKey)
  const frame = getFrame(frameKey)
  const initial = name.trim().charAt(0).toUpperCase()
  const isSuperAdmin = role === 'super_admin'
  const isAdmin = role === 'admin'
  const isMerchant = role === 'merchant'

  const frameStyle = frameKey && frameKey !== 'none' && !isSuperAdmin && !isAdmin && !isMerchant
    ? { border: `3px solid ${frame.border}`, boxShadow: `0 0 24px ${frame.glow}` }
    : undefined

  return (
    <div className={`ra ra--${size} ${isSuperAdmin ? 'ra--super' : ''} ${isAdmin ? 'ra--admin' : ''} ${isMerchant ? 'ra--merchant' : ''}`}>
      {/* Royal crown for SUPER admin only */}
      {isSuperAdmin && (
        <span className="ra__crown ra__crown--royal" aria-hidden>
          <svg viewBox="0 0 48 36" fill="none">
            <defs>
              <linearGradient id="crownRoyal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="25%" stopColor="#FDE68A" />
                <stop offset="55%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
              <linearGradient id="crownJewel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E879F9" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#6B21FF" />
              </linearGradient>
              <filter id="crownGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g filter="url(#crownGlow)">
              <path d="M4 30 L1 10 L11 17 L24 3 L37 17 L47 10 L44 30 Z" fill="url(#crownRoyal)" stroke="#FFFBEB" strokeWidth="0.9" strokeLinejoin="round"/>
              <path d="M6 28 L4 14 L12 19 L24 7 L36 19 L44 14 L42 28 Z" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5"/>
              <rect x="9" y="22" width="30" height="7" rx="2.5" fill="url(#crownRoyal)" stroke="#FFFBEB" strokeWidth="0.7"/>
              <circle cx="1" cy="10" r="2.4" fill="url(#crownJewel)" stroke="#FFFBEB" strokeWidth="0.5"/>
              <circle cx="24" cy="3" r="3" fill="url(#crownJewel)" stroke="#FFFBEB" strokeWidth="0.6"/>
              <circle cx="47" cy="10" r="2.4" fill="url(#crownJewel)" stroke="#FFFBEB" strokeWidth="0.5"/>
              <circle cx="14" cy="25.5" r="1.3" fill="#E879F9"/>
              <circle cx="24" cy="25.5" r="1.5" fill="#E879F9"/>
              <circle cx="34" cy="25.5" r="1.3" fill="#E879F9"/>
            </g>
          </svg>
          <span className="ra__crown-shine" aria-hidden />
        </span>
      )}

      {/* Decorative stars for super admin */}
      {isSuperAdmin && (
        <>
          <span className="ra__star ra__star--1">✦</span>
          <span className="ra__star ra__star--2">✦</span>
        </>
      )}

      <div
        className="ra__circle"
        style={{
          background: avatarUrl
            ? undefined
            : isAdmin
            ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
            : isMerchant
            ? 'linear-gradient(135deg, #10B981, #F59E0B)'
            : `linear-gradient(135deg, ${avatar.from}, ${avatar.to})`,
          ...(frameStyle ?? {}),
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} />
        ) : (
          <span className="ra__initial">{initial}</span>
        )}
      </div>

      {/* Store badge for merchant */}
      {isMerchant && !isAdmin && <span className="ra__store" aria-hidden>🏪</span>}

      {/* Verified badge */}
      {verified && (
        <span className="ra__verified">
          <VerifiedBadge size="sm" />
        </span>
      )}
    </div>
  )
}
