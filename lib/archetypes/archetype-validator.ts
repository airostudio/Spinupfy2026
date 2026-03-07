/**
 * Archetype Validation and Testing System
 * Ensures strict adherence to archetype design guidelines
 */

import { ArchetypePack } from './archetype-packs';
import { ThreeLayerOutput } from './three-layer-output';

// ===================
// VALIDATION TYPES
// ===================

export interface ValidationResult {
  valid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationIssue {
  severity: 'critical' | 'error' | 'warning';
  category: 'design' | 'content' | 'accessibility' | 'structure';
  message: string;
  fix?: string;
}

export interface ValidationWarning {
  category: string;
  message: string;
}

// ===================
// DESIGN VALIDATION
// ===================

/**
 * Validate design tokens against WCAG and best practices
 */
export function validateDesignTokens(archetype: ArchetypePack): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  const { designTokens } = archetype;

  // 1. Color Contrast Validation (WCAG AA)
  const textBgContrast = calculateContrastRatio(
    designTokens.colors.text,
    designTokens.colors.bg
  );

  if (textBgContrast < 4.5) {
    issues.push({
      severity: 'critical',
      category: 'accessibility',
      message: `Text/background contrast (${textBgContrast.toFixed(2)}:1) fails WCAG AA (requires 4.5:1)`,
      fix: `Increase contrast by darkening text color or lightening background`,
    });
  } else if (textBgContrast < 7.0) {
    warnings.push({
      category: 'accessibility',
      message: `Text/background contrast (${textBgContrast.toFixed(2)}:1) passes AA but not AAA (7:1)`,
    });
  }

  // Validate primary color contrast
  const primaryContrast = calculateContrastRatio(
    designTokens.colors.primary,
    designTokens.colors.primaryContrast
  );

  if (primaryContrast < 4.5) {
    issues.push({
      severity: 'error',
      category: 'accessibility',
      message: `Primary color contrast (${primaryContrast.toFixed(2)}:1) fails WCAG AA`,
      fix: `Adjust primaryContrast to ensure 4.5:1 ratio`,
    });
  }

  // 2. Typography Scale Validation
  const scale = designTokens.typography.scale;
  if (scale < 1.1 || scale > 1.5) {
    warnings.push({
      category: 'design',
      message: `Type scale (${scale}) is outside recommended range (1.1-1.5)`,
    });
  }

  // 3. Spacing Unit Validation
  const spacingUnit = designTokens.spacing.unit;
  if (spacingUnit !== 4 && spacingUnit !== 8) {
    warnings.push({
      category: 'design',
      message: `Spacing unit (${spacingUnit}px) should typically be 4px or 8px for consistency`,
    });
  }

  // 4. Font Family Validation
  const headingFont = designTokens.typography.headingFont.toLowerCase();
  const bodyFont = designTokens.typography.bodyFont.toLowerCase();

  if (!headingFont.includes('serif') && !headingFont.includes('sans') && !headingFont.includes('mono')) {
    warnings.push({
      category: 'design',
      message: 'Heading font should specify generic family (serif, sans-serif, monospace)',
    });
  }

  if (!bodyFont.includes('serif') && !bodyFont.includes('sans') && !bodyFont.includes('mono')) {
    warnings.push({
      category: 'design',
      message: 'Body font should specify generic family (serif, sans-serif, monospace)',
    });
  }

  // 5. Border Radius Validation
  const radii = designTokens.radii;
  if (parseInt(radii.sm) > parseInt(radii.md) || parseInt(radii.md) > parseInt(radii.lg)) {
    issues.push({
      severity: 'error',
      category: 'design',
      message: 'Border radii must increase: sm < md < lg',
      fix: 'Ensure sm < md < lg in pixel values',
    });
  }

  // Calculate score
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const errorIssues = issues.filter(i => i.severity === 'error').length;
  const warningIssues = issues.filter(i => i.severity === 'warning').length;

  const score = Math.max(0, 100 - (criticalIssues * 30) - (errorIssues * 15) - (warningIssues * 5) - (warnings.length * 2));

  // Suggestions
  if (score >= 90) {
    suggestions.push('Excellent design token configuration!');
  } else if (score >= 70) {
    suggestions.push('Good configuration with minor improvements needed');
  } else {
    suggestions.push('Significant improvements needed for production quality');
  }

  return {
    valid: criticalIssues === 0 && errorIssues === 0,
    score,
    issues,
    warnings,
    suggestions,
  };
}

// ===================
// CONTENT VALIDATION
// ===================

/**
 * Validate generated content against archetype copy tone rules
 */
