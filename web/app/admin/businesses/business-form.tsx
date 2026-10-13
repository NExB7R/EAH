'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  StoreIcon,
  AlertIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  GiftIcon,
  CrownGoldIcon,
  UserIcon,
  ImageIcon,
  PlusIcon,
  CloseIcon,
} from '@/components/icons'
import type { AdminBusiness, BusinessOwnerOption } from '@/lib/data/admin-business'
import {
  saveBasics,
  saveContacts,
  saveLocation,
  saveHours,
  saveSettings,
  saveBranch,
  deleteBranch,
  saveOwner,
} from './edit-actions'
import { createBusiness } from './actions'
import ImageSlot from './image-slot'
import BusinessPreview from './business-preview'
import styles from './business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form (Full Control)
// 8 sections — كل قسم عنده حفظ مستقل
// ═══════════════════════════════════════════════════════════

const TYPES = [
  { value: 'restaurant', label: 'مطعم', Icon: GiftIcon },
  { value: 'pharmacy', label: 'صيدلية', Icon: CheckCircleIcon },
  { value: 'supermarket', label: 'ماركت', Icon: StoreIcon },
  { value: 'delivery_office', label: 'توصيل', Icon: MapPinIcon },
  { value: 'misc', label: 'أخرى', Icon: CrownGoldIcon },
] as const

const DAYS = [
  { key: 'sat', label: 'السبت' },
  { key: 'sun', label: 'الأحد' },
  { key: 'mon', label: 'الاثنين' },
  { key: 'tue', label: 'الثلاثاء' },
  { key: 'wed', label: 'الأربعاء' },
  { key: 'thu', label: 'الخميس' },
  { key: 'fri', label: 'الجمعة' },
] as const

type DayKey = (typeof DAYS)[number]['key']

const HOURS_PRESETS = [
  { label: '24 ساعة', open: '00:00', close: '23:59' },
  { label: '9ص — 11م', open: '09:00', close: '23:00' },
  { label: '10ص — 12ص', open: '10:00', close: '00:00' },
  { label: '8ص — 10م', open: '08:00', close: '22:00' },
]

type DayHours = { open: string; close: string } | null

