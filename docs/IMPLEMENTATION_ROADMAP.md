# Build Guidance Sidebar - Implementation Roadmap

## Quick Start: What We're Building

Transform Webese.ai from a one-shot website generator into an **interactive AI design partner** that:

1. **Guides users** through the build process with intelligent questions
2. **Researches** their industry for design inspiration
3. **Extracts** winning color schemes and layouts
4. **Generates** photorealistic AI images perfectly matched to their business
5. **Injects** user-specific content into beautiful, variable-based templates

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BUILD GUIDANCE FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   [User Starts Build]                                                    │
│         │                                                                │
│         ▼                                                                │
│   ┌─────────────┐    ┌──────────────────┐    ┌───────────────────┐     │
│   │  PHASE 1    │───▶│    PHASE 2       │───▶│    PHASE 3        │     │
│   │  Business   │    │   Design Style    │    │   Content Tone    │     │
│   │  Details    │    │   & Colors        │    │   & Messaging     │     │
│   └─────────────┘    └──────────────────┘    └───────────────────┘     │
│         │                    │                        │                 │
│         ▼                    ▼                        ▼                 │
│   ┌─────────────┐    ┌──────────────────┐    ┌───────────────────┐     │
│   │ Extract:    │    │ Extract:         │    │ Extract:          │     │
│   │ - Name      │    │ - Color palette  │    │ - Voice/tone      │     │
│   │ - Type      │    │ - Typography     │    │ - CTAs            │     │
│   │ - Location  │    │ - Layout style   │    │ - Key messages    │     │
│   │ - Contact   │    │ - Mood           │    │ - Value props     │     │
│   │ - Social    │    │ - Inspirations   │    │ - Target audience │     │
│   └─────────────┘    └──────────────────┘    └───────────────────┘     │
│         │                    │                        │                 │
│         └────────────────────┼────────────────────────┘                 │
│                              ▼                                          │
│                    ┌──────────────────┐                                 │
│                    │  PHASE 4         │                                 │
│                    │  AI Generation   │                                 │
│                    │  with Variables  │                                 │
│                    └──────────────────┘                                 │
│                              │                                          │
│         ┌────────────────────┼────────────────────┐                     │
│         ▼                    ▼                    ▼                     │
│   ┌───────────┐    ┌──────────────────┐   ┌───────────────┐            │
│   │ Generate  │    │ Apply Design     │   │ Inject User   │            │
│   │ AI Images │    │ Tokens to CSS    │   │ Variables     │            │
│   └───────────┘    └──────────────────┘   └───────────────┘            │
│                              │                                          │
│                              ▼                                          │
│                    ┌──────────────────┐                                 │
│                    │  Beautiful,      │                                 │
│                    │  Personalized    │                                 │
│                    │  Website         │                                 │
│                    └──────────────────┘                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Design Token System (Foundation)

### 1.1 Create Design Token Types

**File: `/lib/types/design-tokens.types.ts`**

```typescript
// HSL Color representation for flexible theming
export interface HSLColor {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}

// Complete Design Token Set
export interface DesignTokens {
  // Identity
  id: string;
  name: string;

  // Typography
  typography: {
    primary: {
      family: string;          // 'Playfair Display', 'Inter', etc.
      weights: number[];       // [400, 500, 600, 700]
      googleFont: string;      // URL for Google Fonts
    };
    secondary: {
      family: string;
      weights: number[];
      googleFont: string;
    };
  };

  // Color Palette
  colors: {
    primary: HSLColor;
    primaryForeground: HSLColor;
    secondary: HSLColor;
    secondaryForeground: HSLColor;
    accent: HSLColor;
    accentForeground: HSLColor;
    background: HSLColor;
    foreground: HSLColor;
    muted: HSLColor;
    mutedForeground: HSLColor;
    border: HSLColor;
    card: HSLColor;
    cardForeground: HSLColor;
  };

  // Derived Colors (auto-generated from palette)
  gradients: {
    primary: string;       // CSS gradient
    accent: string;
    overlay: string;
    hero: string;
  };

  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
    card: string;
    hover: string;
  };

  // Layout
  layout: {
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    spacing: 'compact' | 'normal' | 'spacious';
    maxWidth: 'narrow' | 'normal' | 'wide' | 'full';
  };

  // Component Styles
  components: {
    header: {
      style: 'minimal' | 'standard' | 'transparent' | 'centered';
      sticky: boolean;
      blur: boolean;
    };
    hero: {
      style: 'fullscreen' | 'split' | 'centered' | 'minimal';
      overlay: boolean;
      overlayOpacity: number;
    };
    cards: {
      style: 'flat' | 'elevated' | 'bordered' | 'glass';
      hoverEffect: 'none' | 'lift' | 'scale' | 'glow';
    };
    buttons: {
      style: 'solid' | 'outline' | 'ghost' | 'gradient';
      roundness: 'square' | 'rounded' | 'pill';
    };
  };

  // Mood & Feel
  mood: 'luxury' | 'warm' | 'modern' | 'professional' | 'playful' |
        'minimal' | 'bold' | 'elegant' | 'natural' | 'tech';

  // Animation
  animation: {
    enabled: boolean;
    duration: 'fast' | 'normal' | 'slow';
    style: 'subtle' | 'smooth' | 'bouncy' | 'dramatic';
  };
}

// Preset templates based on moods
export type DesignPreset = 'luxury' | 'warm-artisan' | 'modern-tech' |
                           'professional-corporate' | 'creative-bold' |
                           'natural-organic' | 'minimal-clean' | 'playful-vibrant';
```

