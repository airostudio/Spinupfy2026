/**
 * Improve Website API
 * Analyzes existing website and generates improved version
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { analyzeWebsite, WebsiteAnalysisError } from '@/lib/website-analyzer';
import { generateWebsiteContent, generateSectionImage } from '@/lib/openai';

export const maxDuration = 180; // 3 minutes max for basic website improvement

// Fallback placeholder image for when image generation fails
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=800&fit=crop';

// Helper function to safely process Promise.allSettled results with fallbacks
function processImageResults<T extends { url: string }>(
  results: PromiseSettledResult<T>[],
  fallbackUrl: string = FALLBACK_IMAGE
): T[] {
  return results.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.warn(`Image generation ${idx} failed:`, result.reason);
      return { url: fallbackUrl, altText: 'Placeholder image' } as unknown as T;
    }
  });
}

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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { existingUrl, businessName, description, websiteType } = body;

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

    // Step 1: Analyze the existing website
    console.log('Analyzing existing website:', existingUrl);
    const analysis = await analyzeWebsite(existingUrl);

    console.log('Website analysis complete:', {
      title: analysis.title,
      detectedType: analysis.detectedType,
      colorsFound: analysis.colors,
      contentSections: analysis.content.headings.length,
    });

    // Step 2: Generate improved content with AI
    console.log('Generating improved content with AI...');
    const aiContent = await generateWebsiteContent({
      businessName: businessName || analysis.title,
      businessType: websiteType || analysis.detectedType,
      description: description || analysis.description || `Improve and modernize this ${analysis.detectedType} website`,
      targetAudience: '',
      features: [],
      tone: 'professional',
      existingContent: {
        headings: analysis.content.headings,
        paragraphs: analysis.content.paragraphs,
        keywords: analysis.keywords,
      },
    });

    // Step 3: Use existing logo if available (users can create logo in editor if needed)
    const logoUrl = analysis.images.logo || null;

    // Step 4: Generate improved hero image (returns { url, altText })
    console.log('Generating hero image...');
    const heroImageData = await generateSectionImage({
      businessName: businessName || analysis.title,
      businessType: websiteType || analysis.detectedType,
      sectionType: 'HERO',
      description: aiContent.hero.description,
      style: 'photorealistic',
    });
    const heroImageUrl = heroImageData.url;

    // Step 5: Create slug from business name
    const slug = (businessName || analysis.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure unique slug (globally unique across all users)
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

    // Step 6: Create website in database (MAINTAINING BRAND COLORS)
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .insert({
        user_id: user.id,
        name: businessName || analysis.title,
        description: description || analysis.description,
        slug: uniqueSlug,
        meta_title: `${businessName || analysis.title} | Modern Website`,
        meta_description: analysis.description || aiContent.hero.description,
        theme: {
          primary: analysis.colors.primary,
          secondary: analysis.colors.secondary,
          accent: analysis.colors.accent,
          font: {
            heading: analysis.fonts.heading,
            body: analysis.fonts.body,
          },
        },
        website_type: websiteType || analysis.detectedType,
        brand_name: businessName || analysis.title,
        logo_url: logoUrl,
        published: false,
      })
      .select()
      .single();

    if (websiteError) {
      console.error('Error creating website:', websiteError);
      return NextResponse.json({ error: websiteError.message }, { status: 400 });
    }

    // Step 7: Create homepage
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .insert({
        website_id: website.id,
        title: 'Home',
        slug: 'home',
        path: '/',
        is_homepage: true,
        meta_title: website.meta_title,
        meta_description: website.meta_description,
        order: 0,
      })
      .select()
      .single();

    if (pageError) {
      console.error('Error creating page:', pageError);
      return NextResponse.json({ error: pageError.message }, { status: 400 });
    }

    // Step 8: Create improved sections
    const sections = [];

    // Header
    sections.push({
      page_id: page.id,
      type: 'HEADER',
      order: 0,
      visible: true,
      content: {
        logo: logoUrl,
        companyName: businessName || analysis.title,
        navigation: analysis.pages.slice(0, 5).map(p => ({
          label: p.title,
          href: p.url.includes(existingUrl) ? p.url.replace(existingUrl, '') : p.url,
        })),
        ctaButton: {
          text: 'Get Started',
          href: '/contact',
        },
      },
      settings: {},
    });

    // Hero (IMPROVED with AI)
    sections.push({
      page_id: page.id,
      type: 'HERO',
      order: 1,
      visible: true,
      content: {
        title: aiContent.hero.title,
        subtitle: aiContent.hero.subtitle,
        description: aiContent.hero.description,
        primaryCTA: aiContent.hero.primaryCTA,
        secondaryCTA: aiContent.hero.secondaryCTA,
        backgroundImage: heroImageUrl,
        logo: logoUrl,
      },
      settings: {},
    });

    // Features (IMPROVED)
    if (aiContent.features) {
      const featureImagePromises = aiContent.features.items.slice(0, 3).map((feature: any) =>
        generateSectionImage({
          businessName: businessName || analysis.title,
          businessType: websiteType || analysis.detectedType,
          sectionType: 'FEATURES',
          description: feature.description,
          style: 'photorealistic',
        })
      );
      const featureImagesResults = await Promise.allSettled(featureImagePromises);
      const featureImagesData = processImageResults(featureImagesResults);
      const featureImages = featureImagesData.map(img => img.url);

      sections.push({
        page_id: page.id,
        type: 'FEATURES',
        order: 2,
        visible: true,
        content: {
          title: aiContent.features.title,
          subtitle: aiContent.features.subtitle,
          features: aiContent.features.items.map((item: any, idx: number) => ({
            ...item,
            image: featureImages[idx] || '',
          })),
        },
        settings: {},
      });
    }

    // CTA
    if (aiContent.cta) {
      sections.push({
        page_id: page.id,
        type: 'CTA',
        order: 3,
        visible: true,
        content: {
          title: aiContent.cta.title,
          description: aiContent.cta.description,
          primaryCTA: aiContent.cta.primaryCTA,
          secondaryCTA: aiContent.cta.secondaryCTA,
        },
        settings: {},
      });
    }

    // Footer
    sections.push({
      page_id: page.id,
      type: 'FOOTER',
      order: 99,
      visible: true,
      content: {
        companyName: businessName || analysis.title,
        tagline: analysis.description || aiContent.hero.subtitle,
        logo: logoUrl,
        links: analysis.pages.slice(0, 8).map(p => ({
          label: p.title,
          href: p.url.includes(existingUrl) ? p.url.replace(existingUrl, '') : p.url,
        })),
        social: [],
        copyright: `© ${new Date().getFullYear()} ${businessName || analysis.title}. All rights reserved.`,
      },
      settings: {},
    });

    // Insert all sections
    const { error: sectionsError } = await supabase.from('sections').insert(sections);

    if (sectionsError) {
      console.error('Error creating sections:', sectionsError);
      return NextResponse.json({ error: sectionsError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        websiteId: website.id,
        slug: uniqueSlug,
        analysis: {
          originalColors: analysis.colors,
          detectedType: analysis.detectedType,
          pagesFound: analysis.pages.length,
          contentExtracted: analysis.content.headings.length + analysis.content.paragraphs.length,
        },
      },
    });
  } catch (error) {
    console.error('Error improving website:', error);

    // Handle WebsiteAnalysisError with specific error codes
    if (error instanceof WebsiteAnalysisError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          type: 'website_analysis_error',
        },
        { status: 400 }
      );
    }

    // Handle generic errors
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
