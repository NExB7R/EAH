'use client'
import dynamic from 'next/dynamic'

const OnboardingOverlay = dynamic(() => import('@/components/onboarding-overlay'), { ssr: false })
const ServiceWorkerRegister = dynamic(() => import('@/components/sw-register'), { ssr: false })
const NetworkStatus = dynamic(() => import('@/components/network-status'), { ssr: false })
const OfflineQueueMount = dynamic(() => import('@/components/offline-queue-mount'), { ssr: false })
const InstallAppButton = dynamic(() => import('@/components/install-app-button'), { ssr: false })
const CookieConsent = dynamic(() => import('@/components/cookie-consent'), { ssr: false })
const SyncStatus = dynamic(() => import('@/components/sync-status'), { ssr: false })

export default function DeferredMounts() {
  return (
    <>
      <OnboardingOverlay />
      <ServiceWorkerRegister />
      <NetworkStatus />
      <OfflineQueueMount />
      <InstallAppButton />
      <CookieConsent />
      <SyncStatus />
    </>
  )
}
