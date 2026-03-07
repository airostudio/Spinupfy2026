/**
 * Deep Website Crawler
 * Crawls websites up to 3 levels deep to extract comprehensive content,
 * styling, images, and structure for full website reproduction
 */

import * as cheerio from 'cheerio';
import { WebsiteAnalysisError } from './website-analyzer';

// Types for the crawler
export interface CrawledPage {
  url: string;
  path: string;
  title: string;
  level: number;
  content: PageContent;
  images: PageImages;
  colors: ExtractedColors;
  links: string[];
}

export interface PageContent {
  metaTitle: string;
  metaDescription: string;
  headings: Array<{ level: number; text: string }>;
  paragraphs: string[];
  lists: string[][];
  sections: PageSection[];
}

export interface PageSection {
  type: 'hero' | 'features' | 'about' | 'services' | 'testimonials' | 'gallery' | 'contact' | 'cta' | 'content' | 'unknown';
  title?: string;
  subtitle?: string;
  content: string;
  images: string[];
  links: Array<{ text: string; href: string }>;
}

export interface PageImages {
  hero?: string;
  logo?: string;
  gallery: string[];
  backgrounds: string[];
  content: string[];
  all: string[];
}

export interface ExtractedColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
  gradients: string[];
  allColors: string[];
}

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

export interface DeepCrawlResult {
  baseUrl: string;
  title: string;
  description: string;
  pages: CrawledPage[];
  navigation: NavigationItem[];
  globalColors: ExtractedColors;
  globalImages: {
    logo?: string;
    favicon?: string;
    ogImage?: string;
    allImages: string[];
  };
  fonts: {
    heading: string;
    body: string;
  };
  detectedType: string;
  structure: PageStructure[];
}

export interface PageStructure {
  path: string;
  title: string;
  level: number;
  children: PageStructure[];
}

export interface CrawlOptions {
  maxDepth?: number;
  maxPages?: number;
  maxTimeMs?: number;
  delayMs?: number;
  onProgress?: (message: string, current: number, total: number) => void;
}

/**
 * Deep crawl a website up to specified depth
 * Includes throttling to prevent timeouts on serverless functions
 */
