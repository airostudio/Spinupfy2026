import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from "@/lib/supabase-server"

/**
 * GET /api/spinupfy/status — list all Spinupfy sites for the authenticated user
 * GET /api/spinupfy/status?id=<siteId> — get a specific site
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const siteId = searchParams.get('id')

    if (siteId) {
      const { data: site, error } = await supabase
        .from('spinupfy_sites')
        .select('*, spinupfy_extensions(*)')
        .eq('id', siteId)
        .eq('user_id', session.user.id)
        .single()

      if (error || !site) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 })
      }

      return NextResponse.json({ site })
    }

    // List all sites (exclude permanently deleted)
    const { data: sites, error } = await supabase
      .from('spinupfy_sites')
      .select('*')
      .eq('user_id', session.user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
    }

    return NextResponse.json({ sites })
  } catch (error) {
    console.error('Spinupfy status error:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}

/**
 * PATCH /api/spinupfy/status — update status of a site (e.g. activate after payment)
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { siteId, status, websiteId } = body

    if (!siteId || !status) {
      return NextResponse.json({ error: 'siteId and status are required' }, { status: 400 })
    }

    const allowedStatuses = ['draft', 'active', 'suspended']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { status }

    if (status === 'active') {
      updateData.published_at = new Date().toISOString()
      updateData.payment_status = 'paid'
    }
    if (websiteId) {
      updateData.website_id = websiteId
    }

    const { data: site, error } = await supabase
      .from('spinupfy_sites')
      .update(updateData)
      .eq('id', siteId)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error || !site) {
      return NextResponse.json({ error: 'Failed to update site' }, { status: 500 })
    }

    return NextResponse.json({ site })
  } catch (error) {
    console.error('Spinupfy status PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
