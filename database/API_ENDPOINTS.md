# API Endpoints Reference — Aadhaar Advance Platform

This document defines the REST/GraphQL endpoints needed to support the frontend features.

---

## Authentication Endpoints

### Sign Up
```
POST /auth/signup
Body: { email, password, name }
Response: { user, session, error }
```

### Sign In
```
POST /auth/signin
Body: { email, password }
Response: { user, session, error }
```

### Sign Out
```
POST /auth/signout
Response: { success }
```

### Get Current User
```
GET /auth/user
Response: { user, profile }
```

---

## User Profile Endpoints

### Get Profile
```
GET /users/{userId}
Response: {
  id, aadhaar_number, name, email, phone, 
  date_of_birth, address, state, city, 
  last_biometric_update, created_at
}
```

### Update Profile
```
PATCH /users/{userId}
Body: { name, email, phone, address, state, city }
Response: { user }
```

### Get User Appointments
```
GET /users/{userId}/appointments
Query: { status?, limit, offset }
Response: [{
  id, booking_id, center, update_type, status, scheduled_date, slot
}]
```

### Get User Update History
```
GET /users/{userId}/update-history
Response: [{
  urn, update_type, old_value, new_value, status, created_at, approved_at
}]
```

---

## Center & Slot Endpoints

### List Centers
```
GET /centers
Query: { state?, city?, limit, offset }
Response: [{
  id, name, city, state, capacity, current_load, 
  predicted_load, coordinates, phone, email
}]
```

### Get Center Details
```
GET /centers/{centerId}
Response: { ...center details with reviews/rating }
```

### Get Available Slots
```
GET /centers/{centerId}/slots
Query: { date, update_type_id? }
Response: [{
  id, time, available, total, risk_level, date
}]
```

### Get Time Slot Details
```
GET /centers/{centerId}/slots/{slotId}
Response: {
  id, date, start_time, end_time, available_slots, 
  total_capacity, risk_level
}
```

---

## Update Type Endpoints

### List Update Types
```
GET /update-types
Response: [{
  id, name, description, risk_level, requires_verification, 
  requires_biometric, can_do_online, estimated_time_minutes, 
  required_documents: [{ name, is_required }]
}]
```

### Get Update Type Details
```
GET /update-types/{updateTypeId}
Response: { ...full update type with required documents }
```

---

## Booking Endpoints

### Create Appointment
```
POST /appointments
Body: {
  user_id, center_id, update_type_id, time_slot_id, 
  scheduled_date, is_online?, notes?
}
Response: {
  id, booking_id, status, created_at, appointment_details
}
```

Triggers:
- Decrement `time_slots.available_slots`
- Generate unique `booking_id`
- Create session log entry
- For biometric: `is_biometric_auto_assigned = TRUE`

### Get Appointment
```
GET /appointments/{appointmentId}
Response: {
  id, booking_id, user, center, update_type, slot, 
  status, scheduled_date, created_at, documents: []
}
```

### List User Appointments
```
GET /appointments
Query: { user_id, status?, limit }
Response: [{ ...appointment }]
```

### Reschedule Appointment
```
PATCH /appointments/{appointmentId}/reschedule
Body: { center_id?, time_slot_id, scheduled_date }
Response: { appointment }
```

### Cancel Appointment
```
DELETE /appointments/{appointmentId}
Body: { reason? }
Response: { success }
```

Triggers:
- Increment `time_slots.available_slots`
- Update appointment status to 'cancelled'
- Create session log

### Check-In at Center
```
POST /appointments/{appointmentId}/check-in
Response: {
  queue_position, current_token, people_ahead, estimated_wait_minutes
}
```

---

## Document Endpoints

### Upload Document
```
POST /appointments/{appointmentId}/documents
Body: FormData {
  file, document_type
}
Response: {
  id, file_name, s3_url, status: 'pending'
}
```

Triggers:
- Upload to S3/cloud storage
- Create document record
- Set status to 'under-review' if auto-review enabled

### List Documents
```
GET /appointments/{appointmentId}/documents
Response: [{
  id, document_type, file_name, status, 
  uploaded_at, reviewed_at, review_notes
}]
```

### Delete Document
```
DELETE /documents/{documentId}
Response: { success }
```

### Get Document Download URL
```
GET /documents/{documentId}/download
Response: { url, expires_in }
```

---

## Fraud Detection Endpoints

### Get Fraud Statistics
```
GET /analytics/fraud-stats
Response: {
  monthly_attempts: N,
  successful_frauds: N,
  avg_detection_time: N,
  financial_loss: N,
  before_system: {...},
  after_system: {...}
}
```

### Check User Risk
```
GET /users/{userId}/risk-assessment
Response: {
  risk_level, confidence_score, recent_flags: [{
    event_type, detected_at, action_taken, resolved
  }]
}
```

### Report Suspicious Activity
```
POST /fraud/report
Body: {
  user_id?, appointment_id?, event_type, details?
}
Response: { log_id, action_taken }
```

---

## Dashboard & Analytics Endpoints

### Get Dashboard Summary
```
GET /analytics/dashboard
Response: {
  total_bookings: N,
  completed_updates: N,
  frauds_prevented: N,
  avg_wait_time: N,
  satisfaction_rate: N
}
```

