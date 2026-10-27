'use client'

import {
  StoreIcon,
  CheckCircleIcon,
  MapPinIcon,
  GiftIcon,
  CrownGoldIcon,
  PhoneIcon,
  ClockIcon,
  ImageIcon,
  AlertIcon,
  FileTextIcon,
  CartIcon,
} from '@/components/icons'
import type { AdminBusiness, BusinessOwnerOption } from '@/lib/data/admin-business'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form: Config, Types, Helpers
// Shared across business-form, create-form, edit-form, sections.
// ═══════════════════════════════════════════════════════════

export const TYPES = [
  { value: 'restaurant', label: 'مطعم', Icon: GiftIcon },
  { value: 'pharmacy', label: 'صيدلية', Icon: CheckCircleIcon },
  { value: 'supermarket', label: 'ماركت', Icon: CartIcon },
  { value: 'delivery_office', label: 'توصيل', Icon: MapPinIcon },
  { value: 'misc', label: 'أخرى', Icon: CrownGoldIcon },
] as const

export const DAYS = [
  { key: 'sat', label: 'السبت' },
  { key: 'sun', label: 'الأحد' },
  { key: 'mon', label: 'الاثنين' },
  { key: 'tue', label: 'الثلاثاء' },
  { key: 'wed', label: 'الأربعاء' },
  { key: 'thu', label: 'الخميس' },
  { key: 'fri', label: 'الجمعة' },
] as const

export const HOURS_PRESETS = [
  { label: '24 ساعة', open: '00:00', close: '23:59' },
  { label: '9ص — 11م', open: '09:00', close: '23:00' },
  { label: '10ص — 12ص', open: '10:00', close: '00:00' },
  { label: '8ص — 10م', open: '08:00', close: '22:00' },
] as const

export type DayKey = (typeof DAYS)[number]['key']
export type DayHours = { open: string; close: string } | null

export type BranchState = {
  id?: string
  name: string
  area: string
  address_text: string
  latitude: string
  longitude: string
  phone: string
  whatsapp: string
  is_primary: boolean
  is_active: boolean
}

export type Props =
  | { mode: 'create'; owners: BusinessOwnerOption[]; business?: never }
  | { mode: 'edit'; business: AdminBusiness; owners?: never }

export type SectionKey =
  | 'basics'
  | 'images'
  | 'contacts'
  | 'location'
  | 'hours'
  | 'branches'
  | 'settings'
  | 'menu'
  | 'gallery'
  | 'offers'
  | 'notice'
  | 'status'

export const SECTION_META: Record<SectionKey, { title: string; Icon: typeof StoreIcon }> = {
  basics: { title: 'الأساسيات', Icon: StoreIcon },
  images: { title: 'الصور', Icon: ImageIcon },
  menu: { title: 'المنيو', Icon: FileTextIcon },
  gallery: { title: 'معرض الصور', Icon: ImageIcon },
  offers: { title: 'العروض', Icon: GiftIcon },
  contacts: { title: 'التواصل', Icon: PhoneIcon },
  location: { title: 'الموقع', Icon: MapPinIcon },
  hours: { title: 'أوقات العمل', Icon: ClockIcon },
  branches: { title: 'الفروع', Icon: MapPinIcon },
  settings: { title: 'الإعدادات والمميزات', Icon: CrownGoldIcon },
  notice: { title: 'ملحوظة هامة', Icon: AlertIcon },
  status: { title: 'حالة الفتح الآن', Icon: ClockIcon },
}

export const EDIT_ORDER: SectionKey[] = [
  'basics',
  'images',
  'menu',
  'gallery',
  'offers',
  'contacts',
  'location',
  'hours',
  'branches',
  'settings',
  'notice',
  'status',
]

export function readFileAsHours(raw: unknown): Record<DayKey, DayHours> {
  const empty: Record<DayKey, DayHours> = {
    sat: null,
    sun: null,
    mon: null,
    tue: null,
    wed: null,
    thu: null,
    fri: null,
  }
  if (!raw || typeof raw !== 'object') return empty
  const obj = raw as Record<string, unknown>
  for (const d of DAYS) {
    const v = obj[d.key]
    if (v && typeof v === 'object') {
      const day = v as { open?: unknown; close?: unknown }
      if (typeof day.open === 'string' && typeof day.close === 'string') {
        empty[d.key] = { open: day.open, close: day.close }
      }
    }
  }
  return empty
}

export function getContact(b: AdminBusiness | null, type: string): string {
  if (!b) return ''
  const c = b.contacts.find((x) => x.method_type === type)
  return c?.value ?? ''
}
