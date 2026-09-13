import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase-server'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://eah-sq.vercel.app'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/explore`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/offers`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/trends`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/recommend`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/advertise`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/merchant/apply`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('businesses').select('slug, created_at').eq('is_published', true).limit(1000)
    const bizPages: MetadataRoute.Sitemap = (data ?? []).map(b => ({
      url: `${baseUrl}/businesses/${b.slug}`,
      lastModified: new Date(b.created_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
    return [...staticPages, ...bizPages]
  } catch { return staticPages }
}
