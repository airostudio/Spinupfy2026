# Week 4 Implementation Plan: Advanced SEO & Final Optimizations

## Overview
Building on Weeks 1-3 (SEO foundations, accessibility, performance), Week 4 focuses on:
- **Structured Data** (Schema.org JSON-LD for rich search results)
- **Open Graph Images** (Dynamic social sharing previews)
- **Image Optimization** (Blur placeholders for better UX)
- **Security Headers** (Content Security Policy, etc.)
- **Performance Monitoring** (Web Vitals tracking)
- **Final Testing & Validation**

---

## 1. Structured Data (Schema.org JSON-LD)

### Problem
- Search engines can't understand page content semantically
- Missing rich snippets in search results
- No business/organization markup
- Lost opportunity for enhanced SERP features

### Solution: Add JSON-LD Structured Data

**For Homepage/Business Pages:**
```typescript
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Business Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "Business description",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-555-5555",
    "contactType": "customer service"
  }
}
```

**For Product Pages:**
```typescript
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "image": "https://example.com/product.jpg",
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

**Implementation Files:**
- `lib/structured-data.ts` - Helper functions
- `app/site/[slug]/page.tsx` - Add JSON-LD script tags
- `components/StructuredData.tsx` - Reusable component

---

## 2. Open Graph Image Generation

### Problem
- Generic social sharing previews
- No branded OG images for shared links
- Poor click-through rates from social media

### Solution: Dynamic OG Image Generation

**Approach:**
1. Use `@vercel/og` for dynamic image generation
2. Create API route: `/api/og?title=...&description=...`
3. Generate 1200x630 images with branding
4. Cache generated images

**Implementation:**
```typescript
// app/api/og/route.tsx
import { ImageResponse } from '@vercel/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const description = searchParams.get('description')

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', ... }}>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

---

## 3. Image Blur Placeholders

### Problem
- Images cause layout shift (CLS)
- No loading states
- Poor perceived performance

### Solution: Add Blur Placeholders

**Using Next.js Image with blur:**
```typescript
<Image
  src={imageUrl}
  alt={altText}
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**Implementation:**
- Generate blur data URLs during image upload
- Store in database alongside image URLs
- Update all `<Image>` components

---

## 4. Security Headers

### Problem
- Missing security headers
- Vulnerable to XSS, clickjacking
- No Content Security Policy (CSP)

### Solution: Add Security Headers

**File:** `next.config.js`
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 5. Web Vitals Monitoring

### Problem
- No performance tracking
- Can't measure improvements
- No real user metrics

### Solution: Add Web Vitals Tracking

**File:** `app/layout.tsx`
```typescript
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    console.log(metric)

    // Optional: Send to analytics service
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
      })
    }
  })

  return null
}
```

---

## 6. Breadcrumbs for Navigation

### Problem
- No breadcrumb navigation
- Poor UX on deep pages
- Missing breadcrumb schema

### Solution: Add Breadcrumbs

**Component:**
```typescript
<nav aria-label="Breadcrumb">
  <ol itemScope itemType="https://schema.org/BreadcrumbList">
    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
      <a itemProp="item" href="/">
        <span itemProp="name">Home</span>
      </a>
      <meta itemProp="position" content="1" />
    </li>
    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
      <span itemProp="name">Current Page</span>
      <meta itemProp="position" content="2" />
    </li>
  </ol>
</nav>
```

---

## Implementation Checklist

### Priority 1: Advanced SEO (High Impact)
- [ ] Add JSON-LD structured data for Organization
- [ ] Add JSON-LD for Product pages (if store enabled)
- [ ] Add JSON-LD for LocalBusiness (if applicable)
- [ ] Add breadcrumb markup
- [ ] Generate dynamic Open Graph images

### Priority 2: Performance & UX
- [ ] Add image blur placeholders
- [ ] Implement Web Vitals tracking
- [ ] Add loading skeletons for async content

### Priority 3: Security & Best Practices
- [ ] Configure security headers in next.config.js
- [ ] Add CSP (Content Security Policy)
- [ ] Enable HTTPS redirects

### Priority 4: Testing & Validation
- [ ] Run Google Rich Results Test
- [ ] Lighthouse audit (100 SEO score)
- [ ] Manual screen reader testing
- [ ] Cross-browser testing
- [ ] Mobile responsiveness check

---

## Success Metrics

### SEO
- ✅ Rich snippets in Google Search Console
- ✅ Lighthouse SEO score: 100
- ✅ Valid structured data (0 errors)
- ✅ Social sharing previews working

### Performance
- ✅ LCP < 2.5s
- ✅ CLS < 0.1
- ✅ FID < 100ms
- ✅ Lighthouse Performance: 95+

### Security
- ✅ A+ rating on securityheaders.com
- ✅ All recommended headers present
- ✅ CSP configured

---

## Estimated Timeline

| Task | Time | Priority |
|------|------|----------|
| Structured Data implementation | 90 min | P1 |
| Open Graph image generation | 60 min | P1 |
| Image blur placeholders | 45 min | P2 |
| Security headers | 30 min | P3 |
| Web Vitals tracking | 30 min | P2 |
| Breadcrumbs | 30 min | P1 |
| Testing & validation | 60 min | P4 |

**Total:** 5-6 hours

---

## Next Steps After Week 4

1. **Analytics Integration** - Google Analytics 4, Plausible
2. **A/B Testing** - Test different layouts/copy
3. **Conversion Optimization** - Forms, CTAs
4. **Content Strategy** - Blog, resources
5. **Link Building** - Partnerships, directories
