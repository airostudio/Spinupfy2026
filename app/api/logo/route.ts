import { NextRequest, NextResponse } from 'next/server'
import { generateLogo } from '@/lib/openai'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Maximum duration for logo generation (2 minutes for DALL-E)
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    const body = await request.json()
    const { brandName, style } = body

    if (!brandName) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }

    const logoUrl = await generateLogo({
      brandName,
      style: style || 'modern',
    })

    return NextResponse.json({ success: true, data: { url: logoUrl } })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate logo' },
      { status: 500 }
    )
  }
}
