// TypeScript types for AI Content Writer features

export interface StyleGuide {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  rules: {
    grammar?: string[];
    formatting?: string[];
    terminology?: Record<string, string>;
    avoid_words?: string[];
    preferred_words?: string[];
    punctuation?: string[];
    capitalization?: string[];
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoiceFramework {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  tone: string;
  voice_characteristics: {
    personality?: string[];
    vocabulary_level?: 'simple' | 'moderate' | 'advanced' | 'expert';
    sentence_structure?: 'short' | 'medium' | 'long' | 'varied';
    formality?: 'very_casual' | 'casual' | 'neutral' | 'formal' | 'very_formal';
    emotion?: 'neutral' | 'enthusiastic' | 'empathetic' | 'assertive' | 'humble';
    perspective?: 'first_person' | 'second_person' | 'third_person';
  };
  writing_sample?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AudiencePersona {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  demographics: {
    age_range?: string;
    location?: string;
    education?: string;
    occupation?: string;
    income_level?: string;
  };
  psychographics: {
    interests?: string[];
    values?: string[];
    pain_points?: string[];
    goals?: string[];
    challenges?: string[];
    motivations?: string[];
  };
  language_preferences: {
    reading_level?: 'elementary' | 'middle_school' | 'high_school' | 'college' | 'graduate';
    preferred_terminology?: string[];
    avoid_jargon?: boolean;
    cultural_considerations?: string[];
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomVoice {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  analyzed_characteristics: {
    tone?: string;
    style?: string;
    complexity?: string;
    patterns?: string[];
  };
  source_sample: string;
  tone_profile: {
    dominant_tone?: string;
    secondary_tones?: string[];
    emotional_range?: string;
    formality_level?: string;
  };
  vocabulary_profile: {
    common_words?: string[];
    unique_phrases?: string[];
    avg_word_length?: number;
    vocabulary_richness?: number;
  };
  structure_profile: {
    avg_sentence_length?: number;
    avg_paragraph_length?: number;
    sentence_variety?: string;
    transition_style?: string;
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentTemplate {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  category: 'blog' | 'email' | 'social' | 'ads' | 'business' | 'creative' | 'website' | 'media' | 'ecommerce' | 'professional';
  use_case: string;
  template_structure: {
    fields: string[];
    output: string[];
    instructions?: string;
  };
  example_output?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedContent {
  id: string;
  user_id: string;
  template_id?: string;
  style_guide_id?: string;
  voice_framework_id?: string;
  custom_voice_id?: string;
  persona_id?: string;
  prompt: string;
  generated_text: string;
  metadata: {
    word_count?: number;
    char_count?: number;
    reading_time?: number;
    keywords?: string[];
    sentiment?: string;
  };
  tokens_used: number;
  cost_usd: number;
  rating?: number;
  created_at: string;
}

export interface ContentRevision {
  id: string;
  generated_content_id: string;
  revision_number: number;
  content: string;
  revision_type: 'proofread' | 'rewrite' | 'expand' | 'shorten' | 'tone_change' | 'style_adjust' | 'manual_edit';
  changes_made: {
    description?: string;
    specific_changes?: Array<{
      type: string;
      original: string;
      revised: string;
    }>;
  };
  tokens_used: number;
  cost_usd: number;
  created_at: string;
}

export interface ProofreadingResult {
  id: string;
  user_id: string;
  original_text: string;
  corrected_text: string;
  issues_found: Array<{
    type: 'spelling' | 'grammar' | 'punctuation' | 'style' | 'clarity' | 'consistency';
    severity: 'error' | 'warning' | 'suggestion';
    message: string;
    original: string;
    suggestion: string;
    position: {
      start: number;
      end: number;
    };
  }>;
  corrections_made: number;
  tokens_used: number;
  cost_usd: number;
  created_at: string;
}

// Request/Response types for API endpoints

export interface GenerateContentRequest {
  prompt: string;
  template_id?: string;
  style_guide_id?: string;
  voice_framework_id?: string;
  custom_voice_id?: string;
  persona_id?: string;
  tone?: string;
  word_count?: number;
  additional_instructions?: string;
}

export interface GenerateContentResponse {
  success: boolean;
  content: GeneratedContent;
  suggestions?: string[];
}

export interface ProofreadRequest {
  text: string;
  style_guide_id?: string;
  check_types?: Array<'spelling' | 'grammar' | 'punctuation' | 'style' | 'clarity' | 'consistency'>;
  apply_corrections?: boolean;
}

export interface ProofreadResponse {
  success: boolean;
  result: ProofreadingResult;
}

export interface SummarizeRequest {
  text: string;
  length: 'brief' | 'moderate' | 'detailed';
  format?: 'paragraph' | 'bullet_points' | 'key_takeaways';
  focus_areas?: string[];
}

export interface SummarizeResponse {
  success: boolean;
  summary: string;
  key_points?: string[];
  word_count: number;
  tokens_used: number;
  cost_usd: number;
}

export interface AnalyzeVoiceRequest {
  writing_sample: string;
  name: string;
  description?: string;
}

export interface AnalyzeVoiceResponse {
  success: boolean;
  custom_voice: CustomVoice;
}

export interface RewriteRequest {
  text: string;
  tone?: string;
  style?: 'expand' | 'shorten' | 'simplify' | 'formalize' | 'casualize';
  voice_framework_id?: string;
  custom_voice_id?: string;
  persona_id?: string;
  target_word_count?: number;
}

export interface RewriteResponse {
  success: boolean;
  original_text: string;
  rewritten_text: string;
  changes_summary: string;
  tokens_used: number;
  cost_usd: number;
}

// Tone options (20+ tones inspired by Rytr.me)
export const TONE_OPTIONS = [
  'professional',
  'casual',
  'friendly',
  'formal',
  'creative',
  'persuasive',
  'informative',
  'inspirational',
  'enthusiastic',
  'empathetic',
  'assertive',
  'humble',
  'confident',
  'conversational',
  'authoritative',
  'playful',
  'urgent',
  'calming',
  'passionate',
  'witty',
  'serious',
  'optimistic',
  'analytical',
  'storytelling',
] as const;

export type ToneOption = typeof TONE_OPTIONS[number];

// Content categories
export const CONTENT_CATEGORIES = [
  { value: 'blog', label: 'Blog Content', icon: '📝' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'social', label: 'Social Media', icon: '📱' },
  { value: 'ads', label: 'Advertising', icon: '📢' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'creative', label: 'Creative Writing', icon: '✨' },
  { value: 'website', label: 'Website Content', icon: '🌐' },
  { value: 'media', label: 'Video & Media', icon: '🎥' },
  { value: 'ecommerce', label: 'E-commerce', icon: '🛍️' },
  { value: 'professional', label: 'Professional', icon: '👔' },
] as const;
