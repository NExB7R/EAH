import 'server-only'

import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

export type SiteSettings = {
  site_name: string
  support_email: string
  support_whatsapp: string
  support_facebook_url: string
  whatsapp_channel_url: string
  public_contacts_enabled: boolean
  announcement_banner: string
  maintenance_mode: boolean
  new_signups_enabled: boolean
  featured_enabled: boolean
}

export type PublicContactLinks = {
  enabled: boolean
  supportWhatsappUrl: string | null
  whatsappChannelUrl: string | null
  facebookUrl: string | null
  email: string | null
}

export const SITE_SETTINGS_DEFAULTS: SiteSettings = {
  site_name: 'EAH',
  support_email: '',
  support_whatsapp: '',
  support_facebook_url: '',
  whatsapp_channel_url: '',
  public_contacts_enabled: false,
  announcement_banner: '',
  maintenance_mode: false,
  new_signups_enabled: true,
  featured_enabled: true,
}

type StoredSiteSetting = { value: unknown; updated_at: string | null }

async function readStoredSettings(): Promise<{ settings: SiteSettings; updatedAt: string | null }> {
  try {
    const service = createServiceClient()
    const { data, error } = await service
      .from('app_settings')
      .select('value, updated_at')
      .eq('key', 'site')
      .maybeSingle()

    if (error) {
      console.error('[site-settings] settings lookup failed:', error.message)
      return { settings: SITE_SETTINGS_DEFAULTS, updatedAt: null }
    }

    const stored = data as StoredSiteSetting | null
    const raw =
      stored?.value && typeof stored.value === 'object'
        ? (stored.value as Record<string, unknown>)
        : {}

    const settings: SiteSettings = {
      site_name: typeof raw.site_name === 'string' ? raw.site_name : 'EAH',
      support_email: typeof raw.support_email === 'string' ? raw.support_email.trim() : '',
      support_whatsapp: typeof raw.support_whatsapp === 'string' ? raw.support_whatsapp.trim() : '',
      support_facebook_url: typeof raw.support_facebook_url === 'string' ? raw.support_facebook_url.trim() : '',
      whatsapp_channel_url: typeof raw.whatsapp_channel_url === 'string' ? raw.whatsapp_channel_url.trim() : '',
      public_contacts_enabled: raw.public_contacts_enabled === true,
      announcement_banner: typeof raw.announcement_banner === 'string' ? raw.announcement_banner : '',
      maintenance_mode: raw.maintenance_mode === true,
      new_signups_enabled: typeof raw.new_signups_enabled === 'boolean' ? raw.new_signups_enabled : true,
      featured_enabled: typeof raw.featured_enabled === 'boolean' ? raw.featured_enabled : true,
    }

    return { settings, updatedAt: stored?.updated_at ?? null }
  } catch (error) {
    console.error('[site-settings] settings unavailable:', error)
    return { settings: SITE_SETTINGS_DEFAULTS, updatedAt: null }
  }
}

export async function getSiteSettingsForAdmin(): Promise<{ settings: SiteSettings; updatedAt: string | null }> {
  return readStoredSettings()
}

function safeHttpsUrl(value: string, hosts: string[]): string | null {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()
    if (url.protocol !== 'https:' || !hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

function normalizeWhatsAppNumber(raw: string): string | null {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = `20${digits.slice(1)}`
  return digits.length >= 10 && digits.length <= 15 ? digits : null
}

function safeEmail(raw: string): string | null {
  const value = raw.trim()
  return value.length > 0 && value.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null
}

export const getPublicContactSettings = unstable_cache(
  async (): Promise<PublicContactLinks> => {
    const { settings } = await readStoredSettings()
    if (!settings.public_contacts_enabled) {
      return { enabled: false, supportWhatsappUrl: null, whatsappChannelUrl: null, facebookUrl: null, email: null }
    }

    const digits = normalizeWhatsAppNumber(settings.support_whatsapp)
    const supportWhatsappUrl = digits ? `https://wa.me/${digits}` : null
    const whatsappChannelUrl = safeHttpsUrl(settings.whatsapp_channel_url, ['whatsapp.com'])
    const facebookUrl = safeHttpsUrl(settings.support_facebook_url, ['facebook.com', 'fb.com'])
    const email = safeEmail(settings.support_email)

    return {
      enabled: Boolean(supportWhatsappUrl || whatsappChannelUrl || facebookUrl || email),
      supportWhatsappUrl,
      whatsappChannelUrl,
      facebookUrl,
      email,
    }
  },
  ['public-site-contact-settings'],
  { revalidate: 60, tags: ['site-settings'] },
)
