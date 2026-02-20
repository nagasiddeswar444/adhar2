-- =====================================================
-- DROP ALL TABLES
-- Run this script to drop all tables in the database
-- =====================================================

-- Disable foreign key checks to allow dropping tables with dependencies
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables (in reverse order of dependencies)
DROP TABLE IF EXISTS analytics_summary;
DROP TABLE IF EXISTS staff_users;
DROP TABLE IF EXISTS session_logs;
DROP TABLE IF EXISTS demand_forecast;
DROP TABLE IF EXISTS center_load;
DROP TABLE IF EXISTS fraud_logs;
DROP TABLE IF EXISTS update_history;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS update_type_documents;
DROP TABLE IF EXISTS update_types;
DROP TABLE IF EXISTS centers;
DROP TABLE IF EXISTS aadhaar_records;
DROP TABLE IF EXISTS users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify all tables are dropped
SHOW TABLES;
