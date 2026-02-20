-- =====================================================
-- AADHAAR ADVANCE DATABASE SEED DATA
-- Run this script in Supabase SQL Editor to populate tables
-- =====================================================

-- =====================================================
-- USERS
-- =====================================================
INSERT INTO users (id, aadhaar_number, name, email, phone, date_of_birth, gender, address, state, city, pincode, last_biometric_update, last_login, is_active) VALUES
('usr_001', '123456789012', 'John Doe', 'john.doe@example.com', '+91 9876543210', DATE '1990-05-15', 'male', '123 Main Street, Apt 4B', 'Maharashtra', 'Mumbai', '400001', TIMESTAMPTZ '2024-01-15T10:30:00Z', TIMESTAMPTZ '2024-12-01T08:15:00Z', true),
('usr_002', '234567890123', 'Sarah Smith', 'sarah.smith@example.com', '+91 9876543211', DATE '1985-08-22', 'female', '456 Oak Avenue', 'Karnataka', 'Bangalore', '560001', TIMESTAMPTZ '2024-02-20T14:45:00Z', TIMESTAMPTZ '2024-12-02T09:30:00Z', true),
('usr_003', '345678901234', 'Rajesh Kumar', 'rajesh.kumar@example.com', '+91 9876543212', DATE '1992-11-08', 'male', '789 Park Road', 'Tamil Nadu', 'Chennai', '600001', TIMESTAMPTZ '2024-03-10T11:00:00Z', TIMESTAMPTZ '2024-12-03T07:45:00Z', true),
('usr_004', '456789012345', 'Priya Sharma', 'priya.sharma@example.com', '+91 9876543213', DATE '1988-03-30', 'female', '321 Lake View', 'Delhi', 'New Delhi', '110001', TIMESTAMPTZ '2024-04-05T16:20:00Z', TIMESTAMPTZ '2024-12-04T10:00:00Z', true),
('usr_005', '567890123456', 'Amit Patel', 'amit.patel@example.com', '+91 9876543214', DATE '1995-07-12', 'male', '654 River Side', 'Gujarat', 'Ahmedabad', '380001', TIMESTAMPTZ '2024-05-18T13:10:00Z', TIMESTAMPTZ '2024-12-05T11:30:00Z', true);

-- =====================================================
-- CENTERS
-- =====================================================
INSERT INTO centers (id, name, city, state, pincode, address, capacity, latitude, longitude, phone, email, working_hours_start, working_hours_end, is_active) VALUES
('ctr_001', 'Aadhaar Seva Kendra - Mumbai Central', 'Mumbai', 'Maharashtra', '400001', 'Ground Floor, Business Tower, Near CST Station', 500, 18.9398, 72.8354, '+91 22 2345 6789', 'mumbai.central@aadhaar.gov.in', '09:00', '18:00', true),
('ctr_002', 'Aadhaar Seva Kendra - Bangalore MG Road', 'Bangalore', 'Karnataka', '560001', '1st Floor, City Center, MG Road', 450, 12.9750, 77.6060, '+91 80 2345 6789', 'bangalore.mgroad@aadhaar.gov.in', '09:00', '17:00', true),
('ctr_003', 'Aadhaar Seva Kendra - Chennai T Nagar', 'Chennai', 'Tamil Nadu', '600017', 'No. 45, Usman Road, T Nagar', 400, 13.0418, 80.2341, '+91 44 2345 6789', 'chennai.tnagar@aadhaar.gov.in', '09:00', '17:30', true),
('ctr_004', 'Aadhaar Seva Kendra - Delhi Connaught Place', 'New Delhi', 'Delhi', '110001', 'Block A, Shop No. 12, Inner Circle, CP', 600, 28.6315, 77.2197, '+91 11 2345 6789', 'delhi.cp@aadhaar.gov.in', '10:00', '18:00', true),
('ctr_005', 'Aadhaar Seva Kendra - Ahmedabad SG Highway', 'Ahmedabad', 'Gujarat', '380015', '2nd Floor, Westgate Mall, SG Highway', 350, 23.0267, 72.5791, '+91 79 2345 6789', 'ahmedabad.sghighway@aadhaar.gov.in', '09:00', '17:00', true),
('ctr_006', 'Aadhaar Seva Kendra - Kolkata Park Street', 'Kolkata', 'West Bengal', '700016', 'No. 78, Park Street Area', 420, 22.5526, 88.3520, '+91 33 2345 6789', 'kolkata.parkstreet@aadhaar.gov.in', '10:00', '17:30', true),
('ctr_007', 'Aadhaar Seva Kendra - Hyderabad Gachibowli', 'Hyderabad', 'Telangana', '500032', '2-48/1, Survey No. 41, Gachibowli', 380, 17.4401, 78.3408, '+91 40 2345 6789', 'hyderabad.gachibowli@aadhaar.gov.in', '09:00', '18:00', true),
('ctr_008', 'Aadhaar Seva Kendra - Pune Koregaon Park', 'Pune', 'Maharashtra', '411001', 'Shop No. 101, Koregaon Park Plaza', 320, 18.5362, 73.8946, '+91 20 2345 6789', 'pune.koregaonpark@aadhaar.gov.in', '09:00', '17:00', true);