type BranchState = {
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

type Props =
  | { mode: 'create'; owners: BusinessOwnerOption[]; business?: never }
  | { mode: 'edit'; business: AdminBusiness; owners?: never }

type SectionKey =
  'basics' | 'images' | 'contacts' | 'location' | 'hours' | 'branches' | 'settings' | 'owner'

const SECTION_META: Record<SectionKey, { title: string; Icon: typeof StoreIcon }> = {
  basics: { title: 'الأساسيات', Icon: StoreIcon },
  images: { title: 'الصور', Icon: ImageIcon },
  contacts: { title: 'التواصل', Icon: PhoneIcon },
  location: { title: 'الموقع', Icon: MapPinIcon },
  hours: { title: 'أوقات العمل', Icon: ClockIcon },
  branches: { title: 'الفروع', Icon: MapPinIcon },
  settings: { title: 'الإعدادات والمميزات', Icon: CrownGoldIcon },
  owner: { title: 'صاحب النشاط', Icon: UserIcon },
}

const EDIT_ORDER: SectionKey[] = [
  'basics',
  'images',
  'contacts',
  'location',
  'hours',
  'branches',
  'settings',
  'owner',
]

function readFileAsHours(raw: unknown): Record<DayKey, DayHours> {
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

function getContact(b: AdminBusiness | null, type: string): string {
  if (!b) return ''
  const c = b.contacts.find((x) => x.method_type === type)
  return c?.value ?? ''
}

export default function BusinessForm(props: Props) {
  const router = useRouter()
  const isCreate = props.mode === 'create'
  const b = props.mode === 'edit' ? props.business : null

  const [pending, startTransition] = useTransition()
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(
    new Set(isCreate ? ['basics'] : ['basics']),
  )
  const [error, setError] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<SectionKey | null>(null)

  // ─── Basics state ───
  const [name, setName] = useState(b?.name ?? '')
  const [slug, setSlug] = useState(b?.slug ?? '')
  const [businessType, setBusinessType] = useState(b?.business_type ?? 'restaurant')
  const [area, setArea] = useState(b?.area ?? '')
  const [city, setCity] = useState(b?.city ?? 'شبين القناطر')
  const [addressText, setAddressText] = useState(b?.address_text ?? '')
  const [hook, setHook] = useState(b?.hook ?? '')
  const [description, setDescription] = useState(b?.description ?? '')

  // ─── Images state (live preview) ───
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(b?.cover_image_url ?? null)

  // ─── Settings state ───
  const [isPublished, setIsPublished] = useState(b?.is_published ?? false)
  const [isOpen, setIsOpen] = useState(b?.is_open ?? true)
  const [acceptsWhatsapp, setAcceptsWhatsapp] = useState(false)
  const [isFeatured, setIsFeatured] = useState(b?.is_featured ?? false)
  const [featuredOrder, setFeaturedOrder] = useState(0)
  const [featuredPin, setFeaturedPin] = useState(false)
  const [featuredUntil, setFeaturedUntil] = useState('')
  const [isNewProject, setIsNewProject] = useState(false)
  const [newUntil, setNewUntil] = useState('')

  // ─── Hours state ───
  const [hours, setHours] = useState<Record<DayKey, DayHours>>(() =>
    readFileAsHours(b ? (b as unknown as { working_hours?: unknown }).working_hours : null),
  )

  // ─── Branches state ───
  const [branches, setBranches] = useState<BranchState[]>(() =>
    (b?.branches ?? []).map((x) => ({
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

  // ─── Owner state ───
  const [ownerId, setOwnerId] = useState(b?.owner_profile_id ?? '')

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
    if (!b) return
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

  const saveBasicsHandler = () => {
    if (!b) return
    const fd = new FormData()
    fd.set('name', name)
    fd.set('slug', slug)
    fd.set('business_type', businessType)
    fd.set('area', area)
    fd.set('city', city)
    fd.set('address_text', addressText)
    fd.set('hook', hook)
    fd.set('description', description)
    handleSaveSection('basics', () => saveBasics(b.id, fd))
  }

  const saveContactsHandler = () => {
    if (!b) return
    const fd = new FormData()
    const form = document.getElementById('contacts-form') as HTMLFormElement | null
    if (form) {
      new FormData(form).forEach((v, k) => fd.set(k, String(v)))
    }
    handleSaveSection('contacts', () => saveContacts(b.id, fd))
  }

  const saveLocationHandler = () => {
    if (!b) return
    const fd = new FormData()
    const form = document.getElementById('location-form') as HTMLFormElement | null
    if (form) {
      new FormData(form).forEach((v, k) => fd.set(k, String(v)))
    }
    handleSaveSection('location', () => saveLocation(b.id, fd))
  }

  const saveHoursHandler = () => {
    if (!b) return
    const fd = new FormData()
    for (const d of DAYS) {
      const h = hours[d.key]
      if (h) {
        fd.set(`${d.key}_open`, h.open)
        fd.set(`${d.key}_close`, h.close)
      }
    }
    handleSaveSection('hours', () => saveHours(b.id, fd))
  }

  const saveSettingsHandler = () => {
    if (!b) return
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
    handleSaveSection('settings', () => saveSettings(b.id, fd))
  }

  const saveOwnerHandler = () => {
    if (!b) return
    handleSaveSection('owner', () => saveOwner(b.id, ownerId))
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
    if (branch.id && b) {
      if (!confirm(`حذف "${branch.name}"؟`)) return
      startTransition(async () => {
        const res = await deleteBranch(branch.id!, b.id)
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

  const saveBranchHandler = (idx: number) => {
    if (!b) return
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
    handleSaveSection('branches', () => saveBranch(b.id, fd, branch.id))
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

  // ═══════════════════════════════════════════════════════════
  // CREATE MODE — Form بسيط (لإنشاء نشاط جديد)
  // ═══════════════════════════════════════════════════════════
  if (isCreate) {
    return (
      <form onSubmit={handleCreate} className={styles.sections}>
        {error && (
          <div className={styles.errMsg}>
            <AlertIcon size={14} /> {error}
          </div>
        )}

        <Section sectionKey="basics" open onToggle={() => {}}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              الاسم
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={80}
              className={styles.input}
              dir="rtl"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="slug">
              Slug (English)
            </label>
            <input
              id="slug"
              name="slug"
              required
              minLength={2}
              maxLength={80}
              pattern="[a-z0-9-]+"
              className={styles.input}
              dir="ltr"
            />
            <span className={styles.hint}>حروف صغيرة وأرقام وشرطات فقط</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>النوع</span>
            <div className={styles.typeGrid}>
              {TYPES.map((t) => (
                <label key={t.value} className={styles.typeCard}>
                  <input
                    type="radio"
                    name="business_type"
                    value={t.value}
                    defaultChecked={t.value === 'restaurant'}
                    className={styles.srOnly}
                  />
                  <t.Icon size={18} />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="area">
                المنطقة
              </label>
              <input id="area" name="area" maxLength={60} className={styles.input} dir="rtl" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="city">
                المدينة
              </label>
              <input
                id="city"
                name="city"
                maxLength={60}
                defaultValue="شبين القناطر"
                className={styles.input}
                dir="rtl"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="address_text">
              العنوان
            </label>
            <input
              id="address_text"
              name="address_text"
              maxLength={200}
              className={styles.input}
              dir="rtl"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="hook">
              Hook (سطر قصير)
            </label>
            <input id="hook" name="hook" maxLength={120} className={styles.input} dir="rtl" />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">
              الوصف
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={1000}
              className={styles.textarea}
              dir="rtl"
            />
          </div>
        </Section>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="owner_profile_id">
            صاحب النشاط
          </label>
          <select
            id="owner_profile_id"
            name="owner_profile_id"
            required
            className={styles.select}
            defaultValue=""
          >
            <option value="" disabled>
              اختر...
            </option>
            {props.owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.display_name} {o.phone ? `— ${o.phone}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.checkRow}>
          <input id="is_published" name="is_published" type="checkbox" />
          <label htmlFor="is_published">نشر مباشر</label>
        </div>

        <div className={styles.submitBar}>
          <button type="submit" disabled={pending} className={styles.submitBtn}>
            {pending ? 'جاري الإنشاء...' : 'إنشاء النشاط'}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>
            إلغاء
          </button>
        </div>
      </form>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // EDIT MODE — Accordion sections + live preview
  // ═══════════════════════════════════════════════════════════
  if (!b) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.sections}>
        {error && (
          <div className={styles.errMsg}>
            <AlertIcon size={14} /> {error}
          </div>
        )}

        {EDIT_ORDER.map((key) => {
          const meta = SECTION_META[key]
          const isOpen = openSections.has(key)
          return (
            <Section
              key={key}
              sectionKey={key}
              title={meta.title}
              Icon={meta.Icon}
              open={isOpen}
              onToggle={() => toggleSection(key)}
              saved={savedSection === key}
            >
              {key === 'basics' && (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>الاسم</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={styles.input}
                      dir="rtl"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Slug</label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className={styles.input}
                      dir="ltr"
                    />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>النوع</span>
                    <div className={styles.typeGrid}>
                      {TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          className={`${styles.typeCard} ${businessType === t.value ? styles.typeCardActive : ''}`}
                          onClick={() => setBusinessType(t.value)}
                        >
                          <t.Icon size={18} />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>المنطقة</label>
                      <input
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className={styles.input}
                        dir="rtl"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>المدينة</label>
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={styles.input}
                        dir="rtl"
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>العنوان</label>
                    <input
                      value={addressText}
                      onChange={(e) => setAddressText(e.target.value)}
                      className={styles.input}
                      dir="rtl"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Hook</label>
                    <input
                      value={hook}
                      onChange={(e) => setHook(e.target.value)}
                      maxLength={120}
                      className={styles.input}
                      dir="rtl"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>الوصف</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className={styles.textarea}
                      dir="rtl"
                    />
                  </div>
                  <SaveBar
                    onClick={saveBasicsHandler}
                    pending={pending}
                    saved={savedSection === 'basics'}
                  />
                </>
              )}

              {key === 'images' && (
                <>
                  <ImageSlot
                    businessId={b.id}
                    category="logo"
                    initialUrl={logoUrl}
                    label="اللوجو"
                    aspect="square"
                    onChange={(u) => setLogoUrl(u)}
                  />
                  <ImageSlot
                    businessId={b.id}
                    category="cover"
                    initialUrl={coverUrl}
                    label="الغلاف"
                    onChange={(u) => setCoverUrl(u)}
                  />
                </>
              )}

              {key === 'contacts' && (
                <form id="contacts-form" className={styles.sections}>
                  <div className={styles.field}>
                    <label className={styles.label}>رقم الهاتف</label>
                    <input
                      name="phone"
                      defaultValue={getContact(b, 'phone')}
                      className={styles.input}
                      dir="ltr"
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>واتساب</label>
                    <input
                      name="whatsapp"
                      defaultValue={getContact(b, 'whatsapp')}
                      className={styles.input}
                      dir="ltr"
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>فيسبوك</label>
                    <input
                      name="facebook"
                      defaultValue={getContact(b, 'facebook')}
                      className={styles.input}
                      dir="ltr"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>إنستجرام</label>
                    <input
                      name="instagram"
                      defaultValue={getContact(b, 'instagram')}
                      className={styles.input}
                      dir="ltr"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>الموقع الإلكتروني</label>
                    <input
                      name="website"
                      defaultValue={getContact(b, 'website')}
                      className={styles.input}
                      dir="ltr"
                    />
                  </div>
                  <SaveBar
                    onClick={saveContactsHandler}
                    pending={pending}
                    saved={savedSection === 'contacts'}
                  />
                </form>
              )}

              {key === 'location' && (
                <form id="location-form" className={styles.sections}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Latitude</label>
                      <input
                        name="latitude"
                        className={styles.input}
                        dir="ltr"
                        placeholder="30.123456"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Longitude</label>
                      <input
                        name="longitude"
                        className={styles.input}
                        dir="ltr"
                        placeholder="31.123456"
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>العنوان التفصيلي</label>
                    <input
                      name="address_text"
                      defaultValue={addressText}
                      className={styles.input}
                      dir="rtl"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Google Maps URL</label>
                    <input
                      name="map_url"
                      defaultValue={b.map_url ?? ''}
                      className={styles.input}
                      dir="ltr"
                    />
                  </div>
                  <SaveBar
                    onClick={saveLocationHandler}
                    pending={pending}
                    saved={savedSection === 'location'}
                  />
                </form>
              )}

              {key === 'hours' && (
                <>
                  <div className={styles.presets}>
                    {HOURS_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        className={styles.presetBtn}
                        onClick={() => {
                          const next: Record<DayKey, DayHours> = { ...hours }
                          for (const d of DAYS) next[d.key] = { open: p.open, close: p.close }
                          setHours(next)
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.hoursList}>
                    {DAYS.map((d) => {
                      const h = hours[d.key]
                      return (
                        <div key={d.key} className={styles.hoursRow}>
                          <span className={styles.hoursDay}>{d.label}</span>
                          {h ? (
                            <>
                              <input
                                type="time"
                                value={h.open}
                                onChange={(e) =>
                                  setHours((prev) => ({
                                    ...prev,
                                    [d.key]: { open: e.target.value, close: h.close },
                                  }))
                                }
                                className={styles.hoursInput}
                              />
                              <input
                                type="time"
                                value={h.close}
                                onChange={(e) =>
                                  setHours((prev) => ({
                                    ...prev,
                                    [d.key]: { open: h.open, close: e.target.value },
                                  }))
                                }
                                className={styles.hoursInput}
                              />
                              <button
                                type="button"
                                className={styles.hoursToggle}
                                onClick={() => setHours((prev) => ({ ...prev, [d.key]: null }))}
                                aria-label="إغلاق اليوم"
                              >
                                <CloseIcon size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className={styles.hoursOff}>مغلق</span>
                              <button
                                type="button"
                                className={styles.presetBtn}
                                onClick={() =>
                                  setHours((prev) => ({
                                    ...prev,
                                    [d.key]: { open: '09:00', close: '23:00' },
                                  }))
                                }
                              >
                                تفعيل
                              </button>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <SaveBar
                    onClick={saveHoursHandler}
                    pending={pending}
                    saved={savedSection === 'hours'}
                  />
                </>
              )}

              {key === 'branches' && (
                <>
                  {branches.length === 0 && (
                    <p className={styles.hint}>مفيش فروع — الفرع الأساسي في قسم الموقع</p>
                  )}
                  <div className={styles.branchesList}>
                    {branches.map((br, idx) => (
                      <div key={idx} className={styles.branchCard}>
                        <div className={styles.branchHead}>
                          <span className={styles.branchName}>{br.name || `فرع ${idx + 1}`}</span>
                          <div className={styles.branchActions}>
                            <button
                              type="button"
                              className={`${styles.branchIconBtn} ${styles.branchDelete}`}
                              onClick={() => removeBranch(idx)}
                              aria-label="حذف"
                            >
                              <CloseIcon size={14} />
                            </button>
                          </div>
                        </div>
                        <div className={styles.fieldRow}>
                          <div className={styles.field}>
                            <label className={styles.label}>اسم الفرع</label>
                            <input
                              value={br.name}
                              onChange={(e) => updateBranch(idx, 'name', e.target.value)}
                              className={styles.input}
                              dir="rtl"
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.label}>المنطقة</label>
                            <input
                              value={br.area}
                              onChange={(e) => updateBranch(idx, 'area', e.target.value)}
                              className={styles.input}
                              dir="rtl"
                            />
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>العنوان</label>
                          <input
                            value={br.address_text}
                            onChange={(e) => updateBranch(idx, 'address_text', e.target.value)}
                            className={styles.input}
                            dir="rtl"
                          />
                        </div>
                        <div className={styles.fieldRow}>
                          <div className={styles.field}>
                            <label className={styles.label}>هاتف</label>
                            <input
                              value={br.phone}
                              onChange={(e) => updateBranch(idx, 'phone', e.target.value)}
                              className={styles.input}
                              dir="ltr"
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.label}>واتساب</label>
                            <input
                              value={br.whatsapp}
                              onChange={(e) => updateBranch(idx, 'whatsapp', e.target.value)}
                              className={styles.input}
                              dir="ltr"
                            />
                          </div>
                        </div>
                        <div className={styles.checkRow}>
                          <input
                            type="checkbox"
                            id={`br-primary-${idx}`}
                            checked={br.is_primary}
                            onChange={(e) => updateBranch(idx, 'is_primary', e.target.checked)}
                          />
                          <label htmlFor={`br-primary-${idx}`}>الفرع الرئيسي</label>
                        </div>
                        <SaveBar
                          onClick={() => saveBranchHandler(idx)}
                          pending={pending}
                          saved={savedSection === 'branches' && false}
                          label="حفظ الفرع"
                        />
                      </div>
                    ))}
                  </div>
                  <button type="button" className={styles.addBtn} onClick={addBranch}>
                    <PlusIcon size={14} /> إضافة فرع
                  </button>
                </>
              )}

              {key === 'settings' && (
                <>
                  <div className={styles.checkRow}>
                    <input
                      id="is_published"
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    <label htmlFor="is_published">منشور على المنصة</label>
                  </div>
                  <div className={styles.checkRow}>
                    <input
                      id="is_open"
                      type="checkbox"
                      checked={isOpen}
                      onChange={(e) => setIsOpen(e.target.checked)}
                    />
                    <label htmlFor="is_open">مفتوح حالياً</label>
                  </div>
                  <div className={styles.checkRow}>
                    <input
                      id="accepts_whatsapp_orders"
                      type="checkbox"
                      checked={acceptsWhatsapp}
                      onChange={(e) => setAcceptsWhatsapp(e.target.checked)}
                    />
                    <label htmlFor="accepts_whatsapp_orders">يقبل طلبات واتساب</label>
                  </div>

                  <div className={styles.checkRow}>
                    <input
                      id="is_featured"
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    <label htmlFor="is_featured">مميز (Featured)</label>
                  </div>

                  {isFeatured && (
                    <>
                      <div className={styles.field}>
                        <label className={styles.label}>ترتيب المميز (0-999)</label>
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={featuredOrder}
                          onChange={(e) => setFeaturedOrder(parseInt(e.target.value) || 0)}
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.checkRow}>
                        <input
                          id="featured_pin"
                          type="checkbox"
                          checked={featuredPin}
                          onChange={(e) => setFeaturedPin(e.target.checked)}
                        />
                        <label htmlFor="featured_pin">مثبّت في المقدمة</label>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>ينتهي التمييز في</label>
                        <input
                          type="date"
                          value={featuredUntil}
                          onChange={(e) => setFeaturedUntil(e.target.value)}
                          className={styles.input}
                        />
                      </div>
                    </>
                  )}

                  <div className={styles.checkRow}>
                    <input
                      id="is_new_project"
                      type="checkbox"
                      checked={isNewProject}
                      onChange={(e) => setIsNewProject(e.target.checked)}
                    />
                    <label htmlFor="is_new_project">بدايات (مشروع جديد)</label>
                  </div>

                  {isNewProject && (
                    <div className={styles.field}>
                      <label className={styles.label}>ينتهي في</label>
                      <input
                        type="date"
                        value={newUntil}
                        onChange={(e) => setNewUntil(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  )}

                  <SaveBar
                    onClick={saveSettingsHandler}
                    pending={pending}
                    saved={savedSection === 'settings'}
                  />
                </>
              )}

              {key === 'owner' && (
                <>
                  {b.owner && (
                    <div className={styles.field}>
                      <span className={styles.label}>المالك الحالي</span>
                      <span className={styles.hint}>
                        {b.owner.display_name} {b.owner.phone ? `— ${b.owner.phone}` : ''}
                      </span>
                    </div>
                  )}
                  <div className={styles.field}>
                    <label className={styles.label}>تغيير المالك</label>
                    <input
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                      className={styles.input}
                      dir="ltr"
                      placeholder="User ID"
                    />
                    <span className={styles.hint}>
                      الصق معرّف المستخدم — لازم يكون في user_roles
                    </span>
                  </div>
                  <SaveBar
                    onClick={saveOwnerHandler}
                    pending={pending}
                    saved={savedSection === 'owner'}
                  />
                </>
              )}
            </Section>
          )
        })}
      </div>

      <BusinessPreview
        name={name}
        type={businessType}
        area={area || null}
        hook={hook || null}
        logoUrl={logoUrl}
        coverUrl={coverUrl}
        isFeatured={isFeatured}
        isNew={isNewProject}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════

function Section({
  sectionKey,
  title,
  Icon,
  open,
  onToggle,
  saved,
  children,
}: {
  sectionKey: SectionKey
  title?: string
  Icon?: React.ComponentType<{ size?: number }>
  open: boolean
  onToggle: () => void
  saved?: boolean
  children: React.ReactNode
}) {
  const meta = SECTION_META[sectionKey]
  const displayTitle = title ?? meta.title
  const DisplayIcon = Icon ?? meta.Icon

  return (
    <section className={styles.section} data-open={open}>
      <button type="button" className={styles.sectionHead} onClick={onToggle} aria-expanded={open}>
        <span className={styles.sectionIcon}>
          <DisplayIcon size={16} />
        </span>
        <span className={styles.sectionTitle}>{displayTitle}</span>
        {saved && (
          <span className={styles.saved}>
            <CheckCircleIcon size={12} /> تم
          </span>
        )}
        <ChevronLeftIcon size={14} className={styles.sectionChev} />
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </section>
  )
}

function SaveBar({
  onClick,
  pending,
  saved,
  label,
}: {
  onClick: () => void
  pending: boolean
  saved: boolean
  label?: string
}) {
  return (
    <div className={styles.saveBar}>
      <button type="button" className={styles.saveBtn} onClick={onClick} disabled={pending}>
        {pending ? 'جاري الحفظ...' : (label ?? 'حفظ القسم')}
      </button>
      {saved && (
        <span className={styles.saved}>
          <CheckCircleIcon size={12} /> تم الحفظ
        </span>
      )}
    </div>
  )
}
