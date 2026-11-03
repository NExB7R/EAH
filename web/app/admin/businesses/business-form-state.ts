'use client'

import { useState, useTransition, type Dispatch, type SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminBusiness } from '@/lib/data/admin-business'
import {
  readFileAsHours,
  type BranchState,
  type DayHours,
  type DayKey,
  type SectionKey,
} from './business-form-config'

type Setter<T> = Dispatch<SetStateAction<T>>

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form: State + helpers
// All useState lives here. Handlers live in business-form-handlers.ts.
// ═══════════════════════════════════════════════════════════

export type FormActionResult = { ok: boolean; error?: string; id?: string }

export type FormState = {
  pending: boolean
  error: string | null
  setError: Setter<string | null>
  savedSection: SectionKey | null
  openSections: Set<SectionKey>
  toggleSection: (key: SectionKey) => void
  handleSaveSection: (
    key: SectionKey,
    fn: () => Promise<FormActionResult>,
    onSuccess?: (result: FormActionResult) => void,
  ) => void
  startTransition: ReturnType<typeof useTransition>[1]
  router: ReturnType<typeof useRouter>

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

  // Settings
  isPublished: boolean
  setIsPublished: Setter<boolean>
  isOpen: boolean
  setIsOpen: Setter<boolean>
  acceptsWhatsapp: boolean
  setAcceptsWhatsapp: Setter<boolean>
  isFeatured: boolean
  isVerified: boolean
  setIsFeatured: Setter<boolean>
  setIsVerified: Setter<boolean>
  featuredOrder: number
  setFeaturedOrder: Setter<number>
  featuredPin: boolean
  setFeaturedPin: Setter<boolean>
  featuredUntil: string
  setFeaturedUntil: Setter<string>
  isNewProject: boolean
  setIsNewProject: Setter<boolean>
  newUntil: string
  setNewUntil: Setter<string>

  // Hours
  hours: Record<DayKey, DayHours>
  setHours: Setter<Record<DayKey, DayHours>>

  // Branches
  branches: BranchState[]
  setBranches: Setter<BranchState[]>

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
}

export function useFormState(business: AdminBusiness | null): FormState {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<SectionKey | null>(null)
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['basics']))

  const [name, setName] = useState(business?.name ?? '')
  const [slug, setSlug] = useState(business?.slug ?? '')
  const [businessType, setBusinessType] = useState(business?.business_type ?? 'restaurant')
  const [area, setArea] = useState(business?.area ?? '')
  const [city, setCity] = useState(business?.city ?? 'شبين القناطر')
  const [addressText, setAddressText] = useState(business?.address_text ?? '')
  const [hook, setHook] = useState(business?.hook ?? '')
  const [description, setDescription] = useState(business?.description ?? '')

  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(business?.cover_image_url ?? null)

  const [isPublished, setIsPublished] = useState(business?.is_published ?? false)
  const [isOpen, setIsOpen] = useState(business?.is_open ?? true)
  const [acceptsWhatsapp, setAcceptsWhatsapp] = useState(false)
  const now = Date.now()
  const featuredUntilValue = business?.featured_until ?? null
  const newUntilValue = business?.new_until ?? null
  const featuredStillActive =
    !!business?.is_featured &&
    (!featuredUntilValue || new Date(featuredUntilValue).getTime() > now)
  const newProjectStillActive =
    !!business?.is_new_project &&
    !!newUntilValue &&
    new Date(newUntilValue).getTime() > now

  const [isFeatured, setIsFeatured] = useState(featuredStillActive)
  const [isVerified, setIsVerified] = useState(!!business?.is_verified)
  const [featuredOrder, setFeaturedOrder] = useState(0)
  const [featuredPin, setFeaturedPin] = useState(false)
  const toDateInput = (value: string | null) => {
    if (!value) return ''
    const timestamp = new Date(value).getTime()
    return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : ''
  }
  const [featuredUntil, setFeaturedUntil] = useState(toDateInput(featuredUntilValue))
  const [isNewProject, setIsNewProject] = useState(newProjectStillActive)
  const [newUntil, setNewUntil] = useState(toDateInput(newUntilValue))

  const [hours, setHours] = useState<Record<DayKey, DayHours>>(() =>
    readFileAsHours(
      business ? (business as unknown as { working_hours?: unknown }).working_hours : null,
    ),
  )

  const [branches, setBranches] = useState<BranchState[]>(() =>
    (business?.branches ?? []).map((x) => ({
      id: x.id,
      name: x.name,
      area: x.area ?? '',
      address_text: x.address_text ?? '',
      latitude: x.latitude === null ? '' : String(x.latitude),
      longitude: x.longitude === null ? '' : String(x.longitude),
      phone: x.phone ?? '',
      whatsapp: x.whatsapp ?? '',
      is_primary: x.is_primary,
      is_active: x.is_active,
    })),
  )

  const [importantNotice, setImportantNotice] = useState(business?.important_notice ?? '')
  const [noticeExpiresAt, setNoticeExpiresAt] = useState(
    business?.notice_expires_at
      ? new Date(business.notice_expires_at).toISOString().slice(0, 16)
      : '',
  )
  const [noticeSeverity, setNoticeSeverity] = useState<'info' | 'warning' | 'critical'>(
    business?.notice_severity ?? 'info',
  )

  const [openNowOverride, setOpenNowOverride] = useState<'auto' | 'open' | 'closed'>(
    business?.open_now_override === null || business?.open_now_override === undefined
      ? 'auto'
      : business.open_now_override
        ? 'open'
        : 'closed',
  )

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSaveSection = (
    key: SectionKey,
    fn: () => Promise<FormActionResult>,
    onSuccess?: (result: FormActionResult) => void,
  ) => {
    if (!business) return
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        onSuccess?.(res)
        setSavedSection(key)
        setTimeout(() => setSavedSection(null), 2000)
        router.refresh()
      } else {
        setError(res.error ?? 'فشل الحفظ')
      }
    })
  }

  return {
    pending,
    error,
    setError,
    savedSection,
    openSections,
    toggleSection,
    handleSaveSection,
    startTransition,
    router,
    name,
    setName,
    slug,
    setSlug,
    businessType,
    setBusinessType,
    area,
    setArea,
    city,
    setCity,
    addressText,
    setAddressText,
    hook,
    setHook,
    description,
    setDescription,
    logoUrl,
    setLogoUrl,
    coverUrl,
    setCoverUrl,
    isPublished,
    setIsPublished,
    isOpen,
    setIsOpen,
    acceptsWhatsapp,
    setAcceptsWhatsapp,
    isFeatured,
    isVerified,
    setIsVerified,
    setIsFeatured,
    featuredOrder,
    setFeaturedOrder,
    featuredPin,
    setFeaturedPin,
    featuredUntil,
    setFeaturedUntil,
    isNewProject,
    setIsNewProject,
    newUntil,
    setNewUntil,
    hours,
    setHours,
    branches,
    setBranches,
    importantNotice,
    setImportantNotice,
    noticeExpiresAt,
    setNoticeExpiresAt,
    noticeSeverity,
    setNoticeSeverity,
    openNowOverride,
    setOpenNowOverride,
  }
}
