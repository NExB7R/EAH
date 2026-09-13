'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export async function redeemReward(rewardId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('redeem_reward', { p_reward_id: rewardId })

  if (error) return { ok: false, message: error.message }
  const r = data as any
  if (!r?.ok) {
    const msgs: Record<string, string> = {
      insufficient_points: `نقاطك مش كفاية (محتاج ${r.needed})`,
      out_of_stock: 'خلصت الكمية',
      streak_too_low: `لازم streak ${r.needed} يوم على الأقل`,
      reward_not_found: 'المكافأة مش متاحة',
      not_authenticated: 'مش مسجل دخول',
    }
    return { ok: false, message: msgs[r?.reason] ?? 'حصل خطأ' }
  }

  revalidatePath('/account/points')
  revalidatePath('/account')
  return { ok: true, code: r.code, title: r.reward_title, newBalance: r.new_balance }
}
