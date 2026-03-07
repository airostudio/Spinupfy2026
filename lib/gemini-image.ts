/**
 * Nano Banana 2 Image Generation Service
 *
 * Uses Google's Nano Banana 2 (Gemini 3.1 Flash Image Preview) for AI image generation
 * Latest model launched Feb 26, 2026 - Pro-level quality at Flash speed!
 * This is the ONLY AI image generator (DALL-E has been removed)
 *
 * Model: gemini-3.1-flash-image-preview (Nano Banana 2)
 * Alternative: gemini-3-pro-image-preview (Nano Banana Pro - 4K quality)
 *
 * MANDATORY for hero images - Fallback: Unsplash (stock photos only)
 */

interface GeminiImageParams {
  businessName: string
  businessType: string
  sectionType: string
  description?: string
  style?: 'photorealistic' | 'artistic' | 'modern' | 'professional'
  // Enhanced client information for MAXIMUM detail (especially for hero images)
  businessModel?: string // e.g., 'B2C', 'B2B', 'Service', 'Product'
  pricePoint?: string // e.g., 'budget', 'mid-range', 'premium', 'luxury'
  designMood?: string // e.g., 'professional', 'playful', 'elegant', 'modern'
  industryInsights?: string // Key industry features and standards
  targetAudience?: string // Who the business serves
  uniqueValue?: string // What makes this business special
}

interface GeminiImageResult {
  url: string
  altText: string
}

/**
 * Generate image using Google Gemini Imagen API
 * Supports both Vertex AI (with project ID) and AI Studio (API key only)
 */
export async function generateGeminiImage(params: GeminiImageParams): Promise<GeminiImageResult> {
  const {
    businessName,
    businessType,
    sectionType,
    description,
    style = 'photorealistic',
    businessModel,
    pricePoint,
    designMood,
    industryInsights,
    targetAudience,
    uniqueValue
  } = params

  // Check if Gemini API key is configured
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY not configured')
  }

  try {
    // Construct optimized prompt for Gemini with COMPLETE business context
    const prompt = buildGeminiPrompt({
      businessName,
      businessType,
      sectionType,
      description,
      style,
      // Pass ALL enhanced business context for world-class, on-point images
      businessModel,
      pricePoint,
      designMood,
      industryInsights,
      targetAudience,
      uniqueValue
    })

    console.log(`🎨 [GEMINI] Generating ${sectionType} image for "${businessName}"...`)
    const startTime = Date.now()

    // PRIORITY: Use Nano Banana 2 (Gemini 3.1 Flash Image Preview) via AI Studio
    // Latest model launched Feb 26, 2026 - JUST 2 DAYS AGO!
    // Simple API key setup - NO Vertex AI needed!
    // Pro-level quality at Flash speed - SUPERIOR to Imagen and DALL-E
    console.log(`🍌 [NANO BANANA 2] Using latest Gemini 3.1 Flash Image Preview - SUPERIOR quality!`)
    return await generateWithAIStudio(prompt, sectionType, businessName, businessType, description, startTime)

  } catch (error: any) {
    console.error(`❌ [GEMINI] Image generation failed:`, error.message)
    throw error
  }
}

/**
 * Generate image using Vertex AI Imagen 3 (requires Google Cloud project)
 */
