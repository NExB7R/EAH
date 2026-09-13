'use client'
import { useTransition, useState } from 'react'
import { redeemReward } from './actions'

type Reward = {
  id: string
  title: string
  description: string | null
  emoji: string
  category: string
  value: number | null
  value_type: string
  points_cost: number
  min_streak: number
  stock: number | null
}

const CAT_LABEL: Record<string, { label: string; color: string }> = {
  voucher:  { label: 'قسيمة',        color: '#A855F7' },
  discount: { label: 'خصم',          color: '#F97316' },
  freebie:  { label: 'هدية',         color: '#EC4899' },
  delivery: { label: 'توصيل',        color: '#4ADE80' },
  badge:    { label: 'شارة',         color: '#FBBF24' },
  frame:    { label: 'إطار',         color: '#6366F1' },
  feature:  { label: 'ميزة',         color: '#06B6D4' },
  cash:     { label: 'فلوس',         color: '#10B981' },
}

export default function RewardCard({
  reward, userBalance, userStreak,
}: {
  reward: Reward
  userBalance: number
  userStreak: number
}) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const cat = CAT_LABEL[reward.category] ?? CAT_LABEL.voucher
  const canAfford = userBalance >= reward.points_cost
  const meetsStreak = userStreak >= reward.min_streak
  const inStock = reward.stock === null || reward.stock > 0
  const canRedeem = canAfford && meetsStreak && inStock

  const valueLabel = (() => {
    if (!reward.value) return null
    if (reward.value_type === 'EGP') return `${reward.value} ج.م`
    if (reward.value_type === 'percent') return `${reward.value}%`
    if (reward.value_type === 'free') return 'مجانًا'
    return null
  })()

  function handleRedeem() {
    start(async () => {
      const r = await redeemReward(reward.id)
      if (r.ok) {
        setResult({ ok: true, msg: `✓ كودك: ${r.code}` })
      } else {
        setResult({ ok: false, msg: r.message ?? 'خطأ' })
      }
    })
  }

  return (
    <div className={`rw-card ${!canRedeem ? 'rw-card--locked' : ''}`}>
      <div className="rw-card__head">
        <span className="rw-card__emoji">{reward.emoji}</span>
        <span className="rw-card__cat" style={{ color: cat.color, borderColor: `${cat.color}44`, background: `${cat.color}12` }}>
          {cat.label}
        </span>
      </div>

      <div className="rw-card__body">
        <h3 className="rw-card__title">{reward.title}</h3>
        {valueLabel && <span className="rw-card__value">{valueLabel}</span>}
        {reward.description && <p className="rw-card__desc">{reward.description}</p>}
      </div>

      <div className="rw-card__foot">
        <div className="rw-card__cost">
          <span className="rw-card__cost-num">{reward.points_cost}</span>
          <span className="rw-card__cost-label">نقطة</span>
        </div>
        <button
          type="button"
          className="rw-card__btn"
          onClick={handleRedeem}
          disabled={!canRedeem || pending}
        >
          {pending ? '...' : canRedeem ? 'استبدل' : !canAfford ? 'نقاطك مش كفاية' : !meetsStreak ? `streak ${reward.min_streak}` : 'خلص'}
        </button>
      </div>

      {result && (
        <div className={`rw-card__result ${result.ok ? 'is-ok' : 'is-err'}`}>
          {result.msg}
        </div>
      )}
    </div>
  )
}
