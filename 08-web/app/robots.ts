import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/merchant', '/account', '/api'],
    }],
    sitemap: 'https://eah-sq.vercel.app/sitemap.xml',
  }
}
