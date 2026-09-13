import { createClient } from '@/lib/supabase-server'
import type { SubscriptionPlan } from './types'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('not_authenticated')
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()
  if (role?.role !== 'super_admin' && role?.role !== 'admin') {
    throw new Error('unauthorized')
  }
  return { supabase, user }
}

export async function approveSubscription(
  subscriptionId: string,
  startTrial: boolean = true
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { supabase, user } = await assertAdmin()

    const { data: sub } = await supabase
      .from('business_subscriptions')
      .select('id,business_id,plan_id')
      .eq('id', subscriptionId)
      .maybeSingle()

    if (!sub) return { ok: false, error: 'not_found' }

    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('duration_days,trial_days')
      .eq('id', sub.plan_id)
      .maybeSingle()

    const trialDays = startTrial ? (plan?.trial_days ?? 30) : 0
    const durationDays = plan?.duration_days ?? 30

    const now = new Date()
    const startsAt = now.toISOString()
    const expiresAt = new Date(
      now.getTime() + (trialDays || durationDays) * 24 * 60 * 60 * 1000
    ).toISOString()

    const newStatus = trialDays > 0 ? 'trial' : 'active'

    const { error } = await supabase
      .from('business_subscriptions')
      .update({
        status: newStatus,
        is_trial: trialDays > 0,
        starts_at: startsAt,
        expires_at: expiresAt,
        approved_at: now.toISOString(),
        activated_by: user.id,
      })
      .eq('id', subscriptionId)

    if (error) return { ok: false, error: error.message }

    await supabase.from('subscription_events').insert({
      subscription_id: subscriptionId,
      business_id: sub.business_id,
      event_type: trialDays > 0 ? 'trial_started' : 'approved',
      actor_id: user.id,
      metadata: { trial_days: trialDays, duration_days: durationDays },
    })

    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function rejectSubscription(
  subscriptionId: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { supabase, user } = await assertAdmin()
    const { data: sub } = await supabase
      .from('business_subscriptions')
      .select('business_id')
      .eq('id', subscriptionId)
      .maybeSingle()
    if (!sub) return { ok: false, error: 'not_found' }

    const { error } = await supabase
      .from('business_subscriptions')
      .update({
        status: 'rejected',
        rejected_reason: reason,
        activated_by: user.id,
      })
      .eq('id', subscriptionId)

    if (error) return { ok: false, error: error.message }

    await supabase.from('subscription_events').insert({
      subscription_id: subscriptionId,
      business_id: sub.business_id,
      event_type: 'rejected',
      actor_id: user.id,
      metadata: { reason },
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  reason?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { supabase, user } = await assertAdmin()
    const { data: sub } = await supabase
      .from('business_subscriptions')
      .select('business_id')
      .eq('id', subscriptionId)
      .maybeSingle()
    if (!sub) return { ok: false, error: 'not_found' }

    const { error } = await supabase
      .from('business_subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId)

    if (error) return { ok: false, error: error.message }

    await supabase.from('subscription_events').insert({
      subscription_id: subscriptionId,
      business_id: sub.business_id,
      event_type: 'cancelled',
      actor_id: user.id,
      metadata: { reason: reason ?? null },
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function upsertPlan(
  plan: Partial<SubscriptionPlan> & { id?: string }
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const { supabase } = await assertAdmin()
    if (plan.id) {
      const { error } = await supabase
        .from('subscription_plans')
        .update(plan)
        .eq('id', plan.id)
      if (error) return { ok: false, error: error.message }
      return { ok: true, id: plan.id }
    }
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert(plan)
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, id: data.id }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
