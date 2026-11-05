'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import WmImage from './wm-image'
import BranchList from './branch-list'
import {
  MapPinIcon,
  ClockIcon,
  FacebookIcon,
  GlobeIcon,
  StoreIcon,
  ImageIcon,
  MessageCircleIcon,
} from './icons'
import ReviewsList from './reviews-list'
import CommentsList from './comments-list'
import type {
  BusinessDetail,
  BusinessOfferSimple,
  Review,
  ReviewStats,
} from '@/lib/data/business-detail'
import type { CommentNode } from '@/lib/data/comments'
import styles from './business-tabs.module.css'

type Tab = 'info' | 'offers' | 'menu' | 'reviews' | 'comments'

type Props = {
  detail: BusinessDetail
  reviews: Review[]
  reviewStats: ReviewStats
  initialTab: 'info' | 'reviews'
  canReview: boolean
  isLoggedIn: boolean
  hasReviewed: boolean
  isOwner: boolean
  reviewsEnabled: boolean
  comments: CommentNode[]
  currentUserId: string | null
  followingRootIds?: string[]
  offers?: BusinessOfferSimple[]
}

// Treat punctuation-only values (for example ":" or "(:") as empty UI data.
function isNonEmpty(s: string | null | undefined): s is string {
  if (!s) return false
  return s.replace(/[\p{P}\p{S}\s]/gu, '').length > 0
}

function toMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):[0-5]\d$/.exec(value)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[0].slice(3))
}

const DAY_LABEL: Record<string, string> = {
  sun: 'الأحد',
  mon: 'الاثنين',
  tue: 'الثلاثاء',
  wed: 'الأربعاء',
  thu: 'الخميس',
  fri: 'الجمعة',
  sat: 'السبت',
}

const DAY_ORDER = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']

