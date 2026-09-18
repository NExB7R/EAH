import { getActiveCouponsForBusiness } from '@/lib/coupons'
import CouponList from '@/components/coupons/coupon-list'
import { getBusinessBySlug } from '@/lib/data'

export default async function CouponSection({ slug }: { slug: string }) {
  const business = await getBusinessBySlug(slug)
  if (!business || !business.businessId) return null
  const coupons = await getActiveCouponsForBusiness(business.businessId)
  if (!coupons.length) return null
  return <CouponList coupons={coupons} />
}
