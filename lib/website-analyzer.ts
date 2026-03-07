/**
 * Website Analyzer
 * Extracts brand information, content, and styling from existing websites
 */

import * as cheerio from 'cheerio';

// Custom error types for better error handling
export class WebsiteAnalysisError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'WebsiteAnalysisError';
    this.code = code;
  }
}

export interface WebsiteAnalysis {
  // Metadata
  title: string;
  description: string;

  // Brand colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };

  // Typography
  fonts: {
    heading: string;
    body: string;
  };

  // Content
  content: {
    headings: string[];
    paragraphs: string[];
    keywords: string[];
  };

  // Enhanced Images - comprehensive extraction
  images: {
    logo?: string;
    favicon?: string;
    hero?: string;
    banner?: string;
    ogImage?: string;
    gallery: string[];
    products: Array<{
      url: string;
      alt?: string;
      price?: string;
      title?: string;
    }>;
    backgrounds: string[];
    team: string[];
    testimonials: string[];
    all: string[]; // All unique images found
  };

  // Pages found
  pages: Array<{
    title: string;
    url: string;
  }>;

  // Business type detection
  detectedType: string;
  keywords: string[];

  // E-commerce detection
  hasEcommerce: boolean;
  ecommerceData?: {
    platform?: string;
    productCount?: number;
    categories?: string[];
    currency?: string;
  };
}

/**
 * Fetch and analyze a website
 */
export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  try {
    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new WebsiteAnalysisError(
        'The URL format is invalid. Please check for typos and try again.',
        'INVALID_URL_FORMAT'
      );
    }

    // Fetch the website HTML with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        throw new WebsiteAnalysisError(
          'The website took too long to respond. Please check if the website is online and try again.',
          'TIMEOUT'
        );
      }

      if (fetchError.code === 'ENOTFOUND' || fetchError.message?.includes('ENOTFOUND')) {
        throw new WebsiteAnalysisError(
          `We couldn't find a website at "${parsedUrl.hostname}". Please check the domain name for typos.`,
          'DOMAIN_NOT_FOUND'
        );
      }

      if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('ECONNREFUSED')) {
        throw new WebsiteAnalysisError(
          'The website refused the connection. It may be down or blocking our requests.',
          'CONNECTION_REFUSED'
        );
      }

      if (fetchError.code === 'CERT_HAS_EXPIRED' || fetchError.message?.includes('certificate')) {
        throw new WebsiteAnalysisError(
          'The website has an invalid or expired SSL certificate.',
          'SSL_ERROR'
        );
      }

      throw new WebsiteAnalysisError(
        `Unable to connect to the website: ${fetchError.message || 'Network error'}`,
        'NETWORK_ERROR'
      );
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new WebsiteAnalysisError(
          `The page at "${url}" was not found (404). Please check the URL for typos.`,
          'NOT_FOUND'
        );
      }
      if (response.status === 403) {
        throw new WebsiteAnalysisError(
          'Access to this website is forbidden. The site may be blocking automated access.',
          'FORBIDDEN'
        );
      }
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        throw new WebsiteAnalysisError(
          'The website is currently experiencing server issues. Please try again later.',
          'SERVER_ERROR'
        );
      }
      throw new WebsiteAnalysisError(
        `Failed to load the website (HTTP ${response.status}). Please verify the URL is correct.`,
        'HTTP_ERROR'
      );
    }

    const html = await response.text();

    // Check if we got actual HTML content
    if (!html || html.trim().length < 100) {
      throw new WebsiteAnalysisError(
        'The website returned empty or minimal content. It may require JavaScript to load.',
        'EMPTY_CONTENT'
      );
    }
    const $ = cheerio.load(html);

    // Extract metadata
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') || '';

    // Extract colors from CSS variables and inline styles
    const colors = extractColors($);

    // Extract fonts
    const fonts = extractFonts($);

    // Extract content
    const content = extractContent($);

    // Extract images (enhanced)
    const images = extractImages($, url);

    // Extract navigation/pages
    const pages = extractPages($, url);

    // Detect business type based on content
    const { detectedType, keywords } = detectBusinessType(content, title, description);

    // Detect e-commerce
    const { hasEcommerce, ecommerceData } = detectEcommerce($, content, detectedType);

    return {
      title,
      description,
      colors,
      fonts,
      content,
      images,
      pages,
      detectedType,
      keywords,
      hasEcommerce,
      ecommerceData,
    };
  } catch (error) {
    console.error('Error analyzing website:', error);
    throw error;
  }
}

/**
 * Extract color scheme from the website
 */