export default function BusinessTabs({
  detail,
  reviews,
  reviewStats,
  initialTab,
  canReview,
  isLoggedIn,
  hasReviewed,
  isOwner,
  reviewsEnabled,
  comments,
  currentUserId,
  followingRootIds = [],
  offers = [],
}: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const lightboxCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!lightbox) return

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    lightboxCloseRef.current?.focus()

    const handleLightboxKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null)
      } else if (event.key === 'Tab') {
        event.preventDefault()
        lightboxCloseRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleLightboxKeyDown)
    return () => {
      document.removeEventListener('keydown', handleLightboxKeyDown)
      previouslyFocused?.focus()
    }
  }, [lightbox])

  const { business, contacts, branches, menu, gallery } = detail
  const featured = business.is_featured

  const activeTabId =
    tab === 'reviews'
      ? 'reviews-section'
      : tab === 'comments'
        ? 'comments-section'
        : 'business-tab-' + tab

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const isRtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    )
    if (tabs.length === 0) return

    const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement)
    let nextIndex = currentIndex

    if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = tabs.length - 1
    else if (event.key === 'ArrowRight') nextIndex += isRtl ? -1 : 1
    else if (event.key === 'ArrowLeft') nextIndex += isRtl ? 1 : -1
    else return

    event.preventDefault()
    nextIndex = (nextIndex + tabs.length) % tabs.length
    const nextTab = tabs[nextIndex]
    nextTab?.focus()
    nextTab?.click()
  }

  const facebook = contacts.find((c) => c.method_type === 'facebook')
  const instagram = contacts.find((c) => c.method_type === 'instagram')
  const website = contacts.find((c) => c.method_type === 'website')

  return (
    <div className={`${styles.wrap} ${featured ? styles.wrapFeatured : ''}`}>
      {/* ─── Tabs Bar ─── */}
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="محتوى النشاط"
        onKeyDown={handleTabKeyDown}
      >
        <button
          role="tab"
          id="business-tab-info"
          aria-controls="business-tabpanel"
          tabIndex={tab === 'info' ? 0 : -1}
          aria-selected={tab === 'info'}
          className={`${styles.tab} ${tab === 'info' ? styles.active : ''}`}
          onClick={() => setTab('info')}
        >
          <StoreIcon size={15} />
          <span>معلومات</span>
        </button>
        <button
          role="tab"
          id="business-tab-offers"
          aria-controls="business-tabpanel"
          tabIndex={tab === 'offers' ? 0 : -1}
          aria-selected={tab === 'offers'}
          className={`${styles.tab} ${tab === 'offers' ? styles.active : ''}`}
          onClick={() => setTab('offers')}
        >
          <span>العروض</span>
          {offers.length > 0 && <span className={styles.tabCount}>{offers.length}</span>}
        </button>

        <button
          role="tab"
          id="business-tab-menu"
          aria-controls="business-tabpanel"
          tabIndex={tab === 'menu' ? 0 : -1}
          aria-selected={tab === 'menu'}
          className={`${styles.tab} ${tab === 'menu' ? styles.active : ''}`}
          onClick={() => setTab('menu')}
        >
          <ImageIcon size={15} />
          <span>المنيو</span>
          {menu.length > 0 && <span className={styles.tabCount}>{menu.length}</span>}
        </button>
        {reviewsEnabled && (
          <button
            role="tab"
            aria-controls="business-tabpanel"
            tabIndex={tab === 'reviews' ? 0 : -1}
            aria-selected={tab === 'reviews'}
            className={`${styles.tab} ${tab === 'reviews' ? styles.active : ''}`}
            onClick={() => setTab('reviews')}
            id="reviews-section"
          >
            <MessageCircleIcon size={15} />
            <span>التقييمات</span>
            {reviewStats.count > 0 && <span className={styles.tabCount}>{reviewStats.count}</span>}
          </button>
        )}
        <button
          role="tab"
          aria-controls="business-tabpanel"
          tabIndex={tab === 'comments' ? 0 : -1}
          aria-selected={tab === 'comments'}
          className={`${styles.tab} ${tab === 'comments' ? styles.active : ''}`}
          onClick={() => setTab('comments')}
          id="comments-section"
        >
          <MessageCircleIcon size={15} />
          <span>التعليقات</span>
          {comments.length > 0 && <span className={styles.tabCount}>{comments.length}</span>}
        </button>
      </div>

      {/* ─── Info Tab ─── */}
      {tab === 'info' && (
        <div
          className={styles.content}
          role="tabpanel"
          id="business-tabpanel"
          aria-labelledby={activeTabId}
          tabIndex={0}
        >
          {/* Public social links only; phone and WhatsApp use the protected reveal flow. */}
          {(facebook || instagram || website) && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>روابط النشاط</h3>
              <div className={styles.contactList}>
                {facebook && (
                  <a
                    href={facebook.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.contactItem} ${styles.contactFacebook}`}
                  >
                    <FacebookIcon size={16} />
                    <span>فيسبوك</span>
                  </a>
                )}
                {instagram && (
                  <a
                    href={instagram.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactItem}
                  >
                    <GlobeIcon size={16} />
                    <span>إنستجرام</span>
                  </a>
                )}
                {website && (
                  <a
                    href={website.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactItem}
                  >
                    <GlobeIcon size={16} />
                    <span>الموقع الرسمي</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Hours */}
          {business.working_hours && Object.keys(business.working_hours).length > 0 ? (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>
                <ClockIcon size={14} />
                مواعيد العمل
              </h3>
              <ul className={styles.hoursList}>
                {DAY_ORDER.map((day) => {
                  const h = (
                    business.working_hours as Record<string, { open: string; close: string }> | null
                  )?.[day]
                  const openMinutes = h ? toMinutes(h.open) : null
                  const closeMinutes = h ? toMinutes(h.close) : null
                  const overnight =
                    h !== undefined &&
                    h !== null &&
                    h.open !== h.close &&
                    openMinutes !== null &&
                    closeMinutes !== null &&
                    closeMinutes < openMinutes

                  return (
                    <li key={day} className={styles.hoursRow}>
                      <span className={styles.hoursDay}>{DAY_LABEL[day]}</span>
                      {h ? (
                        <span className={styles.hoursRange} dir="ltr">
                          <span className={styles.hoursTime}>{h.open}</span>
                          <span className={styles.hoursSeparator} aria-hidden="true">–</span>
                          <span className={styles.hoursTime}>{h.close}</span>
                          {overnight && (
                            <span className={styles.overnightNote} dir="rtl">
                              لليوم التالي
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className={styles.hoursTime}>مغلق</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>
                <ClockIcon size={14} />
                مواعيد العمل
              </h3>
              <p className={styles.hoursNotice}>
                المواعيد الأسبوعية لسه مش محددة. حالة الفتح الحالية بتعتمد على إعداد النشاط.
              </p>
            </div>
          )}

          {/* Address */}
          {business.address_text && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>
                <MapPinIcon size={14} />
                العنوان
              </h3>
              <p className={styles.addressText}>{business.address_text}</p>
              {business.map_url && (
                <a
                  href={business.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapBtn}
                >
                  <MapPinIcon size={14} />
                  <span>افتح في الخرايط</span>
                </a>
              )}
            </div>
          )}

          {/* Description — prefer description, fallback to hook */}
          {isNonEmpty(business.description) ? (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>عن النشاط</h3>
              <p className={styles.desc}>{business.description.trim()}</p>
            </div>
          ) : isNonEmpty(business.hook) ? (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>عن النشاط</h3>
              <p className={styles.desc}>{business.hook.trim()}</p>
            </div>
          ) : null}

          {/* Branches — show only if at least one has meaningful data */}
          {branches.length > 0 &&
            branches.some(
              (b) =>
                isNonEmpty(b.name) ||
                isNonEmpty(b.address_text) ||
                isNonEmpty(b.area) ||
                (typeof b.latitude === 'number' && typeof b.longitude === 'number'),
            ) && (
              <div className={styles.block}>
                <h3 className={styles.blockTitle}>الفروع ({branches.length})</h3>
                <BranchList branches={branches} />
              </div>
            )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>معرض الصور</h3>
              <div className={styles.galleryGrid}>
                {gallery.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={styles.galleryItem}
                    onClick={() => setLightbox(g.storage_path)}
                  >
                    <WmImage
                      src={g.storage_path}
                      alt={g.alt_text ?? business.name}
                      fill
                      sizes="200px"
                      className={styles.galleryImg}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Offers Tab ─── */}
      {tab === 'offers' && (
        <div
          className={styles.content}
          role="tabpanel"
          id="business-tabpanel"
          aria-labelledby={activeTabId}
          tabIndex={0}
        >
          {offers.length === 0 ? (
            <div className={styles.empty}>
              <StoreIcon size={40} />
              <p>مفيش عروض متاحة حاليًا</p>
            </div>
          ) : (
            <div className={styles.offersGrid}>
              {offers.map((offer) => {
                const imageSrc = offer.teaser_image_url || offer.image_url
                const endDate = offer.ends_at ? new Date(offer.ends_at) : null
                const hasValidEndDate = endDate !== null && Number.isFinite(endDate.getTime())

                return (
                  <article key={offer.id} className={styles.offerCard}>
                    {imageSrc && (
                      <div className={styles.offerImage}>
                        <WmImage
                          src={imageSrc}
                          alt={offer.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <div className={styles.offerBody}>
                      <h3 className={styles.offerTitle}>{offer.title}</h3>
                      {isNonEmpty(offer.description) && (
                        <p className={styles.offerDesc}>{offer.description.trim()}</p>
                      )}
                      {(offer.price !== null && offer.price > 0 || hasValidEndDate) && (
                        <div className={styles.offerMeta}>
                          {offer.price !== null && offer.price > 0 && (
                            <span className={styles.offerPrice}>
                              {offer.price.toLocaleString('ar-EG')} ج.م
                            </span>
                          )}
                          {hasValidEndDate && (
                            <span className={styles.offerEnds}>
                              ينتهي {endDate.toLocaleDateString('ar-EG')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Menu Tab ─── */}
      {tab === 'menu' && (
        <div
          className={styles.content}
          role="tabpanel"
          id="business-tabpanel"
          aria-labelledby={activeTabId}
          tabIndex={0}
        >
          {menu.length === 0 ? (
            <div className={styles.empty}>
              <ImageIcon size={40} />
              <p>المنيو لسه ما اترفعش</p>
            </div>
          ) : (
            <div className={styles.menuGrid}>
              {menu.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={styles.menuItem}
                  onClick={() => setLightbox(m.storage_path)}
                >
                  <WmImage
                    src={m.storage_path}
                    alt={m.alt_text ?? 'صورة منيو'}
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className={styles.menuImg}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Reviews Tab ─── */}
      {reviewsEnabled && tab === 'reviews' && (
        <div
          className={styles.content}
          role="tabpanel"
          id="business-tabpanel"
          aria-labelledby={activeTabId}
          tabIndex={0}
        >
          <ReviewsList
            businessId={business.id}
            businessType={business.business_type}
            subcategory={business.subcategory}
            slug={business.slug}
            reviews={reviews}
            stats={reviewStats}
            isLoggedIn={isLoggedIn}
            canReview={canReview}
            hasReviewed={hasReviewed}
            isOwner={isOwner}
          />
        </div>
      )}

      {/* ─── Comments Tab ─── */}
      {tab === 'comments' && (
        <div
          className={styles.content}
          role="tabpanel"
          id="business-tabpanel"
          aria-labelledby={activeTabId}
          tabIndex={0}
        >
          <CommentsList
            businessId={business.id}
            slug={business.slug}
            comments={comments}
            currentUserId={currentUserId}
            isLoggedIn={isLoggedIn}
            followingRootIds={followingRootIds}
          />
        </div>
      )}

      {/* ─── Lightbox ─── */}
      {lightbox && (
        <div
          className={styles.lightbox}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="معاينة صورة النشاط"
        >
          <button
            ref={lightboxCloseRef}
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightbox(null)}
            aria-label="إغلاق"
          >
            ✕
          </button>
          <div className={styles.lightboxImg} onClick={(event) => event.stopPropagation()}>
            <WmImage
              src={lightbox}
              alt="صورة"
              fill
              sizes="100vw"
              className={styles.lightboxImage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
