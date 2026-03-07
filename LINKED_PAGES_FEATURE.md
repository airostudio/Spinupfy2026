# Automated Linked Pages Generation Feature

## Overview

This feature automatically scans generated website content and creates full pages for all internal links found in cards, buttons, and CTAs. When a user creates a website, the AI will now detect all internal links and generate complete pages with multiple sections of content for each link.

## How It Works

### 1. **Link Extraction**
When a website is generated, the system:
- Scans all sections (Hero, Features, CTA, Footer, etc.)
- Recursively searches for `href` properties in the content
- Filters for internal links (excludes external URLs, mailto:, tel:, etc.)
- Extracts unique page slugs that need to be created

### 2. **Page Content Generation**
For each missing link, the system:
- Uses GPT-4 Turbo to generate full page content
- Creates 3-5 relevant sections (Hero, Features, Content, CTA, etc.)
- Generates SEO metadata (title, description)
- Ensures content is specific to the business type and link context

### 3. **Database Storage**
Generated pages are:
- Stored in the Supabase `pages` table
- Associated with the parent website
- Populated with multiple sections
- Ready to edit in the editor

## User Experience

### Automatic Generation (During Website Creation)
1. User fills out the website creation form
2. Clicks "Generate Website"
3. System generates homepage with all sections
4. **NEW:** System automatically scans for internal links
5. **NEW:** AI generates full content for all linked pages
6. User sees: "Website generated with X additional pages!"
7. User is redirected to the editor with all pages ready

### Manual Generation (From Editor)
1. User opens website in editor
2. Clicks "Generate Linked Pages" button in toolbar
3. System scans all existing pages for internal links
4. Generates only missing pages (won't duplicate existing ones)
5. Pages appear in the editor sidebar
6. User can edit, customize, or regenerate as needed

## Technical Implementation

### Files Created/Modified

#### New Files:
- `lib/utils/link-extractor.ts` - Utility to extract internal links from website content
- `lib/services/page-generator.ts` - Service to generate page content using OpenAI
- `app/api/generate-pages/route.ts` - API endpoint for manual page generation
- `components/editor/GeneratePagesButton.tsx` - UI component for manual triggering

#### Modified Files:
- `app/api/generate/route.ts` - Enhanced to create website in DB and auto-generate linked pages
- `app/create/page.tsx` - Updated to navigate to editor and show generation stats
- `app/editor/[id]/page.tsx` - Added Generate Linked Pages button to toolbar

### API Endpoints

#### `POST /api/generate`
Creates a new website with automatic linked page generation.

**Request:**
```json
{
  "businessName": "My Restaurant",
  "description": "A cozy Italian restaurant",
  "websiteType": "restaurant",
  "generateLinkedPages": true
}
```

**Response:**
```json
{
  "success": true,
  "websiteId": "uuid",
  "data": { ... },
  "stats": {
    "linkedPagesGenerated": 5
  }
}
```

#### `POST /api/generate-pages`
Scans existing website and generates missing linked pages.

**Request:**
```json
{
  "websiteId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully generated 5 new pages",
  "generatedPages": [
    {
      "id": "uuid",
      "title": "Menu",
      "slug": "menu",
      "path": "/menu",
      "sectionsCount": 4
    }
  ],
  "stats": {
    "totalLinksFound": 10,
    "existingPages": 5,
    "newPagesCreated": 5,
    "generationTimeMs": 15000
  }
}
```

## Link Detection Examples

The system detects links in various section types:

### Hero Section CTA:
```json
{
  "primaryCTA": { "text": "View Menu", "href": "/menu" },
  "secondaryCTA": { "text": "Book Table", "href": "/reservations" }
}
```
**Result:** Generates `/menu` and `/reservations` pages

### Footer Navigation:
```json
{
  "columns": [
    {
      "title": "Company",
      "links": [
        { "label": "About Us", "href": "/about" },
        { "label": "Contact", "href": "/contact" }
      ]
    }
  ]
}
```
**Result:** Generates `/about` and `/contact` pages

### Features Section (if linked):
```json
{
  "features": [
    {
      "title": "Our Services",
      "description": "...",
      "link": { "text": "Learn More", "href": "/services" }
    }
  ]
}
```
**Result:** Generates `/services` page

## AI Generation Strategy

The AI receives rich context to generate relevant content:

**Input Context:**
- Website name and type
- Brand name
- Link text/label
- Source section (where the link came from)
- Business description

**Output Structure:**
Each generated page includes:
- Hero section with relevant messaging
- 2-3 content sections (Features, Content blocks, Testimonials, etc.)
- Closing CTA section
- Complete SEO metadata

**Example:** For a restaurant's "/menu" link:
- Hero: "Our Delicious Menu"
- Features: Highlight signature dishes, categories
- Content: Menu sections with descriptions
- Pricing: Optional menu pricing
- CTA: "Reserve your table today"

## Benefits

1. **Complete Website** - Users get a fully functional website with all pages, not just a homepage
2. **Time Savings** - No need to manually create each linked page
3. **Consistency** - All pages match the business type and brand voice
4. **SEO Ready** - Each page has proper metadata and structure
5. **Editable** - Users can customize generated pages in the editor
6. **Smart Detection** - Won't duplicate existing pages, only creates missing ones

## Configuration

Enable/disable automatic generation:
```typescript
// In create form
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    businessName,
    description,
    websiteType,
    generateLinkedPages: true, // Set to false to disable
  }),
})
```

## Error Handling

The system is resilient:
- If page generation fails for one link, it continues with others
- Errors are logged but don't block website creation
- Users can retry manual generation from the editor
- Clear error messages in toast notifications

## Future Enhancements

Potential improvements:
- [ ] Batch generation progress indicator
- [ ] Custom prompts per page type
- [ ] Link validation and suggestions
- [ ] Automatic sitemap generation
- [ ] Internal link health checks
- [ ] AI-suggested additional pages based on business type
