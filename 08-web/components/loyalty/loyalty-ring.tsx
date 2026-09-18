import type { MyLoyalty, TierCode } from '@/lib/loyalty'
import { TIER_COLORS, TIER_ICON } from '@/lib/loyalty'

export default function LoyaltyRing({ data }: { data: MyLoyalty }) {
  const tier: TierCode = data.tier
  const c = TIER_COLORS[tier]
  const total = data.next_tier ? data.points + data.points_to_next : data.points
  const pct = total > 0 ? Math.min(1, data.points / total) : 1
  const size = 140
  const stroke = 10
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * pct

  return (
    <div className="lr-wrap">
      <div className="lr-svg-wrap" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="lr-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c.from} />
              <stop offset="100%" stopColor={c.to} />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none" stroke="url(#lr-grad)" strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="lr-center">
          <div className="lr-icon">{TIER_ICON[tier]}</div>
          <div className="lr-points">{data.points}</div>
          <div className="lr-label">نقطة</div>
        </div>
      </div>
      <div className="lr-info">
        <div className="lr-tier">مستواك: {tier === 'bronze' ? 'برونزي' : tier === 'silver' ? 'فضي' : 'ذهبي'}</div>
        {data.next_tier && (
          <div className="lr-next">باقي {data.points_to_next} نقطة لـ {data.next_name}</div>
        )}
        {!data.next_tier && <div className="lr-next lr-max">وصلت لأعلى مستوى 🎉</div>}
      </div>
    </div>
  )
}