export function validateContentAgainstArchetype(
  content: any,
  archetype: ArchetypePack
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  const { copyTone, layoutRecipe } = archetype;

  // 1. Section Structure Validation
  const generatedSections = Object.keys(content);
  const requiredSections = layoutRecipe.sections.slice(0, 4); // First 4 are critical

  for (const required of requiredSections) {
    const normalized = required.toLowerCase();
    const found = generatedSections.some(s => s.toLowerCase().includes(normalized));

    if (!found) {
      issues.push({
        severity: 'error',
        category: 'structure',
        message: `Missing critical section: ${required}`,
        fix: `Add ${required} section to generated content`,
      });
    }
  }

  // 2. Headline Length Validation
  const headlineLength = copyTone.length.headlines;
  const expectedWordCount = getExpectedWordCount(headlineLength);

  // Check hero headline if exists
  if (content.hero?.headline) {
    const wordCount = content.hero.headline.split(' ').length;

    if (headlineLength === 'short' && wordCount > 6) {
      warnings.push({
        category: 'content',
        message: `Hero headline (${wordCount} words) exceeds recommended length for "${headlineLength}" style (max 6)`,
      });
    } else if (headlineLength === 'medium' && (wordCount < 6 || wordCount > 10)) {
      warnings.push({
        category: 'content',
        message: `Hero headline (${wordCount} words) outside recommended range for "${headlineLength}" style (6-10)`,
      });
    } else if (headlineLength === 'long' && wordCount < 10) {
      warnings.push({
        category: 'content',
        message: `Hero headline (${wordCount} words) shorter than recommended for "${headlineLength}" style (10-15)`,
      });
    }
  }

  // 3. Copy Style Validation (simplified keyword check)
  const styleKeywords = getStyleKeywords(copyTone.style);
  const contentText = JSON.stringify(content).toLowerCase();

  let keywordMatches = 0;
  for (const keyword of copyTone.keywords) {
    if (contentText.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  }

  const keywordMatchRate = keywordMatches / copyTone.keywords.length;
  if (keywordMatchRate < 0.3) {
    warnings.push({
      category: 'content',
      message: `Low keyword usage (${Math.round(keywordMatchRate * 100)}%). Consider incorporating more industry-specific terms: ${copyTone.keywords.slice(0, 5).join(', ')}`,
    });
  }

  // 4. Voice Validation (person)
  if (content.hero?.headline || content.hero?.subheadline) {
    const heroText = `${content.hero.headline || ''} ${content.hero.subheadline || ''}`.toLowerCase();
    const voicePerson = copyTone.voice.person;

    if (voicePerson === 'first' && !/(we|our|us)\b/.test(heroText)) {
      warnings.push({
        category: 'content',
        message: 'Copy tone requires first person (we, our, us) but hero text uses different voice',
      });
    } else if (voicePerson === 'second' && !/(you|your)\b/.test(heroText)) {
      warnings.push({
        category: 'content',
        message: 'Copy tone requires second person (you, your) but hero text uses different voice',
      });
    }
  }

  // Calculate score
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const errorIssues = issues.filter(i => i.severity === 'error').length;
  const score = Math.max(0, 100 - (criticalIssues * 25) - (errorIssues * 15) - (warnings.length * 5));

  // Suggestions
  if (keywordMatchRate >= 0.6) {
    suggestions.push('Strong use of industry-specific keywords');
  }
  if (generatedSections.length >= requiredSections.length) {
    suggestions.push('All critical sections present');
  }

  return {
    valid: criticalIssues === 0 && errorIssues === 0,
    score,
    issues,
    warnings,
    suggestions,
  };
}

// ===================
// THREE-LAYER OUTPUT VALIDATION
// ===================

/**
 * Validate three-layer output structure
 */
export function validateThreeLayerOutput(output: ThreeLayerOutput): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  // 1. Tokens Layer Validation
  if (!output.tokens || typeof output.tokens !== 'object') {
    issues.push({
      severity: 'critical',
      category: 'structure',
      message: 'Missing or invalid tokens layer',
      fix: 'Ensure tokens object is properly generated',
    });
  } else {
    // Check required token categories
    const requiredCategories = ['colors', 'typography', 'spacing', 'radii', 'shadows'];
    for (const category of requiredCategories) {
      if (!output.tokens[category as keyof typeof output.tokens]) {
        issues.push({
          severity: 'error',
          category: 'structure',
          message: `Missing token category: ${category}`,
          fix: `Add ${category} to tokens object`,
        });
      }
    }

    // Validate color tokens
    if (output.tokens.colors) {
      const requiredColors = ['bg', 'surface', 'text', 'primary', 'accent'];
      for (const color of requiredColors) {
        if (!output.tokens.colors[color as keyof typeof output.tokens.colors]) {
          issues.push({
            severity: 'error',
            category: 'design',
            message: `Missing required color token: ${color}`,
            fix: `Add ${color} to colors object`,
          });
        }
      }
    }
  }

  // 2. Schema Layer Validation
  if (!output.schema || !Array.isArray(output.schema.sections)) {
    issues.push({
      severity: 'critical',
      category: 'structure',
      message: 'Missing or invalid schema layer',
      fix: 'Ensure sections array is properly generated',
    });
  } else {
    if (output.schema.sections.length === 0) {
      issues.push({
        severity: 'critical',
        category: 'structure',
        message: 'Schema has no sections',
        fix: 'Generate at least one section',
      });
    }

    // Validate section structure
    for (const section of output.schema.sections) {
      if (!section.id || !section.type || section.order === undefined) {
        issues.push({
          severity: 'error',
          category: 'structure',
          message: `Section missing required fields (id, type, order)`,
          fix: 'Ensure all sections have id, type, and order',
        });
      }

      if (!section.content || typeof section.content !== 'object') {
        warnings.push({
          category: 'content',
          message: `Section ${section.id} has no content`,
        });
      }
    }
  }

  // 3. Components Layer Validation
  if (!output.components || !output.components.registry) {
    issues.push({
      severity: 'error',
      category: 'structure',
      message: 'Missing components layer',
      fix: 'Ensure components registry is defined',
    });
  }

  // Calculate score
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const errorIssues = issues.filter(i => i.severity === 'error').length;
  const score = Math.max(0, 100 - (criticalIssues * 30) - (errorIssues * 15) - (warnings.length * 5));

  // Suggestions
  if (output.schema?.sections && output.schema.sections.length >= 5) {
    suggestions.push('Good section coverage');
  }
  if (score === 100) {
    suggestions.push('Perfect three-layer output structure!');
  }

  return {
    valid: criticalIssues === 0,
    score,
    issues,
    warnings,
    suggestions,
  };
}

