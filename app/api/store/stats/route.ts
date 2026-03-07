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

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Get product count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);

    // Get order count and revenue
    const { data: orders } = await supabase
      .from('orders')
      .select('total, payment_status, fulfillment_status')
      .eq('store_id', storeId);

    const totalOrders = orders?.length || 0;
    const revenue = orders
      ?.filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total, 0) || 0;

    const pendingOrders = orders
      ?.filter(o => o.fulfillment_status === 'unfulfilled')
      .length || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalProducts: productCount || 0,
        totalOrders,
        revenue,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
