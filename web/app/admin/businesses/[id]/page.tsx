import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon } from '@/components/icons'
import { getBusinessById } from '@/lib/data/admin-business'
import { getMerchantOrderSettings } from '@/lib/data/orders-settings'
import BusinessForm from '../business-form'
import BusinessPreview from '../business-preview'
import BusinessHero from './business-hero'
import BusinessActionsBar from './business-actions-bar'
import OrderSettingsPanel from './order-settings-panel'
import OverviewPanel from './overview-panel'
import TrialOwnerPanel from './trial-owner-panel'
import tabsStyles from './detail-tabs.module.css'
import { getPublishedBusinessHref } from '@/lib/utils/published-business-href'

export const dynamic = 'force-dynamic'

const TABS = [
  { key: 'overview', label: 'نظرة عامة' },
  { key: 'edit', label: 'تعديل' },
  { key: 'preview', label: 'معاينة' },
] as const

type TabKey = (typeof TABS)[number]['key']

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminBusinessDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const requested = sp.tab as TabKey | undefined
  const activeTab: TabKey = TABS.some((t) => t.key === requested)
    ? (requested as TabKey)
    : 'overview'

  const [biz, orderSettings] = await Promise.all([
    getBusinessById(id),
    getMerchantOrderSettings(id),
  ])
  if (!biz) notFound()

  const logoUrl = biz.media.find((m) => m.media_type === 'logo')?.storage_path ?? biz.logo_url
  const publicBusinessHref = getPublishedBusinessHref(biz.is_published, biz.slug)
  const coverUrl =
    biz.cover_image_url ?? biz.media.find((m) => m.media_type === 'cover')?.storage_path ?? null

  return (
    <div className={tabsStyles.page}>
      <Link href="/admin/businesses" className={tabsStyles.backLink}>
        <ArrowLeftIcon size={13} />
        <span>الأنشطة</span>
      </Link>

      <BusinessHero biz={biz} logoUrl={logoUrl} />

      <OrderSettingsPanel
        businessId={biz.id}
        ownerProfileId={biz.owner_profile_id || null}
        settings={
          orderSettings
            ? {
                orders_enabled: orderSettings.orders_enabled,
                deadline_minutes: orderSettings.deadline_minutes,
                delivery_eta_minutes: orderSettings.delivery_eta_minutes,
                orders_enabled_at:
                  (orderSettings as unknown as { orders_enabled_at?: string | null })
                    .orders_enabled_at ?? null,
                suspended_until: orderSettings.suspended_until,
              }
            : null
        }
      />

      <div className={tabsStyles.actionsRow}>
        <BusinessActionsBar
          businessId={biz.id}
          businessName={biz.name}
          businessSlug={biz.slug}
          isPublished={biz.is_published}
          isRejected={!!biz.rejected_at}
        />
      </div>

      <nav className={tabsStyles.tabs} aria-label="تبويبات النشاط">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`?tab=${t.key}`}
            className={`${tabsStyles.tab} ${activeTab === t.key ? tabsStyles.tabActive : ''}`}
            aria-current={activeTab === t.key ? 'page' : undefined}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {activeTab === 'overview' && <OverviewPanel biz={biz} />}

      {activeTab === 'edit' && (
        <div className={tabsStyles.editWrap}>
          <TrialOwnerPanel
            businessId={biz.id}
            businessName={biz.name}
            ownerProfileId={biz.owner_profile_id || null}
            ownerDisplayName={biz.owner?.display_name ?? null}
            ownerPhone={biz.owner?.phone ?? null}
            source={biz.source}
            trialUsed={biz.trial_used}
          />
          <BusinessForm mode="edit" business={biz} />
        </div>
      )}

      {activeTab === 'preview' && (
        <div className={tabsStyles.previewWrap}>
          <BusinessPreview
            name={biz.name}
            type={biz.business_type}
            area={biz.area}
            hook={biz.hook}
            logoUrl={logoUrl}
            coverUrl={coverUrl}
            isFeatured={biz.is_featured}
            isNew={false}
          />
          {publicBusinessHref ? (
            <Link
              href={publicBusinessHref}
              target="_blank"
              rel="noopener noreferrer"
              className={tabsStyles.previewLink}
            >
              <ArrowLeftIcon size={14} />
              <span>افتح الصفحة العامة</span>
            </Link>
          ) : (
            <p className={tabsStyles.previewHint}>
              النشاط مش منشور — انشره عشان تفتح الصفحة العامة.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