### 1.2 Create Business Variables Types

**File: `/lib/types/business-variables.types.ts`**

```typescript
export interface BusinessVariables {
  // Core Identity
  businessName: string;
  tagline?: string;
  foundedYear?: string;

  // Business Info
  businessType: string;
  description: string;
  industry: string;

  // Location
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  // Contact
  email?: string;
  phone?: string;

  // Social Media
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };

  // Operating Hours
  hours?: {
    [key: string]: { open: string; close: string } | 'closed';
  };

  // Unique Selling Points
  usps: string[];

  // Target Audience
  targetAudience?: string;

  // Services/Products
  offerings: {
    name: string;
    description: string;
    price?: string;
  }[];

  // Generated Content (filled during build)
  generatedContent?: {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    ctaPrimary: string;
    ctaSecondary: string;
    aboutTitle: string;
    aboutContent: string;
    servicesIntro: string;
    testimonialPrompt?: string;
  };
}
```

### 1.3 Create Design Token Presets

**File: `/lib/config/design-presets.ts`**

```typescript
import { DesignTokens, DesignPreset } from '../types/design-tokens.types';

export const DESIGN_PRESETS: Record<DesignPreset, Partial<DesignTokens>> = {
  'luxury': {
    name: 'Luxury Elegance',
    typography: {
      primary: {
        family: 'Playfair Display',
        weights: [400, 500, 600, 700],
        googleFont: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap'
      },
      secondary: {
        family: 'Inter',
        weights: [300, 400, 500, 600],
        googleFont: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap'
      }
    },
    colors: {
      primary: { h: 210, s: 60, l: 15 },          // Deep navy
      primaryForeground: { h: 0, s: 0, l: 100 },
      accent: { h: 45, s: 75, l: 55 },            // Elegant gold
      accentForeground: { h: 210, s: 60, l: 15 },
      background: { h: 0, s: 0, l: 100 },
      foreground: { h: 210, s: 60, l: 12 },
      secondary: { h: 0, s: 0, l: 96 },
      secondaryForeground: { h: 210, s: 60, l: 15 },
      muted: { h: 0, s: 0, l: 96 },
      mutedForeground: { h: 0, s: 0, l: 40 },
      border: { h: 0, s: 0, l: 90 },
      card: { h: 0, s: 0, l: 100 },
      cardForeground: { h: 210, s: 60, l: 12 },
    },
    layout: {
      borderRadius: 'sm',
      spacing: 'spacious',
      maxWidth: 'normal'
    },
    components: {
      header: { style: 'transparent', sticky: true, blur: true },
      hero: { style: 'fullscreen', overlay: true, overlayOpacity: 0.4 },
      cards: { style: 'elevated', hoverEffect: 'lift' },
      buttons: { style: 'solid', roundness: 'square' }
    },
    mood: 'luxury',
    animation: { enabled: true, duration: 'slow', style: 'smooth' }
  },

  'warm-artisan': {
    name: 'Warm Artisan',
    typography: {
      primary: {
        family: 'Playfair Display',
        weights: [400, 600, 700],
        googleFont: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap'
      },
      secondary: {
        family: 'Lato',
        weights: [300, 400, 700],
        googleFont: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap'
      }
    },
    colors: {
      primary: { h: 25, s: 60, l: 30 },           // Rich brown
      primaryForeground: { h: 0, s: 0, l: 100 },
      accent: { h: 35, s: 80, l: 50 },            // Golden amber
      accentForeground: { h: 25, s: 60, l: 15 },
      background: { h: 30, s: 30, l: 97 },        // Creamy beige
      foreground: { h: 25, s: 40, l: 20 },
      secondary: { h: 30, s: 20, l: 95 },
      secondaryForeground: { h: 25, s: 60, l: 25 },
      muted: { h: 30, s: 15, l: 93 },
      mutedForeground: { h: 25, s: 20, l: 45 },
      border: { h: 30, s: 20, l: 88 },
      card: { h: 30, s: 25, l: 99 },
      cardForeground: { h: 25, s: 40, l: 20 },
    },
    layout: {
      borderRadius: 'md',
      spacing: 'normal',
      maxWidth: 'normal'
    },
    components: {
      header: { style: 'standard', sticky: true, blur: true },
      hero: { style: 'split', overlay: false, overlayOpacity: 0 },
      cards: { style: 'bordered', hoverEffect: 'lift' },
      buttons: { style: 'solid', roundness: 'rounded' }
    },
    mood: 'warm',
    animation: { enabled: true, duration: 'normal', style: 'smooth' }
  },

  'modern-tech': {
    name: 'Modern Tech',
    typography: {
      primary: {
        family: 'Inter',
        weights: [400, 500, 600, 700, 800],
        googleFont: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
      },
      secondary: {
        family: 'Inter',
        weights: [300, 400, 500],
        googleFont: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap'
      }
    },
    colors: {
      primary: { h: 222, s: 84, l: 5 },           // Near black
      primaryForeground: { h: 0, s: 0, l: 100 },
      accent: { h: 250, s: 100, l: 65 },          // Vibrant purple
      accentForeground: { h: 0, s: 0, l: 100 },
      background: { h: 0, s: 0, l: 100 },
      foreground: { h: 222, s: 84, l: 5 },
      secondary: { h: 210, s: 40, l: 96 },
      secondaryForeground: { h: 222, s: 47, l: 11 },
      muted: { h: 210, s: 40, l: 96 },
      mutedForeground: { h: 215, s: 16, l: 47 },
      border: { h: 214, s: 32, l: 91 },
      card: { h: 0, s: 0, l: 100 },
      cardForeground: { h: 222, s: 84, l: 5 },
    },
    layout: {
      borderRadius: 'lg',
      spacing: 'spacious',
      maxWidth: 'wide'
    },
    components: {
      header: { style: 'minimal', sticky: true, blur: true },
      hero: { style: 'centered', overlay: false, overlayOpacity: 0 },
      cards: { style: 'glass', hoverEffect: 'scale' },
      buttons: { style: 'gradient', roundness: 'pill' }
    },
    mood: 'modern',
    animation: { enabled: true, duration: 'fast', style: 'bouncy' }
  },

  // Add more presets: professional-corporate, creative-bold, etc.
};

// Map business types to recommended presets
export const BUSINESS_TYPE_PRESETS: Record<string, DesignPreset> = {
  'real-estate': 'luxury',
  'law-firm': 'luxury',
  'financial': 'luxury',
  'hospitality': 'luxury',

  'bakery': 'warm-artisan',
  'coffee-shop': 'warm-artisan',
  'restaurant': 'warm-artisan',

  'tech-saas': 'modern-tech',
  'ecommerce': 'modern-tech',

  'consulting': 'professional-corporate',
  'accounting': 'professional-corporate',
  'insurance': 'professional-corporate',

  'creative-agency': 'creative-bold',
  'marketing-agency': 'creative-bold',
  'photography': 'minimal-clean',

  'yoga-studio': 'natural-organic',
  'landscaping': 'natural-organic',

  'fitness': 'playful-vibrant',
  'pet-services': 'playful-vibrant',
};
```

