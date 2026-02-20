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
    }) => this.request('/auth/signup', { method: 'POST', body: data }),

    sendOTP: (aadhaarNumber: string, method: 'sms' | 'email' = 'sms') =>
      this.request<{ message: string; otp?: string }>('/auth/send-otp', {
        method: 'POST',
        body: { aadhaarNumber, method },
      }),

    verifyOTP: (otp: string, aadhaarNumber: string) =>
      this.request<{ valid: boolean }>('/auth/verify-otp', {
        method: 'POST',
        body: { otp, aadhaarNumber },
      }),

    getUser: (id: string) => this.request<any>(`/auth/user/${id}`),
  };

  // ============ CENTERS ============
  centers = {
    getAll: (params?: { city?: string; state?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return this.request<any[]>(`/centers${query ? `?${query}` : ''}`);
    },

    getById: (id: string) => this.request<any>(`/centers/${id}`),

    getNearby: (lat: number, lng: number, radius?: number) => {
      const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString() });
      if (radius) params.append('radius', radius.toString());
      return this.request<any[]>(`/centers/nearby?${params}`);
    },

    create: (data: any) => this.request('/centers', { method: 'POST', body: data }),

    update: (id: string, data: any) =>
      this.request(`/centers/${id}`, { method: 'PUT', body: data }),

    delete: (id: string) =>
      this.request(`/centers/${id}`, { method: 'DELETE' }),
  };

  // ============ APPOINTMENTS ============
  appointments = {
    getByAadhaar: (aadhaarRecordId: string) =>
      this.request<any[]>(`/appointments/aadhaar/${aadhaarRecordId}`),

    getByBookingId: (bookingId: string) =>
      this.request<any>(`/appointments/booking/${bookingId}`),

    getById: (id: string) => this.request<any>(`/appointments/${id}`),

    create: (data: {
      aadhaar_record_id: string;
      center_id: string;
      update_type_id: string;
      time_slot_id: string;
      scheduled_date: string;
      is_online?: boolean;
    }) => this.request('/appointments', { method: 'POST', body: data }),

    updateStatus: (id: string, status: string) =>
      this.request(`/appointments/${id}/status`, {
        method: 'PUT',
        body: { status },
      }),

    cancel: (id: string) =>
      this.request(`/appointments/${id}/cancel`, { method: 'PUT' }),
  };

  // ============ TIME SLOTS ============
  timeSlots = {
    getByCenter: (centerId: string, date?: string) => {
      const params = date ? `?date=${date}` : '';
      return this.request<any[]>(`/time-slots/center/${centerId}${params}`);
    },

    getAvailable: (centerId: string, date: string) =>
      this.request<any[]>(`/time-slots/available?centerId=${centerId}&date=${date}`),

    getById: (id: string) => this.request<any>(`/time-slots/${id}`),

    create: (data: any) => this.request('/time-slots', { method: 'POST', body: data }),

    update: (id: string, data: any) =>
      this.request(`/time-slots/${id}`, { method: 'PUT', body: data }),

    delete: (id: string) =>
      this.request(`/time-slots/${id}`, { method: 'DELETE' }),
  };

  // ============ UPDATE TYPES ============
  updateTypes = {
    getAll: (onlineOnly?: boolean) => {
      const params = onlineOnly ? '?onlineOnly=true' : '';
      return this.request<any[]>(`/update-types${params}`);
    },

    getById: (id: string) => this.request<any>(`/update-types/${id}`),

    getBiometricRequired: () =>
      this.request<any[]>('/update-types/biometric/required'),

    create: (data: any) => this.request('/update-types', { method: 'POST', body: data }),

    update: (id: string, data: any) =>
      this.request(`/update-types/${id}`, { method: 'PUT', body: data }),

    delete: (id: string) =>
      this.request(`/update-types/${id}`, { method: 'DELETE' }),
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

    delete: (id: string) =>
      this.request(`/documents/${id}`, { method: 'DELETE' }),
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
