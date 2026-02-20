-- =====================================================
-- AADHAAR ADVANCE DATABASE SEED DATA
-- Run this script in MySQL to populate tables
-- =====================================================

-- =====================================================
-- USERS (Auth only - must come FIRST)
-- =====================================================
INSERT INTO users (id, email, phone, password_hash, aadhaar_record_id, is_active, last_login) VALUES
('usr_001', 'john.doe@example.com', '+91 9876543210', 'hashed_password_001', NULL, true, '2024-12-01 08:15:00'),
('usr_002', 'sarah.smith@example.com', '+91 9876543211', 'hashed_password_002', NULL, true, '2024-12-02 09:30:00'),
('usr_003', 'rajesh.kumar@example.com', '+91 9876543212', 'hashed_password_003', NULL, true, '2024-12-03 07:45:00'),
('usr_004', 'priya.sharma@example.com', '+91 9876543213', 'hashed_password_004', NULL, true, '2024-12-04 10:00:00'),
('usr_005', 'amit.patel@example.com', '+91 9876543214', 'hashed_password_005', NULL, true, '2024-12-05 11:30:00');

-- =====================================================
-- AADHAAR RECORDS (All personal info - must come AFTER users)
-- =====================================================
INSERT INTO aadhaar_records (id, user_id, aadhaar_number, full_name, date_of_birth, gender, address, state, district, city, pincode, locality, landmark, house_number, street, photo_url, fingerprint_status, iris_status, face_scan_status, last_biometric_update, biometric_expiry_date, enrollment_number, enrollment_date, registration_center, card_type, status, is_verified, verification_date, is_eid_linked, eid_number, mobile_verified, email_verified) VALUES
('aad_001', 'usr_001', '123456789012', 'John Doe', '1990-05-15', 'male', '123 Main Street, Apt 4B, Near Station Road', 'Maharashtra', 'Mumbai', 'Mumbai', '400001', 'Fort Area', 'Near CST Station', '123', 'Main Street', 'https://example.com/photos/123456789012.jpg', 'registered', 'registered', 'registered', '2024-01-15', '2034-01-15', 'E/2019/123456789', '2019-03-15', 'Mumbai Central Enrolment Center', 'standard', 'active', true, '2024-01-15 10:00:00', true, '123456789012', true, true),
('aad_002', 'usr_002', '234567890123', 'Sarah Smith', '1985-08-22', 'female', '456 Oak Avenue, Whitefield', 'Karnataka', 'Bangalore', 'Bangalore', '560001', 'Whitefield', 'Near IT Park', '456', 'Oak Avenue', 'https://example.com/photos/234567890123.jpg', 'registered', 'registered', 'registered', '2024-02-20', '2034-02-20', 'E/2018/987654321', '2018-06-20', 'Bangalore Whitefield Enrolment Center', 'standard', 'active', true, '2024-02-20 14:00:00', true, '234567890123', true, true),
('aad_003', 'usr_003', '345678901234', 'Rajesh Kumar', '1992-11-08', 'male', '789 Park Road, Near Bus Stand', 'Tamil Nadu', 'Chennai', 'Chennai', '600001', 'T Nagar', 'Near US Consulate', '789', 'Park Road', 'https://example.com/photos/345678901234.jpg', 'registered', 'registered', 'registered', '2024-03-10', '2034-03-10', 'E/2020/456789123', '2020-01-10', 'Chennai T Nagar Enrolment Center', 'standard', 'active', true, '2024-03-10 11:00:00', true, '345678901234', true, true),
('aad_004', 'usr_004', '456789012345', 'Priya Sharma', '1988-03-30', 'female', '321 Lake View, Connaught Place', 'Delhi', 'Central Delhi', 'New Delhi', '110001', 'Connaught Place', 'Near Metro Station', '321', 'Lake View Road', 'https://example.com/photos/456789012345.jpg', 'registered', 'registered', 'registered', '2024-04-05', '2034-04-05', 'E/2017/789123456', '2017-08-05', 'Delhi CP Enrolment Center', 'standard', 'active', true, '2024-04-05 16:00:00', true, '456789012345', true, true),
('aad_005', 'usr_005', '567890123456', 'Amit Patel', '1995-07-12', 'male', '654 River Side, SG Highway', 'Gujarat', 'Ahmedabad', 'Ahmedabad', '380001', 'SG Highway', 'Near Mall', '654', 'River Side Road', 'https://example.com/photos/567890123456.jpg', 'registered', 'registered', 'registered', '2024-05-18', '2034-05-18', 'E/2021/321654987', '2021-02-18', 'Ahmedabad SG Highway Enrolment Center', 'standard', 'active', true, '2024-05-18 13:00:00', true, '567890123456', true, true);