### 1.4 CSS Variable Generator

**File: `/lib/utils/generate-css-variables.ts`**

```typescript
import { DesignTokens, HSLColor } from '../types/design-tokens.types';

function hslToString(color: HSLColor): string {
  return `${color.h} ${color.s}% ${color.l}%`;
}

export function generateCSSVariables(tokens: DesignTokens): string {
  return `:root {
    /* Typography */
    --font-primary: '${tokens.typography.primary.family}', serif;
    --font-secondary: '${tokens.typography.secondary.family}', sans-serif;

    /* Colors */
    --primary: ${hslToString(tokens.colors.primary)};
    --primary-foreground: ${hslToString(tokens.colors.primaryForeground)};
    --secondary: ${hslToString(tokens.colors.secondary)};
    --secondary-foreground: ${hslToString(tokens.colors.secondaryForeground)};
    --accent: ${hslToString(tokens.colors.accent)};
    --accent-foreground: ${hslToString(tokens.colors.accentForeground)};
    --background: ${hslToString(tokens.colors.background)};
    --foreground: ${hslToString(tokens.colors.foreground)};
    --muted: ${hslToString(tokens.colors.muted)};
    --muted-foreground: ${hslToString(tokens.colors.mutedForeground)};
    --border: ${hslToString(tokens.colors.border)};
    --card: ${hslToString(tokens.colors.card)};
    --card-foreground: ${hslToString(tokens.colors.cardForeground)};

    /* Gradients */
    --gradient-primary: ${tokens.gradients.primary};
    --gradient-accent: ${tokens.gradients.accent};
    --gradient-overlay: ${tokens.gradients.overlay};
    --gradient-hero: ${tokens.gradients.hero};

    /* Shadows */
    --shadow-sm: ${tokens.shadows.sm};
    --shadow-md: ${tokens.shadows.md};
    --shadow-lg: ${tokens.shadows.lg};
    --shadow-card: ${tokens.shadows.card};
    --shadow-hover: ${tokens.shadows.hover};

    /* Layout */
    --radius: ${getRadiusValue(tokens.layout.borderRadius)};
    --spacing-unit: ${getSpacingValue(tokens.layout.spacing)};
    --max-width: ${getMaxWidthValue(tokens.layout.maxWidth)};
  }`;
}

function getRadiusValue(radius: string): string {
  const values = { none: '0', sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px' };
  return values[radius] || '0.5rem';
}

function getSpacingValue(spacing: string): string {
  const values = { compact: '0.75rem', normal: '1rem', spacious: '1.5rem' };
  return values[spacing] || '1rem';
}

function getMaxWidthValue(maxWidth: string): string {
  const values = { narrow: '960px', normal: '1280px', wide: '1536px', full: '100%' };
  return values[maxWidth] || '1280px';
}
```

