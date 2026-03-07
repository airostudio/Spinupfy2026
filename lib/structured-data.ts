/**
 * Structured Data (Schema.org JSON-LD) Utilities
 * Generates rich search result markup for better SEO
 */

export interface Organization {
  name: string
  url: string
  logo?: string
  description?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  contactPoint?: {
    telephone?: string
    email?: string
    contactType?: string
  }
  sameAs?: string[] // Social media profiles
}

export interface LocalBusiness extends Organization {
  '@type': 'LocalBusiness' | 'Restaurant' | 'Store' | 'ProfessionalService'
  priceRange?: string
  openingHours?: string[]
  geo?: {
    latitude: number
    longitude: number
  }
}

export interface Product {
  name: string
  description: string
  image: string[]
  brand?: string
  sku?: string
  offers: {
    price: number
    priceCurrency: string
    availability: 'InStock' | 'OutOfStock' | 'PreOrder'
    url?: string
  }
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
}

export interface WebPage {
  name: string
  description: string
  url: string
  breadcrumb?: {
    itemListElement: Array<{
      name: string
      item: string
      position: number
    }>
  }
}

/**
 * Generate Organization schema markup
 */
export function generateOrganizationSchema(org: Organization) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
  }

  if (org.logo) {
    schema.logo = {
      '@type': 'ImageObject',
      url: org.logo,
    }
  }

  if (org.description) {
    schema.description = org.description
  }

  if (org.address) {
    schema.address = {
      '@type': 'PostalAddress',
      ...org.address,
    }
  }

  if (org.contactPoint) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      ...org.contactPoint,
    }
  }

  if (org.sameAs && org.sameAs.length > 0) {
    schema.sameAs = org.sameAs
  }

  return schema
}

/**
 * Generate LocalBusiness schema markup
 */
export function generateLocalBusinessSchema(business: LocalBusiness) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': business['@type'] || 'LocalBusiness',
    name: business.name,
    url: business.url,
  }

  if (business.logo) {
    schema.image = business.logo
  }

  if (business.description) {
    schema.description = business.description
  }

  if (business.address) {
    schema.address = {
      '@type': 'PostalAddress',
      ...business.address,
    }
  }

  if (business.contactPoint) {
    schema.telephone = business.contactPoint.telephone
    schema.email = business.contactPoint.email
  }

  if (business.priceRange) {
    schema.priceRange = business.priceRange
  }

  if (business.openingHours) {
    schema.openingHoursSpecification = business.openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours,
    }))
  }

  if (business.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    }
  }

  if (business.sameAs) {
    schema.sameAs = business.sameAs
  }

  return schema
}

/**
 * Generate Product schema markup
 */
export function generateProductSchema(product: Product) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
  }

  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brand,
    }
  }

  if (product.sku) {
    schema.sku = product.sku
  }

  schema.offers = {
    '@type': 'Offer',
    price: product.offers.price.toFixed(2),
    priceCurrency: product.offers.priceCurrency,
    availability: `https://schema.org/${product.offers.availability}`,
  }

  if (product.offers.url) {
    schema.offers.url = product.offers.url
  }

  if (product.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.aggregateRating.ratingValue,
      reviewCount: product.aggregateRating.reviewCount,
    }
  }

  return schema
}

/**
 * Generate WebPage schema markup
 */
export function generateWebPageSchema(page: WebPage) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    description: page.description,
    url: page.url,
  }

  if (page.breadcrumb) {
    schema.breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumb.itemListElement.map((item, index) => ({
        '@type': 'ListItem',
        position: item.position || index + 1,
        name: item.name,
        item: item.item,
      })),
    }
  }

  return schema
}

/**
 * Generate BreadcrumbList schema markup
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}
