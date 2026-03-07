import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { WebVitals } from '@/components/WebVitals'
import './globals.css'

export const metadata: Metadata = {
  title: 'Webese - Your AI Website Buddy | Create Beautiful Websites in Seconds',
  description: 'Build stunning websites using AI. Just tell us what you do and AI designs everything for you. Webese is your AI website buddy.',
  icons: {
    icon: '/webese-icon.svg',
    shortcut: '/webese-icon.svg',
    apple: '/webese-icon.svg',
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
