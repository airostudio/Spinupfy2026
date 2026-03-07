/**
 * Competitor Research Service
 *
 * Searches for and analyzes top businesses in the same industry
 * to extract best practices, design patterns, and content strategies.
 *
 * Uses centralized keyword configuration for intelligent search queries.
 */

import { analyzeWebsite, WebsiteAnalysis } from './website-analyzer'
import {
  getCompetitorSearchTerms,
  getExampleSites,
  BUSINESS_TYPE_CONFIGS,
  PAGE_TYPE_CONFIGS
} from './keyword-config'

export interface CompetitorSearchResult {
  name: string
  url: string
  description: string
  ranking?: number
}

export interface CompetitorInsights {
  // Search results
  topCompetitors: CompetitorSearchResult[]

  // Analyzed websites (from those we could fetch)
  analyzedSites: WebsiteAnalysis[]

  // Extracted patterns
  designPatterns: {
    commonColors: string[]
    fontPatterns: string[]
    layoutStyles: string[]
    heroStyles: string[]
  }

  // Content patterns
  contentPatterns: {
    commonHeadings: string[]
    ctaPatterns: string[]
    valuePropositions: string[]
    testimonialStyles: string[]
  }

  // Industry-specific insights
  industryInsights: {
    mustHaveFeatures: string[]
    commonSections: string[]
    pricingPatterns: string[]
    trustSignals: string[]
  }

  // Summary for AI prompt
  summaryForAI: string
}

/**
 * Search for top businesses in a specific industry using multiple search strategies
 */
export async function searchTopBusinesses(params: {
  businessType: string
  location?: string
  industry?: string
  limit?: number
}): Promise<CompetitorSearchResult[]> {
  const { businessType, location, industry, limit = 5 } = params

  // Build search queries for different angles
  const searchQueries = buildSearchQueries(businessType, location, industry)

  // Try Serper API (Google Search) if available
  if (process.env.SERPER_API_KEY) {
    try {
      const results = await searchWithSerper(searchQueries, limit)
      if (results.length > 0) return results
    } catch (error) {
      console.error('Serper search failed:', error)
    }
  }

  // Try Brave Search API if available
  if (process.env.BRAVE_SEARCH_API_KEY) {
    try {
      const results = await searchWithBrave(searchQueries, limit)
      if (results.length > 0) return results
    } catch (error) {
      console.error('Brave search failed:', error)
    }
  }

  // Try Bing Web Search API if available
  if (process.env.BING_SEARCH_API_KEY) {
    try {
      const results = await searchWithBing(searchQueries, limit)
      if (results.length > 0) return results
    } catch (error) {
      console.error('Bing search failed:', error)
    }
  }

  // Fallback: Use curated industry leaders database
  console.log('No search API available, using curated database')
  return getCuratedIndustryLeaders(businessType, limit)
}

/**
 * Build intelligent search queries for finding top businesses
 * Uses centralized keyword configuration for better search terms
 */
function buildSearchQueries(businessType: string, location?: string, industry?: string, detectedPages?: string[]): string[] {
  const type = businessType.replace(/-/g, ' ')
  const queries: string[] = []

  // First, try to get search terms from keyword config
  const configSearchTerms = getCompetitorSearchTerms(businessType, detectedPages || [])
  if (configSearchTerms.length > 0) {
    queries.push(...configSearchTerms)
  }

  // Best websites queries
  queries.push(`best ${type} website design examples`)
  queries.push(`award winning ${type} websites`)
  queries.push(`top ${type} companies websites`)

  // Industry leader queries
  if (industry) {
    queries.push(`best ${industry} ${type} websites 2025`)
    queries.push(`${industry} ${type} website inspiration`)
  }

  // Location-specific queries
  if (location) {
    queries.push(`best ${type} in ${location}`)
    queries.push(`top rated ${type} ${location}`)
  }

  // Design inspiration queries
  queries.push(`${type} website design trends 2025`)
  queries.push(`professional ${type} website examples`)

  // Remove duplicates
  return [...new Set(queries)]
}

/**
 * Search using Serper API (Google Search)
 */
