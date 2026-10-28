import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'

// ═══════════════════════════════════════════════════════════
// EAH — Sitemap
// ═══════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eah-sq.vercel.app'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // static
  const staticPaths = [
    { url: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/explore', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/featured', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/trends', priority: 0.85, changeFrequency: 'daily' as const },
    { url: '/offers', priority: 0.85, changeFrequency: 'daily' as const },
    { url: '/new', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/nearby', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/help', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/roadmap', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/pricing', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/advertise', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/cookies', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/faq', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/support-palestine', priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p.url}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  // businesses
  const supabase = createPublicClient()
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('is_verified', { ascending: false })
    .order('rating_count', { ascending: false })
    .order('rating_avg', { ascending: false })
    .order('successful_orders', { ascending: false })
    .limit(5000)

  const bizEntries: MetadataRoute.Sitemap = (businesses ?? []).map((b) => ({
    url: `${SITE_URL}/businesses/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticEntries, ...bizEntries]
}
