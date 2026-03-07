/**
 * API Route: Voice Frameworks
 * GET /api/content-writer/voice-frameworks - List all voice frameworks
 * POST /api/content-writer/voice-frameworks - Create new voice framework
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

    const { data: voice_frameworks, error } = await supabase
      .from('voice_frameworks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching voice frameworks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch voice frameworks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ voice_frameworks });
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
    const { name, description, tone, voice_characteristics, writing_sample, is_default } = body;

    if (!name || !tone) {
      return NextResponse.json(
        { error: 'Name and tone are required' },
        { status: 400 }
      );
    }

    const { data: voice_framework, error } = await supabase
      .from('voice_frameworks')
      .insert({
        user_id: user.id,
        name,
        description,
        tone,
        voice_characteristics: voice_characteristics || {},
        writing_sample,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating voice framework:', error);
      return NextResponse.json(
        { error: 'Failed to create voice framework' },
        { status: 500 }
      );
    }

    return NextResponse.json({ voice_framework });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
