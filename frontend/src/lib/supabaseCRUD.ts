import { supabase, handleSupabaseError, handleSupabaseSuccess } from './supabase'

// Complete CRUD service for all Supabase operations
export class SupabaseCRUDService {
  
  // ==================== USERS ====================
  
  async createUser(userData: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    phone?: string
    role?: string
    status?: string
    avatar?: string
  }) {
    try {
      // First check if user already exists (trigger might have created it)
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .maybeSingle();

      if (existingUser) {
        // User already exists, return it
        return handleSupabaseSuccess(existingUser);
      }

      // Use upsert to handle duplicate key errors gracefully
      // This will insert if not exists, or update if exists (though update is unlikely)
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, {
          onConflict: 'id' // Use id as conflict resolution key
        })
        .select()
        .single()

      if (error) {
        // If upsert fails, try fetching again (trigger might have created it)
        const retryResult = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .maybeSingle();

        if (retryResult.data) {
          return handleSupabaseSuccess(retryResult.data);
        }
        throw error;
      }
      
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async updateUser(id: string, updates: {
    first_name?: string
    last_name?: string
    phone?: string
    avatar?: string
    fcm_token?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async getUserById(id: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== VENDORS ====================

  async createVendor(vendorData: {
    user_id: string
    shopname: string
    description?: string
    business_license?: string
    tax_id?: string
    latitude?: number
    longitude?: number
    address?: string
    city?: string
    state?: string
    zip_code?: string
    service_radius?: number
    advance_booking?: number
    cancellation?: number
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

  async updateVendor(id: string, updates: {
    shopname?: string
    description?: string
    business_license?: string
    tax_id?: string
    latitude?: number
    longitude?: number
    address?: string
    city?: string
    state?: string
    zip_code?: string
    service_radius?: number
    advance_booking?: number
    cancellation?: number
    status?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async getVendors(filters?: {
    status?: string
    city?: string
    latitude?: number
    longitude?: number
    service_radius?: number
  }) {
    try {
      let query = supabase
        .from('vendors')
        .select(`
          *,
          user:users(first_name, last_name, email, avatar, phone),
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
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== SERVICES ====================

  async createService(serviceData: {
    vendor_id: string
    name: string
    description?: string
    duration: number
    price: number
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

  async updateService(id: string, updates: {
    name?: string
    description?: string
    duration?: number
    price?: number
    image?: string
    is_active?: boolean
  }) {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async getServicesByVendor(vendorId: string) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('is_active', true)

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
      return handleSupabaseSuccess({ success: true })
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== ADDRESSES ====================

  async createAddress(addressData: {
    user_id: string
    type?: string
    name?: string
    street: string
    city: string
    state: string
    zip_code: string
    latitude?: number
    longitude?: number
    is_default?: boolean
  }) {
    try {
      // If this is set as default, unset other defaults first
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', addressData.user_id)
      }

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

  async updateAddress(id: string, updates: {
    type?: string
    name?: string
    street?: string
    city?: string
    state?: string
    zip_code?: string
    latitude?: number
    longitude?: number
    is_default?: boolean
  }) {
    try {
      // If this is set as default, unset other defaults first
      if (updates.is_default) {
        const { data: address } = await supabase
          .from('addresses')
          .select('user_id')
          .eq('id', id)
          .single()

        if (address) {
          await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', address.user_id)
            .neq('id', id)
        }
      }

      const { data, error } = await supabase
        .from('addresses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async getUserAddresses(userId: string) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async deleteAddress(id: string) {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)

      if (error) throw error
      return handleSupabaseSuccess({ success: true })
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== BOOKINGS ====================

  async createBooking(bookingData: {
    customer_id: string
    vendor_id: string
    scheduled_date: string
    scheduled_time: string
    duration: number
    subtotal: number
    discount?: number
    tax?: number
    total: number
    address_id: string
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

  async updateBooking(id: string, updates: {
    status?: string
    scheduled_date?: string
    scheduled_time?: string
    duration?: number
    subtotal?: number
    discount?: number
    tax?: number
    total?: number
    notes?: string
    cancellation_reason?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async getBookings(filters?: {
    customer_id?: string
    vendor_id?: string
    status?: string
    date_from?: string
    date_to?: string
  }) {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          customer:users!customer_id(first_name, last_name, email, phone),
          vendor:vendors(id, shopname, address, city),
          address:addresses(street, city, state, zip_code)
        `)

      if (filters?.customer_id) {
        query = query.eq('customer_id', filters.customer_id)
      }

      if (filters?.vendor_id) {
        query = query.eq('vendor_id', filters.vendor_id)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.date_from) {
        query = query.gte('scheduled_date', filters.date_from)
      }

      if (filters?.date_to) {
        query = query.lte('scheduled_date', filters.date_to)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async getBookingById(id: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:users!customer_id(first_name, last_name, email, phone),
          vendor:vendors(id, shopname, address, city),
          address:addresses(street, city, state, zip_code)
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== PAYMENTS ====================

  async createPayment(paymentData: {
    booking_id: string
    user_id: string
    amount: number
    method: string
    gateway_id?: string
    gateway_response?: any
  }) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async updatePayment(id: string, updates: {
    status?: string
    gateway_id?: string
    gateway_response?: any
    refund_amount?: number
    refund_reason?: string
    refunded_at?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async getPaymentsByBooking(bookingId: string) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== REVIEWS ====================

  async createReview(reviewData: {
    booking_id: string
    customer_id: string
    vendor_id: string
    rating: number
    comment?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async updateReview(id: string, updates: {
    rating?: number
    comment?: string
    response?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async getReviewsByVendor(vendorId: string) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customer:users!customer_id(first_name, last_name, avatar)
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // ==================== VENDOR SLOTS ====================

  async createVendorSlot(slotData: {
    vendor_id: string
    date: string
    start_time: string
    end_time: string
    status?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('vendor_slots')
        .insert(slotData)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async getVendorSlots(vendorId: string, date?: string) {
    try {
      let query = supabase
        .from('vendor_slots')
        .select('*')
        .eq('vendor_id', vendorId)

      if (date) {
        query = query.eq('date', date)
      }

      const { data, error } = await query.order('start_time')

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  async updateVendorSlot(id: string, updates: {
    status?: string
    booking_id?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('vendor_slots')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
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
      const totalBookings = data.length
      const totalRevenue = data.reduce((sum, booking) => sum + booking.total, 0)
      const completedBookings = data.filter(b => b.status === 'COMPLETED').length
      const pendingBookings = data.filter(b => b.status === 'PENDING').length
      const cancelledBookings = data.filter(b => b.status === 'CANCELLED').length

      const analytics = {
        totalBookings,
        totalRevenue,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
        cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0
      }

      return handleSupabaseSuccess(analytics)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }
}

// Export singleton instance
export const supabaseCRUD = new SupabaseCRUDService()
