/**
 * Link Extractor Utility
 * Scans website content and extracts all internal links that need pages
 * CRITICAL: Also extracts page links from navigation/header menu items
 */

import { Page, Section } from '../store/editor.store';

export interface ExtractedLink {
  href: string;
  slug: string;
  text: string;
  context: string;
  sourceSection: string;
}

/**
 * Checks if a link is internal (should generate a page)
 */
function isInternalLink(href: string): boolean {
  if (!href) return false;

  // Exclude external links
  if (href.startsWith('http://') || href.startsWith('https://')) return false;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (href.startsWith('#')) return false; // Anchor links
  if (href === '/') return false; // Homepage

  return true;
}

/**
 * Converts href to slug
 */
function hrefToSlug(href: string): string {
  // Remove leading slash and file extensions
  let slug = href.replace(/^\//, '').replace(/\.(html|htm)$/, '');

  // Convert to lowercase and remove special characters
  slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  // Remove consecutive dashes and trim
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');

  return slug || 'page';
}

/**
 * Recursively searches an object for href properties
 */
function extractHrefsFromObject(obj: any, links: ExtractedLink[], sectionType: string, context: string = ''): void {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    const value = obj[key];

    if (key === 'href' && typeof value === 'string' && isInternalLink(value)) {
      // Found an internal link
      const linkText = obj.text || obj.label || obj.title || '';
      links.push({
        href: value,
        slug: hrefToSlug(value),
        text: linkText,
        context: context || linkText,
        sourceSection: sectionType,
      });
    } else if (Array.isArray(value)) {
      // Recursively search arrays
      value.forEach((item, index) => {
        const itemContext = obj.title || context || `Item ${index + 1}`;
        extractHrefsFromObject(item, links, sectionType, itemContext);
      });
    } else if (typeof value === 'object') {
      // Recursively search nested objects
      const nestedContext = obj.title || obj.label || context;
      extractHrefsFromObject(value, links, sectionType, nestedContext);
    }
  }
}

/**
 * Extracts all internal links from a section
 * IMPORTANT: Special handling for HEADER sections to extract menu item links
 */
function extractLinksFromSection(section: Section): ExtractedLink[] {
  const links: ExtractedLink[] = [];

  if (!section.content) return links;

  // Special handling for HEADER sections - extract menu items explicitly
  if (section.type === 'HEADER' && section.content.menuItems) {
    console.log(`   🔍 [LINK EXTRACTOR] Found HEADER section with ${section.content.menuItems.length} menu items`)
    const menuItems = section.content.menuItems as Array<{ label: string; href: string; children?: Array<{ label: string; href: string }> }>;

    for (const item of menuItems) {
      // Extract main menu item
      if (isInternalLink(item.href)) {
        console.log(`      ✓ [MENU LINK] ${item.label} -> ${item.href}`)
        links.push({
          href: item.href,
          slug: hrefToSlug(item.href),
          text: item.label || '',
          context: `Navigation menu - ${item.label}`,
          sourceSection: 'HEADER',
        });
      }

      // Extract submenu items
      if (item.children) {
        for (const child of item.children) {
          if (isInternalLink(child.href)) {
            links.push({
              href: child.href,
              slug: hrefToSlug(child.href),
              text: child.label || '',
              context: `Navigation menu - ${item.label} > ${child.label}`,
              sourceSection: 'HEADER',
            });
          }
        }
      }
    }

    // Also extract CTA button link if present
    if (section.content.ctaHref && isInternalLink(section.content.ctaHref)) {
      links.push({
        href: section.content.ctaHref,
        slug: hrefToSlug(section.content.ctaHref),
        text: section.content.ctaText || 'CTA',
        context: `Header CTA button`,
        sourceSection: 'HEADER',
      });
    }
  }

  // Standard recursive extraction for all section types
  extractHrefsFromObject(section.content, links, section.type);

  return links;
}

/**
 * Extracts all internal links from a page
 */
export function extractLinksFromPage(page: Page): ExtractedLink[] {
  const links: ExtractedLink[] = [];

  for (const section of page.sections) {
    if (!section.visible) continue; // Skip hidden sections
    links.push(...extractLinksFromSection(section));
  }

  return links;
}

/**
 * Extracts all unique internal links from all pages in a website
 */
export function extractAllLinks(pages: Page[]): ExtractedLink[] {
  const allLinks: ExtractedLink[] = [];
  const uniqueSlugs = new Set<string>();

  for (const page of pages) {
    const pageLinks = extractLinksFromPage(page);

    for (const link of pageLinks) {
      // Only add unique slugs
      if (!uniqueSlugs.has(link.slug)) {
        uniqueSlugs.add(link.slug);
        allLinks.push(link);
      }
    }
  }

  return allLinks;
}

/**
 * Filters out links that already have existing pages
 */
export function filterMissingPages(links: ExtractedLink[], existingPages: Page[]): ExtractedLink[] {
  const existingSlugs = new Set(existingPages.map(p => p.slug));
  const existingPaths = new Set(existingPages.map(p => p.path));

  return links.filter(link => {
    // Check if page already exists by slug or path
    if (existingSlugs.has(link.slug)) return false;
    if (existingPaths.has(link.href)) return false;
    if (existingPaths.has('/' + link.slug)) return false;

    return true;
  });
}

/**
 * Groups links by their context/category for better organization
 */
export function groupLinksByContext(links: ExtractedLink[]): Record<string, ExtractedLink[]> {
  const groups: Record<string, ExtractedLink[]> = {};

  for (const link of links) {
    const category = link.sourceSection || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(link);
  }

  return groups;
}