-- =====================================================
-- UPDATE users table with aadhaar_record_id (after aadhaar_records are inserted)
-- =====================================================
UPDATE users SET aadhaar_record_id = 'aad_001' WHERE id = 'usr_001';
UPDATE users SET aadhaar_record_id = 'aad_002' WHERE id = 'usr_002';
UPDATE users SET aadhaar_record_id = 'aad_003' WHERE id = 'usr_003';
UPDATE users SET aadhaar_record_id = 'aad_004' WHERE id = 'usr_004';
UPDATE users SET aadhaar_record_id = 'aad_005' WHERE id = 'usr_005';

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
('upd_001', 'Address Update', 'Update your residential address in Aadhaar', 'medium', 1, 1, 1, 15),
('upd_002', 'Date of Birth Correction', 'Correct your date of birth in Aadhaar', 'high', 1, 1, 0, 20),
('upd_003', 'Mobile Number Update', 'Update or change your registered mobile number', 'low', 1, 0, 1, 5),
('upd_004', 'Email Update', 'Update your email address', 'low', 0, 0, 1, 3),
('upd_005', 'Name Correction', 'Correct spelling or update name', 'high', 1, 1, 0, 25),
('upd_006', 'Gender Update', 'Update gender information', 'high', 1, 1, 0, 20),
('upd_007', 'Biometric Update', 'Update fingerprints and iris scan', 'medium', 1, 1, 0, 30),
('upd_008', 'Photo Update', 'Update your photograph in Aadhaar', 'medium', 1, 1, 0, 15);

-- =====================================================
-- TIME SLOTS
-- =====================================================
INSERT INTO time_slots (id, center_id, date, start_time, end_time, available_slots, total_capacity, is_active) VALUES
('tsl_001', 'ctr_001', '2024-12-10', '09:00', '10:00', 8, 10, true),
('tsl_002', 'ctr_001', '2024-12-10', '10:00', '11:00', 5, 10, true),
('tsl_003', 'ctr_001', '2024-12-10', '11:00', '12:00', 3, 10, true),
('tsl_004', 'ctr_001', '2024-12-10', '14:00', '15:00', 7, 10, true),
('tsl_005', 'ctr_001', '2024-12-10', '15:00', '16:00', 2, 10, true),
('tsl_006', 'ctr_001', '2024-12-11', '09:00', '10:00', 10, 10, true),
('tsl_007', 'ctr_001', '2024-12-11', '10:00', '11:00', 8, 10, true),
('tsl_008', 'ctr_001', '2024-12-11', '11:00', '12:00', 6, 10, true),
('tsl_009', 'ctr_002', '2024-12-10', '09:00', '10:00', 6, 10, true),
('tsl_010', 'ctr_002', '2024-12-10', '10:00', '11:00', 4, 10, true),
('tsl_011', 'ctr_002', '2024-12-10', '11:00', '12:00', 2, 10, true),
('tsl_012', 'ctr_002', '2024-12-10', '14:00', '15:00', 5, 10, true),
('tsl_013', 'ctr_002', '2024-12-11', '09:00', '10:00', 10, 10, true),
('tsl_014', 'ctr_002', '2024-12-11', '10:00', '11:00', 9, 10, true),
('tsl_015', 'ctr_004', '2024-12-10', '10:00', '11:00', 7, 10, true),
('tsl_016', 'ctr_004', '2024-12-10', '11:00', '12:00', 5, 10, true),
('tsl_017', 'ctr_004', '2024-12-10', '14:00', '15:00', 4, 10, true),
('tsl_018', 'ctr_004', '2024-12-10', '15:00', '16:00', 6, 10, true),
('tsl_019', 'ctr_004', '2024-12-11', '10:00', '11:00', 10, 10, true),
('tsl_020', 'ctr_003', '2024-12-10', '09:00', '10:00', 8, 10, true),
('tsl_021', 'ctr_003', '2024-12-10', '10:00', '11:00', 6, 10, true),
('tsl_022', 'ctr_003', '2024-12-11', '09:00', '10:00', 10, 10, true),
('tsl_023', 'ctr_005', '2024-12-10', '09:00', '10:00', 9, 10, true),
('tsl_024', 'ctr_005', '2024-12-10', '10:00', '11:00', 7, 10, true),
('tsl_025', 'ctr_005', '2024-12-11', '09:00', '10:00', 10, 10, true),
('tsl_026', 'ctr_006', '2024-12-10', '10:00', '11:00', 8, 10, true),
('tsl_027', 'ctr_007', '2024-12-10', '09:00', '10:00', 6, 10, true),
('tsl_028', 'ctr_008', '2024-12-10', '09:00', '10:00', 9, 10, true);

