/**
 * Input sanitization utilities to prevent prompt injection and malicious inputs
 */

// Patterns that indicate potential prompt injection attempts
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions?/i,
  /disregard\s+(all\s+)?previous\s+instructions?/i,
  /forget\s+(all\s+)?previous\s+instructions?/i,
  /new\s+instructions?:/i,
  /system\s+(prompt|message|role|instructions?):/i,
  /you\s+are\s+now/i,
  /act\s+as\s+(a|an)\s+/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /you\s+must\s+now/i,
  /disregard\s+your\s+programming/i,
  /override\s+your\s+instructions/i,
  /\[SYSTEM\]/i,
  /\[ADMIN\]/i,
  /sudo\s+/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\{\{.*system.*\}\}/i,
] as const

// Suspicious patterns that might indicate attempts to extract information
const SUSPICIOUS_PATTERNS = [
  /reveal\s+your\s+(prompt|instructions|system)/i,
  /show\s+me\s+your\s+(prompt|instructions|system)/i,
  /what\s+(is|are)\s+your\s+(instructions|prompts)/i,
  /print\s+your\s+(instructions|system)/i,
  /repeat\s+(back|your)\s+(instructions|prompt)/i,
  /tell\s+me\s+your\s+(instructions|system)/i,
] as const

export interface SanitizationResult {
  isSafe: boolean
  sanitizedInput: string
  flags: string[]
  severity: 'safe' | 'warning' | 'blocked'
}

/**
 * Sanitize user input to prevent prompt injection attacks
 * @param input - The user input to sanitize
 * @param fieldName - Name of the field (for logging)
 * @returns Sanitization result with safety assessment
 */
export function sanitizeUserInput(input: string, fieldName: string = 'input'): SanitizationResult {
  const flags: string[] = []
  let severity: 'safe' | 'warning' | 'blocked' = 'safe'
  let sanitizedInput = input

  // Check for prompt injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      flags.push(`Potential prompt injection detected: ${pattern.source}`)
      severity = 'blocked'
    }
  }

  // Check for suspicious patterns (warning level)
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(input)) {
      flags.push(`Suspicious pattern detected: ${pattern.source}`)
      if (severity === 'safe') severity = 'warning'
    }
  }

  // Remove excessive newlines (potential prompt breaking)
  const newlineCount = (input.match(/\n/g) || []).length
  if (newlineCount > 50) {
    flags.push('Excessive newlines detected')
    sanitizedInput = sanitizedInput.replace(/\n{3,}/g, '\n\n')
    if (severity === 'safe') severity = 'warning'
  }

  // Remove null bytes and control characters
  sanitizedInput = sanitizedInput.replace(/\0/g, '')
  sanitizedInput = sanitizedInput.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Trim excessive whitespace
  sanitizedInput = sanitizedInput.trim()

  // Check for extremely long repeated patterns (potential DDoS or prompt stuffing)
  const repeatedPattern = /(.{10,})\1{5,}/
  if (repeatedPattern.test(input)) {
    flags.push('Repeated pattern detected (possible prompt stuffing)')
    if (severity === 'safe') severity = 'warning'
  }

  const isSafe = severity !== 'blocked'

  if (flags.length > 0) {
    console.warn(`[InputSanitizer] ${fieldName} flagged:`, {
      severity,
      flags,
      inputPreview: input.substring(0, 100)
    })
  }

  return {
    isSafe,
    sanitizedInput,
    flags,
    severity
  }
}

/**
 * Validate and sanitize all inputs for website generation
 */
export function sanitizeWebsiteInputs(data: {
  businessName: string
  description: string
  targetAudience?: string
  features?: string[]
}) {
  const results = {
    businessName: sanitizeUserInput(data.businessName, 'businessName'),
    description: sanitizeUserInput(data.description, 'description'),
    targetAudience: data.targetAudience ? sanitizeUserInput(data.targetAudience, 'targetAudience') : null,
    features: data.features?.map((f, i) => sanitizeUserInput(f, `features[${i}]`)) || []
  }

  // Check if any field is blocked
  const blockedFields = []
  if (!results.businessName.isSafe) blockedFields.push('businessName')
  if (!results.description.isSafe) blockedFields.push('description')
  if (results.targetAudience && !results.targetAudience.isSafe) blockedFields.push('targetAudience')
  if (results.features.some(r => !r.isSafe)) blockedFields.push('features')

  return {
    isValid: blockedFields.length === 0,
    blockedFields,
    sanitized: {
      businessName: results.businessName.sanitizedInput,
      description: results.description.sanitizedInput,
      targetAudience: results.targetAudience?.sanitizedInput || data.targetAudience,
      features: results.features.map(r => r.sanitizedInput)
    },
    warnings: [
      ...results.businessName.flags,
      ...results.description.flags,
      ...(results.targetAudience?.flags || []),
      ...results.features.flatMap(r => r.flags)
    ]
  }
}
