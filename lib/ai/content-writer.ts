/**
 * AI Content Writer Functions
 * Expert-level content generation with 20+ years of writing experience
 */

import OpenAI from 'openai';
import { AI_MODELS } from '@/lib/ai-provider';
import type {
  StyleGuide,
  VoiceFramework,
  AudiencePersona,
  CustomVoice,
  ContentTemplate,
  ProofreadingResult,
} from '@/lib/types/content-writer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate professional content with expert-level quality (20+ years experience)
 */
export async function generateExpertContent({
  prompt,
  template,
  styleGuide,
  voiceFramework,
  customVoice,
  persona,
  tone = 'professional',
  wordCount,
  additionalInstructions,
}: {
  prompt: string;
  template?: ContentTemplate;
  styleGuide?: StyleGuide;
  voiceFramework?: VoiceFramework;
  customVoice?: CustomVoice;
  persona?: AudiencePersona;
  tone?: string;
  wordCount?: number;
  additionalInstructions?: string;
}): Promise<{ content: string; metadata: any; tokensUsed: number }> {
  // Build comprehensive system prompt with expert context
  const systemPrompt = buildExpertSystemPrompt({
    template,
    styleGuide,
    voiceFramework,
    customVoice,
    persona,
    tone,
  });

  // Build user prompt
  const userPrompt = buildUserPrompt({
    prompt,
    template,
    wordCount,
    additionalInstructions,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.openai.text,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: Math.min(wordCount ? wordCount * 2 : 4000, 4000),
    });

    const content = completion.choices[0].message.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Calculate metadata
    const metadata = {
      word_count: content.split(/\s+/).length,
      char_count: content.length,
      reading_time: Math.ceil(content.split(/\s+/).length / 200), // avg 200 words/min
      keywords: extractKeywords(content),
      sentiment: analyzeSentiment(content),
    };

    return { content, metadata, tokensUsed };
  } catch (error) {
    console.error('Error generating expert content:', error);
    throw new Error('Failed to generate content');
  }
}

/**
 * Build expert system prompt with 20+ years experience context
 */
