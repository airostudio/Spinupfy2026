import OpenAI from 'openai'
import { getBusinessTypeById } from './config/business-types'
import { BusinessAnalysis } from './business-analyzer'
import { AI_MODELS } from './ai-provider'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Safely parse JSON with fallback
 * Handles malformed JSON responses from OpenAI API
 */
function safeJSONParse<T>(content: string | null | undefined, fallback: T): T {
  if (!content) return fallback

  try {
    // Clean potential markdown code blocks
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return JSON.parse(cleaned)
  } catch (error) {
    console.error('JSON parse error:', error, 'Content:', content?.substring(0, 200))
    return fallback
  }
}

// World-class design inspiration by industry with enhanced UX patterns
const DESIGN_INSPIRATION: Record<string, {
  brands: string[],
  style: string,
  contentPrinciples: string[],
  layoutStrategy: string,
  dataPlacement: string
}> = {
  restaurant: {
    brands: ['Eleven Madison Park', 'The French Laundry', 'Alinea', 'Noma'],
    style: 'elegant culinary photography, warm ambient lighting, sophisticated typography',
    contentPrinciples: [
      'Lead with sensory language that evokes taste and atmosphere',
      'Feature chef credentials and culinary philosophy prominently',
      'Showcase signature dishes with professional food photography',
      'Include reservation CTA above the fold'
    ],
    layoutStrategy: 'Hero with atmospheric image, immediate menu access, chef story section, elegant gallery',
    dataPlacement: 'Contact and hours visible in header/footer, reservation button persistent, menu easily accessible'
  },
  bakery: {
    brands: ['Dominique Ansel', 'Tartine Bakery', 'Poilâne', 'Levain'],
    style: 'artisanal warmth, rustic elegance, mouth-watering close-ups',
    contentPrinciples: [
      'Emphasize handcrafted and artisanal process',
      'Tell the story of traditions and techniques',
      'Feature daily fresh offerings prominently',
      'Show behind-the-scenes baking imagery'
    ],
    layoutStrategy: 'Warm hero with fresh pastries, "Today\'s Selection" feature, artisan story, location/hours prominent',
    dataPlacement: 'Hours and location in multiple places, order/visit CTA clear, seasonal specials highlighted'
  },
  'coffee-shop': {
    brands: ['Blue Bottle Coffee', 'Stumptown', 'Intelligentsia', 'Counter Culture'],
    style: 'minimalist sophistication, craft aesthetic, warm inviting spaces',
    contentPrinciples: [
      'Highlight coffee sourcing and roasting philosophy',
      'Showcase the craft and expertise of baristas',
      'Create a sense of community and third place',
      'Feature seasonal and specialty offerings'
    ],
    layoutStrategy: 'Clean hero with coffee imagery, menu with detailed descriptions, sourcing story, cozy atmosphere photos',
    dataPlacement: 'Location prominent, hours clear, online ordering if available, subscription/bags featured'
  },
  'law-firm': {
    brands: ['Cravath', 'Skadden', 'Sullivan & Cromwell', 'Latham & Watkins'],
    style: 'authoritative elegance, classic professionalism, trust-inspiring imagery',
    contentPrinciples: [
      'Lead with credentials, experience, and track record',
      'Emphasize expertise in specific practice areas',
      'Build trust through case results and recognition',
      'Make contact information and consultation CTA prominent'
    ],
    layoutStrategy: 'Professional hero with firm credentials, practice areas grid, attorney profiles, results/testimonials',
    dataPlacement: 'Contact in header and footer, consultation CTA prominent, practice areas easily navigable'
  },
  consulting: {
    brands: ['McKinsey', 'Bain', 'BCG', 'Accenture'],
    style: 'modern corporate, data-driven visuals, strategic sophistication',
    contentPrinciples: [
      'Lead with transformation outcomes and results',
      'Showcase methodology and approach',
      'Feature thought leadership and expertise',
      'Demonstrate industry expertise through case studies'
    ],
    layoutStrategy: 'Bold headline with outcomes, services overview, methodology section, case studies, team expertise',
    dataPlacement: 'Contact for consultation prominent, downloadable resources accessible, expertise areas navigable'
  },
  'real-estate': {
    brands: ['Sothebys International', 'Christies Real Estate', 'Compass', 'Douglas Elliman'],
    style: 'luxury property photography, architectural elegance, aspirational lifestyle',
    contentPrinciples: [
      'Showcase properties with stunning photography',
      'Emphasize agent expertise and local knowledge',
      'Feature market insights and neighborhood guides',
      'Make property search intuitive and prominent'
    ],
    layoutStrategy: 'Hero with featured listing, property search prominent, agent profile, market insights, testimonials',
    dataPlacement: 'Search/browse listings CTA dominant, agent contact prominent, listing updates accessible'
  },
  'beauty-spa': {
    brands: ['Four Seasons Spa', 'Canyon Ranch', 'Aman Resorts', 'Exhale Spa'],
    style: 'serene tranquility, soft natural lighting, wellness imagery',
    contentPrinciples: [
      'Evoke relaxation and transformation through imagery',
      'Detail treatments with benefits clearly explained',
      'Create sense of escape and sanctuary',
      'Feature practitioner expertise and credentials'
    ],
    layoutStrategy: 'Calming hero with spa imagery, services with benefits, booking CTA, team expertise, gallery',
    dataPlacement: 'Book appointment CTA prominent, services menu accessible, gift cards featured if offered'
  },
  'hair-salon': {
    brands: ['Drybar', 'Ouai', 'Oribe', 'Bumble and bumble'],
    style: 'chic minimalism, editorial beauty shots, modern sophistication',
    contentPrinciples: [
      'Showcase stylist work through portfolio imagery',
      'Feature expertise and specializations',
      'Make booking seamless and prominent',
      'Create aspirational yet approachable aesthetic'
    ],
    layoutStrategy: 'Stylish hero with salon work, services menu, stylist profiles, gallery of looks, booking',
    dataPlacement: 'Book now CTA always visible, services and pricing transparent, stylist bios accessible'
  },
  fitness: {
    brands: ['Equinox', 'Barry\'s Bootcamp', 'SoulCycle', 'Orange Theory'],
    style: 'high-energy motivation, dynamic action shots, premium fitness aesthetic',
    contentPrinciples: [
      'Lead with transformation and results',
      'Showcase community and group energy',
      'Feature class variety and schedule',
      'Highlight trainer expertise and certifications'
    ],
    layoutStrategy: 'Dynamic hero with workout action, class schedule prominent, trainer profiles, membership options',
    dataPlacement: 'Free trial/membership CTA dominant, class schedule easily accessible, location/hours prominent'
  },
  'tech-saas': {
    brands: ['Stripe', 'Linear', 'Notion', 'Vercel', 'Figma'],
    style: 'clean interfaces, subtle gradients, modern tech aesthetic',
    contentPrinciples: [
      'Lead with clear value proposition and outcome',
      'Show product interface/screenshots prominently',
      'Feature customer logos and social proof',
      'Make pricing and trial access clear'
    ],
    layoutStrategy: 'Bold headline with product visual, feature bento grid, customer logos, testimonials, pricing',
    dataPlacement: 'Get started/signup CTA persistent, pricing easily accessible, demo option prominent'
  },
  'creative-agency': {
    brands: ['Pentagram', 'IDEO', 'MetaLab', 'Fantasy Interactive'],
    style: 'bold creativity, innovative layouts, artistic expression',
    contentPrinciples: [
      'Lead with portfolio work as the hero',
      'Let the work speak first, then explain process',
      'Showcase range of capabilities through case studies',
      'Create memorable, distinctive visual experience'
    ],
    layoutStrategy: 'Work-led hero with case studies, services, about/team, awards/recognition',
    dataPlacement: 'Portfolio navigation prominent, contact for projects accessible, services discoverable'
  },
  photography: {
    brands: ['Annie Leibovitz', 'Peter McKinnon', 'Brandon Stanton'],
    style: 'portfolio-focused, dramatic imagery, artistic showcase',
    contentPrinciples: [
      'Lead with strongest visual work',
      'Let images dominate, minimal text',
      'Organize by project or category',
      'Make booking and contact seamless'
    ],
    layoutStrategy: 'Full-bleed portfolio hero, gallery categories, about/approach, booking information',
    dataPlacement: 'Portfolio categories easy to navigate, booking/contact prominent, pricing if applicable'
  },
  'pet-services': {
    brands: ['Chewy', 'BarkBox', 'Rover', 'Petco'],
    style: 'playful warmth, adorable pet imagery, trustworthy care',
    contentPrinciples: [
      'Feature adorable pets prominently',
      'Build trust through credentials and testimonials',
      'Clearly explain services and process',
      'Emphasize safety and care standards'
    ],
    layoutStrategy: 'Warm hero with happy pets, services grid, trust elements, testimonials, booking',
    dataPlacement: 'Book appointment CTA prominent, services and pricing clear, safety info accessible'
  },
  hospitality: {
    brands: ['Four Seasons', 'Aman Resorts', 'Ritz-Carlton', 'One&Only'],
    style: 'luxury hospitality, destination imagery, exceptional service',
    contentPrinciples: [
      'Lead with stunning destination imagery',
      'Create sense of place and experience',
      'Feature amenities and unique offerings',
      'Make booking seamless and prominent'
    ],
    layoutStrategy: 'Immersive destination hero, rooms/suites, amenities, dining, experiences, booking',
    dataPlacement: 'Book now prominent throughout, room categories navigable, contact accessible'
  },
  medical: {
    brands: ['Mayo Clinic', 'Cleveland Clinic', 'Johns Hopkins', 'UCLA Health'],
    style: 'trustworthy clinical, reassuring professionalism, patient-focused care',
    contentPrinciples: [
      'Build trust through credentials and expertise',
      'Make appointment scheduling prominent',
      'Clearly explain services and conditions treated',
      'Feature patient testimonials and outcomes'
    ],
    layoutStrategy: 'Professional hero with care focus, services/specialties, provider profiles, patient info, scheduling',
    dataPlacement: 'Schedule appointment CTA prominent, provider directory accessible, patient portal linked'
  },
  default: {
    brands: ['Apple', 'Airbnb', 'Stripe'],
    style: 'modern elegance, clean typography, premium quality',
    contentPrinciples: [
      'Lead with clear value proposition',
      'Build trust through social proof',
      'Make primary action obvious',
      'Keep design clean and focused'
    ],
    layoutStrategy: 'Clear hero with value prop, features/benefits, social proof, clear CTA',
    dataPlacement: 'Primary CTA prominent, contact accessible, key information easy to find'
  }
}

