-- Aadhaar Advance Platform - Database Schema
-- Supports booking, tracking, fraud detection, and analytics

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  address TEXT NOT NULL,
  state VARCHAR(100),
  city VARCHAR(100),
  pincode VARCHAR(10),
  last_biometric_update DATE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_aadhaar (aadhaar_number),
  INDEX idx_state_city (state, city)
);

-- ============================================================================
-- CENTERS TABLE
-- ============================================================================
CREATE TABLE centers (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10),
  address TEXT NOT NULL,
  capacity INT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  working_hours_start TIME,
  working_hours_end TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Indexes
  INDEX idx_city_state (city, state),
  INDEX idx_coordinates (latitude, longitude)
);

-- ============================================================================
-- UPDATE TYPES TABLE
-- ============================================================================
CREATE TABLE update_types (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  risk_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
  requires_verification BOOLEAN DEFAULT FALSE,
  requires_biometric BOOLEAN DEFAULT FALSE,
  can_do_online BOOLEAN DEFAULT FALSE,
  estimated_time_minutes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Indexes
  INDEX idx_risk_level (risk_level),
  INDEX idx_biometric (requires_biometric),
  INDEX idx_online (can_do_online)
);

-- ============================================================================
-- UPDATE_TYPE_DOCUMENTS TABLE (M:M relationship)
-- ============================================================================
CREATE TABLE update_type_documents (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  update_type_id CHAR(36) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (update_type_id) REFERENCES update_types(id) ON DELETE CASCADE,
  INDEX idx_update_type (update_type_id)
);

-- ============================================================================
-- TIME_SLOTS TABLE
-- ============================================================================
CREATE TABLE time_slots (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  center_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_capacity INT NOT NULL,
  available_slots INT NOT NULL,
  risk_level VARCHAR(20), -- 'low', 'medium', 'high' (based on demand)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_slot (center_id, date, start_time),
  INDEX idx_center_date (center_id, date),
  INDEX idx_available (available_slots)
);

-- ============================================================================
-- APPOINTMENTS (Bookings) TABLE
-- ============================================================================
CREATE TABLE appointments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_id VARCHAR(20) UNIQUE NOT NULL, -- e.g., "ADH7X9K2M"
  user_id CHAR(36) NOT NULL,
  center_id CHAR(36) NOT NULL,
  update_type_id CHAR(36) NOT NULL,
  time_slot_id CHAR(36) NOT NULL,
  scheduled_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'
  is_online BOOLEAN DEFAULT FALSE,
  is_biometric_auto_assigned BOOLEAN DEFAULT FALSE,
  auto_booked BOOLEAN DEFAULT FALSE, -- TRUE if AI auto-booked (age-based biometric requirement)
  queue_position INT,
  counter_number INT,
  estimated_wait_minutes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (center_id) REFERENCES centers(id),
  FOREIGN KEY (update_type_id) REFERENCES update_types(id),
  FOREIGN KEY (time_slot_id) REFERENCES time_slots(id),
  INDEX idx_user (user_id),
  INDEX idx_center (center_id),
  INDEX idx_status (status),
  INDEX idx_scheduled_date (scheduled_date),
  INDEX idx_booking_id (booking_id)
);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE documents (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  appointment_id CHAR(36) NOT NULL,
  document_type VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  s3_url VARCHAR(512),
  status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'under-review'
  review_notes TEXT,
  uploaded_by_user BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by CHAR(36), -- Staff user ID
  
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  INDEX idx_appointment (appointment_id),
  INDEX idx_status (status)
);

-- ============================================================================
-- UPDATE HISTORY TABLE
-- ============================================================================
CREATE TABLE update_history (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  appointment_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  update_type_id CHAR(36) NOT NULL,
  field_name VARCHAR(255) NOT NULL, -- e.g., 'address', 'mobile', 'photo'
  old_value TEXT,
  new_value TEXT,
  status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  urn VARCHAR(50) UNIQUE, -- Update Reference Number
  rejection_reason TEXT,
  approved_by CHAR(36), -- UIDAI staff ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (update_type_id) REFERENCES update_types(id),
  INDEX idx_user (user_id),
  INDEX idx_appointment (appointment_id),
  INDEX idx_urn (urn),
  INDEX idx_status (status)
);

-- ============================================================================
-- FRAUD_LOGS TABLE (for tracking suspicious activities)
-- ============================================================================
CREATE TABLE fraud_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  appointment_id CHAR(36),
  event_type VARCHAR(100), -- e.g., 'duplicate_attempt', 'unusual_location', 'rapid_requests', 'document_mismatch', 'biometric_mismatch'
  risk_level VARCHAR(20), -- 'low', 'medium', 'high'
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  details JSON,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action_taken VARCHAR(100), -- 'flagged', 'blocked', 'needs_verification', 'approved'
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  notes TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  INDEX idx_risk_level (risk_level),
  INDEX idx_detected_at (detected_at),
  INDEX idx_user (user_id)
);

-- ============================================================================
-- CENTER_LOAD TABLE (for demand forecasting)
-- ============================================================================
CREATE TABLE center_load (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  center_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  current_load INT,
  predicted_load INT,
  capacity INT,
  occupancy_percentage DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_load (center_id, date),
  INDEX idx_center_date (center_id, date)
);

-- ============================================================================
-- DEMAND_FORECAST TABLE (monthly/weekly predictions)
-- ============================================================================
CREATE TABLE demand_forecast (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  forecast_date DATE NOT NULL,
  predicted_demand INT NOT NULL,
  actual_demand INT,
  capacity INT,
  confidence_percentage DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_forecast_date (forecast_date)
);

