/**
 * API Route: Audience Personas
 * GET /api/content-writer/personas - List all personas
 * POST /api/content-writer/personas - Create new persona
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: personas, error } = await supabase
      .from('audience_personas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching personas:', error);
      return NextResponse.json(
        { error: 'Failed to fetch personas' },
        { status: 500 }
      );
    }

    return NextResponse.json({ personas });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, demographics, psychographics, language_preferences, is_default } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { data: persona, error } = await supabase
      .from('audience_personas')
      .insert({
        user_id: user.id,
        name,
        description,
        demographics: demographics || {},
        psychographics: psychographics || {},
        language_preferences: language_preferences || {},
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating persona:', error);
      return NextResponse.json(
        { error: 'Failed to create persona' },
        { status: 500 }
      );
    }

    return NextResponse.json({ persona });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
