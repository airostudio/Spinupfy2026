import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (*),
        product_variants (*)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform to expected format
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      images: product.product_images.map((img: any) => ({
        url: img.url,
        altText: img.alt_text,
      })),
      inStock: product.track_inventory ? product.inventory_quantity > 0 : true,
      inventoryQuantity: product.inventory_quantity,
      variants: product.product_variants?.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: v.price,
        options: v.options,
        inventoryQuantity: v.inventory_quantity,
      })),
      storeId: product.store_id,
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
