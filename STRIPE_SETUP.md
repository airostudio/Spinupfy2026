# Stripe Subscription Setup Guide

This guide will help you set up Stripe subscriptions for your AI Website Builder.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Your Stripe API keys (Secret key and Publishable key)
3. Access to your server to deploy the webhook endpoint

## Step 1: Create Products and Prices in Stripe

### 1.1 Go to Stripe Dashboard
Navigate to: [https://dashboard.stripe.com/products](https://dashboard.stripe.com/products)

### 1.2 Create Three Products

#### Product 1: Starter Plan
- **Name**: Starter Plan
- **Description**: Perfect for individuals and small businesses
- **Pricing**:
  - Monthly: $14.99/month (recurring)
  - Annual: $13.49/month (billed annually at $161.88/year)

#### Product 2: Pro Plan
- **Name**: Pro Plan
- **Description**: For growing businesses with more needs
- **Pricing**:
  - Monthly: $17.99/month (recurring)
  - Annual: $16.19/month (billed annually at $194.28/year)

#### Product 3: Enterprise Plan
- **Name**: Enterprise Plan
- **Description**: For agencies and large organizations
- **Pricing**:
  - Monthly: $33.99/month (recurring)
  - Annual: $30.59/month (billed annually at $367.08/year)

### 1.3 Copy Price IDs
After creating each price, copy the Price ID (starts with `price_`). You'll need these for your environment variables.

## Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root and add:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY=price_xxxxxx
NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL=price_xxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=price_xxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_ANNUAL=price_xxxxxx
```

## Step 3: Configure Stripe Webhook

### 3.1 Deploy Your Application
First, deploy your application to production so Stripe can reach your webhook endpoint.

### 3.2 Add Webhook Endpoint in Stripe
1. Go to: [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"

### 3.3 Get Webhook Signing Secret
1. After creating the webhook, click on it
2. Click "Reveal" next to "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Step 4: Create Payment Links (Optional)

For quick checkout, you can create payment links:

1. Go to: [https://dashboard.stripe.com/payment-links](https://dashboard.stripe.com/payment-links)
2. Click "Create payment link"
3. Select your product and price
4. Configure:
   - Enable "Collect customer addresses"
   - After payment: Redirect to `https://yourdomain.com/dashboard`
5. Copy the payment link URL

You already have this set up:
```
https://buy.stripe.com/bJefZieiVfcq7HgefB5Vu00
```

## Step 5: Test the Integration

### 5.1 Test in Stripe Test Mode
Use test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- Use any future date for expiry
- Use any 3-digit CVC

### 5.2 Test Webhook Locally
For local development, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook secret for local testing.

### 5.3 Test the Flow
1. Go to Settings page as a FREE user
2. Click "Upgrade Plan"
3. Complete checkout with test card
4. Verify user plan updates in database
5. Check webhook logs in Stripe Dashboard

## Step 6: Go Live

### 6.1 Switch to Live Mode
1. In Stripe Dashboard, toggle from "Test mode" to "Live mode"
2. Create the same products and prices in live mode
3. Update your `.env.local` with live keys and price IDs
4. Update webhook endpoint with live keys

### 6.2 Update Payment Link
Create a new payment link in live mode and update the URL in:
- `/app/settings/page.tsx` (line 94)

## Webhook Events Handled

Your application handles these Stripe events:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | User completes initial payment - activate subscription |
| `customer.subscription.created` | New subscription created |
| `customer.subscription.updated` | Subscription changed (upgrade/downgrade) |
| `customer.subscription.deleted` | Subscription canceled - revert to FREE plan |
| `invoice.payment_succeeded` | Recurring payment successful - renew subscription |
| `invoice.payment_failed` | Payment failed - notify user |

## Plan Features

| Feature | FREE | STARTER | PRO | ENTERPRISE |
|---------|------|---------|-----|------------|
| Websites | 1 | 5 | 20 | Unlimited |
| AI Generations | 10 | 100 | 500 | 10,000 |
| Custom Domain | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |

## Troubleshooting

### Webhook Not Receiving Events
1. Check webhook endpoint is publicly accessible
2. Verify webhook secret is correct
3. Check Stripe Dashboard > Webhooks for delivery attempts
4. Check server logs for errors

### User Plan Not Updating
1. Check webhook is receiving events (Stripe Dashboard)
2. Verify `stripe_customer_id` is saved in users table
3. Check application logs for database errors
4. Ensure price IDs match in `stripe-config.ts`

### Testing Webhooks Locally
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

## Security Notes

1. ✅ Webhook signature verification is enabled
2. ✅ All API calls use server-side authentication
3. ✅ Customer IDs are securely stored
4. ✅ Payment data never touches your servers (handled by Stripe)

## Support

- Stripe Docs: [https://stripe.com/docs](https://stripe.com/docs)
- Stripe Support: [https://support.stripe.com](https://support.stripe.com)
- Test Cards: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
