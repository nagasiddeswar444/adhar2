# Backend Setup Guide — Aadhaar Advance Platform

This guide walks through setting up the Supabase backend to support the Aadhaar Advance frontend.

---

## 1. Database Schema Overview

The database (`database/schema.sql`) includes 13 main tables:

| Table | Purpose |
|:---|:---|
| **users** | User profiles with Aadhaar metadata |
| **centers** | Aadhaar update centers with location & capacity |
| **update_types** | Types of updates (Address, Photo, Biometric, etc.) with risk levels |
| **time_slots** | Hourly/daily booking slots at each center |
| **appointments** | User bookings with status and auto-booking flags |
| **documents** | Uploaded documents for verification |
| **update_history** | Permanent record of all updates (URN-tracked) |
| **fraud_logs** | Flagged suspicious activities with risk scores |
| **center_load** | Daily capacity & demand tracking |
| **demand_forecast** | Monthly/weekly demand predictions |
| **session_logs** | Audit trail for all user actions |
| **staff_users** | UIDAI operators, reviewers, admins |
| **analytics_summary** | Pre-computed metrics for dashboards |

---

## 2. Setting Up Supabase

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / log in
3. Create a new project (e.g., "aadhaar-advance")
4. Choose a region close to your users
5. Copy your **Project URL** and **Anon Key**

### Import the Schema
1. In the Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL editor
5. Click **Run** to execute

The schema will:
- Create all 13 tables
- Add indexes for query performance
- Create views for common queries
- Add triggers for auto-updating timestamps
- Insert sample update types

---

## 3. Update Frontend Configuration

Update `src/supabase.js` with your credentials:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

## 4. Row-Level Security (RLS) Policies

For production, enable RLS on sensitive tables:

```sql
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own data
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY appointments_select_own ON appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY documents_select_own ON documents
  FOR SELECT USING (
    auth.uid() = (
      SELECT user_id FROM appointments 
      WHERE id = documents.appointment_id
    )
  );
```

---

## 5. Key API Operations

### Booking Workflow
```typescript
// 1. Check available slots
const { data: slots } = await supabase
  .from('time_slots')
  .select('*')
  .eq('center_id', centerId)
  .eq('date', selectedDate)
  .gt('available_slots', 0);

// 2. Create appointment
const { data: appointment } = await supabase
  .from('appointments')
  .insert({
    user_id: userId,
    center_id: centerId,
    update_type_id: updateTypeId,
    time_slot_id: slotId,
    scheduled_date: selectedDate,
    booking_id: generateBookingId(),
    status: 'scheduled',
    is_biometric_auto_assigned: isBiometric
  });

// 3. Decrement slot availability
await supabase
  .from('time_slots')
  .update({ available_slots: slot.available_slots - 1 })
  .eq('id', slotId);
```

### Document Upload
```typescript
// 1. Upload to storage
const { data: file } = await supabase.storage
  .from('documents')
  .upload(`${appointmentId}/${filename}`, fileData);

// 2. Create document record
const { data: doc } = await supabase
  .from('documents')
  .insert({
    appointment_id: appointmentId,
    document_type: docType,
    file_name: filename,
    s3_url: file.path,
    status: 'pending'
  });
```

### Fraud Detection
```typescript
// Flag suspicious activity
const { data: log } = await supabase
  .from('fraud_logs')
  .insert({
    user_id: userId,
    appointment_id: appointmentId,
    event_type: 'duplicate_attempt',
    risk_level: 'high',
    confidence_score: 0.95,
    details: { oldAppointmentId, timeDiff: '2 hours' },
    action_taken: 'blocked'
  });
```

---

## 6. Stored Procedures (Optional for Complex Logic)

### Auto-Booking for Age-Based Updates
```sql
CREATE OR REPLACE FUNCTION auto_book_biometric_update()
RETURNS TRIGGER AS $$
DECLARE
  v_center_id UUID;
  v_slot_id UUID;
  v_booking_id VARCHAR(20);
BEGIN
  -- Find user's age
  IF EXTRACT(YEAR FROM AGE(NEW.date_of_birth)) > 60 THEN
    -- Find optimal center and slot
    SELECT c.id INTO v_center_id
    FROM centers c
    WHERE c.is_active = TRUE
    ORDER BY c.current_load ASC
    LIMIT 1;
    
    -- Find best slot
    SELECT ts.id INTO v_slot_id
    FROM time_slots ts
    WHERE ts.center_id = v_center_id
    AND ts.date >= CURRENT_DATE
    AND ts.available_slots > 0
    AND ts.risk_level = 'low'
    ORDER BY ts.available_slots DESC
    LIMIT 1;
    
    IF v_slot_id IS NOT NULL THEN
      v_booking_id := 'ADH' || UPPER(TO_CHAR(CURRENT_TIMESTAMP, 'yymmddhhisss'));
      
      INSERT INTO appointments (
        user_id, center_id, update_type_id, time_slot_id,
        scheduled_date, booking_id, status, auto_booked, is_biometric_auto_assigned
      )
      SELECT NEW.id, v_center_id, ut.id, v_slot_id,
        DATE((SELECT start_time FROM time_slots WHERE id = v_slot_id)),
        v_booking_id, 'scheduled', TRUE, TRUE
      FROM update_types ut
      WHERE ut.name = 'Photo Update';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_book_biometric
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION auto_book_biometric_update();
```

