/**
 * Generate AI Image API
 * Uses DALL-E 3 to generate ultra-realistic images for websites
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { AI_MODELS } from '@/lib/ai-provider';
import { getBusinessTypeById } from '@/lib/config/business-types';
import { findBestTemplate, getTemplateById } from '@/lib/config/business-templates';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Maximum duration for image generation (2 minutes for DALL-E 3)
export const maxDuration = 120;

// Input validation limits
const MAX_BUSINESS_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const ALLOWED_SECTIONS = ['hero', 'about', 'services', 'team', 'gallery', 'contact'];
const ALLOWED_STYLES = ['ultra-realistic', 'photorealistic', 'lifestyle', 'product', 'environmental'];

// Ultra-realistic base prompts by section type
const ULTRA_REALISTIC_PROMPTS: Record<string, string> = {
  hero: 'Create an ultra-realistic, professional photograph suitable for a website hero banner. Shot with a high-end DSLR camera, natural lighting, 8K resolution quality.',
  about: 'Create an ultra-realistic, warm and authentic photograph showing human connection and company culture. Shot with professional photography equipment, natural expressions, genuine moments.',
  services: 'Create an ultra-realistic, detailed photograph showing professional services or craftsmanship. Macro detail visible, professional lighting, showcasing expertise and quality.',
  team: 'Create an ultra-realistic, professional team or workplace photograph. Natural poses, genuine expressions, modern office or workspace environment, professional lighting.',
  gallery: 'Create an ultra-realistic, portfolio-quality photograph. Magazine-worthy composition, perfect lighting, showcasing the best of the business.',
  contact: 'Create an ultra-realistic, inviting photograph of a professional workspace or customer interaction. Warm and welcoming atmosphere, trust-building imagery.',
};

// Style modifiers for ultra-realistic output
const STYLE_MODIFIERS: Record<string, string> = {
  'ultra-realistic': 'Hyper-realistic photography, indistinguishable from a real photograph, shot on Sony A7R IV, 85mm lens, natural lighting, shallow depth of field',
  'photorealistic': 'Professional photography, high resolution, studio quality, perfect exposure and composition',
  'lifestyle': 'Candid lifestyle photography, authentic moments, natural light, real people in real situations',
  'product': 'Commercial product photography, clean background, perfect lighting, attention to detail and texture',
  'environmental': 'Environmental portrait or interior photography, context and atmosphere, architectural detail, ambient lighting',
};

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
      section = 'hero',
      description,
      style = 'ultra-realistic',
      colorTheme,
      customPrompt,
      // Image context for unknown/custom business types
      imageContext,
    } = body;

    if (!businessName) {
      return NextResponse.json(
        { error: 'Missing required field: businessName' },
        { status: 400 }
      );
    }

    // Validate and sanitize inputs
    const sanitizedBusinessName = String(businessName).slice(0, MAX_BUSINESS_NAME_LENGTH);
    const sanitizedDescription = description ? String(description).slice(0, MAX_DESCRIPTION_LENGTH) : undefined;
    const validSection = ALLOWED_SECTIONS.includes(section) ? section : 'hero';
    const validStyle = ALLOWED_STYLES.includes(style) ? style : 'ultra-realistic';

    // Get business type configuration
    const businessTypeConfig = getBusinessTypeById(businessType);
    const businessLabel = businessTypeConfig?.label || String(businessType).replace(/-/g, ' ').slice(0, 50);

    // Try to find a matching template for more specific image prompts
    const template = getTemplateById(businessType) || findBestTemplate(businessType);

    // Build the ultra-realistic prompt
    const prompt = buildUltraRealisticPrompt({
      businessName: sanitizedBusinessName,
      businessLabel,
      section: validSection,
      style: validStyle,
      description: sanitizedDescription,
      colorTheme,
      customPrompt,
      template,
      keywords: businessTypeConfig?.keywords || [],
      imageContext,
    });

    console.log('Generating image with prompt:', prompt);

    // Generate image using DALL-E 3
    const response = await openai.images.generate({
      model: AI_MODELS.openai.image,
      prompt,
      n: 1,
      size: validSection === 'hero' ? '1792x1024' : '1024x1024',
      quality: 'hd', // Use HD quality for ultra-realistic images
      style: 'natural', // Natural style for photorealistic results
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image generated');
    }

    const imageUrl = response.data[0]?.url;
    const revisedPrompt = response.data[0]?.revised_prompt;

    return NextResponse.json({
      success: true,
      image: {
        url: imageUrl,
        prompt: revisedPrompt || prompt,
        section: validSection,
        style: validStyle,
      },
    });
  } catch (error) {
    console.error('AI image generation error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('content_policy')) {
        return NextResponse.json(
          { error: 'Image generation was blocked by content policy. Please try different parameters.' },
          { status: 400 }
        );
      }
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// Image context for clarified custom business types
interface ImageContextOptions {
  visualTheme?: 'industrial' | 'corporate' | 'lifestyle' | 'nature' | 'tech' | 'creative' | 'medical' | 'service' | 'custom';
  mainSubjects?: string[];
  mood?: 'professional' | 'energetic' | 'warm' | 'calm' | 'modern' | 'traditional' | 'luxury';
  customDescription?: string;
}

interface PromptOptions {
  businessName: string;
  businessLabel: string;
  section: string;
  style: string;
  description?: string;
  colorTheme?: { primary?: string; accent?: string };
  customPrompt?: string;
  template?: {
    imageSubjects?: Array<{
      section: string;
      prompt: string;
      style: string;
    }>;
    colorMood?: string;
    tone?: string;
  };
  keywords: string[];
  imageContext?: ImageContextOptions;
}

// Visual theme to prompt mappings for image context
const THEME_PROMPTS: Record<string, { base: string; subjects: string[]; mood: string }> = {
  industrial: {
    base: 'Industrial and logistics operations, large-scale commercial environment',
    subjects: ['container ships at port', 'cargo trucks on highway', 'warehouse operations', 'shipping containers', 'freight logistics', 'forklift operations', 'loading docks', 'supply chain'],
    mood: 'professional, efficient, large-scale operations'
  },
  corporate: {
    base: 'Professional corporate environment, modern business setting',
    subjects: ['office meetings', 'business professionals', 'conference rooms', 'modern office interiors', 'team collaboration', 'executive portraits'],
    mood: 'professional, trustworthy, corporate excellence'
  },
  lifestyle: {
    base: 'Authentic lifestyle photography, real people in genuine moments',
    subjects: ['happy customers', 'people using products', 'family moments', 'social interactions', 'daily life scenes'],
    mood: 'warm, authentic, relatable'
  },
  nature: {
    base: 'Natural outdoor environments, eco-friendly and sustainable',
    subjects: ['natural landscapes', 'outdoor activities', 'gardens and greenery', 'environmental scenes', 'sustainable practices'],
    mood: 'fresh, natural, environmentally conscious'
  },
  tech: {
    base: 'Modern technology and digital innovation',
    subjects: ['software interfaces', 'digital devices', 'data visualization', 'innovation labs', 'tech workspaces', 'automation systems'],
    mood: 'innovative, modern, cutting-edge'
  },
  creative: {
    base: 'Creative and artistic environment',
    subjects: ['design work', 'creative spaces', 'artistic projects', 'brainstorming sessions', 'colorful displays'],
    mood: 'creative, vibrant, inspiring'
  },
  medical: {
    base: 'Healthcare and medical environment',
    subjects: ['healthcare providers', 'medical equipment', 'clinical settings', 'patient care', 'wellness facilities'],
    mood: 'trustworthy, caring, professional'
  },
  service: {
    base: 'Service industry and hands-on work',
    subjects: ['workers providing services', 'customer interactions', 'craftsmanship', 'professional tools', 'satisfied customers'],
    mood: 'reliable, professional, customer-focused'
  },
};

// Mood to photography style mappings
const MOOD_STYLES: Record<string, string> = {
  professional: 'clean corporate photography, professional lighting, sharp focus, neutral tones',
  energetic: 'dynamic action photography, vibrant colors, movement and energy, exciting composition',
  warm: 'warm golden tones, soft lighting, inviting atmosphere, friendly and approachable',
  calm: 'serene and peaceful, soft pastel tones, gentle lighting, relaxing atmosphere',
  modern: 'contemporary minimalist style, clean lines, sleek design, modern aesthetics',
  traditional: 'classic photography style, timeless composition, established and trustworthy feel',
  luxury: 'high-end premium photography, elegant lighting, luxurious textures, exclusive atmosphere',
};

/**
 * Build a prompt from image context gathered through the clarification modal
 */