-- =====================================================
-- UPDATE TYPES
-- =====================================================
INSERT INTO update_types (id, name, description, risk_level, requires_verification, requires_biometric, can_do_online, estimated_time_minutes) VALUES
('upd_001', 'Address Update', 'Update your residential address in Aadhaar', 'medium', true, true, true, 15),
('upd_002', 'Date of Birth Correction', 'Correct your date of birth in Aadhaar', 'high', true, true, false, 20),
('upd_003', 'Mobile Number Update', 'Update or change your registered mobile number', 'low', true, false, true, 5),
('upd_004', 'Email Update', 'Update your email address', 'low', false, false, true, 3),
('upd_005', 'Name Correction', 'Correct spelling or update name', 'high', true, true, false, 25),
('upd_006', 'Gender Update', 'Update gender information', 'high', true, true, false, 20),
('upd_007', 'Biometric Update', 'Update fingerprints and iris scan', 'medium', true, true, false, 30),
('upd_008', 'Photo Update', 'Update your photograph in Aadhaar', 'medium', true, true, false, 15);

-- =====================================================
-- TIME SLOTS
-- =====================================================
INSERT INTO time_slots (id, center_id, date, time, available, total) VALUES
-- Mumbai Center slots
('tsl_001', 'ctr_001', DATE '2024-12-10', '09:00 AM', 8, 10),
('tsl_002', 'ctr_001', DATE '2024-12-10', '10:00 AM', 5, 10),
('tsl_003', 'ctr_001', DATE '2024-12-10', '11:00 AM', 3, 10),
('tsl_004', 'ctr_001', DATE '2024-12-10', '02:00 PM', 7, 10),
('tsl_005', 'ctr_001', DATE '2024-12-10', '03:00 PM', 2, 10),
('tsl_006', 'ctr_001', DATE '2024-12-11', '09:00 AM', 10, 10),
('tsl_007', 'ctr_001', DATE '2024-12-11', '10:00 AM', 8, 10),
('tsl_008', 'ctr_001', DATE '2024-12-11', '11:00 AM', 6, 10),
-- Bangalore Center slots
('tsl_009', 'ctr_002', DATE '2024-12-10', '09:00 AM', 6, 10),
('tsl_010', 'ctr_002', DATE '2024-12-10', '10:00 AM', 4, 10),
('tsl_011', 'ctr_002', DATE '2024-12-10', '11:00 AM', 2, 10),
('tsl_012', 'ctr_002', DATE '2024-12-10', '02:00 PM', 5, 10),
('tsl_013', 'ctr_002', DATE '2024-12-11', '09:00 AM', 10, 10),
('tsl_014', 'ctr_002', DATE '2024-12-11', '10:00 AM', 9, 10),
-- Delhi Center slots
('tsl_015', 'ctr_004', DATE '2024-12-10', '10:00 AM', 7, 10),
('tsl_016', 'ctr_004', DATE '2024-12-10', '11:00 AM', 5, 10),
('tsl_017', 'ctr_004', DATE '2024-12-10', '02:00 PM', 4, 10),
('tsl_018', 'ctr_004', DATE '2024-12-10', '03:00 PM', 6, 10),
('tsl_019', 'ctr_004', DATE '2024-12-11', '10:00 AM', 10, 10),
-- Chennai Center slots
('tsl_020', 'ctr_003', DATE '2024-12-10', '09:00 AM', 8, 10),
('tsl_021', 'ctr_003', DATE '2024-12-10', '10:00 AM', 6, 10),
('tsl_022', 'ctr_003', DATE '2024-12-11', '09:00 AM', 10, 10),
-- Ahmedabad Center slots
('tsl_023', 'ctr_005', DATE '2024-12-10', '09:00 AM', 9, 10),
('tsl_024', 'ctr_005', DATE '2024-12-10', '10:00 AM', 7, 10),
('tsl_025', 'ctr_005', DATE '2024-12-11', '09:00 AM', 10, 10),
-- Kolkata, Hyderabad, Pune slots
('tsl_026', 'ctr_006', DATE '2024-12-10', '10:00 AM', 8, 10),
('tsl_027', 'ctr_007', DATE '2024-12-10', '09:00 AM', 6, 10),
('tsl_028', 'ctr_008', DATE '2024-12-10', '09:00 AM', 9, 10);

