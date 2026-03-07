/**
 * Menu Link Converter Utility
 * Converts anchor links to page links when multiple pages are created
 * Ensures menu navigation works correctly for multi-page websites
 */

import { MenuItemConfig } from '../config/menu-content'

export interface PageInfo {
  slug: string
  path: string
  title: string
}

/**
 * Converts anchor links in menu to page links based on existing pages
 *
 * Example:
 * - Input: { label: 'About', href: '#about' }
 * - Output: { label: 'About', href: '/about' } (if /about page exists)
 *
 * @param menuItems - Menu items with potential anchor links
 * @param existingPages - Array of pages that have been created
 * @returns Menu items with anchor links converted to page links where applicable
 */
export function convertMenuLinksToPageLinks(
  menuItems: MenuItemConfig[],
  existingPages: PageInfo[]
): MenuItemConfig[] {
  // Create a map of section anchors to page paths
  const anchorToPageMap = new Map<string, string>()

  for (const page of existingPages) {
    // Skip homepage
    if (page.path === '/') continue

    // Map common section names to page paths
    // Examples: #about -> /about, #services -> /services, #contact -> /contact
    const sectionName = page.slug.toLowerCase()
    const anchorLink = `#${sectionName}`
    anchorToPageMap.set(anchorLink, page.path)

    // Also handle variations (e.g., #our-services -> /services)
    if (sectionName.includes('-')) {
      const simplified = sectionName.split('-').pop()
      if (simplified) {
        anchorToPageMap.set(`#${simplified}`, page.path)
      }
    }
  }

  // Convert menu items
  return menuItems.map(item => {
    // Keep children as-is (we can extend this later if needed)
    const children = item.children?.map(child => ({
      ...child,
      href: anchorToPageMap.get(child.href) || child.href
    }))

    // Convert anchor link to page link if page exists
    const newHref = anchorToPageMap.get(item.href) || item.href

    return {
      ...item,
      href: newHref,
      ...(children && { children })
    }
  })
}

/**
 * Extracts all links from menu items (including nested children)
 * Used to identify which pages need to be created
 *
 * @param menuItems - Menu items to extract links from
 * @returns Array of unique hrefs (page links only, not anchors or external)
 */
export function extractMenuPageLinks(menuItems: MenuItemConfig[]): string[] {
  const links = new Set<string>()

  function extractFromItems(items: MenuItemConfig[]) {
    for (const item of items) {
      // Only include page links (not anchors, not external URLs, not homepage)
      if (
        item.href &&
        item.href.startsWith('/') &&
        !item.href.startsWith('/#') &&
        item.href !== '/'
      ) {
        links.add(item.href)
      }

      // Recursively extract from children
      if (item.children) {
        extractFromItems(item.children)
      }
    }
  }

  extractFromItems(menuItems)
  return Array.from(links)
}

/**
 * Determines if we should use page links or anchor links based on site structure
 *
 * @param totalPages - Total number of pages in the website
 * @param hasSeparatePages - Whether separate pages are created (vs single-page with sections)
 * @returns true if should use page links, false if should use anchor links
 */
export function shouldUsePageLinks(totalPages: number, hasSeparatePages: boolean): boolean {
  // If multiple pages are created separately, use page links
  if (hasSeparatePages && totalPages > 1) {
    return true
  }

  // Otherwise, use anchor links for single-page sites
  return false
}
