/**
 * Website Static Exporter
 *
 * Converts database-stored website into static HTML/CSS/JS files
 * ready for deployment to Plesk hosting
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

interface ExportOptions {
  websiteId: string
  outputDir: string
  includeAssets?: boolean
}

interface ExportResult {
  success: boolean
  outputDir?: string
  files?: string[]
  error?: string
  totalSize?: number
}

/**
 * Export website from database to static files
 */
export async function exportWebsiteToStatic(options: ExportOptions): Promise<ExportResult> {
  const { websiteId, outputDir, includeAssets = true } = options

  try {
    console.log(`Exporting website ${websiteId} to ${outputDir}`)

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch website data
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .single()

    if (websiteError || !website) {
      throw new Error(`Website not found: ${websiteId}`)
    }

    // Fetch all pages with their sections
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select(`
        *,
        sections (*)
      `)
      .eq('website_id', websiteId)
      .order('order', { ascending: true })

    if (pagesError) {
      throw new Error(`Error fetching pages: ${pagesError.message}`)
    }

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true })

    const files: string[] = []
    let totalSize = 0

    // Generate HTML for each page
    for (const page of pages || []) {
      const html = generatePageHTML(website, page, pages || [])
      const filename = page.is_homepage ? 'index.html' : `${page.slug}.html`
      const filepath = path.join(outputDir, filename)

      await fs.writeFile(filepath, html, 'utf-8')
      files.push(filename)

      const stats = await fs.stat(filepath)
      totalSize += stats.size
    }

    // Generate CSS file
    const css = generateCSS(website)
    const cssPath = path.join(outputDir, 'styles.css')
    await fs.writeFile(cssPath, css, 'utf-8')
    files.push('styles.css')

    const cssStats = await fs.stat(cssPath)
    totalSize += cssStats.size

    // Generate robots.txt
    const robotsTxt = generateRobotsTxt(website)
    const robotsPath = path.join(outputDir, 'robots.txt')
    await fs.writeFile(robotsPath, robotsTxt, 'utf-8')
    files.push('robots.txt')

    // Generate sitemap.xml
    const sitemap = generateSitemap(website, pages || [])
    const sitemapPath = path.join(outputDir, 'sitemap.xml')
    await fs.writeFile(sitemapPath, sitemap, 'utf-8')
    files.push('sitemap.xml')

    console.log(`Successfully exported ${files.length} files (${(totalSize / 1024).toFixed(2)} KB)`)

    return {
      success: true,
      outputDir,
      files,
      totalSize,
    }
  } catch (error: any) {
    console.error('Error exporting website:', error)
    return {
      success: false,
      error: error.message || 'Unknown error exporting website',
    }
  }
}

/**
 * Generate HTML for a single page
 */
function generatePageHTML(website: any, page: any, allPages: any[]): string {
  const sections = page.sections || []

  // Sort sections by order
  sections.sort((a: any, b: any) => a.order - b.order)

  // Build navigation
  const nav = allPages
    .filter((p: any) => p.slug !== 'home')
    .map((p: any) => {
      const href = p.is_homepage ? '/' : `/${p.slug}.html`
      return `<li><a href="${href}">${p.title}</a></li>`
    })
    .join('\n          ')

  // Build sections HTML
  const sectionsHTML = sections
    .filter((s: any) => s.visible)
    .map((s: any) => generateSectionHTML(s))
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.meta_title || page.title} - ${website.name}</title>
  <meta name="description" content="${page.meta_description || ''}">
  <link rel="stylesheet" href="/styles.css">
  <style>
    /* Inline critical CSS */
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  <nav class="main-nav">
    <div class="container">
      <a href="/" class="logo">${website.name}</a>
      <ul class="nav-links">
        ${nav}
      </ul>
    </div>
  </nav>

  <main>
${sectionsHTML}
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${website.name}. All rights reserved.</p>
      <p>Powered by Webese AI</p>
    </div>
  </footer>
