/**
 * Image Placeholder Utilities
 * Generates shimmer/blur placeholders for better perceived performance
 */

/**
 * Pre-generated static blur placeholders for optimal Next.js Image performance
 * These are generated at module load time to avoid runtime encoding issues
 */

// Shimmer placeholder (700x475) - default size
const shimmerSvg = `<svg width="700" height="475" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="#f6f7f8" offset="0%"/><stop stop-color="#edeef1" offset="20%"/><stop stop-color="#f6f7f8" offset="40%"/><stop stop-color="#f6f7f8" offset="100%"/></linearGradient></defs><rect width="700" height="475" fill="#f6f7f8"/><rect id="r" width="700" height="475" fill="url(#g)"/></svg>`

// Product image shimmer (400x256)
const shimmerProductSvg = `<svg width="400" height="256" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="#f6f7f8" offset="0%"/><stop stop-color="#edeef1" offset="20%"/><stop stop-color="#f6f7f8" offset="40%"/><stop stop-color="#f6f7f8" offset="100%"/></linearGradient></defs><rect width="400" height="256" fill="#f6f7f8"/><rect id="r" width="400" height="256" fill="url(#g)"/></svg>`

// Small shimmer (80x80) for thumbnails
const shimmerSmallSvg = `<svg width="80" height="80" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="#f6f7f8" offset="0%"/><stop stop-color="#edeef1" offset="20%"/><stop stop-color="#f6f7f8" offset="40%"/><stop stop-color="#f6f7f8" offset="100%"/></linearGradient></defs><rect width="80" height="80" fill="#f6f7f8"/><rect id="r" width="80" height="80" fill="url(#g)"/></svg>`

// Gradient placeholder - NO PURPLE
const gradientSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2563eb;stop-opacity:1"/><stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1"/></linearGradient></defs><rect width="100" height="100" fill="url(#grad)"/></svg>`

/**
 * Browser-compatible base64 encoding
 * Uses btoa in browser, Buffer in Node.js
 */
function toBase64(str: string): string {
  if (typeof window !== 'undefined') {
    // Browser environment - use btoa
    return btoa(str)
  } else {
    // Node.js environment - use Buffer
    return Buffer.from(str).toString('base64')
  }
}

// Pre-encode common placeholders
const SHIMMER_DATA_URL = `data:image/svg+xml;base64,${toBase64(shimmerSvg)}`
const SHIMMER_PRODUCT_DATA_URL = `data:image/svg+xml;base64,${toBase64(shimmerProductSvg)}`
const SHIMMER_SMALL_DATA_URL = `data:image/svg+xml;base64,${toBase64(shimmerSmallSvg)}`
const GRADIENT_DATA_URL = `data:image/svg+xml;base64,${toBase64(gradientSvg)}`

/**
 * Generate a shimmer effect data URL for Next.js Image placeholder
 * Returns pre-encoded static placeholders for optimal performance
 */
export function getShimmerPlaceholder(width: number = 700, height: number = 475): string {
  // Return pre-encoded placeholders for common sizes
  if (width === 400 && height === 256) return SHIMMER_PRODUCT_DATA_URL
  if (width === 80 && height === 80) return SHIMMER_SMALL_DATA_URL

  // Default shimmer for standard sizes
  return SHIMMER_DATA_URL
}

/**
 * Generate a solid color blur placeholder
 * Useful for product images or avatars
 */
export function getColorPlaceholder(color: string = '#f3f4f6'): string {
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${color}"/></svg>`
  const base64 = toBase64(svg)
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * Generate a gradient blur placeholder
 * Creates a smooth gradient effect for hero images
 */
export function getGradientPlaceholder(
  fromColor: string = '#2563eb',
  toColor: string = '#06b6d4'
): string {
  // Return pre-encoded default gradient if using default colors
  if (fromColor === '#2563eb' && toColor === '#06b6d4') {
    return GRADIENT_DATA_URL
  }

  // Generate custom gradient if needed
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${fromColor};stop-opacity:1"/><stop offset="100%" style="stop-color:${toColor};stop-opacity:1"/></linearGradient></defs><rect width="100" height="100" fill="url(#grad)"/></svg>`
  const base64 = toBase64(svg)
  return `data:image/svg+xml;base64,${base64}`
}
