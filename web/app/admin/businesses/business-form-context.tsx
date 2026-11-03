'use client'

import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'
import type { AdminBusiness } from '@/lib/data/admin-business'
import type { BranchState, DayHours, DayKey, SectionKey } from './business-form-config'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form: Context
// Single source of truth for edit-mode state.
// ═══════════════════════════════════════════════════════════

type Setter<T> = Dispatch<SetStateAction<T>>

export type BusinessFormCtx = {
  business: AdminBusiness
  pending: boolean
  error: string | null
  setError: Setter<string | null>
  savedSection: SectionKey | null
  openSections: Set<SectionKey>
  toggleSection: (key: SectionKey) => void

  // Basics
  name: string
  setName: Setter<string>
  slug: string
  setSlug: Setter<string>
  businessType: string
  setBusinessType: Setter<string>
  area: string
  setArea: Setter<string>
  city: string
  setCity: Setter<string>
  addressText: string
  setAddressText: Setter<string>
  hook: string
  setHook: Setter<string>
  description: string
  setDescription: Setter<string>

  // Images
  logoUrl: string | null
  setLogoUrl: Setter<string | null>
  coverUrl: string | null
  setCoverUrl: Setter<string | null>

  // Hours
  hours: Record<DayKey, DayHours>
  setHours: Setter<Record<DayKey, DayHours>>

  // Branches
  branches: BranchState[]
  setBranches: Setter<BranchState[]>
  addBranch: () => void
  removeBranch: (idx: number) => void
  updateBranch: (idx: number, field: keyof BranchState, value: string | boolean) => void

  // Settings
  isPublished: boolean
  setIsPublished: Setter<boolean>
  isOpen: boolean
  setIsOpen: Setter<boolean>
  acceptsWhatsapp: boolean
  setAcceptsWhatsapp: Setter<boolean>
  isFeatured: boolean
  setIsFeatured: Setter<boolean>
  isVerified: boolean
  setIsVerified: Setter<boolean>
  featuredOrder: number
  setFeaturedOrder: Setter<number>
  featuredPin: boolean
  setFeaturedPin: Setter<boolean>
  featuredUntil: string
  setFeaturedUntil: Setter<string>
  isNewProject: boolean
  setIsNewProject: Setter<boolean>
  renewNewProjectRequested: boolean
  setRenewNewProjectRequested: Setter<boolean>
  newUntil: string
  setNewUntil: Setter<string>

  // Save handlers
  saveBasics: () => void
  saveContacts: () => void
  saveLocation: () => void
  saveHours: () => void
  saveSettings: () => void
  saveBranch: (idx: number) => void
  // Notice
  importantNotice: string
  setImportantNotice: Setter<string>
  noticeExpiresAt: string
  setNoticeExpiresAt: Setter<string>
  noticeSeverity: 'info' | 'warning' | 'critical'
  setNoticeSeverity: Setter<'info' | 'warning' | 'critical'>

  // Open-now override
  openNowOverride: 'auto' | 'open' | 'closed'
  setOpenNowOverride: Setter<'auto' | 'open' | 'closed'>

  // New handlers
  saveNotice: () => void
  saveOpenOverride: () => void
}

const BusinessFormContext = createContext<BusinessFormCtx | null>(null)

export function BusinessFormProvider({
  value,
  children,
}: {
  value: BusinessFormCtx
  children: React.ReactNode
}) {
  return <BusinessFormContext.Provider value={value}>{children}</BusinessFormContext.Provider>
}

export function useBusinessForm(): BusinessFormCtx {
  const ctx = useContext(BusinessFormContext)
  if (!ctx) throw new Error('useBusinessForm must be used within BusinessFormProvider')
  return ctx
}