async function generateWithVertexAI(
  prompt: string,
  sectionType: string,
  businessName: string,
  businessType: string,
  description: string | undefined,
  startTime: number
): Promise<GeminiImageResult> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY!

  console.log(`🌟 [VERTEX AI] Using Imagen 3 via Vertex AI (${location})`)

  // Vertex AI Imagen 3 endpoint
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      instances: [
        {
          prompt: prompt,
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: getAspectRatio(sectionType),
        safetyFilterLevel: 'block_some',
        personGeneration: 'allow_adult',
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`❌ [VERTEX AI] API error (${response.status}):`, errorText)
    throw new Error(`Vertex AI error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  // Extract image from Vertex AI response
  if (!data.predictions || !data.predictions[0] || !data.predictions[0].bytesBase64Encoded) {
    throw new Error('No image returned from Vertex AI Imagen')
  }

  const imageUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`
  const altText = generateAltText({ businessName, businessType, sectionType, description })

  console.log(`✅ [VERTEX AI] Image generated successfully in ${duration}s`)

  return { url: imageUrl, altText }
}

/**
 * Generate image using Nano Banana 2 (Gemini 3.1 Flash Image Preview)
 * Latest model - launched Feb 26, 2026!
 * Uses simple API key - NO Vertex AI required!
 */
async function generateWithAIStudio(
  prompt: string,
  sectionType: string,
  businessName: string,
  businessType: string,
  description: string | undefined,
  startTime: number
): Promise<GeminiImageResult> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY!

  console.log(`🍌 [NANO BANANA 2] Generating image with Gemini 3.1 Flash Image Preview`)
  console.log(`   Latest model (launched Feb 26, 2026) - Pro-level quality at Flash speed!`)
  console.log(`   Using AI Studio API (simple API key - no Vertex AI needed)`)

  // Nano Banana 2: Latest image generation model from Google
  // Model: gemini-3.1-flash-image-preview (NEWEST - just launched!)
  // Alternative: gemini-3-pro-image-preview (Nano Banana Pro - highest quality, 4K)
  const model = 'gemini-3.1-flash-image-preview'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  // Get aspect ratio and resolution based on section type
  const aspectRatio = getAspectRatio(sectionType)
  const imageSize = sectionType === 'HERO' ? '2K' : '1K' // 2K for hero, 1K for others

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseModalities: ['IMAGE'], // Request image output only
          temperature: 0.7,
          topP: 0.9,
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize
          }
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [NANO BANANA 2] API error (${response.status}):`, errorText)
      throw new Error(`Nano Banana 2 API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    // Check if we got an image back
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error(`❌ [NANO BANANA 2] No content in response:`, JSON.stringify(data))
      throw new Error('No image generated by Nano Banana 2')
    }

    const content = data.candidates[0].content

    // Look for inline image data in the response
    // Response format: candidates[0].content.parts[].inlineData
    const imagePart = content.parts?.find((part: any) => part.inlineData?.mimeType?.startsWith('image/'))

    if (imagePart && imagePart.inlineData) {
      const imageData = imagePart.inlineData.data
      const mimeType = imagePart.inlineData.mimeType || 'image/png'
      const imageUrl = `data:${mimeType};base64,${imageData}`
      const altText = generateAltText({ businessName, businessType, sectionType, description })

      console.log(`✅ [NANO BANANA 2] Image generated successfully in ${duration}s`)
      console.log(`   Format: ${aspectRatio} @ ${imageSize}, MIME: ${mimeType}`)
      return { url: imageUrl, altText }
    }

    // If no image data, throw error
    throw new Error('Nano Banana 2 response did not contain image data')

  } catch (error: any) {
    console.error(`❌ [NANO BANANA 2] Image generation failed:`, error.message)
    throw error
  }
}

/**
 * Build optimized prompt for Gemini image generation
 * HERO images get MAXIMUM detail from ALL available client information
 * Uses Gemini 2.0 Flash (Nano Banana 2) for hero images with complete context
 */
