import { redirect } from 'next/navigation'
import { GiftIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness, getMerchantOffers } from '@/lib/data/merchant'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import OfferForm from './offer-form'
import OfferList from './offer-list'

export const dynamic = 'force-dynamic'

export default async function MerchantOffersPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/offers')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  const offers = await getMerchantOffers(business.id)

  return (
    <div>
      <AccountPageHeader
        title="العروض"
        description={`${offers.length} عرض — كل عرض جديد يوصل لمتابعينك فوراً`}
      />
      <OfferForm />
      {offers.length === 0 ? (
        <EmptyState
          Icon={GiftIcon}
          title="مفيش عروض لسه"
          description="اعمل أول عرض — متابعينك هيوصلهم إشعار فوري"
        />
      ) : (
        <OfferList offers={offers} />
      )}
    </div>
  )
}
