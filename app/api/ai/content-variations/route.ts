import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateContentVariations } from '@/lib/openai'
import { logApiUsage } from '@/lib/db/api-usage.service'

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables first (independent of user)
    if (!process.env.OPENAI_API_KEY) {
      console.error('CRITICAL: OPENAI_API_KEY environment variable is not configured');
      return NextResponse.json(
        { error: 'Server configuration error: OpenAI API key not configured. Please contact support.' },
        { status: 500 }
      );
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
    const { originalContent, numberOfVariations = 3, tone } = body

    if (!originalContent) {
      return NextResponse.json(
        { error: 'Missing required field: originalContent' },
        { status: 400 }
      )
    }

    // Generate content variations using AI
    const variations = await generateContentVariations({
      originalContent,
      numberOfVariations,
      tone,
    })

    // Track API usage
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_GPT4',
      endpoint: '/api/ai/content-variations',
      tokensUsed: 600 * numberOfVariations,
      costUsd: 0.01 * numberOfVariations,
    })

    return NextResponse.json({
      success: true,
      data: {
        variations,
      },
    })
  } catch (error) {
    console.error('Error generating content variations:', error)
    return NextResponse.json(
      { error: 'Failed to generate content variations' },
      { status: 500 }
    )
  }
}