---

## Phase 2: Build Guidance Sidebar

### 2.1 Build Guidance Store

**File: `/lib/store/build-guidance.store.ts`**

```typescript
import { create } from 'zustand';
import { DesignTokens } from '../types/design-tokens.types';
import { BusinessVariables } from '../types/business-variables.types';

export type BuildPhase =
  | 'welcome'
  | 'business-details'
  | 'design-style'
  | 'content-tone'
  | 'generating'
  | 'preview'
  | 'complete';

interface BuildGuidanceState {
  // Current phase
  currentPhase: BuildPhase;
  phaseHistory: BuildPhase[];

  // User inputs
  businessVariables: Partial<BusinessVariables>;
  designTokens: Partial<DesignTokens>;

  // Suggestions from AI
  suggestedDesigns: DesignTokens[];
  suggestedContent: Record<string, string[]>;

  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  generationStep: string;

  // Preview
  previewHtml: string;

  // Actions
  setPhase: (phase: BuildPhase) => void;
  goBack: () => void;
  updateBusinessVariables: (updates: Partial<BusinessVariables>) => void;
  updateDesignTokens: (updates: Partial<DesignTokens>) => void;
  setSuggestedDesigns: (designs: DesignTokens[]) => void;
  setGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number, step: string) => void;
  setPreview: (html: string) => void;
  reset: () => void;
}

export const useBuildGuidance = create<BuildGuidanceState>((set, get) => ({
  currentPhase: 'welcome',
  phaseHistory: [],
  businessVariables: {},
  designTokens: {},
  suggestedDesigns: [],
  suggestedContent: {},
  isGenerating: false,
  generationProgress: 0,
  generationStep: '',
  previewHtml: '',

  setPhase: (phase) => set((state) => ({
    currentPhase: phase,
    phaseHistory: [...state.phaseHistory, state.currentPhase]
  })),

  goBack: () => set((state) => {
    const history = [...state.phaseHistory];
    const previousPhase = history.pop() || 'welcome';
    return { currentPhase: previousPhase, phaseHistory: history };
  }),

  updateBusinessVariables: (updates) => set((state) => ({
    businessVariables: { ...state.businessVariables, ...updates }
  })),

  updateDesignTokens: (updates) => set((state) => ({
    designTokens: { ...state.designTokens, ...updates }
  })),

  setSuggestedDesigns: (designs) => set({ suggestedDesigns: designs }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setProgress: (progress, step) => set({
    generationProgress: progress,
    generationStep: step
  }),

  setPreview: (html) => set({ previewHtml: html }),

  reset: () => set({
    currentPhase: 'welcome',
    phaseHistory: [],
    businessVariables: {},
    designTokens: {},
    suggestedDesigns: [],
    suggestedContent: {},
    isGenerating: false,
    generationProgress: 0,
    generationStep: '',
    previewHtml: ''
  })
}));
```

