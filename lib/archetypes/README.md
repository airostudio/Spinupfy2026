# Archetype Design Library System

## Overview

The **Archetype Design Library** is a comprehensive system for creating consistent, high-quality AI-generated websites. Every website creation MUST use this system to ensure:

- ✅ Design consistency through reusable archetype packs
- ✅ Web-inspired color palettes and layouts
- ✅ Three-layer output structure (tokens, schema, components)
- ✅ Strict adherence to business type + vibe guidelines

## Core Concepts

### 1. Archetype Packs

An **Archetype Pack** is a complete design system for a specific business type + vibe combination. Each pack includes:

```typescript
ArchetypePack = {
  // Design tokens: colors, fonts, radii, shadows, spacing scale
  designTokens: {
    colors: { bg, surface, text, muted, primary, accent, ... }
    typography: { headingFont, bodyFont, weights, scale }
    spacing: { unit, scale }
    radii: { sm, md, lg, full }
    shadows: { sm, md, lg, xl }
  }

  // Layout recipe: common sections + ordering + patterns
  layoutRecipe: {
    sections: ['HERO', 'FEATURES', 'ABOUT', ...]
    patterns: { hero, about, features, products, testimonials, contact }
    density: 'tight' | 'balanced' | 'spacious'
    maxWidth: 'narrow' | 'standard' | 'wide' | 'full'
  }

  // Component variants: header styles, hero templates, cards, CTAs
  componentVariants: {
    header: { layout, sticky, background, logoPosition, ctaStyle }
    hero: { layout, imageStyle, headlineSize, ctaCount, ctaStyle }
    cards: { style, imageRatio, hover }
    cta: { style, urgency, background }
  }

  // Copy tone rules: short, punchy vs warm, story-led vs premium
  copyTone: {
    style: 'concise' | 'story-led' | 'premium' | 'playful' | 'technical'
    headlinePattern: 'outcome-first' | 'benefit-driven' | 'question' | 'statement'
    length: { headlines, descriptions, cta }
    voice: { person, formality, emotion }
    keywords: string[]
  }

  // Media rules: image style, framing, mood
  mediaRules: {
    imageStyle: string
    mood: 'bright' | 'moody' | 'minimal' | 'vibrant' | 'professional'
    framing: 'close-up' | 'wide' | 'portrait' | 'product-focused' | 'lifestyle'
    composition: 'clean' | 'busy' | 'artistic' | 'documentary'
    preferredSources: ['unsplash', 'dalle', 'custom']
    searchKeywords: string[]
  }

  // Inspiration and references
  exemplars: string[]
  competitors: string[]
}
```

### 2. Business Type + Vibe

Every website is generated based on:

- **Business Type**: bakery, law-firm, tech-saas, electrician, etc. (35+ types)
- **Vibe**: warm_artisanal, modern_minimal, professional_trustworthy, luxury_premium, etc.

Example combinations:
- `bakery` + `warm_artisanal` → Warm Artisanal Bakery pack
- `tech-saas` + `modern_minimal` → Modern Minimal SaaS pack
- `electrician` + `professional_trustworthy` → Professional Trustworthy Electrician pack

### 3. Three-Layer Output

Every website generation produces three layers:

#### Layer 1: `tokens.json` (Design Tokens)

```json
{
  "colors": {
    "bg": "#FFFBF5",
    "surface": "#FFFFFF",
    "text": "#2D2424",
    "primary": "#D4A574",
    "accent": "#C17A4A"
  },
  "typography": {
    "fonts": {
      "heading": "Cormorant Garamond, serif",
      "body": "Open Sans, sans-serif"
    },
    "sizes": {
      "base": "16px",
      "scale": 1.25,
      "computed": { "xl": "20px", "2xl": "25px", ... }
    }
  },
  "spacing": {
    "unit": 8,
    "computed": { "sm": "8px", "md": "16px", "lg": "32px", ... }
  },
  "radii": { "sm": "4px", "md": "8px", "lg": "12px", "full": "9999px" },
  "shadows": { "sm": "...", "md": "...", "lg": "...", "xl": "..." }
}
```

