import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateSectionImage } from '@/lib/openai'
import { logApiUsage } from '@/lib/db/api-usage.service'

// Maximum duration for image generation (2 minutes for DALL-E 3)
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables first (independent of user)
    if (!process.env.OPENAI_API_KEY) {
      console.error('CRITICAL: OPENAI_API_KEY environment variable is not configured')
      return NextResponse.json(
        { error: 'Server configuration error: OpenAI API key not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, businessType, sectionType, description, style } = body

    if (!businessName || !businessType || !sectionType) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, businessType, sectionType' },
        { status: 400 }
      )
    }

    // Generate image using DALL-E 3 (returns { url, altText })
    const imageData = await generateSectionImage({
      businessName,
      businessType,
      sectionType,
      description,
      style,
    })

    // Track API usage (DALL-E is more expensive)
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_DALLE',
      endpoint: '/api/ai/generate-image',
      tokensUsed: 0,
      costUsd: 0.04,
    })

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: imageData.url,
        altText: imageData.altText,
      },
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
