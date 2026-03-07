import { NextRequest, NextResponse } from 'next/server'
import { calculatePricing, suggestPricingOptions } from '@/lib/spinupfy-pricing'
import type { SpinupfyTemplateType } from '@/lib/spinupfy-pricing'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { templateType, startDate, endDate, eventDate, mode } = body

    if (!templateType) {
      return NextResponse.json({ error: 'templateType is required' }, { status: 400 })
    }

    if (mode === 'suggest' || !startDate || !endDate) {
      // Return suggestion options
      const options = suggestPricingOptions(
        templateType as SpinupfyTemplateType,
        eventDate ? new Date(eventDate) : undefined
      )
      return NextResponse.json({ options })
    }

    // Calculate exact pricing for a given date range
    const pricing = calculatePricing({
      templateType: templateType as SpinupfyTemplateType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    })

    return NextResponse.json({ pricing })
  } catch (error) {
    console.error('Spinupfy pricing error:', error)
    return NextResponse.json({ error: 'Failed to calculate pricing' }, { status: 500 })
  }
}
