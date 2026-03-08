import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { WebVitals } from '@/components/WebVitals'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spinupfy — AI Website Builder | Launch in 60 Seconds',
  description:
    'Build a stunning, professional website in under 60 seconds with Spinupfy. Just describe your business and our AI writes the copy, designs the layout, and publishes it instantly. No code required.',
  keywords: [
    'AI website builder',
    'build website with AI',
    'website builder',
    'small business website',
    'AI web design',
    'instant website',
    'no-code website builder',
    'Spinupfy',
  ],
  authors: [{ name: 'Spinupfy' }],
  creator: 'Spinupfy',
  publisher: 'Spinupfy',
  metadataBase: new URL('https://spinupfy.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Spinupfy — AI Website Builder | Launch in 60 Seconds',
    description:
      'Describe your business. AI builds a stunning website in under 60 seconds. No code, no designers, no hassle.',
    url: 'https://spinupfy.com',
    siteName: 'Spinupfy',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Spinupfy — AI Website Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spinupfy — AI Website Builder | Launch in 60 Seconds',
    description:
      'Describe your business. AI builds a stunning website in under 60 seconds. No code, no designers, no hassle.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to Google Fonts for faster dynamic font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen">
        {children}
        <Toaster position="bottom-right" />
        <WebVitals />
      </body>
    </html>
  )
}
