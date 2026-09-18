'use client'
import Link from 'next/link'

export default function RewardsTabs({
  active,
  pendingCount,
}: {
  active: string
  pendingCount: number
}) {
  const tabs = [
    { key: 'catalog', label: 'الكتالوج', href: '/admin/rewards' },
    { key: 'redemptions', label: ' طلبات الاستبدال', href: '/admin/rewards?tab=redemptions', badge: pendingCount },
  ]
  return (
    <div className="rew-tabs">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`rew-tab ${active === t.key ? 'is-active' : ''}`}
        >
          {t.label}
          {t.badge !== undefined && t.badge > 0 && (
            <span className="rew-tab__badge">{t.badge}</span>
          )}
        </Link>
      ))}
    </div>
  )
}