### 2.2 Build Guidance Sidebar Component

**File: `/components/build-guidance/BuildGuidanceSidebar.tsx`**

```tsx
'use client';

import { useBuildGuidance } from '@/lib/store/build-guidance.store';
import { WelcomePhase } from './phases/WelcomePhase';
import { BusinessDetailsPhase } from './phases/BusinessDetailsPhase';
import { DesignStylePhase } from './phases/DesignStylePhase';
import { ContentTonePhase } from './phases/ContentTonePhase';
import { GeneratingPhase } from './phases/GeneratingPhase';
import { PreviewPhase } from './phases/PreviewPhase';
import { PhaseIndicator } from './PhaseIndicator';
import { motion, AnimatePresence } from 'framer-motion';

export function BuildGuidanceSidebar() {
  const { currentPhase, goBack, phaseHistory } = useBuildGuidance();

  const phases = {
    'welcome': WelcomePhase,
    'business-details': BusinessDetailsPhase,
    'design-style': DesignStylePhase,
    'content-tone': ContentTonePhase,
    'generating': GeneratingPhase,
    'preview': PreviewPhase,
    'complete': PreviewPhase,
  };

  const PhaseComponent = phases[currentPhase];

  return (
    <div className="w-[400px] bg-gray-900 border-l border-gray-800 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          {phaseHistory.length > 0 && currentPhase !== 'generating' && (
            <button
              onClick={goBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
          )}
          <h2 className="text-lg font-semibold text-white">Build Your Website</h2>
        </div>
        <PhaseIndicator currentPhase={currentPhase} />
      </div>

      {/* Phase Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            <PhaseComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

### 2.3 Design Style Phase (Example)

**File: `/components/build-guidance/phases/DesignStylePhase.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useBuildGuidance } from '@/lib/store/build-guidance.store';
import { DESIGN_PRESETS, BUSINESS_TYPE_PRESETS } from '@/lib/config/design-presets';
import { motion } from 'framer-motion';
import { Palette, Type, Layout, Sparkles } from 'lucide-react';

export function DesignStylePhase() {
  const {
    businessVariables,
    updateDesignTokens,
    setPhase,
    setSuggestedDesigns
  } = useBuildGuidance();

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  // Get recommended preset based on business type
  const recommendedPreset = businessVariables.businessType
    ? BUSINESS_TYPE_PRESETS[businessVariables.businessType]
    : null;

  // Fetch AI suggestions on mount
  useEffect(() => {
    fetchAISuggestions();
  }, []);

  async function fetchAISuggestions() {
    setAiSuggesting(true);
    try {
      const response = await fetch('/api/build-guidance/suggest-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessVariables.businessName,
          businessType: businessVariables.businessType,
          description: businessVariables.description
        })
      });

      if (response.ok) {
        const { suggestions } = await response.json();
        setSuggestedDesigns(suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch design suggestions:', error);
    }
    setAiSuggesting(false);
  }

  function handlePresetSelect(presetId: string) {
    setSelectedPreset(presetId);
    const preset = DESIGN_PRESETS[presetId];
    if (preset) {
      updateDesignTokens(preset);
    }
  }

  function handleContinue() {
    setPhase('content-tone');
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Design Style
        </h3>
        <p className="text-gray-400">
          Choose a visual style that represents your brand
        </p>
      </div>

      {/* AI Recommended Badge */}
      {recommendedPreset && (
        <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Recommended</span>
          </div>
          <p className="text-sm text-gray-300">
            Based on your business type, we recommend the
            <strong className="text-white"> {DESIGN_PRESETS[recommendedPreset]?.name}</strong> style.
          </p>
        </div>
      )}

      {/* Style Grid */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(DESIGN_PRESETS).slice(0, 6).map(([id, preset]) => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePresetSelect(id)}
            className={`
              relative p-4 rounded-lg border-2 transition-all text-left
              ${selectedPreset === id
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'}
            `}
          >
            {/* Color preview */}
            <div className="flex gap-1 mb-3">
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  backgroundColor: `hsl(${preset.colors?.primary?.h} ${preset.colors?.primary?.s}% ${preset.colors?.primary?.l}%)`
                }}
              />
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  backgroundColor: `hsl(${preset.colors?.accent?.h} ${preset.colors?.accent?.s}% ${preset.colors?.accent?.l}%)`
                }}
              />
            </div>

            <h4 className="font-medium text-white text-sm mb-1">
              {preset.name}
            </h4>
            <p className="text-xs text-gray-400">
              {preset.typography?.primary?.family}
            </p>

            {id === recommendedPreset && (
              <div className="absolute top-2 right-2">
                <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                  Best Match
                </span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Customize Option */}
      <button
        onClick={() => setCustomizing(!customizing)}
        className="w-full py-3 border border-dashed border-gray-600 rounded-lg
                   text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
      >
        <Palette className="w-4 h-4 inline mr-2" />
        Customize colors & typography
      </button>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!selectedPreset}
        className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700
                   disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
      >
        Continue to Content
      </button>
    </div>
  );
}
```

---

## Phase 3: Intelligent Image System

### 3.1 Enhanced Unsplash Search

**File: `/lib/services/image-intelligence.ts`**

```typescript
import { getBusinessTypeById } from '../config/business-types';

