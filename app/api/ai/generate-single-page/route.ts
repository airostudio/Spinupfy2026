/**
 * Generate Single Page API Endpoint
 * Generates a single page with AI based on a link/slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generatePageContent } from '@/lib/services/page-generator';
import { logApiUsage } from '@/lib/db/api-usage.service';

// Maximum duration for single page generation (2 minutes for GPT-4)
export const maxDuration = 120;

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

    const supabase = await createServerSupabaseClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { websiteId, slug, context } = body;

    if (!websiteId || !slug) {
      return NextResponse.json(
        { error: 'Website ID and slug are required' },
        { status: 400 }
      );
    }

    // Fetch website to verify ownership
    const { data: website, error: fetchError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }

    // Check if page already exists
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id, slug, title')
      .eq('website_id', websiteId)
      .eq('slug', slug)
      .single();

    if (existingPage) {
      return NextResponse.json(
        {
          success: false,
          error: `Page "/${slug}" already exists`,
          existingPage: {
            id: existingPage.id,
            slug: existingPage.slug,
            title: existingPage.title,
          },
        },
        { status: 409 }
      );
    }

    // Get count of existing pages for ordering
    const { count: pageCount } = await supabase
      .from('pages')
      .select('*', { count: 'exact', head: true })
      .eq('website_id', websiteId);

    // Generate page content using AI
    const startTime = Date.now();
    const pageContent = await generatePageContent({
      websiteName: context?.websiteName || website.name,
      websiteType: context?.websiteType || website.website_type || 'general',
      brandName: context?.brandName || website.brand_name,
      link: {
        href: `/${slug}`,
        text: context?.buttonText || slug,
        slug,
        context: `Generated from button: "${context?.buttonText || slug}"`,
        sourceSection: 'CTA/Hero',
      },
    });

    const generationTime = Date.now() - startTime;

    // Insert the new page
    const { data: newPage, error: pageError } = await supabase
      .from('pages')
      .insert({
        website_id: websiteId,
        title: pageContent.title,
        slug: pageContent.slug,
        path: pageContent.path,
        meta_title: pageContent.metaTitle,
        meta_description: pageContent.metaDescription,
        order: (pageCount || 0) + 1,
        is_homepage: false,
      })
      .select()
      .single();

    if (pageError || !newPage) {
      console.error('Failed to create page:', pageError);
      return NextResponse.json(
        { error: 'Failed to create page in database' },
        { status: 500 }
      );
    }

    // Insert sections for this page
    const sectionsToInsert = pageContent.sections.map((section, index) => ({
      page_id: newPage.id,
      type: section.type,
      content: section.content,
      settings: section.settings || {},
      order: section.order ?? index,
      visible: section.visible ?? true,
    }));

    const { data: newSections, error: sectionsError } = await supabase
      .from('sections')
      .insert(sectionsToInsert)
      .select();

    if (sectionsError) {
      console.error('Failed to create sections:', sectionsError);
      // Delete the page since sections failed
      await supabase.from('pages').delete().eq('id', newPage.id);
      return NextResponse.json(
        { error: 'Failed to create page sections' },
        { status: 500 }
      );
    }

    // Log API usage
    const estimatedTokens = 2000; // Estimate for single page generation
    const estimatedCost = (estimatedTokens / 1000) * 0.03;
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_GPT4',
      endpoint: '/api/ai/generate-single-page',
      tokensUsed: estimatedTokens,
      costUsd: estimatedCost,
      success: true,
      responseData: {
        websiteId,
        pageId: newPage.id,
        slug,
        sectionsCount: newSections?.length || 0,
        generationTimeMs: generationTime,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Page "/${slug}" generated successfully`,
      page: {
        id: newPage.id,
        title: newPage.title,
        slug: newPage.slug,
        path: newPage.path,
        sectionsCount: newSections?.length || 0,
      },
      stats: {
        generationTimeMs: generationTime,
        sectionsCreated: newSections?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error in generate-single-page API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate page',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
