/**
 * API Route: Rewrite Content
 * POST /api/content-writer/rewrite
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { rewriteContent } from '@/lib/ai/content-writer';
import { logApiUsage } from '@/lib/db/api-usage.service';
import type { RewriteRequest } from '@/lib/types/content-writer';

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
    const body: RewriteRequest = await request.json();
    const {
      text,
      tone,
      style,
      voice_framework_id,
      custom_voice_id,
      persona_id,
      target_word_count,
    } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Fetch related data
    let voiceFramework, customVoice, persona;

    if (voice_framework_id) {
      const { data } = await supabase
        .from('voice_frameworks')
        .select('*')
        .eq('id', voice_framework_id)
        .single();
      voiceFramework = data;
    }

    if (custom_voice_id) {
      const { data } = await supabase
        .from('custom_voices')
        .select('*')
        .eq('id', custom_voice_id)
        .single();
      customVoice = data;
    }

    if (persona_id) {
      const { data } = await supabase
        .from('audience_personas')
        .select('*')
        .eq('id', persona_id)
        .single();
      persona = data;
    }

    // Rewrite content
    const { rewrittenText, changesSummary, tokensUsed } = await rewriteContent({
      text,
      tone,
      style,
      voiceFramework,
      customVoice,
      persona,
      targetWordCount: target_word_count,
    });

    // Calculate cost
    const costPer1kTokens = 0.01;
    const costUsd = (tokensUsed / 1000) * costPer1kTokens;

    // Log API usage
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_GPT4',
      endpoint: '/api/content-writer/rewrite',
      tokensUsed,
      costUsd,
    });

    return NextResponse.json({
      success: true,
      original_text: text,
      rewritten_text: rewrittenText,
      changes_summary: changesSummary,
      tokens_used: tokensUsed,
      cost_usd: costUsd,
    });
  } catch (error) {
    console.error('Error rewriting content:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite content' },
      { status: 500 }
    );
  }
}
