import { Suspense } from 'react'
import HomeDynamicV2 from '@/components/home-dynamic-v2'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import BackToTop from '@/components/back-to-top'

export const revalidate = 60

export default async function Page() {
  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <HomeDynamicV2 />
      <SiteFooter />
    </>
  )
}
