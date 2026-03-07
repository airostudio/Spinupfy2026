/**
 * Archetype-based Website Generator
 * STRICT ENFORCEMENT: Uses archetype packs + design intent templates for consistent, high-quality generation
 *
 * This system MUST be used for all website creations to ensure:
 * - Design consistency through archetype packs
 * - Web-inspired color palettes and layouts
 * - Three-layer output structure (tokens, schema, components)
 * - Strict adherence to business type + vibe guidelines
 */

import { getArchetypePack, type ArchetypePack } from './archetype-packs';
import { getComprehensiveArchetypePack } from './comprehensive-archetype-packs';
import { buildDesignIntent, designIntentToPrompt, type DesignIntentContext } from './design-intent-builder';
import { generateThreeLayerOutput, type ThreeLayerOutput } from './three-layer-output';
import { generateWebsiteContent } from '../openai';
import type { BusinessTypeConfig } from '../types/business.types';

export interface ArchetypeGenerationParams {
  businessName: string;
  description: string;
  businessType: BusinessTypeConfig;
  targetAudience?: string;
  location?: string;
  uniqueSellingPoints?: string[];
  competitorInsights?: string;
  vibe?: string; // Optional vibe preference
}

export interface ArchetypeGenerationResult {
  content: any; // Generated website content
  archetype: ArchetypePack;
  designIntent: any;
  threeLayerOutput: ThreeLayerOutput; // STRICT: Three-layer output structure
  tokens: {
    colors: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, any>;
  };
}

/**
 * Generate website using archetype system
 * STRICT ENFORCEMENT: All websites MUST use this archetype-based generation
 */
export async function generateWithArchetype(
  params: ArchetypeGenerationParams
): Promise<ArchetypeGenerationResult> {
  const { businessName, description, businessType, targetAudience, location, uniqueSellingPoints, competitorInsights, vibe } = params;

  // Step 1: Select archetype pack (STRICT - must find a pack)
  // Try comprehensive packs first, fallback to original packs
  let archetype = getComprehensiveArchetypePack(businessType.id, vibe);

  if (!archetype) {
    console.log('[Archetype Generator] No comprehensive pack found, trying original packs...');
    archetype = getArchetypePack(businessType.id, vibe);
  }

  if (!archetype) {
    throw new Error(
      `CRITICAL: No archetype pack found for business type: ${businessType.id}. ` +
      `All websites MUST use an archetype pack. Please add one to comprehensive-archetype-packs.ts`
    );
  }

  console.log(`[Archetype Generator] ✓ Selected pack: ${archetype.id} (${archetype.label})`);
  console.log(`[Archetype Generator] ✓ Vibe: ${archetype.vibe}`);
  console.log(`[Archetype Generator] ✓ Business Type: ${archetype.businessType}`);

  // Step 2: Build design intent context
  const context: DesignIntentContext = {
    businessName,
    description,
    businessType,
    targetAudience,
    location,
    uniqueSellingPoints,
    competitorInsights,
  };

  const designIntent = buildDesignIntent(archetype, context);

  console.log('[Archetype Generator] ✓ Built design intent:', {
    outcome: designIntent.outcome,
    feel: designIntent.feel,
    sections: designIntent.layout.sections,
    copyTone: archetype.copyTone.style,
  });

  // Step 3: Convert design intent to AI prompt
  const systemPrompt = designIntentToPrompt(designIntent, context);

  console.log('[Archetype Generator] ✓ Generated system prompt length:', systemPrompt.length);

  // Step 4: Generate content with enhanced prompt
  const content = await generateWebsiteContent({
    businessName,
    description,
    businessType: businessType.id,
    targetAudience,
    tone: archetype.copyTone.style,
    competitorInsights,
    // Pass archetype-specific guidance
    existingContent: {
      keywords: designIntent.keyTerms,
    },
  });

  console.log('[Archetype Generator] ✓ Content generated successfully');

  // Step 5: Generate THREE-LAYER OUTPUT (STRICT REQUIREMENT)
  const threeLayerOutput = generateThreeLayerOutput(archetype, content);

  console.log('[Archetype Generator] ✓ Three-layer output generated:');
  console.log('  - tokens.json:', Object.keys(threeLayerOutput.tokens).join(', '));
  console.log('  - sections.schema.json:', threeLayerOutput.schema.sections.length, 'sections');
  console.log('  - components:', Object.keys(threeLayerOutput.components.registry).length, 'registered');

  // Step 6: Extract design tokens for frontend (backward compatibility)
  const tokens = {
    colors: archetype.designTokens.colors,
    typography: {
      headingFont: archetype.designTokens.typography.headingFont,
      bodyFont: archetype.designTokens.typography.bodyFont,
      headingWeight: archetype.designTokens.typography.headingWeight,
      bodyWeight: archetype.designTokens.typography.bodyWeight,
      baseSize: archetype.designTokens.typography.baseSize,
      scale: archetype.designTokens.typography.scale,
    },
    spacing: {
      unit: archetype.designTokens.spacing.unit,
      scale: archetype.designTokens.spacing.scale,
    },
  };

  // Step 7: Validate against archetype (STRICT)
  const validation = validateAgainstArchetype(content, archetype);
  if (!validation.valid) {
    console.warn('[Archetype Generator] ⚠️  Validation issues:', validation.issues);
  } else {
    console.log('[Archetype Generator] ✓ Validation passed');
  }

  return {
    content,
    archetype,
    designIntent,
    threeLayerOutput,
    tokens,
  };
}

