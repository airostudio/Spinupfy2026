/**
 * Checkout API
 * Handle store checkout with Stripe Connect
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createPaymentIntentWithFee, calculateFees } from '@/lib/stripe-connect';

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables first (independent of user)
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('CRITICAL: STRIPE_SECRET_KEY environment variable is not configured');
      return NextResponse.json(
        { error: 'Server configuration error: Stripe API key not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    const {
      storeId,
      items, // Array of { productId, variantId?, quantity }
      customerInfo, // { email, name, phone }
      shippingAddress,
      billingAddress,
      discountCode,
    } = body;

    // Validate input
    if (!storeId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Store ID and items are required' },
        { status: 400 }
      );
    }

    if (!customerInfo?.email) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Get store and verify it's set up
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    if (!store.stripe_account_id || !store.stripe_charges_enabled) {
      return NextResponse.json(
        { error: 'Store payment processing not enabled' },
        { status: 400 }
      );
    }

    // Fetch product details and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      if (item.variantId) {
        // Get variant
        const { data: variant } = await supabase
          .from('product_variants')
          .select('*, products(*)')
          .eq('id', item.variantId)
          .single();

        if (!variant) {
          return NextResponse.json(
            { error: `Variant ${item.variantId} not found` },
            { status: 404 }
          );
        }

        // Check inventory
        if (variant.products.track_inventory && variant.inventory_quantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient inventory for ${variant.products.name} - ${variant.title}` },
            { status: 400 }
          );
        }

        const itemTotal = variant.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          product_id: variant.product_id,
          variant_id: variant.id,
          product_name: variant.products.name,
          variant_title: variant.title,
          sku: variant.sku,
          quantity: item.quantity,
          price: variant.price,
          total: itemTotal,
        });
      } else {
        // Get product
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.productId)
          .single();

        if (!product) {
          return NextResponse.json(
            { error: `Product ${item.productId} not found` },
            { status: 404 }
          );
        }

        // Check inventory
        if (product.track_inventory && product.inventory_quantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient inventory for ${product.name}` },
            { status: 400 }
          );
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
        });
      }
    }

    // Calculate tax
    const taxAmount = subtotal * (store.tax_rate / 100);

    // Calculate shipping (simplified - you can enhance this)
    let shippingAmount = 0;
    if (store.shipping_enabled) {
      // Get cheapest shipping rate
      const { data: shippingRates } = await supabase
        .from('shipping_rates')
        .select('*')
        .eq('store_id', storeId)
        .eq('active', true)
        .order('flat_rate', { ascending: true })
        .limit(1);

      if (shippingRates && shippingRates.length > 0) {
        shippingAmount = shippingRates[0].flat_rate || 0;
      }
    }

    // Apply discount if provided
    let discountAmount = 0;
    if (discountCode) {
      const { data: discount } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('store_id', storeId)
        .eq('code', discountCode)
        .eq('active', true)
        .single();

      if (discount) {
        // Check validity
        const now = new Date();
        if (discount.starts_at && new Date(discount.starts_at) > now) {
          return NextResponse.json(
            { error: 'Discount code not yet active' },
            { status: 400 }
          );
        }
        if (discount.ends_at && new Date(discount.ends_at) < now) {
          return NextResponse.json(
            { error: 'Discount code expired' },
            { status: 400 }
          );
        }

        // Check usage limits
        if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
          return NextResponse.json(
            { error: 'Discount code usage limit reached' },
            { status: 400 }
          );
        }

        // Check minimum purchase
        if (discount.minimum_purchase_amount && subtotal < discount.minimum_purchase_amount) {
          return NextResponse.json(
            { error: `Minimum purchase of $${discount.minimum_purchase_amount} required` },
            { status: 400 }
          );
        }

        // Calculate discount
        if (discount.discount_type === 'percentage') {
          discountAmount = subtotal * (discount.discount_value / 100);
        } else {
          discountAmount = discount.discount_value;
        }

        // Update usage count
        await supabase
          .from('discount_codes')
          .update({ usage_count: discount.usage_count + 1 })
          .eq('id', discount.id);
      }
    }

    // Calculate total
    const total = subtotal + taxAmount + shippingAmount - discountAmount;

    // Calculate platform fees
    const fees = calculateFees(
      Math.round(total * 100), // Convert to cents
      store.platform_fee_percentage
    );

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment intent
    const paymentIntent = await createPaymentIntentWithFee({
      amount: Math.round(total * 100), // in cents
      currency: store.currency,
      stripeAccountId: store.stripe_account_id,
      platformFeePercentage: store.platform_fee_percentage,
      customerEmail: customerInfo.email,
      metadata: {
        storeId: store.id,
        orderNumber,
      },
    });

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        order_number: orderNumber,
        customer_email: customerInfo.email,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        shipping_address_line1: shippingAddress?.line1,
        shipping_address_line2: shippingAddress?.line2,
        shipping_city: shippingAddress?.city,
        shipping_state: shippingAddress?.state,
        shipping_postal_code: shippingAddress?.postalCode,
        shipping_country: shippingAddress?.country || 'US',
        billing_address_line1: billingAddress?.line1 || shippingAddress?.line1,
        billing_address_line2: billingAddress?.line2 || shippingAddress?.line2,
        billing_city: billingAddress?.city || shippingAddress?.city,
        billing_state: billingAddress?.state || shippingAddress?.state,
        billing_postal_code: billingAddress?.postalCode || shippingAddress?.postalCode,
        billing_country: billingAddress?.country || shippingAddress?.country || 'US',
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        total,
        platform_fee: fees.platformFee / 100, // Convert back to dollars
        merchant_payout: fees.merchantPayout / 100,
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending',
        fulfillment_status: 'unfulfilled',
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    await supabase.from('order_items').insert(orderItemsWithOrderId);

    // Decrease inventory
    for (const item of items) {
      if (item.variantId) {
        await supabase.rpc('decrement_variant_inventory', {
          variant_id: item.variantId,
          quantity: item.quantity,
        });
      } else {
        await supabase.rpc('decrement_product_inventory', {
          product_id: item.productId,
          quantity: item.quantity,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order,
        clientSecret: paymentIntent.client_secret,
        fees: {
          platformFee: fees.platformFee / 100,
          merchantPayout: fees.merchantPayout / 100,
        },
      },
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}
