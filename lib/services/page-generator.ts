/**
 * Page Generator Service
 * Generates full page content with sections using AI
 */

import OpenAI from 'openai';
import { AI_MODELS } from '../ai-provider';
import { ExtractedLink } from '../utils/link-extractor';
import { Section } from '../store/editor.store';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PageGenerationContext {
  websiteName: string;
  websiteType: string;
  brandName?: string;
  link: ExtractedLink;
  contentTone?: string;
  templateId?: string;
}

export interface GeneratedPageContent {
  title: string;
  slug: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  sections: Omit<Section, 'id'>[];
}

/**
 * Generates comprehensive page content using AI
 */
export async function generatePageContent(
  context: PageGenerationContext
): Promise<GeneratedPageContent> {
  const { websiteName, websiteType, brandName, link, contentTone = 'professional', templateId } = context;

  const toneGuidance = contentTone ? `\n- Content Tone: ${contentTone} (match this tone throughout all content)` : '';
  const templateGuidance = templateId ? `\n- Template: ${templateId} (follow this business template style)` : '';

  const prompt = `You are an expert web content creator. Generate a complete, professional website page.

Context:
- Website Name: ${websiteName}
- Business Type: ${websiteType}
- Brand Name: ${brandName || websiteName}
- Page Purpose: ${link.text || link.slug}
- Additional Context: ${link.context}
- Source: Link from ${link.sourceSection} section${toneGuidance}${templateGuidance}

Task: Create a full page with multiple sections that would naturally fit this link. The page should be comprehensive, engaging, and relevant to the business type.

Requirements:
1. Generate 3-5 sections for this page (Hero, Content sections, CTA)
2. Each section should have complete, realistic content (not placeholders)
3. Use appropriate section types: HERO, FEATURES, CONTENT, CTA, TESTIMONIALS, etc.
4. Ensure content is SEO-optimized and professional
5. Include clear CTAs that guide users
6. Make it specific to the business type and page purpose

Return ONLY valid JSON (no markdown, no code blocks) in this exact structure:
{
  "title": "Page Title",
  "metaTitle": "SEO Title (max 60 chars)",
  "metaDescription": "SEO description (max 160 chars)",
  "sections": [
    {
      "type": "HERO",
      "content": {
        "title": "...",
        "subtitle": "...",
        "description": "...",
        "primaryCTA": { "text": "...", "href": "..." },
        "secondaryCTA": { "text": "...", "href": "..." }
      },
      "order": 0,
      "visible": true
    },
    {
      "type": "FEATURES",
      "content": {
        "title": "...",
        "subtitle": "...",
        "features": [
          {
            "icon": "CheckCircle",
            "title": "...",
            "description": "..."
          }
        ]
      },
      "order": 1,
      "visible": true
    },
    {
      "type": "CTA",
      "content": {
        "title": "...",
        "description": "...",
        "primaryCTA": { "text": "...", "href": "/contact" }
      },
      "order": 2,
      "visible": true
    }
  ]
}

Available section types and their content structures:

HERO:
{
  "title": string,
  "subtitle": string,
  "description": string,
  "primaryCTA": { "text": string, "href": string },
  "secondaryCTA": { "text": string, "href": string } (optional)
}

FEATURES:
{
  "title": string,
  "subtitle": string,
  "features": [
    {
      "icon": string (lucide-react icon name like "CheckCircle", "Star", "Zap", "Shield", etc.),
      "title": string,
      "description": string
    }
  ]
}

CONTENT:
{
  "title": string,
  "subtitle": string (optional),
  "content": string (rich text/HTML),
  "image": string (optional),
  "imagePosition": "left" | "right" (optional)
}

TESTIMONIALS:
{
  "title": string,
  "subtitle": string,
  "testimonials": [
    {
      "quote": string,
      "author": string,
      "role": string,
      "company": string (optional),
      "avatar": string (optional)
    }
  ]
}

CTA:
{
  "title": string,
  "description": string,
  "primaryCTA": { "text": string, "href": string },
  "secondaryCTA": { "text": string, "href": string } (optional)
}

PRICING:
{
  "title": string,
  "subtitle": string,
  "plans": [
    {
      "name": string,
      "price": string,
      "period": string,
      "features": string[],
      "cta": { "text": string, "href": string },
      "highlighted": boolean (optional)
    }
  ]
}

FAQ:
{
  "title": string,
  "subtitle": string (optional),
  "faqs": [
    {
      "question": string,
      "answer": string
    }
  ]
}

Generate content that is:
- Professional and polished
- Specific to ${websiteType}
- Relevant to "${link.text || link.slug}"
- Complete (no "Lorem ipsum" or placeholders)
- Ready to publish`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.openai.text,
      messages: [
        {
          role: 'system',
          content: 'You are a professional web content creator. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the JSON response
    let pageData: any;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      pageData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    // Construct the final page content
    const result: GeneratedPageContent = {
      title: pageData.title || link.text || link.slug,
      slug: link.slug,
      path: link.href.startsWith('/') ? link.href : `/${link.slug}`,
      metaTitle: pageData.metaTitle || pageData.title,
      metaDescription: pageData.metaDescription || '',
      sections: pageData.sections || [],
    };

    return result;
  } catch (error) {
    console.error('Error generating page content:', error);
    throw error;
  }
}

export interface MultiPageGenerationOptions {
  maxPages?: number;
  maxTimeMs?: number;
  delayMs?: number;
  onProgress?: (current: number, total: number, slug: string) => void;
}

/**
 * Generates content for multiple pages in batch
 * Includes throttling to prevent timeouts on serverless functions
 */
export async function generateMultiplePages(
  links: ExtractedLink[],
  context: Omit<PageGenerationContext, 'link'>,
  onProgressOrOptions?: ((current: number, total: number, slug: string) => void) | MultiPageGenerationOptions,
  optionsArg?: MultiPageGenerationOptions
): Promise<GeneratedPageContent[]> {
  // Handle both old callback-only signature and new options signature
  const onProgress = typeof onProgressOrOptions === 'function' ? onProgressOrOptions : onProgressOrOptions?.onProgress;
  const options = typeof onProgressOrOptions === 'object' ? onProgressOrOptions : optionsArg;

  const maxPages = options?.maxPages ?? 10; // Default limit to prevent timeout
  const maxTimeMs = options?.maxTimeMs ?? 180000; // 3 minutes max
  const delayMs = options?.delayMs ?? 500; // Reduced from 1000ms

  const results: GeneratedPageContent[] = [];
  const startTime = Date.now();

  // Limit pages to process
  const linksToProcess = links.slice(0, maxPages);
  const totalPages = linksToProcess.length;

  console.log(`Generating ${totalPages} pages (limited from ${links.length})`);

  for (let i = 0; i < linksToProcess.length; i++) {
    // Check if we've exceeded the time limit
    if (Date.now() - startTime > maxTimeMs) {
      console.log(`Page generation time limit reached (${maxTimeMs}ms). Stopping with ${results.length} pages.`);
      break;
    }

    const link = linksToProcess[i];

    if (onProgress) {
      onProgress(i + 1, totalPages, link.slug);
    }

    try {
      const pageContent = await generatePageContent({
        ...context,
        link,
      });
      results.push(pageContent);

      // Reduced delay to avoid rate limiting while staying within timeout
      if (i < totalPages - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Failed to generate content for ${link.slug}:`, error);
      // Continue with other pages even if one fails
    }
  }

  console.log(`Page generation completed in ${Date.now() - startTime}ms. Generated ${results.length} pages.`);
  return results;
}
