const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // ============ AUTH ============
  auth = {
    login: (aadhaarNumber: string, password: string) =>
      this.request<{ user: any; aadhaarRecord: any }>('/auth/login', {
        method: 'POST',
        body: { aadhaarNumber, password },
      }),

    signup: (data: {
      aadhaarNumber: string;
      password: string;
      email: string;
      phone: string;
      personalInfo?: {
        fullName: string;
        dateOfBirth: string;
        gender: string;
        address: string;
        state: string;
        district?: string;
        city?: string;
        pincode: string;
      };
    }) => this.request<{ message: string; user: any; aadhaarRecord: any; otpSentToMobile?: boolean }>('/auth/signup', { method: 'POST', body: data }),

    sendOTP: (aadhaarNumber: string, method: 'sms' | 'email' = 'sms', type: string = 'login', phone?: string) =>
      this.request<{ message: string; otp?: string; method: string }>('/auth/send-otp', {
        method: 'POST',
        body: { aadhaarNumber, method, type, phone },
      }),

    verifyOTP: (otp: string, aadhaarNumber: string, type: string = 'login') =>
      this.request<{ valid: boolean; message?: string }>('/auth/verify-otp', {
        method: 'POST',
        body: { otp, aadhaarNumber, type },
      }),

    getUser: (id: string) => this.request<any>(`/auth/user/${id}`),

    // Get phone by Aadhaar number
    getPhoneByAadhaar: (aadhaarNumber: string) =>
      this.request<{ exists: boolean; phone?: string; email?: string }>(`/get-phone?aadhaarNumber=${aadhaarNumber}`),

    // Password reset endpoints
    forgotPassword: (aadhaarNumber: string, method: 'sms' | 'email' = 'sms') =>
      this.request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: { aadhaarNumber, method },
      }),

    resetPassword: (aadhaarNumber: string, otp: string, newPassword: string) =>
      this.request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: { aadhaarNumber, otp, newPassword },
      }),

    resendVerification: (email?: string, aadhaarNumber?: string) =>
      this.request<{ message: string }>('/auth/resend-verification', {
        method: 'POST',
        body: { email, aadhaarNumber },
      }),

    verifyEmail: (token: string) =>
      this.request<{ message: string; emailVerified: boolean; otpSentToMobile?: boolean; otp?: string }>(`/auth/verify-email?token=${token}`),

    verifyEmailOTP: (aadhaarNumber: string, otp: string) =>
      this.request<{ message: string }>('/auth/verify-email-otp', {
        method: 'POST',
        body: { aadhaarNumber, otp },
      }),
  };

  // ============ CENTERS ============
  centers = {
    getAll: (params?: { city?: string; state?: string }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request<any[]>(`/centers${query}`);
    },

    getById: (id: string) => this.request<any>(`/centers/${id}`),

    getNearby: (lat: number, lng: number, radiusKm: number = 10) =>
      this.request<any[]>(`/centers/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`),
  };

  // ============ UPDATE TYPES ============
  updateTypes = {
    getAll: (onlineOnly?: boolean) => {
      const query = onlineOnly ? '?online=true' : '';
      return this.request<any[]>(`/update-types${query}`);
    },

    getById: (id: string) => this.request<any>(`/update-types/${id}`),

    getBiometricRequired: () => this.request<any[]>('/update-types?biometric=true'),
  };

  // ============ TIME SLOTS ============
  timeSlots = {
    getAvailable: (centerId: string, date: string) =>
      this.request<any[]>(`/time-slots/available?center_id=${centerId}&date=${date}`),

    getByCenter: (centerId: string) => this.request<any[]>(`/time-slots/center/${centerId}`),

    getById: (id: string) => this.request<any>(`/time-slots/${id}`),
  };

  // ============ APPOINTMENTS ============
  appointments = {
    create: (data: any) => this.request<any>('/appointments', { method: 'POST', body: data }),

    getById: (id: string) => this.request<any>(`/appointments/${id}`),

    getByBookingId: (bookingId: string) => this.request<any>(`/appointments/booking/${bookingId}`),

    getByAadhaar: (aadhaarRecordId: string) =>
      this.request<any[]>(`/appointments/aadhaar/${aadhaarRecordId}`),

    updateStatus: (id: string, status: string) =>
      this.request(`/appointments/${id}/status`, { method: 'PUT', body: { status } }),

    cancel: (id: string) => this.request(`/appointments/${id}`, { method: 'DELETE' }),
  };

  // ============ AADHAAR RECORDS ============
  aadhaarRecords = {
    getById: (id: string) => this.request<any>(`/aadhaar-records/${id}`),

    getByNumber: (aadhaarNumber: string) =>
      this.request<any>(`/aadhaar-records/number/${aadhaarNumber}`),

    update: (id: string, data: any) =>
      this.request(`/aadhaar-records/${id}`, { method: 'PUT', body: data }),

    getHistory: (id: string) =>
      this.request<any[]>(`/aadhaar-records/${id}/history`),

    createHistory: (id: string, data: any) =>
      this.request(`/aadhaar-records/${id}/history`, { method: 'POST', body: data }),
  };

  // ============ DOCUMENTS ============
  documents = {
    getByAppointment: (appointmentId: string) =>
      this.request<any[]>(`/documents/appointment/${appointmentId}`),

    getById: (id: string) => this.request<any>(`/documents/${id}`),

    create: (data: any) => this.request('/documents', { method: 'POST', body: data }),

    updateStatus: (id: string, status: string, reviewNotes?: string) =>
      this.request(`/documents/${id}/status`, {
        method: 'PUT',
        body: { status, review_notes: reviewNotes },
      }),

    delete: (id: string) => this.request(`/documents/${id}`, { method: 'DELETE' }),
  };

  // ============ ANALYTICS ============
  analytics = {
    getDashboard: () => this.request<any>('/analytics/dashboard'),

    getCenterLoad: (centerId: string, days?: number) => {
      const params = days ? `?days=${days}` : '';
      return this.request<any[]>(`/analytics/center-load/${centerId}${params}`);
    },

    getAllCenterLoads: (date?: string) => {
      const params = date ? `?date=${date}` : '';
      return this.request<any[]>(`/analytics/center-load${params}`);
    },

    updateCenterLoad: (data: any) =>
      this.request('/analytics/center-load', { method: 'POST', body: data }),

    getDemandForecast: (days?: number) => {
      const params = days ? `?days=${days}` : '';
      return this.request<any[]>(`/analytics/demand-forecast${params}`);
    },

    getFraudComparison: () => this.request<any>('/analytics/fraud-comparison'),
  };
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
export default api;
