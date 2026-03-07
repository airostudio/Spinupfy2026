import type { NextConfig } from 'next'

// Validate environment variables at build time
import './lib/env'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
    ],
  },

  // Security and performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'x-dns-prefetch-control',
            value: 'on'
          },
          {
            key: 'x-frame-options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'x-content-type-options',
            value: 'nosniff'
          },
          {
            key: 'referrer-policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'permissions-policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'strict-transport-security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'x-xss-protection',
            value: '1; mode=block'
          },
          {
            key: 'content-security-policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://vercel.live https://*.vercel.live; script-src-elem 'self' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com https://vercel.live https://*.vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live https://*.vercel.live; img-src 'self' data: blob: https: http:; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://vercel.live https://*.vercel.live; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.unsplash.com https://api.stripe.com https://*.stripe.com https://vercel.live https://*.vercel.live wss://*.vercel.live wss://ws-us3.pusher.com; object-src 'none'; base-uri 'self'; form-action 'self';"
          }
        ],
      },
    ]
  },
}

export default nextConfig