// Enhanced website content generation with business type context and competitor research
export async function generateWebsiteContent(params: {
  businessName: string
  description: string
  websiteType?: string
  businessType?: string
  targetAudience?: string
  features?: string[]
  tone?: string
  existingContent?: {
    headings?: string[]
    paragraphs?: string[]
    keywords?: string[]
  }
  competitorInsights?: string // Real competitor research data
}) {
  const { businessName, description, websiteType, businessType: businessTypeProp, targetAudience, features, tone, existingContent, competitorInsights } = params
  // Support both websiteType and businessType for backward compatibility
  const typeId = websiteType || businessTypeProp || 'general'
  const businessType = getBusinessTypeById(typeId)

  // Build sophisticated business context with design system
  let businessContext = ''
  if (businessType) {
    businessContext = `Business type: ${businessType.label}
Recommended sections: ${businessType.recommendedSections.join(', ')}
Industry keywords: ${businessType.keywords.join(', ')}
Color mood: ${businessType.colorTheme.mood}`

    // Add design system if available
    if (businessType.designSystem) {
      const ds = businessType.designSystem
      businessContext += `

DESIGN SYSTEM & AESTHETIC VISION:
Design aesthetic: ${ds.style.aesthetic}
Typography: ${ds.typography.heading} for headings, ${ds.typography.body} for body text
Primary color: ${ds.colors.primaryHex}
Secondary color: ${ds.colors.secondaryHex}
Accent color: ${ds.colors.accentHex}
${ds.style.competitors ? `Inspiration from: ${ds.style.competitors.join(', ')}` : ''}
Image style: ${ds.style.imageStyle}

Create a sophisticated, high-end ${businessType.label} website that evokes the elegance and professionalism of ${ds.style.competitors?.[0] || 'industry leaders'} with a modern, sleek aesthetic.`
    }
  }

  const additionalContext = [
    targetAudience ? `Target audience: ${targetAudience}` : '',
    features && features.length > 0 ? `Key features to highlight: ${features.join(', ')}` : '',
    tone ? `Content tone: ${tone}` : '',
    existingContent ? `Existing content to improve:\nHeadings: ${existingContent.headings?.join(', ') || 'none'}\nKeywords: ${existingContent.keywords?.join(', ') || 'none'}` : '',
    competitorInsights ? `\n${competitorInsights}` : ''
  ].filter(Boolean).join('\n')

  const response = await openai.chat.completions.create({
    model: AI_MODELS.openai.text,
    messages: [
      {
        role: 'system',
        content: `You are an elite web designer and brand strategist at a world-class agency, known for creating award-winning websites that rival industry leaders like ${(DESIGN_INSPIRATION[typeId] || DESIGN_INSPIRATION.default).brands.join(', ')}.

Your design philosophy:
- WORLD-CLASS QUALITY: Every website should look like it was designed by a top agency charging $50,000+
- INTELLIGENT INTERPRETATION: Analyze client descriptions to understand their true vision, not just literal words
- INDUSTRY EXPERTISE: Apply deep knowledge of ${businessType?.label || 'business'} industry best practices
- EMOTIONAL CONNECTION: Create content that resonates emotionally with the target audience
- CONVERSION-FOCUSED: Every element should guide visitors toward taking action
- COMPETITOR-INFORMED: ${params.competitorInsights ? 'We have conducted REAL competitor research - use these insights to exceed what competitors are doing' : 'Study what industry leaders do well and improve upon it'}

DESIGN AESTHETIC for ${businessType?.label || 'this industry'}:
${(DESIGN_INSPIRATION[typeId] || DESIGN_INSPIRATION.default).style}

CONTENT PRINCIPLES TO FOLLOW:
${(DESIGN_INSPIRATION[typeId] || DESIGN_INSPIRATION.default).contentPrinciples.map(p => `• ${p}`).join('\n')}

LAYOUT STRATEGY:
${(DESIGN_INSPIRATION[typeId] || DESIGN_INSPIRATION.default).layoutStrategy}

DATA PLACEMENT INTELLIGENCE:
${(DESIGN_INSPIRATION[typeId] || DESIGN_INSPIRATION.default).dataPlacement}

IMPORTANT UX BEST PRACTICES:
1. HERO SECTION: The first 5 seconds determine if a visitor stays. Lead with:
   - A clear, benefit-driven headline that answers "What do you do and why should I care?"
   - A supporting subtitle that adds specificity or emotional connection
   - A prominent primary CTA that tells users exactly what to do next
   - Trust indicators (years in business, customer count, ratings) when applicable

2. INFORMATION HIERARCHY: Organize content by user priority:
   - Most important info visible without scrolling (hero, key services, contact)
   - Supporting details in logical sections below
   - Trust elements (testimonials, credentials) placed strategically
   - Contact information accessible from every section

3. CONVERSION OPTIMIZATION:
   - Every section should have a clear purpose driving toward conversion
   - Use benefit-focused language, not feature-focused
   - Include social proof near decision points
   - Make CTAs specific and action-oriented ("Book Your Free Consultation" not "Submit")

4. VISUAL BALANCE:
   - Alternate between text-heavy and image-heavy sections
   - Use white space intentionally for readability
   - Group related information visually
   - Maintain consistent styling across all sections`,
      },
      {
        role: 'user',
        content: `Create sophisticated, comprehensive website content for: ${businessName}

CLIENT DESCRIPTION:
${description}

${businessContext}

${additionalContext}

INSTRUCTIONS:
- Analyze the client description intelligently, detecting keywords and intent beyond literal words
- If they mention specific needs (e.g., "online store", "booking system", "portfolio showcase"), ensure the content reflects those features
- Create content with elegant, refined copy that matches the sophistication of the design aesthetic
- Use industry-specific terminology and showcase deep understanding of the business type
- Include compelling CTAs that are contextually relevant to each section
- Ensure all content aligns with the specified design system aesthetic and mood
- Think like a senior designer interpreting client needs - deliver what they envision, not just what they explicitly say

E-COMMERCE/PRODUCT DETECTION (IMPORTANT):
If the business description mentions ANY of these keywords, generate the "products" section with 6-8 realistic products:
- Direct keywords: online store, shop, e-commerce, merch, merchandise, sell online, products, retail
- Implied keywords: clothing, apparel, accessories, jewelry, gifts, gadgets, handmade, crafts, boutique, collection
- Action keywords: buy, purchase, order, add to cart, checkout, shipping, delivery

For products, ensure:
- Product names are specific and descriptive (not generic like "Product 1")
- Descriptions highlight unique selling points and benefits
- Prices are realistic for the business type and market
- Categories match the business niche
- Each product has 3-5 key features
- Generate 6-8 diverse products covering the product range

TESTIMONIALS REQUIREMENTS (CRITICAL):
- Create 4-6 authentic, detailed testimonials from ACTUAL CUSTOMERS who used this business's services/products
- Testimonials MUST be from the CUSTOMER perspective (e.g., pet owners for pet grooming, diners for restaurants, home buyers for real estate)
- NEVER use testimonials from: IT managers, technical directors, business partners, or B2B stakeholders UNLESS this is explicitly a B2B/tech business
- Each testimonial should mention SPECIFIC benefits, outcomes, or results relevant to what this business provides

EXAMPLE TESTIMONIAL OUTPUTS BY BUSINESS TYPE:
  * Bakery: {"content": "The croissants here are absolutely incredible - flaky, buttery perfection every single time. We've been ordering their pastries for our office meetings every Friday for the past year and everyone always raves about them. The sourdough bread is amazing too!", "name": "Emily R.", "role": "Regular Customer", "rating": 5}

  * Pet Grooming: {"content": "My golden retriever Max was always anxious at other groomers, but the team here is so patient and gentle with him. He actually gets excited when we pull up now! They do an amazing job and he always comes home looking and smelling fresh.", "name": "Sarah Mitchell", "role": "Dog Owner", "rating": 5}

  * Restaurant: {"content": "This place has the best Italian food I've had outside of Italy. The homemade pasta is cooked perfectly and the carbonara is to die for. The atmosphere is cozy and romantic - perfect for date night. We come here at least twice a month now.", "name": "James Chen", "role": "Local Resident", "rating": 5}

  * Real Estate: {"content": "We were first-time homebuyers and completely overwhelmed by the process. Our agent walked us through everything step by step and helped us find our dream home in just 3 weeks. The whole experience was smooth and stress-free thanks to their expertise.", "name": "Maria & Tom Garcia", "role": "Happy Homeowners", "rating": 5}

  * Hair Salon: {"content": "I've been going to different salons for years trying to find someone who really understood my hair texture. Sarah is absolutely amazing - she listened to exactly what I wanted and gave me the best haircut of my life. I get compliments on it constantly!", "name": "Jessica Brown", "role": "Client", "rating": 5}
- Include diverse customer types realistic for THIS industry (families, professionals, retirees, young adults, etc.)
- Use natural, conversational language like real online reviews - include personal details and emotions
- Each testimonial should tell a mini-story: situation → experience → specific outcome
- Author names should be realistic everyday people (not corporate titles unless B2B business)
- For B2C businesses: Use first name + last initial OR first and last name with casual context (e.g., "Sarah M., Regular Customer" or "Michael Torres, Local Resident")
- For B2B businesses: Use full name with company role (e.g., "Jennifer Chen, Operations Director at TechCorp")
- All testimonials should be 2-4 sentences and feel like genuine customer reviews you'd see on Google or Yelp
- CRITICAL: Generate 4-6 complete testimonials with FULL TEXT CONTENT in the "content" field - never leave it empty or use placeholder instructions
- CRITICAL: Each testimonial MUST have these exact field names: "content" (NOT "text"), "name" (NOT "author"), "role", and "rating"
- CRITICAL: The "content" field must contain the actual testimonial quote - 2-4 full sentences with specific details

SEO REQUIREMENTS (CRITICAL):
- Create a metaTitle that is 50-60 characters, includes the primary keyword, and is compelling for search results
- Write a metaDescription that is 150-160 characters with the primary keyword, value proposition, and call-to-action
- Generate 5-10 relevant keywords that match search intent for this business type
- The focusKeyword should be the single most important keyword this page should rank for
- Make ogTitle and ogDescription social-media optimized (can match meta tags but optimize for clicks)
- All SEO content must be unique, compelling, and follow Google's latest guidelines

CTA COPY REQUIREMENTS (HIGH-CONVERSION):
- AVOID generic CTAs like "Learn More", "Sign Up", "Submit", "Click Here", "Get Started"
- USE benefit-driven CTAs that tell users exactly what they'll get:
  * Pet Grooming: "Book Your Dog's Spa Day" instead of "Schedule Appointment"
  * Restaurant: "Reserve Your Table Tonight" instead of "Make Reservation"
  * Real Estate: "Find Your Dream Home in 60 Seconds" instead of "Search Listings"
  * Bakery: "Order Fresh Pastries for Tomorrow" instead of "Order Now"
  * Fitness: "Start Your Free 7-Day Trial" instead of "Join Now"
  * Consulting: "Get Your Free Strategy Session" instead of "Contact Us"
- Include specific timeframes when relevant ("Get Quote in 24 Hours", "Book Within 2 Minutes")
- Focus on immediate value ("See Pricing", "View Available Dates", "Get Instant Access")
- Use first-person perspective when impactful ("Start My Free Trial", "Claim My Discount")

"OUR STORY" SECTION REQUIREMENTS (COMPELLING BRAND NARRATIVE):
The "about" section should tell a captivating origin story that emotionally connects with customers. Follow these storytelling principles:

STORY STRUCTURE - Use the classic narrative arc:
1. THE BEGINNING (Origin): How did this business start? What problem did the founder see? What inspired them?
   - Include a specific moment, challenge, or realization that sparked the idea
   - Make it relatable and human (not corporate or generic)
   - Example: "It all started when Sarah couldn't find organic dog treats that her allergic golden retriever could eat..."

2. THE JOURNEY (Growth): What challenges were overcome? How did the business evolve?
   - Show growth, learning, or transformation
   - Highlight key milestones or turning points
   - Include passion and dedication
   - Example: "After months of experimenting in her kitchen and consulting with veterinarians, Sarah perfected her recipes..."

3. THE NOW (Today): Where is the business today? What's the impact?
   - Showcase current achievements and reach
   - Emphasize the difference being made for customers
   - End with forward momentum
   - Example: "Today, we're proud to serve over 5,000 dogs in our community, with every treat made fresh daily..."

STORYTELLING BEST PRACTICES:
- Write in a warm, authentic voice that reflects the brand personality
- Use specific details (numbers, places, names) to make it feel real and credible
- Include emotional elements that resonate with the target audience
- Show passion and expertise without bragging
- Keep paragraphs concise (3-5 sentences each) for easy reading
- End with a forward-looking statement that invites customers to be part of the story

MISSION STATEMENT (1-2 sentences):
- Start with "To [action verb]..."
- Be specific about WHO you serve and HOW you serve them
- Focus on the customer benefit, not just what you do
- Example: "To help busy families enjoy healthy, home-cooked meals without the stress of planning and prep."
- Avoid generic phrases like "provide quality" or "exceed expectations"

VISION STATEMENT (1-2 sentences):
- Paint a picture of the future impact you want to create
- Be aspirational but believable
- Focus on the change you want to see in the world or your community
- Example: "A world where every dog owner can confidently nourish their pet with treats they trust."
- Should inspire and give direction

HIGHLIGHTS (3-5 key points):
- Each should be a unique value proposition or differentiator
- Use active, compelling language (not bullet points)
- Focus on customer benefits, not just features
- Keep to 5-8 words each
- Examples: "Over 10 years of industry expertise", "Family-owned and operated", "Sustainably sourced ingredients", "Award-winning customer service"

ABOUT SECTION - QUICK OVERVIEW (CRITICAL):
The "overview" field is a quick elevator pitch that visitors see first:
- Must be 2-3 concise sentences (50-80 words total)
- Captures the essence: WHAT the business does, WHO it serves, and what makes it SPECIAL
- Should immediately answer "What is this business about?" for first-time visitors
- Use clear, engaging language that creates instant understanding
- Examples:
  * Restaurant: "We are a farm-to-table Italian restaurant bringing authentic Tuscan flavors to downtown Seattle. Our chef sources ingredients from local farms daily to create fresh, seasonal dishes that celebrate traditional Italian cooking with a Pacific Northwest twist."
  * Pet Grooming: "Paws & Claws is a full-service pet grooming salon where we treat every pet like family. Our certified groomers specialize in breed-specific cuts, therapeutic baths, and stress-free grooming experiences for dogs and cats of all sizes."
  * Law Firm: "We are a boutique family law practice dedicated to guiding clients through life's most challenging transitions with compassion and expertise. Our attorneys bring over 50 years of combined experience in divorce, custody, and estate planning matters."

ABOUT SECTION - BUSINESS FEATURES (CRITICAL):
The "features" array showcases the KEY capabilities and differentiators of the business:
- MUST include 6 features (to fill the grid layout properly)
- Each feature should highlight a specific capability, service strength, or competitive advantage
- Features should be DIFFERENT from the main Features section - focus on "why choose us" aspects
- Use relevant emojis as icons (🏆 for awards, ⏰ for quick service, 🌿 for organic, etc.)
- Title: 3-5 words, clear and specific
- Description: 15-25 words explaining the benefit to customers

Feature Examples by Business Type:
* Restaurant: "Farm-Fresh Ingredients", "Award-Winning Chef", "Private Dining Available", "Outdoor Patio Seating", "Catering Services", "Weekly Specials"
* Salon: "Certified Master Stylists", "Organic Products Only", "Online Booking", "Complimentary Consultations", "VIP Membership Program", "Flexible Hours"
* Law Firm: "Free Initial Consultation", "24/7 Client Support", "No Win No Fee", "Experienced Trial Lawyers", "Multilingual Staff", "Virtual Appointments"

REQUIRED JSON STRUCTURE - Return JSON with these exact properties:
{
  "hero": {
    "title": "Main headline (compelling, benefit-focused, 8-12 words max)",
    "subtitle": "Supporting tagline (emotional benefit, 12-20 words)",
    "ctaText": "Primary button text (benefit-driven action, use examples above)",
    "secondaryCtaText": "Optional secondary CTA (softer action like 'See How It Works')"
  },
  "about": {
    "title": "About section heading (e.g., 'Our Story', 'About Us', 'How We Started')",
    "content": "3-4 compelling paragraphs telling the origin story: (1) The Beginning - how it started, what inspired it; (2) The Journey - challenges overcome, growth, dedication; (3) The Now - current impact and achievements; (4) The Future - invitation to join the journey. Use specific details, authentic voice, and emotional connection. Write 150-200 words total.",
    "overview": "A concise 2-3 sentence summary (50-80 words) that captures the essence of the business: what it does, who it serves, and what makes it special. This is the quick elevator pitch that visitors see first. Example: 'We are a family-owned bakery specializing in artisan sourdough breads and French pastries. For over 15 years, we have been crafting delicious baked goods using traditional techniques and locally-sourced ingredients, serving our community with warmth and dedication.'",
    "features": [
      {"title": "Feature name (3-5 words)", "description": "Brief explanation of this business feature/capability (15-25 words)", "icon": "relevant emoji"},
      {"title": "Feature 2", "description": "What makes this feature valuable to customers", "icon": "emoji"},
      {"title": "Feature 3", "description": "Specific benefit or capability", "icon": "emoji"},
      {"title": "Feature 4", "description": "Another key differentiator", "icon": "emoji"},
      {"title": "Feature 5", "description": "Additional business strength", "icon": "emoji"},
      {"title": "Feature 6", "description": "Final key feature", "icon": "emoji"}
    ],
    "highlights": ["Unique value proposition 1 (5-8 words)", "Differentiator 2", "Key benefit 3", "Competitive advantage 4"],
    "mission": "Mission statement: 'To [action verb] [target audience] by [unique approach/benefit]' (1-2 compelling sentences)",
    "vision": "Vision statement: Future impact and change you want to create (1-2 aspirational sentences)"
  },
  "features": {
    "title": "Features section heading",
    "subtitle": "Features description",
    "items": [
      {"title": "Feature name 1 (this will be the main large card)", "description": "Feature description - make this the most important feature", "icon": "emoji"},
      {"title": "Feature name 2", "description": "Feature description 2", "icon": "emoji"},
      {"title": "Feature name 3", "description": "Feature description 3", "icon": "emoji"},
      {"title": "Feature name 4", "description": "Feature description 4", "icon": "emoji"}
    ]
  },
  "benefits": {
    "title": "Benefits section heading",
    "items": [
      {"title": "Benefit", "description": "Why this matters"},
      {"title": "Benefit 2", "description": "Why this matters"}
    ]
  },
  "howItWorks": {
    "title": "Process section heading",
    "steps": [
      {"number": 1, "title": "Step name", "description": "Step description"},
      {"number": 2, "title": "Step name", "description": "Step description"}
    ]
  },
  "services": {
    "title": "Services heading",
    "subtitle": "Services description",
    "description": "Overview of services",
    "services": [
      {"title": "Service 1", "description": "Service 1 details", "icon": "emoji"},
      {"title": "Service 2", "description": "Service 2 details", "icon": "emoji"},
      {"title": "Service 3", "description": "Service 3 details", "icon": "emoji"},
      {"title": "Service 4", "description": "Service 4 details", "icon": "emoji"},
      {"title": "Service 5", "description": "Service 5 details", "icon": "emoji"},
      {"title": "Service 6", "description": "Service 6 details", "icon": "emoji"}
    ]
  },
  "team": {
    "title": "Team section heading",
    "subtitle": "Team description",
    "members": [
      {"name": "Name", "role": "Position", "bio": "Background"}
    ]
  },
  "testimonials": {
    "title": "Testimonials heading",
    "subtitle": "Social proof description",
    "items": [
      {
        "content": "Actual customer testimonial text here - 2-4 sentences describing their experience, specific outcomes, and emotions",
        "name": "Jane Smith",
        "role": "Customer context (e.g., Dog Owner, Local Resident, Regular Customer)",
        "rating": 5
      },
      {
        "content": "Another testimonial with different customer perspective and specific details about their experience",
        "name": "Michael Johnson",
        "role": "Customer context relevant to this business",
        "rating": 5
      }
    ]
  },
  "contact": {
    "title": "Contact heading",
    "subtitle": "Contact description"
  },
  "products": {
    "title": "Shop/Store heading (e.g., 'Our Products', 'Shop Our Collection')",
    "subtitle": "Store description that entices customers to browse",
    "items": [
      {
        "name": "Specific product name (e.g., 'Artisan Sourdough Loaf', 'Premium Dog Grooming Kit')",
        "description": "Detailed product description (2-3 sentences highlighting unique features, materials, and customer benefits)",
        "price": 29.99,
        "category": "Category name (e.g., 'Breads', 'Pet Care', 'Electronics')",
        "features": ["Key feature 1", "Key feature 2", "Key feature 3"]
      }
    ]
  },
  "seo": {
    "metaTitle": "SEO-optimized page title (50-60 characters max, include primary keyword)",
    "metaDescription": "Compelling meta description (150-160 characters max, include primary keyword and CTA)",
    "metaKeywords": "keyword1, keyword2, keyword3, keyword4, keyword5 (5-10 relevant keywords)",
    "ogTitle": "Open Graph title for social media sharing (can be same as metaTitle)",
    "ogDescription": "Description for social media shares (can be same as metaDescription)",
    "twitterTitle": "Twitter card title (optional, defaults to ogTitle)",
    "focusKeyword": "Primary keyword for this page"
  }
}

Make all content sophisticated, elegant, and aligned with the design aesthetic.

STRICT REQUIREMENTS:
- About Overview: MUST include a concise 2-3 sentence overview (50-80 words) that summarizes what the business does, who it serves, and what makes it special
- About Features: MUST have EXACTLY 6 feature items with title, description, and icon
- Features: MUST have EXACTLY 4 items (1 main feature + 3 supporting features for the layout)
- Services: MUST have EXACTLY 6 items (to fill 2 rows of 3 cards)
- Testimonials: MUST have AT LEAST 3 testimonials
- Benefits: Use 3-4 items
- Products (if e-commerce detected): MUST have EXACTLY 6-8 products with:
  * Specific, descriptive product names (NOT generic like "Product 1")
  * Detailed descriptions highlighting unique features and benefits
  * Realistic prices for the business type
  * A category for each product (group related products together)
  * 3-5 key features per product`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    // Return default structure if no content
    const shortDesc = description.substring(0, 160)
    return {
      hero: { title: businessName, subtitle: description, ctaText: 'Get Started' },
      about: { title: `About ${businessName}`, content: description, overview: shortDesc, features: [], highlights: [], mission: '', vision: '' },
      features: { title: 'Features', subtitle: '', items: [] },
      benefits: { title: 'Benefits', items: [] },
      services: { title: 'Services', subtitle: '', description: '', services: [] },
      team: { title: 'Our Team', subtitle: '', members: [] },
      testimonials: { title: 'Testimonials', subtitle: '', items: [] },
      contact: { title: 'Contact Us', subtitle: '' },
      seo: {
        metaTitle: `${businessName} | ${websiteType || 'Professional Services'}`,
        metaDescription: shortDesc,
        metaKeywords: businessType?.keywords.join(', ') || '',
        ogTitle: businessName,
        ogDescription: shortDesc,
        focusKeyword: websiteType || businessType?.label || 'services'
      }
    }
  }

  try {
    const parsed = JSON.parse(content)
    // Ensure all required properties exist with defaults - pass through all optional properties from parsed
    return {
      hero: parsed.hero || { title: businessName, subtitle: description, ctaText: 'Get Started' },
      about: parsed.about || { title: `About ${businessName}`, content: description, highlights: [], mission: '', vision: '' },
      features: parsed.features || { title: 'Features', subtitle: '', items: [] },
      benefits: parsed.benefits,
      howItWorks: parsed.howItWorks,
      services: parsed.services,
      pricing: parsed.pricing,
      cta: parsed.cta,
      team: parsed.team,
      products: parsed.products,
      testimonials: parsed.testimonials,
      faq: parsed.faq,
      contact: parsed.contact || { title: 'Contact Us', subtitle: '' },
      seo: parsed.seo || { metaDescription: description }
    }
  } catch (error) {
    console.error('Error parsing AI content:', error)
    // Return default structure on parse error
    const shortDesc = description.substring(0, 160)
    return {
      hero: { title: businessName, subtitle: description, ctaText: 'Get Started' },
      about: { title: `About ${businessName}`, content: description, overview: shortDesc, features: [], highlights: [], mission: '', vision: '' },
      features: { title: 'Features', subtitle: '', items: [] },
      benefits: { title: 'Benefits', items: [] },
      services: { title: 'Services', subtitle: '', description: '', services: [] },
      team: { title: 'Our Team', subtitle: '', members: [] },
      testimonials: { title: 'Testimonials', subtitle: '', items: [] },
      contact: { title: 'Contact Us', subtitle: '' },
      seo: {
        metaTitle: `${businessName} | ${websiteType || 'Professional Services'}`,
        metaDescription: shortDesc,
        metaKeywords: businessType?.keywords.join(', ') || '',
        ogTitle: businessName,
        ogDescription: shortDesc,
        focusKeyword: websiteType || businessType?.label || 'services'
      }
    }
  }
}

// Generate content for a specific section based on business context
export async function generateSectionContent(params: {
  sectionType: string
  businessName: string
  businessType: string
  additionalContext?: string
}) {
  const { sectionType, businessName, businessType, additionalContext } = params
  const businessTypeConfig = getBusinessTypeById(businessType)

  const response = await openai.chat.completions.create({
    model: AI_MODELS.openai.text,
    messages: [
      {
        role: 'system',
        content: `You are an expert web designer creating a ${sectionType} section. Generate content as JSON with appropriate fields for this section type.`,
      },
      {
        role: 'user',
        content: `Create a ${sectionType} section for ${businessName} (${businessTypeConfig?.label || businessType}).
${additionalContext ? `Context: ${additionalContext}` : ''}

Return JSON with appropriate fields for this section type (title, subtitle, description, CTA buttons, features, etc.).`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  return safeJSONParse(content, {})
}

// Generate content for a dedicated feature page
export async function generateFeaturePageContent(params: {
  featureTitle: string
  featureDescription: string
  businessName: string
  businessType: string
  tone?: 'professional' | 'casual' | 'friendly' | 'formal' | 'creative'
}) {
  const { featureTitle, featureDescription, businessName, businessType, tone = 'professional' } = params
  const businessTypeConfig = getBusinessTypeById(businessType)

  const response = await openai.chat.completions.create({
    model: AI_MODELS.openai.text,
    messages: [
      {
        role: 'system',
        content: `You are an expert web designer and copywriter. Generate comprehensive content for a feature page with a ${tone} tone.`,
      },
      {
        role: 'user',
        content: `Create detailed content for a feature page about "${featureTitle}" for ${businessName} (${businessTypeConfig?.label || businessType}).

Feature description: ${featureDescription}

Return JSON with:
- hero: { title, subtitle, description }
- benefits: array of { title, description, icon }
- details: { heading, paragraphs: array of text }
- cta: { title, description, buttonText }

Make the content engaging, informative, and specific to this feature. Use a ${tone} tone throughout.`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  return safeJSONParse(content, {})
}

// Refine or rewrite existing content
export async function refineContent(params: {
  originalContent: string
  instruction: string
  tone?: 'professional' | 'casual' | 'friendly' | 'formal' | 'creative'
  length?: 'shorter' | 'longer' | 'same'
}) {
  const { originalContent, instruction, tone = 'professional', length = 'same' } = params

  const response = await openai.chat.completions.create({
    model: AI_MODELS.openai.text,
    messages: [
      {
        role: 'system',
        content: `You are a professional copywriter. Refine content while maintaining a ${tone} tone and making it ${length}.`,
      },
      {
        role: 'user',
        content: `Original content: "${originalContent}"

Instruction: ${instruction}

Provide the refined content as plain text, not JSON.`,
      },
    ],
  })

  return response.choices[0]?.message?.content || originalContent
}

// Generate SEO metadata
export async function generateSEOMetadata(params: {
  businessName: string
  businessType: string
  pageTitle: string
  pageContent: string
}) {
  const { businessName, businessType, pageTitle, pageContent } = params
  const businessTypeConfig = getBusinessTypeById(businessType)

  const response = await openai.chat.completions.create({
    model: AI_MODELS.openai.text,
    messages: [
      {
        role: 'system',
        content: 'You are an SEO expert. Generate optimized metadata for better search engine rankings.',
      },
      {
        role: 'user',
        content: `Generate SEO metadata for a ${pageTitle} page of ${businessName} (${businessTypeConfig?.label || businessType}).

Page content summary: ${pageContent.substring(0, 500)}

Return JSON with:
- metaTitle (55-60 characters, compelling)
- metaDescription (150-160 characters, includes CTA)
- keywords (array of 10-15 relevant keywords)
- ogTitle (optimized for social sharing)
- ogDescription (compelling social media description)`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  return safeJSONParse(content, {})
}

// Generate alternative content variations
export async function generateContentVariations(params: {
  originalContent: string
  numberOfVariations: number
  tone?: string
}) {
  const { originalContent, numberOfVariations, tone } = params

  const response = await openai.chat.completions.create({
    model: AI_MODELS.openai.text,
    messages: [
      {
        role: 'system',
        content: 'You are a creative copywriter. Generate alternative variations of content.',
      },
      {
        role: 'user',
        content: `Original content: "${originalContent}"

Generate ${numberOfVariations} alternative variations${tone ? ` with a ${tone} tone` : ''}.

Return JSON with a "variations" array containing the alternatives.`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  const parsed = safeJSONParse(content, { variations: [] })
  return parsed.variations || []
}

// Professional logo style configurations with detailed art direction
const LOGO_STYLE_CONFIGS: Record<string, {
  composition: string
  artDirection: string
  colorGuidance: string
  examples: string
}> = {
  mascot: {
    composition: 'circular badge or emblem format with character as focal point, brand name integrated below or around the character',
    artDirection: 'charming illustrated character mascot with expressive features (big friendly eyes, warm smile, rosy cheeks), kawaii-inspired cute aesthetic, the character should represent the business (e.g., a bao bun for a dumpling restaurant, a coffee cup character for cafe), character should have personality and appeal, cartoon illustration style with clean outlines',
    colorGuidance: 'warm inviting color palette with rich gradients, complementary colors for depth, warm shadows and highlights, colors should evoke the business type (warm oranges/reds for food, cool blues for tech)',
    examples: 'similar quality to Duolingo owl, Reddit Snoo, Mailchimp Freddie - charming, memorable, and professionally illustrated'
  },
  emblem: {
    composition: 'badge, crest, or seal format with brand name integrated within the design, often circular or shield-shaped, symmetrical and balanced',
    artDirection: 'classic emblem design with decorative borders, elegant typography integrated into the badge, professional crest-like appearance, sophisticated vintage or modern badge aesthetic depending on business',
    colorGuidance: 'limited color palette (2-3 colors max), often uses gold/metallic accents for premium feel, strong contrast between elements',
    examples: 'similar to Starbucks, Harley-Davidson, NFL team logos - timeless and authoritative'
  },
  wordmark: {
    composition: 'stylized typography as the primary element, brand name is the logo, custom letterforms or unique typographic treatment',
    artDirection: 'distinctive custom typography, unique letter styling that reflects brand personality, may include subtle visual elements integrated with letters, focus on legibility and memorability',
    colorGuidance: 'usually single color or simple two-tone, the typography itself carries the visual weight',
    examples: 'similar to Coca-Cola, Google, FedEx - where the type IS the design'
  },
  abstract: {
    composition: 'geometric or organic abstract shape that represents the brand concept, modern and minimal, easily recognizable silhouette',
    artDirection: 'clean geometric shapes, modern abstract forms, conceptual design that hints at business meaning, scalable at any size, works in single color',
    colorGuidance: 'bold primary color with potential gradient, modern color combinations, vibrant and contemporary',
    examples: 'similar to Nike swoosh, Airbnb, Spotify - simple yet powerful symbols'
  },
  lettermark: {
    composition: 'initials or abbreviated letters of the brand name, monogram style, compact and efficient',
    artDirection: 'stylized initials with unique character, elegant typography treatment, may include subtle design elements connecting or enhancing the letters',
    colorGuidance: 'sophisticated color choices, often uses contrasting colors for different letters or gradient treatments',
    examples: 'similar to IBM, HBO, CNN, Louis Vuitton - simple letters elevated to iconic status'
  },
  combination: {
    composition: 'icon/symbol paired with brand name, lockup design where both elements work together, can be stacked or side-by-side',
    artDirection: 'cohesive visual system where icon and text complement each other, the icon should work standalone but pairs naturally with the name',
    colorGuidance: 'harmonious palette that works across both icon and text, typically 2-3 colors',
    examples: 'similar to Burger King, Lacoste, Puma - icon + name working in harmony'
  },
  minimal: {
    composition: 'extremely simple, clean design with maximum whitespace, single focal element',
    artDirection: 'stripped down to essential elements only, modernist approach, sophisticated simplicity, every element must serve a purpose',
    colorGuidance: 'often monochromatic, uses negative space effectively, clean and uncluttered',
    examples: 'similar to Apple, Nike, Medium - beauty in simplicity'
  }
}

// Business type specific logo guidance
const BUSINESS_LOGO_GUIDANCE: Record<string, {
  recommendedStyles: string[]
  visualElements: string
  mood: string
  avoidElements: string
}> = {
  restaurant: {
    recommendedStyles: ['mascot', 'emblem', 'combination'],
    visualElements: 'food-related imagery (utensils, plates, chef hats, specific cuisine items), welcoming symbols',
    mood: 'warm, inviting, appetizing, memorable',
    avoidElements: 'generic clip-art, overly complex illustrations'
  },
  bakery: {
    recommendedStyles: ['mascot', 'emblem', 'wordmark'],
    visualElements: 'wheat, bread, croissants, rolling pins, chef hats, artisan tools',
    mood: 'warm, artisanal, cozy, handcrafted feel',
    avoidElements: 'cold colors, industrial appearance'
  },
  'coffee-shop': {
    recommendedStyles: ['emblem', 'combination', 'minimal'],
    visualElements: 'coffee cups, beans, steam, leaves, artisan elements',
    mood: 'warm, cozy, sophisticated yet approachable',
    avoidElements: 'overly corporate, generic coffee imagery'
  },
  'tech-saas': {
    recommendedStyles: ['abstract', 'lettermark', 'minimal'],
    visualElements: 'geometric shapes, nodes, connections, abstract tech symbols',
    mood: 'modern, innovative, trustworthy, clean',
    avoidElements: 'dated computer imagery, overly complex designs'
  },
  'law-firm': {
    recommendedStyles: ['wordmark', 'emblem', 'lettermark'],
    visualElements: 'scales of justice (subtle), columns, pillars, classic typography',
    mood: 'authoritative, trustworthy, professional, timeless',
    avoidElements: 'playful elements, bright colors, casual typography'
  },
  fitness: {
    recommendedStyles: ['abstract', 'combination', 'minimal'],
    visualElements: 'dynamic motion lines, strong shapes, athletic silhouettes',
    mood: 'energetic, powerful, motivating, dynamic',
    avoidElements: 'static imagery, weak visual weight'
  },
  'beauty-spa': {
    recommendedStyles: ['wordmark', 'minimal', 'combination'],
    visualElements: 'elegant curves, floral elements, lotus, leaves, feminine forms',
    mood: 'elegant, serene, luxurious, calming',
    avoidElements: 'harsh lines, aggressive colors, busy designs'
  },
  'pet-services': {
    recommendedStyles: ['mascot', 'combination', 'emblem'],
    visualElements: 'cute animal illustrations, paw prints, hearts, playful elements',
    mood: 'friendly, playful, trustworthy, warm',
    avoidElements: 'scary imagery, overly serious tone'
  },
  'real-estate': {
    recommendedStyles: ['combination', 'abstract', 'lettermark'],
    visualElements: 'house silhouettes, keys, rooflines, building shapes',
    mood: 'trustworthy, premium, aspirational, professional',
    avoidElements: 'cheap-looking designs, overly complex buildings'
  },
  consulting: {
    recommendedStyles: ['wordmark', 'abstract', 'lettermark'],
    visualElements: 'arrows, growth symbols, abstract strategic shapes',
    mood: 'professional, strategic, confident, sophisticated',
    avoidElements: 'playful elements, casual styling'
  },
  default: {
    recommendedStyles: ['combination', 'minimal', 'wordmark'],
    visualElements: 'clean, versatile design elements appropriate to the business',
    mood: 'professional, memorable, versatile',
    avoidElements: 'generic stock imagery, overly trendy designs'
  }
}

export async function generateLogo(params: {
  brandName: string
  style: string
  businessType?: string
  brandPersonality?: string
  colorPreferences?: string
}) {
  const { brandName, style, businessType, brandPersonality, colorPreferences } = params

  // Get style configuration
  const styleConfig = LOGO_STYLE_CONFIGS[style.toLowerCase()] || LOGO_STYLE_CONFIGS.combination

  // Get business-specific guidance
  const businessGuidance = BUSINESS_LOGO_GUIDANCE[businessType?.toLowerCase() || 'default'] || BUSINESS_LOGO_GUIDANCE.default

  // Build comprehensive prompt
  const prompt = `Professional logo design for "${brandName}":

STYLE & COMPOSITION:
${styleConfig.composition}

ART DIRECTION:
${styleConfig.artDirection}

COLOR GUIDANCE:
${styleConfig.colorGuidance}
${colorPreferences ? `Client color preferences: ${colorPreferences}` : ''}

BUSINESS CONTEXT:
${businessGuidance.visualElements}
Brand mood: ${businessGuidance.mood}
${brandPersonality ? `Brand personality: ${brandPersonality}` : ''}

QUALITY STANDARDS:
- Professional illustration quality matching top brand agencies
- ${styleConfig.examples}
- Clean, crisp edges suitable for all sizes
- Balanced composition with proper visual hierarchy
- Memorable and distinctive design
- Works in both color and monochrome

CRITICAL REQUIREMENTS:
- SPELL THE BRAND NAME CORRECTLY: "${brandName}" - each letter must be perfectly accurate
- If including text, use stylized but LEGIBLE typography
- Design must be centered and well-composed
- Clean white or transparent background
- NO watermarks, NO stock photo elements
- Avoid: ${businessGuidance.avoidElements}

Create a logo that would make this brand instantly recognizable and professional.`

  const response = await openai.images.generate({
    model: AI_MODELS.openai.image,
    prompt: prompt,
    n: 1,
    size: '1024x1024',
    quality: 'hd', // Upgraded to HD quality for better logo output
  })

  if (!response.data || response.data.length === 0) {
    throw new Error('No logo generated')
  }

  return response.data[0]?.url || ''
}

/**
 * Extract meaningful keywords and key phrases from business description
 * This ensures images are relevant and contextually appropriate
 *
 * CRITICAL: Must handle multi-word phrases like "eye care" correctly
 * and never truncate or misinterpret them (e.g., "care" should not become "car")
 */
function extractImageKeywords(description: string, businessType: string): string {
  if (!description) return ''

  const lowerDesc = description.toLowerCase()

  // PROTECTED PHRASES - These must be detected as complete units
  // Check for these FIRST to prevent partial word matching
  const protectedPhrases = [
    'eye care', 'vision care', 'skin care', 'hair care', 'nail care', 'pet care',
    'child care', 'elder care', 'senior care', 'home care', 'health care', 'dental care',
    'lawn care', 'oral care', 'patient care', 'personal care', 'day care',
    'real estate', 'law firm', 'hair salon', 'beauty salon', 'nail salon',
    'day spa', 'med spa', 'fitness center', 'yoga studio', 'dance studio',
    'physical therapy', 'massage therapy', 'mental health', 'web design',
    'graphic design', 'interior design', 'digital marketing', 'social media'
  ]

  const foundPhrases: string[] = []

  // Check for protected phrases first
  protectedPhrases.forEach(phrase => {
    if (lowerDesc.includes(phrase)) {
      foundPhrases.push(phrase)
    }
  })

  // Extract adjectives that convey mood, quality, style
  const qualityKeywords = ['luxury', 'premium', 'high-end', 'affordable', 'boutique', 'artisan',
    'handcrafted', 'custom', 'bespoke', 'modern', 'traditional', 'contemporary', 'vintage',
    'elegant', 'sophisticated', 'professional', 'friendly', 'welcoming', 'innovative',
    'cutting-edge', 'organic', 'natural', 'eco-friendly', 'sustainable', 'fast', 'convenient']

  // Extract nouns that convey specific services or products
  const serviceKeywords = ['consultation', 'workshop', 'training', 'coaching', 'design',
    'development', 'marketing', 'strategy', 'planning', 'installation', 'maintenance',
    'repair', 'renovation', 'catering', 'delivery', 'grooming', 'spa', 'wellness',
    'fitness', 'therapy', 'treatment', 'photography', 'videography', 'printing',
    // Healthcare specific - CRITICAL for correct image generation
    'optical', 'optometry', 'optometrist', 'ophthalmology', 'vision', 'eyewear',
    'glasses', 'eyeglasses', 'frames', 'lenses', 'contacts', 'eye exam',
    'chiropractic', 'chiropractor', 'spinal', 'adjustment', 'alignment',
    'physical therapy', 'rehabilitation', 'physiotherapy', 'mobility',
    'counseling', 'psychology', 'psychiatry', 'mental wellness',
    'veterinary', 'veterinarian', 'animal hospital', 'pet clinic']

  // Extract environment/setting keywords
  const settingKeywords = ['studio', 'office', 'shop', 'store', 'salon', 'clinic', 'gallery',
    'workspace', 'kitchen', 'restaurant', 'cafe', 'bar', 'hotel', 'home', 'outdoor',
    'indoor', 'facility', 'center', 'space', 'location',
    // Healthcare settings
    'optical shop', 'vision center', 'eye clinic', 'wellness center',
    'therapy office', 'treatment room', 'examination room']

  const foundKeywords: string[] = []

  // Add protected phrases first (they take priority)
  foundPhrases.forEach(phrase => {
    if (!foundKeywords.includes(phrase)) {
      foundKeywords.push(phrase)
    }
  })

  // Find quality descriptors (only if not part of protected phrase)
  qualityKeywords.forEach(keyword => {
    if (lowerDesc.includes(keyword)) {
      // Check if this keyword is already part of a found phrase
      const isPartOfPhrase = foundPhrases.some(phrase => phrase.includes(keyword))
      if (!isPartOfPhrase && !foundKeywords.includes(keyword)) {
        foundKeywords.push(keyword)
      }
    }
  })

  // Find service keywords (only if not part of protected phrase)
  serviceKeywords.forEach(keyword => {
    if (lowerDesc.includes(keyword)) {
      const isPartOfPhrase = foundPhrases.some(phrase => phrase.includes(keyword))
      if (!isPartOfPhrase && !foundKeywords.includes(keyword)) {
        foundKeywords.push(keyword)
      }
    }
  })

  // Find setting keywords (only if not part of protected phrase)
  settingKeywords.forEach(keyword => {
    if (lowerDesc.includes(keyword)) {
      const isPartOfPhrase = foundPhrases.some(phrase => phrase.includes(keyword))
      if (!isPartOfPhrase && !foundKeywords.includes(keyword)) {
        foundKeywords.push(keyword)
      }
    }
  })

  // Extract specific phrases that paint a picture
  // Look for phrases like "family-owned", "20 years experience", "locally sourced", etc.
  const phrasePatterns = [
    /family[\s-]owned/gi,
    /locally[\s-]sourced/gi,
    /\d+\s*years?[\s-](?:of\s)?experience/gi,
    /award[\s-]winning/gi,
    /certified/gi,
    /licensed/gi,
    /expert/gi
  ]

  phrasePatterns.forEach(pattern => {
    const matches = description.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const lowerMatch = match.toLowerCase()
        if (!foundKeywords.includes(lowerMatch)) {
          foundKeywords.push(lowerMatch)
        }
      })
    }
  })

  // Return unique keywords joined - prioritize protected phrases
  return [...new Set(foundKeywords)].slice(0, 5).join(', ')
}

// Professional photography and image generation configuration
const IMAGE_QUALITY_PRESETS = {
  hero: {
    quality: 'hd',
    lighting: 'cinematic golden hour lighting with dramatic shadows and highlights, natural professional lighting',
    composition: 'rule of thirds, strong focal point, leading lines, balanced negative space',
    camera: 'professional photography quality, shallow depth of field, tack-sharp focus',
    style: 'editorial magazine quality, National Geographic level imagery'
  },
  feature: {
    quality: 'hd',
    lighting: 'soft diffused natural light, clean even illumination, subtle shadows for depth',
    composition: 'centered subject, clean background, minimal distractions, professional commercial framing',
    camera: 'tack sharp focus, perfect exposure, commercial photography quality',
    style: 'high-end commercial photography, minimalist and elegant'
  },
  team: {
    quality: 'hd',
    lighting: 'professional portrait lighting, soft flattering light, subtle depth',
    composition: 'classic portrait framing, eyes at upper third, engaging expression',
    camera: 'portrait photography quality, creamy soft background, sharp facial features',
    style: 'professional executive portrait quality, approachable yet professional'
  },
  lifestyle: {
    quality: 'hd',
    lighting: 'natural ambient light, golden hour warmth, authentic environmental lighting',
    composition: 'candid documentary style, genuine moments, environmental context',
    camera: 'documentary photography quality, authentic feel, natural depth',
    style: 'experience photography, genuine and aspirational'
  },
  food: {
    quality: 'hd',
    lighting: 'soft window light, warm color temperature, appetizing glow, minimal harsh shadows',
    composition: '45-degree angle or overhead flat lay, beautiful plating, garnish details visible',
    camera: 'food photography quality, extreme detail on textures, professional culinary imagery',
    style: 'fine dining magazine quality, mouth-watering and editorial'
  },
  interior: {
    quality: 'hd',
    lighting: 'bright and airy, natural light flooding in, warm inviting atmosphere',
    composition: 'wide angle perspective, show depth and space, inviting view',
    camera: 'interior photography quality, architectural precision, even focus throughout',
    style: 'luxury interior photography, aspirational yet achievable'
  }
}

// Business-specific image themes with rich context
const BUSINESS_IMAGE_THEMES: Record<string, {
  hero: string
  about: string
  services: string
  team: string
  testimonials: string
  gallery: string
  mood: string
  subjects: string[]
}> = {
  restaurant: {
    hero: 'stunning interior of upscale restaurant with elegant table settings, ambient warm lighting, sophisticated dining atmosphere',
    about: 'passionate chef preparing signature dish in professional kitchen, culinary artistry in action',
    services: 'beautifully plated gourmet dish with artistic presentation, steam rising, fresh ingredients visible',
    team: 'confident executive chef in pristine whites, warm smile, professional kitchen background',
    testimonials: 'happy couple enjoying romantic dinner, genuine laughter, elegant restaurant setting',
    gallery: 'artistic food photography showcasing signature dishes, beautiful plating, culinary excellence',
    mood: 'warm, inviting, sophisticated, culinary excellence',
    subjects: ['gourmet dishes', 'elegant dining room', 'chef at work', 'wine selection', 'table settings']
  },
  bakery: {
    hero: 'charming artisan bakery interior with rustic wooden displays, fresh bread and pastries, warm morning light',
    about: 'master baker kneading dough by hand, flour dust in air, artisanal craftsmanship',
    services: 'golden croissants fresh from oven, flaky layers visible, steam rising, butter glistening',
    team: 'friendly baker in apron holding fresh sourdough loaf, proud craftsperson',
    testimonials: 'customer savoring first bite of pastry, eyes closed in delight, cozy cafe setting',
    gallery: 'array of artisan breads and pastries, rustic styling, early morning bakery atmosphere',
    mood: 'warm, artisanal, homey, comforting',
    subjects: ['fresh bread', 'croissants', 'pastry display', 'baker at work', 'rustic interior']
  },
  'coffee-shop': {
    hero: 'cozy specialty coffee shop interior with exposed brick, comfortable seating, barista crafting latte',
    about: 'expert barista pouring intricate latte art, focused precision, craft coffee preparation',
    services: 'perfect latte with beautiful rosetta art, steam rising, coffee beans in background',
    team: 'friendly barista behind espresso machine, welcoming smile, third-wave coffee aesthetic',
    testimonials: 'customer relaxing with book and coffee, peaceful morning moment, sunlight streaming in',
    gallery: 'specialty coffee drinks, latte art varieties, coffee beans, brewing equipment',
    mood: 'cozy, artisanal, community-focused, sophisticated yet approachable',
    subjects: ['latte art', 'espresso machine', 'cozy seating', 'coffee beans', 'barista at work']
  },
  'tech-saas': {
    hero: 'modern tech office with collaborative workspace, diverse team brainstorming, innovation in progress',
    about: 'innovative team working on cutting-edge product, agile environment, creative energy',
    services: 'clean modern laptop showing intuitive interface, minimal desk setup, productivity focus',
    team: 'confident tech leader in modern office, approachable expertise, innovative mindset',
    testimonials: 'satisfied customer using product on laptop, productive workflow, professional setting',
    gallery: 'modern office spaces, team collaboration, product interfaces, innovation atmosphere',
    mood: 'innovative, modern, trustworthy, efficient',
    subjects: ['modern workspace', 'team collaboration', 'product interface', 'innovation', 'technology']
  },
  'law-firm': {
    hero: 'prestigious law office with floor-to-ceiling bookshelves, leather furniture, professional gravitas',
    about: 'experienced attorney reviewing documents in elegant office, focused expertise',
    services: 'attorney meeting with client, attentive consultation, trust being established',
    team: 'distinguished attorney portrait, confident presence, professional authority',
    testimonials: 'relieved client shaking hands with attorney, successful outcome, professional office',
    gallery: 'elegant office interiors, legal library, team portraits, prestigious atmosphere',
    mood: 'authoritative, trustworthy, sophisticated, reassuring',
    subjects: ['law library', 'attorney at desk', 'client meeting', 'legal documents', 'prestigious office']
  },
  fitness: {
    hero: 'state-of-the-art gym with modern equipment, natural light, motivating workout atmosphere',
    about: 'dedicated athlete mid-workout, determination and focus, inspiring fitness journey',
    services: 'personal trainer guiding client through exercise, supportive coaching, professional gym',
    team: 'fit and friendly personal trainer, motivating presence, professional fitness expertise',
    testimonials: 'triumphant gym member after achieving goal, proud accomplishment, supportive community',
    gallery: 'workout scenes, gym equipment, group classes, fitness achievements, healthy lifestyle',
    mood: 'energetic, motivating, empowering, community-driven',
    subjects: ['modern gym', 'workout in progress', 'personal training', 'fitness achievement', 'group class']
  },
  'beauty-spa': {
    hero: 'serene luxury spa interior with natural elements, soft lighting, tranquil wellness sanctuary',
    about: 'skilled esthetician performing relaxing treatment, expert care, peaceful atmosphere',
    services: 'luxurious spa treatment in progress, calming environment, premium skincare products',
    team: 'professional spa therapist with warm demeanor, wellness expertise, calming presence',
    testimonials: 'relaxed client after treatment, radiant and refreshed, spa serenity',
    gallery: 'spa treatments, natural products, serene interiors, wellness moments, beauty results',
    mood: 'serene, luxurious, rejuvenating, peaceful',
    subjects: ['spa interior', 'massage treatment', 'skincare products', 'relaxation', 'natural elements']
  },
  'pet-services': {
    hero: 'happy dogs in premium pet care facility, playful interaction, professional and loving environment',
    about: 'caring pet groomer gently handling dog, patient expertise, animal love evident',
    services: 'adorable dog being groomed, spa-like treatment, happy pet enjoying pampering',
    team: 'friendly pet care professional with cute dog, genuine animal lover, trustworthy care',
    testimonials: 'happy pet owner with freshly groomed dog, family joy, trusted service',
    gallery: 'happy pets, grooming transformations, playful moments, facility tour, pet portraits',
    mood: 'warm, playful, trustworthy, loving',
    subjects: ['happy dogs', 'pet grooming', 'play area', 'pet portraits', 'caring staff']
  },
  'real-estate': {
    hero: 'stunning luxury home exterior at golden hour, aspirational property, dream home vibes',
    about: 'professional agent showing beautiful home to excited buyers, real estate expertise',
    services: 'gorgeous home interior with natural light, staged perfectly, move-in ready appeal',
    team: 'confident real estate agent with warm smile, professional and approachable, market expert',
    testimonials: 'happy family receiving keys to new home, milestone moment, realtor celebration',
    gallery: 'luxury properties, beautiful interiors, architectural details, happy homeowners',
    mood: 'aspirational, professional, trustworthy, life-changing',
    subjects: ['luxury home', 'beautiful interior', 'agent with clients', 'home buying', 'property tour']
  },
  // CRITICAL: Eye care / Optical - distinct from automotive
  'eye-care': {
    hero: 'modern optical boutique interior with elegant eyewear displays, designer frames, professional vision center atmosphere',
    about: 'experienced optometrist performing comprehensive eye exam, advanced vision testing equipment, patient-focused care',
    services: 'detailed eye examination with modern ophthalmology equipment, precise vision testing, professional optical services',
    team: 'friendly optometrist with confident expertise, professional eyewear consultant, caring vision specialist',
    testimonials: 'happy customer trying on stylish new eyeglasses, perfect fit, modern optical shop',
    gallery: 'designer eyeglass frames display, contact lens options, eye exam equipment, stylish eyewear collection',
    mood: 'professional, modern, vision-focused, trustworthy',
    subjects: ['eyewear display', 'eye exam', 'designer frames', 'optical equipment', 'vision testing']
  },
  'chiropractic': {
    hero: 'modern chiropractic wellness clinic interior, serene healing environment, professional spinal care facility',
    about: 'skilled chiropractor performing spinal adjustment, expert technique, patient comfort focus',
    services: 'professional chiropractic treatment session, spine alignment therapy, healing touch',
    team: 'experienced chiropractor with caring demeanor, wellness expert, holistic health focus',
    testimonials: 'relieved patient after adjustment, pain-free movement, wellness achievement',
    gallery: 'chiropractic treatment, wellness center, spine health, patient care, healing environment',
    mood: 'healing, professional, wellness-focused, caring',
    subjects: ['spinal adjustment', 'wellness clinic', 'patient care', 'chiropractic treatment', 'healing']
  },
  'physical-therapy': {
    hero: 'bright modern physical therapy clinic, rehabilitation equipment, professional healing environment',
    about: 'dedicated physical therapist guiding patient through exercises, rehabilitation expertise, encouraging support',
    services: 'therapeutic exercise session, mobility training, rehabilitation in progress, patient improvement',
    team: 'caring physical therapist with motivating presence, rehabilitation expert, patient advocate',
    testimonials: 'patient celebrating mobility achievement, recovery success, physical therapy progress',
    gallery: 'rehabilitation exercises, therapy equipment, patient progress, mobility training, recovery journey',
    mood: 'healing, encouraging, professional, achievement-focused',
    subjects: ['physical therapy', 'rehabilitation', 'exercise therapy', 'patient recovery', 'mobility']
  },
  'mental-health': {
    hero: 'peaceful therapy office with calming decor, comfortable consultation space, serene counseling environment',
    about: 'compassionate therapist in calming office setting, supportive presence, professional counseling atmosphere',
    services: 'comfortable therapy session setting, private consultation space, healing environment',
    team: 'warm and approachable counselor, professional therapist, trusted mental health advocate',
    testimonials: 'person experiencing peaceful moment, wellness achievement, mental health journey',
    gallery: 'peaceful therapy spaces, calming environments, wellness imagery, supportive settings',
    mood: 'calm, supportive, healing, trustworthy',
    subjects: ['therapy office', 'peaceful setting', 'wellness', 'supportive environment', 'mental health']
  },
  'veterinary': {
    hero: 'modern veterinary clinic with happy pets, caring animal hospital environment, professional pet care',
    about: 'gentle veterinarian examining healthy pet, compassionate animal care, expert veterinary medicine',
    services: 'veterinary examination in progress, pet health checkup, professional animal care',
    team: 'caring veterinarian with happy pet, animal lover, trusted pet health expert',
    testimonials: 'happy pet owner with healthy pet after visit, grateful client, successful treatment',
    gallery: 'happy pets, veterinary care, animal hospital, pet health, veterinary team with animals',
    mood: 'caring, professional, trustworthy, animal-loving',
    subjects: ['veterinary exam', 'happy pets', 'animal hospital', 'pet care', 'veterinary team']
  },
  // Logistics & Transportation
  logistics: {
    hero: 'massive container ship at busy port terminal, colorful shipping containers stacked high, global logistics operations at dawn',
    about: 'logistics team coordinating shipments in modern control room, screens showing global shipping routes and tracking',
    services: 'automated warehouse with robotic systems, efficient supply chain operations, packages moving on conveyor belts',
    team: 'experienced logistics manager with headset coordinating shipments, professional port operations background',
    testimonials: 'satisfied business client reviewing successful delivery metrics on tablet, warehouse setting',
    gallery: 'container ships, cargo planes, freight trains, warehouse operations, global shipping network',
    mood: 'efficient, global, reliable, industrial precision',
    subjects: ['container ship', 'cargo port', 'warehouse operations', 'supply chain', 'freight logistics']
  },
  transportation: {
    hero: 'fleet of modern semi trucks on interstate highway at sunset, professional long-haul transportation',
    about: 'professional truck driver in cab of modern semi, confident and reliable, open road ahead',
    services: 'freight loading at modern distribution center, efficient cargo handling, professional fleet operations',
    team: 'experienced transportation manager reviewing fleet routes, professional dispatch operations',
    testimonials: 'happy client shaking hands with driver at successful delivery, freight trailer in background',
    gallery: 'truck fleet, highway transportation, cargo loading, distribution centers, freight operations',
    mood: 'reliable, efficient, professional, road-ready',
    subjects: ['semi trucks', 'freight transport', 'distribution center', 'fleet operations', 'highway logistics']
  },
  courier: {
    hero: 'friendly delivery driver handing package to smiling customer at doorstep, express delivery service',
    about: 'courier sorting packages in modern delivery hub, fast-paced operations, efficient fulfillment',
    services: 'express delivery van with packages ready for dispatch, same-day delivery operations',
    team: 'professional courier team with delivery vehicles, ready for dispatch, customer-focused service',
    testimonials: 'happy customer receiving package at door, delighted with fast delivery, residential setting',
    gallery: 'package delivery, delivery vans, courier operations, happy customers, express shipping',
    mood: 'fast, friendly, reliable, customer-focused',
    subjects: ['package delivery', 'courier service', 'delivery van', 'express shipping', 'doorstep delivery']
  },
  'moving-company': {
    hero: 'professional movers carefully loading furniture into clean moving truck, residential moving day',
    about: 'moving team wrapping and protecting furniture with care, attention to detail, professional service',
    services: 'organized moving truck interior with properly secured belongings, professional packing',
    team: 'friendly professional movers in uniform, ready to help, trustworthy moving crew',
    testimonials: 'happy family with keys to new home, moving truck in background, successful relocation',
    gallery: 'moving trucks, packing services, furniture handling, happy families, new home moments',
    mood: 'trustworthy, careful, helpful, stress-free',
    subjects: ['moving truck', 'furniture moving', 'packing services', 'new home', 'relocation']
  },
  default: {
    hero: 'professional modern business environment with clean aesthetic, successful atmosphere',
    about: 'dedicated professional at work, expertise in action, quality service delivery',
    services: 'premium service being delivered, attention to detail, customer satisfaction focus',
    team: 'friendly professional portrait, approachable expertise, trustworthy presence',
    testimonials: 'satisfied customer experiencing quality service, positive interaction',
    gallery: 'professional environment, team at work, quality results, customer interactions',
    mood: 'professional, trustworthy, quality-focused, customer-centric',
    subjects: ['professional setting', 'team collaboration', 'quality service', 'satisfied customers']
  }
}

// Generate images for website sections (hero backgrounds, features, etc.)
// Returns both image URL and descriptive alt text for accessibility
// Generate restaurant menu content with categories, dishes, descriptions, and pricing
export async function generateMenuContent(params: {
  businessName: string
  businessType: string
  description: string
  cuisineType?: string
  tone?: string
}) {
  const { businessName, description, cuisineType, tone = 'professional' } = params

  // Extract cuisine type from description if not provided
  const cuisineKeywords = ['italian', 'mexican', 'chinese', 'japanese', 'indian', 'thai', 'french', 'american', 'mediterranean', 'korean', 'vietnamese', 'greek', 'spanish', 'middle eastern', 'caribbean', 'brazilian', 'peruvian', 'african', 'ethiopian', 'moroccan', 'turkish', 'lebanese', 'sushi', 'ramen', 'pizza', 'burger', 'steakhouse', 'seafood', 'vegan', 'vegetarian', 'bbq', 'barbecue', 'soul food', 'cajun', 'creole', 'tapas', 'dim sum', 'farm-to-table', 'fusion', 'gastropub', 'bistro', 'cafe', 'diner', 'deli', 'bakery', 'brunch']

  const lowerDesc = description.toLowerCase()
  let detectedCuisine = cuisineType || ''

  if (!detectedCuisine) {
    for (const cuisine of cuisineKeywords) {
      if (lowerDesc.includes(cuisine)) {
        detectedCuisine = cuisine
        break
      }
    }
  }

  // Default to a general restaurant style if no cuisine detected
  if (!detectedCuisine) {
    detectedCuisine = 'contemporary american'
  }

  const response = await openai.chat.completions.create({
    model: AI_MODELS.openai.text,
    messages: [
      {
        role: 'system',
        content: `You are an executive chef and menu designer at a ${tone === 'luxury' ? 'Michelin-starred' : 'popular'} restaurant. Create an authentic, mouthwatering menu that showcases the best of ${detectedCuisine} cuisine.

Your menu should:
- Feature dishes that are authentic to the cuisine style
- Have enticing, descriptive names (not generic like "Chicken Dish 1")
- Include detailed descriptions that make diners' mouths water
- Have realistic pricing appropriate for the establishment type
- Include appetizers, mains, desserts, and beverages
- Show creativity while staying true to culinary traditions`
      },
      {
        role: 'user',
        content: `Create a complete restaurant menu for "${businessName}".

Restaurant Description: ${description}
Cuisine Style: ${detectedCuisine}

Generate a comprehensive menu with the following JSON structure:

{
  "menuTitle": "Menu title (e.g., 'Our Menu', 'A Taste of Italy', etc.)",
  "menuSubtitle": "Brief description of the culinary philosophy",
  "categories": [
    {
      "name": "Category name (e.g., 'Appetizers', 'Starters', 'Antipasti')",
      "description": "Brief category description",
      "items": [
        {
          "name": "Dish name (creative, authentic)",
          "description": "Mouthwatering 2-3 sentence description highlighting ingredients, cooking method, and flavor profile",
          "price": 12.99,
          "tags": ["popular", "vegetarian", "gluten-free", "spicy", "chef's special"] (optional, include if applicable),
          "imagePrompt": "Brief description for generating a realistic food photo of this dish"
        }
      ]
    }
  ],
  "chefNote": "A personal note from the chef about the menu philosophy (optional)",
  "dietaryInfo": "Information about accommodating dietary restrictions"
}

REQUIREMENTS:
- Create 4-6 categories (Appetizers/Starters, Soups & Salads, Main Courses/Entrees, Sides, Desserts, Beverages)
- Include 4-6 items per category
- Prices should be realistic ($8-15 for appetizers, $18-45 for mains, $8-14 for desserts)
- Descriptions should be 25-40 words, highlighting key ingredients and preparation
- Include a mix of classic and signature dishes
- Add appropriate tags (vegetarian, vegan, gluten-free, spicy, popular) where applicable
- Image prompts should be specific enough to generate realistic food photography`
      }
    ],
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    return getDefaultMenuContent(businessName, detectedCuisine)
  }

  try {
    return JSON.parse(content)
  } catch {
    return getDefaultMenuContent(businessName, detectedCuisine)
  }
}

// Default menu content if AI generation fails
function getDefaultMenuContent(businessName: string, cuisineType: string) {
  return {
    menuTitle: 'Our Menu',
    menuSubtitle: `Fresh, flavorful dishes crafted with care at ${businessName}`,
    categories: [
      {
        name: 'Appetizers',
        description: 'Start your meal with our carefully crafted starters',
        items: [
          { name: 'House Salad', description: 'Fresh mixed greens with house vinaigrette', price: 9.99, tags: ['vegetarian'] },
          { name: 'Soup of the Day', description: 'Chef\'s daily creation made from scratch', price: 7.99 },
          { name: 'Crispy Calamari', description: 'Lightly battered and served with marinara', price: 14.99 }
        ]
      },
      {
        name: 'Main Courses',
        description: 'Our signature dishes',
        items: [
          { name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with seasonal vegetables', price: 28.99 },
          { name: 'Prime Ribeye', description: '12oz USDA Prime with herb butter', price: 42.99, tags: ['popular'] },
          { name: 'Pasta Primavera', description: 'Fresh pasta with garden vegetables', price: 22.99, tags: ['vegetarian'] }
        ]
      },
      {
        name: 'Desserts',
        description: 'Sweet endings to your meal',
        items: [
          { name: 'Chocolate Cake', description: 'Rich chocolate layer cake with ganache', price: 10.99 },
          { name: 'Crème Brûlée', description: 'Classic vanilla custard with caramelized sugar', price: 9.99 }
        ]
      }
    ],
    chefNote: `At ${businessName}, we believe in using only the freshest ingredients to create memorable dining experiences.`,
    dietaryInfo: 'Please inform your server of any dietary restrictions or allergies.'
  }
}

export async function generateSectionImage(params: {
  businessName: string
  businessType: string
  sectionType: string
  description?: string
  style?: 'photorealistic' | 'illustration' | 'abstract' | 'minimalist'
}): Promise<{ url: string; altText: string }> {
  const { businessName, businessType, sectionType, description, style = 'photorealistic' } = params
  const businessTypeConfig = getBusinessTypeById(businessType)

  // Extract intelligent keywords from business description
  const extractedKeywords = description ? extractImageKeywords(description, businessType) : ''

  // Get business-specific image themes
  const businessTheme = BUSINESS_IMAGE_THEMES[businessType.toLowerCase()] || BUSINESS_IMAGE_THEMES.default

  // Get quality preset based on section type
  const sectionKey = sectionType.toLowerCase()
  let qualityPreset = IMAGE_QUALITY_PRESETS.hero // Default to hero quality
  if (sectionKey === 'features' || sectionKey === 'services') {
    qualityPreset = IMAGE_QUALITY_PRESETS.feature
  } else if (sectionKey === 'team') {
    qualityPreset = IMAGE_QUALITY_PRESETS.team
  } else if (sectionKey === 'testimonials' || sectionKey === 'about') {
    qualityPreset = IMAGE_QUALITY_PRESETS.lifestyle
  } else if (businessType.toLowerCase().includes('restaurant') || businessType.toLowerCase().includes('bakery') || businessType.toLowerCase().includes('food')) {
    qualityPreset = IMAGE_QUALITY_PRESETS.food
  } else if (sectionKey === 'contact' || sectionKey === 'gallery') {
    qualityPreset = IMAGE_QUALITY_PRESETS.interior
  }

  let prompt = ''
  let imageSize: '1792x1024' | '1024x1024' = '1024x1024' // Default 1:1 for most images

  // Build intelligent keywords based on business type
  const businessKeywords = businessTypeConfig?.keywords?.slice(0, 3).join(', ') || 'professional, quality, modern'

  // Combine business keywords with extracted keywords for more context-aware images
  const contextKeywords = extractedKeywords ? `${extractedKeywords}, ${businessKeywords}` : businessKeywords

  // Use design system image style if available
  const imageStyleGuide = businessTypeConfig?.designSystem?.style.imageStyle || 'high-end professional photography'
  const aestheticMood = businessTypeConfig?.designSystem?.style.aesthetic || 'modern, professional'

  // CRITICAL: Short prohibition block at START of prompt (DALL-E prioritizes early content)
  const startProhibitions = `IMPORTANT: Show real business scene in action. No cameras, camera lenses, tripods, lighting equipment, umbrellas, reflectors, studio gear, brand logos, or photography equipment visible. No Apple, Microsoft, Google, Nike, or Samsung logos. Ultra-realistic photography only, not cartoon or illustration.`

  // 🚨 CRITICAL: COMPREHENSIVE PROHIBITION BLOCK (MATCHES GEMINI STANDARDS)
  // This MUST be applied to ALL image generation to prevent prohibited content
  const noTextInstruction = `
🚨 CRITICAL: STRICTLY PROHIBITED - NEVER INCLUDE THESE 🚨
═══════════════════════════════════════════════════════════════
❌ ABSOLUTELY NO photography equipment (cameras, tripods, lighting equipment, umbrellas, reflectors, studio gear)
❌ ABSOLUTELY NO camera lenses, camera bodies, studio lights, softboxes, or any photo gear
❌ ABSOLUTELY NO brand logos (Apple, Microsoft, Google, Nike, Samsung, etc.)
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
✓ Image must be STRICTLY RELEVANT to ${businessTypeConfig?.label || businessType} business only`

  // Professional photography foundation
  const proPhotoBase = `${qualityPreset.style}, ${qualityPreset.camera}, ${qualityPreset.lighting}`

  switch (sectionType.toUpperCase()) {
    case 'HERO':
      // Hero images use 16:9 aspect ratio (1792x1024)
      imageSize = '1792x1024'
      prompt = `${startProhibitions}

${proPhotoBase}

SCENE: ${businessTheme.hero}
${description ? `SPECIFIC CONTEXT: ${description}` : ''}

COMPOSITION: ${qualityPreset.composition}, widescreen cinematic framing, hero image for website header
MOOD: ${businessTheme.mood}
ATMOSPHERE: ${aestheticMood}, ${contextKeywords}

TECHNICAL: 16:9 aspect ratio, plenty of space for text overlay on left or center, not too busy, professional website hero image quality
${noTextInstruction}`
      break

    case 'FEATURES':
      prompt = `${startProhibitions}

${IMAGE_QUALITY_PRESETS.feature.style}, ${IMAGE_QUALITY_PRESETS.feature.camera}

SCENE: ${businessTheme.services}
${description ? `SPECIFIC CONTEXT: ${description}` : ''}

COMPOSITION: ${IMAGE_QUALITY_PRESETS.feature.composition}
LIGHTING: ${IMAGE_QUALITY_PRESETS.feature.lighting}
MOOD: ${businessTheme.mood}, professional feature showcase

TECHNICAL: Square format, clean background, single focal point, website feature image quality
${noTextInstruction}`
      break

    case 'ABOUT':
      prompt = `${startProhibitions}

${IMAGE_QUALITY_PRESETS.lifestyle.style}, ${IMAGE_QUALITY_PRESETS.lifestyle.camera}

SCENE: ${businessTheme.about}
${description ? `SPECIFIC CONTEXT: ${description}` : ''}

COMPOSITION: ${IMAGE_QUALITY_PRESETS.lifestyle.composition}
LIGHTING: ${IMAGE_QUALITY_PRESETS.lifestyle.lighting}
MOOD: ${businessTheme.mood}, authentic and genuine, tells the brand story

TECHNICAL: Square format, environmental portrait or workspace scene, about section imagery
${noTextInstruction}`
      break

    case 'TEAM':
      prompt = `${startProhibitions}

${IMAGE_QUALITY_PRESETS.team.style}, ${IMAGE_QUALITY_PRESETS.team.camera}

SCENE: ${businessTheme.team}
${description ? `SPECIFIC CONTEXT: ${description}` : ''}

COMPOSITION: ${IMAGE_QUALITY_PRESETS.team.composition}
LIGHTING: ${IMAGE_QUALITY_PRESETS.team.lighting}
MOOD: Professional yet approachable, trustworthy, ${businessTheme.mood}

TECHNICAL: Square format, professional headshot quality, team page portrait, diverse representation
${noTextInstruction}`
      break

    case 'GALLERY':
    case 'PORTFOLIO':
      prompt = `${startProhibitions}

${proPhotoBase}

SCENE: ${businessTheme.gallery}
${description ? `SPECIFIC CONTEXT: ${description}` : ''}

COMPOSITION: ${qualityPreset.composition}, showcase quality work or products
LIGHTING: Perfect studio or natural lighting showcasing details
MOOD: ${businessTheme.mood}, impressive portfolio piece

TECHNICAL: Square format, gallery-worthy image, portfolio showcase quality
${noTextInstruction}`
      break

    case 'SERVICES':
      prompt = `${IMAGE_QUALITY_PRESETS.feature.style}, ${IMAGE_QUALITY_PRESETS.feature.camera}

SCENE: ${businessTheme.services}
${description ? `SPECIFIC CONTEXT: ${description}` : ''}

COMPOSITION: ${IMAGE_QUALITY_PRESETS.feature.composition}
LIGHTING: ${IMAGE_QUALITY_PRESETS.feature.lighting}
MOOD: ${businessTheme.mood}, service excellence in action

TECHNICAL: Square format, service/product focused, professional service page imagery
${noTextInstruction}`
      break

    case 'CONTACT':
      prompt = `${IMAGE_QUALITY_PRESETS.interior.style}, ${IMAGE_QUALITY_PRESETS.interior.camera}

SCENE: Welcoming ${businessTypeConfig?.label || businessType} space, professional reception or meeting area, inviting entrance
${description ? `SPECIFIC CONTEXT: ${description}` : ''}

COMPOSITION: ${IMAGE_QUALITY_PRESETS.interior.composition}
LIGHTING: ${IMAGE_QUALITY_PRESETS.interior.lighting}
MOOD: Welcoming, professional, approachable, ${businessTheme.mood}

TECHNICAL: Square format, contact page imagery, inviting space that encourages visitors to reach out
${noTextInstruction}`
      break

    case 'TESTIMONIALS':
      prompt = `${IMAGE_QUALITY_PRESETS.lifestyle.style}, ${IMAGE_QUALITY_PRESETS.lifestyle.camera}

SCENE: ${businessTheme.testimonials}
${description ? `SPECIFIC CONTEXT: ${description}` : ''}

COMPOSITION: ${IMAGE_QUALITY_PRESETS.lifestyle.composition}, genuine emotion visible
LIGHTING: ${IMAGE_QUALITY_PRESETS.lifestyle.lighting}
MOOD: Authentic satisfaction, genuine happiness, ${businessTheme.mood}

TECHNICAL: Square format, testimonial section imagery, real people experiencing real satisfaction
${noTextInstruction}`
      break

    case 'CTA':
      prompt = `${proPhotoBase}

SCENE: Inspiring ${businessTypeConfig?.label || businessType} scene that motivates action
${description ? `SPECIFIC CONTEXT: ${description}` : ''}

COMPOSITION: ${qualityPreset.composition}, call-to-action banner imagery
LIGHTING: Dramatic and inspiring lighting
MOOD: Aspirational, motivating, ${businessTheme.mood}, encourages taking the next step

TECHNICAL: Widescreen or square format, CTA banner quality, space for overlay text, inspiring
${noTextInstruction}`
      break

    default:
      prompt = `${proPhotoBase}

SCENE: Professional ${businessTypeConfig?.label || businessType} ${sectionType.toLowerCase()} scene
${description ? `SPECIFIC CONTEXT: ${description}` : ''}

COMPOSITION: ${qualityPreset.composition}
MOOD: ${businessTheme.mood}, ${aestheticMood}

TECHNICAL: Professional website imagery quality
${noTextInstruction}`
  }

  const response = await openai.images.generate({
    model: AI_MODELS.openai.image,
    prompt: prompt,
    n: 1,
    size: imageSize,
    quality: 'hd', // Upgraded to HD for all images
  })

  if (!response.data || response.data.length === 0) {
    throw new Error('No image generated')
  }

  const imageData = response.data[0]
  const imageUrl = imageData?.url || ''

  // Generate descriptive alt text for accessibility
  // Use DALL-E's revised prompt as the alt text description
  const revisedPrompt = imageData?.revised_prompt || prompt

  // Clean up the revised prompt to make it more suitable as alt text
  // Remove technical photography terms and keep the descriptive content
  let altText = revisedPrompt
    .replace(/realistic photo,?/gi, '')
    .replace(/high-end photography,?/gi, '')
    .replace(/cinematic lighting,?/gi, '')
    .replace(/studio lighting,?/gi, '')
    .replace(/professional photography,?/gi, '')
    .replace(/shallow depth of field,?/gi, '')
    .replace(/detailed composition,?/gi, '')
    .replace(/refined composition,?/gi, '')
    .replace(/CRITICAL:.*?visible.*?image/gi, '')
    .replace(/SCENE:|COMPOSITION:|LIGHTING:|MOOD:|TECHNICAL:/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Capitalize first letter
  altText = altText.charAt(0).toUpperCase() + altText.slice(1)

  // Ensure it's not too long (max 125 characters is recommended for alt text)
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...'
  }

  return {
    url: imageUrl,
    altText: altText || `${sectionType} image for ${businessName}`
  }
}
