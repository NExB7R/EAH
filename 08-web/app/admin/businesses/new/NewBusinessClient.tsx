'use client'
import BusinessForm from '@/components/admin/business-form'

type ActionState = { ok: boolean; message?: string; errors?: Record<string, string[]> }

export default function NewBusinessClient({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
}) {
  return <BusinessForm mode="create" action={action} />
}