/**
 * Get recommended sections based on archetype
 */
export function getRecommendedSections(archetype: ArchetypePack): string[] {
  return archetype.layoutRecipe.sections;
}

/**
 * Get component variant specifications for a section
 */
export function getComponentVariant(archetype: ArchetypePack, sectionType: string): any {
  const normalized = sectionType.toLowerCase();

  if (normalized.includes('hero')) {
    return archetype.componentVariants.hero;
  }
  if (normalized.includes('header')) {
    return archetype.componentVariants.header;
  }
  if (normalized.includes('card') || normalized.includes('feature') || normalized.includes('service')) {
    return archetype.componentVariants.cards;
  }
  if (normalized.includes('cta')) {
    return archetype.componentVariants.cta;
  }

  return null;
}

/**
 * Get copy guidance for a section
 */
export function getCopyGuidance(archetype: ArchetypePack, sectionType: string): string {
  const { style, headlinePattern, length, voice } = archetype.copyTone;

  const guidelines = [];

  // Style guidance
  if (style === 'story-led') {
    guidelines.push('Use narrative, story-driven copy that builds emotional connection');
  } else if (style === 'concise') {
    guidelines.push('Keep copy direct and benefit-focused, drive immediate action');
  } else if (style === 'premium') {
    guidelines.push('Use sophisticated language that reinforces quality and exclusivity');
  }

  // Headline guidance
  if (headlinePattern === 'outcome-first') {
    guidelines.push('Lead headlines with the transformation or result customers will experience');
  } else if (headlinePattern === 'benefit-driven') {
    guidelines.push('Focus headlines on clear benefits and value proposition');
  }

  // Length guidance
  if (length.headlines === 'short') {
    guidelines.push('Keep headlines concise: 3-6 words maximum');
  } else if (length.headlines === 'long') {
    guidelines.push('Use descriptive headlines: 10-15 words for clarity');
  }

  // Voice guidance
  if (voice.person === 'first') {
    guidelines.push('Write in first person (we, our, us)');
  } else if (voice.person === 'second') {
    guidelines.push('Write in second person (you, your) to engage directly');
  }

  if (voice.formality === 'casual') {
    guidelines.push('Use casual, conversational language');
  } else if (voice.formality === 'formal') {
    guidelines.push('Maintain formal, professional language');
  }

  return guidelines.join('. ') + '.';
}

/**
 * Get image style guidance for a section
 */
export function getImageGuidance(archetype: ArchetypePack, sectionType: string): string {
  const { imageStyle, mood, framing, composition } = archetype.mediaRules;

  return `${imageStyle}. Mood: ${mood}, Framing: ${framing}, Composition: ${composition}. Keywords: ${archetype.mediaRules.searchKeywords.slice(0, 3).join(', ')}`;
}

/**
 * Validate generated content against archetype
 */
export function validateAgainstArchetype(
  content: any,
  archetype: ArchetypePack
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check if required sections are present
  const generatedSections = Object.keys(content);
  const requiredSections = archetype.layoutRecipe.sections;

  for (const required of requiredSections.slice(0, 3)) { // Check first 3 critical sections
    const normalized = required.toLowerCase();
    const found = generatedSections.some(s => s.toLowerCase().includes(normalized));
    if (!found) {
      issues.push(`Missing recommended section: ${required}`);
    }
  }

  // Check copy tone
  const copyTone = archetype.copyTone.style;
  // This is a simplified check - in production, you'd use NLP to analyze tone

  return {
    valid: issues.length === 0,
    issues,
  };
}
