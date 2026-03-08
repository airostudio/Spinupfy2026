/**
 * Spinupfy Lifecycle API
 *
 * Called by a cron job (e.g. Vercel Cron, Supabase Edge Functions, or
 * an external scheduler) to:
 *   1. Send 3-day and 1-day reminder emails before expiry
 *   2. Suspend sites that have passed their end_date
 *   3. Delete sites that have been suspended for 5+ days
 *
 * Protect this endpoint with a shared secret (SPINUPFY_CRON_SECRET env var).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const SUSPENSION_GRACE_DAYS = 5

// Note: For cron-job context we re-use the server client.
// In production, replace with a service-role client to bypass RLS:
// import { createClient } from '@supabase/supabase-js'
// const getServiceClient = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function getServiceClient() {
  return await createServerSupabaseClient()
}

async function sendLifecycleEmail(params: {
  to: string
  name: string
  type: '3day_reminder' | '1day_reminder' | 'expired' | 'deleted'
  siteName: string
  siteUrl: string
  endDate: Date
  extendUrl: string
}) {
  // In production, integrate with your SMTP / email provider here.
  // The structure below is provider-agnostic and logs to console in dev.
  const subjects: Record<string, string> = {
    '3day_reminder': `⏰ Your Spinupfy site "${params.siteName}" expires in 3 days`,
    '1day_reminder': `🚨 Last chance — "${params.siteName}" expires tomorrow`,
    'expired':       `😴 Your Spinupfy site "${params.siteName}" has been suspended`,
    'deleted':       `🗑️ Your Spinupfy site "${params.siteName}" has been deleted`,
  }

  const bodies: Record<string, string> = {
    '3day_reminder': `Hi ${params.name},\n\nYour site at ${params.siteUrl} will expire on ${params.endDate.toLocaleDateString()}.\n\nWant to keep it live? Extend now: ${params.extendUrl}\n\nIf you don't extend, your site will be suspended on expiry and permanently deleted 5 days later.\n\nThe Spinupfy Team`,
    '1day_reminder': `Hi ${params.name},\n\nYour site at ${params.siteUrl} expires TOMORROW (${params.endDate.toLocaleDateString()}).\n\nExtend now before it's too late: ${params.extendUrl}\n\nThe Spinupfy Team`,
    'expired':       `Hi ${params.name},\n\nYour Spinupfy site "${params.siteName}" has been suspended because the allocated time period has ended.\n\nYou have 5 days to extend and reactivate it before it's permanently deleted.\n\nExtend now: ${params.extendUrl}\n\nThe Spinupfy Team`,
    'deleted':       `Hi ${params.name},\n\nYour Spinupfy site "${params.siteName}" has been permanently deleted after the 5-day grace period.\n\nCreate a new site anytime at spinupfy.io\n\nThe Spinupfy Team`,
  }

  console.log(`[Spinupfy Lifecycle Email] To: ${params.to} | Subject: ${subjects[params.type]}`)

  // TODO: plug in your email sending library here, e.g.:
  // await sendEmail({ to: params.to, subject: subjects[params.type], text: bodies[params.type] })

  return { subject: subjects[params.type], body: bodies[params.type] }
}

export async function POST(req: NextRequest) {
  // Validate cron secret
  const secret = req.headers.get('x-cron-secret')
  const cronSecret = (process.env as Record<string, string>)['SPINUPFY_CRON_SECRET']
  if (secret !== cronSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await getServiceClient()
  const now = new Date()
  const results = {
    reminders3day: 0,
    reminders1day: 0,
    suspended: 0,
    deleted: 0,
    errors: [] as string[],
  }

  const appUrl = (process.env as Record<string, string>)['NEXT_PUBLIC_APP_URL'] || 'https://spinupfy.io'

  try {
    // ── 1. Send 3-day reminders ────────────────────────────────────────────
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const { data: remind3, error: r3Err } = await supabase
      .from('spinupfy_sites')
      .select('*')
      .eq('status', 'active')
      .eq('reminder_3day_sent', false)
      .lte('end_date', in3Days.toISOString())
      .gt('end_date', now.toISOString())

    if (r3Err) results.errors.push(`3day fetch: ${r3Err.message}`)

    for (const site of remind3 || []) {
      try {
        await sendLifecycleEmail({
          to: site.contact_email,
          name: site.contact_name || 'there',
          type: '3day_reminder',
          siteName: site.name,
          siteUrl: `https://${site.subdomain}.spinupfy.io`,
          endDate: new Date(site.end_date),
          extendUrl: `${appUrl}/spinupfy/extend/${site.id}`,
        })
        await supabase
          .from('spinupfy_sites')
          .update({ reminder_3day_sent: true })
          .eq('id', site.id)
        results.reminders3day++
      } catch (e) {
        results.errors.push(`3day email for ${site.id}: ${e}`)
      }
    }

    // ── 2. Send 1-day reminders ────────────────────────────────────────────
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    const { data: remind1, error: r1Err } = await supabase
      .from('spinupfy_sites')
      .select('*')
      .eq('status', 'active')
      .eq('reminder_1day_sent', false)
      .lte('end_date', in1Day.toISOString())
      .gt('end_date', now.toISOString())

    if (r1Err) results.errors.push(`1day fetch: ${r1Err.message}`)

    for (const site of remind1 || []) {
      try {
        await sendLifecycleEmail({
          to: site.contact_email,
          name: site.contact_name || 'there',
          type: '1day_reminder',
          siteName: site.name,
          siteUrl: `https://${site.subdomain}.spinupfy.io`,
          endDate: new Date(site.end_date),
          extendUrl: `${appUrl}/spinupfy/extend/${site.id}`,
        })
        await supabase
          .from('spinupfy_sites')
          .update({ reminder_1day_sent: true })
          .eq('id', site.id)
        results.reminders1day++
      } catch (e) {
        results.errors.push(`1day email for ${site.id}: ${e}`)
      }
    }

    // ── 3. Suspend expired active sites ────────────────────────────────────
    const { data: toSuspend, error: suspErr } = await supabase
      .from('spinupfy_sites')
      .select('*')
      .eq('status', 'active')
      .lte('end_date', now.toISOString())

    if (suspErr) results.errors.push(`suspend fetch: ${suspErr.message}`)

    for (const site of toSuspend || []) {
      try {
        await supabase
          .from('spinupfy_sites')
          .update({
            status: 'suspended',
            suspended_at: now.toISOString(),
          })
          .eq('id', site.id)

        // Also update the linked website if any
        if (site.website_id) {
          await supabase
            .from('websites')
            .update({ published: false })
            .eq('id', site.website_id)
        }

        await sendLifecycleEmail({
          to: site.contact_email,
          name: site.contact_name || 'there',
          type: 'expired',
          siteName: site.name,
          siteUrl: `https://${site.subdomain}.spinupfy.io`,
          endDate: new Date(site.end_date),
          extendUrl: `${appUrl}/spinupfy/extend/${site.id}`,
        })

        results.suspended++
      } catch (e) {
        results.errors.push(`suspend ${site.id}: ${e}`)
      }
    }

    // ── 4. Delete sites suspended for 5+ days ──────────────────────────────
    const graceCutoff = new Date(now.getTime() - SUSPENSION_GRACE_DAYS * 24 * 60 * 60 * 1000)
    const { data: toDelete, error: delErr } = await supabase
      .from('spinupfy_sites')
      .select('*')
      .eq('status', 'suspended')
      .lte('suspended_at', graceCutoff.toISOString())

    if (delErr) results.errors.push(`delete fetch: ${delErr.message}`)

    for (const site of toDelete || []) {
      try {
        await supabase
          .from('spinupfy_sites')
          .update({
            status: 'deleted',
            deleted_at: now.toISOString(),
          })
          .eq('id', site.id)

        // Hard delete the underlying website record
        if (site.website_id) {
          await supabase
            .from('websites')
            .delete()
            .eq('id', site.website_id)
        }

        await sendLifecycleEmail({
          to: site.contact_email,
          name: site.contact_name || 'there',
          type: 'deleted',
          siteName: site.name,
          siteUrl: `https://${site.subdomain}.spinupfy.io`,
          endDate: new Date(site.end_date),
          extendUrl: `${appUrl}/spinupfy/create`,
        })

        results.deleted++
      } catch (e) {
        results.errors.push(`delete ${site.id}: ${e}`)
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    })
  } catch (error) {
    console.error('Spinupfy lifecycle cron error:', error)
    return NextResponse.json({ error: 'Lifecycle processing failed', results }, { status: 500 })
  }
}

// Allow GET for health-check pings (no auth required for health check)
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'spinupfy-lifecycle' })
}