</body>
</html>`
}

/**
 * Generate HTML for a single section
 */
function generateSectionHTML(section: any): string {
  const content = section.content || {}

  switch (section.type) {
    case 'HERO':
      return `  <section class="hero-section">
    <div class="container">
      <h1>${content.title || ''}</h1>
      <p>${content.description || ''}</p>
      ${content.primaryCTA ? `<a href="${content.primaryCTA.href}" class="btn btn-primary">${content.primaryCTA.text}</a>` : ''}
    </div>
  </section>`

    case 'FEATURES':
      const features = content.features || []
      return `  <section class="features-section">
    <div class="container">
      <h2>${content.title || ''}</h2>
      <p class="subtitle">${content.subtitle || ''}</p>
      <div class="features-grid">
        ${features.map((f: any) => `
        <div class="feature-card">
          ${f.image ? `<img src="${f.image}" alt="${f.title}">` : ''}
          <h3>${f.title}</h3>
          <p>${f.description}</p>
          ${f.link ? `<a href="${f.link}" class="feature-link">${f.linkText || 'Learn More'} →</a>` : ''}
        </div>`).join('\n        ')}
      </div>
    </div>
  </section>`

    case 'ABOUT':
      return `  <section class="about-section">
    <div class="container">
      <h2>${content.title || ''}</h2>
      <p>${content.content || ''}</p>
    </div>
  </section>`

    case 'CONTACT':
      return `  <section class="contact-section">
    <div class="container">
      <h2>${content.title || ''}</h2>
      <p>${content.description || ''}</p>
      <div class="contact-info">
        ${content.email ? `<p><strong>Email:</strong> <a href="mailto:${content.email}">${content.email}</a></p>` : ''}
        ${content.phone ? `<p><strong>Phone:</strong> <a href="tel:${content.phone}">${content.phone}</a></p>` : ''}
        ${content.address ? `<p><strong>Address:</strong> ${content.address}</p>` : ''}
      </div>
    </div>
  </section>`

    default:
      return `  <section class="generic-section">
    <div class="container">
      ${content.title ? `<h2>${content.title}</h2>` : ''}
      ${content.description ? `<p>${content.description}</p>` : ''}
    </div>
  </section>`
  }
}

/**
 * Generate CSS styles
 */
function generateCSS(website: any): string {
  const primaryColor = website.primary_color || '#3b82f6'
  const accentColor = website.accent_color || '#06b6d4'

  return `/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Navigation */
.main-nav {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.main-nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: ${primaryColor};
  text-decoration: none;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: ${primaryColor};
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background: ${primaryColor};
  color: #fff;
}

.btn-primary:hover {
  background: ${accentColor};
  transform: translateY(-2px);
}

/* Hero Section */
.hero-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
  color: #fff;
  text-align: center;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
}

/* Features Section */
.features-section {
  padding: 4rem 0;
}

.features-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  padding: 2rem;
  border: 1px solid #e5e5e5;
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.feature-card:hover {
  border-color: ${primaryColor};
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.feature-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 0.5rem;
  color: ${primaryColor};
}

.feature-link {
  display: inline-block;
  margin-top: 1rem;
  color: ${primaryColor};
  text-decoration: none;
  font-weight: 600;
}

/* About Section */
.about-section {
  padding: 4rem 0;
  background: #f9fafb;
}

.about-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

/* Contact Section */
.contact-section {
  padding: 4rem 0;
}

.contact-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.contact-info {
  margin-top: 2rem;
}

.contact-info p {
  margin-bottom: 0.5rem;
}

.contact-info a {
  color: ${primaryColor};
  text-decoration: none;
}

/* Footer */
.site-footer {
  background: #1f2937;
  color: #fff;
  padding: 2rem 0;
  text-align: center;
}

.site-footer p {
  margin: 0.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .main-nav .container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
`
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt(website: any): string {
  return `User-agent: *
Allow: /

Sitemap: https://${website.subdomain || 'example'}.webese.ai/sitemap.xml
`
}

/**
 * Generate sitemap.xml
 */
function generateSitemap(website: any, pages: any[]): string {
  const baseUrl = `https://${website.subdomain || 'example'}.webese.ai`

  const urls = pages.map((page: any) => {
    const loc = page.is_homepage ? baseUrl : `${baseUrl}/${page.slug}.html`
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.is_homepage ? '1.0' : '0.8'}</priority>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}
