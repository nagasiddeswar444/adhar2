const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const router = express.Router();

// Get time slots by center and date
router.get('/center/:centerId', async (req, res) => {
  try {
    const { centerId } = req.params;
    const { date } = req.query;

    let query = 'SELECT * FROM time_slots WHERE center_id = ? AND is_active = TRUE';
    const params = [centerId];

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    } else {
      query += ' AND date >= CURDATE()';
    }

    query += ' ORDER BY date, start_time';

    const [slots] = await pool.execute(query, params);
    res.json(slots);
  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available slots by center and date
router.get('/available', async (req, res) => {
  try {
    const { centerId, date } = req.query;

    if (!centerId || !date) {
      return res.status(400).json({ error: 'Center ID and date are required' });
    }

    const [slots] = await pool.execute(
      'SELECT * FROM time_slots WHERE center_id = ? AND date = ? AND available_slots > 0 AND is_active = TRUE ORDER BY start_time',
      [centerId, date]
    );

    res.json(slots);
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get time slot by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [slots] = await pool.execute('SELECT * FROM time_slots WHERE id = ?', [id]);

    if (slots.length === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    res.json(slots[0]);
  } catch (error) {
    console.error('Get time slot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create time slot
router.post('/', async (req, res) => {
  try {
    const { center_id, date, start_time, end_time, total_capacity, risk_level } = req.body;

    if (!center_id || !date || !start_time || !end_time || !total_capacity) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const id = uuidv4();

    await pool.execute(
      `INSERT INTO time_slots (id, center_id, date, start_time, end_time, total_capacity, available_slots, risk_level, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [id, center_id, date, start_time, end_time, total_capacity, total_capacity, risk_level || null]
    );

    const [newSlot] = await pool.execute('SELECT * FROM time_slots WHERE id = ?', [id]);
    res.status(201).json(newSlot[0]);
  } catch (error) {
    console.error('Create time slot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update time slot
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time, total_capacity, available_slots, risk_level, is_active } = req.body;

    await pool.execute(
      `UPDATE time_slots SET start_time = ?, end_time = ?, total_capacity = ?, available_slots = ?, risk_level = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [start_time, end_time, total_capacity, available_slots, risk_level, is_active, id]
    );

    const [updatedSlot] = await pool.execute('SELECT * FROM time_slots WHERE id = ?', [id]);
    
    if (updatedSlot.length === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    res.json(updatedSlot[0]);
  } catch (error) {
    console.error('Update time slot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete time slot
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM time_slots WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    res.json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    console.error('Delete time slot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
