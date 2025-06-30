import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://manus-fisio.vercel.app';

  const staticRoutes = [
    '/',
    '/analytics',
    '/backup',
    '/calendar',
    '/collaboration',
    '/dashboard-pro',
    '/exercises',
    '/notebooks',
    '/patients',
    '/projects',
    '/settings',
    '/system-monitor',
    '/tasks',
    '/team',
    '/auth/login'
  ];

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));
} 