#### Layer 2: `sections.schema.json` (Content Structure)

```json
{
  "sections": [
    {
      "id": "section-1",
      "type": "HERO",
      "order": 0,
      "visible": true,
      "settings": {
        "pattern": "centered",
        "density": "spacious",
        "background": "background"
      },
      "content": {
        "heading": "Freshly Baked Every Morning",
        "subheading": "Artisan breads and pastries made with love",
        "image": { "url": "...", "alt": "..." },
        "cta": [
          { "text": "Order Now", "url": "/order", "style": "primary" }
        ]
      }
    },
    {
      "id": "section-2",
      "type": "FEATURES",
      "order": 1,
      ...
    }
  ],
  "metadata": {
    "businessType": "bakery",
    "vibe": "warm_artisanal",
    "archetypeId": "bakery-warm-artisanal",
    "generatedAt": "2025-02-05T..."
  }
}
```

#### Layer 3: Components (React/Next)

Components consume tokens + schema:

```tsx
import { HeroSection } from '@/components/sections';

const { tokens, schema } = threeLayerOutput;

<HeroSection
  content={schema.sections[0].content}
  settings={schema.sections[0].settings}
  tokens={tokens}
/>
```

## File Structure

```
lib/archetypes/
├── archetype-packs.ts                  # Original 3 packs (bakery, electrician, tech-saas)
├── comprehensive-archetype-packs.ts    # Expanded library (35+ business types)
├── archetype-generator.ts              # Main generation orchestrator
├── design-intent-builder.ts            # Converts archetype → AI prompts
├── design-capture-system.ts            # Web-inspired design extraction
├── three-layer-output.ts               # Output structure generator
└── README.md                           # This file
```

## Usage

### 1. Generate Website with Archetype

```typescript
import { generateWithArchetype } from '@/lib/archetypes/archetype-generator';

const result = await generateWithArchetype({
  businessName: 'Artisan Bread Co',
  description: 'Handcrafted sourdough bakery',
  businessType: bakeryConfig,
  vibe: 'warm_artisanal', // optional
  targetAudience: 'Local bread lovers',
  location: 'Portland, OR',
});

// Access three-layer output
const { tokens, schema, components } = result.threeLayerOutput;
```

### 2. Access Archetype Pack Directly

```typescript
import { getArchetypePack } from '@/lib/archetypes/archetype-packs';
import { getComprehensiveArchetypePack } from '@/lib/archetypes/comprehensive-archetype-packs';

// Get specific pack
const pack = getComprehensiveArchetypePack('bakery', 'warm_artisanal');

// Access design tokens
const colors = pack.designTokens.colors;
const typography = pack.designTokens.typography;

// Access layout recipe
const sections = pack.layoutRecipe.sections; // ['HERO', 'FEATURES', ...]
```

### 3. Capture Design from Exemplar Website

```typescript
import { captureDesign, capturedDesignToTokens } from '@/lib/archetypes/design-capture-system';

// Capture design from real website
const captured = await captureDesign('https://example.com');

// Convert to design tokens
const tokens = capturedDesignToTokens(captured);

// Use in archetype pack
const customPack: ArchetypePack = {
  ...basePackTemplate,
  designTokens: tokens,
};
```

## Adding New Archetype Packs

To add a new archetype pack for a business type:

1. Open `/lib/archetypes/comprehensive-archetype-packs.ts`
2. Add new pack to `COMPREHENSIVE_ARCHETYPE_PACKS` array:

