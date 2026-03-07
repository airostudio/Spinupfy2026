/**
 * Match Business Template API
 * Finds the best matching template based on business input
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  findBestTemplate,
  searchTemplates,
  getTemplateById,
  getAllCategories,
  getTemplatesByCategory,
  BUSINESS_TEMPLATES,
  type BusinessTemplate,
} from '@/lib/config/business-templates';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessInput, action = 'match' } = body;

    switch (action) {
      case 'match': {
        // Find best matching template
        if (!businessInput) {
          return NextResponse.json(
            { error: 'Missing businessInput parameter' },
            { status: 400 }
          );
        }

        const template = findBestTemplate(businessInput);

        if (template) {
          return NextResponse.json({
            success: true,
            matched: true,
            template: formatTemplateResponse(template),
          });
        }

        return NextResponse.json({
          success: true,
          matched: false,
          suggestions: searchTemplates(businessInput.split(' ')[0]).slice(0, 5).map(formatTemplateResponse),
        });
      }

      case 'search': {
        // Search templates by keyword
        if (!businessInput) {
          return NextResponse.json(
            { error: 'Missing businessInput parameter' },
            { status: 400 }
          );
        }

        const results = searchTemplates(businessInput);

        return NextResponse.json({
          success: true,
          results: results.slice(0, 10).map(formatTemplateResponse),
        });
      }

      case 'get': {
        // Get specific template by ID
        const { templateId } = body;

        if (!templateId) {
          return NextResponse.json(
            { error: 'Missing templateId parameter' },
            { status: 400 }
          );
        }

        const template = getTemplateById(templateId);

        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          template: formatTemplateResponse(template),
        });
      }

      case 'list': {
        // List all templates, optionally filtered by category
        const { category } = body;

        let templates: BusinessTemplate[];

        if (category) {
          templates = getTemplatesByCategory(category);
        } else {
          templates = BUSINESS_TEMPLATES;
        }

        return NextResponse.json({
          success: true,
          templates: templates.map(formatTemplateResponse),
          categories: getAllCategories(),
        });
      }

      case 'categories': {
        // Get all categories with template counts
        const categories = getAllCategories();
        const categoryData = categories.map(cat => ({
          name: cat,
          count: getTemplatesByCategory(cat).length,
        }));

        return NextResponse.json({
          success: true,
          categories: categoryData,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: match, search, get, list, or categories' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Template matching error:', error);
    return NextResponse.json(
      { error: 'Failed to process template request' },
      { status: 500 }
    );
  }
}

function formatTemplateResponse(template: BusinessTemplate) {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    layout: template.layout,
    description: template.description,
    tone: template.tone,
    colorMood: template.colorMood,
    ctaText: template.ctaText,
    ctaSecondary: template.ctaSecondary,
    heroHeadline: template.heroHeadline,
    heroSubheadline: template.heroSubheadline,
    painPoints: template.painPoints,
    suggestedPages: template.suggestedPages,
    specialFeatures: template.specialFeatures,
    enableStoreFramework: template.enableStoreFramework,
    imageSubjects: template.imageSubjects?.map(s => ({
      section: s.section,
      style: s.style,
    })),
  };
}
