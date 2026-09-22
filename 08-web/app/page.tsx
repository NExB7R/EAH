import { Suspense } from 'react'
import HomeDynamicV2 from '@/components/home-dynamic-v2'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'

// cache للصفحة كلها 2 دقايق
export const revalidate = 120

export default async function Page() {
  return (
    <>
      <FloatingCapsuleHeader />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeDynamicV2 />
      </Suspense>
      <SiteFooter />
    </>
  )
}

function HomeSkeleton() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A29DB5', fontFamily: 'Cairo, system-ui' }}>
      جاري التحميل...
    </div>
  )
}
