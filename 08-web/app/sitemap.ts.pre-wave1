import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase-server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eah-sq.vercel.app'

const STATIC_PAGES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, freq: 'daily' },
  { path: '/explore', priority: 0.9, freq: 'daily' },
  { path: '/offers', priority: 0.85, freq: 'daily' },
  { path: '/trends', priority: 0.8, freq: 'daily' },
  { path: '/recommend', priority: 0.75, freq: 'weekly' },
  { path: '/about', priority: 0.6, freq: 'monthly' },
  { path: '/contact', priority: 0.6, freq: 'monthly' },
  { path: '/pricing', priority: 0.7, freq: 'weekly' },
  { path: '/advertise', priority: 0.6, freq: 'monthly' },
  { path: '/support-palestine', priority: 0.5, freq: 'monthly' },
  { path: '/terms', priority: 0.3, freq: 'yearly' },
  { path: '/privacy', priority: 0.3, freq: 'yearly' },
  { path: '/cookies', priority: 0.3, freq: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${siteUrl}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }))

  // Business pages
  let bizEntries: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('businesses')
      .select('slug,updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(2000)

    bizEntries = (data ?? []).map((b: any) => ({
      url: `${siteUrl}/businesses/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    }))
  } catch {
    /* silent */
  }

  return [...staticEntries, ...bizEntries]
}