-- =====================================================
-- APPOINTMENTS (References aadhaar_records)
-- =====================================================
INSERT INTO appointments (id, booking_id, aadhaar_record_id, center_id, update_type_id, time_slot_id, scheduled_date, status, is_online, is_biometric_auto_assigned, auto_booked) VALUES
('apt_001', 'ADH20241201001', 'aad_001', 'ctr_001', 'upd_001', 'tsl_001', '2024-12-10', 'scheduled', 0, 0, 0),
('apt_002', 'ADH20241201002', 'aad_002', 'ctr_002', 'upd_003', 'tsl_009', '2024-12-10', 'completed', 1, 0, 0),
('apt_003', 'ADH20241201003', 'aad_003', 'ctr_003', 'upd_002', 'tsl_020', '2024-12-10', 'scheduled', 0, 0, 0),
('apt_004', 'ADH20241201004', 'aad_004', 'ctr_004', 'upd_005', 'tsl_015', '2024-12-10', 'in-review', 0, 1, 1),
('apt_005', 'ADH20241201005', 'aad_005', 'ctr_005', 'upd_001', 'tsl_023', '2024-12-10', 'cancelled', 0, 0, 0),
('apt_006', 'ADH20241125001', 'aad_001', 'ctr_001', 'upd_007', 'tsl_002', '2024-11-25', 'completed', 0, 0, 0),
('apt_007', 'ADH20241120001', 'aad_002', 'ctr_002', 'upd_004', 'tsl_010', '2024-11-20', 'completed', 1, 0, 0),
('apt_008', 'ADH20241115001', 'aad_003', 'ctr_003', 'upd_008', 'tsl_021', '2024-11-15', 'no-show', 0, 0, 0);

-- =====================================================
-- DOCUMENTS
-- =====================================================
INSERT INTO documents (id, appointment_id, document_type, file_name, file_size, s3_url, status, review_notes, uploaded_by_user, created_at, reviewed_at) VALUES
('doc_001', 'apt_001', 'address_proof', 'address_proof_123456.pdf', 245000, 'https://storage.example.com/docs/address_proof_123456.pdf', 'approved', 'Document verified successfully', 1, '2024-12-01 10:00:00', '2024-12-01 14:30:00'),
('doc_002', 'apt_002', 'mobile_proof', 'mobile_proof_234567.jpg', 180000, 'https://storage.example.com/docs/mobile_proof_234567.jpg', 'approved', 'Verified', 1, '2024-12-02 09:15:00', '2024-12-02 11:00:00'),
('doc_003', 'apt_003', 'dob_certificate', 'dob_certificate_345678.pdf', 320000, 'https://storage.example.com/docs/dob_certificate_345678.pdf', 'under-review', NULL, 1, '2024-12-03 08:30:00', NULL),
('doc_004', 'apt_004', 'name_change_proof', 'name_change_456789.pdf', 280000, 'https://storage.example.com/docs/name_change_456789.pdf', 'pending', NULL, 1, '2024-12-04 15:45:00', NULL),
('doc_005', 'apt_005', 'address_proof', 'old_address_567890.pdf', 210000, 'https://storage.example.com/docs/old_address_567890.pdf', 'rejected', 'Document expired. Please provide current address proof.', 1, '2024-12-05 12:00:00', '2024-12-05 16:00:00');

-- =====================================================
-- UPDATE HISTORY (References aadhaar_records)
-- =====================================================
INSERT INTO update_history (id, appointment_id, aadhaar_record_id, update_type_id, field_name, old_value, new_value, status, urn, approved_at, created_at) VALUES
('uh_001', 'apt_006', 'aad_001', 'upd_007', 'biometric_data', 'Fingerprint data - 2023', 'Fingerprint data - 2024', 'approved', 'URN20241125001', '2024-11-25 10:30:00', '2024-11-25 10:25:00'),
('uh_002', 'apt_007', 'aad_002', 'upd_004', 'email', 'email@example.com', 'sarah.smith@example.com', 'approved', 'URN20241120001', '2024-11-20 14:00:00', '2024-11-20 13:55:00'),
('uh_003', 'apt_008', 'aad_003', 'upd_008', 'photo', 'Photo - 2022', 'Photo - 2024', 'rejected', 'URN20241115001', '2024-11-15 11:00:00', '2024-11-15 10:50:00'),
('uh_004', NULL, 'aad_001', 'upd_003', 'mobile', '+91 9876543000', '+91 9876543210', 'approved', 'URN20241001001', '2024-10-01 09:30:00', '2024-10-01 09:25:00');

