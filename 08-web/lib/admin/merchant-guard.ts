import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export type MerchantBusiness = {
  id: string
  name: string
  slug: string
  business_type: string
  area: string | null
  city: string | null
  is_open: boolean
  is_published: boolean
  is_featured: boolean
  owner_profile_id: string | null
}

export async function getMerchantContext() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')
  const user = userData.user

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  const role = roleRow?.role ?? 'customer'

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id,name,slug,business_type,area,city,is_open,is_published,is_featured,owner_profile_id')
    .eq('owner_profile_id', user.id)
    .order('created_at', { ascending: false })

  return {
    supabase,
    user,
    role,
    businesses: (businesses ?? []) as MerchantBusiness[],
  }
}

export async function requireMerchantForBusiness(slug: string) {
  const ctx = await getMerchantContext()
  const business = ctx.businesses.find((b) => b.slug === slug)
  if (!business) redirect('/merchant')
  return { ...ctx, business }
}