async function searchWithSerper(queries: string[], limit: number): Promise<CompetitorSearchResult[]> {
  const results: CompetitorSearchResult[] = []
  const seenUrls = new Set<string>()

  for (const query of queries.slice(0, 3)) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: query,
          num: 10,
          gl: 'us',
          hl: 'en'
        })
      })

      if (!response.ok) continue

      const data = await response.json()
      const organic = data.organic || []

      for (const result of organic) {
        if (results.length >= limit) break
        if (seenUrls.has(result.link)) continue

        // Filter out aggregator sites, focus on actual business websites
        if (isBusinessWebsite(result.link)) {
          seenUrls.add(result.link)
          results.push({
            name: result.title,
            url: result.link,
            description: result.snippet,
            ranking: results.length + 1
          })
        }
      }

      if (results.length >= limit) break
    } catch (error) {
      console.error(`Serper query failed: ${query}`, error)
    }
  }

  return results
}

/**
 * Search using Brave Search API
 */
async function searchWithBrave(queries: string[], limit: number): Promise<CompetitorSearchResult[]> {
  const results: CompetitorSearchResult[] = []
  const seenUrls = new Set<string>()

  for (const query of queries.slice(0, 3)) {
    try {
      const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`, {
        headers: {
          'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY!,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) continue

      const data = await response.json()
      const webResults = data.web?.results || []

      for (const result of webResults) {
        if (results.length >= limit) break
        if (seenUrls.has(result.url)) continue

        if (isBusinessWebsite(result.url)) {
          seenUrls.add(result.url)
          results.push({
            name: result.title,
            url: result.url,
            description: result.description,
            ranking: results.length + 1
          })
        }
      }

      if (results.length >= limit) break
    } catch (error) {
      console.error(`Brave query failed: ${query}`, error)
    }
  }

  return results
}

/**
 * Search using Bing Web Search API
 */
async function searchWithBing(queries: string[], limit: number): Promise<CompetitorSearchResult[]> {
  const results: CompetitorSearchResult[] = []
  const seenUrls = new Set<string>()

  for (const query of queries.slice(0, 3)) {
    try {
      const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10`, {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.BING_SEARCH_API_KEY!
        }
      })

      if (!response.ok) continue

      const data = await response.json()
      const webPages = data.webPages?.value || []

      for (const result of webPages) {
        if (results.length >= limit) break
        if (seenUrls.has(result.url)) continue

        if (isBusinessWebsite(result.url)) {
          seenUrls.add(result.url)
          results.push({
            name: result.name,
            url: result.url,
            description: result.snippet,
            ranking: results.length + 1
          })
        }
      }

      if (results.length >= limit) break
    } catch (error) {
      console.error(`Bing query failed: ${query}`, error)
    }
  }

  return results
}

/**
 * Check if URL is likely a real business website (not aggregator/directory)
 */
function isBusinessWebsite(url: string): boolean {
  const aggregatorDomains = [
    'yelp.com', 'tripadvisor.com', 'google.com', 'facebook.com',
    'instagram.com', 'twitter.com', 'linkedin.com', 'pinterest.com',
    'youtube.com', 'wikipedia.org', 'medium.com', 'reddit.com',
    'quora.com', 'awwwards.com', 'dribbble.com', 'behance.net',
    'themeforest.net', 'templatemonster.com', 'wix.com/templates',
    'squarespace.com/templates', 'wordpress.org/themes'
  ]

  try {
    const domain = new URL(url).hostname.toLowerCase()
    return !aggregatorDomains.some(agg => domain.includes(agg))
  } catch {
    return false
  }
}

/**
 * Curated database of industry leaders for fallback
 */
