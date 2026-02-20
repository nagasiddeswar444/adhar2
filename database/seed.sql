-- =====================================================
-- AADHAAR ADVANCE DATABASE SEED DATA
-- Updated to match schema_final.sql
-- =====================================================

-- =====================================================
-- USERS (Auth only - must come FIRST)
-- =====================================================
INSERT INTO users (id, email, phone, password_hash, aadhaar_record_id, is_active, last_login) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '+919876543210', 'hashed_password_001', NULL, TRUE, '2024-12-01 08:15:00'),
('550e8400-e29b-41d4-a716-446655440002', 'sarah.smith@example.com', '+919876543211', 'hashed_password_002', NULL, TRUE, '2024-12-02 09:30:00'),
('550e8400-e29b-41d4-a716-446655440003', 'rajesh.kumar@example.com', '+919876543212', 'hashed_password_003', NULL, TRUE, '2024-12-03 07:45:00'),
('550e8400-e29b-41d4-a716-446655440004', 'priya.sharma@example.com', '+919876543213', 'hashed_password_004', NULL, TRUE, '2024-12-04 10:00:00'),
('550e8400-e29b-41d4-a716-446655440005', 'amit.patel@example.com', '+919876543214', 'hashed_password_005', NULL, TRUE, '2024-12-05 11:30:00');

-- =====================================================
-- AADHAAR RECORDS (All personal info - must come AFTER users)
-- =====================================================
INSERT INTO aadhaar_records (
  id, user_id, aadhaar_number, full_name, date_of_birth, gender, 
  address, state, district, city, pincode, locality, landmark, house_number, street,
  phone,
  photo_url, fingerprint_status, iris_status, face_scan_status, 
  last_biometric_update, biometric_expiry_date, 
  enrollment_number, enrollment_date, registration_center, 
  card_type, status, is_verified, verification_date, 
  is_eid_linked, eid_number, 
  mobile_verified, email_verified
) VALUES
(
  '660e8400-e29b-41d4-a716-446655440001', 
  '550e8400-e29b-41d4-a716-446655440001', 
  '123456789012', 
  'John Doe', 
  '1990-05-15', 
  'Male', 
  '123 Main Street, Apt 4B, Near Station Road', 
  'Maharashtra', 
  'Mumbai', 
  'Mumbai', 
  '400001', 
  'Fort Area', 
  'Near CST Station', 
  '123', 
  'Main Street',
  '+919876543210',
  'https://example.com/photos/123456789012.jpg', 
  'registered', 
  'registered', 
  'registered', 
  '2024-01-15', 
  '2034-01-15', 
  'E/2019/123456789', 
  '2019-03-15', 
  'Mumbai Central Enrolment Center', 
  'standard', 
  'active', 
  TRUE, 
  '2024-01-15 10:00:00', 
  TRUE, 
  '123456789012', 
  TRUE, 
  TRUE
),
(
  '660e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440002', 
  '234567890123', 
  'Sarah Smith', 
  '1985-08-22', 
  'Female', 
  '456 Oak Avenue, Whitefield', 
  'Karnataka', 
  'Bangalore', 
  'Bangalore', 
  '560001', 
  'Whitefield', 
  'Near IT Park', 
  '456', 
  'Oak Avenue',
  '+919876543211',
  'https://example.com/photos/234567890123.jpg', 
  'registered', 
  'registered', 
  'registered', 
  '2024-02-20', 
  '2034-02-20', 
  'E/2018/987654321', 
  '2018-06-20', 
  'Bangalore Whitefield Enrolment Center', 
  'standard', 
  'active', 
  TRUE, 
  '2024-02-20 14:00:00', 
  TRUE, 
  '234567890123', 
  TRUE, 
  TRUE
),
(
  '660e8400-e29b-41d4-a716-446655440003', 
  '550e8400-e29b-41d4-a716-446655440003', 
  '345678901234', 
  'Rajesh Kumar', 
  '1992-11-08', 
  'Male', 
  '789 Park Road, Near Bus Stand', 
  'Tamil Nadu', 
  'Chennai', 
  'Chennai', 
  '600001', 
  'T Nagar', 
  'Near US Consulate', 
  '789', 
  'Park Road',
  '+919876543212',
  'https://example.com/photos/345678901234.jpg', 
  'registered', 
  'registered', 
  'registered', 
  '2024-03-10', 
  '2034-03-10', 
  'E/2020/456789123', 
  '2020-01-10', 
  'Chennai T Nagar Enrolment Center', 
  'standard', 
  'active', 
  TRUE, 
  '2024-03-10 11:00:00', 
  TRUE, 
  '345678901234', 
  TRUE, 
  TRUE
),
(
  '660e8400-e29b-41d4-a716-446655440004', 
  '550e8400-e29b-41d4-a716-446655440004', 
  '456789012345', 
  'Priya Sharma', 
  '1988-03-30', 
  'Female', 
  '321 Lake View, Connaught Place', 
  'Delhi', 
  'Central Delhi', 
  'New Delhi', 
  '110001', 
  'Connaught Place', 
  'Near Metro Station', 
  '321', 
  'Lake View Road',
  '+919876543213',
  'https://example.com/photos/456789012345.jpg', 
  'registered', 
  'registered', 
  'registered', 
  '2024-04-05', 
  '2034-04-05', 
  'E/2017/789123456', 
  '2017-08-05', 
  'Delhi CP Enrolment Center', 
  'standard', 
  'active', 
  TRUE, 
  '2024-04-05 16:00:00', 
  TRUE, 
  '456789012345', 
  TRUE, 
  TRUE
),
(
  '660e8400-e29b-41d4-a716-446655440005', 
  '550e8400-e29b-41d4-a716-446655440005', 
  '567890123456', 
  'Amit Patel', 
  '1995-07-12', 
  'Male', 
  '654 River Side, SG Highway', 
  'Gujarat', 
  'Ahmedabad', 
  'Ahmedabad', 
  '380001', 
  'SG Highway', 
  'Near Mall', 
  '654', 
  'River Side Road',
  '+919876543214',
  'https://example.com/photos/567890123456.jpg', 
  'registered', 
  'registered', 
  'registered', 
  '2024-05-18', 
  '2034-05-18', 
  'E/2021/321654987', 
  '2021-02-18', 
  'Ahmedabad SG Highway Enrolment Center', 
  'standard', 
  'active', 
  TRUE, 
  '2024-05-18 13:00:00', 
  TRUE, 
  '567890123456', 
  TRUE, 
  TRUE
);

