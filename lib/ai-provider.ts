/**
 * AI Provider Configuration
 *
 * Centralized configuration for AI models with automatic fallback.
 * Primary: OpenAI (GPT-4.1 for text, DALL-E 3 for images)
 * Fallback: Anthropic Claude Opus 4.6 (for text generation)
 */

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// ========================
// MODEL CONFIGURATION
// ========================

export const AI_MODELS = {
  // OpenAI Models (Primary)
  openai: {
    text: 'gpt-4.1',            // Latest GPT model - best for website content
    textFast: 'gpt-4.1-mini',   // Fast model for quick tasks
    image: 'dall-e-3',           // Latest image generation
    embedding: 'text-embedding-3-large',
  },

  // Anthropic Models (Fallback)
  anthropic: {
    text: 'claude-opus-4-6',     // Opus 4.6 - excellent for website generation
    textFast: 'claude-sonnet-4-5-20250929', // Fast model for quick tasks
  },
} as const

// ========================
// CLIENT INITIALIZATION
// ========================

let _openai: OpenAI | null = null
let _anthropic: Anthropic | null = null

export function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _anthropic
}

// ========================
// PROVIDER DETECTION
// ========================

export type AIProvider = 'openai' | 'anthropic'

export function getAvailableProvider(): AIProvider | null {
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  return null
}

export function hasOpenAI(): boolean {
  return !!process.env.OPENAI_API_KEY
}

export function hasAnthropic(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

// ========================
// UNIFIED TEXT GENERATION
// ========================

export interface AITextRequest {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
  temperature?: number
  responseFormat?: 'text' | 'json'
}

export interface AITextResponse {
  content: string
  provider: AIProvider
  model: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

/**
 * Generate text using the best available AI provider.
 * Tries OpenAI first, falls back to Anthropic if OpenAI fails or is unavailable.
 */
export async function generateText(request: AITextRequest): Promise<AITextResponse> {
  const { systemPrompt, userPrompt, maxTokens = 4096, temperature = 0.7, responseFormat = 'text' } = request

  // Try OpenAI first
  if (hasOpenAI()) {
    try {
      return await generateWithOpenAI(systemPrompt, userPrompt, maxTokens, temperature, responseFormat)
    } catch (error) {
      console.warn('[AI Provider] OpenAI failed, attempting Anthropic fallback:', error instanceof Error ? error.message : error)
    }
  }

  // Fallback to Anthropic
  if (hasAnthropic()) {
    try {
      return await generateWithAnthropic(systemPrompt, userPrompt, maxTokens, temperature)
    } catch (error) {
      console.error('[AI Provider] Anthropic fallback also failed:', error instanceof Error ? error.message : error)
      throw new Error('All AI providers failed. Check your API keys and try again.')
    }
  }

  throw new Error('No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment.')
}

async function generateWithOpenAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number,
  responseFormat: 'text' | 'json',
): Promise<AITextResponse> {
  const openai = getOpenAIClient()
  if (!openai) throw new Error('OpenAI client not available')

  const response = await openai.chat.completions.create({
    model: AI_MODELS.openai.text,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature,
    ...(responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {}),
  })

  return {
    content: response.choices[0]?.message?.content || '',
    provider: 'openai',
    model: AI_MODELS.openai.text,
    usage: {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
    },
  }
}

async function generateWithAnthropic(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number,
): Promise<AITextResponse> {
  const anthropic = getAnthropicClient()
  if (!anthropic) throw new Error('Anthropic client not available')

  const response = await anthropic.messages.create({
    model: AI_MODELS.anthropic.text,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt },
    ],
  })

  const textBlock = response.content.find(block => block.type === 'text')

  return {
    content: textBlock?.text || '',
    provider: 'anthropic',
    model: AI_MODELS.anthropic.text,
    usage: {
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
    },
  }
}

// ========================
// IMAGE GENERATION
// ========================

export interface AIImageRequest {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'natural' | 'vivid'
}

export interface AIImageResponse {
  url: string
  revisedPrompt?: string
  provider: AIProvider
}

/**
 * Generate an image using DALL-E 3.
 * Image generation is only available through OpenAI.
 */
export async function generateImage(request: AIImageRequest): Promise<AIImageResponse> {
  const openai = getOpenAIClient()
  if (!openai) {
    throw new Error('Image generation requires OPENAI_API_KEY. DALL-E 3 is only available through OpenAI.')
  }

  const { prompt, size = '1024x1024', quality = 'standard', style = 'natural' } = request

  const response = await openai.images.generate({
    model: AI_MODELS.openai.image,
    prompt,
    n: 1,
    size,
    quality,
    style,
  })

  return {
    url: response.data?.[0]?.url || '',
    revisedPrompt: response.data?.[0]?.revised_prompt,
    provider: 'openai',
  }
}
