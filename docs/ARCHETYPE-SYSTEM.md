

# Archetype-Based Website Generation System

## Overview

This system implements a sophisticated, **archetype-based design approach** inspired by industry best practices. Instead of hardcoding design decisions, we use reusable "Archetype Packs" that combine design systems, layout patterns, component specifications, and content strategies.

## Core Concepts

### 1. Archetype Packs

An **Archetype Pack** is a complete design system keyed by `business_type + vibe`:

```typescript
Archetype Pack = {
  // Design tokens
  colors, fonts, radii, shadows, spacing scale

  // Layout recipe
  common sections + ordering + patterns

  // Component variants
  header styles, hero templates, cards, CTAs

  // Copy tone rules
  short/punchy vs warm/story-led vs premium

  // Media rules
  image style (moody, bright, minimal), framing
}
```

**Example**: `bakery.warm_artisanal` pack defaults to:
- Warm neutrals + serif headings
- Product grid layout
- Story-led about section
- Close-up food photography
- Inviting, first-person copy

### 2. Design Intent Templates

Instead of hardcoding "Warm bakery palette...", we use **templates with variables**:

```typescript
Design Intent = {
  outcome: "what the site should achieve"
  audience: "who it's for"
  feel: "emotional response desired"

  style constraints: "modern/minimal, warm, premium..."
  tokens: "colors/fonts/radius/spacing"
  components required: "header/hero/sections/footer"
  content rules: "concise, benefits-first, local SEO"
}
```

The system fills these variables based on:
- Selected archetype pack
- Business type configuration
- User's description and context

### 3. Three-Layer Output

The generator produces:

