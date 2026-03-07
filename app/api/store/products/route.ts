/**
 * Products API
 * CRUD operations for store products
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Mark this route as dynamic since it uses request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');

    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          alt_text,
          position
        ),
        product_variants (
          id,
          title,
          sku,
          price,
          inventory_quantity,
          options
        )
      `)
      .order('created_at', { ascending: false });

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Sort images by position
    const productsWithSortedImages = products?.map(product => ({
      ...product,
      product_images: product.product_images?.sort((a: any, b: any) => a.position - b.position) || [],
    }));

    return NextResponse.json({
      success: true,
      data: productsWithSortedImages,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      storeId,
      name,
      description,
      price,
      compareAtPrice,
      costPerItem,
      sku,
      barcode,
      trackInventory,
      inventoryQuantity,
      allowBackorder,
      weight,
      weightUnit,
      requiresShipping,
      status,
      featured,
      metaTitle,
      metaDescription,
      images,
      variants,
    } = body;

    // Verify store ownership
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found or unauthorized' },
        { status: 404 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        store_id: storeId,
        name,
        description,
        slug,
        price,
        compare_at_price: compareAtPrice,
        cost_per_item: costPerItem,
        sku,
        barcode,
        track_inventory: trackInventory ?? true,
        inventory_quantity: inventoryQuantity ?? 0,
        allow_backorder: allowBackorder ?? false,
        weight,
        weight_unit: weightUnit || 'lb',
        requires_shipping: requiresShipping ?? true,
        status: status || 'draft',
        featured: featured ?? false,
        meta_title: metaTitle,
        meta_description: metaDescription,
      })
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 400 });
    }

    // Add images if provided
    if (images && images.length > 0) {
      const imageInserts = images.map((img: any, index: number) => ({
        product_id: product.id,
        url: img.url,
        alt_text: img.altText || name,
        position: index,
      }));

      await supabase.from('product_images').insert(imageInserts);
    }

    // Add variants if provided
    if (variants && variants.length > 0) {
      const variantInserts = variants.map((variant: any, index: number) => ({
        product_id: product.id,
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        price: variant.price,
        compare_at_price: variant.compareAtPrice,
        cost_per_item: variant.costPerItem,
        inventory_quantity: variant.inventoryQuantity ?? 0,
        options: variant.options,
        position: index,
      }));

      await supabase.from('product_variants').insert(variantInserts);
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
