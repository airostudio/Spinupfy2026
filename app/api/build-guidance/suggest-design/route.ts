/**
 * Suggest Design API
 * Returns design recommendations based on business type
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { AI_MODELS } from '@/lib/ai-provider';
import { getBusinessTypeById } from '@/lib/config/business-types';
import {
  DESIGN_PRESETS,
  BUSINESS_TYPE_PRESET_MAP,
} from '@/lib/config/design-presets';
import { DesignPresetId } from '@/lib/types/design-tokens.types';
import {
  getDesignTips,
  getMustHaveFeatures,
  getBusinessInspiration,
} from '@/lib/config/inspiration-gallery';
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

    const { businessName, businessType, description } = await request.json();

    // Sanitize inputs
    const sanitizedBusinessName = businessName ? String(businessName).slice(0, MAX_BUSINESS_NAME_LENGTH) : '';
    const sanitizedDescription = description ? String(description).slice(0, MAX_DESCRIPTION_LENGTH) : '';

    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const businessTypeConfig = getBusinessTypeById(businessType);
    const recommendedPresetId = BUSINESS_TYPE_PRESET_MAP[businessType] || 'modern-tech';
    const recommendedPreset = DESIGN_PRESETS[recommendedPresetId as DesignPresetId];

    // Get AI suggestions for customization
    let aiSuggestions = null;

    if (sanitizedDescription) {
      try {
        const response = await openai.chat.completions.create({
          model: AI_MODELS.openai.text,
          messages: [
            {
              role: 'system',
              content: `You are a design expert. Analyze a business and suggest design customizations.
Be specific and actionable. Consider the business description to personalize suggestions.`,
            },
            {
              role: 'user',
              content: `Business: ${sanitizedBusinessName}
Type: ${businessTypeConfig?.label || businessType}
Description: ${sanitizedDescription}
Recommended Style: ${recommendedPreset.name}

Suggest specific design customizations. Return JSON with:
- colorNotes: Brief note about ideal color feeling (1-2 sentences)
- typographyNotes: Font style suggestions (1-2 sentences)
- layoutNotes: Layout/structure suggestions (1-2 sentences)
- moodNotes: Overall mood/feel suggestions (1-2 sentences)`,
            },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 400,
        });

        const content = response.choices[0]?.message?.content;
        let parsed = null;
        try {
          parsed = content ? JSON.parse(content) : null;
        } catch {
          console.warn('Failed to parse AI design suggestions');
        }
        aiSuggestions = parsed;
      } catch (error) {
        console.error('AI suggestion error:', error);
      }
    }

    // Get alternative presets
    const alternativePresets = getAlternativePresets(recommendedPresetId as DesignPresetId);

    // Get design tips and inspiration
    const designTips = getDesignTips(businessType);
    const mustHaveFeatures = getMustHaveFeatures(businessType);
    const inspiration = getBusinessInspiration(businessType);

    return NextResponse.json({
      recommendedPreset: {
        id: recommendedPresetId,
        name: recommendedPreset.name,
        description: recommendedPreset.description,
        mood: recommendedPreset.mood,
        colors: {
          primary: recommendedPreset.colors.primary,
          accent: recommendedPreset.colors.accent,
          background: recommendedPreset.colors.background,
        },
        typography: {
          primary: recommendedPreset.typography.primary.family,
          secondary: recommendedPreset.typography.secondary.family,
        },
      },
      alternatives: alternativePresets,
      aiSuggestions,
      businessTypeInfo: {
        label: businessTypeConfig?.label,
        mood: businessTypeConfig?.colorTheme?.mood,
        keywords: businessTypeConfig?.keywords?.slice(0, 5),
      },
      // Design guidance
      designTips,
      mustHaveFeatures,
      layoutSuggestions: inspiration?.layoutSuggestions || [],
    });
  } catch (error) {
    console.error('Design suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to get design suggestions' },
      { status: 500 }
    );
  }
}

function getAlternativePresets(recommendedId: DesignPresetId): {
  id: string;
  name: string;
  mood: string;
}[] {
  // Get 2-3 alternative presets that might also work
  const alternatives: { id: DesignPresetId; name: string; mood: string }[] = [];

  const presetOrder: DesignPresetId[] = [
    'modern-tech',
    'professional-corporate',
    'minimal-clean',
    'friendly-approachable',
    'luxury-elegance',
    'warm-artisan',
    'creative-bold',
    'natural-organic',
  ];

  for (const presetId of presetOrder) {
    if (presetId !== recommendedId && alternatives.length < 3) {
      const preset = DESIGN_PRESETS[presetId];
      alternatives.push({
        id: presetId,
        name: preset.name,
        mood: preset.mood,
      });
    }
  }

  return alternatives;
}