interface ImageSearchParams {
  businessType: string;
  businessName: string;
  sectionType: 'hero' | 'about' | 'services' | 'gallery' | 'team';
  description?: string;
  colorHint?: string;
}

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  color: string;
}

// Generate intelligent search queries for Unsplash
export function generateImageSearchQueries(params: ImageSearchParams): string[] {
  const { businessType, businessName, sectionType, description } = params;
  const typeConfig = getBusinessTypeById(businessType);

  const queries: string[] = [];

  // Base industry query
  if (typeConfig) {
    queries.push(`${typeConfig.label} ${sectionType === 'hero' ? 'business' : sectionType}`);

    // Add keyword-based queries
    typeConfig.keywords.slice(0, 2).forEach(keyword => {
      queries.push(`${keyword} modern professional`);
    });
  }

  // Section-specific queries
  switch (sectionType) {
    case 'hero':
      queries.push(`${businessType} workspace modern`, `${businessType} professional banner`);
      break;
    case 'about':
      queries.push('team collaboration', 'professional workspace', 'business meeting');
      break;
    case 'services':
      queries.push(`${businessType} services`, 'professional consultation');
      break;
    case 'gallery':
      queries.push(`${businessType} portfolio`, `${businessType} showcase`);
      break;
    case 'team':
      queries.push('professional team', 'business people', 'corporate team');
      break;
  }

  return queries;
}

// Search Unsplash with intelligent queries
export async function searchUnsplashImages(
  query: string,
  options: { orientation?: 'landscape' | 'portrait' | 'squarish'; perPage?: number } = {}
): Promise<UnsplashImage[]> {
  const { orientation = 'landscape', perPage = 10 } = options;

  const params = new URLSearchParams({
    query,
    orientation,
    per_page: perPage.toString()
  });

  const response = await fetch(
    `https://api.unsplash.com/search/photos?${params}`,
    {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Unsplash search failed');
  }

  const data = await response.json();
  return data.results;
}

// Get best images for a section
export async function getIntelligentImages(params: ImageSearchParams): Promise<UnsplashImage[]> {
  const queries = generateImageSearchQueries(params);

  // Search with multiple queries and combine results
  const allResults: UnsplashImage[] = [];

  for (const query of queries.slice(0, 3)) {
    try {
      const results = await searchUnsplashImages(query, {
        orientation: params.sectionType === 'hero' ? 'landscape' : 'squarish',
        perPage: 5
      });
      allResults.push(...results);
    } catch (error) {
      console.error(`Search failed for query: ${query}`, error);
    }
  }

  // Deduplicate by ID
  const uniqueImages = Array.from(
    new Map(allResults.map(img => [img.id, img])).values()
  );

  // Sort by relevance (could add color matching here)
  return uniqueImages.slice(0, 10);
}
```

### 3.2 AI Image Generation Enhancement

**File: `/lib/services/ai-image-generator.ts`**

```typescript
import OpenAI from 'openai';
import { DesignTokens } from '../types/design-tokens.types';
import { BusinessVariables } from '../types/business-variables.types';
import { getBusinessTypeById } from '../config/business-types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ImageGenerationParams {
  businessVariables: BusinessVariables;
  designTokens: DesignTokens;
  sectionType: 'hero' | 'about' | 'services' | 'gallery';
  style?: 'photorealistic' | 'illustration' | 'abstract';
}

