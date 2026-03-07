/**
 * Order Email Service
 * Sends transactional emails for order lifecycle events
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for email triggers
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface OrderEmailData {
  orderId: string
  orderNumber: string
  customerEmail: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    price: number
    variant?: string
    image?: string
  }>
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  storeName: string
  storeEmail?: string
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

/**
 * Generate order confirmation email template
 */
function generateOrderConfirmationEmail(data: OrderEmailData): EmailTemplate {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : ''}
          <div>
            <strong>${item.name}</strong>
            ${item.variant ? `<br><span style="color: #6b7280; font-size: 14px;">${item.variant}</span>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  const itemsText = data.items.map(item =>
    `${item.name}${item.variant ? ` (${item.variant})` : ''} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Thank you for your purchase</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Hi ${data.customerName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        We've received your order and it's being processed. You'll receive another email when your order ships.
      </p>

      <!-- Order Number -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="color: #6b7280; margin: 0 0 8px; font-size: 14px;">Order Number</p>
        <p style="color: #111827; margin: 0; font-size: 24px; font-weight: bold;">${data.orderNumber}</p>
      </div>

      <!-- Order Items -->
      <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px;">Order Summary</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Item</th>
            <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Qty</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
            <td style="padding: 8px 0; text-align: right; color: #374151;">$${data.subtotal.toFixed(2)}</td>
          </tr>
          ${data.discount > 0 ? `
          <tr>
            <td style="padding: 8px 0; color: #10b981;">Discount</td>
            <td style="padding: 8px 0; text-align: right; color: #10b981;">-$${data.discount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Shipping</td>
            <td style="padding: 8px 0; text-align: right; color: #374151;">${data.shipping > 0 ? `$${data.shipping.toFixed(2)}` : 'Free'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Tax</td>
            <td style="padding: 8px 0; text-align: right; color: #374151;">$${data.tax.toFixed(2)}</td>
          </tr>
          <tr style="font-size: 18px; font-weight: bold;">
            <td style="padding: 16px 0 0; color: #111827;">Total</td>
            <td style="padding: 16px 0 0; text-align: right; color: #2563eb;">$${data.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px;">Shipping Address</h2>
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px;">
        <p style="margin: 0; color: #374151; line-height: 1.6;">
          ${data.customerName}<br>
          ${data.shippingAddress.line1}<br>
          ${data.shippingAddress.line2 ? `${data.shippingAddress.line2}<br>` : ''}
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
          ${data.shippingAddress.country}
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Questions about your order? Contact us at ${data.storeEmail || 'support@example.com'}
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0;">
          ${data.storeName}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `

  const text = `
Order Confirmed! 🎉

Hi ${data.customerName},

Thank you for your order! We've received it and it's being processed.

Order Number: ${data.orderNumber}

Order Summary:
${itemsText}

Subtotal: $${data.subtotal.toFixed(2)}
${data.discount > 0 ? `Discount: -$${data.discount.toFixed(2)}` : ''}
Shipping: ${data.shipping > 0 ? `$${data.shipping.toFixed(2)}` : 'Free'}
Tax: $${data.tax.toFixed(2)}
Total: $${data.total.toFixed(2)}

Shipping Address:
${data.customerName}
${data.shippingAddress.line1}
${data.shippingAddress.line2 ? data.shippingAddress.line2 + '\n' : ''}${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}
${data.shippingAddress.country}

Questions? Contact us at ${data.storeEmail || 'support@example.com'}

${data.storeName}
  `

  return {
    subject: `Order Confirmed - ${data.orderNumber}`,
    html,
    text,
  }
}

/**
 * Generate shipping confirmation email template
 */
function generateShippingConfirmationEmail(data: OrderEmailData): EmailTemplate {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Your Order Has Shipped! 📦</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">It's on its way to you</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Hi ${data.customerName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Great news! Your order <strong>${data.orderNumber}</strong> has been shipped and is on its way to you.
      </p>

      ${data.trackingNumber ? `
      <!-- Tracking Info -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #6b7280; margin: 0 0 8px; font-size: 14px;">Tracking Number</p>
        <p style="color: #111827; margin: 0 0 16px; font-size: 20px; font-weight: bold;">${data.trackingNumber}</p>
        ${data.carrier ? `<p style="color: #6b7280; margin: 0 0 16px; font-size: 14px;">Carrier: ${data.carrier}</p>` : ''}
        ${data.trackingUrl ? `
        <a href="${data.trackingUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Track Your Package
        </a>
        ` : ''}
      </div>
      ` : ''}

      <!-- Shipping Address -->
      <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px;">Shipping To</h2>
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px;">
        <p style="margin: 0; color: #374151; line-height: 1.6;">
          ${data.customerName}<br>
          ${data.shippingAddress.line1}<br>
          ${data.shippingAddress.line2 ? `${data.shippingAddress.line2}<br>` : ''}
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
          ${data.shippingAddress.country}
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Questions about your shipment? Contact us at ${data.storeEmail || 'support@example.com'}
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0;">
          ${data.storeName}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `

  const text = `
Your Order Has Shipped! 📦

Hi ${data.customerName},

Great news! Your order ${data.orderNumber} has been shipped and is on its way to you.

${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}` : ''}
${data.carrier ? `Carrier: ${data.carrier}` : ''}
${data.trackingUrl ? `Track your package: ${data.trackingUrl}` : ''}

Shipping To:
${data.customerName}
${data.shippingAddress.line1}
${data.shippingAddress.line2 ? data.shippingAddress.line2 + '\n' : ''}${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}
${data.shippingAddress.country}

Questions? Contact us at ${data.storeEmail || 'support@example.com'}

${data.storeName}
  `

  return {
    subject: `Your Order Has Shipped - ${data.orderNumber}`,
    html,
    text,
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const template = generateOrderConfirmationEmail(data)

    // Use Supabase Edge Function or Resend/SendGrid
    // For now, we'll use a simple fetch to a configured email endpoint
    const emailEndpoint = process.env.EMAIL_API_ENDPOINT
    const emailApiKey = process.env.EMAIL_API_KEY

    if (!emailEndpoint) {
      console.log('Email endpoint not configured, logging email instead:')
      console.log('To:', data.customerEmail)
      console.log('Subject:', template.subject)
      return { success: true }
    }

    const response = await fetch(emailEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${emailApiKey}`,
      },
      body: JSON.stringify({
        to: data.customerEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Email API returned ${response.status}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send shipping confirmation email
 */
export async function sendShippingConfirmationEmail(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const template = generateShippingConfirmationEmail(data)

    const emailEndpoint = process.env.EMAIL_API_ENDPOINT
    const emailApiKey = process.env.EMAIL_API_KEY

    if (!emailEndpoint) {
      console.log('Email endpoint not configured, logging email instead:')
      console.log('To:', data.customerEmail)
      console.log('Subject:', template.subject)
      return { success: true }
    }

    const response = await fetch(emailEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${emailApiKey}`,
      },
      body: JSON.stringify({
        to: data.customerEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Email API returned ${response.status}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error sending shipping confirmation email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get order data from database and format for email
 */
export async function getOrderEmailData(orderId: string, storeName: string, storeEmail?: string): Promise<OrderEmailData | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      return null
    }

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      items: order.order_items.map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.unit_price,
        variant: item.variant_title,
        image: item.product_image,
      })),
      subtotal: order.subtotal,
      tax: order.tax_amount,
      shipping: order.shipping_amount,
      discount: order.discount_amount || 0,
      total: order.total,
      shippingAddress: {
        line1: order.shipping_address_line1,
        line2: order.shipping_address_line2,
        city: order.shipping_city,
        state: order.shipping_state,
        postalCode: order.shipping_postal_code,
        country: order.shipping_country,
      },
      storeName,
      storeEmail,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      carrier: order.carrier,
    }
  } catch (error) {
    console.error('Error getting order email data:', error)
    return null
  }
}
