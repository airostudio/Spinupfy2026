import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Mark as dynamic since it queries database
export const dynamic = 'force-dynamic'

/**
 * Generates a robots.txt for a specific website
 * Accessible at: /site/{slug}/robots.txt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const { slug } = await params

  try {
    // Verify website exists and is published
    const { data: website, error } = await supabase
      .from('websites')
      .select('slug')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !website) {
      return new NextResponse('Website not found', { status: 404 })
    }

    // Generate robots.txt content
    const robotsTxt = `# Robots.txt for ${website.slug}
User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/site/${website.slug}/sitemap.xml

# Common crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block bad bots (optional - uncomment if needed)
# User-agent: AhrefsBot
# Disallow: /

# User-agent: SemrushBot
# Disallow: /

# Crawl delay (optional - uncomment if needed)
# Crawl-delay: 10
`

    return new NextResponse(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('Error generating robots.txt:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
