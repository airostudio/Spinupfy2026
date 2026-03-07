import { MetadataRoute } from 'next'

/**
 * Robots.txt configuration for the AI Website Builder
 * Allows search engines to crawl all content except admin and API routes
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/editor/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/editor/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
