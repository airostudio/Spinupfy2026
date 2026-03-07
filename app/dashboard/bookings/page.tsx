'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Calendar, Clock, Users, Mail, Phone, User, Check, X, Clock3, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  website_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  booking_type: string
  booking_date: string
  booking_time: string
  duration_minutes: number
  number_of_people: number
  special_requests: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  created_at: string
  website: {
    name: string
    slug: string
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [websites, setWebsites] = useState<any[]>([])
  const [selectedWebsiteFilter, setSelectedWebsiteFilter] = useState<string>('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')

  const supabase = createClient()

  useEffect(() => {
    loadBookings()
    loadWebsites()
  }, [])

  async function loadWebsites() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('websites')
      .select('id, name, slug')
      .eq('user_id', session.user.id)
      .order('name')

    if (data) {
      setWebsites(data)
    }
  }

  async function loadBookings() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('You must be logged in to view bookings')
        return
      }

      // Get user's websites first
      const { data: userWebsites } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', session.user.id)

      if (!userWebsites || userWebsites.length === 0) {
        setBookings([])
        return
      }

      const websiteIds = userWebsites.map(w => w.id)

      // Get all bookings for user's websites
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          website:websites(name, slug)
        `)
        .in('website_id', websiteIds)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false })

      if (error) {
        console.error('Error loading bookings:', error)
        toast.error('Failed to load bookings')
        return
      }

      setBookings(data || [])
    } finally {
      setLoading(false)
    }
  }

  async function updateBookingStatus(bookingId: string, status: Booking['status']) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const updateData: any = { status, updated_at: new Date().toISOString() }

      // If confirming, set confirmed_at and confirmed_by
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
        updateData.confirmed_by = session.user.id
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)

      if (error) {
        toast.error('Failed to update booking status')
        return
      }

      toast.success(`Booking ${status}`)
      loadBookings()
      setSelectedBooking(null)
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('An error occurred')
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (selectedWebsiteFilter !== 'all' && booking.website_id !== selectedWebsiteFilter) {
      return false
    }
    if (selectedStatusFilter !== 'all' && booking.status !== selectedStatusFilter) {
      return false
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'confirmed': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'no-show': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getBookingTypeLabel = (type: string) => {
    switch (type) {
      case 'table': return 'Table Reservation'
      case 'appointment': return 'Appointment'
      case 'viewing': return 'Property Viewing'
      case 'service': return 'Service Booking'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Booking Management</h1>
          <p className="text-gray-400">Manage reservations and appointments for your websites</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Website</label>
            <select
              value={selectedWebsiteFilter}
              onChange={(e) => setSelectedWebsiteFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Websites</option>
              {websites.map(website => (
                <option key={website.id} value={website.id}>{website.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Status</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Bookings</div>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </div>
          <div className="bg-gray-900 border border-yellow-500/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-300">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
          </div>
          <div className="bg-gray-900 border border-green-500/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Confirmed</div>
            <div className="text-2xl font-bold text-green-300">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
          </div>
          <div className="bg-gray-900 border border-blue-500/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Completed</div>
            <div className="text-2xl font-bold text-blue-300">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
          </div>
          <div className="bg-gray-900 border border-red-500/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Cancelled</div>
            <div className="text-2xl font-bold text-red-300">
              {bookings.filter(b => b.status === 'cancelled').length}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-gray-400">
              Bookings from your websites will appear here
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Website</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">People</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{booking.customer_name}</div>
                        <div className="text-sm text-gray-400">{booking.customer_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{booking.website.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getBookingTypeLabel(booking.booking_type)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{booking.booking_time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{booking.number_of_people}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-gray-800 my-8">
              {/* Header */}
              <div className="border-b border-gray-800 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Booking Details</h2>
                  <p className="text-gray-400 text-sm">
                    {getBookingTypeLabel(selectedBooking.booking_type)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{selectedBooking.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${selectedBooking.customer_email}`} className="text-blue-400 hover:underline">
                        {selectedBooking.customer_email}
                      </a>
                    </div>
                    {selectedBooking.customer_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <a href={`tel:${selectedBooking.customer_phone}`} className="text-blue-400 hover:underline">
                          {selectedBooking.customer_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Date</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(selectedBooking.booking_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Time</div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {selectedBooking.booking_time}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Duration</div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4 text-gray-400" />
                        {selectedBooking.duration_minutes} minutes
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Number of People</div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        {selectedBooking.number_of_people}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.special_requests && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Special Requests</h3>
                    <p className="text-gray-300 bg-gray-800 rounded-lg p-4">
                      {selectedBooking.special_requests}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Status</h3>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      Booked on {new Date(selectedBooking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Actions</h3>
                  <div className="flex gap-3 flex-wrap">
                    {selectedBooking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Confirm Booking
                        </button>
                        <button
                          onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel Booking
                        </button>
                      </>
                    )}
                    {selectedBooking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Mark as Completed
                        </button>
                        <button
                          onClick={() => updateBookingStatus(selectedBooking.id, 'no-show')}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Mark as No-Show
                        </button>
                        <button
                          onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