function buildGeminiPrompt(params: GeminiImageParams): string {
  const {
    businessName,
    businessType,
    sectionType,
    description,
    style,
    businessModel,
    pricePoint,
    designMood,
    industryInsights,
    targetAudience,
    uniqueValue
  } = params

  // Base quality descriptors for photorealistic style
  const qualityTerms = style === 'photorealistic'
    ? 'professional photography, high resolution, sharp focus, natural lighting, vivid colors'
    : 'high quality digital art, detailed, vibrant, modern design'

  // Section-specific prompt templates
  const templates: Record<string, string> = {
    HERO: `🎯 CRITICAL INSTRUCTION: Read EVERY word below and use ALL information to create a world-class, highly relevant hero image.
           This is not a generic prompt - this contains COMPLETE business context that MUST be incorporated.

           ═══════════════════════════════════════════════════════════════
           BUSINESS IDENTITY & CORE INFORMATION
           ═══════════════════════════════════════════════════════════════
           Business Name: ${businessName || 'Professional Business'}
           Industry/Type: ${businessType}
           Business Model: ${businessModel || 'Not specified'}
           Price Point: ${pricePoint || 'Not specified'}

           ═══════════════════════════════════════════════════════════════
           🔥 CLIENT'S COMPLETE DESCRIPTION - READ EVERY WORD & USE IT ALL 🔥
           ═══════════════════════════════════════════════════════════════
           ${description || `Professional ${businessType} business showcase`}

           👆 THIS DESCRIPTION ABOVE IS CRUCIAL - Interpret it fully and create an image that captures EXACTLY what the client described.
           Every detail matters. Every word has meaning. Use ALL of it.

           ═══════════════════════════════════════════════════════════════
           TARGET AUDIENCE & MARKET POSITIONING
           ═══════════════════════════════════════════════════════════════
           ${targetAudience ? `Target Audience: ${targetAudience}` : 'General audience'}
           ${uniqueValue ? `Unique Value Proposition: ${uniqueValue}` : ''}

           ═══════════════════════════════════════════════════════════════
           DESIGN DIRECTION & VISUAL MOOD
           ═══════════════════════════════════════════════════════════════
           Desired Mood: ${designMood || 'Professional and trustworthy'}
           Visual Style: ULTRA-REALISTIC PHOTOGRAPHY ONLY (NO cartoons, NO illustrations, NO digital art)
           Brand Personality: ${pricePoint === 'luxury' || pricePoint === 'premium' ? 'Sophisticated, elegant, exclusive' :
                              pricePoint === 'budget' ? 'Approachable, friendly, value-focused' :
                              'Professional, reliable, quality-focused'}

           ═══════════════════════════════════════════════════════════════
           INDUSTRY INSIGHTS & BEST PRACTICES
           ═══════════════════════════════════════════════════════════════
           ${industryInsights || `Standard ${businessType} industry presentation`}

           ═══════════════════════════════════════════════════════════════
           VISUAL COMPOSITION REQUIREMENTS
           ═══════════════════════════════════════════════════════════════
           Format: Wide landscape (16:9 aspect ratio) - Perfect for hero/banner
           Composition: Cinematic, professional, eye-catching, magazine-quality
           Lighting: ${pricePoint === 'luxury' ? 'Dramatic, sophisticated lighting' : 'Natural, warm, inviting professional lighting'}
           Focus: Sharp, clear, high-definition, ${qualityTerms}
           Color Palette: ${pricePoint === 'luxury' ? 'Rich, deep colors with elegant tones' :
                          designMood === 'playful' ? 'Vibrant, energetic, colorful' :
                          'Professional, balanced, brand-appropriate colors'}
           Style: ULTRA-REALISTIC, PHOTOREALISTIC, looks like real photography

           ═══════════════════════════════════════════════════════════════
           🚨 CRITICAL: STRICTLY PROHIBITED - NEVER INCLUDE THESE 🚨
           ═══════════════════════════════════════════════════════════════
           ❌ ABSOLUTELY NO photography equipment (cameras, tripods, lighting equipment, umbrellas, reflectors, studio gear)
           ❌ ABSOLUTELY NO camera lenses, camera bodies, studio lights, softboxes, or any photo gear
           ❌ ABSOLUTELY NO brand logos (Apple, Microsoft, Google, Nike, etc.)
           ❌ ABSOLUTELY NO branded products or recognizable brand symbols
           ❌ ABSOLUTELY NO text, watermarks, captions, or overlays
           ❌ ABSOLUTELY NO UI elements, mockups, or interface components
           ❌ ABSOLUTELY NO cartoons, illustrations, or digital art style
           ❌ ABSOLUTELY NO 3D renders or CGI-looking images
           ❌ ABSOLUTELY NO clipart or graphic design elements

           SHOW THE ACTUAL BUSINESS/SERVICE IN ACTION:
           - Show people USING the service (not photographing it)
           - Show the RESULTS of the business work (not the tools)
           - Show REAL WORLD scenes related to the business
           - Show the ENVIRONMENT where the business operates
           - Focus on CUSTOMER EXPERIENCE, not production equipment

           ═══════════════════════════════════════════════════════════════
           MANDATORY TECHNICAL SPECIFICATIONS
           ═══════════════════════════════════════════════════════════════
           ✓ ULTRA-REALISTIC photography - indistinguishable from real photos
           ✓ PHOTOREALISTIC quality - NO cartoon, NO illustration, NO CGI look
           ✓ Ultra high resolution, print-quality photography
           ✓ Natural, authentic, real-world scenes
           ✓ NO text, NO watermarks, NO logos, NO overlays
           ✓ NO UI elements or interface components
           ✓ NO photography equipment or studio gear
           ✓ NO brand logos or branded products
           ✓ Clean, uncluttered composition
           ✓ Web-ready, professional finish
           ✓ Authentic, realistic representation

           ═══════════════════════════════════════════════════════════════
           🎯 CREATIVE OBJECTIVE - WORLD-CLASS, ON-POINT IMAGE REQUIRED
           ═══════════════════════════════════════════════════════════════
           Create a WORLD-CLASS hero image that demonstrates you READ and UNDERSTOOD every detail above:

           1. ✅ Immediately communicates what ${businessName || 'this business'} does
           2. ✅ Shows the ACTUAL service/product in use (NOT the tools to create it)
           3. ✅ Captures the essence of ${businessType} at the ${pricePoint || 'professional'} level
           4. ✅ Appeals directly to the ${targetAudience || 'target audience'}
           5. ✅ Reflects the ${designMood || 'professional'} mood and brand personality
           6. ✅ Looks like REAL PHOTOGRAPHY - ultra-realistic, photorealistic
           7. ✅ Shows REAL WORLD environment - NO studio setups, NO photography gear
           8. ✅ Stands out from competitors while maintaining industry professionalism
           9. ✅ Makes visitors want to learn more and engage with the business
           10. ✅ INCORPORATES specific details from the client's description above

           🚨 CRITICAL INTERPRETATION RULES:
           REMEMBER: Show what the business DELIVERS, not how it's made!
           - Marketing agency → show successful marketing RESULTS, happy clients, business growth
           - Restaurant → show delicious food being ENJOYED by happy diners
           - Gym → show people actively WORKING OUT and achieving fitness goals
           - Photography studio → show BEAUTIFUL PORTRAITS of people, NOT cameras or equipment!
           - Tech company → show people USING the technology successfully
           - Consulting firm → show professionals COLLABORATING and solving problems
           - E-commerce → show HAPPY CUSTOMERS receiving/using products
           - Real estate → show BEAUTIFUL PROPERTIES and satisfied homeowners

           📋 MANDATORY QUALITY CHECKLIST - ALL MUST BE TRUE:
           ☑ Did you read the ENTIRE description above? Use EVERY detail.
           ☑ Does the image reflect the specific ${pricePoint || 'price point'}? (luxury vs budget have different looks)
           ☑ Does it match the ${designMood || 'design mood'}? (playful vs professional vs elegant)
           ☑ Does it show what ${targetAudience || 'the audience'} cares about?
           ☑ Did you incorporate the ${industryInsights ? 'industry insights' : 'industry standards'}?
           ☑ Does it show the ${uniqueValue ? 'unique value proposition' : 'core value'}?
           ☑ Is it ULTRA-REALISTIC photography (NOT illustration, NOT cartoon, NOT CGI)?
           ☑ Is it completely FREE of cameras, logos, text, and prohibited items?

           🎯 FINAL INSTRUCTION:
           Use EVERY SINGLE piece of information provided in this prompt.
           Create a hero image that proves you READ IT ALL and UNDERSTOOD the business.
           This should be a SPECIFIC image for THIS business, NOT a generic stock photo.
           Make it WORLD-CLASS quality - magazine-worthy, professional, on-brand, and HIGHLY RELEVANT.`,

    FEATURES: `Create a ${businessType} related image showing features or benefits.
               ${description || `Professional setting showcasing ${businessType} services`}.

               🚨 STRICTLY PROHIBITED:
               ❌ NO photography equipment (cameras, lights, tripods, studio gear)
               ❌ NO brand logos (Apple, Microsoft, Google, etc.)
               ❌ NO cartoons, illustrations, or digital art
               ❌ NO text or watermarks

               REQUIREMENTS:
               ✓ ULTRA-REALISTIC, photorealistic photography only
               ✓ Show the ACTUAL service/product in use
               ✓ Natural, real-world environment
               ✓ ${qualityTerms}
               ✓ Clean composition, focused on the subject`,

    ABOUT: `Create a professional image representing ${businessName}, a ${businessType} company.
            ${description || `Show professional team or workplace environment for ${businessType}`}.

            🚨 STRICTLY PROHIBITED:
            ❌ NO photography equipment (cameras, lights, studio gear)
            ❌ NO brand logos (Apple, etc.) or branded products
            ❌ NO cartoons or illustrations
            ❌ NO text or logos

            REQUIREMENTS:
            ✓ ULTRA-REALISTIC, photorealistic photography
            ✓ ${qualityTerms}
            ✓ Authentic, trustworthy, human-centered
            ✓ Real workplace or team environment`,

    TEAM: `Create a professional headshot or team photo for ${businessType} business.
           ${description || `Professional business person in ${businessType} industry`}.

           🚨 STRICTLY PROHIBITED:
           ❌ NO photography equipment visible in shot
           ❌ NO brand logos or branded items
           ❌ NO cartoons or illustrations
           ❌ NO text

           REQUIREMENTS:
           ✓ ULTRA-REALISTIC, photorealistic photography
           ✓ ${qualityTerms}
           ✓ Professional attire, neutral background
           ✓ Confident, authentic expression`,

    SERVICES: `Create an image showcasing ${businessType} services.
               ${description || `Visual representation of ${businessType} service delivery`}.

               🚨 STRICTLY PROHIBITED:
               ❌ NO photography equipment
               ❌ NO brand logos (Apple, etc.)
               ❌ NO cartoons, illustrations, or digital art
               ❌ NO text or logos

               REQUIREMENTS:
               ✓ ULTRA-REALISTIC, photorealistic photography
               ✓ Show the SERVICE being delivered, not the tools
               ✓ ${qualityTerms}
               ✓ Clear, professional, service-focused composition`,

    CONTACT: `Create a welcoming image for ${businessType} contact section.
              ${description || `Inviting scene related to ${businessType} communication`}.

              🚨 STRICTLY PROHIBITED:
              ❌ NO photography equipment
              ❌ NO brand logos
              ❌ NO cartoons or illustrations
              ❌ NO text

              REQUIREMENTS:
              ✓ ULTRA-REALISTIC, photorealistic photography
              ✓ ${qualityTerms}
              ✓ Approachable, friendly, professional setting`,

    PORTFOLIO: `Create a portfolio showcase image for ${businessName}.
                ${description || `Example of ${businessType} work or project`}.

                🚨 STRICTLY PROHIBITED:
                ❌ NO photography equipment or studio gear
                ❌ NO brand logos (Apple, etc.)
                ❌ NO cartoons, illustrations
                ❌ NO text or logos

                REQUIREMENTS:
                ✓ ULTRA-REALISTIC, photorealistic photography
                ✓ Show the FINISHED WORK, not the creation process
                ✓ ${qualityTerms}
                ✓ Showcase-quality presentation`,

    TESTIMONIAL: `Create a background image for customer testimonials section.
                  ${description || `Happy customers or positive ${businessType} experience`}.

                  🚨 STRICTLY PROHIBITED:
                  ❌ NO photography equipment
                  ❌ NO brand logos
                  ❌ NO cartoons or illustrations
                  ❌ NO text

                  REQUIREMENTS:
                  ✓ ULTRA-REALISTIC, photorealistic photography
                  ✓ ${qualityTerms}
                  ✓ Positive, trustworthy atmosphere
                  ✓ Real people, authentic emotions`,
  }

  // Get template or use generic
  const template = templates[sectionType.toUpperCase()] || templates.HERO

  return template
}

