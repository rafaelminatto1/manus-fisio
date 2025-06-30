import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://manus-fisio.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/settings/', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
} 