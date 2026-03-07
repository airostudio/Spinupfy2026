/**
 * API Route: Generate Content
 * POST /api/content-writer/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateExpertContent } from '@/lib/ai/content-writer';
import { logApiUsage } from '@/lib/db/api-usage.service';
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/rate-limit';
import type { GenerateContentRequest } from '@/lib/types/content-writer';

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

    // Rate limit: 10 AI generations per minute per user
    const rateLimit = checkRateLimit(`content-gen:${user.id}`, RATE_LIMITS.aiGeneration);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetIn);
    }

    // Parse request body
    const body: GenerateContentRequest = await request.json();
    const {
      prompt,
      template_id,
      style_guide_id,
      voice_framework_id,
      custom_voice_id,
      persona_id,
      tone,
      word_count,
      additional_instructions,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (typeof prompt !== 'string' || prompt.length > 5000) {
      return NextResponse.json(
        { error: 'Prompt must be a string under 5000 characters' },
        { status: 400 }
      );
    }

    if (additional_instructions && (typeof additional_instructions !== 'string' || additional_instructions.length > 2000)) {
      return NextResponse.json(
        { error: 'Additional instructions must be a string under 2000 characters' },
        { status: 400 }
      );
    }

    if (word_count !== undefined && (typeof word_count !== 'number' || word_count < 10 || word_count > 10000)) {
      return NextResponse.json(
        { error: 'word_count must be a number between 10 and 10000' },
        { status: 400 }
      );
    }

    // Fetch related data
    let template, styleGuide, voiceFramework, customVoice, persona;

    if (template_id) {
      const { data } = await supabase
        .from('content_templates')
        .select('*')
        .eq('id', template_id)
        .single();
      template = data;
    }

    if (style_guide_id) {
      const { data } = await supabase
        .from('style_guides')
        .select('*')
        .eq('id', style_guide_id)
        .single();
      styleGuide = data;
    }

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

    // Generate content
    const { content, metadata, tokensUsed } = await generateExpertContent({
      prompt,
      template,
      styleGuide,
      voiceFramework,
      customVoice,
      persona,
      tone,
      wordCount: word_count,
      additionalInstructions: additional_instructions,
    });

    // Calculate cost (GPT-4 Turbo pricing)
    const costPer1kTokens = 0.01; // input
    const costUsd = (tokensUsed / 1000) * costPer1kTokens;

    // Save to database
    const { data: generatedContent, error: dbError } = await supabase
      .from('generated_content')
      .insert({
        user_id: user.id,
        template_id,
        style_guide_id,
        voice_framework_id,
        custom_voice_id,
        persona_id,
        prompt,
        generated_text: content,
        metadata,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving generated content:', dbError);
    }

    // Log API usage
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_GPT4',
      endpoint: '/api/content-writer/generate',
      tokensUsed,
      costUsd,
    });

    return NextResponse.json({
      success: true,
      content: generatedContent || {
        generated_text: content,
        metadata,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
      },
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