// Generate highly targeted image prompts
function generateImagePrompt(params: ImageGenerationParams): string {
  const { businessVariables, designTokens, sectionType, style = 'photorealistic' } = params;
  const typeConfig = getBusinessTypeById(businessVariables.businessType);

  const colorDescription = describeColorPalette(designTokens);
  const moodDescription = describeMood(designTokens.mood);

  const basePrompts: Record<string, string> = {
    hero: `Create a stunning ${style} hero image for ${businessVariables.businessName},
           a ${typeConfig?.label || businessVariables.businessType} business.
           Style: ${moodDescription}
           Color palette hint: ${colorDescription}
           The image should be professional, modern, and inviting.
           Wide format, suitable for a website hero banner.
           High quality, sharp details, excellent lighting.`,

    about: `Create a ${style} image representing the story and values of
            ${businessVariables.businessName}, a ${typeConfig?.label} business.
            Show authenticity, professionalism, and human connection.
            Style: ${moodDescription}
            Square format, suitable for an about section.`,

    services: `Create a ${style} image showcasing the services of
               ${businessVariables.businessName} in the ${typeConfig?.label} industry.
               Feature: ${businessVariables.offerings?.[0]?.name || 'professional services'}
               Style: ${moodDescription}`,

    gallery: `Create a ${style} portfolio image for ${businessVariables.businessName},
              showcasing their work in ${typeConfig?.label}.
              High quality, professional, attention to detail.`
  };

  return basePrompts[sectionType] || basePrompts.hero;
}

function describeColorPalette(tokens: DesignTokens): string {
  const primary = tokens.colors.primary;
  const accent = tokens.colors.accent;

  // Convert HSL to descriptive words
  const primaryDesc = hslToColorName(primary.h, primary.s, primary.l);
  const accentDesc = hslToColorName(accent.h, accent.s, accent.l);

  return `${primaryDesc} as primary color with ${accentDesc} accents`;
}

function describeMood(mood: string): string {
  const moodDescriptions: Record<string, string> = {
    luxury: 'elegant, sophisticated, premium, refined',
    warm: 'cozy, inviting, comfortable, friendly',
    modern: 'clean, minimal, contemporary, sleek',
    professional: 'trustworthy, established, reliable, corporate',
    playful: 'fun, energetic, vibrant, approachable',
    minimal: 'simple, clean, uncluttered, focused',
    bold: 'striking, impactful, confident, dynamic',
    elegant: 'graceful, refined, tasteful, polished',
    natural: 'organic, earthy, sustainable, fresh',
    tech: 'innovative, futuristic, digital, cutting-edge'
  };

  return moodDescriptions[mood] || 'professional, modern';
}

function hslToColorName(h: number, s: number, l: number): string {
  // Simplified color naming
  if (l < 20) return 'deep dark';
  if (l > 80) return 'light bright';

  if (h < 30) return 'warm red-orange';
  if (h < 60) return 'golden yellow';
  if (h < 120) return 'natural green';
  if (h < 180) return 'cool cyan';
  if (h < 240) return 'deep blue';
  if (h < 300) return 'rich purple';
  return 'warm magenta';
}

// Generate image with DALL-E 3
export async function generateAIImage(params: ImageGenerationParams): Promise<string> {
  const prompt = generateImagePrompt(params);

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: params.sectionType === 'hero' ? '1792x1024' : '1024x1024',
    quality: 'standard',
    style: 'natural'
  });

  if (!response.data?.[0]?.url) {
    throw new Error('No image generated');
  }

  return response.data[0].url;
}
```

---

## Phase 4: Template System

### 4.1 Variable Injection Engine

**File: `/lib/services/template-engine.ts`**

```typescript
import { DesignTokens } from '../types/design-tokens.types';
import { BusinessVariables } from '../types/business-variables.types';

// Template variable patterns
const VARIABLE_PATTERN = /\{\{([^}]+)\}\}/g;

interface TemplateContext {
  business: BusinessVariables;
  design: DesignTokens;
  images: Record<string, string>;
  generated: Record<string, string>;
}

