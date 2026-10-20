import Link from 'next/link'
import { notFound } from 'next/navigation'
import AccountPageHeader from '@/components/account-page-header'
import { ArrowLeftIcon } from '@/components/icons'
import { getBusinessById } from '@/lib/data/admin-business'
import BusinessForm from '../business-form'
import BusinessPreview from '../business-preview'
import DeleteBusinessButton from './delete-button'
import TrialOwnerPanel from './trial-owner-panel'
import BusinessActionsBar from './business-actions-bar'
import OverviewPanel from './overview-panel'
import tabsStyles from './detail-tabs.module.css'
import styles from '../businesses.module.css'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

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

  const biz = await getBusinessById(id)
  if (!biz) notFound()

  const logoUrl = biz.media.find((m) => m.media_type === 'logo')?.storage_path ?? null
  const coverUrl =
    biz.cover_image_url ?? biz.media.find((m) => m.media_type === 'cover')?.storage_path ?? null

  return (
    <div className={styles.detailPage}>
      <AccountPageHeader
        title={biz.name}
        description={`${TYPE_LABEL[biz.business_type] ?? biz.business_type} · ${biz.area ?? 'بدون منطقة'}`}
      />

      <div className={styles.detailActions}>
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

      {activeTab === 'overview' && (
        <>
          <OverviewPanel biz={biz} />
          <div className={styles.actions}>
            <DeleteBusinessButton id={biz.id} name={biz.name} />
          </div>
        </>
      )}

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
          <div className={styles.actions}>
            <DeleteBusinessButton id={biz.id} name={biz.name} />
          </div>
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
          {biz.is_published ? (
            <Link
              href={`/businesses/${biz.slug}`}
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
          <div className={styles.actions}>
            <DeleteBusinessButton id={biz.id} name={biz.name} />
          </div>
        </div>
      )}
    </div>
  )
}
