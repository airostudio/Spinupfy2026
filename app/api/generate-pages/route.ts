/**
 * Generate Pages API Endpoint
 * Scans website content and generates missing pages for all internal links
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { extractAllLinks, filterMissingPages } from '@/lib/utils/link-extractor';
import { generateMultiplePages, MultiPageGenerationOptions } from '@/lib/services/page-generator';
import { logApiUsage } from '@/lib/db/api-usage.service';

export const maxDuration = 300; // 5 minutes max

// Throttling configuration to prevent Vercel timeout
const THROTTLE_CONFIG: MultiPageGenerationOptions = {
  maxPages: 8, // Max pages to generate in one request
  maxTimeMs: 240000, // 4 minutes max for page generation
  delayMs: 400, // Delay between AI generations
};

export async function POST(request: NextRequest) {
  try {
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
    const { websiteId } = body;

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      );
    }

    // Fetch website with all pages and sections
    const { data: website, error: fetchError } = await supabase
      .from('websites')
      .select(
        `
        *,
        pages (
          *,
          sections (*)
        )
      `
      )
      .eq('id', websiteId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }

    // Transform database format to application format
    const pages = website.pages.map((page: any) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      path: page.path,
      isHomepage: page.is_homepage,
      metaTitle: page.meta_title,
      metaDescription: page.meta_description,
      order: page.order,
      sections: page.sections
        .map((section: any) => ({
          id: section.id,
          type: section.type,
          content: section.content,
          settings: section.settings,
          order: section.order,
          visible: section.visible,
        }))
        .sort((a: any, b: any) => a.order - b.order),
    }));

    // Extract all links from website content
    const allLinks = extractAllLinks(pages);

    // Filter out links that already have pages
    const missingLinks = filterMissingPages(allLinks, pages);

    if (missingLinks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No missing pages found',
        generatedPages: [],
        stats: {
          totalLinksFound: allLinks.length,
          existingPages: pages.length,
          newPagesCreated: 0,
        },
      });
    }

    // Generate content for missing pages with throttling to prevent timeout
    console.log(`Generating content for ${missingLinks.length} missing pages (limited to ${THROTTLE_CONFIG.maxPages})`);
    const startTime = Date.now();
    const generatedPages = await generateMultiplePages(
      missingLinks,
      {
        websiteName: website.name,
        websiteType: website.website_type || 'general',
        brandName: website.brand_name,
      },
      {
        ...THROTTLE_CONFIG,
        onProgress: (current, total, slug) => {
          console.log(`Generating page ${current}/${total}: ${slug}`);
        },
      }
    );

    const generationTime = Date.now() - startTime;

    // Create pages and sections in database
    const createdPages: any[] = [];
    let totalTokensUsed = 0;

    for (const pageContent of generatedPages) {
      // Insert page
      const { data: newPage, error: pageError } = await supabase
        .from('pages')
        .insert({
          website_id: websiteId,
          title: pageContent.title,
          slug: pageContent.slug,
          path: pageContent.path,
          meta_title: pageContent.metaTitle,
          meta_description: pageContent.metaDescription,
          order: pages.length + createdPages.length + 1,
          is_homepage: false,
        })
        .select()
        .single();

      if (pageError || !newPage) {
        console.error(`Failed to create page ${pageContent.slug}:`, pageError);
        continue;
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
        console.error(
          `Failed to create sections for page ${pageContent.slug}:`,
          sectionsError
        );
      }

      createdPages.push({
        ...newPage,
        sections: newSections || [],
      });

      // Estimate tokens used (rough estimate: 1000 tokens per page)
      totalTokensUsed += 1000;
    }

    // Log API usage
    const estimatedCost = (totalTokensUsed / 1000) * 0.03; // Rough estimate for GPT-4
    await logApiUsage({
      userId: user.id,
      service: 'OPENAI_GPT4',
      endpoint: '/api/generate-pages',
      tokensUsed: totalTokensUsed,
      costUsd: estimatedCost,
      success: true,
      responseData: {
        websiteId,
        pagesGenerated: createdPages.length,
        totalLinks: allLinks.length,
        generationTimeMs: generationTime,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${createdPages.length} new pages`,
      generatedPages: createdPages.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        path: p.path,
        sectionsCount: p.sections.length,
      })),
      stats: {
        totalLinksFound: allLinks.length,
        existingPages: pages.length,
        newPagesCreated: createdPages.length,
        generationTimeMs: generationTime,
      },
    });
  } catch (error) {
    console.error('Error in generate-pages API:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate pages',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