/**
 * Get appropriate aspect ratio for section type
 */
function getAspectRatio(sectionType: string): string {
  const ratios: Record<string, string> = {
    HERO: '16:9',
    FEATURES: '4:3',
    ABOUT: '16:9',
    TEAM: '1:1',
    SERVICES: '4:3',
    CONTACT: '16:9',
    PORTFOLIO: '4:3',
    TESTIMONIAL: '16:9',
  }

  return ratios[sectionType.toUpperCase()] || '16:9'
}

/**
 * Generate descriptive alt text for accessibility
 */
function generateAltText(params: {
  businessName: string
  businessType: string
  sectionType: string
  description?: string
}): string {
  const { businessName, businessType, sectionType, description } = params

  const templates: Record<string, string> = {
    HERO: `Hero image for ${businessName}, ${businessType}${description ? ` - ${description}` : ''}`,
    FEATURES: `Features illustration for ${businessName} ${businessType}`,
    ABOUT: `About ${businessName} - ${businessType} company`,
    TEAM: `Team member at ${businessName}`,
    SERVICES: `Services provided by ${businessName}`,
    CONTACT: `Contact ${businessName} - ${businessType}`,
    PORTFOLIO: `Portfolio work from ${businessName}`,
    TESTIMONIAL: `Customer testimonials for ${businessName}`,
  }

  return templates[sectionType.toUpperCase()] || `Image for ${businessName}`
}

/**
 * Check if Gemini API is configured and available
 */
export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GEMINI_API_KEY)
}
