import type { MetadataRoute } from 'next'

/**
 * Standards-compliant XML sitemap. Public routes only — the private
 * /workspace state and /api routes are excluded by design.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.gitlostbaton.xyz/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.gitlostbaton.xyz/signin',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
