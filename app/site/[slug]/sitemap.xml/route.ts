import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Mark as dynamic since it queries database
export const dynamic = 'force-dynamic'

/**
 * Generates a sitemap.xml for a specific website
 * Accessible at: /site/{slug}/sitemap.xml
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const { slug } = await params

  try {
    // Load website
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('id, slug, updated_at')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (websiteError || !website) {
      return new NextResponse('Website not found', { status: 404 })
    }

    // Load all pages for this website
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('slug, path, is_homepage, updated_at')
      .eq('website_id', website.id)
      .order('order', { ascending: true })

    if (pagesError) {
      throw pagesError
    }

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages
  ?.map((page) => {
    const url = page.is_homepage
      ? `${baseUrl}/site/${website.slug}`
      : `${baseUrl}/site/${website.slug}?page=${page.path}`
    const lastmod = page.updated_at
      ? new Date(page.updated_at).toISOString().split('T')[0]
      : new Date(website.updated_at).toISOString().split('T')[0]
    const priority = page.is_homepage ? '1.0' : '0.8'

    return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  })
  .join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * Escape special XML characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
