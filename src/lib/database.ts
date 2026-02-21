// Database operations using Node.js API
import { api } from './api';

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

// ============ AUTH OPERATIONS ============

export const authOperations = {
  // Login with aadhar number and password
  async login(aadhaarNumber: string, password: string): Promise<any> {
    try {
      const result = await api.auth.login(aadhaarNumber, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
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
  ): Promise<any> {
    try {
      const result = await api.auth.signup({
        aadhaarNumber,
        password,
        email,
        phone,
        personalInfo
      });
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return null;
    }
  },

  // Get user by ID
  async getUser(id: string): Promise<any> {
    try {
      return await api.auth.getUser(id);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Get aadhaar record by ID
  async getAadhaarRecord(id: string): Promise<any> {
    try {
      return await api.aadhaarRecords.getById(id);
    } catch (error) {
      console.error('Get aadhaar record error:', error);
      return null;
    }
  },

  // Check if aadhaar number exists
  async aadhaarExists(aadhaarNumber: string): Promise<boolean> {
    try {
      await api.aadhaarRecords.getByNumber(aadhaarNumber);
      return true;
    } catch {
      return false;
    }
  },

  // Get phone by Aadhaar number
  async getPhoneByAadhaar(aadhaarNumber: string): Promise<{ exists: boolean; phone?: string; email?: string }> {
    try {
      const result = await api.auth.getPhoneByAadhaar(aadhaarNumber);
      return result;
    } catch (error) {
      console.error('Get phone by Aadhaar error:', error);
      return { exists: false };
    }
  },

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    try {
      return false;
    } catch {
      return false;
    }
  },

  // Check if phone exists
  async phoneExists(phone: string): Promise<boolean> {
    try {
      return false;
    } catch {
      return false;
    }
  },

  // Send OTP
  async sendOTP(aadhaarNumber: string, method: 'sms' | 'email' = 'sms', type: string = 'login', phone?: string): Promise<{ otp: string | null; message: string }> {
    try {
      const result = await api.auth.sendOTP(aadhaarNumber, method, type, phone);
      return { otp: result.otp || null, message: result.message };
    } catch (error) {
      console.error('Send OTP error:', error);
      return { otp: null, message: 'Failed to send OTP' };
    }
  },

  // Verify OTP
  async verifyOTP(otp: string, aadhaarNumber: string, type: string = 'login'): Promise<{ valid: boolean; message?: string }> {
    try {
      const result = await api.auth.verifyOTP(otp, aadhaarNumber, type);
      return { valid: result.valid, message: result.message };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { valid: false, message: 'Failed to verify OTP' };
    }
  },

  // Forgot password - send reset OTP
  async forgotPassword(aadhaarNumber: string, method: 'sms' | 'email' = 'sms'): Promise<{ success: boolean; message: string }> {
    try {
      const result = await api.auth.forgotPassword(aadhaarNumber, method);
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'Failed to send password reset OTP' };
    }
  },

  // Reset password with OTP
  async resetPassword(aadhaarNumber: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await api.auth.resetPassword(aadhaarNumber, otp, newPassword);
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Failed to reset password' };
    }
  },

  // Resend verification
  async resendVerification(email?: string, aadhaarNumber?: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await api.auth.resendVerification(email, aadhaarNumber);
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'Failed to resend verification' };
    }
  },

  // Verify email with token
  async verifyEmail(token: string): Promise<{ success: boolean; message: string; emailVerified: boolean; otpSentToMobile?: boolean; otp?: string }> {
    try {
      const result = await api.auth.verifyEmail(token);
      return { 
        success: true, 
        message: result.message, 
        emailVerified: result.emailVerified,
        otpSentToMobile: result.otpSentToMobile,
        otp: result.otp
      };
    } catch (error) {
      console.error('Verify email error:', error);
      return { success: false, message: 'Failed to verify email', emailVerified: false };
    }
  },

  // Verify email with OTP (after clicking email link)
  async verifyEmailOTP(aadhaarNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await api.auth.verifyEmailOTP(aadhaarNumber, otp);
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Verify email OTP error:', error);
      return { success: false, message: 'Failed to verify email OTP' };
    }
  }
}

