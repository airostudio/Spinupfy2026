/**
 * Random Subdomain Name Generator
 *
 * Generates fun, memorable subdomain names like:
 * - elephant-draw
 * - happy-mountain
 * - cosmic-river
 */

// Lists of adjectives and nouns for generating random subdomain names
const adjectives = [
  'happy', 'cosmic', 'bright', 'calm', 'clever', 'creative', 'crystal', 'digital',
  'eager', 'electric', 'elegant', 'epic', 'fancy', 'fresh', 'gentle', 'glowing',
  'golden', 'graceful', 'grand', 'groovy', 'infinite', 'inspired', 'joyful', 'kind',
  'lively', 'lucky', 'magic', 'mellow', 'mighty', 'modern', 'mystic', 'noble',
  'ocean', 'peaceful', 'perfect', 'playful', 'prime', 'proud', 'pure', 'quick',
  'radiant', 'rapid', 'royal', 'serene', 'shiny', 'simple', 'smooth', 'solar',
  'sonic', 'spark', 'stellar', 'sunny', 'super', 'swift', 'tranquil', 'ultra',
  'unique', 'vast', 'vibrant', 'vital', 'vivid', 'warm', 'wild', 'wise', 'zen',
  'azure', 'amber', 'arctic', 'cosmic', 'dynamic', 'emerald', 'lunar', 'plasma',
]

const nouns = [
  'mountain', 'river', 'ocean', 'cloud', 'star', 'moon', 'sun', 'sky',
  'forest', 'meadow', 'valley', 'peak', 'lake', 'stream', 'wave', 'breeze',
  'storm', 'thunder', 'lightning', 'rainbow', 'aurora', 'comet', 'nebula', 'galaxy',
  'planet', 'cosmos', 'universe', 'horizon', 'dawn', 'dusk', 'phoenix', 'dragon',
  'tiger', 'eagle', 'falcon', 'hawk', 'wolf', 'bear', 'lion', 'leopard',
  'panther', 'cheetah', 'jaguar', 'lynx', 'otter', 'dolphin', 'whale', 'shark',
  'turtle', 'penguin', 'owl', 'raven', 'swan', 'crane', 'heron', 'flamingo',
  'elephant', 'giraffe', 'zebra', 'rhino', 'buffalo', 'moose', 'deer', 'fox',
  'rabbit', 'squirrel', 'beaver', 'badger', 'raccoon', 'panda', 'koala', 'sloth',
  'crystal', 'diamond', 'ruby', 'emerald', 'sapphire', 'pearl', 'coral', 'jade',
]

/**
 * Generate a random subdomain name
 * Format: {adjective}-{noun}
 * Example: "elephant-draw", "cosmic-river", "happy-mountain"
 */
export function generateRandomSubdomain(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]

  return `${adjective}-${noun}`
}

/**
 * Generate a random subdomain with uniqueness check
 * Adds a random number if needed to ensure uniqueness
 */
export function generateUniqueSubdomain(existingSubdomains: string[] = []): string {
  let subdomain = generateRandomSubdomain()
  let attempts = 0
  const maxAttempts = 10

  // Try to find a unique name
  while (existingSubdomains.includes(subdomain) && attempts < maxAttempts) {
    subdomain = generateRandomSubdomain()
    attempts++
  }

  // If still not unique after max attempts, add a random number
  if (existingSubdomains.includes(subdomain)) {
    const randomNum = Math.floor(Math.random() * 9999) + 1
    subdomain = `${subdomain}-${randomNum}`
  }

  return subdomain
}

/**
 * Generate multiple random subdomains
 */
export function generateSubdomainOptions(count: number = 5): string[] {
  const subdomains: string[] = []

  for (let i = 0; i < count; i++) {
    subdomains.push(generateUniqueSubdomain(subdomains))
  }

  return subdomains
}

/**
 * Validate subdomain name
 * - Must be lowercase
 * - Only letters, numbers, and hyphens
 * - Cannot start or end with hyphen
 * - 3-63 characters long
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Must be lowercase
  if (subdomain !== subdomain.toLowerCase()) {
    return false
  }

  // Length check
  if (subdomain.length < 3 || subdomain.length > 63) {
    return false
  }

  // Pattern check: only letters, numbers, and hyphens
  const pattern = /^[a-z0-9]+(-[a-z0-9]+)*$/
  if (!pattern.test(subdomain)) {
    return false
  }

  // Cannot start or end with hyphen
  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    return false
  }

  return true
}

/**
 * Sanitize custom subdomain name
 */
export function sanitizeSubdomain(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphen
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 63) // Max length
}