-- =====================================================
-- UPDATE users table with aadhaar_record_id (after aadhaar_records are inserted)
-- =====================================================
UPDATE users SET aadhaar_record_id = '660e8400-e29b-41d4-a716-446655440001' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE users SET aadhaar_record_id = '660e8400-e29b-41d4-a716-446655440002' WHERE id = '550e8400-e29b-41d4-a716-446655440002';
UPDATE users SET aadhaar_record_id = '660e8400-e29b-41d4-a716-446655440003' WHERE id = '550e8400-e29b-41d4-a716-446655440003';
UPDATE users SET aadhaar_record_id = '660e8400-e29b-41d4-a716-446655440004' WHERE id = '550e8400-e29b-41d4-a716-446655440004';
UPDATE users SET aadhaar_record_id = '660e8400-e29b-41d4-a716-446655440005' WHERE id = '550e8400-e29b-41d4-a716-446655440005';

-- =====================================================
-- CENTERS
-- =====================================================
INSERT INTO centers (id, name, city, state, pincode, address, capacity, latitude, longitude, phone, email, working_hours_start, working_hours_end, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Aadhaar Seva Kendra - Mumbai Central', 'Mumbai', 'Maharashtra', '400001', 'Ground Floor, Business Tower, Near CST Station', 500, 18.9398, 72.8354, '+91 22 2345 6789', 'mumbai.central@aadhaar.gov.in', '09:00', '18:00', TRUE),
('770e8400-e29b-41d4-a716-446655440002', 'Aadhaar Seva Kendra - Bangalore MG Road', 'Bangalore', 'Karnataka', '560001', '1st Floor, City Center, MG Road', 450, 12.9750, 77.6060, '+91 80 2345 6789', 'bangalore.mgroad@aadhaar.gov.in', '09:00', '17:00', TRUE),
('770e8400-e29b-41d4-a716-446655440003', 'Aadhaar Seva Kendra - Chennai T Nagar', 'Chennai', 'Tamil Nadu', '600017', 'No. 45, Usman Road, T Nagar', 400, 13.0418, 80.2341, '+91 44 2345 6789', 'chennai.tnagar@aadhaar.gov.in', '09:00', '17:30', TRUE),
('770e8400-e29b-41d4-a716-446655440004', 'Aadhaar Seva Kendra - Delhi Connaught Place', 'New Delhi', 'Delhi', '110001', 'Block A, Shop No. 12, Inner Circle, CP', 600, 28.6315, 77.2197, '+91 11 2345 6789', 'delhi.cp@aadhaar.gov.in', '10:00', '18:00', TRUE),
('770e8400-e29b-41d4-a716-446655440005', 'Aadhaar Seva Kendra - Ahmedabad SG Highway', 'Ahmedabad', 'Gujarat', '380015', '2nd Floor, Westgate Mall, SG Highway', 350, 23.0267, 72.5791, '+91 79 2345 6789', 'ahmedabad.sghighway@aadhaar.gov.in', '09:00', '17:00', TRUE),
('770e8400-e29b-41d4-a716-446655440006', 'Aadhaar Seva Kendra - Kolkata Park Street', 'Kolkata', 'West Bengal', '700016', 'No. 78, Park Street Area', 420, 22.5526, 88.3520, '+91 33 2345 6789', 'kolkata.parkstreet@aadhaar.gov.in', '10:00', '17:30', TRUE),
('770e8400-e29b-41d4-a716-446655440007', 'Aadhaar Seva Kendra - Hyderabad Gachibowli', 'Hyderabad', 'Telangana', '500032', '2-48/1, Survey No. 41, Gachibowli', 380, 17.4401, 78.3408, '+91 40 2345 6789', 'hyderabad.gachibowli@aadhaar.gov.in', '09:00', '18:00', TRUE),
('770e8400-e29b-41d4-a716-446655440008', 'Aadhaar Seva Kendra - Pune Koregaon Park', 'Pune', 'Maharashtra', '411001', 'Shop No. 101, Koregaon Park Plaza', 320, 18.5362, 73.8946, '+91 20 2345 6789', 'pune.koregaonpark@aadhaar.gov.in', '09:00', '17:00', TRUE);

-- =====================================================
-- UPDATE TYPES
-- =====================================================
INSERT INTO update_types (id, name, description, risk_level, requires_verification, requires_biometric, can_do_online, estimated_time_minutes, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Address Update', 'Update your residential address in Aadhaar', 'medium', TRUE, TRUE, TRUE, 15, TRUE),
('880e8400-e29b-41d4-a716-446655440002', 'Date of Birth Correction', 'Correct your date of birth in Aadhaar', 'high', TRUE, TRUE, FALSE, 20, TRUE),
('880e8400-e29b-41d4-a716-446655440003', 'Mobile Number Update', 'Update or change your registered mobile number', 'low', TRUE, FALSE, TRUE, 5, TRUE),
('880e8400-e29b-41d4-a716-446655440004', 'Email Update', 'Update your email address', 'low', FALSE, FALSE, TRUE, 3, TRUE),
('880e8400-e29b-41d4-a716-446655440005', 'Name Correction', 'Correct spelling or update name', 'high', TRUE, TRUE, FALSE, 25, TRUE),
('880e8400-e29b-41d4-a716-446655440006', 'Gender Update', 'Update gender information', 'high', TRUE, TRUE, FALSE, 20, TRUE),
('880e8400-e29b-41d4-a716-446655440007', 'Biometric Update', 'Update fingerprints and iris scan', 'medium', TRUE, TRUE, FALSE, 30, TRUE),
('880e8400-e29b-41d4-a716-446655440008', 'Photo Update', 'Update your photograph in Aadhaar', 'medium', TRUE, TRUE, FALSE, 15, TRUE);

-- =====================================================
-- UPDATE TYPE DOCUMENTS
-- =====================================================
INSERT INTO update_type_documents (id, update_type_id, document_name, is_required) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Address Proof', TRUE),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 'Date of Birth Certificate', TRUE),
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440002', 'Supporting Document', FALSE),
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440003', 'Mobile Proof', TRUE),
('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440004', 'Email Proof', TRUE),
('990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440005', 'Name Change Proof', TRUE),
('990e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440006', 'Supporting Document', TRUE),
('990e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440007', 'Biometric Capture', TRUE),
('990e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440008', 'Photo', TRUE);

-- =====================================================
-- TIME SLOTS (with risk_level as per schema)
-- =====================================================
INSERT INTO time_slots (id, center_id, date, start_time, end_time, available_slots, total_capacity, risk_level, is_active) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '2024-12-10', '09:00', '10:00', 8, 10, 'low', TRUE),
('aa0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '2024-12-10', '10:00', '11:00', 5, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '2024-12-10', '11:00', '12:00', 3, 10, 'high', TRUE),
('aa0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', '2024-12-10', '14:00', '15:00', 7, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001', '2024-12-10', '15:00', '16:00', 2, 10, 'high', TRUE),
('aa0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440001', '2024-12-11', '09:00', '10:00', 10, 10, 'low', TRUE),
('aa0e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440001', '2024-12-11', '10:00', '11:00', 8, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440001', '2024-12-11', '11:00', '12:00', 6, 10, 'high', TRUE),
('aa0e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440002', '2024-12-10', '09:00', '10:00', 6, 10, 'low', TRUE),
('aa0e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440002', '2024-12-10', '10:00', '11:00', 4, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440002', '2024-12-10', '11:00', '12:00', 2, 10, 'high', TRUE),
('aa0e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440002', '2024-12-10', '14:00', '15:00', 5, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440002', '2024-12-11', '09:00', '10:00', 10, 10, 'low', TRUE),
('aa0e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440002', '2024-12-11', '10:00', '11:00', 9, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440004', '2024-12-10', '10:00', '11:00', 7, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440016', '770e8400-e29b-41d4-a716-446655440004', '2024-12-10', '11:00', '12:00', 5, 10, 'high', TRUE),
('aa0e8400-e29b-41d4-a716-446655440017', '770e8400-e29b-41d4-a716-446655440004', '2024-12-10', '14:00', '15:00', 4, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440018', '770e8400-e29b-41d4-a716-446655440004', '2024-12-10', '15:00', '16:00', 6, 10, 'high', TRUE),
('aa0e8400-e29b-41d4-a716-446655440019', '770e8400-e29b-41d4-a716-446655440004', '2024-12-11', '10:00', '11:00', 10, 10, 'low', TRUE),
('aa0e8400-e29b-41d4-a716-446655440020', '770e8400-e29b-41d4-a716-446655440003', '2024-12-10', '09:00', '10:00', 8, 10, 'low', TRUE),
('aa0e8400-e29b-41d4-a716-446655440021', '770e8400-e29b-41d4-a716-446655440003', '2024-12-10', '10:00', '11:00', 6, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440022', '770e8400-e29b-41d4-a716-446655440003', '2024-12-11', '09:00', '10:00', 10, 10, 'low', TRUE),
('aa0e8400-e29b-41d4-a716-446655440023', '770e8400-e29b-41d4-a716-446655440005', '2024-12-10', '09:00', '10:00', 9, 10, 'low', TRUE),
('aa0e8400-e29b-41d4-a716-446655440024', '770e8400-e29b-41d4-a716-446655440005', '2024-12-10', '10:00', '11:00', 7, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440025', '770e8400-e29b-41d4-a716-446655440005', '2024-12-11', '09:00', '10:00', 10, 10, 'low', TRUE),
('aa0e8400-e29b-41d4-a716-446655440026', '770e8400-e29b-41d4-a716-446655440006', '2024-12-10', '10:00', '11:00', 8, 10, 'medium', TRUE),
('aa0e8400-e29b-41d4-a716-446655440027', '770e8400-e29b-41d4-a716-446655440007', '2024-12-10', '09:00', '10:00', 6, 10, 'low', TRUE),
('aa0e8400-e29b-41d4-a716-446655440028', '770e8400-e29b-41d4-a716-446655440008', '2024-12-10', '09:00', '10:00', 9, 10, 'low', TRUE);

-- =====================================================
-- APPOINTMENTS (References aadhaar_records)
-- =====================================================
INSERT INTO appointments (
  id, booking_id, aadhaar_record_id, center_id, update_type_id, time_slot_id, 
  scheduled_date, status, is_online, is_biometric_auto_assigned, auto_booked,
  queue_position, counter_number, estimated_wait_minutes
) VALUES
(
  'bb0e8400-e29b-41d4-a716-446655440001', 
  'ADH20241201001', 
  '660e8400-e29b-41d4-a716-446655440001', 
  '770e8400-e29b-41d4-a716-446655440001', 
  '880e8400-e29b-41d4-a716-446655440001', 
  'aa0e8400-e29b-41d4-a716-446655440001', 
  '2024-12-10', 
  'scheduled', 
  FALSE, 
  FALSE, 
  FALSE,
  5,
  2,
  15
),
(
  'bb0e8400-e29b-41d4-a716-446655440002', 
  'ADH20241201002', 
  '660e8400-e29b-41d4-a716-446655440002', 
  '770e8400-e29b-41d4-a716-446655440002', 
  '880e8400-e29b-41d4-a716-446655440003', 
  'aa0e8400-e29b-41d4-a716-446655440009', 
  '2024-12-10', 
  'completed', 
  TRUE, 
  FALSE, 
  FALSE,
  NULL,
  1,
  5
),
(
  'bb0e8400-e29b-41d4-a716-446655440003', 
  'ADH20241201003', 
  '660e8400-e29b-41d4-a716-446655440003', 
  '770e8400-e29b-41d4-a716-446655440003', 
  '880e8400-e29b-41d4-a716-446655440002', 
  'aa0e8400-e29b-41d4-a716-446655440020', 
  '2024-12-10', 
  'scheduled', 
  FALSE, 
  FALSE, 
  FALSE,
  3,
  4,
  20
),
(
  'bb0e8400-e29b-41d4-a716-446655440004', 
  'ADH20241201004', 
  '660e8400-e29b-41d4-a716-446655440004', 
  '770e8400-e29b-41d4-a716-446655440004', 
  '880e8400-e29b-41d4-a716-446655440005', 
  'aa0e8400-e29b-41d4-a716-446655440015', 
  '2024-12-10', 
  'in-review', 
  FALSE, 
  TRUE, 
  TRUE,
  2,
  3,
  10
),
(
  'bb0e8400-e29b-41d4-a716-446655440005', 
  'ADH20241201005', 
  '660e8400-e29b-41d4-a716-446655440005', 
  '770e8400-e29b-41d4-a716-446655440005', 
  '880e8400-e29b-41d4-a716-446655440001', 
  'aa0e8400-e29b-41d4-a716-446655440023', 
  '2024-12-10', 
  'cancelled', 
  FALSE, 
  FALSE, 
  FALSE,
  NULL,
  NULL,
  NULL
),
(
  'bb0e8400-e29b-41d4-a716-446655440006', 
  'ADH20241125001', 
  '660e8400-e29b-41d4-a716-446655440001', 
  '770e8400-e29b-41d4-a716-446655440001', 
  '880e8400-e29b-41d4-a716-446655440007', 
  'aa0e8400-e29b-41d4-a716-446655440002', 
  '2024-11-25', 
  'completed', 
  FALSE, 
  FALSE, 
  FALSE,
  4,
  2,
  25
),
(
  'bb0e8400-e29b-41d4-a716-446655440007', 
  'ADH20241120001', 
  '660e8400-e29b-41d4-a716-446655440002', 
  '770e8400-e29b-41d4-a716-446655440002', 
  '880e8400-e29b-41d4-a716-446655440004', 
  'aa0e8400-e29b-41d4-a716-446655440010', 
  '2024-11-20', 
  'completed', 
  TRUE, 
  FALSE, 
  FALSE,
  NULL,
  1,
  3
),
(
  'bb0e8400-e29b-41d4-a716-446655440008', 
  'ADH20241115001', 
  '660e8400-e29b-41d4-a716-446655440003', 
  '770e8400-e29b-41d4-a716-446655440003', 
  '880e8400-e29b-41d4-a716-446655440008', 
  'aa0e8400-e29b-41d4-a716-446655440021', 
  '2024-11-15', 
  'no-show', 
  FALSE, 
  FALSE, 
  FALSE,
  NULL,
  NULL,
  NULL
);

-- =====================================================
-- DOCUMENTS
-- =====================================================
INSERT INTO documents (
  id, appointment_id, document_type, file_name, file_size, s3_url, 
  status, review_notes, uploaded_by_user, reviewed_at
) VALUES
(
  'cc0e8400-e29b-41d4-a716-446655440001', 
  'bb0e8400-e29b-41d4-a716-446655440001', 
  'address_proof', 
  'address_proof_123456.pdf', 
  245000, 
  'https://storage.example.com/docs/address_proof_123456.pdf', 
  'approved', 
  'Document verified successfully', 
  TRUE, 
  '2024-12-01 14:30:00'
),
(
  'cc0e8400-e29b-41d4-a716-446655440002', 
  'bb0e8400-e29b-41d4-a716-446655440002', 
  'mobile_proof', 
  'mobile_proof_234567.jpg', 
  180000, 
  'https://storage.example.com/docs/mobile_proof_234567.jpg', 
  'approved', 
  'Verified', 
  TRUE, 
  '2024-12-02 11:00:00'
),
(
  'cc0e8400-e29b-41d4-a716-446655440003', 
  'bb0e8400-e29b-41d4-a716-446655440003', 
  'dob_certificate', 
  'dob_certificate_345678.pdf', 
  320000, 
  'https://storage.example.com/docs/dob_certificate_345678.pdf', 
  'under-review', 
  NULL, 
  TRUE, 
  NULL
),
(
  'cc0e8400-e29b-41d4-a716-446655440004', 
  'bb0e8400-e29b-41d4-a716-446655440004', 
  'name_change_proof', 
  'name_change_456789.pdf', 
  280000, 
  'https://storage.example.com/docs/name_change_456789.pdf', 
  'pending', 
  NULL, 
  TRUE, 
  NULL
),
(
  'cc0e8400-e29b-41d4-a716-446655440005', 
  'bb0e8400-e29b-41d4-a716-446655440005', 
  'address_proof', 
  'old_address_567890.pdf', 
  210000, 
  'https://storage.example.com/docs/old_address_567890.pdf', 
  'rejected', 
  'Document expired. Please provide current address proof.', 
  TRUE, 
  '2024-12-05 16:00:00'
);

-- =====================================================
-- UPDATE HISTORY (References aadhaar_records)
-- =====================================================
INSERT INTO update_history (
  id, appointment_id, aadhaar_record_id, update_type_id, field_name, 
  old_value, new_value, status, urn, approved_at
) VALUES
(
  'dd0e8400-e29b-41d4-a716-446655440001', 
  'bb0e8400-e29b-41d4-a716-446655440006', 
  '660e8400-e29b-41d4-a716-446655440001', 
  '880e8400-e29b-41d4-a716-446655440007', 
  'biometric_data', 
  'Fingerprint data - 2023', 
  'Fingerprint data - 2024', 
  'approved', 
  'URN20241125001', 
  '2024-11-25 10:30:00'
),
(
  'dd0e8400-e29b-41d4-a716-446655440002', 
  'bb0e8400-e29b-41d4-a716-446655440007', 
  '660e8400-e29b-41d4-a716-446655440002', 
  '880e8400-e29b-41d4-a716-446655440004', 
  'email', 
  'email@example.com', 
  'sarah.smith@example.com', 
  'approved', 
  'URN20241120001', 
  '2024-11-20 14:00:00'
),
(
  'dd0e8400-e29b-41d4-a716-446655440003', 
  'bb0e8400-e29b-41d4-a716-446655440008', 
  '660e8400-e29b-41d4-a716-446655440003', 
  '880e8400-e29b-41d4-a716-446655440008', 
  'photo', 
  'Photo - 2022', 
  'Photo - 2024', 
  'rejected', 
  'URN20241115001', 
  '2024-11-15 11:00:00'
),
(
  'dd0e8400-e29b-41d4-a716-446655440004', 
  NULL, 
  '660e8400-e29b-41d4-a716-446655440001', 
  '880e8400-e29b-41d4-a716-446655440003', 
  'mobile', 
  '+91 9876543000', 
  '+91 9876543210', 
  'approved', 
  'URN20241001001', 
  '2024-10-01 09:30:00'
);

-- =====================================================
-- FRAUD LOGS (References aadhaar_records)
-- =====================================================
INSERT INTO fraud_logs (
  id, aadhaar_record_id, appointment_id, event_type, risk_level, 
  confidence_score, details, action_taken, resolved, detected_at, notes
) VALUES
(
  'ee0e8400-e29b-41d4-a716-446655440001', 
  '660e8400-e29b-41d4-a716-446655440001', 
  NULL, 
  'multiple_otp_requests', 
  'high', 
  0.85, 
  '{"ip_address": "115.124.45.67", "attempts": 5}', 
  'flagged', 
  TRUE, 
  '2024-12-01 15:45:00', 
  'Multiple OTP requests detected from IP 115.124.45.67'
),
(
  'ee0e8400-e29b-41d4-a716-446655440002', 
  NULL, 
  NULL, 
  'suspicious_registration', 
  'high', 
  0.92, 
  '{"invalid_format": true}', 
  'blocked', 
  TRUE, 
  '2024-12-02 10:15:00', 
  'New user registration with invalid Aadhaar format'
),
(
  'ee0e8400-e29b-41d4-a716-446655440003', 
  '660e8400-e29b-41d4-a716-446655440003', 
  'bb0e8400-e29b-41d4-a716-446655440008', 
  'no_show_pattern', 
  'medium', 
  0.60, 
  '{"no_show_count": 3, "days": 30}', 
  'flagged', 
  FALSE, 
  '2024-12-03 12:00:00', 
  'User has 3 no-show appointments in last 30 days'
),
(
  'ee0e8400-e29b-41d4-a716-446655440004', 
  NULL, 
  NULL, 
  'bot_detection', 
  'medium', 
  0.55, 
  '{"user_agent": "Bot/1.0"}', 
  'blocked', 
  TRUE, 
  '2024-12-04 07:55:00', 
  'Automated bot-like behavior detected on booking page'
),
(
  'ee0e8400-e29b-41d4-a716-446655440005', 
  '660e8400-e29b-41d4-a716-446655440004', 
  'bb0e8400-e29b-41d4-a716-446655440004', 
  'document_mismatch', 
  'high', 
  0.78, 
  '{"mismatch_fields": ["name", "dob"]}', 
  'needs_verification', 
  FALSE, 
  '2024-12-05 14:30:00', 
  'Submitted document details do not match Aadhaar records'
);

-- =====================================================
-- CENTER LOAD
-- =====================================================
INSERT INTO center_load (id, center_id, date, current_load, predicted_load, capacity, occupancy_percentage) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '2024-12-10', 320, 350, 500, 64.00),
('ff0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '2024-12-11', 280, 340, 500, 56.00),
('ff0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '2024-12-09', 450, 420, 500, 90.00),
('ff0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', '2024-12-10', 290, 310, 450, 64.44),
('ff0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', '2024-12-11', 250, 300, 450, 55.56),
('ff0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', '2024-12-09', 410, 390, 450, 91.11),
('ff0e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440004', '2024-12-10', 380, 420, 600, 63.33),
('ff0e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440004', '2024-12-11', 340, 400, 600, 56.67),
('ff0e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440004', '2024-12-09', 520, 500, 600, 86.67),
('ff0e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440003', '2024-12-10', 240, 260, 400, 60.00),
('ff0e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440003', '2024-12-11', 210, 250, 400, 52.50),
('ff0e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440003', '2024-12-09', 365, 350, 400, 91.25),
('ff0e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440005', '2024-12-10', 180, 200, 350, 51.43),
('ff0e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440005', '2024-12-11', 160, 190, 350, 45.71),
('ff0e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440005', '2024-12-09', 310, 300, 350, 88.57),
('ff0e8400-e29b-41d4-a716-446655440016', '770e8400-e29b-41d4-a716-446655440006', '2024-12-10', 220, 240, 420, 52.38),
('ff0e8400-e29b-41d4-a716-446655440017', '770e8400-e29b-41d4-a716-446655440007', '2024-12-10', 190, 210, 380, 50.00),
('ff0e8400-e29b-41d4-a716-446655440018', '770e8400-e29b-41d4-a716-446655440008', '2024-12-10', 150, 170, 320, 46.88);

-- =====================================================
-- DEMAND FORECAST
-- =====================================================
INSERT INTO demand_forecast (id, forecast_date, predicted_demand, actual_demand, capacity, confidence_percentage) VALUES
('gg0e8400-e29b-41d4-a716-446655440001', '2024-12-10', 1850, 1750, 3500, 85.50),
('gg0e8400-e29b-41d4-a716-446655440002', '2024-12-11', 1920, NULL, 3500, 82.00),
('gg0e8400-e29b-41d4-a716-446655440003', '2024-12-09', 2100, 2150, 3500, 88.00);

-- =====================================================
-- SESSION LOGS
-- =====================================================
INSERT INTO session_logs (id, user_id, action, resource_type, resource_id, ip_address, user_agent, status, error_message) VALUES
('hh0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'login', 'auth', NULL, '192.168.1.100', 'Mozilla/5.0', 'success', NULL),
('hh0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'login', 'auth', NULL, '192.168.1.101', 'Mozilla/5.0', 'success', NULL),
('hh0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'book_slot', 'appointment', 'bb0e8400-e29b-41d4-a716-446655440001', '192.168.1.102', 'Mozilla/5.0', 'success', NULL),
('hh0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'upload_document', 'document', 'cc0e8400-e29b-41d4-a716-446655440004', '192.168.1.103', 'Mozilla/5.0', 'success', NULL),
('hh0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'login', 'auth', NULL, '192.168.1.104', 'Mozilla/5.0', 'failed', 'Invalid credentials');

-- =====================================================
-- STAFF USERS
-- =====================================================
INSERT INTO staff_users (id, email, name, role, center_id, is_active, last_login) VALUES
('ii0e8400-e29b-41d4-a716-446655440001', 'admin@aadhaar.gov.in', 'System Admin', 'admin', NULL, TRUE, '2024-12-01 09:00:00'),
('ii0e8400-e29b-41d4-a716-446655440002', 'mumbai.operator@aadhaar.gov.in', 'Mumbai Operator', 'operator', '770e8400-e29b-41d4-a716-446655440001', TRUE, '2024-12-01 08:30:00'),
('ii0e8400-e29b-41d4-a716-446655440003', 'bangalore.operator@aadhaar.gov.in', 'Bangalore Operator', 'operator', '770e8400-e29b-41d4-a716-446655440002', TRUE, '2024-12-01 08:45:00'),
('ii0e8400-e29b-41d4-a716-446655440004', 'delhi.operator@aadhaar.gov.in', 'Delhi Operator', 'operator', '770e8400-e29b-41d4-a716-446655440004', TRUE, '2024-12-01 09:15:00');

-- =====================================================
-- ANALYTICS SUMMARY
-- =====================================================
INSERT INTO analytics_summary (id, metric_name, metric_date, metric_value, metric_details) VALUES
('jj0e8400-e29b-41d4-a716-446655440001', 'total_bookings', '2024-12-10', 1850, '{"breakdown": {"online": 750, "offline": 1100}}'),
('jj0e8400-e29b-41d4-a716-446655440002', 'completed_updates', '2024-12-10', 1420, NULL),
('jj0e8400-e29b-41d4-a716-446655440003', 'fraud_attempts', '2024-12-10', 12, NULL),
('jj0e8400-e29b-41d4-a716-446655440004', 'fraud_prevented', '2024-12-10', 10, NULL),
('jj0e8400-e29b-41d4-a716-446655440005', 'avg_wait_time', '2024-12-10', 18, NULL),
('jj0e8400-e29b-41d4-a716-446655440006', 'total_bookings', '2024-12-09', 2100, '{"breakdown": {"online": 800, "offline": 1300}}'),
('jj0e8400-e29b-41d4-a716-446655440007', 'completed_updates', '2024-12-09', 1680, NULL),
('jj0e8400-e29b-41d4-a716-446655440008', 'fraud_attempts', '2024-12-09', 15, NULL),
('jj0e8400-e29b-41d4-a716-446655440009', 'fraud_prevented', '2024-12-09', 12, NULL);

-- =====================================================
-- ORDER OF EXECUTION:
-- 1) users
-- 2) aadhaar_records
-- 3) UPDATE users with aadhaar_record_id
-- 4) centers
-- 5) update_types
-- 6) update_type_documents
-- 7) time_slots
-- 8) appointments
-- 9) documents
-- 10) update_history
-- 11) fraud_logs
-- 12) center_load
-- 13) demand_forecast
-- 14) session_logs
-- 15) staff_users
-- 16) analytics_summary
--
-- Note: Boolean values use TRUE/FALSE (not 1/0) to match schema
-- UUIDs use CHAR(36) format matching the schema defaults
-- =====================================================
