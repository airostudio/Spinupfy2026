/**
 * Design Token Types for Webese.ai
 * Based on Lovable-style theming system
 */

// HSL Color representation for flexible theming
export interface HSLColor {
  h: number;  // Hue: 0-360
  s: number;  // Saturation: 0-100
  l: number;  // Lightness: 0-100
}

// Font configuration
export interface FontConfig {
  family: string;
  weights: number[];
  googleFontUrl: string;
  fallback: string;
}

// Typography tokens
export interface TypographyTokens {
  primary: FontConfig;    // For headings
  secondary: FontConfig;  // For body text
}

// Color palette tokens
export interface ColorPalette {
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
  destructive: HSLColor;
  destructiveForeground: HSLColor;
}

// Gradient definitions
export interface GradientTokens {
  primary: string;
  accent: string;
  overlay: string;
  hero: string;
  subtle: string;
}

// Shadow definitions
export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  card: string;
  hover: string;
  inner: string;
}

// Border radius options
export type BorderRadiusOption = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Spacing options
export type SpacingOption = 'compact' | 'normal' | 'spacious' | 'luxurious';

// Max width options
export type MaxWidthOption = 'narrow' | 'normal' | 'wide' | 'full';

// Layout tokens
export interface LayoutTokens {
  borderRadius: BorderRadiusOption;
  spacing: SpacingOption;
  maxWidth: MaxWidthOption;
}

// Header component styles
export type HeaderStyle = 'minimal' | 'standard' | 'transparent' | 'centered' | 'split';

// Hero component styles
export type HeroStyle = 'fullscreen' | 'split' | 'centered' | 'minimal' | 'video' | 'slider';

// Card component styles
export type CardStyle = 'flat' | 'elevated' | 'bordered' | 'glass' | 'gradient';

// Hover effect styles
export type HoverEffect = 'none' | 'lift' | 'scale' | 'glow' | 'border' | 'shadow';

// Button styles
export type ButtonStyle = 'solid' | 'outline' | 'ghost' | 'gradient' | 'glass';

// Button roundness
export type ButtonRoundness = 'square' | 'rounded' | 'pill';

// Component style tokens
export interface ComponentTokens {
  header: {
    style: HeaderStyle;
    sticky: boolean;
    blur: boolean;
    borderBottom: boolean;
  };
  hero: {
    style: HeroStyle;
    overlay: boolean;
    overlayOpacity: number;  // 0-1
    textAlignment: 'left' | 'center' | 'right';
    minHeight: string;
  };
  cards: {
    style: CardStyle;
    hoverEffect: HoverEffect;
    padding: SpacingOption;
  };
  buttons: {
    style: ButtonStyle;
    roundness: ButtonRoundness;
    uppercase: boolean;
    fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  };
  sections: {
    padding: SpacingOption;
    divider: 'none' | 'line' | 'gradient' | 'wave';
  };
}

// Design mood/feel options
export type DesignMood =
  | 'luxury'
  | 'warm'
  | 'modern'
  | 'professional'
  | 'playful'
  | 'minimal'
  | 'bold'
  | 'elegant'
  | 'natural'
  | 'tech'
  | 'creative'
  | 'corporate'
  | 'friendly'
  | 'sophisticated';

// Animation options
export type AnimationDuration = 'fast' | 'normal' | 'slow' | 'none';
export type AnimationStyle = 'subtle' | 'smooth' | 'bouncy' | 'dramatic' | 'none';

// Animation tokens
export interface AnimationTokens {
  enabled: boolean;
  duration: AnimationDuration;
  style: AnimationStyle;
  pageTransitions: boolean;
  scrollAnimations: boolean;
}

// Complete Design Token Set
export interface DesignTokens {
  // Metadata
  id: string;
  name: string;
  description?: string;
  version: string;

  // Core tokens
  typography: TypographyTokens;
  colors: ColorPalette;
  gradients: GradientTokens;
  shadows: ShadowTokens;
  layout: LayoutTokens;
  components: ComponentTokens;
  animation: AnimationTokens;

  // Mood & feel
  mood: DesignMood;

  // Dark mode variants (optional)
  darkMode?: {
    colors: Partial<ColorPalette>;
    gradients?: Partial<GradientTokens>;
  };
}

// Preset identifier type
export type DesignPresetId =
  | 'luxury-elegance'
  | 'warm-artisan'
  | 'modern-tech'
  | 'professional-corporate'
  | 'creative-bold'
  | 'natural-organic'
  | 'minimal-clean'
  | 'playful-vibrant'
  | 'sophisticated-dark'
  | 'friendly-approachable';

// Design preset partial (used for extending defaults)
export type DesignPreset = Partial<DesignTokens> & {
  id: DesignPresetId;
  name: string;
};

// Utility type for CSS variable generation
export interface CSSVariableMap {
  [key: string]: string;
}

// Design token context for React
export interface DesignTokenContext {
  tokens: DesignTokens;
  preset: DesignPresetId;
  updateTokens: (updates: Partial<DesignTokens>) => void;
  applyPreset: (presetId: DesignPresetId) => void;
  generateCSS: () => string;
}
