/**
 * Email utility — sends transactional emails via Resend REST API.
 * Set RESEND_API_KEY in your environment to enable.
 * If the key is absent, emails are skipped and a warning is logged (non-fatal).
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not configured — skipping email to', payload.to);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: payload.from ?? DEFAULT_FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[email] Failed to send email:', res.status, body);
    throw new Error(`Email send failed: ${res.status}`);
  }
}

/** Booking confirmation sent to the customer */
export function buildCustomerConfirmationEmail(data: {
  customerName: string;
  businessName: string;
  bookingDate: string;
  bookingTime: string;
  numberOfPeople: number;
  bookingType: string;
  specialRequests?: string | null;
}): Omit<EmailPayload, 'to'> {
  const subject = `Your booking at ${data.businessName} is confirmed`;
  const html = `
    <h2>Booking Confirmed</h2>
    <p>Hi ${data.customerName},</p>
    <p>Your <strong>${data.bookingType}</strong> booking at <strong>${data.businessName}</strong> has been confirmed.</p>
    <ul>
      <li><strong>Date:</strong> ${data.bookingDate}</li>
      <li><strong>Time:</strong> ${data.bookingTime}</li>
      <li><strong>Party size:</strong> ${data.numberOfPeople}</li>
      ${data.specialRequests ? `<li><strong>Special requests:</strong> ${data.specialRequests}</li>` : ''}
    </ul>
    <p>If you need to make any changes, please contact us directly.</p>
    <p>We look forward to seeing you!</p>
  `;
  return { subject, html };
}

/** Booking notification sent to the website owner */
export function buildOwnerNotificationEmail(data: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  businessName: string;
  bookingDate: string;
  bookingTime: string;
  numberOfPeople: number;
  bookingType: string;
  specialRequests?: string | null;
}): Omit<EmailPayload, 'to'> {
  const subject = `New booking: ${data.customerName} — ${data.bookingDate} at ${data.bookingTime}`;
  const html = `
    <h2>New Booking Received</h2>
    <p>A new <strong>${data.bookingType}</strong> booking has been made for <strong>${data.businessName}</strong>.</p>
    <h3>Customer Details</h3>
    <ul>
      <li><strong>Name:</strong> ${data.customerName}</li>
      <li><strong>Email:</strong> ${data.customerEmail}</li>
      ${data.customerPhone ? `<li><strong>Phone:</strong> ${data.customerPhone}</li>` : ''}
    </ul>
    <h3>Booking Details</h3>
    <ul>
      <li><strong>Date:</strong> ${data.bookingDate}</li>
      <li><strong>Time:</strong> ${data.bookingTime}</li>
      <li><strong>Party size:</strong> ${data.numberOfPeople}</li>
      ${data.specialRequests ? `<li><strong>Special requests:</strong> ${data.specialRequests}</li>` : ''}
    </ul>
  `;
  return { subject, html };
}
