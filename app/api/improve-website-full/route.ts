/**
 * Full Website Improvement API
 * Deep crawls a website (3 levels), extracts all content, colors, images,
 * and reproduces ALL pages with improved content while maintaining structure
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { deepCrawlWebsite, DeepCrawlResult, CrawlOptions } from '@/lib/deep-website-crawler';
import { reproduceWebsitePages, generateNavigationFromPages, ReproducedPage, ReproductionOptions } from '@/lib/page-reproducer';
import { generateSectionImage } from '@/lib/openai';

export const maxDuration = 300; // 5 minutes for full website crawl

// Throttling configuration to prevent Vercel timeout
const THROTTLE_CONFIG = {
  crawl: {
    maxPages: 12, // Max pages to crawl
    maxTimeMs: 90000, // 90 seconds for crawling
    delayMs: 100, // Delay between page fetches
  },
  reproduce: {
    maxPages: 6, // Max pages to reproduce with AI
    maxTimeMs: 120000, // 120 seconds for reproduction
    delayMs: 200, // Delay between AI generations
  },
};

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('CRITICAL: OPENAI_API_KEY environment variable is not configured');
      return NextResponse.json(
        { error: 'Server configuration error: OpenAI API key not configured.' },
        { status: 500 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      existingUrl,
      businessName,
      description,
      websiteType,
      maxDepth = 2, // Reduced from 3 to prevent timeout
      preserveImages = true, // Use original images by default
      generateNewImages = false, // Only generate new images if requested
      // Optional throttling overrides
      maxCrawlPages,
      maxReproducePages,
    } = body;

    // Apply any custom throttling limits from request
    const crawlOptions: CrawlOptions = {
      maxDepth,
      maxPages: maxCrawlPages ?? THROTTLE_CONFIG.crawl.maxPages,
      maxTimeMs: THROTTLE_CONFIG.crawl.maxTimeMs,
      delayMs: THROTTLE_CONFIG.crawl.delayMs,
    };

    const reproduceOptions: ReproductionOptions = {
      maxPages: maxReproducePages ?? THROTTLE_CONFIG.reproduce.maxPages,
      maxTimeMs: THROTTLE_CONFIG.reproduce.maxTimeMs,
      delayMs: THROTTLE_CONFIG.reproduce.delayMs,
      prioritizeHomepage: true,
    };

    if (!existingUrl) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(existingUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`Starting full website crawl of: ${existingUrl} (depth: ${maxDepth}, maxPages: ${crawlOptions.maxPages})`);

    // Step 1: Deep crawl the website with throttling
    const crawlResult = await deepCrawlWebsite(existingUrl, crawlOptions);

    console.log(`Crawl complete. Found ${crawlResult.pages.length} pages`);
    console.log('Pages found:', crawlResult.pages.map(p => p.path));

    // Step 2: Extract global design elements
    const globalColors = {
      primary: crawlResult.globalColors.primary || '#3B82F6',
      secondary: crawlResult.globalColors.secondary || '#10B981',
      accent: crawlResult.globalColors.accent || '#F59E0B',
    };

    // Step 3: Generate navigation from crawled pages, preserving original structure
    const navigation = generateNavigationFromPages(
      crawlResult.pages,
      crawlResult.navigation
    );

    console.log('Navigation structure:', navigation);

    // Step 4: Set up reproduction context
    const detectedBusinessName = businessName || extractBusinessName(crawlResult.title);
    const reproductionContext = {
      businessName: detectedBusinessName,
      businessType: websiteType || crawlResult.detectedType,
      colors: globalColors,
      fonts: crawlResult.fonts,
      logo: crawlResult.globalImages.logo,
      navigation,
    };

    // Step 5: Reproduce pages with improved content (throttled to prevent timeout)
    console.log(`Reproducing pages with improved content (max: ${reproduceOptions.maxPages})...`);
    const reproducedPages = await reproduceWebsitePages(
      crawlResult,
      reproductionContext,
      reproduceOptions
    );

    console.log(`Reproduced ${reproducedPages.length} pages`);

    // Step 6: Create slug from business name
    const slug = detectedBusinessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure unique slug
    let uniqueSlug = slug;
    let slugCounter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('websites')
        .select('id')
        .eq('slug', uniqueSlug)
        .single();

      if (!existing) break;
      uniqueSlug = `${slug}-${slugCounter}`;
      slugCounter++;
    }

    // Step 7: Create website in database with extracted design
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .insert({
        user_id: user.id,
        name: detectedBusinessName,
        description: description || crawlResult.description,
        slug: uniqueSlug,
        meta_title: `${detectedBusinessName} | Modern Website`,
        meta_description: crawlResult.description,
        theme: {
          primary: globalColors.primary,
          secondary: globalColors.secondary,
          accent: globalColors.accent,
          font: {
            heading: crawlResult.fonts.heading,
            body: crawlResult.fonts.body,
          },
        },
        website_type: websiteType || crawlResult.detectedType,
        brand_name: detectedBusinessName,
        logo_url: crawlResult.globalImages.logo || null,
        published: false,
      })
      .select()
      .single();

    if (websiteError) {
      console.error('Error creating website:', websiteError);
      return NextResponse.json({ error: websiteError.message }, { status: 400 });
    }

    // Step 8: Create all pages in database
    const createdPages: Array<{ id: string; slug: string; title: string }> = [];

    for (let i = 0; i < reproducedPages.length; i++) {
      const page = reproducedPages[i];

      // Create page
      const { data: newPage, error: pageError } = await supabase
        .from('pages')
        .insert({
          website_id: website.id,
          title: page.title,
          slug: page.slug,
          path: page.path,
          is_homepage: page.isHomepage,
          meta_title: page.metaTitle,
          meta_description: page.metaDescription,
          order: i,
        })
        .select()
        .single();

      if (pageError) {
        console.error(`Error creating page ${page.slug}:`, pageError);
        continue;
      }

      createdPages.push({
        id: newPage.id,
        slug: newPage.slug,
        title: newPage.title,
      });

      // Step 9: Create sections for this page
      const sectionsToInsert = page.sections.map(section => ({
        page_id: newPage.id,
        type: section.type,
        content: section.content,
        settings: section.settings,
        order: section.order,
        visible: section.visible,
      }));

      const { error: sectionsError } = await supabase
        .from('sections')
        .insert(sectionsToInsert);

      if (sectionsError) {
        console.error(`Error creating sections for page ${page.slug}:`, sectionsError);
      }
    }

    // Step 10: Optionally generate new hero images for pages
    if (generateNewImages && !preserveImages) {
      console.log('Generating new images for pages...');
      for (const page of createdPages) {
        try {
          const heroImageData = await generateSectionImage({
            businessName: detectedBusinessName,
            businessType: websiteType || crawlResult.detectedType,
            sectionType: 'HERO',
            description: crawlResult.description,
            style: 'photorealistic',
          });

          // Update hero section with new image
          await supabase
            .from('sections')
            .update({
              content: supabase.rpc('jsonb_set_key', {
                target: 'content',
                path: ['backgroundImage'],
                value: heroImageData.url,
              }),
            })
            .eq('page_id', page.id)
            .eq('type', 'HERO');
        } catch (imageError) {
          console.error(`Error generating image for page ${page.slug}:`, imageError);
        }
      }
    }

    // Step 11: Update navigation in all header sections to link to created pages
    const pagePathMap = new Map(createdPages.map(p => [p.slug, `/${p.slug}`]));

    for (const page of createdPages) {
      await supabase
        .from('sections')
        .update({
          content: {
            logo: crawlResult.globalImages.logo,
            companyName: detectedBusinessName,
            navigation: navigation.map(nav => ({
              label: nav.label,
              href: pagePathMap.get(pathToSlug(nav.href)) || nav.href,
            })),
            ctaButton: {
              text: 'Contact Us',
              href: pagePathMap.get('contact') || '/contact',
            },
          },
        })
        .eq('page_id', page.id)
        .eq('type', 'HEADER');
    }

    console.log(`Full website reproduction complete!`);
    console.log(`Created ${createdPages.length} pages with preserved structure`);

    return NextResponse.json({
      success: true,
      data: {
        websiteId: website.id,
        slug: uniqueSlug,
        pagesCreated: createdPages.length,
        pages: createdPages,
        crawlStats: {
          pagesScanned: crawlResult.pages.length,
          maxDepth: maxDepth,
          imagesFound: crawlResult.globalImages.allImages.length,
          colorsExtracted: crawlResult.globalColors.allColors.length,
        },
        design: {
          colors: globalColors,
          fonts: crawlResult.fonts,
          logo: crawlResult.globalImages.logo,
        },
        navigation,
        structure: crawlResult.structure,
      },
    });
  } catch (error) {
    console.error('Error in full website improvement:', error);

    return NextResponse.json(
      {
        error: 'Failed to improve website',
        code: 'UNKNOWN_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Extract business name from page title
 */
function extractBusinessName(title: string): string {
  if (!title) return 'My Website';

  // Remove common suffixes
  let name = title
    .replace(/\s*[-|–—]\s*(Home|Homepage|Welcome|Official Site|Official Website).*$/i, '')
    .replace(/\s*[-|–—]\s*$/i, '')
    .trim();

  // If title starts with "Home" or similar, try to extract the actual name
  if (/^(Home|Welcome|Homepage)/i.test(name)) {
    const parts = title.split(/[-|–—]/);
    if (parts.length > 1) {
      name = parts[parts.length - 1].trim();
    }
  }

  return name || 'My Website';
}

/**
 * Convert path to slug
 */
function pathToSlug(path: string): string {
  return path
    .replace(/^\//, '')
    .replace(/\.html?$/, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'page';
}
