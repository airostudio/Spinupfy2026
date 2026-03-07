import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Mark this route as dynamic since it uses request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data: rates, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .eq('store_id', storeId)
      .eq('active', true)
      .order('position');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: rates || [],
    });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping rates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { storeId, name, description, rateType, flatRate, weightRate, minOrderAmount } = body;

    // Verify store ownership
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found or unauthorized' },
        { status: 404 }
      );
    }

    const { data: rate, error } = await supabase
      .from('shipping_rates')
      .insert({
        store_id: storeId,
        name,
        description,
        rate_type: rateType,
        flat_rate: flatRate,
        weight_rate: weightRate,
        min_order_amount: minOrderAmount,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: rate,
    });
  } catch (error) {
    console.error('Error creating shipping rate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create shipping rate' },
      { status: 500 }
    );
  }
}
