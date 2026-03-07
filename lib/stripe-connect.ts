/**
 * Stripe Connect Integration
 * Handles multi-vendor payments with platform fees
 */

import Stripe from 'stripe';

// Validate API key on initialization
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('CRITICAL: STRIPE_SECRET_KEY environment variable is not set!');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreateConnectAccountParams {
  email: string;
  businessName: string;
  country?: string;
}

export interface CreatePaymentIntentParams {
  amount: number; // in cents
  currency: string;
  stripeAccountId: string;
  platformFeePercentage: number;
  metadata?: Record<string, string>;
  customerEmail?: string;
}

/**
 * Create a Stripe Connect Express account for a store owner
 */
export async function createConnectAccount(params: CreateConnectAccountParams): Promise<string> {
  const { email, businessName, country = 'US' } = params;

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        name: businessName,
      },
    });

    return account.id;
  } catch (error) {
    console.error('Error creating Connect account:', error);
    throw new Error('Failed to create Connect account');
  }
}

/**
 * Generate an account link for onboarding
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw new Error('Failed to create account link');
  }
}

/**
 * Get account status and capabilities
 */
export async function getAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements,
    };
  } catch (error) {
    console.error('Error retrieving account status:', error);
    throw new Error('Failed to retrieve account status');
  }
}

/**
 * Create a login link for the Connect Express dashboard
 */
export async function createDashboardLink(accountId: string): Promise<string> {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  } catch (error) {
    console.error('Error creating dashboard link:', error);
    throw new Error('Failed to create dashboard link');
  }
}

/**
 * Create a payment intent with platform fee (application fee)
 * This charges the customer and automatically splits the payment
 */
export async function createPaymentIntentWithFee(
  params: CreatePaymentIntentParams
): Promise<Stripe.PaymentIntent> {
  const { amount, currency, stripeAccountId, platformFeePercentage, metadata, customerEmail } = params;

  // Calculate platform fee
  const platformFee = Math.round(amount * (platformFeePercentage / 100));

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency,
        application_fee_amount: platformFee,
        metadata: {
          ...metadata,
          platform_fee: platformFee.toString(),
          platform_fee_percentage: platformFeePercentage.toString(),
        },
        receipt_email: customerEmail,
        transfer_data: {
          destination: stripeAccountId,
        },
      }
    );

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent with fee:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Create a direct charge on a connected account (alternative to payment intents)
 * This is useful for immediate charges
 */
export async function createDirectCharge(params: {
  amount: number;
  currency: string;
  source: string; // payment method ID
  stripeAccountId: string;
  platformFeePercentage: number;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Charge> {
  const { amount, currency, source, stripeAccountId, platformFeePercentage, description, metadata } = params;

  const platformFee = Math.round(amount * (platformFeePercentage / 100));

  try {
    const charge = await stripe.charges.create(
      {
        amount,
        currency,
        source,
        description,
        application_fee_amount: platformFee,
        metadata,
      },
      {
        stripeAccount: stripeAccountId,
      }
    );

    return charge;
  } catch (error) {
    console.error('Error creating direct charge:', error);
    throw new Error('Failed to create charge');
  }
}

/**
 * Create a refund for an order
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // If not specified, refunds the entire amount
      reason,
    });

    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
}

/**
 * Get balance for a connected account
 */
export async function getAccountBalance(accountId: string) {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    return balance;
  } catch (error) {
    console.error('Error retrieving account balance:', error);
    throw new Error('Failed to retrieve account balance');
  }
}

/**
 * List payouts for a connected account
 */
export async function listPayouts(accountId: string, limit = 10) {
  try {
    const payouts = await stripe.payouts.list(
      {
        limit,
      },
      {
        stripeAccount: accountId,
      }
    );

    return payouts;
  } catch (error) {
    console.error('Error listing payouts:', error);
    throw new Error('Failed to list payouts');
  }
}

/**
 * Delete/deactivate a connected account
 */
export async function deleteConnectAccount(accountId: string): Promise<boolean> {
  try {
    await stripe.accounts.del(accountId);
    return true;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new Error('Failed to delete account');
  }
}

/**
 * Calculate platform fee and merchant payout
 */
export function calculateFees(amount: number, platformFeePercentage: number) {
  const platformFee = Math.round(amount * (platformFeePercentage / 100));
  const merchantPayout = amount - platformFee;

  return {
    amount,
    platformFee,
    merchantPayout,
    platformFeePercentage,
  };
}

/**
 * Verify webhook signature for Connect events
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

export default {
  createConnectAccount,
  createAccountLink,
  getAccountStatus,
  createDashboardLink,
  createPaymentIntentWithFee,
  createDirectCharge,
  createRefund,
  getAccountBalance,
  listPayouts,
  deleteConnectAccount,
  calculateFees,
  verifyWebhookSignature,
};
