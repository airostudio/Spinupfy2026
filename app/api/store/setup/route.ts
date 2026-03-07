/**
 * Store Setup API
 * Create and configure stores with Stripe Connect integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  createConnectAccount,
  createAccountLink,
  getAccountStatus,
} from '@/lib/stripe-connect';

// Mark this route as dynamic since it uses request.url
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { websiteId, storeName, storeDescription, currency, taxRate } = body;

    // Verify website ownership
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('id, name')
      .eq('id', websiteId)
      .eq('user_id', user.id)
      .single();

    if (websiteError || !website) {
      return NextResponse.json(
        { error: 'Website not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if store already exists for this website
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('website_id', websiteId)
      .single();

    if (existingStore) {
      return NextResponse.json(
        { error: 'Store already exists for this website' },
        { status: 409 }
      );
    }

    // Get user email
    const userEmail = user.email!;

    // Create Stripe Connect account
    let stripeAccountId: string | null = null;
    try {
      stripeAccountId = await createConnectAccount({
        email: userEmail,
        businessName: storeName || website.name,
      });
    } catch (error) {
      console.error('Failed to create Stripe account:', error);
      // Continue anyway - user can set up Stripe later
    }

    // Create store in database
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        website_id: websiteId,
        user_id: user.id,
        store_name: storeName || website.name,
        store_description: storeDescription,
        currency: currency || 'usd',
        tax_rate: taxRate || 0,
        stripe_account_id: stripeAccountId,
        platform_fee_percentage: 1.632, // As specified
      })
      .select()
      .single();

    if (storeError) {
      return NextResponse.json({ error: storeError.message }, { status: 400 });
    }

    // Generate onboarding link if Stripe account was created
    let onboardingUrl: string | null = null;
    if (stripeAccountId) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        onboardingUrl = await createAccountLink(
          stripeAccountId,
          `${baseUrl}/store/onboarding/refresh?storeId=${store.id}`,
          `${baseUrl}/store/onboarding/return?storeId=${store.id}`
        );
      } catch (error) {
        console.error('Failed to create onboarding link:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        store,
        onboardingUrl,
      },
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');

    if (!websiteId) {
      // Get all stores for user
      const { data: stores, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: stores,
      });
    }

    // Get store for specific website
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('website_id', websiteId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No store found
        return NextResponse.json({
          success: true,
          data: null,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get Stripe account status if account exists
    let accountStatus = null;
    if (store.stripe_account_id) {
      try {
        accountStatus = await getAccountStatus(store.stripe_account_id);
      } catch (error) {
        console.error('Failed to get account status:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...store,
        stripeStatus: accountStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    );
  }
}
