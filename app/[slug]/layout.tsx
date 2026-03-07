import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generatePageMetadata } from '@/lib/metadata'

interface Props {
  params: { slug: string }
}

/**
 * Generate metadata for dynamic pages
 * This runs on the server and provides proper SEO metadata
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServerSupabaseClient()

  try {
    // Remove leading slash if present
    const cleanSlug = params.slug.replace(/^\//, '')

    // Fetch page with website data
    const { data: page } = await supabase
      .from('pages')
      .select(`
        *,
        website:websites (*)
      `)
      .eq('slug', cleanSlug)
      .single()

    if (!page || !page.website) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.',
      }
    }

    // Generate metadata for this page
    return generatePageMetadata(
      {
        title: page.title,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        meta_keywords: page.meta_keywords,
        og_image: page.og_image,
        og_type: page.og_type,
        twitter_card: page.twitter_card,
        twitter_image: page.twitter_image,
        canonical_url: page.canonical_url,
      },
      {
        name: page.website.name,
        meta_title: page.website.meta_title,
        meta_description: page.website.meta_description,
        slug: page.website.slug,
      }
    )
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'AI Website Builder',
      description: 'Build stunning websites using AI',
    }
  }
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