// Inject variables into template content
export function injectVariables(
  template: string,
  context: TemplateContext
): string {
  return template.replace(VARIABLE_PATTERN, (match, path) => {
    const value = getValueByPath(context, path.trim());
    return value !== undefined ? String(value) : match;
  });
}

// Get nested value by dot notation path
function getValueByPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
}

// Example template usage:
/*
  Template: "Welcome to {{business.businessName}}"
  Context: { business: { businessName: "Prestige Real Estate" } }
  Result: "Welcome to Prestige Real Estate"
*/

// Generate complete section content with variables
export function generateSectionFromTemplate(
  sectionType: string,
  context: TemplateContext
): Record<string, any> {
  const templates = getSectionTemplates(sectionType);
  const result: Record<string, any> = {};

  for (const [key, template] of Object.entries(templates)) {
    if (typeof template === 'string') {
      result[key] = injectVariables(template, context);
    } else if (typeof template === 'object') {
      result[key] = generateSectionFromTemplate(key, context);
    }
  }

  return result;
}

// Section templates with variables
function getSectionTemplates(sectionType: string): Record<string, any> {
  const templates: Record<string, Record<string, any>> = {
    HERO: {
      title: '{{generated.heroTitle}}',
      subtitle: '{{business.tagline}}',
      description: '{{generated.heroDescription}}',
      primaryCTA: {
        text: '{{generated.ctaPrimary}}',
        href: '#services'
      },
      secondaryCTA: {
        text: '{{generated.ctaSecondary}}',
        href: '#contact'
      },
      backgroundImage: '{{images.hero}}'
    },

    ABOUT: {
      title: 'About {{business.businessName}}',
      content: '{{generated.aboutContent}}',
      image: '{{images.about}}',
      stats: [
        { value: '{{business.foundedYear}}', label: 'Established' },
        { value: '{{generated.yearsExperience}}+', label: 'Years Experience' },
        { value: '{{generated.clientCount}}+', label: 'Happy Clients' }
      ]
    },

    CONTACT: {
      title: 'Get In Touch',
      subtitle: 'We\'d love to hear from you',
      email: '{{business.email}}',
      phone: '{{business.phone}}',
      address: '{{business.address.street}}, {{business.address.city}}, {{business.address.state}}'
    },

    FOOTER: {
      businessName: '{{business.businessName}}',
      tagline: '{{business.tagline}}',
      social: {
        facebook: '{{business.social.facebook}}',
        instagram: '{{business.social.instagram}}',
        twitter: '{{business.social.twitter}}',
        linkedin: '{{business.social.linkedin}}'
      },
      copyright: '© ' + new Date().getFullYear() + ' {{business.businessName}}. All rights reserved.'
    }
  };

  return templates[sectionType] || {};
}
```

---

## API Endpoints

### `/api/build-guidance/suggest-design`

```typescript
// app/api/build-guidance/suggest-design/route.ts
import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { DESIGN_PRESETS, BUSINESS_TYPE_PRESETS } from '@/lib/config/design-presets';

export async function POST(request: Request) {
  const { businessName, businessType, description } = await request.json();

  // Get recommended preset
  const recommendedPreset = BUSINESS_TYPE_PRESETS[businessType] || 'modern-tech';
  const presetConfig = DESIGN_PRESETS[recommendedPreset];

  // Ask AI for additional customization suggestions
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a design expert. Suggest design modifications for a ${businessType} website.`
      },
      {
        role: 'user',
        content: `Business: ${businessName}
                  Description: ${description}
                  Base style: ${presetConfig?.name}

                  Suggest specific color adjustments, typography tweaks, and mood modifications
                  to make this design perfect for this specific business.

                  Return JSON with: colorSuggestions, typographySuggestions, moodNotes`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const suggestions = JSON.parse(response.choices[0]?.message?.content || '{}');

  return NextResponse.json({
    recommendedPreset,
    presetConfig,
    suggestions
  });
}
```

---

## Summary

This implementation roadmap provides a complete path to building the world-class Build Guidance Sidebar. The key innovations are:

1. **Design Token System** - Flexible, reusable styling that adapts to any business
2. **Variable Injection** - Templates that automatically personalize for each user
3. **AI-Powered Suggestions** - Intelligent recommendations at every step
4. **Intelligent Imagery** - Smart Unsplash search + targeted DALL-E generation
5. **Interactive Build Flow** - Users guide the AI, creating collaborative designs

Each phase builds on the previous, allowing incremental delivery of value while working toward the complete vision.