function getCuratedIndustryLeaders(businessType: string, limit: number): CompetitorSearchResult[] {
  const leaders: Record<string, CompetitorSearchResult[]> = {
    'restaurant': [
      { name: 'Eleven Madison Park', url: 'https://www.elevenmadisonpark.com', description: 'Award-winning fine dining in NYC' },
      { name: 'The French Laundry', url: 'https://www.thomaskeller.com/tfl', description: 'Thomas Keller\'s legendary restaurant' },
      { name: 'Alinea', url: 'https://www.alinearestaurant.com', description: 'Progressive American cuisine in Chicago' },
      { name: 'Blue Hill', url: 'https://www.bluehillfarm.com', description: 'Farm-to-table pioneer' },
      { name: 'Noma', url: 'https://noma.dk', description: 'World-renowned Copenhagen restaurant' },
    ],
    'bakery': [
      { name: 'Dominique Ansel Bakery', url: 'https://www.dominiqueansel.com', description: 'Creator of the Cronut' },
      { name: 'Tartine Bakery', url: 'https://www.tartinebakery.com', description: 'San Francisco artisan bakery' },
      { name: 'Poilâne', url: 'https://www.poilane.com', description: 'Paris legendary sourdough' },
      { name: 'Levain Bakery', url: 'https://www.levainbakery.com', description: 'Famous NYC cookies' },
      { name: 'Flour Bakery', url: 'https://flourbakery.com', description: 'Boston artisan bakery' },
    ],
    'coffee-shop': [
      { name: 'Blue Bottle Coffee', url: 'https://bluebottlecoffee.com', description: 'Third-wave coffee pioneer' },
      { name: 'Stumptown Coffee', url: 'https://www.stumptowncoffee.com', description: 'Portland specialty roaster' },
      { name: 'Intelligentsia', url: 'https://www.intelligentsia.com', description: 'Chicago-based specialty coffee' },
      { name: 'Counter Culture', url: 'https://counterculturecoffee.com', description: 'Direct trade coffee roaster' },
      { name: 'Verve Coffee', url: 'https://www.vervecoffee.com', description: 'Santa Cruz craft roaster' },
    ],
    'law-firm': [
      { name: 'Cravath, Swaine & Moore', url: 'https://www.cravath.com', description: 'Elite NYC law firm' },
      { name: 'Skadden, Arps', url: 'https://www.skadden.com', description: 'Global legal practice' },
      { name: 'Sullivan & Cromwell', url: 'https://www.sullcrom.com', description: 'Leading M&A practice' },
      { name: 'Wachtell, Lipton', url: 'https://www.wlrk.com', description: 'Premier corporate law' },
      { name: 'Gibson Dunn', url: 'https://www.gibsondunn.com', description: 'International law firm' },
    ],
    'real-estate': [
      { name: 'Sotheby\'s International Realty', url: 'https://www.sothebysrealty.com', description: 'Luxury real estate' },
      { name: 'Christie\'s Real Estate', url: 'https://www.christiesrealestate.com', description: 'Luxury property specialists' },
      { name: 'Compass', url: 'https://www.compass.com', description: 'Modern real estate technology' },
      { name: 'Douglas Elliman', url: 'https://www.elliman.com', description: 'Premium residential brokerage' },
      { name: 'The Agency', url: 'https://www.theagencyre.com', description: 'Boutique luxury real estate' },
    ],
    'fitness': [
      { name: 'Equinox', url: 'https://www.equinox.com', description: 'Luxury fitness clubs' },
      { name: 'Barry\'s Bootcamp', url: 'https://www.barrys.com', description: 'High-intensity workouts' },
      { name: 'SoulCycle', url: 'https://www.soul-cycle.com', description: 'Indoor cycling experience' },
      { name: 'Orangetheory', url: 'https://www.orangetheory.com', description: 'Heart-rate based training' },
      { name: 'F45 Training', url: 'https://f45training.com', description: 'Functional fitness' },
    ],
    'beauty-spa': [
      { name: 'Four Seasons Spa', url: 'https://www.fourseasons.com/spas', description: 'Luxury hotel spas' },
      { name: 'Canyon Ranch', url: 'https://www.canyonranch.com', description: 'Wellness resort destination' },
      { name: 'Aman Spa', url: 'https://www.aman.com/spa', description: 'Ultra-luxury wellness' },
      { name: 'The Well', url: 'https://www.the-well.com', description: 'Holistic wellness club' },
      { name: 'Aire Ancient Baths', url: 'https://beaire.com', description: 'Thermal bath experience' },
    ],
    'hair-salon': [
      { name: 'Sally Hershberger', url: 'https://www.sallyhershberger.com', description: 'Celebrity hair stylist' },
      { name: 'Drybar', url: 'https://www.drybar.com', description: 'Blowout bar concept' },
      { name: 'Bumble and bumble', url: 'https://www.bumbleandbumble.com', description: 'Premium hair products & salons' },
      { name: 'Spoke & Weal', url: 'https://spokeandweal.com', description: 'Modern hair salons' },
      { name: 'R+Co', url: 'https://www.randco.com', description: 'Collective of hairstylists' },
    ],
    'tech-saas': [
      { name: 'Stripe', url: 'https://stripe.com', description: 'Payment infrastructure' },
      { name: 'Linear', url: 'https://linear.app', description: 'Issue tracking for teams' },
      { name: 'Notion', url: 'https://www.notion.so', description: 'All-in-one workspace' },
      { name: 'Vercel', url: 'https://vercel.com', description: 'Frontend cloud platform' },
      { name: 'Figma', url: 'https://www.figma.com', description: 'Collaborative design tool' },
    ],
    'creative-agency': [
      { name: 'Pentagram', url: 'https://www.pentagram.com', description: 'World-leading design firm' },
      { name: 'IDEO', url: 'https://www.ideo.com', description: 'Design and innovation consultancy' },
      { name: 'MetaLab', url: 'https://www.metalab.co', description: 'Digital product studio' },
      { name: 'Fantasy', url: 'https://fantasy.co', description: 'Digital innovation studio' },
      { name: 'ueno', url: 'https://www.ueno.co', description: 'Design agency' },
    ],
    'photography': [
      { name: 'Annie Leibovitz', url: 'https://www.annieleibovitz.com', description: 'Iconic portrait photographer' },
      { name: 'Peter McKinnon', url: 'https://www.petermckinnon.com', description: 'Photography & cinematography' },
      { name: 'Brandon Woelfel', url: 'https://www.brandonwoelfel.com', description: 'Creative portrait photography' },
      { name: 'Jasmine Star', url: 'https://www.jasminestar.com', description: 'Wedding photographer & educator' },
      { name: 'Jose Villa', url: 'https://josevillaphoto.com', description: 'Fine art wedding photography' },
    ],
    'pet-services': [
      { name: 'Chewy', url: 'https://www.chewy.com', description: 'Pet food & supplies' },
      { name: 'BarkBox', url: 'https://www.barkbox.com', description: 'Dog subscription box' },
      { name: 'Rover', url: 'https://www.rover.com', description: 'Pet sitting marketplace' },
      { name: 'Wag!', url: 'https://wagwalking.com', description: 'Dog walking service' },
      { name: 'PetSmart', url: 'https://www.petsmart.com', description: 'Pet retail & services' },
    ],
    'ecommerce': [
      { name: 'Apple', url: 'https://www.apple.com/store', description: 'Premium product experience' },
      { name: 'Glossier', url: 'https://www.glossier.com', description: 'Beauty brand with cult following' },
      { name: 'Allbirds', url: 'https://www.allbirds.com', description: 'Sustainable footwear' },
      { name: 'Warby Parker', url: 'https://www.warbyparker.com', description: 'Direct-to-consumer eyewear' },
      { name: 'Away', url: 'https://www.awaytravel.com', description: 'Modern luggage brand' },
    ],
    'default': [
      { name: 'Apple', url: 'https://www.apple.com', description: 'Product-focused design excellence' },
      { name: 'Airbnb', url: 'https://www.airbnb.com', description: 'Experience-driven platform' },
      { name: 'Stripe', url: 'https://stripe.com', description: 'Developer-first design' },
      { name: 'Slack', url: 'https://slack.com', description: 'Friendly enterprise software' },
      { name: 'Dropbox', url: 'https://www.dropbox.com', description: 'Clean, intuitive design' },
    ]
  }

  // First check if we have leaders in our curated database
  let industryLeaders = leaders[businessType] || []

  // If we don't have enough, try to get example sites from keyword config
  if (industryLeaders.length < limit) {
    const exampleSites = getExampleSites(businessType, [])
    for (const site of exampleSites) {
      if (industryLeaders.length >= limit) break
      // Don't add duplicates
      if (!industryLeaders.some(l => l.url.includes(site))) {
        industryLeaders.push({
          name: site.replace(/\.com|\.net|\.org|\.io/g, '').replace(/^www\./, ''),
          url: `https://${site.startsWith('http') ? site.replace(/^https?:\/\//, '') : site}`,
          description: 'Industry reference site'
        })
      }
    }
  }

  // Fall back to defaults if still empty
  if (industryLeaders.length === 0) {
    industryLeaders = leaders['default']
  }

  return industryLeaders.slice(0, limit).map((l, idx) => ({ ...l, ranking: idx + 1 }))
}