function buildImageContextPrompt(
  businessName: string,
  section: string,
  description: string | undefined,
  imageContext: ImageContextOptions
): string {
  // If user provided a custom description, use it directly
  if (imageContext.customDescription) {
    let prompt = `For "${businessName}" business: ${imageContext.customDescription}`;
    prompt += '. Ultra-realistic professional photography, shot on high-end camera, perfect exposure, natural lighting, 8K resolution quality.';
    prompt += ' CRITICAL: NO TEXT, NO WORDS, NO LETTERS, NO SIGNAGE, NO LOGOS, NO WATERMARKS. If text must appear, use ONLY proper English words, NEVER gibberish. NO CAMERAS or photography equipment (unless business is specifically photography/videography). Image must be strictly relevant to the business only. Professional website quality.';
    return prompt;
  }

  // Build prompt from visual theme, mood, and subjects
  const theme = imageContext.visualTheme && THEME_PROMPTS[imageContext.visualTheme]
    ? THEME_PROMPTS[imageContext.visualTheme]
    : THEME_PROMPTS.corporate;

  const moodStyle = imageContext.mood && MOOD_STYLES[imageContext.mood]
    ? MOOD_STYLES[imageContext.mood]
    : MOOD_STYLES.professional;

  // Select subjects - use user-selected subjects or default to theme subjects
  const subjects = imageContext.mainSubjects && imageContext.mainSubjects.length > 0
    ? imageContext.mainSubjects
    : theme.subjects.slice(0, 3);

  // Build the prompt
  let prompt = `Create an ultra-realistic photograph for "${businessName}" business.`;
  prompt += ` Theme: ${theme.base}.`;
  prompt += ` Featuring: ${subjects.join(', ')}.`;
  prompt += ` Style: ${moodStyle}.`;
  prompt += ` Mood: ${theme.mood}.`;

  // Add section-specific guidance
  if (section === 'hero') {
    prompt += ' This is for a website hero banner - make it wide-format, impactful, and attention-grabbing with space for text overlay.';
  } else if (section === 'about') {
    prompt += ' This is for an about section - show the human side, authenticity, and company values.';
  } else if (section === 'services') {
    prompt += ' This is for a services section - showcase professional expertise and quality of work.';
  }

  // Add business description context if available
  if (description) {
    prompt += ` Business context: ${description.slice(0, 200)}.`;
  }

  // Add quality and safety modifiers
  prompt += ' Ultra-realistic photography, shot on professional Sony A7R IV, 85mm lens, perfect exposure, natural lighting, high dynamic range, 8K resolution.';
  prompt += ' CRITICAL: NO TEXT, NO WORDS, NO LETTERS, NO SIGNAGE, NO LOGOS, NO WATERMARKS. If text must appear, use ONLY proper English words, NEVER gibberish. NO CAMERAS or photography equipment (unless business is specifically photography/videography). Image must be strictly relevant to the business only. Professional quality suitable for business website.';

  return prompt;
}

