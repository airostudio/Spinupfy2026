import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { refineContent } from '@/lib/openai'
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
    const { originalContent, instruction, tone, length } = body

    if (!originalContent || !instruction) {
      return NextResponse.json(
        { error: 'Missing required fields: originalContent, instruction' },
        { status: 400 }
      )
    }

    // Refine content using AI
    const refinedContent = await refineContent({
      originalContent,
      instruction,
      tone,
      length,
    })

    // Track API usage
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_GPT4',
      endpoint: '/api/ai/refine-content',
      tokensUsed: 500,
      costUsd: 0.01,
    })

    return NextResponse.json({
      success: true,
      data: {
        refinedContent,
      },
    })
  } catch (error) {
    console.error('Error refining content:', error)
    return NextResponse.json(
      { error: 'Failed to refine content' },
      { status: 500 }
    )
  }
}
