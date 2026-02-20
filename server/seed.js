const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting database seeding...');
    
    await connection.beginTransaction();

    // Seed Users
    const users = [
      { email: 'john.doe@example.com', phone: '+919876543210', password: 'password123' },
      { email: 'sarah.smith@example.com', phone: '+919876543211', password: 'password123' },
      { email: 'rajesh.kumar@example.com', phone: '+919876543212', password: 'password123' },
      { email: 'priya.sharma@example.com', phone: '+919876543213', password: 'password123' },
      { email: 'amit.patel@example.com', phone: '+919876543214', password: 'password123' },
    ];

    const userIds = [];
    for (const user of users) {
      const id = uuidv4();
      const passwordHash = await bcrypt.hash(user.password, 10);
      await connection.execute(
        'INSERT INTO users (id, email, phone, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())',
        [id, user.email, user.phone, passwordHash]
      );
      userIds.push(id);
    }
    console.log(`✓ Created ${users.length} users`);

    // Seed Aadhaar Records
    const aadhaarRecords = [
      {
        user_id: userIds[0], aadhaar_number: '123456789012', full_name: 'John Doe', date_of_birth: '1990-05-15', gender: 'Male',
        address: '123 Main Street, Apt 4B, Near Station Road', state: 'Maharashtra', district: 'Mumbai', city: 'Mumbai', pincode: '400001',
        locality: 'Fort Area', landmark: 'Near CST Station', house_number: '123', street: 'Main Street', phone: '+919876543210',
        enrollment_number: 'E/2019/123456789', enrollment_date: '2019-03-15', registration_center: 'Mumbai Central Enrolment Center'
      },
      {
        user_id: userIds[1], aadhaar_number: '234567890123', full_name: 'Sarah Smith', date_of_birth: '1985-08-22', gender: 'Female',
        address: '456 Oak Avenue, Whitefield', state: 'Karnataka', district: 'Bangalore', city: 'Bangalore', pincode: '560001',
        locality: 'Whitefield', landmark: 'Near IT Park', house_number: '456', street: 'Oak Avenue', phone: '+919876543211',
        enrollment_number: 'E/2018/987654321', enrollment_date: '2018-06-20', registration_center: 'Bangalore Whitefield Enrolment Center'
      },
      {
        user_id: userIds[2], aadhaar_number: '345678901234', full_name: 'Rajesh Kumar', date_of_birth: '1992-11-08', gender: 'Male',
        address: '789 Park Road, Near Bus Stand', state: 'Tamil Nadu', district: 'Chennai', city: 'Chennai', pincode: '600001',
        locality: 'T Nagar', landmark: 'Near US Consulate', house_number: '789', street: 'Park Road', phone: '+919876543212',
        enrollment_number: 'E/2020/456789123', enrollment_date: '2020-01-10', registration_center: 'Chennai T Nagar Enrolment Center'
      },
      {
        user_id: userIds[3], aadhaar_number: '456789012345', full_name: 'Priya Sharma', date_of_birth: '1988-03-30', gender: 'Female',
        address: '321 Lake View, Connaught Place', state: 'Delhi', district: 'Central Delhi', city: 'New Delhi', pincode: '110001',
        locality: 'Connaught Place', landmark: 'Near Metro Station', house_number: '321', street: 'Lake View Road', phone: '+919876543213',
        enrollment_number: 'E/2017/789123456', enrollment_date: '2017-08-05', registration_center: 'Delhi CP Enrolment Center'
      },
      {
        user_id: userIds[4], aadhaar_number: '567890123456', full_name: 'Amit Patel', date_of_birth: '1995-07-12', gender: 'Male',
        address: '654 River Side, SG Highway', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380001',
        locality: 'SG Highway', landmark: 'Near Mall', house_number: '654', street: 'River Side Road', phone: '+919876543214',
        enrollment_number: 'E/2021/321654987', enrollment_date: '2021-02-18', registration_center: 'Ahmedabad SG Highway Enrolment Center'
      },
    ];

    const aadhaarRecordIds = [];
    for (const record of aadhaarRecords) {
      const id = uuidv4();
      await connection.execute(
        `INSERT INTO aadhaar_records (id, user_id, aadhaar_number, full_name, date_of_birth, gender, address, state, district, city, pincode, locality, landmark, house_number, street, phone, enrollment_number, enrollment_date, registration_center, status, is_verified, is_eid_linked, mobile_verified, email_verified, fingerprint_status, iris_status, face_scan_status, card_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', TRUE, TRUE, TRUE, TRUE, 'registered', 'registered', 'registered', 'standard', NOW(), NOW())`,
        [id, record.user_id, record.aadhaar_number, record.full_name, record.date_of_birth, record.gender, record.address, record.state, record.district, record.city, record.pincode, record.locality, record.landmark, record.house_number, record.street, record.phone, record.enrollment_number, record.enrollment_date, record.registration_center]
      );
      aadhaarRecordIds.push(id);

      // Update user's aadhaar_record_id
      await connection.execute('UPDATE users SET aadhaar_record_id = ? WHERE id = ?', [id, record.user_id]);
    }
    console.log(`✓ Created ${aadhaarRecords.length} aadhaar records`);

    // Seed Centers
    const centers = [
      { name: 'Aadhaar Seva Kendra - Mumbai Central', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', address: 'Ground Floor, Business Tower, Near CST Station', capacity: 500, latitude: 18.9398, longitude: 72.8354, phone: '+91 22 2345 6789', email: 'mumbai.central@aadhaar.gov.in', working_hours_start: '09:00', working_hours_end: '18:00' },
      { name: 'Aadhaar Seva Kendra - Bangalore MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', address: '1st Floor, City Center, MG Road', capacity: 450, latitude: 12.9750, longitude: 77.6060, phone: '+91 80 2345 6789', email: 'bangalore.mgroad@aadhaar.gov.in', working_hours_start: '09:00', working_hours_end: '17:00' },
      { name: 'Aadhaar Seva Kendra - Chennai T Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017', address: 'No. 45, Usman Road, T Nagar', capacity: 400, latitude: 13.0418, longitude: 80.2341, phone: '+91 44 2345 6789', email: 'chennai.tnagar@aadhaar.gov.in', working_hours_start: '09:00', working_hours_end: '17:30' },
      { name: 'Aadhaar Seva Kendra - Delhi Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', address: 'Block A, Shop No. 12, Inner Circle, CP', capacity: 600, latitude: 28.6315, longitude: 77.2197, phone: '+91 11 2345 6789', email: 'delhi.cp@aadhaar.gov.in', working_hours_start: '10:00', working_hours_end: '18:00' },
      { name: 'Aadhaar Seva Kendra - Ahmedabad SG Highway', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', address: '2nd Floor, Westgate Mall, SG Highway', capacity: 350, latitude: 23.0267, longitude: 72.5791, phone: '+91 79 2345 6789', email: 'ahmedabad.sghighway@aadhaar.gov.in', working_hours_start: '09:00', working_hours_end: '17:00' },
      { name: 'Aadhaar Seva Kendra - Kolkata Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016', address: 'No. 78, Park Street Area', capacity: 420, latitude: 22.5526, longitude: 88.3520, phone: '+91 33 2345 6789', email: 'kolkata.parkstreet@aadhaar.gov.in', working_hours_start: '10:00', working_hours_end: '17:30' },
      { name: 'Aadhaar Seva Kendra - Hyderabad Gachibowli', city: 'Hyderabad', state: 'Telangana', pincode: '500032', address: '2-48/1, Survey No. 41, Gachibowli', capacity: 380, latitude: 17.4401, longitude: 78.3408, phone: '+91 40 2345 6789', email: 'hyderabad.gachibowli@aadhaar.gov.in', working_hours_start: '09:00', working_hours_end: '18:00' },
      { name: 'Aadhaar Seva Kendra - Pune Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411001', address: 'Shop No. 101, Koregaon Park Plaza', capacity: 320, latitude: 18.5362, longitude: 73.8946, phone: '+91 20 2345 6789', email: 'pune.koregaonpark@aadhaar.gov.in', working_hours_start: '09:00', working_hours_end: '17:00' },
    ];

    const centerIds = [];
    for (const center of centers) {
      const id = uuidv4();
      await connection.execute(
        'INSERT INTO centers (id, name, city, state, pincode, address, capacity, latitude, longitude, phone, email, working_hours_start, working_hours_end, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())',
        [id, center.name, center.city, center.state, center.pincode, center.address, center.capacity, center.latitude, center.longitude, center.phone, center.email, center.working_hours_start, center.working_hours_end]
      );
      centerIds.push(id);
    }
    console.log(`✓ Created ${centers.length} centers`);

    // Seed Update Types
    const updateTypes = [
      { name: 'Address Update', description: 'Update your residential address in Aadhaar', risk_level: 'medium', requires_verification: true, requires_biometric: true, can_do_online: true, estimated_time_minutes: 15 },
      { name: 'Date of Birth Correction', description: 'Correct your date of birth in Aadhaar', risk_level: 'high', requires_verification: true, requires_biometric: true, can_do_online: false, estimated_time_minutes: 20 },
      { name: 'Mobile Number Update', description: 'Update or change your registered mobile number', risk_level: 'low', requires_verification: true, requires_biometric: false, can_do_online: true, estimated_time_minutes: 5 },
      { name: 'Email Update', description: 'Update your email address', risk_level: 'low', requires_verification: false, requires_biometric: false, can_do_online: true, estimated_time_minutes: 3 },
      { name: 'Name Correction', description: 'Correct spelling or update name', risk_level: 'high', requires_verification: true, requires_biometric: true, can_do_online: false, estimated_time_minutes: 25 },
      { name: 'Gender Update', description: 'Update gender information', risk_level: 'high', requires_verification: true, requires_biometric: true, can_do_online: false, estimated_time_minutes: 20 },
      { name: 'Biometric Update', description: 'Update fingerprints and iris scan', risk_level: 'medium', requires_verification: true, requires_biometric: true, can_do_online: false, estimated_time_minutes: 30 },
      { name: 'Photo Update', description: 'Update your photograph in Aadhaar', risk_level: 'medium', requires_verification: true, requires_biometric: true, can_do_online: false, estimated_time_minutes: 15 },
    ];

    const updateTypeIds = [];
    for (const type of updateTypes) {
      const id = uuidv4();
      await connection.execute(
        'INSERT INTO update_types (id, name, description, risk_level, requires_verification, requires_biometric, can_do_online, estimated_time_minutes, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())',
        [id, type.name, type.description, type.risk_level, type.requires_verification, type.requires_biometric, type.can_do_online, type.estimated_time_minutes]
      );
      updateTypeIds.push(id);
    }
    console.log(`✓ Created ${updateTypes.length} update types`);

    // Seed Time Slots
    const dates = ['2024-12-10', '2024-12-11'];
    const times = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
    ];

    for (const centerId of centerIds) {
      for (const date of dates) {
        for (let i = 0; i < times.length; i++) {
          const id = uuidv4();
          const availableSlots = Math.floor(Math.random() * 10) + 1;
          const riskLevel = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
          await connection.execute(
            'INSERT INTO time_slots (id, center_id, date, start_time, end_time, total_capacity, available_slots, risk_level, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 10, ?, ?, TRUE, NOW(), NOW())',
            [id, centerId, date, times[i].start, times[i].end, availableSlots, riskLevel]
          );
        }
      }
    }
    console.log(`✓ Created time slots for all centers`);

    // Seed Center Load
    for (const centerId of centerIds) {
      for (const date of dates) {
        const capacity = centers[centerIds.indexOf(centerId)].capacity;
        const currentLoad = Math.floor(Math.random() * capacity);
        const occupancyPercentage = (currentLoad / capacity) * 100;
        await connection.execute(
          'INSERT INTO center_load (id, center_id, date, current_load, predicted_load, capacity, occupancy_percentage) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [uuidv4(), centerId, date, currentLoad, Math.floor(currentLoad * 1.1), capacity, occupancyPercentage]
        );
      }
    }
    console.log(`✓ Created center load data`);

    await connection.commit();
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nTest Credentials:');
    console.log('  Aadhaar: 123456789012, Password: password123');
    console.log('  Aadhaar: 234567890123, Password: password123');
    
  } catch (error) {
    await connection.rollback();
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
};

seedData();
