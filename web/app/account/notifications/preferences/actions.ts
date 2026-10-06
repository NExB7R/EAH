'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { ok: false; error: string }

type Pref = { key: string; value: boolean }

export async function savePreferences(prefs: Pref[]): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'غير مصرح' }

  const { error } = await supabase
    .from('profiles')
    .update({ notif_prefs: Object.fromEntries(prefs.map((p) => [p.key, p.value])) })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/account/notifications/preferences')
  return { ok: true }
}