function extractColors($: cheerio.CheerioAPI): { primary: string; secondary: string; accent: string } {
  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
  };

  try {
    // Look for CSS variables
    const styleContent = $('style').text();
    const cssVarMatches = styleContent.match(/--(?:primary|main|brand)[^:]*:\s*(#[0-9A-Fa-f]{6}|rgb[a]?\([^)]+\))/gi);

    if (cssVarMatches && cssVarMatches.length > 0) {
      const colorMatch = cssVarMatches[0].match(/(#[0-9A-Fa-f]{6}|rgb[a]?\([^)]+\))/);
      if (colorMatch) {
        colors.primary = colorMatch[1];
      }
    }

    // Look for common button/link colors
    const buttonColors: string[] = [];
    $('button, .btn, a.button, [class*="button"]').each((_, elem) => {
      const bgColor = $(elem).css('background-color') || $(elem).attr('style')?.match(/background-color:\s*([^;]+)/)?.[1];
      if (bgColor && bgColor !== 'transparent' && !bgColor.includes('255, 255, 255')) {
        buttonColors.push(bgColor);
      }
    });

    if (buttonColors.length > 0) {
      colors.primary = buttonColors[0];
      if (buttonColors.length > 1) {
        colors.secondary = buttonColors[1];
      }
    }

    // Look for accent colors in headers, highlights
    const accentColors: string[] = [];
    $('h1, h2, .highlight, [class*="accent"]').each((_, elem) => {
      const color = $(elem).css('color') || $(elem).attr('style')?.match(/color:\s*([^;]+)/)?.[1];
      if (color && color !== 'inherit' && !color.includes('0, 0, 0') && !color.includes('255, 255, 255')) {
        accentColors.push(color);
      }
    });

    if (accentColors.length > 0) {
      colors.accent = accentColors[0];
    }
  } catch (error) {
    console.error('Error extracting colors:', error);
  }

  return colors;
}

/**
 * Extract font families
 */
function extractFonts($: cheerio.CheerioAPI): { heading: string; body: string } {
  const fonts = {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  };

  try {
    // Check headings
    const h1Font = $('h1').first().css('font-family');
    if (h1Font) {
      fonts.heading = h1Font.replace(/['"]/g, '').split(',')[0].trim();
    }

    // Check body
    const bodyFont = $('body').css('font-family') || $('p').first().css('font-family');
    if (bodyFont) {
      fonts.body = bodyFont.replace(/['"]/g, '').split(',')[0].trim();
    }
  } catch (error) {
    console.error('Error extracting fonts:', error);
  }

  return fonts;
}

/**
 * Extract text content and keywords
 */
function extractContent($: cheerio.CheerioAPI): { headings: string[]; paragraphs: string[]; keywords: string[] } {
  const headings: string[] = [];
  const paragraphs: string[] = [];
  const keywords = new Set<string>();

  // Extract headings
  $('h1, h2, h3').each((_, elem) => {
    const text = $(elem).text().trim();
    if (text && text.length > 3 && text.length < 200) {
      headings.push(text);
      // Extract keywords from headings
      text.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 4 && !isCommonWord(word)) {
          keywords.add(word);
        }
      });
    }
  });

  // Extract paragraphs
  $('p').each((_, elem) => {
    const text = $(elem).text().trim();
    if (text && text.length > 20 && text.length < 500) {
      paragraphs.push(text);
    }
  });

  // Extract meta keywords
  const metaKeywords = $('meta[name="keywords"]').attr('content');
  if (metaKeywords) {
    metaKeywords.split(',').forEach(keyword => {
      const clean = keyword.trim().toLowerCase();
      if (clean.length > 3) {
        keywords.add(clean);
      }
    });
  }

  return {
    headings: headings.slice(0, 10),
    paragraphs: paragraphs.slice(0, 15),
    keywords: Array.from(keywords).slice(0, 20),
  };
}

/**
 * Extract images - Enhanced comprehensive extraction
 */
function extractImages($: cheerio.CheerioAPI, baseUrl: string): WebsiteAnalysis['images'] {
  const allImages = new Set<string>();
  const galleryImages: string[] = [];
  const productImages: Array<{ url: string; alt?: string; price?: string; title?: string }> = [];
  const backgroundImages: string[] = [];
  const teamImages: string[] = [];
  const testimonialImages: string[] = [];

  let logo: string | undefined;
  let favicon: string | undefined;
  let hero: string | undefined;
  let banner: string | undefined;
  let ogImage: string | undefined;

  // Helper to check if URL is valid image
  const isValidImageUrl = (src: string | undefined): src is string => {
    if (!src) return false;
    if (src.includes('data:image')) return false;
    if (src.includes('placeholder')) return false;
    if (src.includes('spacer')) return false;
    if (src.includes('pixel')) return false;
    if (src.includes('tracking')) return false;
    if (src.length < 10) return false;
    return true;
  };

  // Extract favicon
  $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').each((_, elem) => {
    const href = $(elem).attr('href');
    if (href && !favicon) {
      favicon = resolveUrl(href, baseUrl);
    }
  });

  // Extract OpenGraph image
  const ogImageUrl = $('meta[property="og:image"]').attr('content');
  if (ogImageUrl) {
    ogImage = resolveUrl(ogImageUrl, baseUrl);
    allImages.add(ogImage);
  }

  // Extract Twitter card image
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  if (twitterImage && !ogImage) {
    ogImage = resolveUrl(twitterImage, baseUrl);
    allImages.add(ogImage);
  }

  // Look for logo - multiple strategies
  const logoSelectors = [
    'img[class*="logo"]',
    'img[alt*="logo" i]',
    'img[id*="logo"]',
    '.logo img',
    '#logo img',
    'header img:first-of-type',
    '.header img:first-of-type',
    '.navbar-brand img',
    '.site-logo img',
    'a[class*="logo"] img',
  ];

  for (const selector of logoSelectors) {
    if (logo) break;
    $(selector).each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (isValidImageUrl(src) && !logo) {
        logo = resolveUrl(src, baseUrl);
        allImages.add(logo);
      }
    });
  }

  // Look for hero/banner images
  const heroSelectors = [
    'img[class*="hero"]',
    'img[class*="banner"]',
    '.hero img',
    '.hero-section img',
    '.banner img',
    '.jumbotron img',
    '[class*="hero"] img',
    '[class*="banner"] img',
    '.slider img:first-of-type',
    '.carousel img:first-of-type',
    '.swiper img:first-of-type',
  ];

  for (const selector of heroSelectors) {
    if (hero) break;
    $(selector).each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (isValidImageUrl(src) && !hero && src !== logo) {
        hero = resolveUrl(src, baseUrl);
        allImages.add(hero);
      }
    });
  }

  // Extract background images from inline styles
  $('[style*="background"]').each((_, elem) => {
    const style = $(elem).attr('style') || '';
    const bgMatch = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (bgMatch && bgMatch[1]) {
      const bgUrl = resolveUrl(bgMatch[1], baseUrl);
      if (isValidImageUrl(bgUrl)) {
        backgroundImages.push(bgUrl);
        allImages.add(bgUrl);
        // First large background might be hero
        if (!hero && backgroundImages.length === 1) {
          hero = bgUrl;
        }
      }
    }
  });

  // Extract product images (e-commerce)
  const productSelectors = [
    '.product img',
    '.product-image img',
    '.product-card img',
    '[class*="product"] img',
    '.woocommerce-product-gallery img',
    '.shopify-product img',
    '[data-product] img',
    '.item-image img',
    '.goods img',
  ];

  const seenProductUrls = new Set<string>();
  productSelectors.forEach(selector => {
    $(selector).each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (isValidImageUrl(src)) {
        const url = resolveUrl(src, baseUrl);
        if (!seenProductUrls.has(url)) {
          seenProductUrls.add(url);

          // Try to find associated product info
          const parent = $(elem).closest('.product, .product-card, [class*="product"]');
          const title = parent.find('.product-title, .product-name, h2, h3').first().text().trim();
          const price = parent.find('.price, .product-price, [class*="price"]').first().text().trim();
          const alt = $(elem).attr('alt');

          productImages.push({
            url,
            alt: alt || undefined,
            price: price || undefined,
            title: title || undefined,
          });
          allImages.add(url);
        }
      }
    });
  });

  // Extract team/about images
  const teamSelectors = [
    '.team img',
    '.team-member img',
    '.staff img',
    '.about-team img',
    '[class*="team"] img',
    '.employee img',
    '.founder img',
  ];

  teamSelectors.forEach(selector => {
    $(selector).each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (isValidImageUrl(src)) {
        const url = resolveUrl(src, baseUrl);
        teamImages.push(url);
        allImages.add(url);
      }
    });
  });

  // Extract testimonial images
  const testimonialSelectors = [
    '.testimonial img',
    '.review img',
    '.testimonials img',
    '[class*="testimonial"] img',
    '.customer-review img',
    '.client-image img',
  ];

  testimonialSelectors.forEach(selector => {
    $(selector).each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (isValidImageUrl(src)) {
        const url = resolveUrl(src, baseUrl);
        testimonialImages.push(url);
        allImages.add(url);
      }
    });
  });

  // Extract all remaining images for gallery
  $('img').each((_, elem) => {
    const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy-src');
    if (isValidImageUrl(src)) {
      const fullUrl = resolveUrl(src, baseUrl);
      allImages.add(fullUrl);

      // Add to gallery if not already categorized
      if (
        fullUrl !== logo &&
        fullUrl !== hero &&
        !productImages.some(p => p.url === fullUrl) &&
        !teamImages.includes(fullUrl) &&
        !testimonialImages.includes(fullUrl)
      ) {
        galleryImages.push(fullUrl);
      }
    }
  });

  // Also check for srcset images
  $('img[srcset], source[srcset]').each((_, elem) => {
    const srcset = $(elem).attr('srcset');
    if (srcset) {
      // Parse srcset and get highest resolution
      const sources = srcset.split(',').map(s => s.trim().split(' ')[0]);
      sources.forEach(src => {
        if (isValidImageUrl(src)) {
          const url = resolveUrl(src, baseUrl);
          allImages.add(url);
        }
      });
    }
  });

  // Check picture elements
  $('picture source').each((_, elem) => {
    const srcset = $(elem).attr('srcset');
    if (srcset) {
      const src = srcset.split(',')[0].trim().split(' ')[0];
      if (isValidImageUrl(src)) {
        const url = resolveUrl(src, baseUrl);
        allImages.add(url);
      }
    }
  });

  return {
    logo,
    favicon,
    hero,
    banner: banner || hero, // Use hero as banner fallback
    ogImage,
    gallery: galleryImages.slice(0, 20),
    products: productImages.slice(0, 30),
    backgrounds: backgroundImages.slice(0, 10),
    team: teamImages.slice(0, 10),
    testimonials: testimonialImages.slice(0, 10),
    all: Array.from(allImages).slice(0, 50),
  };
}