-- ============================================================================
-- SESSION_LOGS TABLE (for audit trails)
-- ============================================================================
CREATE TABLE session_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'appointment_booked', 'document_uploaded', 'status_checked', etc.
  resource_type VARCHAR(50), -- 'appointment', 'document', 'profile', etc.
  resource_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20), -- 'success', 'failure'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_action (user_id, action),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- STAFF_USERS TABLE (for UIDAI operators and administrators)
-- ============================================================================
CREATE TABLE staff_users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'operator', 'reviewer', 'admin'
  center_id CHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- ============================================================================
-- ANALYTICS_SUMMARY TABLE (for quick dashboard queries)
-- ============================================================================
CREATE TABLE analytics_summary (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  metric_name VARCHAR(100) NOT NULL,
  metric_date DATE NOT NULL,
  metric_value INT,
  metric_details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_metric (metric_name, metric_date),
  INDEX idx_metric_date (metric_name, metric_date)
);

-- ============================================================================
-- INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Performance indexes for appointment queries
CREATE INDEX idx_appointments_user_status ON appointments(user_id, status);
CREATE INDEX idx_appointments_center_date ON appointments(center_id, scheduled_date);
CREATE INDEX idx_appointments_created_at ON appointments(created_at);

-- Performance indexes for fraud detection
CREATE INDEX idx_fraud_user_created ON fraud_logs(user_id, detected_at);
CREATE INDEX idx_fraud_risk_created ON fraud_logs(risk_level, detected_at);

-- Performance indexes for time slots
CREATE INDEX idx_slots_center_availability ON time_slots(center_id, available_slots, date);

-- ============================================================================
-- VIEWS (for common queries)
-- ============================================================================

-- View for pending appointments
CREATE VIEW pending_appointments AS
SELECT 
  a.id,
  a.booking_id,
  u.name as user_name,
  u.phone,
  ut.name as update_type,
  c.name as center_name,
  a.scheduled_date,
  ts.start_time,
  ts.end_time,
  a.created_at
FROM appointments a
JOIN users u ON a.user_id = u.id
JOIN update_types ut ON a.update_type_id = ut.id
JOIN centers c ON a.center_id = c.id
JOIN time_slots ts ON a.time_slot_id = ts.id
WHERE a.status = 'scheduled'
ORDER BY a.scheduled_date ASC;

-- View for completed updates
CREATE VIEW completed_updates AS
SELECT 
  uh.urn,
  u.name as user_name,
  u.aadhaar_number,
  ut.name as update_type,
  uh.old_value,
  uh.new_value,
  uh.status,
  uh.created_at,
  uh.approved_at
FROM update_history uh
JOIN users u ON uh.user_id = u.id
JOIN update_types ut ON uh.update_type_id = ut.id
WHERE uh.status = 'approved'
ORDER BY uh.approved_at DESC;

-- View for fraud statistics
CREATE VIEW fraud_summary AS
SELECT 
  DATE(detected_at) as date,
  risk_level,
  COUNT(*) as count,
  COUNT(CASE WHEN resolved THEN 1 END) as resolved_count
FROM fraud_logs
GROUP BY DATE(detected_at), risk_level;

-- ============================================================================
-- INITIAL DATA (Optional sample data)
-- ============================================================================

-- Sample Update Types
INSERT INTO update_types (name, description, risk_level, requires_verification, requires_biometric, can_do_online, estimated_time_minutes)
VALUES 
  ('Address Update', 'Change your registered address', 'low', FALSE, FALSE, TRUE, 10),
  ('Mobile Number Update', 'Update linked mobile number', 'medium', TRUE, FALSE, TRUE, 15),
  ('Email Update', 'Change registered email address', 'low', FALSE, FALSE, TRUE, 10),
  ('Name Correction', 'Correct spelling or update name', 'medium', TRUE, FALSE, FALSE, 20),
  ('Date of Birth Correction', 'Correct your date of birth', 'high', TRUE, FALSE, FALSE, 25),
  ('Gender Update', 'Update gender information', 'high', TRUE, FALSE, FALSE, 25),
  ('Photo Update', 'Update biometric photograph', 'medium', TRUE, TRUE, FALSE, 15),
  ('Fingerprint Update', 'Update biometric fingerprints', 'high', TRUE, TRUE, FALSE, 20),
  ('Iris Scan Update', 'Update biometric iris data', 'high', TRUE, TRUE, FALSE, 20);

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================
/*
1. Database: Use MySQL 8.0+ or PostgreSQL 12+ for full compatibility.
2. Supabase: If using Supabase, import this schema via the SQL Editor.
3. Migrations: Consider using a migration tool (Flyway, Liquibase) for version control.
4. Backups: Set up automated backups for production environments.
5. Security:
   - Use Row-Level Security (RLS) policies in Supabase for multi-tenancy.
   - Hash all sensitive data in the application layer.
   - Use HTTPS for all API communications.
   - Implement rate limiting on endpoints.
6. Scaling:
   - Add partitioning on large tables (appointments, fraud_logs, session_logs).
   - Set up read replicas for analytics queries.
   - Use connection pooling in the application layer.
7. Compliance:
   - Ensure GDPR/data privacy compliance with data retention policies.
   - Maintain complete audit trails (session_logs).
   - Implement encryption at rest for sensitive columns.
*/
