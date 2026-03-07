/**
 * Individual Product API
 * Update and delete operations for a specific product
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: product, error } = await supabase
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
          barcode,
          price,
          compare_at_price,
          cost_per_item,
          inventory_quantity,
          options,
          position
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Sort images and variants by position
    const productWithSorted = {
      ...product,
      product_images: product.product_images?.sort((a: any, b: any) => a.position - b.position) || [],
      product_variants: product.product_variants?.sort((a: any, b: any) => a.position - b.position) || [],
    };

    return NextResponse.json({
      success: true,
      data: productWithSorted,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
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

    // Verify ownership
    const { data: existingProduct } = await supabase
      .from('products')
      .select('store_id, stores!inner(user_id)')
      .eq('id', id)
      .single();

    const productStore = existingProduct?.stores as unknown as { user_id: string } | null;
    if (!existingProduct || productStore?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update product
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (compareAtPrice !== undefined) updateData.compare_at_price = compareAtPrice;
    if (costPerItem !== undefined) updateData.cost_per_item = costPerItem;
    if (sku !== undefined) updateData.sku = sku;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (trackInventory !== undefined) updateData.track_inventory = trackInventory;
    if (inventoryQuantity !== undefined) updateData.inventory_quantity = inventoryQuantity;
    if (allowBackorder !== undefined) updateData.allow_backorder = allowBackorder;
    if (weight !== undefined) updateData.weight = weight;
    if (weightUnit !== undefined) updateData.weight_unit = weightUnit;
    if (requiresShipping !== undefined) updateData.requires_shipping = requiresShipping;
    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;
    if (metaTitle !== undefined) updateData.meta_title = metaTitle;
    if (metaDescription !== undefined) updateData.meta_description = metaDescription;

    const { data: product, error: productError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 400 });
    }

    // Update images if provided
    if (images !== undefined) {
      // Delete existing images
      await supabase.from('product_images').delete().eq('product_id', id);

      // Add new images
      if (images.length > 0) {
        const imageInserts = images.map((img: any, index: number) => ({
          product_id: id,
          url: img.url,
          alt_text: img.altText || name,
          position: index,
        }));

        await supabase.from('product_images').insert(imageInserts);
      }
    }

    // Update variants if provided
    if (variants !== undefined) {
      // Delete existing variants
      await supabase.from('product_variants').delete().eq('product_id', id);

      // Add new variants
      if (variants.length > 0) {
        const variantInserts = variants.map((variant: any, index: number) => ({
          product_id: id,
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
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const { data: existingProduct } = await supabase
      .from('products')
      .select('store_id, stores!inner(user_id)')
      .eq('id', id)
      .single();

    const deleteProductStore = existingProduct?.stores as unknown as { user_id: string } | null;
    if (!existingProduct || deleteProductStore?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete product (CASCADE will handle related records)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