/**
 * Detect e-commerce presence and platform
 */
function detectEcommerce(
  $: cheerio.CheerioAPI,
  content: { headings: string[]; paragraphs: string[]; keywords: string[] },
  detectedType: string
): { hasEcommerce: boolean; ecommerceData?: WebsiteAnalysis['ecommerceData'] } {
  let hasEcommerce = detectedType === 'ecommerce';
  let platform: string | undefined;
  let productCount = 0;
  const categories: string[] = [];
  let currency: string | undefined;

  // Detect platform from meta tags and scripts
  const html = $.html().toLowerCase();

  // WooCommerce detection
  if (html.includes('woocommerce') || html.includes('wc-') || $('[class*="woocommerce"]').length > 0) {
    hasEcommerce = true;
    platform = 'WooCommerce';
  }

  // Shopify detection
  if (html.includes('shopify') || html.includes('cdn.shopify') || $('[data-shopify]').length > 0) {
    hasEcommerce = true;
    platform = 'Shopify';
  }

  // Magento detection
  if (html.includes('magento') || html.includes('mage-') || $('[data-mage-init]').length > 0) {
    hasEcommerce = true;
    platform = 'Magento';
  }

  // BigCommerce detection
  if (html.includes('bigcommerce') || html.includes('cdn.bcapp')) {
    hasEcommerce = true;
    platform = 'BigCommerce';
  }

  // PrestaShop detection
  if (html.includes('prestashop')) {
    hasEcommerce = true;
    platform = 'PrestaShop';
  }

  // Squarespace Commerce
  if (html.includes('squarespace') && (html.includes('sqs-add-to-cart') || html.includes('product-price'))) {
    hasEcommerce = true;
    platform = 'Squarespace Commerce';
  }

  // General e-commerce indicators
  const ecommerceIndicators = [
    '.add-to-cart',
    '.add_to_cart',
    '[data-add-to-cart]',
    '.cart-button',
    '.buy-now',
    '.purchase-button',
    '.product-price',
    '.shopping-cart',
    '#cart',
    '.checkout',
  ];

  for (const selector of ecommerceIndicators) {
    if ($(selector).length > 0) {
      hasEcommerce = true;
      break;
    }
  }

  // Count products
  const productSelectors = ['.product', '.product-card', '[class*="product-item"]', '.woocommerce-loop-product'];
  productSelectors.forEach(selector => {
    productCount = Math.max(productCount, $(selector).length);
  });

  // Extract categories
  const categorySelectors = [
    '.product-category',
    '.product-categories a',
    '[class*="category"] a',
    '.shop-category',
  ];

  categorySelectors.forEach(selector => {
    $(selector).each((_, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length < 50 && !categories.includes(text)) {
        categories.push(text);
      }
    });
  });

  // Detect currency
  const priceText = $('.price, .product-price, [class*="price"]').first().text();
  if (priceText.includes('$')) currency = 'USD';
  else if (priceText.includes('€')) currency = 'EUR';
  else if (priceText.includes('£')) currency = 'GBP';
  else if (priceText.includes('¥')) currency = 'JPY';
  else if (priceText.includes('₹')) currency = 'INR';
  else if (priceText.includes('A$')) currency = 'AUD';
  else if (priceText.includes('C$')) currency = 'CAD';

  if (!hasEcommerce) {
    return { hasEcommerce: false };
  }

  return {
    hasEcommerce,
    ecommerceData: {
      platform,
      productCount: productCount > 0 ? productCount : undefined,
      categories: categories.length > 0 ? categories.slice(0, 10) : undefined,
      currency,
    },
  };
}