function buildExpertSystemPrompt({
  template,
  styleGuide,
  voiceFramework,
  customVoice,
  persona,
  tone,
}: {
  template?: ContentTemplate;
  styleGuide?: StyleGuide;
  voiceFramework?: VoiceFramework;
  customVoice?: CustomVoice;
  persona?: AudiencePersona;
  tone: string;
}): string {
  let prompt = `You are an elite content writer and copywriter with over 20 years of professional experience. You have worked with Fortune 500 companies, leading brands, and award-winning publications. Your expertise spans:

- Strategic content creation that drives results
- Deep understanding of audience psychology and persuasion
- Mastery of all writing styles: technical, creative, business, marketing
- SEO optimization and conversion-focused copywriting
- Editorial excellence with impeccable grammar and style
- Adaptive voice that matches brand requirements perfectly

Your writing is characterized by:
- Clarity and precision
- Engaging and compelling narratives
- Strategic use of emotional triggers
- Strong calls-to-action when appropriate
- Perfect grammar, spelling, and punctuation
- Natural flow and readability
- Audience-appropriate vocabulary and tone
`;

  // Add tone guidance
  prompt += `\n\n**TONE REQUIREMENT**: Write in a ${tone} tone.`;
  prompt += getToneGuidance(tone);

  // Add template context
  if (template) {
    prompt += `\n\n**CONTENT TYPE**: ${template.name}`;
    prompt += `\n**PURPOSE**: ${template.description}`;
    prompt += `\n**CATEGORY**: ${template.category}`;
    if (template.example_output) {
      prompt += `\n**STYLE EXAMPLE**: ${template.example_output}`;
    }
  }

  // Add style guide enforcement
  if (styleGuide) {
    prompt += `\n\n**EDITORIAL STYLE GUIDE COMPLIANCE**:`;
    prompt += `\nStyle Guide: "${styleGuide.name}"`;
    if (styleGuide.description) {
      prompt += `\nDescription: ${styleGuide.description}`;
    }
    if (styleGuide.rules.grammar && styleGuide.rules.grammar.length > 0) {
      prompt += `\nGrammar Rules: ${styleGuide.rules.grammar.join(', ')}`;
    }
    if (styleGuide.rules.formatting && styleGuide.rules.formatting.length > 0) {
      prompt += `\nFormatting Rules: ${styleGuide.rules.formatting.join(', ')}`;
    }
    if (styleGuide.rules.terminology) {
      prompt += `\nTerminology: ${Object.entries(styleGuide.rules.terminology)
        .map(([key, value]) => `"${key}" → "${value}"`)
        .join(', ')}`;
    }
    if (styleGuide.rules.avoid_words && styleGuide.rules.avoid_words.length > 0) {
      prompt += `\nAVOID THESE WORDS: ${styleGuide.rules.avoid_words.join(', ')}`;
    }
    if (styleGuide.rules.preferred_words && styleGuide.rules.preferred_words.length > 0) {
      prompt += `\nPREFERRED WORDS: ${styleGuide.rules.preferred_words.join(', ')}`;
    }
  }

  // Add voice framework
  if (voiceFramework) {
    prompt += `\n\n**VOICE & TONE FRAMEWORK**:`;
    prompt += `\nVoice: "${voiceFramework.name}"`;
    if (voiceFramework.description) {
      prompt += `\nDescription: ${voiceFramework.description}`;
    }
    const chars = voiceFramework.voice_characteristics;
    if (chars.personality && chars.personality.length > 0) {
      prompt += `\nPersonality Traits: ${chars.personality.join(', ')}`;
    }
    if (chars.vocabulary_level) {
      prompt += `\nVocabulary Level: ${chars.vocabulary_level}`;
    }
    if (chars.sentence_structure) {
      prompt += `\nSentence Structure: ${chars.sentence_structure}`;
    }
    if (chars.formality) {
      prompt += `\nFormality: ${chars.formality}`;
    }
    if (voiceFramework.writing_sample) {
      prompt += `\n\nWRITING SAMPLE (match this style):\n"${voiceFramework.writing_sample}"`;
    }
  }

  // Add custom voice (analyzed from user's writing)
  if (customVoice) {
    prompt += `\n\n**CUSTOM VOICE PROFILE** (analyzed from user's writing):`;
    prompt += `\nVoice Name: "${customVoice.name}"`;
    if (customVoice.tone_profile.dominant_tone) {
      prompt += `\nDominant Tone: ${customVoice.tone_profile.dominant_tone}`;
    }
    if (customVoice.vocabulary_profile.common_words) {
      prompt += `\nCharacteristic Words: ${customVoice.vocabulary_profile.common_words.slice(0, 10).join(', ')}`;
    }
    if (customVoice.structure_profile.avg_sentence_length) {
      prompt += `\nAverage Sentence Length: ${customVoice.structure_profile.avg_sentence_length} words`;
    }
    prompt += `\n\nORIGINAL WRITING SAMPLE (mimic this style):\n"${customVoice.source_sample.slice(0, 500)}"`;
  }

  // Add audience persona
  if (persona) {
    prompt += `\n\n**TARGET AUDIENCE PERSONA**:`;
    prompt += `\nPersona: "${persona.name}"`;
    if (persona.description) {
      prompt += `\nDescription: ${persona.description}`;
    }

    const demo = persona.demographics;
    if (demo.age_range || demo.occupation || demo.education) {
      prompt += `\nDemographics: `;
      const demoDetails = [];
      if (demo.age_range) demoDetails.push(`Age: ${demo.age_range}`);
      if (demo.occupation) demoDetails.push(`Occupation: ${demo.occupation}`);
      if (demo.education) demoDetails.push(`Education: ${demo.education}`);
      prompt += demoDetails.join(', ');
    }

    const psycho = persona.psychographics;
    if (psycho.pain_points && psycho.pain_points.length > 0) {
      prompt += `\nPain Points: ${psycho.pain_points.join(', ')}`;
    }
    if (psycho.goals && psycho.goals.length > 0) {
      prompt += `\nGoals: ${psycho.goals.join(', ')}`;
    }
    if (psycho.interests && psycho.interests.length > 0) {
      prompt += `\nInterests: ${psycho.interests.join(', ')}`;
    }

    const lang = persona.language_preferences;
    if (lang.reading_level) {
      prompt += `\nReading Level: ${lang.reading_level}`;
    }
    if (lang.avoid_jargon) {
      prompt += `\nNote: Avoid technical jargon, use clear simple language`;
    }
  }

  prompt += `\n\n**IMPORTANT**: Follow ALL style guides, voice frameworks, and persona requirements strictly. Ensure compliance with every specified guideline.`;

  return prompt;
}

