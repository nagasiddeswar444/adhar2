const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const router = express.Router();

// Generate booking ID
const generateBookingId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ADH${timestamp}${random}`;
};

// Get appointments by aadhaar record ID
router.get('/aadhaar/:aadhaarRecordId', async (req, res) => {
  try {
    const { aadhaarRecordId } = req.params;

    const [appointments] = await pool.execute(
      `SELECT a.*, c.name as center_name, c.city as center_city, c.state as center_state, 
              ut.name as update_type_name, ts.start_time, ts.end_time
       FROM appointments a
       LEFT JOIN centers c ON a.center_id = c.id
       LEFT JOIN update_types ut ON a.update_type_id = ut.id
       LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
       WHERE a.aadhaar_record_id = ?
       ORDER BY a.scheduled_date DESC`,
      [aadhaarRecordId]
    );

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointment by booking ID
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [appointments] = await pool.execute(
      `SELECT a.*, c.name as center_name, c.city as center_city, c.state as center_state, 
              ut.name as update_type_name, ts.start_time, ts.end_time
       FROM appointments a
       LEFT JOIN centers c ON a.center_id = c.id
       LEFT JOIN update_types ut ON a.update_type_id = ut.id
       LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
       WHERE a.booking_id = ?`,
      [bookingId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointments[0]);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [appointments] = await pool.execute(
      `SELECT a.*, c.name as center_name, c.city as center_city, c.state as center_state, 
              ut.name as update_type_name, ts.start_time, ts.end_time
       FROM appointments a
       LEFT JOIN centers c ON a.center_id = c.id
       LEFT JOIN update_types ut ON a.update_type_id = ut.id
       LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
       WHERE a.id = ?`,
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointments[0]);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create appointment
router.post('/', async (req, res) => {
  try {
    const { aadhaar_record_id, center_id, update_type_id, time_slot_id, scheduled_date, is_online } = req.body;

    if (!aadhaar_record_id || !center_id || !update_type_id || !time_slot_id || !scheduled_date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Check if slot is available
    const [slots] = await pool.execute(
      'SELECT * FROM time_slots WHERE id = ? AND available_slots > 0',
      [time_slot_id]
    );

    if (slots.length === 0) {
      return res.status(400).json({ error: 'Time slot not available' });
    }

    const id = uuidv4();
    const bookingId = generateBookingId();

    await pool.execute(
      `INSERT INTO appointments (id, booking_id, aadhaar_record_id, center_id, update_type_id, time_slot_id, scheduled_date, status, is_online, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, NOW(), NOW())`,
      [id, bookingId, aadhaar_record_id, center_id, update_type_id, time_slot_id, scheduled_date, is_online || false]
    );

    // Decrease available slots
    await pool.execute(
      'UPDATE time_slots SET available_slots = available_slots - 1 WHERE id = ?',
      [time_slot_id]
    );

    const [newAppointment] = await pool.execute('SELECT * FROM appointments WHERE id = ?', [id]);
    res.status(201).json(newAppointment[0]);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show', 'in-review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const completedAt = status === 'completed' ? 'NOW()' : 'NULL';

    await pool.execute(
      `UPDATE appointments SET status = ?, completed_at = ${status === 'completed' ? 'NOW()' : 'NULL'}, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    // If cancelled, release the time slot
    if (status === 'cancelled') {
      const [appointments] = await pool.execute('SELECT time_slot_id FROM appointments WHERE id = ?', [id]);
      if (appointments.length > 0) {
        await pool.execute(
          'UPDATE time_slots SET available_slots = available_slots + 1 WHERE id = ?',
          [appointments[0].time_slot_id]
        );
      }
    }

    const [updatedAppointment] = await pool.execute('SELECT * FROM appointments WHERE id = ?', [id]);
    
    if (updatedAppointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(updatedAppointment[0]);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel appointment
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const [appointments] = await pool.execute('SELECT * FROM appointments WHERE id = ?', [id]);

    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointments[0].status !== 'scheduled') {
      return res.status(400).json({ error: 'Cannot cancel this appointment' });
    }

    await pool.execute(
      'UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', id]
    );

    // Release time slot
    await pool.execute(
      'UPDATE time_slots SET available_slots = available_slots + 1 WHERE id = ?',
      [appointments[0].time_slot_id]
    );

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
