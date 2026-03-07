/**
 * Open Graph Image Generation API
 * Generates dynamic OG images for social media sharing
 */

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get parameters from query string
    const title = searchParams.get('title') || 'AI Website Builder'
    const description = searchParams.get('description') || 'Create beautiful websites using AI'
    const brandName = searchParams.get('brand') || 'AI Website Builder'
    const theme = searchParams.get('theme') || 'purple' // purple, blue, pink, gradient

    // Define theme colors - NO PURPLE
    const themes: Record<string, { primary: string; secondary: string; bg: string }> = {
      blue: {
        primary: '#2563eb',
        secondary: '#0ea5e9',
        bg: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
      },
      cyan: {
        primary: '#0891b2',
        secondary: '#06b6d4',
        bg: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
      },
      pink: {
        primary: '#ec4899',
        secondary: '#f97316',
        bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      gradient: {
        primary: '#2563eb',
        secondary: '#06b6d4',
        bg: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
      },
    }

    const selectedTheme = themes[theme] || themes.blue

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: selectedTheme.bg,
            padding: '80px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Brand Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              fontSize: 32,
              fontWeight: 700,
              opacity: 0.9,
            }}
          >
            {brandName}
          </div>

          {/* Title and Description */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.2,
                maxWidth: '900px',
                textShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {title}
            </div>

            {/* Description */}
            {description && (
              <div
                style={{
                  fontSize: 36,
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: 1.4,
                  maxWidth: '800px',
                }}
              >
                {description}
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Footer accent line */}
            <div
              style={{
                width: '200px',
                height: '8px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '4px',
              }}
            />

            {/* AI Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.2)',
                padding: '16px 32px',
                borderRadius: '999px',
                color: 'white',
                fontSize: 24,
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            >
              ✨ AI-Powered
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
