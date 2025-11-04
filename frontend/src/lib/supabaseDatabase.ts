import { supabase, handleSupabaseError, handleSupabaseSuccess } from './supabase'

export class SupabaseDatabaseService {
  // ==================== VENDORS ====================
  
  async getVendors(filters?: {
    city?: string
    status?: string
    serviceRadius?: number
    latitude?: number
    longitude?: number
  }) {
    try {
      let query = supabase
        .from('vendors')
        .select(`
          *,
          user:users(first_name, last_name, email, avatar),
          services:services(id, name, price, duration, is_active),
          reviews:reviews(rating)
        `)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`)
      }

      const { data, error } = await query

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async getVendorById(id: string) {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          user:users(first_name, last_name, email, avatar, phone),
          services:services(id, name, description, price, duration, is_active, image),
          reviews:reviews(id, rating, comment, created_at, customer:users(first_name, last_name))
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        throw new Error('Vendor not found')
      }

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async createVendor(vendorData: {
    userId: string
    shopname: string
    description?: string
    latitude: number
    longitude: number
    address: string
    city: string
    state: string
    zipCode: string
    businessLicense?: string
    taxId?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select()
        .single()

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async updateVendor(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== SERVICES ====================

  async getServices(vendorId?: string) {
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          vendor:vendors(id, shopname, city, state)
        `)

      if (vendorId) {
        query = query.eq('vendorId', vendorId)
      }

      const { data, error } = await query

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async createService(serviceData: {
    vendorId: string
    name: string
    description?: string
    duration: number
    price: number
    is_active?: boolean
    image?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single()

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async updateService(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async deleteService(id: string) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error

      return handleSupabaseSuccess(null)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== BOOKINGS ====================

  async getBookings(filters?: {
    customerId?: string
    vendorId?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }) {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          customer:users!customer_id(first_name, last_name, email, phone),
          vendor:vendors(id, shopname, address, city),
          address:addresses(street, city, state, zipCode)
        `)

      if (filters?.customerId) {
        query = query.eq('customerId', filters.customerId)
      }

      if (filters?.vendorId) {
        query = query.eq('vendorId', filters.vendorId)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.dateFrom) {
        query = query.gte('scheduled_date', filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte('scheduled_date', filters.dateTo)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async createBooking(bookingData: {
    customerId: string
    vendorId: string
    scheduled_date: string
    scheduledTime: string
    duration: number
    subtotal: number
    tax?: number
    total: number
    addressId: string
    notes?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async updateBookingStatus(id: string, status: string, cancellationReason?: string) {
    try {
      const updates: any = { status }
      if (cancellationReason) {
        updates.cancellationReason = cancellationReason
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== ADDRESSES ====================

  async getUserAddresses(userId: string) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('userId', userId)
        .order('isDefault', { ascending: false })

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async createAddress(addressData: {
    userId: string
    type?: string
    name?: string
    street: string
    city: string
    state: string
    zipCode: string
    latitude?: number
    longitude?: number
    isDefault?: boolean
  }) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert(addressData)
        .select()
        .single()

      if (error) throw error

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  subscribeToBookings(callback: (payload: any) => void, filters?: { vendorId?: string; customerId?: string }) {
    let channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: filters?.vendorId ? `vendorId=eq.${filters.vendorId}` : 
                  filters?.customerId ? `customerId=eq.${filters.customerId}` : undefined
        },
        callback
      )
      .subscribe()

    return channel
  }

  subscribeToVendorServices(vendorId: string, callback: (payload: any) => void) {
    let channel = supabase
      .channel('vendor-services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `vendorId=eq.${vendorId}`
        },
        callback
      )
      .subscribe()

    return channel
  }

  // ==================== ANALYTICS ====================

  async getVendorAnalytics(vendorId: string, dateFrom?: string, dateTo?: string) {
    try {
      let query = supabase
        .from('bookings')
        .select('id, total, status, scheduled_date, created_at')
        .eq('vendor_id', vendorId)

      if (dateFrom) {
        query = query.gte('scheduled_date', dateFrom)
      }

      if (dateTo) {
        query = query.lte('scheduled_date', dateTo)
      }

      const { data, error } = await query

      if (error) throw error

      // Calculate analytics
      const analytics = {
        totalBookings: data.length,
        completedBookings: data.filter(b => b.status === 'COMPLETED').length,
        cancelledBookings: data.filter(b => b.status === 'CANCELLED').length,
        totalRevenue: data
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + b.total, 0),
        averageBookingValue: 0,
        bookingsByDate: {} as Record<string, number>
      }

      analytics.averageBookingValue = analytics.completedBookings > 0 
        ? analytics.totalRevenue / analytics.completedBookings 
        : 0

      // Group bookings by date
      data.forEach(booking => {
        const date = booking.scheduled_date.split('T')[0]
        analytics.bookingsByDate[date] = (analytics.bookingsByDate[date] || 0) + 1
      })

      return handleSupabaseSuccess(analytics)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }
}

// Export singleton instance
export const supabaseDb = new SupabaseDatabaseService()