export async function deepCrawlWebsite(
  url: string,
  maxDepthOrOptions?: number | CrawlOptions,
  onProgress?: (message: string, current: number, total: number) => void
): Promise<DeepCrawlResult> {
  // Handle both old signature and new options object
  const options: CrawlOptions = typeof maxDepthOrOptions === 'number'
    ? { maxDepth: maxDepthOrOptions, onProgress }
    : { ...maxDepthOrOptions, onProgress: maxDepthOrOptions?.onProgress || onProgress };

  const maxDepth = options.maxDepth ?? 3;
  const maxPages = options.maxPages ?? 15; // Reduced from 50 to prevent timeouts
  const maxTimeMs = options.maxTimeMs ?? 120000; // 2 minutes max for crawling
  const delayMs = options.delayMs ?? 150; // Reduced from 200ms
  const progressCallback = options.onProgress;

  const baseUrl = new URL(url);
  const visited = new Set<string>();
  const pages: CrawledPage[] = [];
  const allColors: ExtractedColors = {
    gradients: [],
    allColors: [],
  };
  const allImages: string[] = [];

  // Queue for BFS crawling with depth tracking
  const queue: Array<{ url: string; level: number }> = [{ url: normalizeUrl(url, baseUrl), level: 0 }];

  let globalNavigation: NavigationItem[] = [];
  let globalFonts = { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' };
  let globalLogo: string | undefined;
  let globalFavicon: string | undefined;
  let globalOgImage: string | undefined;
  let globalTitle = '';
  let globalDescription = '';
  let detectedType = 'business';

  let processed = 0;
  const startTime = Date.now();

  while (queue.length > 0 && pages.length < maxPages) {
    // Check if we've exceeded the time limit
    if (Date.now() - startTime > maxTimeMs) {
      console.log(`Crawl time limit reached (${maxTimeMs}ms). Stopping with ${pages.length} pages.`);
      break;
    }
    const current = queue.shift()!;
    const normalizedUrl = normalizeUrl(current.url, baseUrl);

    // Skip if already visited or exceeds depth
    if (visited.has(normalizedUrl) || current.level > maxDepth) {
      continue;
    }

    // Only crawl same-domain pages
    if (!isSameDomain(normalizedUrl, baseUrl)) {
      continue;
    }

    visited.add(normalizedUrl);
    processed++;

    if (progressCallback) {
      progressCallback(`Crawling: ${normalizedUrl}`, processed, Math.min(visited.size + queue.length, maxPages));
    }

    try {
      const pageData = await fetchAndParsePage(normalizedUrl, baseUrl);

      if (!pageData) continue;

      // Store page data
      pages.push({
        url: normalizedUrl,
        path: getPathFromUrl(normalizedUrl, baseUrl),
        title: pageData.title,
        level: current.level,
        content: pageData.content,
        images: pageData.images,
        colors: pageData.colors,
        links: pageData.links,
      });

      // Merge colors
      mergeColors(allColors, pageData.colors);

      // Collect images
      allImages.push(...pageData.images.all);

      // Extract navigation and global data from homepage
      if (current.level === 0) {
        globalNavigation = pageData.navigation;
        globalFonts = pageData.fonts;
        globalLogo = pageData.images.logo;
        globalFavicon = pageData.favicon;
        globalOgImage = pageData.ogImage;
        globalTitle = pageData.title;
        globalDescription = pageData.description;
        detectedType = pageData.detectedType;
      }

      // Add new links to queue for next level
      if (current.level < maxDepth) {
        for (const link of pageData.links) {
          const linkUrl = normalizeUrl(link, baseUrl);
          if (!visited.has(linkUrl) && isSameDomain(linkUrl, baseUrl) && isValidPageLink(linkUrl)) {
            queue.push({ url: linkUrl, level: current.level + 1 });
          }
        }
      }

      // Small delay to be respectful (reduced for performance)
      await delay(delayMs);
    } catch (error) {
      console.error(`Error crawling ${normalizedUrl}:`, error);
      continue;
    }
  }

  console.log(`Crawl completed in ${Date.now() - startTime}ms. Found ${pages.length} pages.`);

  // Build page structure tree
  const structure = buildPageStructure(pages);

  // Deduplicate images
  const uniqueImages = [...new Set(allImages)];

  return {
    baseUrl: baseUrl.origin,
    title: globalTitle,
    description: globalDescription,
    pages,
    navigation: globalNavigation,
    globalColors: allColors,
    globalImages: {
      logo: globalLogo,
      favicon: globalFavicon,
      ogImage: globalOgImage,
      allImages: uniqueImages,
    },
    fonts: globalFonts,
    detectedType,
    structure,
  };
}

/**
 * Fetch and parse a single page
 */
async function fetchAndParsePage(url: string, baseUrl: URL): Promise<{
  title: string;
  description: string;
  content: PageContent;
  images: PageImages;
  colors: ExtractedColors;
  links: string[];
  navigation: NavigationItem[];
  fonts: { heading: string; body: string };
  favicon?: string;
  ogImage?: string;
  detectedType: string;
} | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const html = await response.text();
    if (!html || html.trim().length < 100) return null;

    const $ = cheerio.load(html);

    // Extract all data
    const title = extractTitle($);
    const description = extractDescription($);
    const content = extractPageContent($, url, baseUrl);
    const images = extractPageImages($, url, baseUrl);
    const colors = extractPageColors($);
    const links = extractInternalLinks($, url, baseUrl);
    const navigation = extractNavigation($, url, baseUrl);
    const fonts = extractFonts($);
    const favicon = extractFavicon($, url, baseUrl);
    const ogImage = extractOgImage($, url, baseUrl);
    const detectedType = detectBusinessType($, title, description);

    return {
      title,
      description,
      content,
      images,
      colors,
      links,
      navigation,
      fonts,
      favicon,
      ogImage,
      detectedType,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Extract page title
 */
function extractTitle($: cheerio.CheerioAPI): string {
  return $('title').text().trim() ||
         $('meta[property="og:title"]').attr('content')?.trim() ||
         $('h1').first().text().trim() ||
         '';
}

/**
 * Extract page description
 */
function extractDescription($: cheerio.CheerioAPI): string {
  return $('meta[name="description"]').attr('content')?.trim() ||
         $('meta[property="og:description"]').attr('content')?.trim() ||
         $('p').first().text().trim().substring(0, 200) ||
         '';
}

/**
 * Extract comprehensive page content
 */
function extractPageContent($: cheerio.CheerioAPI, pageUrl: string, baseUrl: URL): PageContent {
  const headings: Array<{ level: number; text: string }> = [];
  const paragraphs: string[] = [];
  const lists: string[][] = [];
  const sections: PageSection[] = [];

  // Extract headings
  $('h1, h2, h3, h4, h5, h6').each((_, elem) => {
    const text = $(elem).text().trim();
    const level = parseInt(elem.tagName.replace('h', ''), 10);
    if (text && text.length > 2 && text.length < 300) {
      headings.push({ level, text });
    }
  });

  // Extract paragraphs
  $('p').each((_, elem) => {
    const text = $(elem).text().trim();
    if (text && text.length > 20 && text.length < 2000) {
      paragraphs.push(text);
    }
  });

  // Extract lists
  $('ul, ol').each((_, elem) => {
    const items: string[] = [];
    $(elem).find('li').each((_, li) => {
      const text = $(li).text().trim();
      if (text && text.length > 2 && text.length < 500) {
        items.push(text);
      }
    });
    if (items.length > 0) {
      lists.push(items);
    }
  });

  // Try to identify and extract semantic sections
  const sectionSelectors = [
    { selector: 'section', type: 'unknown' },
    { selector: '[class*="hero"]', type: 'hero' },
    { selector: '[class*="banner"]', type: 'hero' },
    { selector: '[class*="feature"]', type: 'features' },
    { selector: '[class*="service"]', type: 'services' },
    { selector: '[class*="about"]', type: 'about' },
    { selector: '[class*="testimonial"]', type: 'testimonials' },
    { selector: '[class*="review"]', type: 'testimonials' },
    { selector: '[class*="gallery"]', type: 'gallery' },
    { selector: '[class*="portfolio"]', type: 'gallery' },
    { selector: '[class*="contact"]', type: 'contact' },
    { selector: '[class*="cta"]', type: 'cta' },
  ];

  const processedSelectors = new Set<string>();

  for (const { selector, type } of sectionSelectors) {
    $(selector).each((idx, elem) => {
      // Create a unique key for this element based on its content
      const elementKey = `${selector}-${idx}-${$(elem).text().substring(0, 50)}`;
      if (processedSelectors.has(elementKey)) return;
      processedSelectors.add(elementKey);

      const $section = $(elem);
      const sectionTitle = $section.find('h1, h2, h3').first().text().trim();
      const sectionSubtitle = $section.find('h2, h3, h4').eq(1).text().trim();
      const sectionContent = $section.text().trim().substring(0, 1000);

      const sectionImages: string[] = [];
      $section.find('img').each((_, img) => {
        const src = $(img).attr('src') || $(img).attr('data-src');
        if (src && isValidImageUrl(src)) {
          sectionImages.push(resolveUrl(src, pageUrl, baseUrl));
        }
      });

      const sectionLinks: Array<{ text: string; href: string }> = [];
      $section.find('a').each((_, a) => {
        const href = $(a).attr('href');
        const text = $(a).text().trim();
        if (href && text && !href.startsWith('#')) {
          sectionLinks.push({ text, href: resolveUrl(href, pageUrl, baseUrl) });
        }
      });

      sections.push({
        type: type as PageSection['type'],
        title: sectionTitle || undefined,
        subtitle: sectionSubtitle || undefined,
        content: sectionContent,
        images: sectionImages,
        links: sectionLinks,
      });
    });
  }

  return {
    metaTitle: $('title').text().trim(),
    metaDescription: $('meta[name="description"]').attr('content')?.trim() || '',
    headings,
    paragraphs: paragraphs.slice(0, 30),
    lists: lists.slice(0, 10),
    sections: sections.slice(0, 20),
  };
}

/**
 * Extract all images from a page with categorization
 */
function extractPageImages($: cheerio.CheerioAPI, pageUrl: string, baseUrl: URL): PageImages {
  const allImages: string[] = [];
  const galleryImages: string[] = [];
  const backgroundImages: string[] = [];
  const contentImages: string[] = [];
  let heroImage: string | undefined;
  let logo: string | undefined;

  // Extract logo
  const logoSelectors = [
    'img[class*="logo"]',
    'img[alt*="logo" i]',
    'img[id*="logo"]',
    '.logo img',
    '#logo img',
    'header img:first-of-type',
    '.navbar-brand img',
    'a[class*="logo"] img',
  ];

  for (const selector of logoSelectors) {
    if (logo) break;
    $(selector).each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (src && isValidImageUrl(src) && !logo) {
        logo = resolveUrl(src, pageUrl, baseUrl);
      }
    });
  }

  // Extract hero image
  const heroSelectors = [
    '[class*="hero"] img',
    '[class*="banner"] img',
    '.hero img',
    '.hero-section img',
    '.jumbotron img',
    '.slider img:first-of-type',
    '.carousel img:first-of-type',
  ];

  for (const selector of heroSelectors) {
    if (heroImage) break;
    $(selector).each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (src && isValidImageUrl(src) && !heroImage && src !== logo) {
        heroImage = resolveUrl(src, pageUrl, baseUrl);
      }
    });
  }

  // Extract background images
  $('[style*="background"]').each((_, elem) => {
    const style = $(elem).attr('style') || '';
    const bgMatch = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (bgMatch && bgMatch[1] && isValidImageUrl(bgMatch[1])) {
      const bgUrl = resolveUrl(bgMatch[1], pageUrl, baseUrl);
      backgroundImages.push(bgUrl);
      if (!heroImage && backgroundImages.length === 1) {
        heroImage = bgUrl;
      }
    }
  });

  // Extract gallery images
  const gallerySelectors = [
    '.gallery img',
    '.portfolio img',
    '[class*="gallery"] img',
    '[class*="portfolio"] img',
    '.grid img',
    '.masonry img',
  ];

  gallerySelectors.forEach(selector => {
    $(selector).each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (src && isValidImageUrl(src)) {
        const url = resolveUrl(src, pageUrl, baseUrl);
        if (!galleryImages.includes(url)) {
          galleryImages.push(url);
        }
      }
    });
  });

  // Extract all other images
  $('img').each((_, elem) => {
    const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy-src');
    if (src && isValidImageUrl(src)) {
      const url = resolveUrl(src, pageUrl, baseUrl);
      if (!allImages.includes(url)) {
        allImages.push(url);
      }
      if (url !== logo && url !== heroImage && !galleryImages.includes(url)) {
        contentImages.push(url);
      }
    }
  });

  // Check srcset
  $('img[srcset], source[srcset]').each((_, elem) => {
    const srcset = $(elem).attr('srcset');
    if (srcset) {
      const sources = srcset.split(',').map(s => s.trim().split(' ')[0]);
      sources.forEach(src => {
        if (src && isValidImageUrl(src)) {
          const url = resolveUrl(src, pageUrl, baseUrl);
          if (!allImages.includes(url)) {
            allImages.push(url);
          }
        }
      });
    }
  });

  return {
    hero: heroImage,
    logo,
    gallery: galleryImages.slice(0, 30),
    backgrounds: backgroundImages.slice(0, 15),
    content: contentImages.slice(0, 30),
    all: allImages.slice(0, 100),
  };
}

