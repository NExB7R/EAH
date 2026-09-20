'use client'
import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { markAllRead, deleteNotification, markRead } from './actions'
import { IcCheck } from '@/components/eah-icons'

export function MarkAllReadButton() {
  const [pending, start] = useTransition()
  const [done, setDone] = useState(false)
  const router = useRouter()

  function handle() {
    setDone(true)
    start(async () => {
      await markAllRead()
      setTimeout(() => router.refresh(), 100)
    })
  }

  return (
    <button
      type="button"
      className={`nt-btn nt-btn--primary ${done ? 'is-done' : ''}`}
      onClick={handle}
      disabled={pending || done}
    >
      {pending ? '...' : done ? '✓ تم — رجّعنا' : 'اقرأ الكل'}
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
      {pending ? '...' : '×'}
    </button>
  )
}

export function NotifLink({ href, id, unread, children }: { href: string; id: string; unread: boolean; children: React.ReactNode }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      className={`nt-item ${unread ? 'nt-item--unread' : ''}`}
      style={{ width: '100%', textAlign: 'start', cursor: 'pointer', font: 'inherit', color: 'inherit', background: 'transparent' }}
      onClick={() => {
        start(async () => {
          if (unread) { try { await markRead(id) } catch {} }
          router.push(href)
        })
      }}
      disabled={pending}
    >
      {children}
    </button>
  )
}
