import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First verify store ownership before returning order data
    const { data: orderCheck } = await supabase
      .from('orders')
      .select('store_id, stores(user_id)')
      .eq('id', id)
      .single();

    const orderCheckStore = orderCheck?.stores as unknown as { user_id: string } | null;
    if (!orderCheck || orderCheckStore?.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform to expected format
    const transformedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      total: order.total,
      subtotal: order.subtotal,
      taxAmount: order.tax_amount,
      shippingAmount: order.shipping_amount,
      discountAmount: order.discount_amount,
      paymentStatus: order.payment_status,
      fulfillmentStatus: order.fulfillment_status,
      createdAt: order.created_at,
      items: order.order_items.map((item: any) => ({
        productName: item.product_name,
        variantTitle: item.variant_title,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      shippingAddress: {
        line1: order.shipping_address_line1,
        line2: order.shipping_address_line2,
        city: order.shipping_city,
        state: order.shipping_state,
        postalCode: order.shipping_postal_code,
        country: order.shipping_country,
      },
      tracking: order.tracking_number ? {
        number: order.tracking_number,
        url: order.tracking_url,
        carrier: order.carrier,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: transformedOrder,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const {
      fulfillmentStatus,
      trackingNumber,
      trackingUrl,
      carrier,
      staffNote,
    } = body;

    // Verify store ownership
    const { data: order } = await supabase
      .from('orders')
      .select('store_id, fulfilled_at, stores(user_id)')
      .eq('id', id)
      .single();

    const orderStore = order?.stores as unknown as { user_id: string } | null;
    if (!order || orderStore?.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Order not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update order
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (fulfillmentStatus) updates.fulfillment_status = fulfillmentStatus;
    if (trackingNumber) updates.tracking_number = trackingNumber;
    if (trackingUrl) updates.tracking_url = trackingUrl;
    if (carrier) updates.carrier = carrier;
    if (staffNote !== undefined) updates.staff_note = staffNote;

    if (fulfillmentStatus === 'fulfilled' && !order.fulfilled_at) {
      updates.fulfilled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