-- =====================================================
-- APPOINTMENTS
-- =====================================================
INSERT INTO appointments (id, user_id, center_id, update_type_id, time_slot_id, booking_id, scheduled_date, status, mode, is_auto_assigned) VALUES
('apt_001', 'usr_001', 'ctr_001', 'upd_001', 'tsl_001', 'ADH20241201001', DATE '2024-12-10', 'scheduled', 'in-person', false),
('apt_002', 'usr_002', 'ctr_002', 'upd_003', 'tsl_009', 'ADH20241201002', DATE '2024-12-10', 'completed', 'online', false),
('apt_003', 'usr_003', 'ctr_003', 'upd_002', 'tsl_020', 'ADH20241201003', DATE '2024-12-10', 'scheduled', 'in-person', false),
('apt_004', 'usr_004', 'ctr_004', 'upd_005', 'tsl_015', 'ADH20241201004', DATE '2024-12-10', 'in-review', 'in-person', true),
('apt_005', 'usr_005', 'ctr_005', 'upd_001', 'tsl_023', 'ADH20241201005', DATE '2024-12-10', 'cancelled', 'in-person', false),
('apt_006', 'usr_001', 'ctr_001', 'upd_007', 'tsl_002', 'ADH20241125001', DATE '2024-11-25', 'completed', 'in-person', false),
('apt_007', 'usr_002', 'ctr_002', 'upd_004', 'tsl_010', 'ADH20241120001', DATE '2024-11-20', 'completed', 'online', false),
('apt_008', 'usr_003', 'ctr_003', 'upd_008', 'tsl_021', 'ADH20241115001', DATE '2024-11-15', 'no-show', 'in-person', false);

