/**
 * Inventory Management API
 * Handles stock updates, low stock alerts, and inventory tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const lowStockThreshold = parseInt(searchParams.get('lowStockThreshold') || '10')
    const filter = searchParams.get('filter') // 'all', 'low_stock', 'out_of_stock'

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
    }

    // Verify store ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, user_id')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Get products with inventory info
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        sku,
        inventory_quantity,
        track_inventory,
        status,
        price,
        images:product_images(url),
        variants:product_variants(
          id,
          title,
          sku,
          inventory_quantity
        )
      `)
      .eq('store_id', storeId)
      .order('name')

    // Apply filter
    if (filter === 'low_stock') {
      query = query.lte('inventory_quantity', lowStockThreshold).gt('inventory_quantity', 0)
    } else if (filter === 'out_of_stock') {
      query = query.eq('inventory_quantity', 0)
    }

    const { data: products, error: productsError } = await query

    if (productsError) {
      console.error('Error fetching inventory:', productsError)
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
    }

    // Calculate inventory stats
    const stats = {
      totalProducts: products?.length || 0,
      totalStock: products?.reduce((sum, p) => sum + (p.inventory_quantity || 0), 0) || 0,
      lowStockCount: products?.filter(p => p.inventory_quantity > 0 && p.inventory_quantity <= lowStockThreshold).length || 0,
      outOfStockCount: products?.filter(p => p.inventory_quantity === 0).length || 0,
    }

    // Format response
    const inventory = products?.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      stock: product.inventory_quantity,
      trackInventory: product.track_inventory,
      status: product.status,
      price: product.price,
      image: product.images?.[0]?.url,
      isLowStock: product.inventory_quantity > 0 && product.inventory_quantity <= lowStockThreshold,
      isOutOfStock: product.inventory_quantity === 0,
      variants: product.variants?.map((v: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        stock: v.inventory_quantity,
      })),
    }))

    return NextResponse.json({
      success: true,
      inventory,
      stats,
      lowStockThreshold,
    })
  } catch (error: any) {
    console.error('Error in inventory API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, variantId, quantity, adjustment, storeId } = body

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Verify store ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, user_id')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Update variant inventory if variantId provided
    if (variantId) {
      const { data: variant, error: fetchError } = await supabase
        .from('product_variants')
        .select('inventory_quantity')
        .eq('id', variantId)
        .single()

      if (fetchError) {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
      }

      const newQuantity = adjustment !== undefined
        ? (variant.inventory_quantity || 0) + adjustment
        : quantity

      const { error: updateError } = await supabase
        .from('product_variants')
        .update({
          inventory_quantity: Math.max(0, newQuantity),
          updated_at: new Date().toISOString(),
        })
        .eq('id', variantId)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update variant inventory' }, { status: 500 })
      }

      // Log inventory change
      await supabase.from('inventory_logs').insert({
        product_id: productId,
        variant_id: variantId,
        store_id: storeId,
        user_id: user.id,
        previous_quantity: variant.inventory_quantity,
        new_quantity: Math.max(0, newQuantity),
        change_type: adjustment !== undefined ? 'adjustment' : 'set',
        change_amount: adjustment !== undefined ? adjustment : newQuantity - (variant.inventory_quantity || 0),
        notes: body.notes,
      })

      return NextResponse.json({
        success: true,
        message: 'Variant inventory updated',
        newQuantity: Math.max(0, newQuantity),
      })
    }

    // Update product inventory
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('inventory_quantity')
      .eq('id', productId)
      .eq('store_id', storeId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const newQuantity = adjustment !== undefined
      ? (product.inventory_quantity || 0) + adjustment
      : quantity

    const { error: updateError } = await supabase
      .from('products')
      .update({
        inventory_quantity: Math.max(0, newQuantity),
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('store_id', storeId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
    }

    // Log inventory change (fire and forget, don't block on errors)
    supabase.from('inventory_logs').insert({
      product_id: productId,
      store_id: storeId,
      user_id: user.id,
      previous_quantity: product.inventory_quantity,
      new_quantity: Math.max(0, newQuantity),
      change_type: adjustment !== undefined ? 'adjustment' : 'set',
      change_amount: adjustment !== undefined ? adjustment : newQuantity - (product.inventory_quantity || 0),
      notes: body.notes,
    }).then(({ error }) => {
      if (error) console.log('Inventory log not saved:', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Inventory updated',
      newQuantity: Math.max(0, newQuantity),
    })
  } catch (error: any) {
    console.error('Error updating inventory:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Bulk inventory update
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { storeId, updates } = body

    if (!storeId || !updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Store ID and updates array required' }, { status: 400 })
    }

    // Verify store ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, user_id')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const results: Array<{ productId: string; success: boolean; error?: string }> = []

    for (const update of updates) {
      const { productId, quantity } = update

      const { error: updateError } = await supabase
        .from('products')
        .update({
          inventory_quantity: Math.max(0, quantity),
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .eq('store_id', storeId)

      results.push({
        productId,
        success: !updateError,
        error: updateError?.message,
      })
    }

    const successCount = results.filter(r => r.success).length

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} of ${updates.length} products`,
      results,
    })
  } catch (error: any) {
    console.error('Error in bulk inventory update:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
