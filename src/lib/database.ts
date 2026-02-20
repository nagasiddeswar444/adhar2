import { supabase } from '@/supabase'

// Types matching the database schema
export interface User {
  id: string
  aadhaar_number: string
  name: string
  email: string
  phone: string
  date_of_birth: string
  gender?: string
  address: string
  state?: string
  city?: string
  pincode?: string
  last_biometric_update?: string
  last_login?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface Center {
  id: string
  name: string
  city: string
  state: string
  pincode?: string
  address: string
  capacity: number
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  working_hours_start?: string
  working_hours_end?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface UpdateType {
  id: string
  name: string
  description?: string
  risk_level: 'low' | 'medium' | 'high'
  requires_verification: boolean
  requires_biometric: boolean
  can_do_online: boolean
  estimated_time_minutes?: number
  created_at: string
  updated_at: string
}

export interface TimeSlot {
  id: string
  center_id: string
  date: string
  time: string
  available: number
  total: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  center_id: string
  update_type_id: string
  time_slot_id: string
  booking_id: string
  scheduled_date: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'in-review'
  mode: 'in-person' | 'online'
  is_auto_assigned: boolean
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  appointment_id?: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  status: 'pending' | 'under-review' | 'approved' | 'rejected'
  review_note?: string
  uploaded_at: string
  reviewed_at?: string
}

export interface UpdateHistory {
  id: string
  user_id: string
  appointment_id?: string
  update_type_id: string
  urn: string
  old_value: string
  new_value: string
  status: 'pending' | 'approved' | 'rejected'
  processed_at?: string
  created_at: string
}

export interface FraudLog {
  id: string
  user_id?: string
  appointment_id?: string
  event_type: string
  description: string
  risk_level: 'low' | 'medium' | 'high'
  risk_score: number
  ip_address?: string
  user_agent?: string
  resolved: boolean
  resolved_at?: string
  detected_at: string
}

export interface CenterLoad {
  id: string
  center_id: string
  date: string
  total_capacity: number
  booked_count: number
  predicted_demand: number
  actual_demand?: number
  created_at: string
  updated_at: string
}

export interface AnalyticsSummary {
  id: string
  date: string
  total_bookings: number
  completed_updates: number
  fraud_attempts: number
  fraud_prevented: number
  avg_wait_time_minutes: number
  satisfaction_rate: number
  created_at: string
  updated_at: string
}

// ============ AUTH OPERATIONS (New schema) ============

// Types for the new schema
export interface AuthUser {
  id: string
  email: string
  phone: string
  password_hash: string
  aadhaar_record_id: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface AadhaarRecord {
  id: string
  user_id: string
  aadhaar_number: string
  full_name: string
  date_of_birth: string
  gender: string
  address: string
  state: string
  district: string | null
  city: string | null
  pincode: string
  locality: string | null
  landmark: string | null
  house_number: string | null
  street: string | null
  care_of: string | null
  guardian_name: string | null
  photo_url: string | null
  fingerprint_status: string
  iris_status: string
  face_scan_status: string
  last_biometric_update: string | null
  biometric_expiry_date: string | null
  enrollment_number: string | null
  enrollment_date: string | null
  registration_center: string | null
  card_type: string
  status: string
  is_verified: boolean
  verification_date: string | null
  is_eid_linked: boolean
  eid_number: string | null
  phone: string | null
  mobile_verified: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}

// Helper to hash password (client-side for demo - in production use server-side hashing)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const authOperations = {
  // Login with aadhar number and password
  async login(aadhaarNumber: string, password: string): Promise<{ user: AuthUser; aadhaarRecord: AadhaarRecord } | null> {
    // First, find the aadhaar record by aadhaar number
    const { data: aadhaarData, error: aadhaarError } = await supabase
      .from('aadhaar_records')
      .select('*')
      .eq('aadhaar_number', aadhaarNumber)
      .single()
    
    if (aadhaarError || !aadhaarData) {
      console.error('Aadhaar record not found:', aadhaarError)
      return null
    }

    const aadhaarRecord = aadhaarData as AadhaarRecord

    // Get the user associated with this aadhaar record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', aadhaarRecord.user_id)
      .single()
    
    if (userError || !userData) {
      console.error('User not found:', userError)
      return null
    }

    const user = userData as AuthUser

    // Verify password hash
    const passwordHash = await hashPassword(password)
    if (user.password_hash !== passwordHash) {
      console.error('Invalid password')
      return null
    }

    // Check if user is active
    if (!user.is_active) {
      console.error('User account is inactive')
      return null
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    return { user, aadhaarRecord }
  },

  // Signup new user with aadhar number
  async signup(
    aadhaarNumber: string, 
    password: string, 
    email: string, 
    phone: string,
    personalInfo: {
      fullName: string
      dateOfBirth: string
      gender: string
      address: string
      state: string
      district?: string
      city?: string
      pincode: string
    }
  ): Promise<{ user: AuthUser; aadhaarRecord: AadhaarRecord } | null> {
    const passwordHash = await hashPassword(password)

    // Create user first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        phone,
        password_hash: passwordHash,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (userError) {
      console.error('Error creating user:', userError)
      return null
    }

    const user = userData as AuthUser

    // Create aadhaar record linked to user
    const { data: aadhaarData, error: aadhaarError } = await supabase
      .from('aadhaar_records')
      .insert({
        user_id: user.id,
        aadhaar_number: aadhaarNumber,
        full_name: personalInfo.fullName,
        date_of_birth: personalInfo.dateOfBirth,
        gender: personalInfo.gender,
        address: personalInfo.address,
        state: personalInfo.state,
        district: personalInfo.district || null,
        city: personalInfo.city || null,
        pincode: personalInfo.pincode,
        status: 'active',
        is_verified: false,
        is_eid_linked: false,
        mobile_verified: false,
        email_verified: false,
        fingerprint_status: 'registered',
        iris_status: 'registered',
        face_scan_status: 'registered',
        card_type: 'standard',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (aadhaarError) {
      console.error('Error creating aadhaar record:', aadhaarError)
      // Rollback user creation
      await supabase.from('users').delete().eq('id', user.id)
      return null
    }

    const aadhaarRecord = aadhaarData as AadhaarRecord

    // Update user's aadhaar_record_id
    await supabase
      .from('users')
      .update({ aadhaar_record_id: aadhaarRecord.id })
      .eq('id', user.id)

    return { user, aadhaarRecord }
  },

  // Get user by ID
  async getUser(id: string): Promise<AuthUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data as AuthUser
  },

  // Get aadhaar record by ID
  async getAadhaarRecord(id: string): Promise<AadhaarRecord | null> {
    const { data, error } = await supabase
      .from('aadhaar_records')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data as AadhaarRecord
  },

  // Check if aadhaar number exists
  async aadhaarExists(aadhaarNumber: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('aadhaar_records')
      .select('id')
      .eq('aadhaar_number', aadhaarNumber)
      .single()
    
    return !error && !!data
  },

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    
    return !error && !!data
  },

  // Check if phone exists
  async phoneExists(phone: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()
    
    return !error && !!data
  }
}

// ============ USER OPERATIONS (Legacy - kept for compatibility) ============

export const userOperations = {
  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getUserByAadhaar(aadhaarNumber: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('aadhaar_number', aadhaarNumber)
      .single()
    
    if (error) throw error
    return data
  },

  async createUser(user: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLastLogin(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}

// ============ CENTER OPERATIONS ============

export const centerOperations = {
  async getCenters(): Promise<Center[]> {
    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getCenterById(id: string): Promise<Center | null> {
    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async searchCenters(city?: string, state?: string): Promise<Center[]> {
    let query = supabase
      .from('centers')
      .select('*')
      .eq('is_active', true)

    if (city) query = query.ilike('city', `%${city}%`)
    if (state) query = query.ilike('state', `%${state}%`)

    const { data, error } = await query.order('name')
    
    if (error) throw error
    return data || []
  },

  async getCentersByCoordinates(lat: number, lng: number, radiusKm: number): Promise<Center[]> {
    // Simple bounding box calculation
    const latDelta = radiusKm / 111
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))

    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .eq('is_active', true)
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta)
    
    if (error) throw error
    return data || []
  }
}

// ============ UPDATE TYPE OPERATIONS ============

export const updateTypeOperations = {
  async getUpdateTypes(): Promise<UpdateType[]> {
    const { data, error } = await supabase
      .from('update_types')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getUpdateTypeById(id: string): Promise<UpdateType | null> {
    const { data, error } = await supabase
      .from('update_types')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getOnlineUpdateTypes(): Promise<UpdateType[]> {
    const { data, error } = await supabase
      .from('update_types')
      .select('*')
      .eq('can_do_online', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getBiometricUpdateTypes(): Promise<UpdateType[]> {
    const { data, error } = await supabase
      .from('update_types')
      .select('*')
      .eq('requires_biometric', true)
      .order('name')
    
    if (error) throw error
    return data || []
  }
}

// ============ TIME SLOT OPERATIONS ============

export const timeSlotOperations = {
  async getAvailableSlots(centerId: string, date: string): Promise<TimeSlot[]> {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('center_id', centerId)
      .eq('date', date)
      .gt('available', 0)
      .order('time')
    
    if (error) throw error
    return data || []
  },

  async getSlotsByCenter(centerId: string): Promise<TimeSlot[]> {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('center_id', centerId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date')
      .order('time')
    
    if (error) throw error
    return data || []
  },

  async getSlotById(id: string): Promise<TimeSlot | null> {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// ============ APPOINTMENT OPERATIONS ============

export const appointmentOperations = {
  async createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getAppointments(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, centers(name, city, state), update_types(name), time_slots(time)')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, centers(*), update_types(*), time_slots(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getAppointmentByBookingId(bookingId: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, centers(name, city, state), update_types(name), time_slots(time)')
      .eq('booking_id', bookingId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async cancelAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' as const, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}

// ============ DOCUMENT OPERATIONS ============

export const documentOperations = {
  async uploadDocument(userId: string, file: File, appointmentId?: string): Promise<Document> {
    const filePath = `${userId}/${Date.now()}_${file.name}`
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)
    
    if (uploadError) throw uploadError

    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        appointment_id: appointmentId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        status: 'pending',
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getDocumentById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateDocumentStatus(id: string, status: Document['status'], reviewNote?: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({ 
        status, 
        review_note: reviewNote,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ============ UPDATE HISTORY OPERATIONS ============

export const updateHistoryOperations = {
  async createUpdateRecord(record: Partial<UpdateHistory>): Promise<UpdateHistory> {
    const { data, error } = await supabase
      .from('update_history')
      .insert(record)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUpdateHistory(userId: string): Promise<UpdateHistory[]> {
    const { data, error } = await supabase
      .from('update_history')
      .select('*, update_types(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getUpdateByUrn(urn: string): Promise<UpdateHistory | null> {
    const { data, error } = await supabase
      .from('update_history')
      .select('*, update_types(name)')
      .eq('urn', urn)
      .single()
    
    if (error) throw error
    return data
  }
}

// ============ FRAUD LOG OPERATIONS ============

export const fraudLogOperations = {
  async logFraudEvent(event: Partial<FraudLog>): Promise<FraudLog> {
    const { data, error } = await supabase
      .from('fraud_logs')
      .insert(event)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getFraudLogs(userId?: string, startDate?: string, endDate?: string): Promise<FraudLog[]> {
    let query = supabase
      .from('fraud_logs')
      .select('*')
      .order('detected_at', { ascending: false })

    if (userId) query = query.eq('user_id', userId)
if (startDate) query = query.gte('detected_at', startDate)
    if (endDate) query = query.lte('detected_at', endDate)

    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  async resolveFraudLog(id: string): Promise<void> {
    const { error } = await supabase
      .from('fraud_logs')
      .update({ 
        resolved: true, 
        resolved_at: new Date().toISOString() 
      })
      .eq('id', id)
    
    if (error) throw error
  },

  async getUnresolvedFraudCount(): Promise<number> {
    const { count, error } = await supabase
      .from('fraud_logs')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false)
    
    if (error) throw error
    return count || 0
  }
}

// ============ CENTER LOAD OPERATIONS ============

export const centerLoadOperations = {
  async getCenterLoad(centerId: string, date: string): Promise<CenterLoad | null> {
    const { data, error } = await supabase
      .from('center_load')
      .select('*')
      .eq('center_id', centerId)
      .eq('date', date)
      .single()
    
    if (error) throw error
    return data
  },

  async getCenterLoadHistory(centerId: string, days: number = 30): Promise<CenterLoad[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('center_load')
      .select('*')
      .eq('center_id', centerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date')
    
    if (error) throw error
    return data || []
  },

  async getAllCenterLoads(date: string): Promise<CenterLoad[]> {
    const { data, error } = await supabase
      .from('center_load')
      .select('*, centers(name, city)')
      .eq('date', date)
    
    if (error) throw error
    return data || []
  }
}

// ============ ANALYTICS OPERATIONS ============

export const analyticsOperations = {
  async getDashboardStats(): Promise<AnalyticsSummary | null> {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('analytics_summary')
      .select('*')
      .eq('date', today)
      .single()
    
    if (error) throw error
    return data
  },

  async getStatsRange(startDate: string, endDate: string): Promise<AnalyticsSummary[]> {
    const { data, error } = await supabase
      .from('analytics_summary')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')
    
    if (error) throw error
    return data || []
  },

  async getTotalBookings(): Promise<number> {
    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
    
    if (error) throw error
    return count || 0
  },

  async getFraudStats(): Promise<{ before: any; after: any }> {
    // This would typically aggregate from fraud_logs table
    // For now, return mock data structure
    return {
      before: {
        monthlyFraudAttempts: 2500,
        successfulFrauds: 850,
        avgDetectionTime: 72,
        financialLoss: 15000000
      },
      after: {
        monthlyFraudAttempts: 2200,
        successfulFrauds: 120,
        avgDetectionTime: 2,
        financialLoss: 1800000
      }
    }
  }
}

// ============ REAL-TIME SUBSCRIPTIONS ============

export const subscribeToAppointments = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('appointments-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToDocuments = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('documents-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}
