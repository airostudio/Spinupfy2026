/**
 * Generate Taglines API
 * Uses AI to generate tagline suggestions for a business
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { AI_MODELS } from '@/lib/ai-provider';
import { getBusinessTypeById } from '@/lib/config/business-types';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Input validation limits
const MAX_BUSINESS_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const ALLOWED_TONES = ['professional', 'friendly', 'casual', 'luxury', 'playful', 'authoritative'];

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessName, businessType, description, tone } = await request.json();

    if (!businessName || !businessType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedBusinessName = String(businessName).slice(0, MAX_BUSINESS_NAME_LENGTH);
    const sanitizedDescription = String(description).slice(0, MAX_DESCRIPTION_LENGTH);
    const validTone = ALLOWED_TONES.includes(tone) ? tone : 'professional';

    const businessTypeConfig = getBusinessTypeById(businessType);
    const toneDescription = getToneDescription(validTone);

    const response = await openai.chat.completions.create({
      model: AI_MODELS.openai.text,
      messages: [
        {
          role: 'system',
          content: `You are a professional branding expert. Generate short, memorable taglines for businesses.
Each tagline should be:
- 3-8 words maximum
- Memorable and catchy
- Relevant to the business type
- Match the requested tone`,
        },
        {
          role: 'user',
          content: `Generate 5 unique tagline options for this business:

Business Name: ${sanitizedBusinessName}
Business Type: ${businessTypeConfig?.label || businessType}
Description: ${sanitizedDescription}
Tone: ${toneDescription}

Return only a JSON object with a "taglines" array containing the 5 taglines as strings.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    let parsed: { taglines?: string[] };

    try {
      parsed = content ? JSON.parse(content) : { taglines: [] };
    } catch {
      console.warn('Failed to parse AI response for taglines');
      parsed = { taglines: [] };
    }

    return NextResponse.json({
      taglines: parsed.taglines || [],
    });
  } catch (error) {
    console.error('Tagline generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate taglines' },
      { status: 500 }
    );
  }
}

function getToneDescription(tone: string): string {
  const descriptions: Record<string, string> = {
    professional: 'Professional, polished, and trustworthy',
    friendly: 'Warm, approachable, and welcoming',
    casual: 'Relaxed, down-to-earth, and relatable',
    luxury: 'Sophisticated, exclusive, and refined',
    playful: 'Fun, energetic, and creative',
    authoritative: 'Confident, expert, and industry-leading',
  };

  return descriptions[tone] || descriptions.professional;
}