-- =====================================================
-- FRAUD LOGS (References aadhaar_records)
-- =====================================================
INSERT INTO fraud_logs (id, aadhaar_record_id, appointment_id, event_type, risk_level, confidence_score, action_taken, resolved, detected_at, notes) VALUES
('fgl_001', 'aad_001', NULL, 'multiple_otp_requests', 'high', 0.85, 'flagged', 1, '2024-12-01 15:45:00', 'Multiple OTP requests detected from IP 115.124.45.67'),
('fgl_002', NULL, NULL, 'suspicious_registration', 'high', 0.92, 'blocked', 1, '2024-12-02 10:15:00', 'New user registration with invalid Aadhaar format'),
('fgl_003', 'aad_003', 'apt_008', 'no_show_pattern', 'medium', 0.60, 'flagged', 0, '2024-12-03 12:00:00', 'User has 3 no-show appointments in last 30 days'),
('fgl_004', NULL, NULL, 'bot_detection', 'medium', 0.55, 'blocked', 1, '2024-12-04 07:55:00', 'Automated bot-like behavior detected on booking page'),
('fgl_005', 'aad_004', 'apt_004', 'document_mismatch', 'high', 0.78, 'needs_verification', 0, '2024-12-05 14:30:00', 'Submitted document details do not match Aadhaar records');

-- =====================================================
-- CENTER LOAD
-- =====================================================
INSERT INTO center_load (id, center_id, date, current_load, predicted_load, capacity, occupancy_percentage) VALUES
('cl_001', 'ctr_001', '2024-12-10', 320, 350, 500, 64.00),
('cl_002', 'ctr_001', '2024-12-11', 280, 340, 500, 56.00),
('cl_003', 'ctr_001', '2024-12-09', 450, 420, 500, 90.00),
('cl_004', 'ctr_002', '2024-12-10', 290, 310, 450, 64.44),
('cl_005', 'ctr_002', '2024-12-11', 250, 300, 450, 55.56),
('cl_006', 'ctr_002', '2024-12-09', 410, 390, 450, 91.11),
('cl_007', 'ctr_004', '2024-12-10', 380, 420, 600, 63.33),
('cl_008', 'ctr_004', '2024-12-11', 340, 400, 600, 56.67),
('cl_009', 'ctr_004', '2024-12-09', 520, 500, 600, 86.67),
('cl_010', 'ctr_003', '2024-12-10', 240, 260, 400, 60.00),
('cl_011', 'ctr_003', '2024-12-11', 210, 250, 400, 52.50),
('cl_012', 'ctr_003', '2024-12-09', 365, 350, 400, 91.25),
('cl_013', 'ctr_005', '2024-12-10', 180, 200, 350, 51.43),
('cl_014', 'ctr_005', '2024-12-11', 160, 190, 350, 45.71),
('cl_015', 'ctr_005', '2024-12-09', 310, 300, 350, 88.57),
('cl_016', 'ctr_006', '2024-12-10', 220, 240, 420, 52.38),
('cl_017', 'ctr_007', '2024-12-10', 190, 210, 380, 50.00),
('cl_018', 'ctr_008', '2024-12-10', 150, 170, 320, 46.88);

-- =====================================================
-- ANALYTICS SUMMARY
-- =====================================================
INSERT INTO analytics_summary (id, metric_name, metric_date, metric_value) VALUES
('as_001', 'total_bookings', '2024-12-10', 1850),
('as_002', 'completed_updates', '2024-12-10', 1420),
('as_003', 'fraud_attempts', '2024-12-10', 12),
('as_004', 'fraud_prevented', '2024-12-10', 10),
('as_005', 'avg_wait_time', '2024-12-10', 18),
('as_006', 'total_bookings', '2024-12-09', 2100),
('as_007', 'completed_updates', '2024-12-09', 1680),
('as_008', 'fraud_attempts', '2024-12-09', 15),
('as_009', 'fraud_prevented', '2024-12-09', 12);

-- =====================================================
-- COMMENTS
-- =====================================================
-- Run this script in MySQL
-- Order of execution: 1) users 2) aadhaar_records 3) update users with aadhaar_record_id 4) rest of tables
-- Boolean values use 1 for true and 0 for false
