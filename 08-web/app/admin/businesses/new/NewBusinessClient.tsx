'use client'
import { useEffect, useState } from 'react'
import BusinessForm from '@/components/admin/business-form'

type ActionState = { ok: boolean; message?: string; errors?: Record<string, string[]> }

export default function NewBusinessClient({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
}) {
  const [initial, setInitial] = useState<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eah_collect_draft')
      if (raw) {
        const parsed = JSON.parse(raw)
        setInitial(parsed)
        sessionStorage.removeItem('eah_collect_draft')
      }
    } catch {}
    setReady(true)
  }, [])

  if (!ready) return null

  return <BusinessForm mode="create" action={action} initial={initial} />
}
