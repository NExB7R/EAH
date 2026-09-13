import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import OfferForm from '@/components/admin/offer-form'
import { updateOffer } from '../../../../offer-actions'

export const metadata = { title: 'تعديل عرض | EAH Admin' }

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ slug: string; offerId: string }>
}) {
  const { slug, offerId } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data: biz } = await supabase
    .from('businesses').select('id,name,slug').eq('slug', slug).maybeSingle()
  if (!biz) notFound()

  const { data: offer } = await supabase
    .from('offers').select('*').eq('id', offerId).eq('business_id', biz.id).maybeSingle()
  if (!offer) notFound()

  const action = async (
    prev: { ok: boolean; message?: string; errors?: Record<string, string[]> },
    formData: FormData
  ) => {
    'use server'
    return updateOffer(offerId, biz.slug, prev, formData)
  }

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">EDIT OFFER</span>
          <h1 className="admin-header__title">✏️ تعديل: {offer.title}</h1>
        </div>
        <div className="admin-header__actions">
          <Link href={`/admin/businesses/${biz.slug}/offers`} className="admin-btn admin-btn--ghost">← رجوع</Link>
        </div>
      </div>

      <OfferForm
        mode="edit"
        action={action}
        businessId={biz.id}
        businessSlug={biz.slug}
        initial={{
          title: offer.title,
          description: offer.description,
          price: offer.price,
          image_url: offer.image_url || offer.teaser_image_path,
          starts_at: offer.starts_at,
          ends_at: offer.ends_at,
          is_published: offer.is_published,
        }}
      />
    </>
  )
}
