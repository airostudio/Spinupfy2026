/**
 * Page Reproducer
 * Generates improved page content while preserving the original structure and feel
 */

import OpenAI from 'openai';
import { AI_MODELS } from './ai-provider';
import { CrawledPage, PageSection, NavigationItem, DeepCrawlResult } from './deep-website-crawler';
import { getBusinessTypeById } from './config/business-types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ReproducedPage {
  title: string;
  slug: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  isHomepage: boolean;
  sections: ReproducedSection[];
  originalImages: string[];
}

export interface ReproducedSection {
  type: string;
  order: number;
  visible: boolean;
  content: Record<string, any>;
  settings: Record<string, any>;
}

export interface ReproductionContext {
  businessName: string;
  businessType: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo?: string;
  navigation: NavigationItem[];
}

export interface ReproductionOptions {
  maxPages?: number;
  maxTimeMs?: number;
  delayMs?: number;
  prioritizeHomepage?: boolean;
}

/**
 * Reproduce all pages from a deep crawl result
 * Includes throttling to prevent timeouts on serverless functions
 */
export async function reproduceWebsitePages(
  crawlResult: DeepCrawlResult,
  context: ReproductionContext,
  onProgressOrOptions?: ((message: string, current: number, total: number) => void) | ReproductionOptions,
  optionsArg?: ReproductionOptions
): Promise<ReproducedPage[]> {
  // Handle both old callback-only signature and new options signature
  const onProgress = typeof onProgressOrOptions === 'function' ? onProgressOrOptions : undefined;
  const options = typeof onProgressOrOptions === 'object' ? onProgressOrOptions : optionsArg;

  const maxPages = options?.maxPages ?? 8; // Limit pages to reproduce to prevent timeout
  const maxTimeMs = options?.maxTimeMs ?? 90000; // 90 seconds max for reproduction
  const delayMs = options?.delayMs ?? 300; // Reduced from 500ms
  const prioritizeHomepage = options?.prioritizeHomepage ?? true;

  const reproducedPages: ReproducedPage[] = [];
  const startTime = Date.now();

  // Sort pages: homepage first, then by level (depth), to prioritize important pages
  let pagesToProcess = [...crawlResult.pages];
  if (prioritizeHomepage) {
    pagesToProcess.sort((a, b) => {
      // Homepage first
      if (a.level === 0 && b.level !== 0) return -1;
      if (b.level === 0 && a.level !== 0) return 1;
      // Then by level (shallower pages first)
      return a.level - b.level;
    });
  }

  // Limit pages to process
  pagesToProcess = pagesToProcess.slice(0, maxPages);
  const totalPages = pagesToProcess.length;

  console.log(`Reproducing ${totalPages} pages (limited from ${crawlResult.pages.length})`);

  for (let i = 0; i < pagesToProcess.length; i++) {
    // Check if we've exceeded the time limit
    if (Date.now() - startTime > maxTimeMs) {
      console.log(`Reproduction time limit reached (${maxTimeMs}ms). Stopping with ${reproducedPages.length} pages.`);
      break;
    }

    const page = pagesToProcess[i];

    if (onProgress) {
      onProgress(`Reproducing: ${page.path}`, i + 1, totalPages);
    }

    try {
      const reproduced = await reproducePage(page, context, page.level === 0);
      reproducedPages.push(reproduced);

      // Reduced delay to avoid rate limiting while staying within timeout
      if (i < totalPages - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Error reproducing page ${page.path}:`, error);
      // Continue with other pages
    }
  }

  console.log(`Reproduction completed in ${Date.now() - startTime}ms. Reproduced ${reproducedPages.length} pages.`);
  return reproducedPages;
}

/**
 * Reproduce a single page with improved content
 */
async function reproducePage(
  page: CrawledPage,
  context: ReproductionContext,
  isHomepage: boolean
): Promise<ReproducedPage> {
  const businessTypeConfig = getBusinessTypeById(context.businessType);

  // Generate improved content using AI
  const improvedContent = await generateImprovedPageContent(page, context, isHomepage);

  // Map sections with original images preserved
  const sections = mapSectionsFromCrawledPage(page, improvedContent, context, isHomepage);

  const slug = isHomepage ? 'home' : pathToSlug(page.path);

  return {
    title: improvedContent.title || page.title,
    slug,
    path: isHomepage ? '/' : page.path,
    metaTitle: improvedContent.metaTitle || page.content.metaTitle || page.title,
    metaDescription: improvedContent.metaDescription || page.content.metaDescription || '',
    isHomepage,
    sections,
    originalImages: page.images.all,
  };
}

/**
 * Generate improved content for a page while preserving its structure
 */
async function generateImprovedPageContent(
  page: CrawledPage,
  context: ReproductionContext,
  isHomepage: boolean
): Promise<{
  title: string;
  metaTitle: string;
  metaDescription: string;
  hero?: {
    title: string;
    subtitle: string;
    description?: string;
    primaryCTA?: { text: string; href: string };
    secondaryCTA?: { text: string; href: string };
  };
  sections: Array<{
    type: string;
    title?: string;
    subtitle?: string;
    content?: string;
    items?: any[];
  }>;
}> {
  const businessTypeConfig = getBusinessTypeById(context.businessType);

  // Build context about the original page
  const originalContent = {
    headings: page.content.headings.map(h => h.text).slice(0, 10),
    paragraphs: page.content.paragraphs.slice(0, 10),
    sections: page.content.sections.map(s => ({
      type: s.type,
      title: s.title,
      content: s.content.substring(0, 300),
    })),
  };

  const prompt = `You are an expert web designer improving an existing website page while maintaining its original feel and purpose.

ORIGINAL PAGE ANALYSIS:
- Page Title: ${page.title}
- Page Path: ${page.path}
- Is Homepage: ${isHomepage}
- Business Type: ${context.businessType}
- Business Name: ${context.businessName}

ORIGINAL CONTENT (to improve, not replace completely):
Headings: ${originalContent.headings.join(', ')}
Key Paragraphs: ${originalContent.paragraphs.slice(0, 3).join('\n')}

Original Sections Found:
${originalContent.sections.map(s => `- ${s.type}: ${s.title || 'No title'}`).join('\n')}

DESIGN CONTEXT:
- Industry: ${businessTypeConfig?.label || context.businessType}
- Recommended style: ${businessTypeConfig?.designSystem?.style.aesthetic || 'modern professional'}

TASK:
Create improved, polished content for this page that:
1. PRESERVES the original page structure and purpose
2. IMPROVES the copywriting to be more compelling and professional
3. MAINTAINS the same type of sections (hero, features, about, etc.)
4. Uses the business name "${context.businessName}" appropriately
5. Creates SEO-optimized meta tags

${isHomepage ? `
HOMEPAGE REQUIREMENTS:
- Create a compelling hero section with main headline and CTA
- Include sections that showcase the business effectively
- Ensure navigation items link to: ${context.navigation.map(n => n.label).join(', ')}
` : `
INNER PAGE REQUIREMENTS:
- The content should focus on: ${page.title}
- Create content specific to this page's purpose
- Include appropriate CTAs linking back to contact or main pages
`}

Return ONLY valid JSON (no markdown, no code blocks) in this structure:
{
  "title": "Improved page title",
  "metaTitle": "SEO title (50-60 chars)",
  "metaDescription": "SEO description (150-160 chars)",
  "hero": {
    "title": "Main headline",
    "subtitle": "Supporting tagline",
    "description": "Optional longer description",
    "primaryCTA": { "text": "CTA text", "href": "/contact" },
    "secondaryCTA": { "text": "Secondary CTA", "href": "/about" }
  },
  "sections": [
    {
      "type": "FEATURES|ABOUT|SERVICES|TESTIMONIALS|CTA|CONTENT|GALLERY|CONTACT",
      "title": "Section title",
      "subtitle": "Section subtitle",
      "content": "Main content text if applicable",
      "items": [
        { "title": "Item title", "description": "Item description", "icon": "emoji or icon name" }
      ]
    }
  ]
}

Generate high-quality, professional content that improves upon the original while keeping its essence.`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.openai.text,
      messages: [
        {
          role: 'system',
          content: 'You are a professional web content creator. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Clean and parse JSON with robust handling
    let cleanContent = content
      .replace(/```(?:json)?\s*/gi, '') // Remove markdown code block markers
      .replace(/^\s+|\s+$/g, '')         // Trim whitespace
      .replace(/[\x00-\x1F\x7F]/g, ' '); // Remove control characters

    // Try to extract JSON object if there's extra text
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }

    // Validate it looks like JSON before parsing
    if (!cleanContent.startsWith('{') || !cleanContent.endsWith('}')) {
      console.error('Invalid JSON structure:', cleanContent.substring(0, 100));
      throw new Error('Invalid JSON structure in response');
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Error generating improved content:', error);

    // Return basic content on failure
    return {
      title: page.title,
      metaTitle: page.title,
      metaDescription: page.content.metaDescription || '',
      hero: isHomepage ? {
        title: context.businessName,
        subtitle: page.content.headings[0]?.text || 'Welcome',
        primaryCTA: { text: 'Get Started', href: '/contact' },
      } : undefined,
      sections: [],
    };
  }
}

/**
 * Map crawled page sections to reproducible sections
 */
function mapSectionsFromCrawledPage(
  page: CrawledPage,
  improvedContent: any,
  context: ReproductionContext,
  isHomepage: boolean
): ReproducedSection[] {
  const sections: ReproducedSection[] = [];
  let order = 0;

  // Add header section
  sections.push({
    type: 'HEADER',
    order: order++,
    visible: true,
    content: {
      logo: context.logo,
      companyName: context.businessName,
      navigation: context.navigation.map(nav => ({
        label: nav.label,
        href: nav.href.startsWith('/') ? nav.href : `/${pathToSlug(nav.href)}`,
      })),
      ctaButton: {
        text: 'Contact Us',
        href: '/contact',
      },
    },
    settings: {},
  });

  // Add hero section
  if (improvedContent.hero) {
    sections.push({
      type: 'HERO',
      order: order++,
      visible: true,
      content: {
        title: improvedContent.hero.title,
        subtitle: improvedContent.hero.subtitle,
        description: improvedContent.hero.description,
        primaryCTA: improvedContent.hero.primaryCTA,
        secondaryCTA: improvedContent.hero.secondaryCTA,
        backgroundImage: page.images.hero || page.images.backgrounds[0],
        logo: context.logo,
      },
      settings: {},
    });
  }

  // Map AI-generated sections
  if (improvedContent.sections && Array.isArray(improvedContent.sections)) {
    for (const section of improvedContent.sections) {
      const mappedSection = mapSection(section, page, order++);
      if (mappedSection) {
        sections.push(mappedSection);
      }
    }
  }

  // Map original crawled sections if no AI sections
  if ((!improvedContent.sections || improvedContent.sections.length === 0) && page.content.sections.length > 0) {
    for (const originalSection of page.content.sections) {
      const mappedSection = mapOriginalSection(originalSection, page, order++);
      if (mappedSection) {
        sections.push(mappedSection);
      }
    }
  }

  // Add footer section
  sections.push({
    type: 'FOOTER',
    order: 99,
    visible: true,
    content: {
      companyName: context.businessName,
      logo: context.logo,
      tagline: improvedContent.hero?.subtitle || page.content.headings[0]?.text || '',
      links: context.navigation.map(nav => ({
        label: nav.label,
        href: nav.href.startsWith('/') ? nav.href : `/${pathToSlug(nav.href)}`,
      })),
      social: [],
      copyright: `© ${new Date().getFullYear()} ${context.businessName}. All rights reserved.`,
    },
    settings: {},
  });

  return sections;
}

/**
 * Map an AI-generated section to a reproducible section
 */
function mapSection(section: any, page: CrawledPage, order: number): ReproducedSection | null {
  const type = (section.type || 'CONTENT').toUpperCase();

  switch (type) {
    case 'FEATURES':
      return {
        type: 'FEATURES',
        order,
        visible: true,
        content: {
          title: section.title,
          subtitle: section.subtitle,
          features: section.items?.map((item: any, idx: number) => ({
            title: item.title,
            description: item.description,
            icon: item.icon || '✓',
            image: page.images.content[idx] || '',
          })) || [],
        },
        settings: {},
      };

    case 'SERVICES':
      return {
        type: 'SERVICES',
        order,
        visible: true,
        content: {
          title: section.title,
          subtitle: section.subtitle,
          description: section.content,
          services: section.items?.map((item: any, idx: number) => ({
            title: item.title,
            description: item.description,
            icon: item.icon || '⚡',
            image: page.images.content[idx] || '',
          })) || [],
        },
        settings: {},
      };

    case 'ABOUT':
      return {
        type: 'ABOUT',
        order,
        visible: true,
        content: {
          title: section.title,
          subtitle: section.subtitle,
          content: section.content,
          overview: section.content?.substring(0, 200),
          image: page.images.content[0] || page.images.hero,
          highlights: section.items?.map((item: any) => item.title || item) || [],
        },
        settings: {},
      };

    case 'TESTIMONIALS':
      return {
        type: 'TESTIMONIALS',
        order,
        visible: true,
        content: {
          title: section.title,
          subtitle: section.subtitle,
          testimonials: section.items?.map((item: any) => ({
            content: item.description || item.quote || item.content,
            name: item.title || item.name || item.author || 'Happy Customer',
            role: item.role || 'Customer',
            rating: 5,
          })) || [],
        },
        settings: {},
      };

    case 'GALLERY':
    case 'PORTFOLIO':
      return {
        type: 'GALLERY',
        order,
        visible: true,
        content: {
          title: section.title,
          subtitle: section.subtitle,
          images: page.images.gallery.map((url, idx) => ({
            url,
            alt: `Gallery image ${idx + 1}`,
            caption: '',
          })),
        },
        settings: {},
      };

    case 'CTA':
      return {
        type: 'CTA',
        order,
        visible: true,
        content: {
          title: section.title,
          description: section.content || section.subtitle,
          primaryCTA: section.items?.[0] ? {
            text: section.items[0].title || 'Get Started',
            href: '/contact',
          } : { text: 'Contact Us', href: '/contact' },
        },
        settings: {},
      };

    case 'CONTACT':
      return {
        type: 'CONTACT',
        order,
        visible: true,
        content: {
          title: section.title || 'Contact Us',
          subtitle: section.subtitle,
          showForm: true,
          showMap: false,
        },
        settings: {},
      };

    case 'CONTENT':
    default:
      return {
        type: 'CONTENT',
        order,
        visible: true,
        content: {
          title: section.title,
          subtitle: section.subtitle,
          content: section.content,
          image: page.images.content[0],
          imagePosition: 'right',
        },
        settings: {},
      };
  }
}

/**
 * Map an original crawled section to a reproducible section
 */
function mapOriginalSection(section: PageSection, page: CrawledPage, order: number): ReproducedSection | null {
  const typeMap: Record<string, string> = {
    hero: 'HERO',
    features: 'FEATURES',
    services: 'SERVICES',
    about: 'ABOUT',
    testimonials: 'TESTIMONIALS',
    gallery: 'GALLERY',
    contact: 'CONTACT',
    cta: 'CTA',
    content: 'CONTENT',
    unknown: 'CONTENT',
  };

  const type = typeMap[section.type] || 'CONTENT';

  return {
    type,
    order,
    visible: true,
    content: {
      title: section.title,
      subtitle: section.subtitle,
      content: section.content.substring(0, 500),
      images: section.images,
    },
    settings: {},
  };
}

/**
 * Convert a path to a slug
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

/**
 * Generate navigation structure from crawled pages
 */
export function generateNavigationFromPages(
  pages: CrawledPage[],
  originalNav: NavigationItem[]
): NavigationItem[] {
  // If we have original navigation, use it but update paths
  if (originalNav.length > 0) {
    return originalNav.map(item => ({
      label: item.label,
      href: item.href.startsWith('/') ? item.href : `/${pathToSlug(item.href)}`,
      children: item.children?.map(child => ({
        label: child.label,
        href: child.href.startsWith('/') ? child.href : `/${pathToSlug(child.href)}`,
      })),
    }));
  }

  // Otherwise, generate from top-level pages
  const navItems: NavigationItem[] = [];

  // Filter to only include level 0 and 1 pages
  const topPages = pages.filter(p => p.level <= 1 && p.path !== '/');

  for (const page of topPages.slice(0, 6)) {
    navItems.push({
      label: page.title.length > 20 ? page.title.substring(0, 20) + '...' : page.title,
      href: page.path.startsWith('/') ? page.path : `/${pathToSlug(page.path)}`,
    });
  }

  return navItems;
}
