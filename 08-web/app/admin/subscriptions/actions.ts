'use server'

import { revalidatePath } from 'next/cache'
import { approveSubscription, rejectSubscription, cancelSubscription } from '@/lib/subscription/admin'

export async function approveAction(id: string, startTrial: boolean) {
  const res = await approveSubscription(id, startTrial)
  if (res.ok) {
    revalidatePath('/admin/subscriptions')
    revalidatePath('/merchant/subscription')
  }
  return res
}

export async function rejectAction(id: string, reason: string) {
  const res = await rejectSubscription(id, reason)
  if (res.ok) {
    revalidatePath('/admin/subscriptions')
    revalidatePath('/merchant/subscription')
  }
  return res
}

export async function cancelAction(id: string, reason?: string) {
  const res = await cancelSubscription(id, reason)
  if (res.ok) {
    revalidatePath('/admin/subscriptions')
    revalidatePath('/merchant/subscription')
  }
  return res
}
