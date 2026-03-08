import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { calculateExtensionPrice } from '@/lib/spinupfy-pricing'
import type { SpinupfyTemplateType } from '@/lib/spinupfy-pricing'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { siteId, newEndDate } = body

    if (!siteId || !newEndDate) {
      return NextResponse.json({ error: 'siteId and newEndDate are required' }, { status: 400 })
    }

    // Fetch the site and verify ownership
    const { data: site, error: fetchError } = await supabase
      .from('spinupfy_sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    if (site.status === 'deleted') {
      return NextResponse.json({ error: 'Cannot extend a deleted site' }, { status: 400 })
    }

    const newEnd = new Date(newEndDate)
    const currentEnd = new Date(site.end_date)

    if (newEnd <= currentEnd) {
      return NextResponse.json({ error: 'New end date must be after current end date' }, { status: 400 })
    }

    // Calculate incremental cost
    const extensionPricing = calculateExtensionPrice(
      site.template_type as SpinupfyTemplateType,
      currentEnd,
      newEnd
    )

    // If this is a preview/quote request (no payment yet)
    if (body.preview) {
      return NextResponse.json({ pricing: extensionPricing })
    }

    // Record the extension (payment flow handles actual activation)
    const { data: extension, error: extError } = await supabase
      .from('spinupfy_extensions')
      .insert({
        spinupfy_site_id: siteId,
        user_id: session.user.id,
        previous_end_date: currentEnd.toISOString(),
        new_end_date: newEnd.toISOString(),
        additional_days: extensionPricing.days,
        additional_price: extensionPricing.totalPrice,
        payment_status: 'unpaid',
      })
      .select()
      .single()

    if (extError) {
      console.error('Failed to create extension record:', extError)
      return NextResponse.json({ error: 'Failed to create extension' }, { status: 500 })
    }

    return NextResponse.json({
      extension,
      pricing: extensionPricing,
      nextStep: 'payment',
    })
  } catch (error) {
    console.error('Spinupfy extend error:', error)
    return NextResponse.json({ error: 'Failed to process extension' }, { status: 500 })
  }
}