/**
 * Get specific guidance for each tone
 */
function getToneGuidance(tone: string): string {
  const toneGuides: Record<string, string> = {
    professional: '\n- Use clear, concise language\n- Maintain objectivity\n- Focus on facts and expertise\n- Avoid slang or colloquialisms',
    casual: '\n- Use conversational language\n- Be approachable and friendly\n- Use contractions naturally\n- Include relatable examples',
    friendly: '\n- Be warm and welcoming\n- Use inclusive language\n- Show empathy and understanding\n- Create personal connection',
    formal: '\n- Use sophisticated vocabulary\n- Maintain professional distance\n- Employ proper grammar strictly\n- Avoid contractions',
    creative: '\n- Use vivid imagery and metaphors\n- Be imaginative and original\n- Employ literary devices\n- Engage the senses',
    persuasive: '\n- Use compelling arguments\n- Include strong calls-to-action\n- Address objections\n- Build credibility',
    informative: '\n- Present facts clearly\n- Use logical structure\n- Provide context and examples\n- Be comprehensive yet concise',
    inspirational: '\n- Be uplifting and motivating\n- Use aspirational language\n- Share vision and possibilities\n- Encourage action',
    enthusiastic: '\n- Show excitement and energy\n- Use dynamic language\n- Express passion\n- Be engaging and animated',
    empathetic: '\n- Show understanding and compassion\n- Acknowledge emotions\n- Be supportive\n- Validate experiences',
    assertive: '\n- Be confident and direct\n- State positions clearly\n- Use strong language\n- Demonstrate authority',
    humble: '\n- Be modest and unassuming\n- Acknowledge limitations\n- Show gratitude\n- Give credit to others',
    confident: '\n- Project certainty\n- Use definitive language\n- Demonstrate expertise\n- Be assured but not arrogant',
    conversational: '\n- Write as you speak\n- Use natural rhythm\n- Include questions\n- Be engaging and relatable',
    authoritative: '\n- Demonstrate deep expertise\n- Use precise terminology\n- Cite evidence\n- Command respect',
    playful: '\n- Use humor appropriately\n- Be lighthearted\n- Include wordplay\n- Keep it fun',
    urgent: '\n- Create sense of immediacy\n- Use action-oriented language\n- Highlight time sensitivity\n- Drive quick response',
    calming: '\n- Use soothing language\n- Be reassuring\n- Slow the pace\n- Reduce anxiety',
    passionate: '\n- Show deep commitment\n- Use emotive language\n- Express conviction\n- Be intense and fervent',
    witty: '\n- Use clever wordplay\n- Include subtle humor\n- Be intelligent and sharp\n- Entertain while informing',
    serious: '\n- Maintain gravity\n- Avoid levity\n- Focus on importance\n- Be solemn and earnest',
    optimistic: '\n- Focus on positive aspects\n- Express hope and possibility\n- Use uplifting language\n- Encourage positive outlook',
    analytical: '\n- Use data and logic\n- Break down complexity\n- Be systematic\n- Focus on reasoning',
    storytelling: '\n- Use narrative structure\n- Create characters and scenes\n- Build tension and resolution\n- Engage emotionally',
  };

  return toneGuides[tone] || '';
}

