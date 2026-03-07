/**
 * Design Intent Builder
 * "Lovable-style thinking" - converts archetype pack + context into AI prompts
 *
 * Instead of hardcoding design decisions, we build a "Design Intent" template
 * that fills in variables based on the selected archetype and business context.
 */

import type { ArchetypePack } from './archetype-packs';
import type { BusinessTypeConfig } from '../types/business.types';

export interface DesignIntentContext {
  businessName: string;
  description: string;
  businessType: BusinessTypeConfig;
  targetAudience?: string;
  location?: string;
  uniqueSellingPoints?: string[];
  competitorInsights?: string;
}

export interface DesignIntent {
  // Core intent
  outcome: string;          // What the site should achieve
  audience: string;         // Who it's for
  feel: string;             // Emotional response desired

  // Style constraints
  palette: {
    description: string;    // Color mood description
    primary: string;
    accent: string;
    background: string;
  };
  typography: {
    description: string;    // Type mood description
    heading: string;
    body: string;
  };
  spacing: string;          // Tight, balanced, spacious
  aestheticKeywords: string[]; // Words that describe the vibe

  // Components
  layout: {
    sections: string[];     // Ordered section list
    patterns: Record<string, string>; // Section → pattern mapping
    maxWidth: string;
  };
  header: string;           // Header style description
  hero: string;             // Hero style description
  imagery: string;          // Image style guidance

  // Content strategy
  copyTone: string;         // Overall copy approach
  headlineStyle: string;    // How headlines should work
  ctaApproach: string;      // CTA strategy
  keyTerms: string[];       // Industry keywords to emphasize

  // References
  inspiration: string[];    // Example sites for reference
}

/**
 * Build Design Intent from archetype pack and business context
 */
export function buildDesignIntent(
  pack: ArchetypePack,
  context: DesignIntentContext
): DesignIntent {
  return {
    // Core intent
    outcome: buildOutcomeStatement(pack, context),
    audience: buildAudienceStatement(pack, context),
    feel: buildFeelStatement(pack, context),

    // Style constraints
    palette: {
      description: buildPaletteDescription(pack),
      primary: pack.designTokens.colors.primary,
      accent: pack.designTokens.colors.accent,
      background: pack.designTokens.colors.bg,
    },
    typography: {
      description: buildTypographyDescription(pack),
      heading: pack.designTokens.typography.headingFont,
      body: pack.designTokens.typography.bodyFont,
    },
    spacing: pack.layoutRecipe.density,
    aestheticKeywords: buildAestheticKeywords(pack, context),

    // Components
    layout: {
      sections: pack.layoutRecipe.sections,
      patterns: pack.layoutRecipe.patterns as Record<string, string>,
      maxWidth: pack.layoutRecipe.maxWidth,
    },
    header: buildHeaderDescription(pack),
    hero: buildHeroDescription(pack),
    imagery: pack.mediaRules.imageStyle,

    // Content strategy
    copyTone: buildCopyToneDescription(pack),
    headlineStyle: buildHeadlineStyleDescription(pack),
    ctaApproach: buildCtaApproachDescription(pack),
    keyTerms: [...pack.copyTone.keywords, ...context.businessType.keywords].slice(0, 10),

    // References
    inspiration: [...pack.exemplars, ...pack.competitors].slice(0, 5),
  };
}

/**
 * Helper functions to build intent statements
 */

function buildOutcomeStatement(pack: ArchetypePack, context: DesignIntentContext): string {
  const outcomes: Record<string, string> = {
    'story-led': `Create an engaging, story-driven experience that builds emotional connection`,
    'concise': `Drive immediate action through clear, benefit-focused messaging`,
    'premium': `Establish premium positioning and inspire confidence in quality`,
    'playful': `Delight users with personality and memorable interactions`,
    'technical': `Demonstrate expertise and build credibility through detailed information`,
  };

  return outcomes[pack.copyTone.style] || `Convert visitors into ${context.businessType.label} customers`;
}

function buildAudienceStatement(pack: ArchetypePack, context: DesignIntentContext): string {
  if (context.targetAudience) {
    return context.targetAudience;
  }

  // Infer from business type
  const audiences: Record<string, string> = {
    'bakery': 'Local community members seeking fresh, artisanal baked goods',
    'electrician': 'Homeowners and businesses needing reliable electrical services',
    'plumber': 'Property owners requiring professional plumbing solutions',
    'hvac': 'Homeowners seeking heating and cooling expertise',
    'tech-saas': 'Teams and businesses looking to improve productivity and efficiency',
    'restaurant': 'Local diners seeking quality dining experiences',
  };

  return audiences[context.businessType.id] || `${context.businessType.label} service seekers`;
}

function buildFeelStatement(pack: ArchetypePack, context: DesignIntentContext): string {
  const vibeToFeel: Record<string, string> = {
    'warm_artisanal': 'warm, inviting, and authentically crafted',
    'professional_trustworthy': 'professional, reliable, and confidence-inspiring',
    'modern_minimal': 'clean, innovative, and effortlessly sophisticated',
    'luxury_premium': 'exclusive, refined, and aspirational',
  };

  return vibeToFeel[pack.vibe] || pack.description;
}

function buildPaletteDescription(pack: ArchetypePack): string {
  const { primary, accent, bg } = pack.designTokens.colors;

  // Describe the mood
  const moods: string[] = [];
  if (getLuminanceSimple(bg) > 0.9) moods.push('light and airy');
  if (primary.includes('D4A574') || primary.includes('EAB308')) moods.push('warm and inviting');
  if (primary.includes('3B82F6') || primary.includes('2563EB')) moods.push('trustworthy and professional');
  if (accent.includes('10B981') || accent.includes('06B6D4')) moods.push('fresh and modern');

  return moods.join(', ') || 'balanced and harmonious';
}