/**
 * Extract navigation pages
 */
function extractPages($: cheerio.CheerioAPI, baseUrl: string): Array<{ title: string; url: string }> {
  const pages: Array<{ title: string; url: string }> = [];
  const seenUrls = new Set<string>();

  $('nav a, header a, .navigation a, .menu a').each((_, elem) => {
    const href = $(elem).attr('href');
    const text = $(elem).text().trim();

    if (href && text && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      const fullUrl = resolveUrl(href, baseUrl);

      if (!seenUrls.has(fullUrl) && text.length > 0 && text.length < 50) {
        seenUrls.add(fullUrl);
        pages.push({
          title: text,
          url: fullUrl,
        });
      }
    }
  });

  return pages.slice(0, 10);
}

/**
 * Detect business type from content
 */
function detectBusinessType(
  content: { headings: string[]; paragraphs: string[]; keywords: string[] },
  title: string,
  description: string
): { detectedType: string; keywords: string[] } {
  const allText = [
    title,
    description,
    ...content.headings,
    ...content.paragraphs.slice(0, 3),
    ...content.keywords,
  ].join(' ').toLowerCase();

  const businessTypes = [
    { type: 'restaurant', keywords: ['restaurant', 'menu', 'food', 'dining', 'cuisine', 'chef', 'reservations'] },
    { type: 'ecommerce', keywords: ['shop', 'store', 'buy', 'product', 'cart', 'price', 'sale'] },
    { type: 'portfolio', keywords: ['portfolio', 'work', 'project', 'design', 'creative', 'showcase'] },
    { type: 'agency', keywords: ['agency', 'marketing', 'services', 'solutions', 'consulting', 'strategy'] },
    { type: 'saas', keywords: ['software', 'platform', 'solution', 'integration', 'api', 'cloud'] },
    { type: 'real-estate', keywords: ['property', 'real estate', 'homes', 'listings', 'agents', 'broker'] },
    { type: 'healthcare', keywords: ['health', 'medical', 'doctor', 'clinic', 'hospital', 'care', 'treatment'] },
    { type: 'education', keywords: ['education', 'learning', 'course', 'training', 'school', 'university'] },
    { type: 'fitness', keywords: ['fitness', 'gym', 'workout', 'training', 'exercise', 'health'] },
    { type: 'legal', keywords: ['legal', 'law', 'attorney', 'lawyer', 'firm', 'practice'] },
  ];

  let bestMatch = { type: 'business', score: 0, keywords: [] as string[] };

  for (const businessType of businessTypes) {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of businessType.keywords) {
      if (allText.includes(keyword)) {
        score++;
        matchedKeywords.push(keyword);
      }
    }

    if (score > bestMatch.score) {
      bestMatch = {
        type: businessType.type,
        score,
        keywords: matchedKeywords,
      };
    }
  }

  return {
    detectedType: bestMatch.type,
    keywords: bestMatch.keywords,
  };
}

/**
 * Helper: Resolve relative URLs to absolute
 */
function resolveUrl(url: string, baseUrl: string): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const base = new URL(baseUrl);
    if (url.startsWith('//')) {
      return `${base.protocol}${url}`;
    }

    if (url.startsWith('/')) {
      return `${base.origin}${url}`;
    }

    return new URL(url, baseUrl).href;
  } catch (error) {
    return url;
  }
}

/**
 * Helper: Check if word is common/stop word
 */
function isCommonWord(word: string): boolean {
  const common = new Set(['about', 'after', 'before', 'from', 'have', 'here', 'into', 'more', 'most', 'other', 'over', 'some', 'such', 'than', 'that', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'under', 'very', 'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your']);
  return common.has(word);
}