---

## 7. Analytics & Dashboards

### Daily Refresh of Analytics Summary
```sql
-- Run this as a scheduled job (e.g., via Supabase Cron)
INSERT INTO analytics_summary (metric_name, metric_date, metric_value, metric_details)
VALUES 
  (
    'total_appointments',
    CURRENT_DATE,
    (SELECT COUNT(*) FROM appointments WHERE DATE(created_at) = CURRENT_DATE),
    NULL
  ),
  (
    'completed_updates',
    CURRENT_DATE,
    (SELECT COUNT(*) FROM appointments WHERE status = 'completed' AND DATE(completed_at) = CURRENT_DATE),
    NULL
  ),
  (
    'fraud_blocked',
    CURRENT_DATE,
    (SELECT COUNT(*) FROM fraud_logs WHERE action_taken = 'blocked' AND DATE(detected_at) = CURRENT_DATE),
    NULL
  ),
  (
    'avg_wait_time',
    CURRENT_DATE,
    (SELECT ROUND(AVG(estimated_wait_minutes)) FROM appointments WHERE DATE(created_at) = CURRENT_DATE),
    NULL
  )
ON CONFLICT (metric_name, metric_date) DO UPDATE SET
  metric_value = EXCLUDED.metric_value,
  updated_at = CURRENT_TIMESTAMP;
```

---

## 8. Storage Setup (for Documents)

### Create Storage Bucket
```sql
-- In Supabase, go to Storage > New Bucket
-- Bucket name: documents
-- Visibility: Private
-- Rules:
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 9. Authentication (Optional)

If you want to integrate Supabase Auth:

```typescript
// src/contexts/AuthContext.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return { user, loading, signUp, signIn, signOut };
};
```

---

## 10. Testing the Setup

### Test 1: Create a User
```typescript
const { data, error } = await supabase
  .from('users')
  .insert({
    aadhaar_number: '123456789012',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+919876543210',
    date_of_birth: '1990-01-01',
    address: '123 Main Street, Bangalore',
    state: 'Karnataka',
    city: 'Bangalore',
    pincode: '560001'
  })
  .select();

console.log(data, error);
```

### Test 2: List Centers
```typescript
const { data: centers, error } = await supabase
  .from('centers')
  .select('*')
  .limit(5);

console.log(centers, error);
```

### Test 3: Book an Appointment
```typescript
const { data: appointment, error } = await supabase
  .from('appointments')
  .insert({
    user_id: 'uuid-of-user',
    center_id: 'uuid-of-center',
    update_type_id: 'uuid-of-update-type',
    time_slot_id: 'uuid-of-slot',
    scheduled_date: '2026-02-25',
    booking_id: 'ADH' + Date.now().toString(36).toUpperCase(),
    status: 'scheduled'
  })
  .select();

console.log(appointment, error);
```

---

## 11. Deployment Checklist

- [ ] Schema imported and verified
- [ ] RLS policies enabled for sensitive tables
- [ ] Storage bucket created for documents
- [ ] Frontend environment variables updated with Supabase credentials
- [ ] Auth setup (if using Supabase Auth)
- [ ] Sample data created (centers, update types)
- [ ] Backup and recovery strategy configured
- [ ] Monitor performance and add indexes as needed
- [ ] Set up logging and error tracking (e.g., Sentry)
- [ ] GDPR/compliance audit complete

---

## 12. Scaling & Performance Tips

- **Partitioning**: For 1M+ rows, partition `appointments` and `fraud_logs` by date.
- **Caching**: Cache center data and update types in the frontend.
- **Indexing**: The schema includes key indexes. Monitor slow queries in Supabase.
- **Read Replicas**: For analytics/reporting queries, set up read-only replicas.
- **Connection Pooling**: Use Supabase's built-in connection pooler for better resource management.

---

## 13. Support & Debugging

- **Supabase Docs**: https://supabase.com/docs
- **Real-time Subscriptions**: https://supabase.com/docs/reference/javascript/subscribe
- **Migrations**: Use Supabase CLI for version control: `supabase db pull` / `supabase push`
- **Debugging**: Enable query logs in Supabase dashboard to monitor slow queries

---

Generated on 2026-02-18