-- =====================================================
-- DOCUMENTS
-- =====================================================
INSERT INTO documents (id, user_id, appointment_id, file_name, file_path, file_type, file_size, status, review_note, uploaded_at, reviewed_at) VALUES
('doc_001', 'usr_001', 'apt_001', 'address_proof.pdf', 'usr_001/address_proof_123456.pdf', 'application/pdf', 245000, 'approved', 'Document verified successfully', TIMESTAMPTZ '2024-12-01T10:00:00Z', TIMESTAMPTZ '2024-12-01T14:30:00Z'),
('doc_002', 'usr_002', 'apt_002', 'mobile_proof.jpg', 'usr_002/mobile_proof_234567.jpg', 'image/jpeg', 180000, 'approved', 'Verified', TIMESTAMPTZ '2024-12-02T09:15:00Z', TIMESTAMPTZ '2024-12-02T11:00:00Z'),
('doc_003', 'usr_003', 'apt_003', 'dob_certificate.pdf', 'usr_003/dob_certificate_345678.pdf', 'application/pdf', 320000, 'under-review', NULL, TIMESTAMPTZ '2024-12-03T08:30:00Z', NULL),
('doc_004', 'usr_004', 'apt_004', 'name_change_proof.pdf', 'usr_004/name_change_456789.pdf', 'application/pdf', 280000, 'pending', NULL, TIMESTAMPTZ '2024-12-04T15:45:00Z', NULL),
('doc_005', 'usr_005', NULL, 'old_address_proof.pdf', 'usr_005/old_address_567890.pdf', 'application/pdf', 210000, 'rejected', 'Document expired. Please provide current address proof.', TIMESTAMPTZ '2024-12-05T12:00:00Z', TIMESTAMPTZ '2024-12-05T16:00:00Z');

-- =====================================================
-- UPDATE HISTORY
-- =====================================================
INSERT INTO update_history (id, user_id, appointment_id, update_type_id, urn, old_value, new_value, status, processed_at, created_at) VALUES
('uh_001', 'usr_001', 'apt_006', 'upd_007', 'URN20241125001', 'Fingerprint data - 2023', 'Fingerprint data - 2024', 'approved', TIMESTAMPTZ '2024-11-25T10:30:00Z', TIMESTAMPTZ '2024-11-25T10:25:00Z'),
('uh_002', 'usr_002', 'apt_007', 'upd_004', 'URN20241120001', 'email@example.com', 'sarah.smith@example.com', 'approved', TIMESTAMPTZ '2024-11-20T14:00:00Z', TIMESTAMPTZ '2024-11-20T13:55:00Z'),
('uh_003', 'usr_003', 'apt_008', 'upd_008', 'URN20241115001', 'Photo - 2022', 'Photo - 2024', 'rejected', TIMESTAMPTZ '2024-11-15T11:00:00Z', TIMESTAMPTZ '2024-11-15T10:50:00Z'),
('uh_004', 'usr_001', NULL, 'upd_003', 'URN20241001001', '+91 9876543000', '+91 9876543210', 'approved', TIMESTAMPTZ '2024-10-01T09:30:00Z', TIMESTAMPTZ '2024-10-01T09:25:00Z');