```typescript
{
  id: 'yoga-studio-calm-serene',
  label: 'Calm Serene Yoga Studio',
  description: 'Peaceful, mindful yoga and meditation center',
  businessType: 'yoga-studio',
  vibe: 'calm_serene',

  designTokens: {
    colors: {
      bg: '#F0FDF4',           // Soft green
      surface: '#FFFFFF',
      text: '#1E293B',
      muted: '#64748B',
      primary: '#14B8A6',      // Teal
      primaryContrast: '#FFFFFF',
      accent: '#06B6D4',       // Cyan
      border: '#CCFBF1',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#DC2626',
    },
    typography: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Lato, sans-serif',
      headingWeight: 400,
      bodyWeight: 300,
      baseSize: '16px',
      scale: 1.2,
    },
    spacing: { unit: 8, scale: [0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24] },
    radii: { sm: '8px', md: '16px', lg: '24px', full: '9999px' },
    shadows: {
      sm: '0 1px 3px rgba(20, 184, 166, 0.05)',
      md: '0 4px 12px rgba(20, 184, 166, 0.08)',
      lg: '0 8px 24px rgba(20, 184, 166, 0.10)',
      xl: '0 16px 48px rgba(20, 184, 166, 0.12)',
    },
  },

  layoutRecipe: {
    sections: ['HERO', 'SERVICES', 'ABOUT', 'PRICING', 'TESTIMONIALS', 'CONTACT'],
    patterns: {
      hero: 'centered',
      about: 'storytelling',
      features: 'cards',
      products: 'grid',
      testimonials: 'quotes',
      contact: 'form',
    },
    density: 'spacious',
    maxWidth: 'standard',
  },

  componentVariants: {
    header: {
      layout: 'centered',
      sticky: true,
      background: 'blur',
      logoPosition: 'center',
      ctaStyle: 'link',
    },
    hero: {
      layout: 'centered',
      imageStyle: 'background',
      headlineSize: '3xl',
      ctaCount: 1,
      ctaStyle: 'outline',
    },
    cards: {
      style: 'elevated',
      imageRatio: 'square',
      hover: 'none',
    },
    cta: {
      style: 'centered',
      urgency: 'low',
      background: 'solid',
    },
  },

  copyTone: {
    style: 'story-led',
    headlinePattern: 'outcome-first',
    length: {
      headlines: 'medium',
      descriptions: 'detailed',
      cta: 'gentle',
    },
    voice: {
      person: 'second',
      formality: 'casual',
      emotion: 'warm',
    },
    keywords: ['mindful', 'peaceful', 'balance', 'wellness', 'meditation', 'practice'],
  },

  mediaRules: {
    imageStyle: 'serene yoga poses, peaceful meditation spaces, natural light, zen aesthetics',
    mood: 'minimal',
    framing: 'wide',
    composition: 'clean',
    preferredSources: ['unsplash', 'dalle'],
    searchKeywords: ['yoga pose', 'meditation', 'zen studio', 'peaceful wellness', 'yoga class'],
  },

  exemplars: ['YogaWorks', 'CorePower Yoga', 'Wanderlust'],
  competitors: ['Local yoga studios', 'Wellness centers'],
}
```

## Design Principles

### Archetype Selection

1. **Business Type First**: Match the core business category
2. **Vibe Second**: Choose aesthetic that matches brand personality
3. **Fallback**: If no exact match, use closest business type archetype

### Color Palette Rules

- **Background**: Lightest color, sets overall mood
- **Surface**: Cards, panels (usually white or slight tint)
- **Text**: Darkest color, WCAG AA contrast (4.5:1)
- **Primary**: Brand color, most saturated
- **Accent**: Secondary brand color, complements primary
- **Border**: Subtle, usually 90% luminance of background

### Typography Scale

Common type scales:
- **1.125** (Major Second) - Compact, subtle hierarchy
- **1.200** (Minor Third) - Balanced, most common
- **1.250** (Major Third) - Distinct hierarchy
- **1.333** (Perfect Fourth) - Dramatic headlines
- **1.414** (Augmented Fourth) - Editorial style

### Layout Density

- **Tight**: 32-48px section spacing (energetic, content-heavy)
- **Balanced**: 48-80px section spacing (standard, readable)
- **Spacious**: 80-120px section spacing (luxury, premium feel)

### Component Patterns

#### Hero Layouts
- **Centered**: Full-width background image, centered content
- **Split**: Content on one side, image on other
- **Fullscreen**: Full viewport height, dramatic
- **Minimal**: Simple text, no image

