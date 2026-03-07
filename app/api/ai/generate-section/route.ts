import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateSectionContent } from '@/lib/openai'
import { logApiUsage } from '@/lib/db/api-usage.service'

// Maximum duration for section content generation (1 minute for GPT-4)
export const maxDuration = 60

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
    const { sectionType, businessName, businessType, additionalContext } = body

    if (!sectionType || !businessName || !businessType) {
      return NextResponse.json(
        { error: 'Missing required fields: sectionType, businessName, businessType' },
        { status: 400 }
      )
    }

    // Generate section content using AI
    const content = await generateSectionContent({
      sectionType,
      businessName,
      businessType,
      additionalContext,
    })

    // Track API usage
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_GPT4',
      endpoint: '/api/ai/generate-section',
      tokensUsed: 1000,
      costUsd: 0.02,
    })

    return NextResponse.json({
      success: true,
      data: content,
    })
  } catch (error) {
    console.error('Error generating section:', error)
    return NextResponse.json(
      { error: 'Failed to generate section content' },
      { status: 500 }
    )
  }
}
