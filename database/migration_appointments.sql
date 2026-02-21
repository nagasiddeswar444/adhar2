-- Migration: Update appointments table to support dynamic time slots
-- Run this SQL to update your existing database

ALTER TABLE appointments 
  MODIFY COLUMN time_slot_id CHAR(36) NULL,
  ADD COLUMN scheduled_time TIME NULL AFTER scheduled_date;

-- Verify the changes
DESCRIBE appointments;