/**
 * Analyze multiple competitor websites and extract patterns
 */
export async function analyzeCompetitors(competitors: CompetitorSearchResult[]): Promise<CompetitorInsights> {
  const analyzedSites: WebsiteAnalysis[] = []

  // Analyze up to 3 competitor websites (to stay within reasonable time/rate limits)
  const toAnalyze = competitors.slice(0, 3)

  for (const competitor of toAnalyze) {
    try {
      console.log(`Analyzing competitor: ${competitor.name} (${competitor.url})`)
      const analysis = await analyzeWebsite(competitor.url)
      analyzedSites.push(analysis)
    } catch (error) {
      console.error(`Failed to analyze ${competitor.url}:`, error)
      // Continue with other competitors
    }
  }

  // Extract design patterns from analyzed sites
  const designPatterns = extractDesignPatterns(analyzedSites)
  const contentPatterns = extractContentPatterns(analyzedSites)
  const industryInsights = extractIndustryInsights(analyzedSites, competitors)

  // Generate summary for AI prompt
  const summaryForAI = generateAISummary(competitors, analyzedSites, designPatterns, contentPatterns, industryInsights)

  return {
    topCompetitors: competitors,
    analyzedSites,
    designPatterns,
    contentPatterns,
    industryInsights,
    summaryForAI
  }
}