// ============ CENTER OPERATIONS ============

export const centerOperations = {
  async getCenters(): Promise<Center[]> {
    try {
      return await api.centers.getAll();
    } catch (error) {
      console.error('Get centers error:', error);
      return [];
    }
  },

  async getCenterById(id: string): Promise<Center | null> {
    try {
      return await api.centers.getById(id);
    } catch (error) {
      console.error('Get center error:', error);
      return null;
    }
  },

  async searchCenters(city?: string, state?: string): Promise<Center[]> {
    try {
      return await api.centers.getAll({ city, state });
    } catch (error) {
      console.error('Search centers error:', error);
      return [];
    }
  },

  async getCentersByCoordinates(lat: number, lng: number, radiusKm: number = 10): Promise<Center[]> {
    try {
      return await api.centers.getNearby(lat, lng, radiusKm);
    } catch (error) {
      console.error('Get centers by coordinates error:', error);
      return [];
    }
  }
}

// ============ UPDATE TYPE OPERATIONS ============

export const updateTypeOperations = {
  async getUpdateTypes(): Promise<UpdateType[]> {
    try {
      return await api.updateTypes.getAll();
    } catch (error) {
      console.error('Get update types error:', error);
      return [];
    }
  },

  async getUpdateTypeById(id: string): Promise<UpdateType | null> {
    try {
      return await api.updateTypes.getById(id);
    } catch (error) {
      console.error('Get update type error:', error);
      return null;
    }
  },

  async getOnlineUpdateTypes(): Promise<UpdateType[]> {
    try {
      return await api.updateTypes.getAll(true);
    } catch (error) {
      console.error('Get online update types error:', error);
      return [];
    }
  },

  async getBiometricUpdateTypes(): Promise<UpdateType[]> {
    try {
      return await api.updateTypes.getBiometricRequired();
    } catch (error) {
      console.error('Get biometric update types error:', error);
      return [];
    }
  }
}

// ============ TIME SLOT OPERATIONS ============

export const timeSlotOperations = {
  async getAvailableSlots(centerId: string, date: string): Promise<any[]> {
    try {
      return await api.timeSlots.getAvailable(centerId, date);
    } catch (error) {
      console.error('Get available slots error:', error);
      return [];
    }
  },

  async getSlotsByCenter(centerId: string): Promise<any[]> {
    try {
      return await api.timeSlots.getByCenter(centerId);
    } catch (error) {
      console.error('Get slots by center error:', error);
      return [];
    }
  },

  async getSlotById(id: string): Promise<any> {
    try {
      return await api.timeSlots.getById(id);
    } catch (error) {
      console.error('Get slot error:', error);
      return null;
    }
  }
}

// ============ APPOINTMENT OPERATIONS ============

export const appointmentOperations = {
  async createAppointment(appointment: any): Promise<any> {
    try {
      return await api.appointments.create(appointment);
    } catch (error) {
      console.error('Create appointment error:', error);
      return null;
    }
  },

  async getAppointments(aadhaarRecordId: string): Promise<any[]> {
    try {
      return await api.appointments.getByAadhaar(aadhaarRecordId);
    } catch (error) {
      console.error('Get appointments error:', error);
      return [];
    }
  },

  async getAppointmentById(id: string): Promise<any> {
    try {
      return await api.appointments.getById(id);
    } catch (error) {
      console.error('Get appointment error:', error);
      return null;
    }
  },

  async getAppointmentByBookingId(bookingId: string): Promise<any> {
    try {
      return await api.appointments.getByBookingId(bookingId);
    } catch (error) {
      console.error('Get appointment by booking ID error:', error);
      return null;
    }
  },

  async updateAppointmentStatus(id: string, status: string): Promise<any> {
    try {
      return await api.appointments.updateStatus(id, status);
    } catch (error) {
      console.error('Update appointment status error:', error);
      return null;
    }
  },

  async cancelAppointment(id: string): Promise<boolean> {
    try {
      await api.appointments.cancel(id);
      return true;
    } catch (error) {
      console.error('Cancel appointment error:', error);
      return false;
    }
  }
}

// ============ DOCUMENT OPERATIONS ============

