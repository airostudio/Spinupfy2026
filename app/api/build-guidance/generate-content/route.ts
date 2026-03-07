/**
 * Generate Website Content API
 * Creates comprehensive, business-specific content for the entire website
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { AI_MODELS } from '@/lib/ai-provider';
import { getBusinessTypeById } from '@/lib/config/business-types';
import { getContentTemplateOrDefault } from '@/lib/config/content-templates';
import type { GeneratedContent } from '@/lib/types/business-variables.types';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Input validation limits
const MAX_BUSINESS_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_TAGLINE_LENGTH = 200;

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessName,
      businessType,
      description,
      tone = 'professional',
      tagline,
      usps,
      email,
      phone,
    } = body;

    // Input validation
    if (!businessName || !businessType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, businessType, description' },
        { status: 400 }
      );
    }

    // Sanitize and limit input lengths
    const sanitizedBusinessName = String(businessName).slice(0, MAX_BUSINESS_NAME_LENGTH);
    const sanitizedDescription = String(description).slice(0, MAX_DESCRIPTION_LENGTH);
    const sanitizedTagline = tagline ? String(tagline).slice(0, MAX_TAGLINE_LENGTH) : undefined;
    const sanitizedUsps = Array.isArray(usps) ? usps.slice(0, 10).map(u => String(u).slice(0, 100)) : [];

    const businessTypeConfig = getBusinessTypeById(businessType);
    const contentTemplate = getContentTemplateOrDefault(businessType);
    const toneDescription = getToneDescription(tone);

    // Generate comprehensive content
    const response = await openai.chat.completions.create({
      model: AI_MODELS.openai.text,
      messages: [
        {
          role: 'system',
          content: `You are an expert content strategist and copywriter specializing in ${businessTypeConfig?.label || businessType} businesses.

Your task is to generate compelling, conversion-optimized website content that:
- Matches the specified tone: ${toneDescription}
- Uses industry-specific language and terminology
- Creates emotional connection with the target audience
- Includes clear calls-to-action
- Is SEO-optimized with relevant keywords

IMPORTANT: Generate realistic, professional content that sounds authentic for this type of business.`,
        },
        {
          role: 'user',
          content: `Generate complete website content for:

Business Name: ${sanitizedBusinessName}
Business Type: ${businessTypeConfig?.label || businessType}
Description: ${sanitizedDescription}
${sanitizedTagline ? `Tagline: ${sanitizedTagline}` : ''}
${sanitizedUsps.length > 0 ? `Unique Selling Points: ${sanitizedUsps.join(', ')}` : ''}
${email ? `Contact Email: ${String(email).slice(0, 100)}` : ''}
${phone ? `Contact Phone: ${String(phone).slice(0, 20)}` : ''}

Tone: ${tone} - ${toneDescription}

Industry Keywords: ${contentTemplate.keywords.join(', ')}

Generate a JSON response with the following structure:
{
  "heroTitle": "Compelling headline (5-10 words)",
  "heroSubtitle": "Supporting tagline (8-15 words)",
  "heroDescription": "Brief value proposition (20-40 words)",
  "heroCTAPrimary": {
    "text": "Primary CTA button text",
    "href": "#contact"
  },
  "heroCTASecondary": {
    "text": "Secondary CTA text",
    "href": "#services"
  },
  "aboutTitle": "About section title",
  "aboutSubtitle": "About section subtitle",
  "aboutContent": "2-3 paragraphs describing the business (100-200 words total)",
  "aboutHighlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"],
  "servicesTitle": "Services section title",
  "servicesSubtitle": "Services section subtitle",
  "servicesIntro": "Brief intro to services (20-40 words)",
  "contactTitle": "Contact section title",
  "contactSubtitle": "Contact section subtitle",
  "contactIntro": "Encouraging message to get in touch (20-40 words)",
  "footerTagline": "Brief footer tagline (5-10 words)",
  "metaTitle": "SEO-optimized page title (50-60 characters)",
  "metaDescription": "SEO meta description (150-160 characters)",
  "metaKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "stats": {
    "yearsExperience": "X+",
    "clientsServed": "X+",
    "projectsCompleted": "X+",
    "satisfaction": "XX%"
  }
}

Make all content specific to this business, engaging, and conversion-focused.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    let generatedContent: Partial<GeneratedContent>;

    try {
      generatedContent = content ? JSON.parse(content) : {};
    } catch {
      console.warn('Failed to parse AI response, using defaults');
      generatedContent = {};
    }

    // Validate and fix any missing fields
    const validatedContent = validateAndFixContent(
      generatedContent,
      sanitizedBusinessName,
      businessType
    );

    return NextResponse.json({
      success: true,
      content: validatedContent,
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

function getToneDescription(tone: string): string {
  const descriptions: Record<string, string> = {
    professional: 'Polished, expert, trustworthy, clear and confident language that builds credibility',
    friendly: 'Warm, approachable, welcoming, conversational tone that feels personal and caring',
    casual: 'Relaxed, down-to-earth, relatable, easy-going language that feels natural',
    luxury: 'Sophisticated, exclusive, refined, elegant language that conveys premium quality',
    playful: 'Fun, energetic, creative, enthusiastic tone with personality and charm',
    authoritative: 'Confident, expert, industry-leading, commanding language that establishes authority',
  };
  return descriptions[tone] || descriptions.professional;
}

function getDefaultContent(businessName: string, businessType: string): Partial<GeneratedContent> {
  return {
    heroTitle: `Welcome to ${businessName}`,
    heroSubtitle: 'Professional services you can trust',
    heroDescription: 'We provide exceptional services tailored to your needs.',
    heroCTAPrimary: { text: 'Get Started', href: '#contact' },
    heroCTASecondary: { text: 'Learn More', href: '#about' },
    aboutTitle: 'About Us',
    aboutContent: `${businessName} is dedicated to providing the best ${businessType} services.`,
    servicesTitle: 'Our Services',
    contactTitle: 'Contact Us',
    metaTitle: `${businessName} | ${businessType}`,
    metaDescription: `${businessName} offers professional ${businessType} services. Contact us today.`,
    metaKeywords: [businessType, businessName.toLowerCase(), 'professional', 'services'],
  };
}

function validateAndFixContent(
  content: Partial<GeneratedContent>,
  businessName: string,
  businessType: string
): GeneratedContent {
  const defaults = getDefaultContent(businessName, businessType);

  return {
    heroTitle: content.heroTitle || defaults.heroTitle || '',
    heroSubtitle: content.heroSubtitle || defaults.heroSubtitle || '',
    heroDescription: content.heroDescription || defaults.heroDescription || '',
    heroCTAPrimary: content.heroCTAPrimary || defaults.heroCTAPrimary || { text: 'Get Started', href: '#contact' },
    heroCTASecondary: content.heroCTASecondary || defaults.heroCTASecondary,
    aboutTitle: content.aboutTitle || defaults.aboutTitle || 'About Us',
    aboutSubtitle: content.aboutSubtitle,
    aboutContent: content.aboutContent || defaults.aboutContent || '',
    aboutHighlights: content.aboutHighlights,
    servicesTitle: content.servicesTitle || defaults.servicesTitle || 'Our Services',
    servicesSubtitle: content.servicesSubtitle,
    servicesIntro: content.servicesIntro,
    contactTitle: content.contactTitle || defaults.contactTitle || 'Contact Us',
    contactSubtitle: content.contactSubtitle,
    contactIntro: content.contactIntro,
    footerTagline: content.footerTagline,
    metaTitle: content.metaTitle || defaults.metaTitle || '',
    metaDescription: content.metaDescription || defaults.metaDescription || '',
    metaKeywords: content.metaKeywords || defaults.metaKeywords || [],
    stats: content.stats,
  };
}
