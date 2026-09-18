'use client'
import { useState } from 'react'

type Props = {
  businessId: string
  initialFollowing: boolean
  initialCount: number
  isAuthed: boolean
  size?: 'sm' | 'md'
}

export default function FollowButton({ businessId, initialFollowing, initialCount, isAuthed, size = 'md' }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!isAuthed) {
      window.location.href = '/auth?next=' + encodeURIComponent(window.location.pathname)
      return
    }
    if (loading) return
    setLoading(true)
    const action = following ? 'unfollow' : 'follow'
    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId, action }),
      })
      const data = await res.json()
      if (data?.ok) {
        setFollowing(!following)
        setCount(data.follower_count ?? count)
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(10)
      }
    } catch {}
    setLoading(false)
  }

  const cls = `fb-btn fb-${size} ${following ? 'fb-on' : ''}`
  return (
    <button type="button" className={cls} onClick={toggle} disabled={loading} aria-pressed={following}>
      <svg viewBox="0 0 24 24" width={size === 'sm' ? 14 : 16} height={size === 'sm' ? 14 : 16} fill={following ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{following ? 'بتتابع' : 'متابعة'}</span>
      {count > 0 && <span className="fb-count">{count}</span>}
    </button>
  )
}
