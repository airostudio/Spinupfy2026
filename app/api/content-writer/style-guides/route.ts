/**
 * API Route: Style Guides
 * GET /api/content-writer/style-guides - List all style guides
 * POST /api/content-writer/style-guides - Create new style guide
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

    const { data: style_guides, error } = await supabase
      .from('style_guides')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching style guides:', error);
      return NextResponse.json(
        { error: 'Failed to fetch style guides' },
        { status: 500 }
      );
    }

    return NextResponse.json({ style_guides });
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
    const { name, description, rules, is_default } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { data: style_guide, error } = await supabase
      .from('style_guides')
      .insert({
        user_id: user.id,
        name,
        description,
        rules: rules || {},
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating style guide:', error);
      return NextResponse.json(
        { error: 'Failed to create style guide' },
        { status: 500 }
      );
    }

    return NextResponse.json({ style_guide });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