-- =====================================================
-- FRAUD LOGS
-- =====================================================
INSERT INTO fraud_logs (id, user_id, appointment_id, event_type, description, risk_level, risk_score, ip_address, user_agent, resolved, resolved_at, detected_at) VALUES
('fgl_001', 'usr_001', NULL, 'multiple_otp_requests', 'Multiple OTP requests detected from IP 115.124.45.67', 'high', 85, '115.124.45.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', true, TIMESTAMPTZ '2024-12-01T16:00:00Z', TIMESTAMPTZ '2024-12-01T15:45:00Z'),
('fgl_002', NULL, NULL, 'suspicious_registration', 'New user registration with invalid Aadhaar format', 'high', 92, '223.178.45.123', 'Mozilla/5.0 (Linux; Android 11)', true, TIMESTAMPTZ '2024-12-02T10:30:00Z', TIMESTAMPTZ '2024-12-02T10:15:00Z'),
('fgl_003', 'usr_003', 'apt_008', 'no_show_pattern', 'User has 3 no-show appointments in last 30 days', 'medium', 60, NULL, NULL, false, NULL, TIMESTAMPTZ '2024-12-03T12:00:00Z'),
('fgl_004', NULL, NULL, 'bot_detection', 'Automated bot-like behavior detected on booking page', 'medium', 55, '182.78.45.189', 'Python-urllib/3.9', true, TIMESTAMPTZ '2024-12-04T08:00:00Z', TIMESTAMPTZ '2024-12-04T07:55:00Z'),
('fgl_005', 'usr_004', 'apt_004', 'document_mismatch', 'Submitted document details do not match Aadhaar records', 'high', 78, '117.234.56.78', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', false, NULL, TIMESTAMPTZ '2024-12-05T14:30:00Z');

-- =====================================================
-- CENTER LOAD
-- =====================================================
INSERT INTO center_load (id, center_id, date, total_capacity, booked_count, predicted_demand, actual_demand) VALUES
-- Mumbai Center loads
('cl_001', 'ctr_001', DATE '2024-12-10', 500, 320, 350, NULL),
('cl_002', 'ctr_001', DATE '2024-12-11', 500, 280, 340, NULL),
('cl_003', 'ctr_001', DATE '2024-12-09', 500, 450, 420, 445),
-- Bangalore Center loads
('cl_004', 'ctr_002', DATE '2024-12-10', 450, 290, 310, NULL),
('cl_005', 'ctr_002', DATE '2024-12-11', 450, 250, 300, NULL),
('cl_006', 'ctr_002', DATE '2024-12-09', 450, 410, 390, 405),
-- Delhi Center loads
('cl_007', 'ctr_004', DATE '2024-12-10', 600, 380, 420, NULL),
('cl_008', 'ctr_004', DATE '2024-12-11', 600, 340, 400, NULL),
('cl_009', 'ctr_004', DATE '2024-12-09', 600, 520, 500, 535),
-- Chennai Center loads
('cl_010', 'ctr_003', DATE '2024-12-10', 400, 240, 260, NULL),
('cl_011', 'ctr_003', DATE '2024-12-11', 400, 210, 250, NULL),
('cl_012', 'ctr_003', DATE '2024-12-09', 400, 365, 350, 370),
-- Ahmedabad Center loads
('cl_013', 'ctr_005', DATE '2024-12-10', 350, 180, 200, NULL),
('cl_014', 'ctr_005', DATE '2024-12-11', 350, 160, 190, NULL),
('cl_015', 'ctr_005', DATE '2024-12-09', 350, 310, 300, 320),
-- Kolkata Center loads
('cl_016', 'ctr_006', DATE '2024-12-10', 420, 220, 240, NULL),
-- Hyderabad Center loads
('cl_017', 'ctr_007', DATE '2024-12-10', 380, 190, 210, NULL),
-- Pune Center loads
('cl_018', 'ctr_008', DATE '2024-12-10', 320, 150, 170, NULL);

-- =====================================================
-- ANALYTICS SUMMARY
-- =====================================================
INSERT INTO analytics_summary (id, date, total_bookings, completed_updates, fraud_attempts, fraud_prevented, avg_wait_time_minutes, satisfaction_rate) VALUES
('as_001', DATE '2024-12-10', 1850, 1420, 12, 10, 18, 4.2),
('as_002', DATE '2024-12-09', 2100, 1680, 15, 12, 22, 4.0),
('as_003', DATE '2024-12-08', 1950, 1520, 8, 7, 20, 4.1),
('as_004', DATE '2024-12-07', 1800, 1390, 10, 8, 17, 4.3),
('as_005', DATE '2024-12-06', 1650, 1280, 6, 5, 15, 4.4);

-- =====================================================
-- COMMENTS
-- =====================================================
-- Run this script in Supabase SQL Editor
-- All date values use explicit DATE type casting
-- All timestamp values use explicit TIMESTAMPTZ type casting
-- The data includes realistic sample records for testing