/**
 * Build user prompt with specific requirements
 */
function buildUserPrompt({
  prompt,
  template,
  wordCount,
  additionalInstructions,
}: {
  prompt: string;
  template?: ContentTemplate;
  wordCount?: number;
  additionalInstructions?: string;
}): string {
  let userPrompt = `**CONTENT REQUEST**:\n${prompt}`;

  if (wordCount) {
    userPrompt += `\n\n**TARGET LENGTH**: Approximately ${wordCount} words`;
  }

  if (template?.template_structure.instructions) {
    userPrompt += `\n\n**TEMPLATE INSTRUCTIONS**:\n${template.template_structure.instructions}`;
  }

  if (additionalInstructions) {
    userPrompt += `\n\n**ADDITIONAL REQUIREMENTS**:\n${additionalInstructions}`;
  }

  userPrompt += `\n\n**DELIVERABLE**: Write the complete content following all requirements, guidelines, and frameworks specified in the system prompt. Ensure expert-level quality worthy of 20+ years of professional experience.`;

  return userPrompt;
}

/**
 * Proofread and correct content for spelling, grammar, and punctuation
 */
export async function proofreadContent({
  text,
  styleGuide,
  checkTypes = ['spelling', 'grammar', 'punctuation', 'style', 'clarity', 'consistency'],
  applyCorrections = true,
}: {
  text: string;
  styleGuide?: StyleGuide;
  checkTypes?: Array<'spelling' | 'grammar' | 'punctuation' | 'style' | 'clarity' | 'consistency'>;
  applyCorrections?: boolean;
}): Promise<{ result: ProofreadingResult; tokensUsed: number }> {
  const systemPrompt = `You are an expert editor and proofreader with 20+ years of experience in professional publishing. You have worked with major publishers like The New York Times, Harvard Business Review, and leading content agencies.

Your expertise includes:
- Detecting and correcting spelling errors
- Identifying and fixing grammatical mistakes
- Ensuring proper punctuation usage
- Improving clarity and readability
- Maintaining consistency in style and tone
- Suggesting stylistic improvements

**CHECKS TO PERFORM**: ${checkTypes.join(', ')}

${styleGuide ? `**STYLE GUIDE COMPLIANCE**:
Style Guide: "${styleGuide.name}"
${styleGuide.rules.grammar ? `Grammar Rules: ${styleGuide.rules.grammar.join(', ')}` : ''}
${styleGuide.rules.punctuation ? `Punctuation Rules: ${styleGuide.rules.punctuation.join(', ')}` : ''}
${styleGuide.rules.avoid_words ? `Avoid Words: ${styleGuide.rules.avoid_words.join(', ')}` : ''}
` : ''}

Provide your response in the following JSON format:
{
  "corrected_text": "the fully corrected text",
  "issues_found": [
    {
      "type": "spelling|grammar|punctuation|style|clarity|consistency",
      "severity": "error|warning|suggestion",
      "message": "description of the issue",
      "original": "original text",
      "suggestion": "suggested correction",
      "position": { "start": 0, "end": 10 }
    }
  ]
}`;

  const userPrompt = `Please proofread the following text and ${applyCorrections ? 'provide corrections' : 'identify issues'}:

---
${text}
---`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.openai.text,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    const tokensUsed = completion.usage?.total_tokens || 0;

    const result: ProofreadingResult = {
      id: '',
      user_id: '',
      original_text: text,
      corrected_text: response.corrected_text || text,
      issues_found: response.issues_found || [],
      corrections_made: response.issues_found?.length || 0,
      tokens_used: tokensUsed,
      cost_usd: 0,
      created_at: new Date().toISOString(),
    };

    return { result, tokensUsed };
  } catch (error) {
    console.error('Error proofreading content:', error);
    throw new Error('Failed to proofread content');
  }
}