/**
 * Extract design patterns from analyzed websites
 */
function extractDesignPatterns(sites: WebsiteAnalysis[]): CompetitorInsights['designPatterns'] {
  const colors: string[] = []
  const fonts: string[] = []
  const layouts: string[] = []
  const heroStyles: string[] = []

  for (const site of sites) {
    if (site.colors.primary) colors.push(site.colors.primary)
    if (site.colors.secondary) colors.push(site.colors.secondary)
    if (site.colors.accent) colors.push(site.colors.accent)

    if (site.fonts.heading) fonts.push(site.fonts.heading)
    if (site.fonts.body) fonts.push(site.fonts.body)

    // Detect layout patterns from pages
    if (site.pages.length > 5) layouts.push('multi-page navigation')
    if (site.hasEcommerce) layouts.push('ecommerce grid layout')
    if (site.images.hero) heroStyles.push('full-width hero image')
    if (site.images.gallery.length > 0) layouts.push('image gallery section')
  }

  return {
    commonColors: [...new Set(colors)],
    fontPatterns: [...new Set(fonts)],
    layoutStyles: [...new Set(layouts)],
    heroStyles: [...new Set(heroStyles)]
  }
}

/**
 * Extract content patterns from analyzed websites
 */
function extractContentPatterns(sites: WebsiteAnalysis[]): CompetitorInsights['contentPatterns'] {
  const headings: string[] = []
  const ctas: string[] = []
  const valueProps: string[] = []
  const testimonialStyles: string[] = []

  for (const site of sites) {
    // Extract heading patterns
    for (const heading of site.content.headings.slice(0, 5)) {
      if (heading.length > 10 && heading.length < 100) {
        headings.push(heading)
      }
    }

    // Detect CTA patterns from content
    const ctaKeywords = ['get started', 'book now', 'contact us', 'learn more', 'shop now', 'reserve', 'schedule']
    for (const keyword of site.content.keywords) {
      if (ctaKeywords.some(cta => keyword.toLowerCase().includes(cta))) {
        ctas.push(keyword)
      }
    }

    // Testimonial styles
    if (site.images.testimonials.length > 0) {
      testimonialStyles.push('testimonials with photos')
    }
  }

  return {
    commonHeadings: [...new Set(headings)].slice(0, 10),
    ctaPatterns: [...new Set(ctas)],
    valuePropositions: [...new Set(valueProps)],
    testimonialStyles: [...new Set(testimonialStyles)]
  }
}

/**
 * Extract industry-specific insights
 */