// ===================
// COMPREHENSIVE VALIDATION
// ===================

/**
 * Run all validation checks
 */
export function validateArchetypeGeneration(
  archetype: ArchetypePack,
  content: any,
  threeLayerOutput: ThreeLayerOutput
): ValidationResult {
  const results = [
    validateDesignTokens(archetype),
    validateContentAgainstArchetype(content, archetype),
    validateThreeLayerOutput(threeLayerOutput),
  ];

  // Combine results
  const allIssues = results.flatMap(r => r.issues);
  const allWarnings = results.flatMap(r => r.warnings);
  const allSuggestions = results.flatMap(r => r.suggestions);

  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;

  return {
    valid: criticalIssues === 0 && allIssues.filter(i => i.severity === 'error').length === 0,
    score: Math.round(avgScore),
    issues: allIssues,
    warnings: allWarnings,
    suggestions: allSuggestions,
  };
}

/**
 * Print validation report
 */
export function printValidationReport(result: ValidationResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('ARCHETYPE VALIDATION REPORT');
  console.log('='.repeat(60));

  console.log(`\n✓ Overall Score: ${result.score}/100`);
  console.log(`✓ Status: ${result.valid ? '✅ PASSED' : '❌ FAILED'}\n`);

  if (result.issues.length > 0) {
    console.log('ISSUES:');
    for (const issue of result.issues) {
      const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'error' ? '🟠' : '🟡';
      console.log(`  ${icon} [${issue.category.toUpperCase()}] ${issue.message}`);
      if (issue.fix) {
        console.log(`     → Fix: ${issue.fix}`);
      }
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log('WARNINGS:');
    for (const warning of result.warnings) {
      console.log(`  ⚠️  [${warning.category.toUpperCase()}] ${warning.message}`);
    }
    console.log();
  }

  if (result.suggestions.length > 0) {
    console.log('SUGGESTIONS:');
    for (const suggestion of result.suggestions) {
      console.log(`  💡 ${suggestion}`);
    }
    console.log();
  }

  console.log('='.repeat(60) + '\n');
}

// ===================
// UTILITY FUNCTIONS
// ===================

/**
 * Calculate WCAG contrast ratio
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Get relative luminance (WCAG formula)
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

/**
 * Get expected word count for headline length
 */
function getExpectedWordCount(length: 'short' | 'medium' | 'long'): { min: number; max: number } {
  switch (length) {
    case 'short': return { min: 3, max: 6 };
    case 'medium': return { min: 6, max: 10 };
    case 'long': return { min: 10, max: 15 };
  }
}

/**
 * Get style-specific keywords to look for
 */
function getStyleKeywords(style: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'concise': ['fast', 'simple', 'easy', 'quick', 'efficient'],
    'story-led': ['journey', 'story', 'passion', 'craft', 'tradition'],
    'premium': ['luxury', 'premium', 'exclusive', 'exceptional', 'distinguished'],
    'playful': ['fun', 'exciting', 'vibrant', 'creative', 'unique'],
    'technical': ['advanced', 'professional', 'expert', 'precise', 'reliable'],
  };
  return keywordMap[style] || [];
}
