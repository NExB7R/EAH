'use client'

import { useState } from 'react'
import WmImage from './wm-image'
import {
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
  ClockIcon,
  FacebookIcon,
  GlobeIcon,
  StoreIcon,
  ImageIcon,
  MessageCircleIcon,
} from './icons'
import ReviewsList from './reviews-list'
import type { BusinessDetail, Review, ReviewStats } from '@/lib/data/business-detail'
import styles from './business-tabs.module.css'

type Tab = 'info' | 'menu' | 'reviews'

type Props = {
  detail: BusinessDetail
  reviews: Review[]
  reviewStats: ReviewStats
  isLoggedIn: boolean
  hasReviewed: boolean
  isOwner: boolean
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
  isLoggedIn,
  hasReviewed,
  isOwner,
}: Props) {
  const [tab, setTab] = useState<Tab>('info')
  const [lightbox, setLightbox] = useState<string | null>(null)

  const { business, contacts, branches, menu, gallery } = detail

  const phone = contacts.find((c) => c.method_type === 'phone')
  const whatsapp = contacts.find((c) => c.method_type === 'whatsapp')
  const facebook = contacts.find((c) => c.method_type === 'facebook')
  const instagram = contacts.find((c) => c.method_type === 'instagram')
  const website = contacts.find((c) => c.method_type === 'website')

  return (
    <div className={styles.wrap}>
      {/* ─── Tabs Bar ─── */}
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'info'}
          className={`${styles.tab} ${tab === 'info' ? styles.active : ''}`}
          onClick={() => setTab('info')}
        >
          <StoreIcon size={15} />
          <span>معلومات</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'menu'}
          className={`${styles.tab} ${tab === 'menu' ? styles.active : ''}`}
          onClick={() => setTab('menu')}
        >
          <ImageIcon size={15} />
          <span>المنيو</span>
          {menu.length > 0 && <span className={styles.tabCount}>{menu.length}</span>}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'reviews'}
          className={`${styles.tab} ${tab === 'reviews' ? styles.active : ''}`}
          onClick={() => setTab('reviews')}
          id="reviews-section"
        >
          <MessageCircleIcon size={15} />
          <span>التقييمات</span>
          {reviewStats.count > 0 && <span className={styles.tabCount}>{reviewStats.count}</span>}
        </button>
      </div>

      {/* ─── Info Tab ─── */}
      {tab === 'info' && (
        <div className={styles.content}>
          {/* Contacts */}
          {(phone || whatsapp || facebook || instagram || website) && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>التواصل</h3>
              <div className={styles.contactList}>
                {whatsapp && (
                  <a
                    href={`https://wa.me/2${whatsapp.value.replace(/^0/, '').replace(/^20/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.contactItem} ${styles.contactWhatsapp}`}
                  >
                    <WhatsAppIcon size={16} />
                    <span>{whatsapp.value}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone.value}`}
                    className={`${styles.contactItem} ${styles.contactPhone}`}
                  >
                    <PhoneIcon size={16} />
                    <span>{phone.value}</span>
                  </a>
                )}
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
          {business.working_hours && (
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
                  return (
                    <li key={day} className={styles.hoursRow}>
                      <span className={styles.hoursDay}>{DAY_LABEL[day]}</span>
                      <span className={styles.hoursTime}>
                        {h ? `${h.open} — ${h.close}` : 'مغلق'}
                      </span>
                    </li>
                  )
                })}
              </ul>
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

          {/* Description */}
          {business.description && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>عن النشاط</h3>
              <p className={styles.desc}>{business.description}</p>
            </div>
          )}

          {/* Branches */}
          {branches.length > 0 && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>الفروع ({branches.length})</h3>
              <ul className={styles.branchList}>
                {branches.map((b) => (
                  <li key={b.id} className={styles.branchItem}>
                    <StoreIcon size={14} />
                    <div className={styles.branchBody}>
                      <span className={styles.branchName}>
                        {b.name}
                        {b.is_primary && <span className={styles.primaryBadge}>رئيسي</span>}
                      </span>
                      {b.address_text && (
                        <span className={styles.branchAddr}>{b.address_text}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
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

      {/* ─── Menu Tab ─── */}
      {tab === 'menu' && (
        <div className={styles.content}>
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
      {tab === 'reviews' && (
        <div className={styles.content}>
          <ReviewsList
            businessId={business.id}
            slug={business.slug}
            reviews={reviews}
            stats={reviewStats}
            isLoggedIn={isLoggedIn}
            hasReviewed={hasReviewed}
            isOwner={isOwner}
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
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightbox(null)}
            aria-label="إغلاق"
          >
            ✕
          </button>
          <div className={styles.lightboxImg}>
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
