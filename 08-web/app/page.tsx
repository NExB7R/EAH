import { Suspense } from 'react'
import HomeDynamic from '@/components/home-dynamic'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SidePanel from '@/components/side-panel'
import BackToTop from '@/components/back-to-top'

export const revalidate = 60

export default async function Page() {
  return (
    <>
      <FloatingCapsuleHeader />
      <Suspense fallback={null}>
        <SidePanel />
      </Suspense>
      <BackToTop />
      <HomeDynamic />
      <SiteFooter />
    </>
  )
}