function buildTypographyDescription(pack: ArchetypePack): string {
  const { headingFont, bodyFont } = pack.designTokens.typography;

  if (headingFont.includes('serif')) {
    return 'elegant serif headings paired with clean sans-serif body text for readability';
  }
  if (headingFont === bodyFont) {
    return 'consistent, modern sans-serif throughout for clean professional feel';
  }
  return 'carefully balanced typography hierarchy';
}

function buildAestheticKeywords(pack: ArchetypePack, context: DesignIntentContext): string[] {
  const keywords = new Set<string>();

  // From pack description
  pack.description.toLowerCase().split(' ').forEach(word => {
    if (word.length > 4) keywords.add(word);
  });

  // From media mood
  keywords.add(pack.mediaRules.mood);

  // From vibe
  pack.vibe.split('_').forEach(part => keywords.add(part));

  return Array.from(keywords).slice(0, 8);
}

function buildHeaderDescription(pack: ArchetypePack): string {
  const { layout, sticky, background, logoPosition, ctaStyle } = pack.componentVariants.header;

  const parts = [];
  if (sticky) parts.push('sticky');
  if (background === 'blur') parts.push('blurred background');
  if (background === 'transparent') parts.push('transparent overlay');
  parts.push(`${logoPosition} logo`);
  parts.push(`${layout} navigation`);
  if (ctaStyle !== 'none') parts.push(`prominent ${ctaStyle} CTA`);

  return parts.join(', ');
}

function buildHeroDescription(pack: ArchetypePack): string {
  const { layout, imageStyle, headlineSize, ctaCount } = pack.componentVariants.hero;

  const parts = [];
  parts.push(`${layout} layout`);
  if (imageStyle !== 'none') parts.push(`${imageStyle} imagery`);
  parts.push(`${headlineSize} headline`);
  parts.push(`${ctaCount} CTA button${ctaCount > 1 ? 's' : ''}`);

  return parts.join(', ');
}

function buildCopyToneDescription(pack: ArchetypePack): string {
  const { style, voice } = pack.copyTone;

  const descriptions: Record<string, string> = {
    'story-led': `Story-driven copy that builds emotional connection through narrative`,
    'concise': `Direct, benefit-focused copy that drives action`,
    'premium': `Sophisticated, aspirational language that reinforces quality`,
    'playful': `Engaging, personality-driven copy with memorable moments`,
    'technical': `Detailed, expertise-driven content that builds credibility`,
  };

  const base = descriptions[style] || 'Clear, engaging copy';
  const voiceAddition = voice.formality === 'casual' ? ', conversational tone' : ', professional tone';

  return base + voiceAddition;
}

function buildHeadlineStyleDescription(pack: ArchetypePack): string {
  const { headlinePattern, length } = pack.copyTone;

  const patterns: Record<string, string> = {
    'outcome-first': 'Lead with the transformation or result',
    'benefit-driven': 'Focus on clear benefits and value proposition',
    'question': 'Engage with relevant questions that resonate',
    'statement': 'Make bold, confident declarations',
  };

  const lengthGuide = length.headlines === 'short' ? '(3-6 words)'
    : length.headlines === 'medium' ? '(6-10 words)'
    : '(10-15 words)';

  return `${patterns[headlinePattern]} ${lengthGuide}`;
}

function buildCtaApproachDescription(pack: ArchetypePack): string {
  const { urgency, style } = pack.componentVariants.cta;

  if (urgency === 'high') {
    return 'Urgent, action-driven CTAs with clear next steps';
  }
  if (urgency === 'low') {
    return 'Gentle, inviting CTAs that encourage exploration';
  }
  return 'Balanced CTAs that guide without pressure';
}

// Simple luminance helper
function getLuminanceSimple(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 0.5;

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert Design Intent to AI system prompt
 */
export function designIntentToPrompt(intent: DesignIntent, context: DesignIntentContext): string {
  return `You are an elite web designer creating a world-class ${context.businessType.label} website for ${context.businessName}.

**DESIGN INTENT**

Outcome: ${intent.outcome}
Audience: ${intent.audience}
Feel: ${intent.feel}

**AESTHETIC VISION**

Palette: ${intent.palette.description}
- Primary: ${intent.palette.primary}
- Accent: ${intent.palette.accent}
- Background: ${intent.palette.background}

Typography: ${intent.typography.description}
- Headings: ${intent.typography.heading}
- Body: ${intent.typography.body}

Spacing: ${intent.spacing}
Keywords: ${intent.aestheticKeywords.join(', ')}

**LAYOUT ARCHITECTURE**

Sections (in order): ${intent.layout.sections.join(' → ')}
Max width: ${intent.layout.maxWidth}
Section patterns: ${JSON.stringify(intent.layout.patterns, null, 2)}

**COMPONENT SPECIFICATIONS**

Header: ${intent.header}
Hero: ${intent.hero}
Imagery: ${intent.imagery}

**CONTENT STRATEGY**

Copy tone: ${intent.copyTone}
Headlines: ${intent.headlineStyle}
CTAs: ${intent.ctaApproach}
Key terms: ${intent.keyTerms.join(', ')}

**INSPIRATION REFERENCES**

Study these industry leaders: ${intent.inspiration.join(', ')}

**BUSINESS CONTEXT**

${context.description}

${context.competitorInsights || ''}

${context.uniqueSellingPoints ? `Unique selling points: ${context.uniqueSellingPoints.join(', ')}` : ''}

---

Create content that matches this exact design intent. Every design decision should align with the aesthetic vision and business outcomes defined above.`;
}