function extractIndustryInsights(sites: WebsiteAnalysis[], competitors: CompetitorSearchResult[]): CompetitorInsights['industryInsights'] {
  const features: string[] = []
  const sections: string[] = []
  const pricingPatterns: string[] = []
  const trustSignals: string[] = []

  for (const site of sites) {
    // Detect common sections from page structure
    for (const page of site.pages) {
      const pageLower = page.title.toLowerCase()
      if (pageLower.includes('about')) sections.push('about section')
      if (pageLower.includes('service')) sections.push('services section')
      if (pageLower.includes('contact')) sections.push('contact section')
      if (pageLower.includes('team')) sections.push('team section')
      if (pageLower.includes('portfolio') || pageLower.includes('work')) sections.push('portfolio section')
      if (pageLower.includes('blog') || pageLower.includes('news')) sections.push('blog section')
      if (pageLower.includes('testimonial') || pageLower.includes('review')) sections.push('testimonials section')
      if (pageLower.includes('pricing') || pageLower.includes('price')) {
        sections.push('pricing section')
        pricingPatterns.push('dedicated pricing page')
      }
      if (pageLower.includes('faq')) sections.push('FAQ section')
    }

    // Detect must-have features
    if (site.hasEcommerce) features.push('e-commerce functionality')
    if (site.images.products.length > 0) features.push('product gallery')
    if (site.images.team.length > 0) features.push('team photos')

    // Trust signals
    if (site.images.testimonials.length > 0) trustSignals.push('customer testimonials with photos')
  }

  return {
    mustHaveFeatures: [...new Set(features)],
    commonSections: [...new Set(sections)],
    pricingPatterns: [...new Set(pricingPatterns)],
    trustSignals: [...new Set(trustSignals)]
  }
}

/**
 * Generate a summary for AI prompt consumption
 */
function generateAISummary(
  competitors: CompetitorSearchResult[],
  analyzedSites: WebsiteAnalysis[],
  designPatterns: CompetitorInsights['designPatterns'],
  contentPatterns: CompetitorInsights['contentPatterns'],
  industryInsights: CompetitorInsights['industryInsights']
): string {
  const parts: string[] = []

  parts.push(`## COMPETITOR RESEARCH INSIGHTS`)
  parts.push(``)

  // Top competitors found
  parts.push(`### Industry Leaders Analyzed:`)
  for (const comp of competitors.slice(0, 5)) {
    parts.push(`- ${comp.name}: ${comp.description}`)
  }
  parts.push(``)

  // Design patterns
  if (designPatterns.commonColors.length > 0) {
    parts.push(`### Design Patterns Found:`)
    parts.push(`- Common colors: ${designPatterns.commonColors.join(', ')}`)
    if (designPatterns.fontPatterns.length > 0) {
      parts.push(`- Typography: ${designPatterns.fontPatterns.join(', ')}`)
    }
    if (designPatterns.layoutStyles.length > 0) {
      parts.push(`- Layout styles: ${designPatterns.layoutStyles.join(', ')}`)
    }
    parts.push(``)
  }

  // Content patterns
  if (contentPatterns.commonHeadings.length > 0) {
    parts.push(`### Content Patterns:`)
    parts.push(`- Effective headlines from leaders: ${contentPatterns.commonHeadings.slice(0, 5).join('; ')}`)
    if (contentPatterns.ctaPatterns.length > 0) {
      parts.push(`- CTA patterns: ${contentPatterns.ctaPatterns.join(', ')}`)
    }
    parts.push(``)
  }

  // Industry must-haves
  if (industryInsights.mustHaveFeatures.length > 0 || industryInsights.commonSections.length > 0) {
    parts.push(`### Industry Must-Haves:`)
    if (industryInsights.mustHaveFeatures.length > 0) {
      parts.push(`- Required features: ${industryInsights.mustHaveFeatures.join(', ')}`)
    }
    if (industryInsights.commonSections.length > 0) {
      parts.push(`- Common sections: ${industryInsights.commonSections.join(', ')}`)
    }
    if (industryInsights.trustSignals.length > 0) {
      parts.push(`- Trust signals used: ${industryInsights.trustSignals.join(', ')}`)
    }
    parts.push(``)
  }

  parts.push(`### Recommendation:`)
  parts.push(`Create a website that matches or exceeds the quality of ${competitors[0]?.name || 'industry leaders'}, `)
  parts.push(`incorporating the design patterns and content strategies used by top performers in this industry.`)

  return parts.join('\n')
}

/**
 * Full competitor research flow - search, analyze, and return insights
 */
export async function conductCompetitorResearch(params: {
  businessType: string
  businessName?: string
  location?: string
  industry?: string
}): Promise<CompetitorInsights> {
  const { businessType, location, industry } = params

  console.log(`Starting competitor research for: ${businessType}`)

  // Step 1: Search for top businesses
  const competitors = await searchTopBusinesses({
    businessType,
    location,
    industry,
    limit: 5
  })

  console.log(`Found ${competitors.length} competitors to analyze`)

  // Step 2: Analyze competitor websites
  const insights = await analyzeCompetitors(competitors)

  console.log(`Competitor research complete. Analyzed ${insights.analyzedSites.length} sites.`)

  return insights
}