/**
 * Extract comprehensive color scheme from page
 */
function extractPageColors($: cheerio.CheerioAPI): ExtractedColors {
  const colors: ExtractedColors = {
    gradients: [],
    allColors: [],
  };

  const foundColors: string[] = [];

  // Extract from CSS variables
  const styleContent = $('style').text();

  // Look for CSS custom properties
  const cssVarPatterns = [
    /--(?:primary|main|brand)[^:]*:\s*(#[0-9A-Fa-f]{3,8}|rgb[a]?\([^)]+\))/gi,
    /--(?:secondary|accent)[^:]*:\s*(#[0-9A-Fa-f]{3,8}|rgb[a]?\([^)]+\))/gi,
    /--(?:background|bg)[^:]*:\s*(#[0-9A-Fa-f]{3,8}|rgb[a]?\([^)]+\))/gi,
    /--(?:text|foreground)[^:]*:\s*(#[0-9A-Fa-f]{3,8}|rgb[a]?\([^)]+\))/gi,
  ];

  cssVarPatterns.forEach(pattern => {
    const matches = styleContent.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const colorMatch = match.match(/(#[0-9A-Fa-f]{3,8}|rgb[a]?\([^)]+\))/);
        if (colorMatch) {
          foundColors.push(colorMatch[1]);
        }
      });
    }
  });

  // Extract gradients
  const gradientPattern = /linear-gradient\([^)]+\)|radial-gradient\([^)]+\)/gi;
  const gradientMatches = styleContent.match(gradientPattern);
  if (gradientMatches) {
    colors.gradients = gradientMatches.slice(0, 5);
  }

  // Extract from theme-color meta tag
  const themeColor = $('meta[name="theme-color"]').attr('content');
  if (themeColor && isValidColor(themeColor)) {
    foundColors.push(themeColor);
    colors.primary = themeColor;
  }

  // Extract from buttons
  $('button, .btn, a.button, [class*="button"]').each((_, elem) => {
    const style = $(elem).attr('style') || '';
    const bgMatch = style.match(/background(?:-color)?:\s*(#[0-9A-Fa-f]{3,8}|rgb[a]?\([^)]+\))/i);
    if (bgMatch && bgMatch[1] && isValidColor(bgMatch[1])) {
      foundColors.push(bgMatch[1]);
    }
  });

  // Extract from headers
  $('h1, h2, h3').each((_, elem) => {
    const style = $(elem).attr('style') || '';
    const colorMatch = style.match(/(?:^|;)\s*color:\s*(#[0-9A-Fa-f]{3,8}|rgb[a]?\([^)]+\))/i);
    if (colorMatch && colorMatch[1] && isValidColor(colorMatch[1])) {
      foundColors.push(colorMatch[1]);
    }
  });

  // Extract from links
  $('a').slice(0, 10).each((_, elem) => {
    const style = $(elem).attr('style') || '';
    const colorMatch = style.match(/color:\s*(#[0-9A-Fa-f]{3,8}|rgb[a]?\([^)]+\))/i);
    if (colorMatch && colorMatch[1] && isValidColor(colorMatch[1])) {
      foundColors.push(colorMatch[1]);
    }
  });

  // Extract from body/main backgrounds
  const bodyBg = $('body').attr('style')?.match(/background(?:-color)?:\s*(#[0-9A-Fa-f]{3,8}|rgb[a]?\([^)]+\))/i);
  if (bodyBg && bodyBg[1]) {
    colors.background = bodyBg[1];
    foundColors.push(bodyBg[1]);
  }

  // Deduplicate and categorize colors
  const uniqueColors = [...new Set(foundColors)];
  colors.allColors = uniqueColors;

  // Try to categorize colors if not already set
  if (!colors.primary && uniqueColors.length > 0) {
    colors.primary = uniqueColors[0];
  }
  if (!colors.secondary && uniqueColors.length > 1) {
    colors.secondary = uniqueColors[1];
  }
  if (!colors.accent && uniqueColors.length > 2) {
    colors.accent = uniqueColors[2];
  }

  return colors;
}

/**
 * Extract internal links from page
 */
function extractInternalLinks($: cheerio.CheerioAPI, pageUrl: string, baseUrl: URL): string[] {
  const links: string[] = [];
  const seen = new Set<string>();

  $('a[href]').each((_, elem) => {
    const href = $(elem).attr('href');
    if (!href) return;

    // Skip non-page links
    if (href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.includes('.pdf') ||
        href.includes('.doc') ||
        href.includes('.zip')) {
      return;
    }

    const resolved = resolveUrl(href, pageUrl, baseUrl);
    if (isSameDomain(resolved, baseUrl) && !seen.has(resolved)) {
      seen.add(resolved);
      links.push(resolved);
    }
  });

  return links;
}

/**
 * Extract navigation structure
 */
function extractNavigation($: cheerio.CheerioAPI, pageUrl: string, baseUrl: URL): NavigationItem[] {
  const navigation: NavigationItem[] = [];
  const seenHrefs = new Set<string>();

  // Find main navigation
  const navSelectors = [
    'nav ul > li > a',
    'header nav a',
    '.navigation a',
    '.nav-menu a',
    '.main-menu a',
    '#main-nav a',
    '.navbar-nav a',
  ];

  for (const selector of navSelectors) {
    $(selector).each((_, elem) => {
      const $link = $(elem);
      const href = $link.attr('href');
      const text = $link.text().trim();

      if (!href || !text || text.length > 50 || seenHrefs.has(href)) return;

      // Skip non-page links
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      seenHrefs.add(href);
      const resolvedHref = resolveUrl(href, pageUrl, baseUrl);

      // Check for dropdown/submenu
      const $parent = $link.parent();
      const children: NavigationItem[] = [];

      $parent.find('ul a, .dropdown-menu a, .submenu a').each((_, child) => {
        const childHref = $(child).attr('href');
        const childText = $(child).text().trim();
        if (childHref && childText && !seenHrefs.has(childHref)) {
          seenHrefs.add(childHref);
          children.push({
            label: childText,
            href: resolveUrl(childHref, pageUrl, baseUrl),
          });
        }
      });

      navigation.push({
        label: text,
        href: resolvedHref,
        children: children.length > 0 ? children : undefined,
      });
    });

    if (navigation.length >= 3) break; // Found enough navigation items
  }

  return navigation.slice(0, 10);
}

/**
 * Extract fonts from page
 */
function extractFonts($: cheerio.CheerioAPI): { heading: string; body: string } {
  let headingFont = 'Inter, sans-serif';
  let bodyFont = 'Inter, sans-serif';

  // Check Google Fonts links
  $('link[href*="fonts.googleapis.com"]').each((_, elem) => {
    const href = $(elem).attr('href') || '';
    const familyMatch = href.match(/family=([^:&]+)/);
    if (familyMatch) {
      const fontFamily = familyMatch[1].replace(/\+/g, ' ');
      if (!headingFont.startsWith(fontFamily)) {
        headingFont = `${fontFamily}, sans-serif`;
      }
    }
  });

  // Extract from CSS
  const h1Font = $('h1').first().css('font-family');
  if (h1Font) {
    headingFont = h1Font.replace(/['"]/g, '').split(',')[0].trim() + ', sans-serif';
  }

  const bodyFontCss = $('body').css('font-family') || $('p').first().css('font-family');
  if (bodyFontCss) {
    bodyFont = bodyFontCss.replace(/['"]/g, '').split(',')[0].trim() + ', sans-serif';
  }

  return { heading: headingFont, body: bodyFont };
}

/**
 * Extract favicon
 */
function extractFavicon($: cheerio.CheerioAPI, pageUrl: string, baseUrl: URL): string | undefined {
  const faviconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
  ];

  for (const selector of faviconSelectors) {
    const href = $(selector).attr('href');
    if (href) {
      return resolveUrl(href, pageUrl, baseUrl);
    }
  }

  return undefined;
}

/**
 * Extract OG image
 */
function extractOgImage($: cheerio.CheerioAPI, pageUrl: string, baseUrl: URL): string | undefined {
  const ogImage = $('meta[property="og:image"]').attr('content') ||
                  $('meta[name="twitter:image"]').attr('content');

  if (ogImage) {
    return resolveUrl(ogImage, pageUrl, baseUrl);
  }

  return undefined;
}

/**
 * Detect business type from page content
 */
function detectBusinessType($: cheerio.CheerioAPI, title: string, description: string): string {
  const allText = [
    title,
    description,
    $('h1, h2, h3').text(),
    $('p').slice(0, 5).text(),
  ].join(' ').toLowerCase();

  const businessTypes = [
    { type: 'restaurant', keywords: ['restaurant', 'menu', 'food', 'dining', 'cuisine', 'chef', 'reservations', 'eat', 'dish'] },
    { type: 'ecommerce', keywords: ['shop', 'store', 'buy', 'product', 'cart', 'price', 'sale', 'order', 'shipping'] },
    { type: 'portfolio', keywords: ['portfolio', 'work', 'project', 'design', 'creative', 'showcase', 'gallery'] },
    { type: 'agency', keywords: ['agency', 'marketing', 'services', 'solutions', 'consulting', 'strategy', 'digital'] },
    { type: 'saas', keywords: ['software', 'platform', 'solution', 'integration', 'api', 'cloud', 'app', 'features'] },
    { type: 'real-estate', keywords: ['property', 'real estate', 'homes', 'listings', 'agents', 'broker', 'rent', 'buy'] },
    { type: 'healthcare', keywords: ['health', 'medical', 'doctor', 'clinic', 'hospital', 'care', 'treatment', 'patient'] },
    { type: 'education', keywords: ['education', 'learning', 'course', 'training', 'school', 'university', 'student'] },
    { type: 'fitness', keywords: ['fitness', 'gym', 'workout', 'training', 'exercise', 'health', 'class', 'membership'] },
    { type: 'legal', keywords: ['legal', 'law', 'attorney', 'lawyer', 'firm', 'practice', 'case', 'court'] },
    { type: 'beauty-spa', keywords: ['beauty', 'spa', 'salon', 'hair', 'nails', 'massage', 'treatment', 'facial'] },
    { type: 'hospitality', keywords: ['hotel', 'resort', 'booking', 'rooms', 'accommodation', 'stay', 'vacation'] },
  ];

  let bestMatch = { type: 'business', score: 0 };

  for (const bt of businessTypes) {
    let score = 0;
    for (const keyword of bt.keywords) {
      if (allText.includes(keyword)) {
        score++;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { type: bt.type, score };
    }
  }

  return bestMatch.type;
}

/**
 * Build hierarchical page structure
 */
function buildPageStructure(pages: CrawledPage[]): PageStructure[] {
  const structure: PageStructure[] = [];
  const pathMap = new Map<string, PageStructure>();

  // Sort by level then path
  const sortedPages = [...pages].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.path.localeCompare(b.path);
  });

  for (const page of sortedPages) {
    const pageStructure: PageStructure = {
      path: page.path,
      title: page.title,
      level: page.level,
      children: [],
    };

    pathMap.set(page.path, pageStructure);

    // Find parent
    const parentPath = getParentPath(page.path);
    const parent = pathMap.get(parentPath);

    if (parent) {
      parent.children.push(pageStructure);
    } else {
      structure.push(pageStructure);
    }
  }

  return structure;
}

// Utility functions

function normalizeUrl(url: string, baseUrl: URL): string {
  try {
    const resolved = new URL(url, baseUrl);
    // Remove trailing slash, hash, and query params for consistency
    let normalized = resolved.origin + resolved.pathname;
    if (normalized.endsWith('/') && normalized !== baseUrl.origin + '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url;
  }
}

function isSameDomain(url: string, baseUrl: URL): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === baseUrl.hostname;
  } catch {
    return false;
  }
}

function isValidPageLink(url: string): boolean {
  const excludePatterns = [
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|exe|dmg)$/i,
    /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i,
    /\.(mp3|mp4|avi|mov|wmv)$/i,
    /\.(css|js|json|xml)$/i,
    /^(mailto:|tel:|javascript:|data:)/i,
    /#.*/,
  ];

  return !excludePatterns.some(pattern => pattern.test(url));
}

function isValidImageUrl(src: string): boolean {
  if (!src) return false;
  if (src.includes('data:image')) return false;
  if (src.includes('placeholder')) return false;
  if (src.includes('spacer')) return false;
  if (src.includes('pixel')) return false;
  if (src.includes('tracking')) return false;
  if (src.includes('1x1')) return false;
  if (src.length < 10) return false;
  return true;
}

function isValidColor(color: string): boolean {
  if (!color) return false;
  // Check for hex
  if (/^#[0-9A-Fa-f]{3,8}$/.test(color)) return true;
  // Check for rgb/rgba
  if (/^rgba?\([^)]+\)$/.test(color)) return true;
  return false;
}

function resolveUrl(url: string, pageUrl: string, baseUrl: URL): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('//')) {
      return `${baseUrl.protocol}${url}`;
    }
    if (url.startsWith('/')) {
      return `${baseUrl.origin}${url}`;
    }
    return new URL(url, pageUrl).href;
  } catch {
    return url;
  }
}

function getPathFromUrl(url: string, baseUrl: URL): string {
  try {
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    if (path === '/' || path === '') return '/';
    if (path.endsWith('/')) path = path.slice(0, -1);
    return path;
  } catch {
    return '/';
  }
}

function getParentPath(path: string): string {
  if (path === '/' || path === '') return '/';
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 1) return '/';
  return '/' + parts.slice(0, -1).join('/');
}

function mergeColors(target: ExtractedColors, source: ExtractedColors): void {
  if (source.primary && !target.primary) target.primary = source.primary;
  if (source.secondary && !target.secondary) target.secondary = source.secondary;
  if (source.accent && !target.accent) target.accent = source.accent;
  if (source.background && !target.background) target.background = source.background;
  if (source.text && !target.text) target.text = source.text;

  target.gradients.push(...source.gradients);
  target.allColors.push(...source.allColors);

  // Deduplicate
  target.gradients = [...new Set(target.gradients)];
  target.allColors = [...new Set(target.allColors)];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
