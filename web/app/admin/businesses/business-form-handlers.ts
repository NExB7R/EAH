'use client'

import type { AdminBusiness } from '@/lib/data/admin-business'
import {
  saveBasics as saveBasicsAction,
  saveContacts as saveContactsAction,
  saveLocation as saveLocationAction,
  saveHours as saveHoursAction,
  saveSettings as saveSettingsAction,
  saveBranch as saveBranchAction,
  deleteBranch,
  saveNotice as saveNoticeAction,
  saveOpenOverride as saveOpenOverrideAction,
} from './edit-actions'
import { createBusiness } from './actions'
import { DAYS, type BranchState } from './business-form-config'
import type { FormState } from './business-form-state'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form: Save handlers
// All save* functions + branch CRUD + handleCreate.
// ═══════════════════════════════════════════════════════════

export type SaveHandlers = {
  saveBasics: () => void
  saveContacts: () => void
  saveLocation: () => void
  saveHours: () => void
  saveSettings: () => void
  saveBranch: (idx: number) => void
  addBranch: () => void
  removeBranch: (idx: number) => void
  updateBranch: (idx: number, field: keyof BranchState, value: string | boolean) => void
  saveNotice: () => void
  saveOpenOverride: () => void
  handleCreate: (e: React.FormEvent<HTMLFormElement>) => void
}

export function useSaveHandlers(state: FormState, business: AdminBusiness | null): SaveHandlers {
  const s = state

  const saveBasics = () => {
    if (!business) return
    const fd = new FormData()
    fd.set('name', s.name)
    fd.set('slug', s.slug)
    fd.set('business_type', s.businessType)
    fd.set('area', s.area)
    fd.set('city', s.city)
    fd.set('address_text', s.addressText)
    fd.set('hook', s.hook)
    fd.set('description', s.description)
    s.handleSaveSection('basics', () => saveBasicsAction(business.id, fd))
  }

  const saveContacts = () => {
    if (!business) return
    const fd = new FormData()
    const form = document.getElementById('contacts-form') as HTMLFormElement | null
    if (form) {
      new FormData(form).forEach((v, k) => fd.set(k, String(v)))
    }
    s.handleSaveSection('contacts', () => saveContactsAction(business.id, fd))
  }

  const saveLocation = () => {
    if (!business) return
    const fd = new FormData()
    const form = document.getElementById('location-form') as HTMLFormElement | null
    if (form) {
      new FormData(form).forEach((v, k) => fd.set(k, String(v)))
    }
    s.handleSaveSection('location', () => saveLocationAction(business.id, fd))
  }

  const saveHours = () => {
    if (!business) return
    const fd = new FormData()
    for (const d of DAYS) {
      const h = s.hours[d.key]
      if (h) {
        fd.set(`${d.key}_open`, h.open)
        fd.set(`${d.key}_close`, h.close)
      }
    }
    s.handleSaveSection('hours', () => saveHoursAction(business.id, fd))
  }

  const saveSettings = () => {
    if (!business) return
    const fd = new FormData()
    fd.set('is_published', String(s.isPublished))
    fd.set('is_open', String(s.isOpen))
    fd.set('accepts_whatsapp_orders', String(s.acceptsWhatsapp))
    fd.set('is_featured', String(s.isFeatured))
    fd.set('renew_featured', String(s.renewFeaturedRequested))
    fd.set('is_verified', String(s.isVerified))
    fd.set('featured_until', s.featuredUntil)
    fd.set('is_new_project', String(s.isNewProject))
    fd.set('renew_new_project', String(s.renewNewProjectRequested))
    s.handleSaveSection('settings', () => saveSettingsAction(business.id, fd), () => {
      s.setRenewFeaturedRequested(false)
      s.setRenewNewProjectRequested(false)
    })
  }

  const saveNotice = () => {
    if (!business) return
    const fd = new FormData()
    fd.set('important_notice', s.importantNotice)
    fd.set('notice_severity', s.noticeSeverity)
    if (s.noticeExpiresAt) {
      fd.set('notice_expires_at', new Date(s.noticeExpiresAt).toISOString())
    }
    s.handleSaveSection('notice', () => saveNoticeAction(business.id, fd))
  }

  const saveOpenOverride = () => {
    if (!business) return
    s.handleSaveSection('status', () => saveOpenOverrideAction(business.id, s.openNowOverride))
  }

  const addBranch = () => {
    s.setBranches((previous) => [
      ...previous,
      {
        name: '',
        area: '',
        address_text: '',
        latitude: '',
        longitude: '',
        phone: '',
        whatsapp: '',
        is_primary: previous.length === 0,
        is_active: true,
      },
    ])
  }

  const removeBranch = (idx: number) => {
    const branch = s.branches[idx]
    if (!branch) return
    if (branch.id && business) {
      if (!confirm(`حذف "${branch.name}"؟`)) return
      s.startTransition(async () => {
        const res = await deleteBranch(branch.id!, business.id)
        if (res.ok) {
          s.setBranches((previous) =>
            branch.id
              ? previous.filter((item) => item.id !== branch.id)
              : previous.filter((_, i) => i !== idx),
          )
          s.router.refresh()
        } else {
          s.setError(res.error)
        }
      })
    } else {
      s.setBranches((previous) => previous.filter((_, i) => i !== idx))
    }
  }

  const updateBranch = (idx: number, field: keyof BranchState, value: string | boolean) => {
    s.setBranches((previous) =>
      previous.map((br, i) => (i === idx ? { ...br, [field]: value } : br)),
    )
  }

  const saveBranch = (idx: number) => {
    if (!business) return
    const branch = s.branches[idx]
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
    s.handleSaveSection(
      'branches',
      () => saveBranchAction(business.id, fd, branch.id),
      (result) => {
        if (!result.id) return
        s.setBranches((previous) =>
          previous.map((item, i) => (i === idx ? { ...item, id: result.id } : item)),
        )
      },
    )
  }

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    s.setError(null)
    const fd = new FormData(e.currentTarget)
    s.startTransition(async () => {
      const res = await createBusiness(fd)
      if (!res.ok) {
        s.setError(res.error)
      } else if (res.id) {
        s.router.push(`/admin/businesses/${res.id}?tab=contacts`)
      } else {
        s.router.push('/admin/businesses')
      }
    })
  }

  return {
    saveBasics,
    saveContacts,
    saveLocation,
    saveHours,
    saveSettings,
    saveBranch,
    addBranch,
    removeBranch,
    updateBranch,
    saveNotice,
    saveOpenOverride,
    handleCreate,
  }
}