/**
 * Summarize lengthy content
 */
export async function summarizeContent({
  text,
  length = 'moderate',
  format = 'paragraph',
  focusAreas = [],
}: {
  text: string;
  length?: 'brief' | 'moderate' | 'detailed';
  format?: 'paragraph' | 'bullet_points' | 'key_takeaways';
  focusAreas?: string[];
}): Promise<{ summary: string; keyPoints?: string[]; tokensUsed: number }> {
  const lengthGuidance = {
    brief: '2-3 sentences capturing the essence',
    moderate: '1-2 paragraphs with main points',
    detailed: '3-4 paragraphs with comprehensive coverage',
  };

  const formatGuidance = {
    paragraph: 'Write the summary as flowing paragraphs',
    bullet_points: 'Present the summary as clear bullet points',
    key_takeaways: 'List the key takeaways and main insights',
  };

  const systemPrompt = `You are an expert content analyst with 20+ years of experience in research, journalism, and content strategy. You excel at distilling complex information into clear, actionable summaries while preserving the core message and critical details.

**SUMMARY REQUIREMENTS**:
- Length: ${lengthGuidance[length]}
- Format: ${formatGuidance[format]}
${focusAreas.length > 0 ? `- Focus on: ${focusAreas.join(', ')}` : ''}

Provide your response in JSON format:
{
  "summary": "the main summary text",
  "key_points": ["point 1", "point 2", "point 3"]
}`;

  const userPrompt = `Please summarize the following content:

---
${text}
---`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.openai.text,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    const tokensUsed = completion.usage?.total_tokens || 0;

    return {
      summary: response.summary || '',
      keyPoints: response.key_points || [],
      tokensUsed,
    };
  } catch (error) {
    console.error('Error summarizing content:', error);
    throw new Error('Failed to summarize content');
  }
}

/**
 * Analyze writing sample to create custom voice profile
 */
export async function analyzeWritingVoice({
  writingSample,
  name,
  description,
}: {
  writingSample: string;
  name: string;
  description?: string;
}): Promise<{ customVoice: Partial<CustomVoice>; tokensUsed: number }> {
  const systemPrompt = `You are an expert linguistic analyst with deep expertise in writing style analysis, voice characterization, and authorship attribution. You have 20+ years of experience analyzing writing patterns for publishers, brands, and content strategists.

Analyze the provided writing sample and extract:
1. Tone characteristics (dominant and secondary)
2. Vocabulary patterns (word choice, complexity, unique phrases)
3. Structural patterns (sentence length, paragraph structure, transitions)
4. Overall style characteristics

Provide your analysis in JSON format:
{
  "analyzed_characteristics": {
    "tone": "overall tone description",
    "style": "writing style description",
    "complexity": "complexity level",
    "patterns": ["pattern 1", "pattern 2", "pattern 3"]
  },
  "tone_profile": {
    "dominant_tone": "primary tone",
    "secondary_tones": ["tone 1", "tone 2"],
    "emotional_range": "emotional range description",
    "formality_level": "formality description"
  },
  "vocabulary_profile": {
    "common_words": ["word1", "word2", "word3"],
    "unique_phrases": ["phrase1", "phrase2"],
    "avg_word_length": 5.2,
    "vocabulary_richness": 0.75
  },
  "structure_profile": {
    "avg_sentence_length": 18,
    "avg_paragraph_length": 4,
    "sentence_variety": "high|medium|low",
    "transition_style": "description"
  }
}`;

  const userPrompt = `Analyze this writing sample:

---
${writingSample}
---

Voice Name: "${name}"
${description ? `Description: ${description}` : ''}`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.openai.text,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    const tokensUsed = completion.usage?.total_tokens || 0;

    const customVoice: Partial<CustomVoice> = {
      name,
      description,
      source_sample: writingSample,
      analyzed_characteristics: analysis.analyzed_characteristics || {},
      tone_profile: analysis.tone_profile || {},
      vocabulary_profile: analysis.vocabulary_profile || {},
      structure_profile: analysis.structure_profile || {},
    };

    return { customVoice, tokensUsed };
  } catch (error) {
    console.error('Error analyzing writing voice:', error);
    throw new Error('Failed to analyze writing voice');
  }
}

