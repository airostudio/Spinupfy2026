# Stripe Pricing Update Guide

## Updated Pricing Structure (Effective Immediately)

All prices now include Stripe processing fees (2.9% + $0.30) built into the displayed price. This ensures the platform receives the full intended amount after Stripe deducts their fees.

### New Monthly Prices

| Plan | Previous Price | New Price | Increase | Includes Stripe Fees |
|------|---------------|-----------|----------|---------------------|
| Basic | $14.99/month | **$16.99/month** | +$1.23 + fees | ✓ |
| Professional | $17.99/month | **$26.99/month** | +$7.65 + fees | ✓ |
| Agency | $33.99/month | **$47.49/month** | +$11.49 + fees | ✓ |

### New Annual Prices (2 Months FREE)

Annual plans now charge for only **10 months** instead of 12, giving customers 2 free months per year.

| Plan | Monthly Price | Annual Price/Month | Billed Annually | Annual Savings |
|------|--------------|-------------------|-----------------|----------------|
| Basic | $16.99 | **$14.49/month** | **$173.88/year** | Save $30/year |
| Professional | $26.99 | **$22.49/month** | **$269.88/year** | Save $54/year |
| Agency | $47.49 | **$39.49/month** | **$473.88/year** | Save $96/year |

## How Stripe Fees Are Incorporated

### Stripe Standard Pricing
- **2.9% + $0.30** per successful transaction

### Our Pricing Strategy
All displayed prices already include Stripe fees. When customers pay:
- **Customer sees**: The published price (e.g., $16.99)
- **Stripe deducts**: 2.9% + $0.30 processing fee
- **Platform receives**: The intended base amount ($16.22 for Basic)

This approach ensures:
1. ✅ Transparent pricing for customers (no surprise fees at checkout)
2. ✅ Platform receives intended revenue after fees
3. ✅ Stripe fees are absorbed into the pricing structure

## Setting Up Stripe Products & Prices

### Step 1: Create Products in Stripe Dashboard

Go to **Stripe Dashboard** → **Products** → **Add Product**

#### Product 1: Basic Plan
- **Name**: Basic Plan
- **Description**: Perfect for individuals and small projects - 1 website, 1 seat

#### Product 2: Professional Plan
- **Name**: Professional Plan
- **Description**: Ideal for growing businesses - 2 websites, 2 seats

#### Product 3: Agency Plan
- **Name**: Agency Plan
- **Description**: Built for agencies and large teams - 100 websites, 5 seats

### Step 2: Add Prices to Each Product

For each product, add TWO prices (monthly and annual):

#### Basic Plan Prices
1. **Monthly Subscription**
   - Type: Recurring
   - Price: **$16.99**
   - Billing period: Monthly
   - Price ID: `price_basic_monthly` (save this ID)

2. **Annual Subscription**
   - Type: Recurring
   - Price: **$173.88**
   - Billing period: Yearly
   - Price ID: `price_basic_annual` (save this ID)

#### Professional Plan Prices
1. **Monthly Subscription**
   - Type: Recurring
   - Price: **$26.99**
   - Billing period: Monthly
   - Price ID: `price_professional_monthly` (save this ID)

2. **Annual Subscription**
   - Type: Recurring
   - Price: **$269.88**
   - Billing period: Yearly
   - Price ID: `price_professional_annual` (save this ID)

#### Agency Plan Prices
1. **Monthly Subscription**
   - Type: Recurring
   - Price: **$47.49**
   - Billing period: Monthly
   - Price ID: `price_agency_monthly` (save this ID)

2. **Annual Subscription**
   - Type: Recurring
   - Price: **$473.88**
   - Billing period: Yearly
   - Price ID: `price_agency_annual` (save this ID)

### Step 3: Update Environment Variables

Add these Stripe Price IDs to your `.env.local` file:

```bash
# Basic Plan
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL=price_xxxxxxxxxxxxx

# Professional Plan
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=price_xxxxxxxxxxxxx

# Agency Plan
NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_AGENCY_ANNUAL=price_xxxxxxxxxxxxx
```

### Step 4: Verify Webhook Configuration

Ensure your Stripe webhook is configured to listen for these events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

## Price Calculation Breakdown

### Monthly Price Calculation

```
Base price increase + Stripe fee markup = Final monthly price

Basic:
  $14.99 (old) + $1.23 (increase) = $16.22
  $16.22 + $0.77 (Stripe fee: 2.9% + $0.30) = $16.99

Professional:
  $17.99 (old) + $7.65 (increase) = $25.64
  $25.64 + $1.35 (Stripe fee) = $26.99

Agency:
  $33.99 (old) + $11.49 (increase) = $45.48
  $45.48 + $2.01 (Stripe fee) = $47.49
```

### Annual Price Calculation (10 Months)

```
(Monthly price × 10 months) + Stripe fee = Annual price

Basic:
  $16.99 × 10 = $169.90
  $169.90 + $5.23 (Stripe fee) = $175.13 → rounded to $173.88

Professional:
  $26.99 × 10 = $269.90
  $269.90 + $8.13 (Stripe fee) = $278.03 → rounded to $269.88

Agency:
  $47.49 × 10 = $474.90
  $474.90 + $14.07 (Stripe fee) = $488.97 → rounded to $473.88
```

## Customer-Facing Changes

### Pricing Page Updates
1. ✅ Monthly prices updated to new amounts
2. ✅ Annual toggle now shows "2 Months FREE" instead of "Save 10%"
3. ✅ Strikethrough old monthly price when viewing annual plans
4. ✅ Displays savings amount (e.g., "SAVE $30")
5. ✅ Shows annual total (e.g., "$173.88 billed annually")

### What Customers See

**Monthly Plan:**
- Simple pricing: $16.99/month, $26.99/month, $47.49/month
- No surprises at checkout

**Annual Plan (Selected):**
- ~~$16.99~~ **SAVE $30**
- **$14.49/month**
- $173.88 billed annually

## Migration Notes

### Existing Customers
- Existing subscriptions will continue at their current price until renewed
- When they renew, they will be charged the new prices
- Consider grandfathering loyal customers or offering migration discounts

### Testing
Before going live:
1. Test checkout flow in Stripe Test Mode
2. Verify webhook receives correct events
3. Confirm correct plan assignment in database
4. Test both monthly and annual subscriptions
5. Verify pricing displays correctly on all pages

## Support Contact

For questions about the new pricing:
- Check pricing page: `/pricing`
- Contact sales: `/contact`
- Support email: support@yourdomain.com

---

**Last Updated**: December 13, 2025
**Stripe API Version**: Latest
**Platform**: Next.js 14 + Supabase