1. **tokens.json** - Design system (colors, fonts, spacing, radii, shadows)
2. **sections.schema.json** - Content model (ordered sections + data)
3. **components/** - Reusable UI components

## System Architecture

```
User Input
    ↓
Business Type Detection
    ↓
Archetype Pack Selection ← (business type + vibe)
    ↓
Design Intent Building ← (archetype + user context)
    ↓
AI Prompt Generation ← (design intent template)
    ↓
Content Generation ← (GPT-4 with design intent)
    ↓
Validation ← (check against archetype rules)
    ↓
Final Output (content + tokens + schema)
```

## File Structure

```
/lib/archetypes/
  ├── archetype-packs.ts          # Pre-built archetype definitions
  ├── design-intent-builder.ts    # Converts archetypes to AI prompts
  └── archetype-generator.ts      # Main generation orchestrator

/lib/design-tokens/
  └── token-normalizer.ts         # Color extraction & WCAG validation

/lib/web-capture/
  └── (future) palette-extractor.ts  # Extract colors from exemplar sites
```

## Usage

### Basic Generation

```typescript
import { generateWithArchetype } from '@/lib/archetypes/archetype-generator';

const result = await generateWithArchetype({
  businessName: 'Sweet Delights Bakery',
  description: 'Artisanal bakery specializing in sourdough and pastries',
  businessType: bakeryBusinessType,
  targetAudience: 'Local food enthusiasts',
  location: 'Portland, OR',
  vibe: 'warm_artisanal', // Optional - auto-selected if omitted
});

// Result includes:
// - result.content: Generated website content
// - result.archetype: Selected archetype pack
// - result.designIntent: Design intent used
// - result.tokens: Design tokens for frontend
```

### Get Design Guidance

```typescript
import { getCopyGuidance, getImageGuidance } from '@/lib/archetypes/archetype-generator';

const copyGuide = getCopyGuidance(archetype, 'HERO');
// → "Use narrative, story-driven copy that builds emotional connection.
//    Lead headlines with the transformation or result customers will experience.
//    Keep headlines concise: 3-6 words maximum.
//    Write in first person (we, our, us).
//    Use casual, conversational language."

const imageGuide = getImageGuidance(archetype, 'HERO');
// → "warm, natural light food photography with soft focus, artisanal presentation.
//    Mood: bright, Framing: close-up, Composition: clean.
//    Keywords: artisan bread, fresh pastries, bakery interior"
```

## Pre-Built Archetype Packs

### Bakery - Warm Artisanal

**Vibe**: `warm_artisanal`
**Colors**: Warm neutrals (#FFFBF5 bg, #D4A574 primary, #C17A4A accent)
**Typography**: Cormorant Garamond (headings), Open Sans (body)
**Layout**: Hero → Features → About → Gallery → Testimonials → Contact
**Copy**: Story-led, first-person, casual, warm emotion
**Images**: Close-up food photography, bright mood, clean composition
**Inspiration**: Tartine, Levain, Magnolia

### Electrician - Professional Trustworthy

**Vibe**: `professional_trustworthy`
**Colors**: Light slate (#F8FAFC bg, #EAB308 primary, #3B82F6 accent)
**Typography**: Inter (both headings and body)
**Layout**: Hero → Services → About → Trust Badges → Testimonials → CTA → Contact
**Copy**: Concise, benefit-driven, second-person, professional, neutral
**Images**: Wide shots, professional mood, electricians at work
**Inspiration**: Mister Sparky, HomeAdvisor

### Tech SaaS - Modern Minimal

**Vibe**: `modern_minimal`
**Colors**: Near-white (#FAFAFA bg, #2563EB primary, #06B6D4 accent)
**Typography**: Inter (both), optional JetBrains Mono
**Layout**: Hero → Features → How It Works → Pricing → Testimonials → CTA
**Copy**: Concise, outcome-first, second-person, professional, enthusiastic
**Images**: Product-focused, minimal mood, screenshots and illustrations
**Inspiration**: Stripe, Linear, Vercel, Notion

## Component Specifications

### Baseline Header (Required)

```typescript
{
  layout: 'centered' | 'split' | 'justified',
  sticky: boolean,
  background: 'transparent' | 'solid' | 'blur',
  logoPosition: 'left' | 'center',
  ctaStyle: 'button' | 'link' | 'none',

  // Content
  logo: image or text,
  nav: 3-6 items,
  socialIcons: optional,
  primaryCTA: optional
}
```

### Baseline Hero (Required)

```typescript
{
  layout: 'centered' | 'split-left' | 'split-right' | 'fullscreen',
  imageStyle: 'background' | 'side' | 'floating' | 'none',
  headlineSize: 'xl' | '2xl' | '3xl' | '4xl',
  ctaCount: 1 | 2,
  ctaStyle: 'solid' | 'outline' | 'minimal',

  // Content
  image: Unsplash or DALL-E (matching business type + vibe),
  headline: "Outcome + differentiator",
  subhead: "Proof + locality",
  primaryCTA: "Book / Order / Call",
  secondaryCTA: optional
}
```

### Core Sections (Recommended)

1. **Featured Offerings** - Cards/grid of products or services
2. **About** - Two-column: story + image
3. **Trust** - Testimonials/ratings/logos
4. **CTA Band** - High contrast, urgent action
5. **Contact** - Map/address/hours/form

## Design Token System

### Colors

Every archetype defines WCAG-compliant colors:

```typescript
colors: {
  bg: string;           // Background (#FFFFFF)
  surface: string;      // Cards, panels
  text: string;         // Primary text (4.5:1 contrast min)
  muted: string;        // Secondary text
  primary: string;      // Brand primary
  primaryContrast: string; // Text on primary (4.5:1 contrast min)
  accent: string;       // Accent color
  border: string;       // Border/divider
  success: string;      // Success states (#10B981)
  warning: string;      // Warning states (#F59E0B)
  error: string;        // Error states (#EF4444)
}
```

**Validation**: All color pairs are checked against WCAG AA (4.5:1 for normal text, 3:1 for large text).

### Typography

```typescript
typography: {
  headingFont: string;  // Font family
  bodyFont: string;     // Font family
  headingWeight: 400-900,
  bodyWeight: 400-700,
  baseSize: "16px",
  scale: 1.25          // Type scale ratio (major third)
}
```

**Type Scale Example** (1.25 ratio):
- Base: 16px
- Small: 13px (16 / 1.25)
- H6: 20px (16 × 1.25)
- H5: 25px (16 × 1.25²)
- H4: 31px (16 × 1.25³)
- H3: 39px (16 × 1.25⁴)
- H2: 49px (16 × 1.25⁵)
- H1: 61px (16 × 1.25⁶)

### Spacing

```typescript
spacing: {
  unit: 8,             // Base unit (4 or 8 typical)
  scale: [0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24] // Multipliers
}
```

**Spacing Values**:
- xs: 4px (0.5 × 8)
- sm: 8px (1 × 8)
- md: 16px (2 × 8)
- lg: 24px (3 × 8)
- xl: 32px (4 × 8)
- 2xl: 48px (6 × 8)
- 3xl: 64px (8 × 8)
- 4xl: 96px (12 × 8)
- 5xl: 128px (16 × 8)
- 6xl: 192px (24 × 8)

## Copy Tone System

### Tone Styles

**story-led**: Narrative, emotional connection, longer form
Example: "Every morning at 5 AM, our bakers begin crafting..."

**concise**: Direct, benefit-focused, action-oriented
Example: "Licensed electricians. 24/7 emergency service. Call now."

**premium**: Sophisticated, aspirational, quality-focused
Example: "Exquisite artisanal creations for the discerning palate"

**playful**: Personality-driven, memorable, fun
Example: "We knead you! Fresh bread that'll make you rise and shine"

**technical**: Detailed, expertise-driven, credibility-building
Example: "200-amp service panels with arc-fault protection installed to NEC code"

### Headline Patterns

**outcome-first**: Lead with the transformation
Example: "Transform Your Kitchen with Professional Electrical Upgrades"

**benefit-driven**: Focus on value proposition
Example: "Safe, Reliable Electrical Services for Your Home"

**question**: Engage with relevant questions
Example: "Need an Emergency Electrician? We're Available 24/7"

**statement**: Bold declarations
Example: "Portland's Most Trusted Electrical Contractor Since 2005"

## Image Generation Rules

Each archetype defines:

- **Style**: "warm, natural light food photography" vs "professional electrician at work"
- **Mood**: bright, moody, minimal, vibrant, professional
- **Framing**: close-up, wide, portrait, product-focused, lifestyle
- **Composition**: clean, busy, artistic, documentary
- **Keywords**: Search terms for Unsplash or DALL-E prompts

**Example Prompts**:

Bakery (warm artisanal):
```
"warm, natural light food photography with soft focus, artisanal presentation,
close-up of fresh sourdough bread, clean composition, bright mood"
```

Electrician (professional trustworthy):
```
"professional electrician at work in residential setting, modern electrical panel,
safety equipment visible, clean professional environment, wide shot, professional mood"
```

## Future Enhancements

### 1. Web-Inspired Design Capture

**A) Find Exemplars**
- Query: "best {business_type} websites"
- Sources: Awwwards, Behance, curated lists
- Rank: 10-20 candidates

**B) Capture Palette**
- CSS color scrape (parse stylesheets, inline styles)
- Screenshot dominant colors (render + extract)
- Puppeteer screenshot + color extraction

**C) Layout Signals**
- Detect: hero present? photo grid? cards? two-column?
- Section density: tight vs airy
- Header style: sticky? centered? icons?
- Spacing feel: avg section padding

**D) Convert to Tokens**
- Normalize: `--bg, --surface, --text, --primary, --accent`
- Validate: WCAG contrast thresholds
- Harmonize: slight hue/sat normalization

### 2. A/B Testing System

Generate multiple archetype variants for testing:
- `bakery.warm_artisanal` vs `bakery.modern_minimal`
- Track conversions by archetype
- Auto-optimize archetype selection

### 3. Custom Archetype Builder

Allow users to:
- Upload inspirational sites
- Extract their palette and layout patterns
- Save as custom archetype pack
- Reuse across multiple websites

### 4. Archetype Marketplace

- Community-contributed archetype packs
- Industry-specific packs (legal, medical, fitness, etc.)
- Premium curated packs from professional designers

## Best Practices

### When Creating New Archetypes

1. ✅ **Define complete design tokens** - Don't skip any color/spacing/typography values
2. ✅ **Validate WCAG compliance** - All color pairs must meet 4.5:1 contrast
3. ✅ **Specify layout patterns** - Be explicit about section ordering and density
4. ✅ **Include copy guidance** - Define tone, voice, headline patterns
5. ✅ **Add image style rules** - Specific keywords and mood descriptors
6. ✅ **Reference real exemplars** - List 3-5 inspirational sites
7. ✅ **Test with real content** - Generate actual websites to validate

### When Using Archetypes

1. ✅ **Let archetype guide ALL decisions** - Don't override unless necessary
2. ✅ **Trust the layout recipe** - Section order is intentional
3. ✅ **Follow copy tone rules** - Consistency builds brand
4. ✅ **Use recommended image style** - Visual coherence matters
5. ✅ **Validate output** - Check against archetype specifications

### When Archetype Doesn't Exist

1. Start with closest business type
2. Inspect generated output
3. Note what feels off
4. Create new archetype pack with adjustments
5. Add to `archetype-packs.ts`
6. Test with 3+ real examples

## Examples

### Example 1: Bakery Website

```typescript
// User input
{
  businessName: "Artisan Bread Co.",
  description: "Small-batch sourdough bakery using organic local ingredients",
  businessType: bakery,
}

// System selects: bakery.warm_artisanal

// Design Intent generated:
{
  outcome: "Create an engaging, story-driven experience that builds emotional connection",
  audience: "Local community members seeking fresh, artisanal baked goods",
  feel: "warm, inviting, and authentically crafted",

  palette: {
    description: "warm and inviting, light and airy",
    primary: "#D4A574",  // Warm golden
    accent: "#C17A4A",   // Terracotta
    background: "#FFFBF5" // Warm off-white
  },

  copyTone: "Story-driven copy that builds emotional connection through narrative, conversational tone",
  headlineStyle: "Lead with the transformation or result (6-10 words)",

  imagery: "warm, natural light food photography with soft focus, artisanal presentation"
}

// Content generated follows this EXACT design intent
```

### Example 2: Electrician Website

```typescript
// User input
{
  businessName: "Bright Spark Electric",
  description: "Licensed electrical contractor serving residential and commercial clients",
  businessType: electrician,
}

// System selects: electrician.professional_trustworthy

// Design Intent:
{
  outcome: "Drive immediate action through clear, benefit-focused messaging",
  audience: "Homeowners and businesses needing reliable electrical services",
  feel: "professional, reliable, and confidence-inspiring",

  palette: {
    description: "trustworthy and professional, fresh and modern",
    primary: "#EAB308",  // Yellow (electricity)
    accent: "#3B82F6",   // Blue (trust)
    background: "#F8FAFC" // Light slate
  },

  copyTone: "Direct, benefit-focused copy that drives action, professional tone",
  headlineStyle: "Focus on clear benefits and value proposition (3-6 words)",

  imagery: "professional electrician at work, clean residential and commercial settings, safety equipment visible"
}
```

## Troubleshooting

**Q: Wrong archetype selected?**
A: Check business type detection. May need to add keywords to `business-type-detector.ts`

**Q: Content doesn't match archetype tone?**
A: Verify design intent prompt is being passed to OpenAI. Check `designIntentToPrompt()` output.

**Q: Colors failing WCAG?**
A: Run `validateDesignTokens()`. Adjust primary/accent colors for better contrast.

**Q: Images don't match business type?**
A: Check `mediaRules.imageStyle` in archetype pack. May need more specific keywords.

**Q: Need new archetype pack?**
A: Copy existing pack in `archetype-packs.ts`, modify values, test with real generation.

---

**Status**: Production Ready ✅
**Version**: 1.0.0
**Last Updated**: 2026-02-05
