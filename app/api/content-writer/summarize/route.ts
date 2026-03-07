/**
 * API Route: Summarize Content
 * POST /api/content-writer/summarize
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { summarizeContent } from '@/lib/ai/content-writer';
import { logApiUsage } from '@/lib/db/api-usage.service';
import type { SummarizeRequest } from '@/lib/types/content-writer';

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Authenticate user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SummarizeRequest = await request.json();
    const {
      text,
      length = 'moderate',
      format = 'paragraph',
      focus_areas = [],
    } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Summarize content
    const { summary, keyPoints, tokensUsed } = await summarizeContent({
      text,
      length,
      format,
      focusAreas: focus_areas,
    });

    // Calculate cost
    const costPer1kTokens = 0.01;
    const costUsd = (tokensUsed / 1000) * costPer1kTokens;

    // Log API usage
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_GPT4',
      endpoint: '/api/content-writer/summarize',
      tokensUsed,
      costUsd,
    });

    return NextResponse.json({
      success: true,
      summary,
      key_points: keyPoints,
      word_count: summary.split(/\s+/).length,
      tokens_used: tokensUsed,
      cost_usd: costUsd,
    });
  } catch (error) {
    console.error('Error summarizing content:', error);
    return NextResponse.json(
      { error: 'Failed to summarize content' },
      { status: 500 }
    );
  }
}
