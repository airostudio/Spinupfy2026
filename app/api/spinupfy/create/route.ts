import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { calculatePricing } from '@/lib/spinupfy-pricing'
import { matchTemplateToPrompt, getTemplate } from '@/lib/config/spinupfy-templates'
import type { SpinupfyTemplateType } from '@/lib/spinupfy-pricing'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Authenticate
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      prompt,
      templateId,
      name,
      description,
      startDate,
      endDate,
      contactEmail,
      contactName,
      contactPhone,
    } = body

    if (!prompt && !templateId) {
      return NextResponse.json({ error: 'prompt or templateId is required' }, { status: 400 })
    }
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 })
    }

    // Resolve template
    let resolvedTemplateId = templateId
    if (!resolvedTemplateId && prompt) {
      const matches = matchTemplateToPrompt(prompt)
      if (matches.length === 0) {
        // Default to event_flyer as a safe fallback
        resolvedTemplateId = 'event_flyer'
      } else {
        resolvedTemplateId = matches[0].id
      }
    }

    const template = getTemplate(resolvedTemplateId)
    if (!template) {
      return NextResponse.json({ error: 'Invalid templateId' }, { status: 400 })
    }

    // Calculate pricing
    const pricing = calculatePricing({
      templateType: resolvedTemplateId as SpinupfyTemplateType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    })

    // Generate a unique subdomain slug
    const baseName = (name || prompt || template.label)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 30)

    const randomSuffix = Math.random().toString(36).slice(2, 7)
    const subdomain = `${baseName}-${randomSuffix}`

    // Create the Spinupfy site record (status = draft until payment)
    const { data: site, error } = await supabase
      .from('spinupfy_sites')
      .insert({
        user_id: session.user.id,
        template_type: resolvedTemplateId,
        name: name || template.label,
        description: description || prompt || '',
        prompt: prompt || '',
        subdomain,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        original_end_date: new Date(endDate).toISOString(),
        status: 'draft',
        base_price: pricing.basePrice,
        total_price: pricing.totalPrice,
        currency: pricing.currency,
        payment_status: 'unpaid',
        contact_email: contactEmail || session.user.email,
        contact_name: contactName || '',
        contact_phone: contactPhone || '',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create Spinupfy site:', error)
      return NextResponse.json({ error: 'Failed to create site record' }, { status: 500 })
    }

    return NextResponse.json({
      site,
      template,
      pricing,
      nextStep: 'payment', // client should redirect to payment flow
    })
  } catch (error) {
    console.error('Spinupfy create error:', error)
    return NextResponse.json({ error: 'Failed to create Spinupfy site' }, { status: 500 })
  }
}

/**
 * GET /api/spinupfy/create?prompt=... — suggest a template from a prompt
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const prompt = searchParams.get('prompt') || ''

  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
  }

  const matches = matchTemplateToPrompt(prompt)

  return NextResponse.json({
    suggestions: matches.slice(0, 3).map(t => ({
      id: t.id,
      label: t.label,
      emoji: t.emoji,
      tagline: t.tagline,
      category: t.category,
      typicalDurations: t.typicalDurations,
    })),
  })
}
