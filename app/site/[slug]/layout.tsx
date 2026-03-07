import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateWebsiteMetadata, generatePageMetadata } from '@/lib/metadata'

interface Props {
  params: { slug: string }
}

/**
 * Generate metadata for public website pages
 * This runs on the server and provides proper SEO metadata
 * Note: Layouts can't access searchParams, so this generates metadata for the homepage
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServerSupabaseClient()

  try {
    // Load website data
    const { data: website } = await supabase
      .from('websites')
      .select('*')
      .eq('slug', params.slug)
      .eq('published', true)
      .single()

    if (!website) {
      return {
        title: 'Website Not Found',
        description: 'The requested website could not be found.',
      }
    }

    // Generate metadata for the website/homepage
    return generateWebsiteMetadata(website)
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'AI Website Builder',
      description: 'Build stunning websites using AI',
    }
  }
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
