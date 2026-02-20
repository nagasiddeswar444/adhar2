const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const router = express.Router();

// Get aadhaar record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [records] = await pool.execute('SELECT * FROM aadhaar_records WHERE id = ?', [id]);

    if (records.length === 0) {
      return res.status(404).json({ error: 'Aadhaar record not found' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Get aadhaar record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get aadhaar record by aadhaar number
router.get('/number/:aadhaarNumber', async (req, res) => {
  try {
    const { aadhaarNumber } = req.params;

    const [records] = await pool.execute(
      'SELECT * FROM aadhaar_records WHERE aadhaar_number = ?',
      [aadhaarNumber]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: 'Aadhaar record not found' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Get aadhaar record by number error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update aadhaar record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, date_of_birth, gender, address, state, district, city, pincode, locality, landmark, house_number, street, phone, photo_url, status, is_verified, mobile_verified, email_verified } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (full_name !== undefined) { updates.push('full_name = ?'); params.push(full_name); }
    if (date_of_birth !== undefined) { updates.push('date_of_birth = ?'); params.push(date_of_birth); }
    if (gender !== undefined) { updates.push('gender = ?'); params.push(gender); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (state !== undefined) { updates.push('state = ?'); params.push(state); }
    if (district !== undefined) { updates.push('district = ?'); params.push(district); }
    if (city !== undefined) { updates.push('city = ?'); params.push(city); }
    if (pincode !== undefined) { updates.push('pincode = ?'); params.push(pincode); }
    if (locality !== undefined) { updates.push('locality = ?'); params.push(locality); }
    if (landmark !== undefined) { updates.push('landmark = ?'); params.push(landmark); }
    if (house_number !== undefined) { updates.push('house_number = ?'); params.push(house_number); }
    if (street !== undefined) { updates.push('street = ?'); params.push(street); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (photo_url !== undefined) { updates.push('photo_url = ?'); params.push(photo_url); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (is_verified !== undefined) { 
      updates.push('is_verified = ?'); 
      params.push(is_verified);
      if (is_verified) {
        updates.push('verification_date = NOW()');
      }
    }
    if (mobile_verified !== undefined) { updates.push('mobile_verified = ?'); params.push(mobile_verified); }
    if (email_verified !== undefined) { updates.push('email_verified = ?'); params.push(email_verified); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await pool.execute(
      `UPDATE aadhaar_records SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedRecord] = await pool.execute('SELECT * FROM aadhaar_records WHERE id = ?', [id]);
    
    if (updatedRecord.length === 0) {
      return res.status(404).json({ error: 'Aadhaar record not found' });
    }

    res.json(updatedRecord[0]);
  } catch (error) {
    console.error('Update aadhaar record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get update history for aadhaar record
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;

    const [history] = await pool.execute(
      `SELECT uh.*, ut.name as update_type_name 
       FROM update_history uh
       LEFT JOIN update_types ut ON uh.update_type_id = ut.id
       WHERE uh.aadhaar_record_id = ?
       ORDER BY uh.created_at DESC`,
      [id]
    );

    res.json(history);
  } catch (error) {
    console.error('Get update history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create update history record
router.post('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_id, update_type_id, field_name, old_value, new_value, urn } = req.body;

    if (!update_type_id || !field_name) {
      return res.status(400).json({ error: 'Update type and field name are required' });
    }

    const recordId = uuidv4();

    await pool.execute(
      `INSERT INTO update_history (id, appointment_id, aadhaar_record_id, update_type_id, field_name, old_value, new_value, status, urn, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())`,
      [recordId, appointment_id || null, id, update_type_id, field_name, old_value || null, new_value || null, urn || null]
    );

    const [newHistory] = await pool.execute('SELECT * FROM update_history WHERE id = ?', [recordId]);
    res.status(201).json(newHistory[0]);
  } catch (error) {
    console.error('Create update history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
