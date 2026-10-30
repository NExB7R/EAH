import {
  normalizePhoneDestination,
  normalizeWhatsAppDestination,
} from './contact-availability-utils'

export type ContactOption = {
  method: 'phone' | 'whatsapp'
  label: string
  isPrimary: boolean
  contactId: string | null
  branchId: string | null
}

export type BranchContactSource = {
  id: string
  name: string | null
  is_primary: boolean
  phone: string | null
  whatsapp: string | null
}

export type GeneralContactSource = {
  id: string
  method_type: string
  value: string
  label: string | null
  is_primary: boolean
}

export function safeContactOptionLabel(value: string | null | undefined, fallback: string): string {
  const label = value?.trim().replace(/\s+/g, ' ')
  if (!label || /(?:\+?\d[\d\s().-]{6,}\d)/.test(label)) return fallback
  return label.slice(0, 60)
}

/**
 * Combines every valid public contact and active-branch destination.
 * Contact availability is independent from whether the activity accepts
 * orders through WhatsApp; that switch describes orders, not contact access.
 * Raw numbers are intentionally not returned in this presentation model.
 */
export function buildContactOptions(
  branches: BranchContactSource[],
  contacts: GeneralContactSource[],
): ContactOption[] {
  const options: ContactOption[] = []
  const seenDestinations = new Set<string>()
  let phoneIndex = 0
  let whatsappIndex = 0

  const addOption = (
    method: 'phone' | 'whatsapp',
    value: string | null,
    label: string,
    isPrimary: boolean,
    source: { contactId?: string; branchId?: string },
  ) => {
    const normalized =
      method === 'whatsapp'
        ? normalizeWhatsAppDestination(value)
        : normalizePhoneDestination(value)
    if (!normalized) return

    const destinationKey = method + ':' + normalized
    if (seenDestinations.has(destinationKey)) return
    seenDestinations.add(destinationKey)

    options.push({
      method,
      label,
      isPrimary,
      contactId: source.contactId ?? null,
      branchId: source.branchId ?? null,
    })
  }

  for (const branch of branches) {
    const branchLabel = safeContactOptionLabel(
      branch.name,
      branch.is_primary ? 'الفرع الرئيسي' : 'فرع النشاط',
    )
    if (branch.phone) {
      addOption('phone', branch.phone, branchLabel + ' — اتصال', branch.is_primary, {
        branchId: branch.id,
      })
      phoneIndex++
    }
    if (branch.whatsapp) {
      addOption('whatsapp', branch.whatsapp, branchLabel + ' — واتساب', branch.is_primary, {
        branchId: branch.id,
      })
      whatsappIndex++
    }
  }

  for (const contact of contacts) {
    if (contact.method_type !== 'phone' && contact.method_type !== 'whatsapp') continue
    const method = contact.method_type
    const index = method === 'phone' ? ++phoneIndex : ++whatsappIndex
    const defaultLabel =
      method === 'phone'
        ? contact.is_primary
          ? 'رقم الاتصال الرئيسي'
          : 'رقم اتصال إضافي ' + index
        : contact.is_primary
          ? 'واتساب الرئيسي'
          : 'رقم واتساب إضافي ' + index

    addOption(
      method,
      contact.value,
      safeContactOptionLabel(contact.label, defaultLabel),
      contact.is_primary,
      { contactId: contact.id },
    )
  }

  return options
}
