'use client'

import { AlertIcon } from '@/components/icons'
import type { AdminBusiness } from '@/lib/data/admin-business'
import { BusinessFormProvider, type BusinessFormCtx } from './business-form-context'
import { useBusinessFormState } from './business-form-hooks'
import { EDIT_ORDER, SECTION_META, type SectionKey } from './business-form-config'
import { Section } from './business-form-shared'
import BasicsSection from './sections/basics-section'
import ImagesSection from './sections/images-section'
import ContactsSection from './sections/contacts-section'
import LocationSection from './sections/location-section'
import HoursSection from './sections/hours-section'
import BranchesSection from './sections/branches-section'
import MenuSection from './sections/menu-section'
import GallerySection from './sections/gallery-section'
import SettingsSection from './sections/settings-section'
import OwnerSection from './sections/owner-section'
import NoticeSection from './sections/notice-section'
import StatusSection from './sections/status-section'
import styles from './business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form: Edit mode wrapper
// Accordion + live preview. Sections live in ./sections/*.
// ═══════════════════════════════════════════════════════════

function renderSection(key: SectionKey): React.ReactNode {
  switch (key) {
    case 'basics':
      return <BasicsSection />
    case 'images':
      return <ImagesSection />
    case 'menu':
      return <MenuSection />
    case 'gallery':
      return <GallerySection />
    case 'contacts':
      return <ContactsSection />
    case 'location':
      return <LocationSection />
    case 'hours':
      return <HoursSection />
    case 'branches':
      return <BranchesSection />
    case 'settings':
      return <SettingsSection />
    case 'notice':
      return <NoticeSection />
    case 'status':
      return <StatusSection />
    case 'owner':
      return <OwnerSection />
  }
}

export default function EditForm({ business }: { business: AdminBusiness }) {
  const state = useBusinessFormState(business)
  const ctx: BusinessFormCtx = { business, ...state }

  return (
    <BusinessFormProvider value={ctx}>
      <div className={styles.sections}>
        {state.error && (
          <div className={styles.errMsg}>
            <AlertIcon size={14} /> {state.error}
          </div>
        )}

        {EDIT_ORDER.map((key) => {
          const meta = SECTION_META[key]
          return (
            <Section
              key={key}
              sectionKey={key}
              title={meta.title}
              Icon={meta.Icon}
              open={state.openSections.has(key)}
              onToggle={() => state.toggleSection(key)}
              saved={state.savedSection === key}
            >
              {renderSection(key)}
            </Section>
          )
        })}
      </div>
    </BusinessFormProvider>
  )
}
