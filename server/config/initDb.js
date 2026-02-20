const { pool } = require('./db');

const initializeDatabase = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Initializing database...');
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        aadhaar_record_id CHAR(36) UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_aadhaar_record (aadhaar_record_id)
      )
    `);
    console.log('Users table created');

    // Create aadhaar_records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS aadhaar_records (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) UNIQUE,
        aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(20) NOT NULL,
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
        phone VARCHAR(20),
        photo_url VARCHAR(512),
        fingerprint_status VARCHAR(20) DEFAULT 'registered',
        iris_status VARCHAR(20) DEFAULT 'registered',
        face_scan_status VARCHAR(20) DEFAULT 'registered',
        last_biometric_update DATE,
        biometric_expiry_date DATE,
        enrollment_number VARCHAR(28),
        enrollment_date DATE,
        registration_center VARCHAR(255),
        card_type VARCHAR(20) DEFAULT 'standard',
        status VARCHAR(20) DEFAULT 'active',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_date TIMESTAMP NULL,
        is_eid_linked BOOLEAN DEFAULT FALSE,
        eid_number VARCHAR(20),
        mobile_verified BOOLEAN DEFAULT FALSE,
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_aadhaar_number (aadhaar_number),
        INDEX idx_state (state),
        INDEX idx_district (district),
        INDEX idx_status (status)
      )
    `);
    console.log('Aadhaar records table created');

    // Create OTP verification table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS otp_verification (
        id CHAR(36) PRIMARY KEY,
        aadhaar_number VARCHAR(12) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'login',
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        attempts INT DEFAULT 0,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_aadhaar_number (aadhaar_number),
        INDEX idx_type (type),
        INDEX idx_expires (expires_at)
      )
    `);
    console.log('OTP verification table created');

    // Create centers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS centers (
        id CHAR(36) PRIMARY KEY,
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
      )
    `);
    console.log('Centers table created');

    // Create update_types table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS update_types (
        id CHAR(36) PRIMARY KEY,
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
      )
    `);
    console.log('Update types table created');

    // Create time_slots table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id CHAR(36) PRIMARY KEY,
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
      )
    `);
    console.log('Time slots table created');

    // Create appointments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id CHAR(36) PRIMARY KEY,
        booking_id VARCHAR(20) UNIQUE NOT NULL,
        aadhaar_record_id CHAR(36) NOT NULL,
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
        completed_at TIMESTAMP NULL,
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
      )
    `);
    console.log('Appointments table created');

    // Create documents table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id CHAR(36) PRIMARY KEY,
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
        reviewed_at TIMESTAMP NULL,
        reviewed_by CHAR(36),
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
        INDEX idx_appointment (appointment_id),
        INDEX idx_status (status)
      )
    `);
    console.log('Documents table created');

    // Create update_history table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS update_history (
        id CHAR(36) PRIMARY KEY,
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
        approved_at TIMESTAMP NULL,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
        FOREIGN KEY (aadhaar_record_id) REFERENCES aadhaar_records(id) ON DELETE CASCADE,
        FOREIGN KEY (update_type_id) REFERENCES update_types(id),
        INDEX idx_aadhaar_record (aadhaar_record_id),
        INDEX idx_appointment (appointment_id),
        INDEX idx_urn (urn),
        INDEX idx_status (status)
      )
    `);
    console.log('Update history table created');

    // Create fraud_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS fraud_logs (
        id CHAR(36) PRIMARY KEY,
        aadhaar_record_id CHAR(36),
        appointment_id CHAR(36),
        event_type VARCHAR(100),
        risk_level VARCHAR(20),
        confidence_score DECIMAL(3, 2),
        details JSON,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        action_taken VARCHAR(100),
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP NULL,
        notes TEXT,
        FOREIGN KEY (aadhaar_record_id) REFERENCES aadhaar_records(id) ON DELETE SET NULL,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
        INDEX idx_risk_level (risk_level),
        INDEX idx_detected_at (detected_at),
        INDEX idx_aadhaar_record (aadhaar_record_id)
      )
    `);
    console.log('Fraud logs table created');

    // Create center_load table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS center_load (
        id CHAR(36) PRIMARY KEY,
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
      )
    `);
    console.log('Center load table created');

    // Create session_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS session_logs (
        id CHAR(36) PRIMARY KEY,
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
      )
    `);
    console.log('Session logs table created');

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { initializeDatabase };
