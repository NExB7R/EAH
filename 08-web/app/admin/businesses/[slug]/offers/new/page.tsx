import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import OfferForm from '@/components/admin/offer-form'
import { createOffer } from '../../../offer-actions'

export const metadata = { title: 'عرض جديد | EAH Admin' }

export default async function NewOfferPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data: biz } = await supabase
    .from('businesses').select('id,name,slug').eq('slug', slug).maybeSingle()
  if (!biz) notFound()

  const action = async (
    prev: { ok: boolean; message?: string; errors?: Record<string, string[]> },
    formData: FormData
  ) => {
    'use server'
    return createOffer(biz.id, biz.slug, prev, formData)
  }

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">NEW OFFER</span>
          <h1 className="admin-header__title">➕ عرض جديد لـ {biz.name}</h1>
        </div>
        <div className="admin-header__actions">
          <Link href={`/admin/businesses/${biz.slug}/offers`} className="admin-btn admin-btn--ghost">← رجوع</Link>
        </div>
      </div>

      <OfferForm
        mode="create"
        action={action}
        businessId={biz.id}
        businessSlug={biz.slug}
      />
    </>
  )
}