### Get Demand Forecast
```
GET /analytics/demand-forecast
Query: { range: 'month' | 'week' | 'day' }
Response: [{
  date, predicted_demand, actual_demand?, capacity
}]
```

### Get Center Load
```
GET /analytics/center-load
Query: { center_id?, date_range? }
Response: [{
  center_id, date, current_load, predicted_load, capacity, occupancy_pct
}]
```

### Get Hourly Load Chart
```
GET /analytics/center-load/hourly
Query: { center_id, date? }
Response: [{
  hour, load, capacity
}]
```

### Get Risk Distribution
```
GET /analytics/risk-distribution
Response: [{
  name: 'Low Risk' | 'Medium Risk' | 'High Risk',
  value: percentage,
  color: '#hex'
}]
```

### Get Fraud Comparison
```
GET /analytics/fraud-comparison
Response: {
  methods: ['Duplicate Attempt', 'Doc Mismatch', ...],
  before_system: [N, ...],
  after_system: [N, ...]
}
```

---

## Tracking & Queue Endpoints

### Search Appointment
```
GET /tracking/search
Query: { booking_id | aadhaar_number | email }
Response: {
  id, booking_id, status, center, update_type, scheduled_date, 
  appointment_stage, documents: []
}
```

### Get Live Queue Status
```
GET /appointments/{appointmentId}/queue-status
Response: {
  your_token, current_token, people_ahead, estimated_wait_minutes,
  counter_number, status: 'waiting' | 'serving' | 'completed'
}
```

Real-time (WebSocket/SSE):
```
WS /queue/{appointmentId}
Message: { current_token, people_ahead, estimated_wait }
Refresh: every 8-10 seconds
```

### Get Appointment Documents
```
GET /appointments/{appointmentId}/tracking/documents
Response: [{
  id, document_type, file_name, status, review_notes, 
  linked_to_stage: 'submission' | 'verification' | 'processing'
}]
```

---

## Admin/Staff Endpoints

### Get Pending Documents
```
GET /admin/documents/pending
Query: { center_id?, limit, offset }
Response: [{
  id, appointment_id, user_name, document_type, 
  uploaded_at, file_url
}]
```

### Approve/Reject Document
```
POST /admin/documents/{documentId}/review
Body: { status: 'approved' | 'rejected', review_notes? }
Response: { document }
```

Triggers:
- Send notification to user
- If all docs approved, auto-progress appointment
- If rejected, notify user for resubmission

### Update Appointment Status
```
PATCH /admin/appointments/{appointmentId}/status
Body: { status: 'in-progress' | 'completed' | 'on-hold', notes? }
Response: { appointment }
```

### Create Update Record
```
POST /admin/appointments/{appointmentId}/finalize
Body: {
  field_name, old_value, new_value, 
  approval_status: 'approved' | 'rejected'
}
Response: { 
  urn: 'URN-2026-02-18-001', 
  status: 'approved',
  update_record
}
```

---

## Implementation Examples

### Using React Query (Frontend)
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/supabase';

// Fetch centers
export const useCenters = () => {
  return useQuery({
    queryKey: ['centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centers')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });
};

// Book appointment
export const useBookAppointment = () => {
  return useMutation({
    mutationFn: async (booking) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(booking)
        .select();
      if (error) throw error;
      return data[0];
    }
  });
};
```

### Using Supabase Real-time
```typescript
export const subscribeToQueueStatus = (appointmentId, callback) => {
  return supabase
    .channel(`queue:${appointmentId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'appointments',
      filter: `id=eq.${appointmentId}`
    }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
};
```

---

## Error Handling

All endpoints return standard error responses:
```json
{
  "error": "error_code",
  "message": "Human-readable description",
  "details": "additional context if available"
}
```

Common error codes:
- `INVALID_INPUT` — Validation failed
- `NOT_FOUND` — Resource not found
- `UNAUTHORIZED` — Authentication required
- `FORBIDDEN` — User lacks permission
- `CONFLICT` — Resource already exists
- `RATE_LIMIT` — Too many requests
- `INTERNAL_ERROR` — Server error

---

## Rate Limiting

- **Authenticated users**: 1000 requests/hour per endpoint
- **Document upload**: 100 MB/day per user
- **Queue polling**: Max 1 request/5 seconds (use WebSocket for real-time)

---

## Pagination

For list endpoints supporting pagination:
```
GET /resource?limit=20&offset=0
Response headers:
- X-Total-Count: total number of items
- X-Page-Count: number of pages
```

---

## Implementation Priority

1. **Phase 1** (MVP):
   - Auth, User profiles, Centers, Slots
   - Appointment booking, Appointment retrieval
   - Dashboard summary stats

2. **Phase 2**:
   - Document upload & review
   - Tracking & search
   - Queue status (polling)

3. **Phase 3**:
   - Real-time queue (WebSocket)
   - Update history & URN tracking
   - Analytics charts

4. **Phase 4**:
   - Fraud detection
   - Auto-booking logic
   - Admin dashboard

---

Generated on 2026-02-18
