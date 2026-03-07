-- AI Content Writer Database Schema
-- Tables for style guides, voice frameworks, personas, and content generation

-- Style Guides Table
CREATE TABLE IF NOT EXISTS style_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '{}', -- grammar rules, formatting, terminology, etc.
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice Frameworks Table
CREATE TABLE IF NOT EXISTS voice_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tone TEXT NOT NULL, -- professional, casual, friendly, formal, creative, etc.
  voice_characteristics JSONB NOT NULL DEFAULT '{}', -- personality traits, vocabulary preferences, etc.
  writing_sample TEXT, -- sample text that represents this voice
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audience Personas Table
CREATE TABLE IF NOT EXISTS audience_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  demographics JSONB DEFAULT '{}', -- age, location, education, occupation, etc.
  psychographics JSONB DEFAULT '{}', -- interests, values, pain points, goals, etc.
  language_preferences JSONB DEFAULT '{}', -- reading level, terminology preferences, etc.
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Voices Table (analyzed from user's writing samples)
CREATE TABLE IF NOT EXISTS custom_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  analyzed_characteristics JSONB NOT NULL DEFAULT '{}', -- AI-analyzed writing patterns
  source_sample TEXT NOT NULL, -- original writing sample used for analysis
  tone_profile JSONB NOT NULL DEFAULT '{}', -- detected tone characteristics
  vocabulary_profile JSONB NOT NULL DEFAULT '{}', -- word choice patterns
  structure_profile JSONB NOT NULL DEFAULT '{}', -- sentence/paragraph structure patterns
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Templates Table
CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system templates
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- blog, email, social, ads, business, creative, etc.
  use_case TEXT NOT NULL, -- specific use case like "blog_intro", "product_description", etc.
  template_structure JSONB NOT NULL DEFAULT '{}', -- structure and fields for the template
  example_output TEXT,
  is_system BOOLEAN DEFAULT false, -- system templates vs user templates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Content History Table
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES content_templates(id) ON DELETE SET NULL,
  style_guide_id UUID REFERENCES style_guides(id) ON DELETE SET NULL,
  voice_framework_id UUID REFERENCES voice_frameworks(id) ON DELETE SET NULL,
  custom_voice_id UUID REFERENCES custom_voices(id) ON DELETE SET NULL,
  persona_id UUID REFERENCES audience_personas(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL, -- original user prompt
  generated_text TEXT NOT NULL, -- generated content
  metadata JSONB DEFAULT '{}', -- word count, reading time, keywords, etc.
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- user rating
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Revisions Table (for tracking edits and versions)
CREATE TABLE IF NOT EXISTS content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  revision_type TEXT NOT NULL, -- proofread, rewrite, expand, shorten, tone_change, etc.
  changes_made JSONB DEFAULT '{}', -- description of changes
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proofreading Results Table
CREATE TABLE IF NOT EXISTS proofreading_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  corrected_text TEXT NOT NULL,
  issues_found JSONB NOT NULL DEFAULT '[]', -- array of issues: spelling, grammar, punctuation
  corrections_made INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_style_guides_user_id ON style_guides(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_frameworks_user_id ON voice_frameworks(user_id);
CREATE INDEX IF NOT EXISTS idx_audience_personas_user_id ON audience_personas(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_voices_user_id ON custom_voices(user_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_category ON content_templates(category);
CREATE INDEX IF NOT EXISTS idx_content_templates_user_id ON content_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proofreading_results_user_id ON proofreading_results(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE style_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofreading_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for style_guides
CREATE POLICY "Users can view their own style guides" ON style_guides
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own style guides" ON style_guides
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own style guides" ON style_guides
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own style guides" ON style_guides
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for voice_frameworks
CREATE POLICY "Users can view their own voice frameworks" ON voice_frameworks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own voice frameworks" ON voice_frameworks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own voice frameworks" ON voice_frameworks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own voice frameworks" ON voice_frameworks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for audience_personas
CREATE POLICY "Users can view their own audience personas" ON audience_personas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own audience personas" ON audience_personas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own audience personas" ON audience_personas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own audience personas" ON audience_personas
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for custom_voices
CREATE POLICY "Users can view their own custom voices" ON custom_voices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own custom voices" ON custom_voices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own custom voices" ON custom_voices
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom voices" ON custom_voices
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for content_templates
CREATE POLICY "Users can view system templates and their own" ON content_templates
  FOR SELECT USING (is_system = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own templates" ON content_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON content_templates
  FOR UPDATE USING (auth.uid() = user_id AND is_system = false);
CREATE POLICY "Users can delete their own templates" ON content_templates
  FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- RLS Policies for generated_content
CREATE POLICY "Users can view their own generated content" ON generated_content
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own generated content" ON generated_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own generated content" ON generated_content
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own generated content" ON generated_content
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for content_revisions
CREATE POLICY "Users can view their own content revisions" ON content_revisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_content
      WHERE generated_content.id = content_revisions.generated_content_id
      AND generated_content.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert their own content revisions" ON content_revisions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM generated_content
      WHERE generated_content.id = content_revisions.generated_content_id
      AND generated_content.user_id = auth.uid()
    )
  );

-- RLS Policies for proofreading_results
CREATE POLICY "Users can view their own proofreading results" ON proofreading_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own proofreading results" ON proofreading_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own proofreading results" ON proofreading_results
  FOR DELETE USING (auth.uid() = user_id);
