-- ============================================================================
-- AADHAAR ADVANCE DATABASE SCHEMA
-- Redesigned: Users = Auth only, Aadhaar Records = All personal info
-- ============================================================================

-- ============================================================================
-- USERS TABLE (Authentication only - no personal data)
-- ============================================================================
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  aadhaar_record_id CHAR(36) UNIQUE, -- Links to Aadhaar record
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_aadhaar_record (aadhaar_record_id)
);

-- ============================================================================
-- AADHAAR RECORDS TABLE (All personal & Aadhaar information)
-- Can exist WITHOUT a user account (for pre-seeded UIDAI records)
-- ============================================================================
CREATE TABLE aadhaar_records (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) UNIQUE, -- Can be NULL for records not yet linked to app users
  aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
  
  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  
  -- Address Information
  address TEXT NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  city VARCHAR(100),
  pincode VARCHAR(10) NOT NULL,
  locality VARCHAR(255),
  landmark VARCHAR(255),
  house_number VARCHAR(100),
  street VARCHAR(255),
  care_of VARCHAR(255),
  guardian_name VARCHAR(255),
  
  -- Photo & Biometrics
  photo_url VARCHAR(512),
  fingerprint_status VARCHAR(20) DEFAULT 'registered',
  iris_status VARCHAR(20) DEFAULT 'registered',
  face_scan_status VARCHAR(20) DEFAULT 'registered',
  last_biometric_update DATE,
  biometric_expiry_date DATE,
  
  -- Aadhaar Details
  enrollment_number VARCHAR(28),
  enrollment_date DATE,
  registration_center VARCHAR(255),
  card_type VARCHAR(20) DEFAULT 'standard',
  status VARCHAR(20) DEFAULT 'active',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  is_eid_linked BOOLEAN DEFAULT FALSE,
  eid_number VARCHAR(20),
  
  -- Contact Verification
  mobile_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_aadhaar_number (aadhaar_number),
  INDEX idx_state (state),
  INDEX idx_district (district),
  INDEX idx_status (status)
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
  risk_level VARCHAR(20) NOT NULL,
  requires_verification BOOLEAN DEFAULT FALSE,
  requires_biometric BOOLEAN DEFAULT FALSE,
  can_do_online BOOLEAN DEFAULT FALSE,
  estimated_time_minutes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_risk_level (risk_level),
  INDEX idx_biometric (requires_biometric),
  INDEX idx_online (can_do_online)
);

-- ============================================================================
-- UPDATE_TYPE_DOCUMENTS TABLE
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
  risk_level VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_slot (center_id, date, start_time),
  INDEX idx_center_date (center_id, date),
  INDEX idx_available (available_slots)
);

-- ============================================================================
-- APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE appointments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_id VARCHAR(20) UNIQUE NOT NULL,
  aadhaar_record_id CHAR(36) NOT NULL, -- References aadhaar_records instead of users
  center_id CHAR(36) NOT NULL,
  update_type_id CHAR(36) NOT NULL,
  time_slot_id CHAR(36) NOT NULL,
  scheduled_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
  is_online BOOLEAN DEFAULT FALSE,
  is_biometric_auto_assigned BOOLEAN DEFAULT FALSE,
  auto_booked BOOLEAN DEFAULT FALSE,
  queue_position INT,
  counter_number INT,
  estimated_wait_minutes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  
  FOREIGN KEY (aadhaar_record_id) REFERENCES aadhaar_records(id) ON DELETE CASCADE,
  FOREIGN KEY (center_id) REFERENCES centers(id),
  FOREIGN KEY (update_type_id) REFERENCES update_types(id),
  FOREIGN KEY (time_slot_id) REFERENCES time_slots(id),
  INDEX idx_aadhaar_record (aadhaar_record_id),
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
  status VARCHAR(30) DEFAULT 'pending',
  review_notes TEXT,
  uploaded_by_user BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by CHAR(36),
  
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  INDEX idx_appointment (appointment_id),
  INDEX idx_status (status)
);

-- ============================================================================
-- UPDATE HISTORY TABLE
-- ============================================================================
CREATE TABLE update_history (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  appointment_id CHAR(36),
  aadhaar_record_id CHAR(36) NOT NULL,
  update_type_id CHAR(36) NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  status VARCHAR(30) DEFAULT 'pending',
  urn VARCHAR(50) UNIQUE,
  rejection_reason TEXT,
  approved_by CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (aadhaar_record_id) REFERENCES aadhaar_records(id) ON DELETE CASCADE,
  FOREIGN KEY (update_type_id) REFERENCES update_types(id),
  INDEX idx_aadhaar_record (aadhaar_record_id),
  INDEX idx_appointment (appointment_id),
  INDEX idx_urn (urn),
  INDEX idx_status (status)
);

-- ============================================================================
-- FRAUD_LOGS TABLE
-- ============================================================================
CREATE TABLE fraud_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  aadhaar_record_id CHAR(36),
  appointment_id CHAR(36),
  event_type VARCHAR(100),
  risk_level VARCHAR(20),
  confidence_score DECIMAL(3, 2),
  details JSON,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action_taken VARCHAR(100),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  notes TEXT,
  
  FOREIGN KEY (aadhaar_record_id) REFERENCES aadhaar_records(id) ON DELETE SET NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  INDEX idx_risk_level (risk_level),
  INDEX idx_detected_at (detected_at),
  INDEX idx_aadhaar_record (aadhaar_record_id)
);

-- ============================================================================
-- CENTER_LOAD TABLE
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
-- DEMAND_FORECAST TABLE
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
-- SESSION_LOGS TABLE
-- ============================================================================
CREATE TABLE session_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_action (user_id, action),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- STAFF_USERS TABLE
-- ============================================================================
CREATE TABLE staff_users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
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
-- ANALYTICS_SUMMARY TABLE
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
