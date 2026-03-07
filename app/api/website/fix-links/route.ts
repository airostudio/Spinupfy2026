import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { fixBrokenLinks, createMissingPages } from '@/lib/utils/link-validator'

/**
 * Fix broken links in a website
 * Automatically corrects navigation links and creates missing pages
 */
export async function POST(request: NextRequest) {
  try {
    const { websiteId, createPages = true } = await request.json()

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Load the website with pages and sections
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*, pages(*, sections(*))')
      .eq('id', websiteId)
      .single()

    if (websiteError || !website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      )
    }

    // Fix broken links
    const { website: updatedWebsite, fixes } = fixBrokenLinks(website)

    // Create missing pages if requested
    let createdPages: any[] = []
    if (createPages) {
      const result = createMissingPages(updatedWebsite)
      createdPages = result.createdPages

      // Insert created pages into database
      for (const page of createdPages) {
        const { data: newPage, error } = await supabase
          .from('pages')
          .insert({
            website_id: websiteId,
            title: page.title,
            slug: page.slug,
            path: page.path,
            order: updatedWebsite.pages.length,
          })
          .select()
          .single()

        if (!error && newPage) {
          // Insert sections for the new page
          for (const section of page.sections) {
            await supabase
              .from('sections')
              .insert({
                page_id: newPage.id,
                type: section.type,
                content: section.content,
                order: 0,
              })
          }
        }
      }
    }

    // Update sections with fixed links
    for (const page of updatedWebsite.pages) {
      if (page.sections) {
        for (const section of page.sections) {
          await supabase
            .from('sections')
            .update({ content: section.content })
            .eq('id', section.id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      fixes,
      createdPages: createdPages.map(p => ({
        id: p.id,
        title: p.title,
        path: p.path,
      })),
      message: `Fixed ${fixes.length} broken links and created ${createdPages.length} missing pages`,
    })
  } catch (error) {
    console.error('Error fixing links:', error)
    return NextResponse.json(
      { error: 'Failed to fix links' },
      { status: 500 }
    )
  }
}
