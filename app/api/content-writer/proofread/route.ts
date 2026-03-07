/**
 * API Route: Proofread Content
 * POST /api/content-writer/proofread
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { proofreadContent } from '@/lib/ai/content-writer';
import { logApiUsage } from '@/lib/db/api-usage.service';
import type { ProofreadRequest } from '@/lib/types/content-writer';

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
    const body: ProofreadRequest = await request.json();
    const {
      text,
      style_guide_id,
      check_types,
      apply_corrections,
    } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Fetch style guide if provided
    let styleGuide;
    if (style_guide_id) {
      const { data } = await supabase
        .from('style_guides')
        .select('*')
        .eq('id', style_guide_id)
        .single();
      styleGuide = data;
    }

    // Proofread content
    const { result, tokensUsed } = await proofreadContent({
      text,
      styleGuide,
      checkTypes: check_types,
      applyCorrections: apply_corrections,
    });

    // Calculate cost
    const costPer1kTokens = 0.01;
    const costUsd = (tokensUsed / 1000) * costPer1kTokens;

    // Save to database
    const { data: proofreadingResult, error: dbError } = await supabase
      .from('proofreading_results')
      .insert({
        user_id: user.id,
        original_text: text,
        corrected_text: result.corrected_text,
        issues_found: result.issues_found,
        corrections_made: result.corrections_made,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving proofreading result:', dbError);
    }

    // Log API usage
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_GPT4',
      endpoint: '/api/content-writer/proofread',
      tokensUsed,
      costUsd,
    });

    return NextResponse.json({
      success: true,
      result: proofreadingResult || { ...result, cost_usd: costUsd },
    });
  } catch (error) {
    console.error('Error proofreading content:', error);
    return NextResponse.json(
      { error: 'Failed to proofread content' },
      { status: 500 }
    );
  }
}
