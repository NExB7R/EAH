'use client'
import { useTransition } from 'react'
import { markAllRead, deleteNotification } from './actions'

export function MarkAllReadButton() {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      className="nt-btn nt-btn--primary"
      onClick={() => start(async () => { await markAllRead() })}
      disabled={pending}
    >
      {pending ? '...' : '✓ اقرأ الكل'}
    </button>
  )
}

export function DeleteNotifButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      className="nt-item__delete"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); start(async () => { await deleteNotification(id) }) }}
      disabled={pending}
      aria-label="حذف"
    >
      {pending ? '...' : '🗑️'}
    </button>
  )
}
