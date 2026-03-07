import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS, createRateLimitResponse } from '@/lib/rate-limit';

// Input validation schema
const ValidateDiscountSchema = z.object({
  storeId: z.string().uuid('Invalid store ID format'),
  code: z.string().min(1).max(50),
  subtotal: z.number().min(0).optional(),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting to prevent brute force attacks
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(`discount-validate:${clientIP}`, RATE_LIMITS.public);

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.resetIn);
  }

  try {
    const supabase = await createServerSupabaseClient();

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input with Zod
    const validationResult = ValidateDiscountSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { storeId, code, subtotal } = validationResult.data;

    // Find the discount code
    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('store_id', storeId)
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (error || !discount) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount code' },
        { status: 404 }
      );
    }

    // Check if code has expired
    if (discount.ends_at && new Date(discount.ends_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This discount code has expired' },
        { status: 400 }
      );
    }

    // Check if code hasn't started yet
    if (discount.starts_at && new Date(discount.starts_at) > new Date()) {
      return NextResponse.json(
        { success: false, error: 'This discount code is not yet active' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return NextResponse.json(
        { success: false, error: 'This discount code has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check minimum purchase amount
    if (discount.minimum_purchase_amount && subtotal !== undefined && subtotal < discount.minimum_purchase_amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum purchase of $${discount.minimum_purchase_amount.toFixed(2)} required for this code`
        },
        { status: 400 }
      );
    }

    // Valid discount code
    return NextResponse.json({
      success: true,
      discount: {
        id: discount.id,
        code: discount.code,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        description: discount.description,
      },
    });
  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
