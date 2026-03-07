import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendEmail, buildCustomerConfirmationEmail, buildOwnerNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const body = await request.json()
    const {
      websiteId,
      bookingType,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate,
      bookingTime,
      numberOfPeople,
      specialRequests,
    } = body

    // Validate required fields
    if (!websiteId || !customerName || !customerEmail || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify website exists
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('id, name, user_id')
      .eq('id', websiteId)
      .single()

    if (websiteError || !website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      )
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        website_id: websiteId,
        booking_type: bookingType || 'table',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        booking_date: bookingDate,
        booking_time: bookingTime,
        number_of_people: numberOfPeople || 1,
        special_requests: specialRequests || null,
        status: 'pending',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Send confirmation email to customer and notification to owner (non-fatal)
    const emailData = {
      customerName,
      customerEmail,
      customerPhone: customerPhone ?? null,
      businessName: website.name,
      bookingDate,
      bookingTime,
      numberOfPeople: numberOfPeople || 1,
      bookingType: bookingType || 'table',
      specialRequests: specialRequests ?? null,
    }

    await Promise.allSettled([
      sendEmail({ ...buildCustomerConfirmationEmail(emailData), to: customerEmail }),
      // Fetch owner email from users table
      (async () => {
        const { data: ownerUser } = await supabase
          .from('users')
          .select('email')
          .eq('id', website.user_id)
          .single()
        if (ownerUser?.email) {
          await sendEmail({ ...buildOwnerNotificationEmail(emailData), to: ownerUser.email })
        }
      })(),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`[bookings] Email ${i === 0 ? 'customer' : 'owner'} send failed:`, r.reason)
        }
      })
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        status: booking.status,
      },
    })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