#### Feature Patterns
- **Grid**: 3-column grid of feature cards
- **Cards**: Elevated cards with icons
- **List**: Vertical list with checkmarks
- **Showcase**: Large feature highlights

## Validation

### Strict Requirements

All generated websites MUST:

1. ✅ Use an archetype pack (no exceptions)
2. ✅ Generate three-layer output (tokens, schema, components)
3. ✅ Pass WCAG AA contrast validation (4.5:1)
4. ✅ Include required sections from layout recipe
5. ✅ Follow copy tone guidelines (style, voice, length)
6. ✅ Use media rules for consistent image style

### Validation Checks

```typescript
import { validateAgainstArchetype } from '@/lib/archetypes/archetype-generator';

const validation = validateAgainstArchetype(content, archetype);

if (!validation.valid) {
  console.warn('Validation issues:', validation.issues);
}
```

## Examples

### Example 1: Warm Artisanal Bakery

```typescript
const bakeryResult = await generateWithArchetype({
  businessName: 'Rustic Hearth Bakery',
  description: 'Traditional sourdough and artisan pastries',
  businessType: bakeryConfig,
  vibe: 'warm_artisanal',
});

// Output: Warm neutrals + serif headings + story-led copy + product grid
```

### Example 2: Modern Minimal SaaS

```typescript
const saasResult = await generateWithArchetype({
  businessName: 'TaskFlow',
  description: 'Project management for modern teams',
  businessType: techSaasConfig,
  vibe: 'modern_minimal',
});

// Output: Blue gradients + sans-serif + concise copy + feature showcase
```

### Example 3: Professional Trustworthy Electrician

```typescript
const electricianResult = await generateWithArchetype({
  businessName: 'Bright Spark Electric',
  description: 'Licensed electrical services',
  businessType: electricianConfig,
  vibe: 'professional_trustworthy',
});

// Output: Yellow/blue + Inter font + benefit-driven copy + trust badges
```

## Best Practices

### 1. Always Use Archetype Packs

❌ **BAD**: Manually defining colors and fonts for each website
✅ **GOOD**: Selecting appropriate archetype pack for business type + vibe

### 2. Leverage Three-Layer Output

❌ **BAD**: Passing inline styles and content together
✅ **GOOD**: Separating tokens (design), schema (content), components (presentation)

### 3. Validate Against Archetype

❌ **BAD**: Generating content without validation
✅ **GOOD**: Running validation checks and fixing issues

### 4. Use Web-Inspired Design

❌ **BAD**: Guessing color palettes
✅ **GOOD**: Extracting palettes from exemplar websites in the same industry

### 5. Follow Copy Tone Rules

❌ **BAD**: Using same voice for all business types
✅ **GOOD**: Matching copy tone to archetype (story-led for bakery, concise for electrician)

## Troubleshooting

### No Archetype Pack Found

```
Error: No archetype pack found for business type: xyz
```

**Solution**: Add a new archetype pack to `comprehensive-archetype-packs.ts`

### Validation Failures

```
Validation issues: Missing recommended section: HERO
```

**Solution**: Ensure AI content generation includes all required sections from `layoutRecipe.sections`

### Contrast Issues

```
WCAG contrast validation failed
```

**Solution**: Adjust color palette luminance to meet 4.5:1 ratio for text on background

## Future Enhancements

- [ ] Automated design capture from live websites (Puppeteer)
- [ ] A/B testing for archetype effectiveness
- [ ] Machine learning for archetype selection
- [ ] User preference learning (adapt archetypes based on feedback)
- [ ] Industry-specific archetype variations (e.g., bakery-french vs bakery-modern)
- [ ] Seasonal palette variations
- [ ] Accessibility enhancements (WCAG AAA support)

## Contributing

To add new archetype packs:

1. Research 5-10 exemplar websites in the industry
2. Extract common design patterns (colors, typography, layouts)
3. Define archetype pack with all required fields
4. Add to `comprehensive-archetype-packs.ts`
5. Test generation with real business descriptions
6. Validate output quality and consistency

---

**Maintained by**: AI Web Creator Team
**Last Updated**: 2025-02-05
**Version**: 1.0.0