function buildUltraRealisticPrompt(options: PromptOptions): string {
  const {
    businessName,
    businessLabel,
    section,
    style,
    description,
    colorTheme,
    customPrompt,
    template,
    keywords,
    imageContext,
  } = options;

  // If we have imageContext from clarification modal, use it to build a targeted prompt
  if (imageContext && (imageContext.visualTheme || imageContext.customDescription)) {
    return buildImageContextPrompt(businessName, section, description, imageContext);
  }

  // If we have a template with specific image subject for this section, use it
  if (template?.imageSubjects) {
    const templateSubject = template.imageSubjects.find(s => s.section === section);
    if (templateSubject) {
      let prompt = templateSubject.prompt;

      // Add business name context
      prompt = `For "${businessName}", a ${businessLabel} business: ${prompt}`;

      // Add ultra-realistic quality modifiers
      prompt += '. Ultra-realistic photography, shot on professional camera, perfect exposure, natural lighting, high dynamic range, 8K resolution quality.';

      // Add color mood if available
      if (template.colorMood) {
        const moodColors: Record<string, string> = {
          warm: 'warm golden tones, amber lighting',
          cool: 'cool blue tones, crisp lighting',
          neutral: 'neutral balanced tones, soft lighting',
          dark: 'moody dark tones, dramatic lighting with accents',
          vibrant: 'vibrant saturated colors, energetic lighting',
        };
        prompt += ` Color mood: ${moodColors[template.colorMood] || template.colorMood}.`;
      }

      // Safety and quality modifiers
      prompt += ' CRITICAL: NO TEXT, NO WORDS, NO LETTERS, NO SIGNAGE, NO LOGOS, NO WATERMARKS. If text must appear, use ONLY proper English words, NEVER gibberish. NO CAMERAS or photography equipment (unless business is specifically photography/videography). Image must be strictly relevant to the business only. Professional quality suitable for business website.';

      return prompt;
    }
  }

  // If custom prompt is provided, enhance it
  if (customPrompt) {
    let prompt = customPrompt;
    prompt += `. For "${businessName}", a ${businessLabel} business.`;
    prompt += ' Ultra-realistic photography, shot on professional camera, perfect exposure, natural lighting, 8K resolution.';
    prompt += ' CRITICAL: NO TEXT, NO WORDS, NO LETTERS, NO SIGNAGE, NO LOGOS, NO WATERMARKS. If text must appear, use ONLY proper English words, NEVER gibberish. NO CAMERAS or photography equipment (unless business is specifically photography/videography). Image must be strictly relevant to the business only. Professional quality.';
    return prompt;
  }

  // Fallback to building a detailed prompt from scratch
  const basePrompt = ULTRA_REALISTIC_PROMPTS[section] || ULTRA_REALISTIC_PROMPTS.hero;
  const styleModifier = STYLE_MODIFIERS[style] || STYLE_MODIFIERS['ultra-realistic'];

  let prompt = `${basePrompt} For "${businessName}", a ${businessLabel} business.`;

  // Add section-specific ultra-realistic context
  if (section === 'hero') {
    prompt += ` The image should be a stunning wide-format photograph capturing the essence of the ${businessLabel} industry.`;

    // Add industry-specific details
    const industryPrompts: Record<string, string> = {
      restaurant: 'Beautiful plated dish with steam rising, professional food photography, appetizing presentation.',
      'law-firm': 'Distinguished law library or prestigious office, leather and mahogany, scales of justice.',
      dental: 'Modern dental office, calming atmosphere, state-of-the-art equipment, reassuring environment.',
      'hair-salon': 'Stunning hair transformation, vibrant colors, trendy salon interior, artistic styling.',
      plumbing: 'Professional plumber at work, clean uniform, modern home setting, trustworthy service.',
      landscaping: 'Beautiful manicured garden at golden hour, lush greenery, professional landscaping.',
      'real-estate': 'Luxury property exterior at twilight, architectural beauty, aspirational lifestyle.',
      fitness: 'Dynamic workout scene, motivated athlete, modern gym equipment, energy and determination.',
      spa: 'Serene spa treatment room, candles, orchids, luxurious linens, tranquil atmosphere.',
      coffee: 'Perfect espresso pour with rich crema, artisan coffee culture, craft atmosphere.',
      // Eye care / Optical - CRITICAL: Never confuse with automotive
      'eye-care': 'Modern optical boutique interior with designer eyewear displays, stylish frames, professional optometrist, vision care excellence.',
      'optical': 'Elegant optical shop with beautiful eyeglasses display, modern vision center, professional eye care environment.',
      'optometry': 'Professional optometrist performing comprehensive eye exam, modern vision equipment, patient-focused eye care.',
      'vision': 'Modern vision center with eye examination equipment, stylish eyewear collection, professional optical services.',
      // Additional healthcare specialties
      'chiropractic': 'Professional chiropractor performing spinal adjustment, modern wellness clinic, healing therapeutic environment.',
      'physical-therapy': 'Physical therapist guiding patient through rehabilitation exercises, modern therapy facility, recovery and wellness.',
      'mental-health': 'Peaceful therapy office with calming decor, comfortable consultation space, serene counseling environment.',
      'veterinary': 'Caring veterinarian examining a healthy pet, modern animal clinic, compassionate pet care.',
      // Logistics & Transportation
      'logistics': 'Massive container ship at busy port terminal, colorful shipping containers, global logistics operations, industrial scale.',
      'shipping': 'Large cargo ship loaded with containers, busy port operations, cranes loading cargo, global trade.',
      'freight': 'Professional freight operations, cargo handling, logistics warehouse, supply chain in action.',
      'transportation': 'Fleet of modern semi trucks on interstate highway at sunset, professional long-haul transportation.',
      'trucking': 'Professional truck driver in modern cab, reliable freight transport, open road ahead.',
      'courier': 'Friendly delivery driver handing package to smiling customer, express delivery service, professional courier.',
      'delivery': 'Modern delivery van with packages, professional courier service, fast and reliable.',
      'moving': 'Professional movers carefully loading furniture into clean moving truck, residential moving day.',
      'relocation': 'Happy family with keys to new home, moving truck in background, successful relocation.',
      'warehouse': 'Modern automated warehouse with robotic systems, efficient logistics operations, organized storage.',
      'supply chain': 'Global supply chain visualization, cargo ships, trucks, and planes, interconnected logistics.',
    };

    for (const [key, value] of Object.entries(industryPrompts)) {
      if (businessLabel.toLowerCase().includes(key) || keywords.some(k => k.includes(key))) {
        prompt += ` ${value}`;
        break;
      }
    }
  } else if (section === 'about') {
    prompt += ' Authentic candid moment showing the human side of the business. Real people, genuine expressions, natural interaction.';
  } else if (section === 'services') {
    prompt += ' Detailed shot showcasing professional craftsmanship or service delivery. Attention to detail, expertise visible, high quality work.';
  } else if (section === 'team') {
    prompt += ' Professional team photograph, diverse group, confident and approachable, modern workplace setting.';
  } else if (section === 'gallery') {
    prompt += ' Portfolio-worthy showcase image, best representation of work quality, impressive results.';
  }

  // Add description context if provided
  if (description) {
    prompt += ` Context: ${description}.`;
  }

  // Add relevant keywords for context
  if (keywords.length > 0) {
    const topKeywords = keywords.slice(0, 3).join(', ');
    prompt += ` Related themes: ${topKeywords}.`;
  }

  // Add color guidance if provided
  if (colorTheme?.primary && typeof colorTheme.primary === 'string') {
    prompt += ` Color palette should complement ${colorTheme.primary.slice(0, 50)} tones.`;
  }

  // Add style modifier
  prompt += ` Style: ${styleModifier}.`;

  // Add ultra-realistic quality and safety modifiers
  prompt += ' Ultra-realistic, indistinguishable from real photograph. No artificial or CGI appearance. CRITICAL: NO TEXT, NO WORDS, NO LETTERS, NO SIGNAGE, NO LOGOS, NO WATERMARKS. If text must appear, use ONLY proper English words, NEVER gibberish. NO CAMERAS or photography equipment (unless business is specifically photography/videography). Image must be strictly relevant to the business only. Professional business website quality.';

  return prompt;
}