export const documentOperations = {
  async getDocuments(appointmentId: string): Promise<any[]> {
    try {
      return await api.documents.getByAppointment(appointmentId);
    } catch (error) {
      console.error('Get documents error:', error);
      return [];
    }
  },

  async getDocumentById(id: string): Promise<any> {
    try {
      return await api.documents.getById(id);
    } catch (error) {
      console.error('Get document error:', error);
      return null;
    }
  },

  async updateDocumentStatus(id: string, status: string, reviewNote?: string): Promise<any> {
    try {
      return await api.documents.updateStatus(id, status, reviewNote);
    } catch (error) {
      console.error('Update document status error:', error);
      return null;
    }
  }
}

// ============ UPDATE HISTORY OPERATIONS ============

export const updateHistoryOperations = {
  async getUpdateHistory(aadhaarRecordId: string): Promise<any[]> {
    try {
      return await api.aadhaarRecords.getHistory(aadhaarRecordId);
    } catch (error) {
      console.error('Get update history error:', error);
      return [];
    }
  },

  async getUpdateByUrn(urn: string): Promise<any> {
    return null;
  }
}

// ============ FRAUD LOG OPERATIONS ============

export const fraudLogOperations = {
  async getFraudLogs(): Promise<any[]> {
    return [];
  },

  async getUnresolvedFraudCount(): Promise<number> {
    return 0;
  }
}

// ============ CENTER LOAD OPERATIONS ============

export const centerLoadOperations = {
  async getCenterLoad(centerId: string, date: string): Promise<any> {
    try {
      const loads = await api.analytics.getCenterLoad(centerId);
      return loads.find((l: any) => l.date === date) || null;
    } catch (error) {
      console.error('Get center load error:', error);
      return null;
    }
  },

  async getCenterLoadHistory(centerId: string, days: number = 30): Promise<any[]> {
    try {
      return await api.analytics.getCenterLoad(centerId, days);
    } catch (error) {
      console.error('Get center load history error:', error);
      return [];
    }
  },

  async getAllCenterLoads(date: string): Promise<any[]> {
    try {
      return await api.analytics.getAllCenterLoads(date);
    } catch (error) {
      console.error('Get all center loads error:', error);
      return [];
    }
  }
}

// ============ ANALYTICS OPERATIONS ============

export const analyticsOperations = {
  async getDashboardStats(): Promise<any> {
    try {
      return await api.analytics.getDashboard();
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return null;
    }
  },

  async getFraudStats(): Promise<any> {
    try {
      return await api.analytics.getFraudComparison();
    } catch (error) {
      console.error('Get fraud stats error:', error);
      return {
        before: { monthlyFraudAttempts: 2500, successfulFrauds: 850, avgDetectionTime: 72, financialLoss: 15000000 },
        after: { monthlyFraudAttempts: 2200, successfulFrauds: 120, avgDetectionTime: 2, financialLoss: 1800000 }
      };
    }
  }
}

// ============ REAL-TIME SUBSCRIPTIONS (Not available in Node.js API) ============

export const subscribeToAppointments = (
  _userId: string,
  _callback: (payload: any) => void
) => {
  console.warn('Real-time subscriptions are not available in Node.js API mode');
  return null;
}

export const subscribeToDocuments = (
  _userId: string,
  _callback: (payload: any) => void
) => {
  console.warn('Real-time subscriptions are not available in Node.js API mode');
  return null;
}

// Helper to hash password (client-side for demo - in production use server-side hashing)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// For backward compatibility
export const userOperations = {
  async getUser(id: string): Promise<User | null> {
    const user = await authOperations.getUser(id);
    if (!user) return null;
    return {
      id: user.id,
      aadhaar_number: '',
      name: '',
      email: user.email,
      phone: user.phone,
      date_of_birth: '',
      address: '',
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_active: user.is_active
    };
  },
  async getUserByAadhaar(_aadhaarNumber: string): Promise<User | null> {
    return null;
  },
  async createUser(_user: Partial<User>): Promise<User | null> {
    return null;
  },
  async updateUser(_id: string, _updates: Partial<User>): Promise<User | null> {
    return null;
  },
  async updateLastLogin(_id: string): Promise<void> {}
}
