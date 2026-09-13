'use server'
import { revalidatePath } from 'next/cache'
import { upsertPlan } from '@/lib/subscription/admin'

export async function savePlanAction(formData: FormData) {
  const id = formData.get('id') as string | null
  const code = String(formData.get('code') ?? '').trim()
  const name_ar = String(formData.get('name_ar') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  const duration_days = parseInt(String(formData.get('duration_days') ?? '30'), 10)
  const trial_days = parseInt(String(formData.get('trial_days') ?? '0'), 10)
  const priceStr = String(formData.get('price_egp') ?? '').trim()
  const price_egp = priceStr === '' ? null : parseFloat(priceStr)
  const featuresRaw = String(formData.get('features') ?? '').trim()
  const features = featuresRaw
    ? featuresRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const display_order = parseInt(String(formData.get('display_order') ?? '0'), 10)
  const is_active = formData.get('is_active') === 'on'

  const res = await upsertPlan({
    ...(id ? { id } : {}),
    code,
    name_ar,
    description,
    duration_days,
    trial_days,
    price_egp,
    features: features as any,
    display_order,
    is_active,
  })

  if (res.ok) revalidatePath('/admin/subscriptions/plans')
  return res
}
