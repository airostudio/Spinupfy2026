/**
 * Generate USPs (Unique Selling Points) API
 * Creates compelling USPs based on business type and description
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { AI_MODELS } from '@/lib/ai-provider';
import { getBusinessTypeById } from '@/lib/config/business-types';
import { getContentTemplateOrDefault } from '@/lib/config/content-templates';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Input validation limits
const MAX_BUSINESS_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessName, businessType, description, tone = 'professional' } = await request.json();

    if (!businessName || !businessType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedBusinessName = String(businessName).slice(0, MAX_BUSINESS_NAME_LENGTH);
    const sanitizedDescription = String(description).slice(0, MAX_DESCRIPTION_LENGTH);

    const businessTypeConfig = getBusinessTypeById(businessType);
    const contentTemplate = getContentTemplateOrDefault(businessType);

    // First, provide some quick suggestions from templates
    const templateSuggestions = contentTemplate.uspSuggestions || [];

    // Then generate AI-powered custom USPs
    const response = await openai.chat.completions.create({
      model: AI_MODELS.openai.text,
      messages: [
        {
          role: 'system',
          content: `You are a marketing strategist specializing in creating compelling unique selling points (USPs) for businesses.

USPs should be:
- Short (3-8 words)
- Specific and measurable when possible
- Focused on customer benefits
- Differentiating from competitors
- Memorable and impactful`,
        },
        {
          role: 'user',
          content: `Generate 6 unique selling points for this business:

Business Name: ${sanitizedBusinessName}
Business Type: ${businessTypeConfig?.label || businessType}
Description: ${sanitizedDescription}
Tone: ${tone}

Consider these industry-relevant USPs as inspiration (but generate unique ones):
${templateSuggestions.join('\n')}

Return a JSON object with a "usps" array containing exactly 6 unique, compelling selling points as strings.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content;
    let parsed: { usps?: string[] };

    try {
      parsed = content ? JSON.parse(content) : { usps: [] };
    } catch {
      console.warn('Failed to parse AI response for USPs');
      parsed = { usps: [] };
    }

    return NextResponse.json({
      usps: parsed.usps || [],
      templateSuggestions: templateSuggestions,
    });
  } catch (error) {
    console.error('USP generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate USPs' },
      { status: 500 }
    );
  }
}
