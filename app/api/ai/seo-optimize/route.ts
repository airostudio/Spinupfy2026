import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateSEOMetadata } from '@/lib/openai'
import { logApiUsage } from '@/lib/db/api-usage.service'

export async function POST(request: NextRequest) {
  try {
    console.log('[SEO API] SEO optimization request received')

    // Validate environment variables first (independent of user)
    if (!process.env.OPENAI_API_KEY) {
      console.error('[SEO API] CRITICAL: OPENAI_API_KEY environment variable is not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: OpenAI API key not configured. Please contact support.'
        },
        { status: 500 }
      );
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[SEO API] Authentication error:', authError)
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, businessType, pageTitle, pageContent } = body

    console.log('[SEO API] Request data:', { businessName, businessType, pageTitle, contentLength: pageContent?.length })

    if (!businessName || !businessType || !pageTitle || !pageContent) {
      console.error('[SEO API] Missing required fields')
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: businessName, businessType, pageTitle, pageContent'
        },
        { status: 400 }
      )
    }

    // Generate SEO metadata using AI
    console.log('[SEO API] Calling generateSEOMetadata...')
    const seoData = await generateSEOMetadata({
      businessName,
      businessType,
      pageTitle,
      pageContent,
    })

    console.log('[SEO API] SEO metadata generated successfully')

    // Track API usage (don't fail if this fails)
    try {
      await logApiUsage({
        userId: user.id,
        service: 'OPENAI_GPT4',
        endpoint: '/api/ai/seo-optimize',
        tokensUsed: 800,
        costUsd: 0.015,
      })
    } catch (usageError) {
      console.error('[SEO API] Failed to log API usage:', usageError)
      // Continue anyway - don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      data: seoData,
    })
  } catch (error) {
    console.error('[SEO API] Error generating SEO metadata:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate SEO metadata'
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error('[SEO API] Error details:', { message: errorMessage, stack: errorStack })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate SEO metadata',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