/**
 * Rewrite content with different tone/style
 */
export async function rewriteContent({
  text,
  tone,
  style,
  voiceFramework,
  customVoice,
  persona,
  targetWordCount,
}: {
  text: string;
  tone?: string;
  style?: 'expand' | 'shorten' | 'simplify' | 'formalize' | 'casualize';
  voiceFramework?: VoiceFramework;
  customVoice?: CustomVoice;
  persona?: AudiencePersona;
  targetWordCount?: number;
}): Promise<{ rewrittenText: string; changesSummary: string; tokensUsed: number }> {
  const systemPrompt = buildRewriteSystemPrompt({
    tone,
    style,
    voiceFramework,
    customVoice,
    persona,
  });

  const userPrompt = `Rewrite the following content according to the specifications:

ORIGINAL:
---
${text}
---

${targetWordCount ? `TARGET LENGTH: ${targetWordCount} words` : ''}

Provide your response in JSON format:
{
  "rewritten_text": "the rewritten content",
  "changes_summary": "summary of key changes made"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.openai.text,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    const tokensUsed = completion.usage?.total_tokens || 0;

    return {
      rewrittenText: response.rewritten_text || '',
      changesSummary: response.changes_summary || '',
      tokensUsed,
    };
  } catch (error) {
    console.error('Error rewriting content:', error);
    throw new Error('Failed to rewrite content');
  }
}

function buildRewriteSystemPrompt({
  tone,
  style,
  voiceFramework,
  customVoice,
  persona,
}: {
  tone?: string;
  style?: string;
  voiceFramework?: VoiceFramework;
  customVoice?: CustomVoice;
  persona?: AudiencePersona;
}): string {
  let prompt = `You are an expert content rewriter with 20+ years of experience. You can adapt any content to match specific requirements while preserving the core message.`;

  if (tone) {
    prompt += `\n\n**TARGET TONE**: ${tone}`;
    prompt += getToneGuidance(tone);
  }

  if (style) {
    const styleGuides = {
      expand: 'Expand the content with more detail, examples, and elaboration while maintaining clarity',
      shorten: 'Condense the content to be more concise while preserving all key information',
      simplify: 'Simplify the language to make it more accessible and easier to understand',
      formalize: 'Make the content more formal and professional in tone and language',
      casualize: 'Make the content more casual and conversational while staying appropriate',
    };
    prompt += `\n\n**STYLE TRANSFORMATION**: ${styleGuides[style as keyof typeof styleGuides]}`;
  }

  if (voiceFramework) {
    prompt += `\n\n**VOICE FRAMEWORK**: Match the voice characteristics of "${voiceFramework.name}"`;
    if (voiceFramework.writing_sample) {
      prompt += `\nReference Style:\n"${voiceFramework.writing_sample}"`;
    }
  }

  if (customVoice) {
    prompt += `\n\n**CUSTOM VOICE**: Mimic the writing style from this sample:\n"${customVoice.source_sample}"`;
  }

  if (persona) {
    prompt += `\n\n**TARGET AUDIENCE**: ${persona.name}`;
    if (persona.language_preferences.reading_level) {
      prompt += `\nReading Level: ${persona.language_preferences.reading_level}`;
    }
  }

  return prompt;
}

/**
 * Extract keywords from content
 */
function extractKeywords(content: string): string[] {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4);

  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Simple sentiment analysis
 */
function analyzeSentiment(content: string): string {
  const positive = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best'];
  const negative = ['bad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'disappointing'];

  const lowerContent = content.toLowerCase();
  const positiveCount = positive.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negative.filter(word => lowerContent.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}
