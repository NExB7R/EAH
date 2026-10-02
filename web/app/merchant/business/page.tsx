import { redirect } from 'next/navigation'
import { StoreIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness, getMyContacts } from '@/lib/data/merchant'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import BusinessEditForm from './edit-form'

export const dynamic = 'force-dynamic'

export default async function MerchantBusinessPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/business')

  const business = await getMyBusiness(session.userId)

  if (!business) {
    return (
      <EmptyState
        Icon={StoreIcon}
        title="لسه مسجلتش نشاط"
        description="سجّل نشاطك الأول عشان تعدّل بياناته"
        ctaHref="/merchant/apply"
        ctaLabel="سجّل نشاطك"
      />
    )
  }

  const contacts = await getMyContacts(business.id)

  return (
    <div>
      <AccountPageHeader title="نشاطي" description="عدّل بيانات النشاط — كل تعديل يتحفظ فوراً" />
      <BusinessEditForm
        initial={{
          name: business.name,
          area: business.area ?? '',
          description: business.description ?? '',
          hook: business.hook ?? '',
          address: business.address_text ?? '',
          isOpen: business.is_open,
          acceptsWhatsapp: business.accepts_whatsapp_orders,
          phone: contacts.phone ?? '',
          whatsapp: contacts.whatsapp ?? '',
        }}
      />
    </div>
  )
}
