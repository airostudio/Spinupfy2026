/**
 * API Route: Analyze Writing Voice
 * POST /api/content-writer/analyze-voice
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { analyzeWritingVoice } from '@/lib/ai/content-writer';
import { logApiUsage } from '@/lib/db/api-usage.service';
import type { AnalyzeVoiceRequest } from '@/lib/types/content-writer';

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
    const body: AnalyzeVoiceRequest = await request.json();
    const {
      writing_sample,
      name,
      description,
    } = body;

    if (!writing_sample || !name) {
      return NextResponse.json(
        { error: 'Writing sample and name are required' },
        { status: 400 }
      );
    }

    // Analyze writing voice
    const { customVoice, tokensUsed } = await analyzeWritingVoice({
      writingSample: writing_sample,
      name,
      description,
    });

    // Calculate cost
    const costPer1kTokens = 0.01;
    const costUsd = (tokensUsed / 1000) * costPer1kTokens;

    // Save to database
    const { data: savedVoice, error: dbError } = await supabase
      .from('custom_voices')
      .insert({
        user_id: user.id,
        name: customVoice.name,
        description: customVoice.description,
        source_sample: customVoice.source_sample,
        analyzed_characteristics: customVoice.analyzed_characteristics,
        tone_profile: customVoice.tone_profile,
        vocabulary_profile: customVoice.vocabulary_profile,
        structure_profile: customVoice.structure_profile,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving custom voice:', dbError);
      return NextResponse.json(
        { error: 'Failed to save custom voice' },
        { status: 500 }
      );
    }

    // Log API usage
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_GPT4',
      endpoint: '/api/content-writer/analyze-voice',
      tokensUsed,
      costUsd,
    });

    return NextResponse.json({
      success: true,
      custom_voice: savedVoice,
    });
  } catch (error) {
    console.error('Error analyzing voice:', error);
    return NextResponse.json(
      { error: 'Failed to analyze voice' },
      { status: 500 }
    );
  }
}
