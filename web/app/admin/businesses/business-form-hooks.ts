import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminBusiness } from '@/lib/data/admin-business'
import {
  saveBasics as saveBasicsAction,
  saveContacts as saveContactsAction,
  saveLocation as saveLocationAction,
  saveHours as saveHoursAction,
  saveSettings as saveSettingsAction,
  saveBranch as saveBranchAction,
  deleteBranch,
  saveOwner as saveOwnerAction,
  saveNotice as saveNoticeAction,
  saveOpenOverride as saveOpenOverrideAction,
} from './edit-actions'
import { createBusiness } from './actions'
import {
  DAYS,
  readFileAsHours,
  type BranchState,
  type DayHours,
  type DayKey,
  type SectionKey,
} from './business-form-config'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form: State + Handlers
// Single hook that owns all state and section-level save handlers.
// ═══════════════════════════════════════════════════════════

export function useBusinessFormState(business: AdminBusiness | null) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<SectionKey | null>(null)
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['basics']))

  // Basics
  const [name, setName] = useState(business?.name ?? '')
  const [slug, setSlug] = useState(business?.slug ?? '')
  const [businessType, setBusinessType] = useState(business?.business_type ?? 'restaurant')
  const [area, setArea] = useState(business?.area ?? '')
  const [city, setCity] = useState(business?.city ?? 'شبين القناطر')
  const [addressText, setAddressText] = useState(business?.address_text ?? '')
  const [hook, setHook] = useState(business?.hook ?? '')
  const [description, setDescription] = useState(business?.description ?? '')

  // Images
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(business?.cover_image_url ?? null)

  // Settings
  const [isPublished, setIsPublished] = useState(business?.is_published ?? false)
  const [isOpen, setIsOpen] = useState(business?.is_open ?? true)
  const [acceptsWhatsapp, setAcceptsWhatsapp] = useState(false)
  const [isFeatured, setIsFeatured] = useState(business?.is_featured ?? false)
  const [featuredOrder, setFeaturedOrder] = useState(0)
  const [featuredPin, setFeaturedPin] = useState(false)
  const [featuredUntil, setFeaturedUntil] = useState('')
  const [isNewProject, setIsNewProject] = useState(false)
  const [newUntil, setNewUntil] = useState('')

  // Hours
  const [hours, setHours] = useState<Record<DayKey, DayHours>>(() =>
    readFileAsHours(
      business ? (business as unknown as { working_hours?: unknown }).working_hours : null,
    ),
  )

  // Branches
  const [branches, setBranches] = useState<BranchState[]>(() =>
    (business?.branches ?? []).map((x) => ({
      id: x.id,
      name: x.name,
      area: x.area ?? '',
      address_text: x.address_text ?? '',
      latitude: '',
      longitude: '',
      phone: '',
      whatsapp: '',
      is_primary: false,
      is_active: true,
    })),
  )

  // Owner
  const [ownerId, setOwnerId] = useState(business?.owner_profile_id ?? '')

  // Notice
  const [importantNotice, setImportantNotice] = useState(business?.important_notice ?? '')
  const [noticeExpiresAt, setNoticeExpiresAt] = useState(
    business?.notice_expires_at
      ? new Date(business.notice_expires_at).toISOString().slice(0, 16)
      : '',
  )
  const [noticeSeverity, setNoticeSeverity] = useState<'info' | 'warning' | 'critical'>(
    business?.notice_severity ?? 'info',
  )

  // Open-now override
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

  const flashSaved = (key: SectionKey) => {
    setSavedSection(key)
    setTimeout(() => setSavedSection(null), 2000)
  }

  const handleSaveSection = (
    key: SectionKey,
    fn: () => Promise<{ ok: boolean; error?: string }>,
  ) => {
    if (!business) return
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        flashSaved(key)
        router.refresh()
      } else {
        setError(res.error ?? 'فشل الحفظ')
      }
    })
  }

  const saveBasics = () => {
    if (!business) return
    const fd = new FormData()
    fd.set('name', name)
    fd.set('slug', slug)
    fd.set('business_type', businessType)
    fd.set('area', area)
    fd.set('city', city)
    fd.set('address_text', addressText)
    fd.set('hook', hook)
    fd.set('description', description)
    handleSaveSection('basics', () => saveBasicsAction(business.id, fd))
  }

  const saveContacts = () => {
    if (!business) return
    const fd = new FormData()
    const form = document.getElementById('contacts-form') as HTMLFormElement | null
    if (form) {
      new FormData(form).forEach((v, k) => fd.set(k, String(v)))
    }
    handleSaveSection('contacts', () => saveContactsAction(business.id, fd))
  }

  const saveLocation = () => {
    if (!business) return
    const fd = new FormData()
    const form = document.getElementById('location-form') as HTMLFormElement | null
    if (form) {
      new FormData(form).forEach((v, k) => fd.set(k, String(v)))
    }
    handleSaveSection('location', () => saveLocationAction(business.id, fd))
  }

  const saveHours = () => {
    if (!business) return
    const fd = new FormData()
    for (const d of DAYS) {
      const h = hours[d.key]
      if (h) {
        fd.set(`${d.key}_open`, h.open)
        fd.set(`${d.key}_close`, h.close)
      }
    }
    handleSaveSection('hours', () => saveHoursAction(business.id, fd))
  }

  const saveSettings = () => {
    if (!business) return
    const fd = new FormData()
    fd.set('is_published', String(isPublished))
    fd.set('is_open', String(isOpen))
    fd.set('accepts_whatsapp_orders', String(acceptsWhatsapp))
    fd.set('is_featured', String(isFeatured))
    fd.set('featured_order', String(featuredOrder))
    fd.set('featured_pin', String(featuredPin))
    fd.set('featured_until', featuredUntil)
    fd.set('is_new_project', String(isNewProject))
    fd.set('new_until', newUntil)
    handleSaveSection('settings', () => saveSettingsAction(business.id, fd))
  }

  const saveOwner = () => {
    if (!business) return
    handleSaveSection('owner', () => saveOwnerAction(business.id, ownerId))
  }

  const addBranch = () => {
    setBranches((prev) => [
      ...prev,
      {
        name: '',
        area: '',
        address_text: '',
        latitude: '',
        longitude: '',
        phone: '',
        whatsapp: '',
        is_primary: prev.length === 0,
        is_active: true,
      },
    ])
  }

  const removeBranch = (idx: number) => {
    const branch = branches[idx]
    if (!branch) return
    if (branch.id && business) {
      if (!confirm(`حذف "${branch.name}"؟`)) return
      startTransition(async () => {
        const res = await deleteBranch(branch.id!, business.id)
        if (res.ok) {
          setBranches((prev) => prev.filter((_, i) => i !== idx))
          router.refresh()
        } else {
          setError(res.error)
        }
      })
    } else {
      setBranches((prev) => prev.filter((_, i) => i !== idx))
    }
  }

  const updateBranch = (idx: number, field: keyof BranchState, value: string | boolean) => {
    setBranches((prev) => prev.map((br, i) => (i === idx ? { ...br, [field]: value } : br)))
  }

  const saveBranch = (idx: number) => {
    if (!business) return
    const branch = branches[idx]
    if (!branch) return
    const fd = new FormData()
    fd.set('name', branch.name)
    fd.set('area', branch.area)
    fd.set('address_text', branch.address_text)
    fd.set('latitude', branch.latitude)
    fd.set('longitude', branch.longitude)
    fd.set('phone', branch.phone)
    fd.set('whatsapp', branch.whatsapp)
    fd.set('is_primary', String(branch.is_primary))
    fd.set('is_active', String(branch.is_active))
    handleSaveSection('branches', () => saveBranchAction(business.id, fd, branch.id))
  }

  const saveNotice = () => {
    if (!business) return
    const fd = new FormData()
    fd.set('important_notice', importantNotice)
    fd.set('notice_severity', noticeSeverity)
    if (noticeExpiresAt) {
      fd.set('notice_expires_at', new Date(noticeExpiresAt).toISOString())
    }
    handleSaveSection('notice', () => saveNoticeAction(business.id, fd))
  }

  const saveOpenOverride = () => {
    if (!business) return
    handleSaveSection('status', () => saveOpenOverrideAction(business.id, openNowOverride))
  }

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createBusiness(fd)
      if (!res.ok) {
        setError(res.error)
      } else if (res.id) {
        router.push(`/admin/businesses/${res.id}`)
      } else {
        router.push('/admin/businesses')
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
    hours,
    setHours,
    branches,
    setBranches,
    addBranch,
    removeBranch,
    updateBranch,
    isPublished,
    setIsPublished,
    isOpen,
    setIsOpen,
    acceptsWhatsapp,
    setAcceptsWhatsapp,
    isFeatured,
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
    ownerId,
    setOwnerId,
    saveBasics,
    saveContacts,
    saveLocation,
    saveHours,
    saveSettings,
    saveOwner,
    saveBranch,
    handleCreate,
    importantNotice,
    setImportantNotice,
    noticeExpiresAt,
    setNoticeExpiresAt,
    noticeSeverity,
    setNoticeSeverity,
    openNowOverride,
    setOpenNowOverride,
    saveNotice,
    saveOpenOverride,
  }
}
